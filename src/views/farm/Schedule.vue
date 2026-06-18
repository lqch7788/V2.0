<template>
  <div class="space-y-4 p-6">
    <!-- 页面标题 + 快捷操作栏 - 拆分为独立 SFC -->
    <ScheduleHeader
      :display-mode="displayMode"
      @update:displayMode="(v) => displayMode = v"
      @open-swap="showSwapModal = true"
      @open-shift-editor="showShiftEditor = true"
      @open-add="showAddModal = true"
    />

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-3">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-blue-600"><Calendar /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">今日排班</p>
            <p class="text-lg font-bold text-gray-800">{{ store.todayCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-green-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">本周已执行</p>
            <p class="text-lg font-bold text-gray-800">{{ store.executedCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-amber-600"><User /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">待调班申请</p>
            <p class="text-lg font-bold text-gray-800">{{ store.pendingSwapCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-purple-600"><List /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">本月排班总数</p>
            <p class="text-lg font-bold text-gray-800">{{ store.monthCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="grid grid-cols-3 gap-4">
      <!-- 日历/表格视图 -->
      <div class="col-span-2">
        <!-- 日历视图 - 拆分为独立 SFC（V1.1 ScheduleCalendar.tsx 1:1 对齐） -->
        <ScheduleCalendarView
          v-if="displayMode === 'calendar'"
          :view-mode="viewMode"
          :selected-day="selectedDay"
          :current-year="currentYear"
          :current-month="currentMonth"
          :weekdays="WEEKDAYS"
          :month-date-range="monthDateRange"
          :week-days="weekDays"
          :schedules="store.schedules"
          :is-current-month="isCurrentMonth"
          :is-today="isToday"
          :format-month-day="formatMonthDay"
          :format-weekday-title="formatWeekdayTitle"
          :format-day-title="formatDayTitle"
          :get-schedules-for-date="getSchedulesForDate"
          :get-shift-color="getShiftColor"
          :get-shift-time="getShiftTime"
          :get-staff-name="getStaffName"
          :get-work-zone="getWorkZone"
          :get-status-class="getStatusClass"
          @prev="handleCalendarPrev"
          @next="handleCalendarNext"
          @today="handleCalendarToday"
          @date-click="handleCalendarDateClick"
          @view="handleView"
          @update:viewMode="(v) => viewMode = v"
          @update:selectedDay="(v) => selectedDay = v"
        />

        <!-- 表格视图 - 拆分为独立 SFC（V1.1 ScheduleTable.tsx 1:1 对齐） -->
        <ScheduleTableView
          v-else
          :search-term="searchTerm"
          :date-range="dateRange"
          :shift-filter="shiftFilter"
          :status-filter="statusFilter"
          :batch-edit-mode="batchEditMode"
          :batch-delete-mode="batchDeleteMode"
          :export-mode="exportMode"
          :selected-rows="selectedRows"
          :shift-configs="store.shiftConfigs"
          :filtered-schedules="filteredSchedules"
          :paged-schedules="pagedSchedules"
          :pagination="pagination"
          :get-weekday="getWeekday"
          :get-shift-color="getShiftColor"
          :get-shift-time="getShiftTime"
          :get-status-class="getStatusClass"
          @update:searchTerm="(v) => searchTerm = v"
          @update:dateRange="(v) => dateRange = v"
          @update:shiftFilter="(v) => shiftFilter = v"
          @update:statusFilter="(v) => statusFilter = v"
          @update:selectedRows="(v) => selectedRows = v"
          @update:pagination="(v) => pagination = v"
          @search="pagination.currentPage = 1"
          @date-change="pagination.currentPage = 1"
          @filter-change="pagination.currentPage = 1"
          @batch-edit-click="handleBatchEditClick"
          @batch-delete-click="handleBatchDeleteClick"
          @batch-export-click="handleBatchExportClick"
          @cancel-batch="handleCancelBatch"
          @row-click="handleTableRowClick"
        />
      </div>

      <!-- 侧边栏 - 拆分为独立 SFC（V1.1 SchedulePage.tsx 1:1 对齐） -->
      <ScheduleSidebar
        :selected-schedule="selectedSchedule"
        :swap-requests="store.swapRequests"
        :pending-swap-count="store.pendingSwapCount"
        :shift-configs="store.shiftConfigs"
        :get-swap-status-type="getSwapStatusType"
        @cancel-schedule="handleCancel"
        @swap-approve="handleSwapApprove"
        @swap-reject="handleSwapReject"
      />
    </div>

    <!-- ========== 弹窗 ========== -->

    <!-- 新增排班弹窗 - 拆分为独立 SFC（V1.1 ScheduleAddModal.tsx 1:1 对齐） -->
    <ScheduleAddModal
      :is-open="showAddModal"
      :new-schedule="newSchedule"
      :staff-list="store.staffList"
      :shift-configs="store.shiftConfigs"
      @close="showAddModal = false"
      @submit="handleAddSchedule"
      @update-form="(v) => newSchedule = v"
    />

    <!-- 批量编辑弹窗 - 拆分为独立 SFC（V1.1 ScheduleBatchEditModal.tsx 1:1 对齐） -->
    <ScheduleBatchEditModal
      :is-open="showBatchEditModal"
      :selected-rows="selectedRows"
      :edited-record-ids="editedRecordIds"
      :selected-record-id="selectedRecordId"
      :batch-edit-forms="batchEditForms"
      :shift-configs="store.shiftConfigs"
      :get-schedule-by-id="getScheduleById"
      @close="showBatchEditModal = false"
      @confirm-next="handleConfirmNext"
      @confirm-all="handleConfirmBatchEdit"
      @field-change="handleBatchFieldChange"
      @update:selected-record-id="(v) => selectedRecordId = v"
    />

    <!-- 删除确认弹窗 - 拆分为独立 SFC（V1.1 DeleteWarningModal.tsx 1:1 对齐） -->
    <ScheduleDeleteWarningModal
      :is-open="showDeleteWarning"
      :selected-count="selectedRows.length"
      @close="showDeleteWarning = false"
      @confirm="handleConfirmDelete"
    />

    <!-- 导出格式选择弹窗 - 拆分为独立 SFC（V1.1 ExportFormatModal.tsx 1:1 对齐） -->
    <ScheduleExportFormatModal
      :is-open="showExportModal"
      :selected-count="selectedRows.length"
      :export-format="exportFormat"
      :export-formats="exportFormats"
      @close="showExportModal = false"
      @confirm="handleDoExport"
      @update-format="(v) => exportFormat = v"
    />

    <!-- 调班申请弹窗 - 拆分为独立 SFC（V1.1 SwapRequestModal.tsx L75-172 1:1 对齐） -->
    <ScheduleSwapRequestModal
      :is-open="showSwapModal"
      :swap-form="swapForm"
      :staff-list="store.staffList"
      @close="showSwapModal = false"
      @submit="handleSwapSubmit"
      @update-form="(v) => swapForm = v"
      @requester-change="handleSwapRequesterChange"
      @target-change="handleSwapTargetChange"
    />

    <!-- 班次设置弹窗 - 拆分为独立 SFC（V1.1 ShiftEditor.tsx L52-181 1:1 对齐） -->
    <ScheduleShiftEditorModal
      :is-open="showShiftEditor"
      :shift-configs="store.shiftConfigs"
      :editing-shift-name="editingShiftName"
      :temp-shift-config="tempShiftConfig"
      :shift-colors="SHIFT_COLORS"
      @close="showShiftEditor = false"
      @edit-start="handleShiftEditStart"
      @edit-cancel="handleShiftEditCancel"
      @edit-save="handleShiftEditSave"
      @update-temp-config="(v) => tempShiftConfig = v"
    />
  </div>
</template>

<script setup>
// V1.1 1:1 拆分：10 个独立 SFC（标题/日历/表格/班次编辑器/侧边栏/调班/批量编辑/新增/删除警告/导出格式）
import ScheduleHeader from './components/ScheduleHeader.vue'
import ScheduleCalendarView from './components/ScheduleCalendarView.vue'
import ScheduleTableView from './components/ScheduleTableView.vue'
import ScheduleShiftEditorModal from './components/ScheduleShiftEditorModal.vue'
import ScheduleSidebar from './components/ScheduleSidebar.vue'
import ScheduleSwapRequestModal from './components/ScheduleSwapRequestModal.vue'
import ScheduleBatchEditModal from './components/ScheduleBatchEditModal.vue'
import ScheduleAddModal from './components/ScheduleAddModal.vue'
import ScheduleDeleteWarningModal from './components/ScheduleDeleteWarningModal.vue'
import ScheduleExportFormatModal from './components/ScheduleExportFormatModal.vue'
import { ref, computed, onMounted, reactive } from 'vue'
import { Calendar, List, User, Setting, Plus, Clock, ArrowLeft, ArrowRight, ArrowRight as Promotion, Download, Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useScheduleStore } from '@/stores/modules/schedule'

const store = useScheduleStore()

// 显示模式
const displayMode = ref('calendar')
const calendarDate = ref(new Date())

// ============ 与 V1.1 SchedulePage L61 viewMode 1:1 对齐：月/周/日 视图 ============
const viewMode = ref('month')  // 'month' | 'week' | 'day'
const selectedDay = ref(new Date().toISOString().slice(0, 10))

// ============ 与 V1.1 ShiftEditor L25-26 1:1 对齐：班次编辑模式 ============
const editingShiftName = ref(null)
const tempShiftConfig = reactive({ startTime: '', endTime: '', color: '' })
// 与 V1.1 ShiftEditor L13-22 1:1 对齐：颜色 8 色
const SHIFT_COLORS = [
  { name: 'bg-amber-500', value: '#f59e0b' },
  { name: 'bg-blue-500', value: '#3b82f6' },
  { name: 'bg-indigo-600', value: '#4f46e5' },
  { name: 'bg-green-500', value: '#10b981' },
  { name: 'bg-purple-500', value: '#a855f7' },
  { name: 'bg-pink-500', value: '#ec4899' },
  { name: 'bg-red-500', value: '#ef4444' },
  { name: 'bg-teal-500', value: '#14b8a6' },
]

// ============ 表格视图：搜索 + 筛选（V1.1 ScheduleTable L87-128 1:1 对齐） ============
const searchTerm = ref('')
const shiftFilter = ref('all')
const statusFilter = ref('all')
const dateRange = ref({
  start: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10) })(),
  end: (() => { const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10) })(),
})

// ============ 表格筛选后的数据（V1.1 L109-128 1:1 对齐） ============
const filteredSchedules = computed(() => {
  return store.schedules.filter(record => {
    const matchSearch = !searchTerm.value ||
      (record.staffName || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (record.workZone || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (record.date || '').includes(searchTerm.value)
    const matchShift = shiftFilter.value === 'all' || record.shift === shiftFilter.value
    const matchStatus = statusFilter.value === 'all' || record.status === statusFilter.value
    const matchDate = record.date >= dateRange.value.start && record.date <= dateRange.value.end
    return matchSearch && matchShift && matchStatus && matchDate
  })
})

const currentYear = computed(() => calendarDate.value.getFullYear())
const currentMonth = computed(() => calendarDate.value.getMonth() + 1)

// 弹窗状态
const showAddModal = ref(false)
const showSwapModal = ref(false)
const showShiftEditor = ref(false)
const showBatchEditModal = ref(false)

// ============ 与 V1.1 ScheduleBatchEditModal L25-43 1:1 对齐：批量编辑 state ============
const editedRecordIds = ref([])     // 已编辑过的记录 id 列表
const selectedRecordId = ref('')   // 当前正在编辑的记录 id

// 取记录辅助
const getScheduleById = (id) => store.schedules.find(s => s.id === id)

// 字段修改：先标记已编辑，再写入 batchEditForms
const handleBatchFieldChange = (field, value) => {
  if (!selectedRecordId.value) return
  if (!batchEditForms[selectedRecordId.value]) {
    batchEditForms[selectedRecordId.value] = {}
  }
  batchEditForms[selectedRecordId.value][field] = value
  if (!editedRecordIds.value.includes(selectedRecordId.value)) {
    editedRecordIds.value.push(selectedRecordId.value)
  }
}

// 与 V1.1 L197-222 handleConfirmNext 1:1 对齐：确认下一个
const handleConfirmNext = () => {
  if (!selectedRecordId.value) {
    ElMessage.warning('请先选择一条记录')
    return
  }
  if (!editedRecordIds.value.includes(selectedRecordId.value)) {
    editedRecordIds.value.push(selectedRecordId.value)
  }
  // 找下一条未编辑的记录
  const nextUnedited = selectedRows.value.find(id =>
    id !== selectedRecordId.value && !editedRecordIds.value.includes(id)
  )
  if (nextUnedited) {
    selectedRecordId.value = nextUnedited
    ElMessage.success('已切换到下一条')
  } else {
    ElMessage.success('所有记录已编辑完成')
    handleConfirmBatchEdit()
  }
}
const showDeleteWarning = ref(false)
const showExportModal = ref(false)

// 分页
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// 批量操作
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const batchEditForms = reactive({})
const exportFormat = ref('excel')

const exportFormats = [
  { value: 'excel', label: 'Excel (.xls)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.doc)', desc: '适用于文档编辑和分享' },
]

// 新排班表单
const newSchedule = reactive({ staffId: '', date: '', shift: '早班', workZone: '' })

// 调班表单
const swapForm = reactive({ requesterId: '', requesterName: '', targetId: '', targetName: '', originalDate: '', targetDate: '', reason: '' })

// 选中的排班
const selectedSchedule = ref(null)

// 获取日期的排班数量
const getScheduleCountForDate = (date) => {
  return store.schedules.filter(s => s.date === date).length
}

const getShiftType = (shift) => ({ '早班': '', '中班': 'warning', '晚班': 'danger', '全天': 'success', '弹性': 'info' }[shift] || '')
const getStatusType = (status) => ({ '已排班': 'info', '已执行': 'success', '已取消': 'warning' }[status] || 'info')
const getSwapStatusType = (status) => ({ '待审批': 'warning', '已同意': 'success', '已拒绝': 'danger' }[status] || 'info')

const prevMonth = () => { calendarDate.value = new Date(currentYear.value, currentMonth.value - 2, 1) }
const nextMonth = () => { calendarDate.value = new Date(currentYear.value, currentMonth.value, 1) }

const handleCalendarDateClick = (day) => { selectedSchedule.value = store.schedules.find(s => s.date === day) || null }

// ============ 与 V1.1 ScheduleCalendar L76-104 1:1 对齐：上一天/今天/下一天 ============
const handleCalendarPrev = () => {
  if (viewMode.value === 'day') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() - 1)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else if (viewMode.value === 'week') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() - 7)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else {
    prevMonth()
  }
}

const handleCalendarNext = () => {
  if (viewMode.value === 'day') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() + 1)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else if (viewMode.value === 'week') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() + 7)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else {
    nextMonth()
  }
}

const handleCalendarToday = () => {
  const today = new Date().toISOString().slice(0, 10)
  selectedDay.value = today
  calendarDate.value = new Date(today)
}

// ============ 与 V1.1 ScheduleCalendar L45-59 1:1 对齐：辅助函数 ============
const isToday = (dateStr) => {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr === today
}

const getSchedulesForDate = (dateStr) => {
  return store.schedules.filter(s => s.date === dateStr)
}

const getShiftColor = (shift) => {
  const config = store.shiftConfigs.find(c => c.name === shift)
  return config?.color || 'bg-gray-500'
}

const getShiftTime = (shift) => {
  const config = store.shiftConfigs.find(c => c.name === shift)
  return config ? `${config.startTime} - ${config.endTime}` : '-'
}

const getStatusClass = (status) => ({
  '已排班': 'bg-blue-100 text-blue-700',
  '已执行': 'bg-green-100 text-green-700',
  '已取消': 'bg-gray-100 text-gray-600',
}[status] || 'bg-gray-100 text-gray-700')

// ============ 周视图 7 天数据（V1.1 L186-272 1:1 对齐） ============
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const weekDays = computed(() => {
  const base = new Date(selectedDay.value)
  // 把基准日对齐到本周一
  const dayOfWeek = base.getDay() === 0 ? 7 : base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - (dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    return { date: dateStr, day: d.getDate(), weekday: WEEKDAYS[i] }
  })
})

// ============ 月视图 6 周（42 天）日期范围（V1.1 L113-117 1:1 对齐） ============
const monthDateRange = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  // 本月第一天
  const firstDay = new Date(year, month - 1, 1)
  // 本月第一天是周几（周一=0，周日=6）
  let firstDayWeekday = firstDay.getDay() - 1
  if (firstDayWeekday < 0) firstDayWeekday = 6
  // 起始日：前推 firstDayWeekday 天到本周一
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDayWeekday)
  // 42 天 = 6 周
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
})

// 判断某日是否属于当前显示月份（V1.1 L55-59 1:1 对齐）
const isCurrentMonth = (dateStr) => {
  const d = new Date(dateStr)
  return d.getFullYear() === currentYear.value && d.getMonth() + 1 === currentMonth.value
}

// 月视图日期数字显示（V1.1 L36-42 formatDateDisplay month 模式）
const formatMonthDay = (dateStr) => {
  return new Date(dateStr).getDate().toString()
}

// 表格行星期显示（V1.1 L140-144 getWeekday 1:1 对齐）
const getWeekday = (dateStr) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[new Date(dateStr).getDay()]
}

// 表格行点击 → 显示排班详情（V1.1 L412-417 onScheduleClick 1:1 对齐）
const handleTableRowClick = (row) => {
  if (exportMode.value || batchEditMode.value || batchDeleteMode.value) {
    // 批量模式下点击行不触发详情
    return
  }
  selectedSchedule.value = row
}

const formatWeekdayTitle = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[(d.getDay() === 0 ? 7 : d.getDay()) - 1]}`
}

const formatDayTitle = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[(d.getDay() === 0 ? 7 : d.getDay()) - 1]}`
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(s => s.id)
}

// 批量操作按钮
const handleBatchExportClick = () => {
  if (exportMode.value) {
    if (selectedRows.value.length === 0) { ElMessage.warning('请先选择要导出的数据'); return }
    showExportModal.value = true
  } else {
    exportMode.value = true
    batchEditMode.value = false
    batchDeleteMode.value = false
    selectedRows.value = []
  }
}

const handleBatchEditClick = () => {
  if (batchEditMode.value) {
    if (selectedRows.value.length === 0) { ElMessage.warning('请先选择要编辑的记录'); return }
    // 初始化编辑表单
    selectedRows.value.forEach(id => {
      const record = store.schedules.find(s => s.id === id)
      if (record) {
        batchEditForms[id] = { shift: record.shift, workZone: record.workZone }
      }
    })
    showBatchEditModal.value = true
  } else {
    batchEditMode.value = true
    batchDeleteMode.value = false
    exportMode.value = false
    selectedRows.value = []
  }
}

const handleBatchDeleteClick = () => {
  if (batchDeleteMode.value) {
    if (selectedRows.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }
    showDeleteWarning.value = true
  } else {
    batchDeleteMode.value = true
    batchEditMode.value = false
    exportMode.value = false
    selectedRows.value = []
  }
}

const handleCancelBatch = () => {
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 确认批量编辑
const handleConfirmBatchEdit = () => {
  selectedRows.value.forEach(id => {
    const form = batchEditForms[id]
    if (form) {
      store.updateSchedule(id, { shift: form.shift, workZone: form.workZone })
    }
  })
  ElMessage.success('批量编辑已保存')
  showBatchEditModal.value = false
  handleCancelBatch()
}

// 确认删除
const handleConfirmDelete = () => {
  selectedRows.value.forEach(id => store.deleteSchedule(id))
  ElMessage.success(`已删除 ${selectedRows.value.length} 条记录`)
  showDeleteWarning.value = false
  handleCancelBatch()
}

// 真实导出实现
const handleDoExport = () => {
  const selectedData = store.schedules.filter(s => selectedRows.value.includes(s.id))
  const headers = ['日期', '员工', '班次', '工作区域', '开始时间', '结束时间', '状态', '签到时间', '签退时间']

  const exportData = selectedData.map(row => {
    const shiftConfig = store.shiftConfigs.find(c => c.name === row.shift)
    return {
      '日期': row.date,
      '员工': row.staffName || '-',
      '班次': row.shift,
      '工作区域': row.workZone || '-',
      '开始时间': shiftConfig?.startTime || '',
      '结束时间': shiftConfig?.endTime || '',
      '状态': row.status,
      '签到时间': row.checkIn || '-',
      '签退时间': row.checkOut || '-',
    }
  })

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const bom = '﻿'
    content = bom + headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${(row[h] || '')}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const fileName = `排班记录_${new Date().toISOString().slice(0, 10)}.${extension}`
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success(`已导出 ${selectedRows.value.length} 条数据为 ${extension.toUpperCase()} 格式`)
  showExportModal.value = false
  handleCancelBatch()
}

// 查看详情
const handleView = (row) => { selectedSchedule.value = row }

// 取消排班
const handleCancel = (row) => {
  ElMessageBox.confirm(`确定要取消 ${row.staffName} 的排班吗？`, '取消确认', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    store.cancelSchedule(row.id)
    ElMessage.success('已取消排班')
  }).catch(() => {})
}

// 单条编辑（V1.1 ScheduleTable 不存在此功能，使用批量编辑代替；保留 handleEditSingle 占位以避免破坏未知调用）
const handleEditSingle = (_row) => {
  ElMessage.info('请使用批量编辑功能修改单条记录')
}

// 新增排班
const handleAddSchedule = () => {
  if (!newSchedule.staffId || !newSchedule.date) { ElMessage.warning('请选择员工和日期'); return }
  const staff = store.staffList.find(s => s.id === newSchedule.staffId)
  if (staff) {
    const shiftConfig = store.shiftConfigs.find(c => c.name === newSchedule.shift)
    store.addSchedule({
      staffId: newSchedule.staffId,
      staffName: staff.name,
      date: newSchedule.date,
      shift: newSchedule.shift,
      workZone: newSchedule.workZone || staff.workZone,
      startTime: shiftConfig?.startTime || '',
      endTime: shiftConfig?.endTime || '',
    })
    ElMessage.success('排班添加成功')
    showAddModal.value = false
    Object.assign(newSchedule, { staffId: '', date: '', shift: '早班', workZone: '' })
  }
}

// 调班申请 - 与 V1.1 SwapRequestModal L62-73 1:1 对齐：完整验证
const handleSwapSubmit = () => {
  if (!swapForm.requesterId || !swapForm.targetId || !swapForm.originalDate || !swapForm.targetDate) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (swapForm.requesterId === swapForm.targetId) {
    ElMessage.warning('不能与自己调班')
    return
  }
  const requester = store.staffList.find(s => s.id === swapForm.requesterId)
  const target = store.staffList.find(s => s.id === swapForm.targetId)
  store.submitSwapRequest({
    requesterId: swapForm.requesterId,
    requesterName: requester?.name || swapForm.requesterName,
    targetId: swapForm.targetId,
    targetName: target?.name || swapForm.targetName,
    originalDate: swapForm.originalDate,
    targetDate: swapForm.targetDate,
    reason: swapForm.reason,
  })
  ElMessage.success('调班申请已提交')
  showSwapModal.value = false
  // 与 V1.1 L114 1:1 对齐：重置表单
  Object.assign(swapForm, { requesterId: '', requesterName: '', targetId: '', targetName: '', originalDate: '', targetDate: '', reason: '' })
}

const handleSwapApprove = (request) => { store.handleSwapRequest(request.id, '已同意'); ElMessage.success('已同意调班申请') }
const handleSwapReject = (request) => { store.handleSwapRequest(request.id, '已拒绝'); ElMessage.success('已拒绝调班申请') }

const handleSaveShift = () => {
  ElMessage.success('班次设置已保存')
  showShiftEditor.value = false
}

// ============ 与 V1.1 ShiftEditor L29-50 1:1 对齐：班次编辑 ============
const handleShiftEditStart = (config) => {
  editingShiftName.value = config.name
  tempShiftConfig.startTime = config.startTime
  tempShiftConfig.endTime = config.endTime
  tempShiftConfig.color = config.color
}

const handleShiftEditSave = () => {
  if (editingShiftName.value && tempShiftConfig.startTime && tempShiftConfig.endTime) {
    const idx = store.shiftConfigs.findIndex(c => c.name === editingShiftName.value)
    if (idx !== -1) {
      store.shiftConfigs[idx] = { ...store.shiftConfigs[idx], ...tempShiftConfig }
      ElMessage.success(`${editingShiftName.value}已更新`)
    }
    editingShiftName.value = null
  } else {
    ElMessage.warning('请填写完整时间')
  }
}

const handleShiftEditCancel = () => {
  editingShiftName.value = null
}

// ============ 与 V1.1 SwapRequestModal L39-59 1:1 对齐：员工选择联动姓名 ============
const handleSwapRequesterChange = (staffId) => {
  const staff = store.staffList.find(s => s.id === staffId)
  if (staff) {
    swapForm.requesterName = staff.name
  }
}

const handleSwapTargetChange = (staffId) => {
  const staff = store.staffList.find(s => s.id === staffId)
  if (staff) {
    swapForm.targetName = staff.name
  }
}

// 与 V1.1 useSchedule.ts L13-15 1:1 对齐：组件挂载时调 fetchSchedules（先加载真实工人，再尝试 API，空则回退种子数据）
onMounted(() => {
  store.fetchSchedules()
  // 与 V1.1 ScheduleTable.tsx L416 hover:bg-blue-100 1:1 对齐：排班表格行 hover 为浅蓝色
  // el-table 默认 hover 为浅灰，注入全局样式覆盖为 #dbeafe (Tailwind blue-100)
  if (!document.getElementById('schedule-table-hover-style')) {
    const style = document.createElement('style')
    style.id = 'schedule-table-hover-style'
    // 仅作用于排班表格容器，避免污染其他 el-table
    style.textContent = `
      .schedule-table .el-table__body tr.el-table__row:hover > td.el-table__cell {
        background-color: #dbeafe !important;
        transition: background-color 0.2s ease;
      }
    `
    document.head.appendChild(style)
  }
})

// ============ 与 V1.1 L16-32 1:1 对齐：数据兼容工具 ============
// 规范化排班记录（兼容 snake_case 和 camelCase）
function normalizeRecord(record) {
  return {
    ...record,
    staffName: record.staffName || record.staff_name || '',
    workZone: record.workZone || record.work_zone || '',
  }
}

// 获取规范的员工名称
function getStaffName(record) {
  return record.staffName || record.staff_name || '-'
}

// 获取规范的工作区域
function getWorkZone(record) {
  return record.workZone || record.work_zone || '-'
}
</script>
