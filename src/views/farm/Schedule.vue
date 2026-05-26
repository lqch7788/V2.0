<template>
  <div class="space-y-4 p-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Calendar /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">排班调度</h1>
          <p class="text-gray-500">员工排班管理与调班申请</p>
        </div>
      </div>
    </div>

    <!-- 快捷操作栏 -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <!-- 左侧操作 -->
        <div class="flex items-center gap-2">
          <el-button :type="displayMode === 'calendar' ? 'primary' : ''" size="small" @click="displayMode = 'calendar'">
            <el-icon><Calendar /></el-icon>
            日历视图
          </el-button>
          <el-button :type="displayMode === 'table' ? 'primary' : ''" size="small" @click="displayMode = 'table'">
            <el-icon><List /></el-icon>
            表格视图
          </el-button>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-2">
          <el-button size="small" class="!bg-purple-600 !border-purple-600 !text-white hover:!bg-purple-700" @click="showSwapModal = true">
            <el-icon><User /></el-icon>
            调班申请
          </el-button>
          <el-button size="small" class="!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700" @click="showShiftEditor = true">
            <el-icon><Setting /></el-icon>
            班次设置
          </el-button>
          <!-- 表格视图下的批量操作按钮 -->
          <template v-if="displayMode === 'table'">
            <el-button size="small" @click="handleBatchExportClick">
              <el-icon><Download /></el-icon>
              {{ exportMode ? '确认导出' : '批量导出' }}
            </el-button>
            <el-button size="small" @click="handleBatchEditClick">
              <el-icon><Edit /></el-icon>
              {{ batchEditMode ? '确认编辑' : '批量编辑' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleBatchDeleteClick">
              <el-icon><Delete /></el-icon>
              {{ batchDeleteMode ? '确认删除' : '批量删除' }}
            </el-button>
          </template>
          <el-button type="primary" size="small" @click="showAddModal = true">
            <el-icon><Plus /></el-icon>
            新增排班
          </el-button>
        </div>
      </div>
    </div>

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
        <!-- 日历视图 -->
        <div v-if="displayMode === 'calendar'" class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between mb-4">
            <el-button text @click="prevMonth">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <span class="text-lg font-semibold">{{ currentYear }}年{{ currentMonth }}月</span>
            <el-button text @click="nextMonth">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>

          <el-calendar v-model="calendarDate">
            <template #date-cell="{ data }">
              <div class="relative" @click="handleCalendarDateClick(data.day)">
                <div :class="['text-center py-1', data.isSelected ? 'bg-blue-500 text-white rounded' : '']">
                  {{ data.day.split('-').slice(2).join('-') }}
                </div>
                <div v-if="getScheduleCountForDate(data.day) > 0" class="absolute bottom-0 left-0 right-0 text-center">
                  <span class="text-xs text-blue-600">{{ getScheduleCountForDate(data.day) }}人</span>
                </div>
              </div>
            </template>
          </el-calendar>
        </div>

        <!-- 表格视图 -->
        <div v-else class="bg-white rounded-lg shadow">
          <el-table
            :data="paginatedSchedules"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              v-if="exportMode || batchEditMode || batchDeleteMode"
              type="selection"
              width="50"
            />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="staffName" label="员工" width="100" />
            <el-table-column prop="shift" label="班次" width="100">
              <template #default="{ row }">
                <el-tag :type="getShiftType(row.shift)" size="small">{{ row.shift }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="workZone" label="工作区域" width="120" />
            <el-table-column prop="startTime" label="开始时间" width="100" />
            <el-table-column prop="endTime" label="结束时间" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="checkIn" label="签到时间" width="120" />
            <el-table-column prop="checkOut" label="签退时间" width="120" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
                <el-button link type="danger" size="small" @click="handleCancel(row)" v-if="row.status === '已排班'">取消</el-button>
                <el-button link type="warning" size="small" @click="handleEditSingle(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 批量操作提示栏 -->
          <div v-if="batchEditMode || batchDeleteMode || exportMode" class="bg-white px-4 py-3 border-t flex items-center justify-between">
            <div class="text-sm text-gray-600">
              已选择 <strong class="text-emerald-600">{{ selectedRows.length }}</strong> 项
              <template v-if="batchEditMode">（点击批量编辑进入编辑模式）</template>
              <template v-if="batchDeleteMode">（确认删除选中的记录）</template>
            </div>
            <el-button size="small" @click="handleCancelBatch">取消</el-button>
          </div>

          <!-- 分页 -->
          <div class="flex justify-end p-4">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="store.schedules.length"
              layout="total, sizes, prev, pager, next"
            />
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-4">
        <!-- 排班详情 -->
        <div v-if="selectedSchedule" class="bg-white rounded-lg shadow p-4">
          <h3 class="font-medium text-gray-800 mb-3">排班详情</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">员工:</span>
              <span class="font-medium text-gray-800">{{ selectedSchedule.staffName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">日期:</span>
              <span class="text-gray-800">{{ selectedSchedule.date }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">班次:</span>
              <span class="font-medium text-gray-800">{{ selectedSchedule.shift }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">工作区:</span>
              <span class="text-gray-800">{{ selectedSchedule.workZone }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">状态:</span>
              <span :class="[
                'px-2 py-0.5 rounded text-xs',
                selectedSchedule.status === '已排班' ? 'bg-blue-100 text-blue-700' : '',
                selectedSchedule.status === '已执行' ? 'bg-green-100 text-green-700' : '',
                selectedSchedule.status === '已取消' ? 'bg-gray-100 text-gray-600' : '',
              ]">{{ selectedSchedule.status }}</span>
            </div>
            <div v-if="selectedSchedule.checkIn" class="flex justify-between">
              <span class="text-gray-500">签到:</span>
              <span class="text-green-600">{{ selectedSchedule.checkIn }}</span>
            </div>
            <div v-if="selectedSchedule.checkOut" class="flex justify-between">
              <span class="text-gray-500">签退:</span>
              <span class="text-red-600">{{ selectedSchedule.checkOut }}</span>
            </div>
          </div>
          <el-button
            v-if="selectedSchedule.status === '已排班'"
            size="small"
            class="w-full mt-4 !border-red-200 !text-red-600 hover:!bg-red-50"
            @click="handleCancel(selectedSchedule)"
          >
            取消排班
          </el-button>
        </div>

        <!-- 调班申请列表 -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium text-gray-800">调班申请</h3>
            <span class="text-xs text-gray-500">{{ store.pendingSwapCount }} 待处理</span>
          </div>
          <div class="space-y-3">
            <div v-for="request in store.swapRequests.slice(0, 5)" :key="request.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-800">{{ request.requesterName }}</span>
                <el-tag :type="getSwapStatusType(request.status)" size="small">{{ request.status }}</el-tag>
              </div>
              <p class="text-xs text-gray-500">{{ request.originalDate }} → {{ request.targetDate }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ request.reason }}</p>
              <div v-if="request.status === '待审批'" class="flex gap-2 mt-2">
                <el-button size="small" type="success" @click="handleSwapApprove(request)">同意</el-button>
                <el-button size="small" type="danger" @click="handleSwapReject(request)">拒绝</el-button>
              </div>
            </div>
            <div v-if="store.swapRequests.length === 0" class="text-center text-gray-400 py-4">
              暂无调班申请
            </div>
          </div>
        </div>

        <!-- 班次图例 -->
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="font-medium text-gray-800 mb-3">班次图例</h3>
          <div class="space-y-2">
            <div v-for="config in store.shiftConfigs" :key="config.name" class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded', config.color]" />
              <span class="text-sm text-gray-600">{{ config.name }}</span>
              <span class="text-xs text-gray-400 ml-auto">{{ config.startTime }}-{{ config.endTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 弹窗 ========== -->

    <!-- 新增排班弹窗 -->
    <el-dialog v-model="showAddModal" title="新增排班" width="500px">
      <el-form :model="newSchedule" label-width="80px">
        <el-form-item label="员工">
          <el-select v-model="newSchedule.staffId" placeholder="选择员工" class="w-full">
            <el-option v-for="staff in store.staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="newSchedule.date" type="date" placeholder="选择日期" class="w-full" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="newSchedule.shift" placeholder="选择班次" class="w-full">
            <el-option v-for="config in store.shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作区域">
          <el-input v-model="newSchedule.workZone" placeholder="输入工作区域" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddSchedule">确定</el-button>
      </template>
    </el-dialog>

    <!-- 单条编辑弹窗 -->
    <el-dialog v-model="showEditModal" title="编辑排班" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="班次">
          <el-select v-model="editForm.shift" placeholder="选择班次" class="w-full">
            <el-option v-for="config in store.shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作区域">
          <el-input v-model="editForm.workZone" placeholder="输入工作区域" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="showBatchEditModal" title="批量编辑排班" width="600px">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条记录，可逐条编辑</p>
      <div class="space-y-4">
        <div v-for="id in selectedRows" :key="id" class="p-3 bg-gray-50 rounded-lg">
          <template v-for="record in store.schedules.filter(s => s.id === id)" :key="record.id">
            <p class="text-sm font-medium text-gray-800 mb-2">{{ record.staffName }} - {{ record.date }}</p>
            <div class="flex gap-2">
              <el-select v-model="batchEditForms[id].shift" size="small" style="width: 120px">
                <el-option v-for="config in store.shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
              </el-select>
              <el-input v-model="batchEditForms[id].workZone" size="small" placeholder="工作区域" style="width: 150px" />
            </div>
          </template>
        </div>
      </div>
      <template #footer>
        <el-button @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchEdit">保存全部</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteWarning" title="确认删除" width="400px">
      <p class="text-sm text-gray-600">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条排班记录吗？此操作不可撤销。</p>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="showExportModal" title="选择导出格式" width="400px">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <div
          v-for="format in exportFormats"
          :key="format.value"
          :class="[
            'p-4 border rounded-lg cursor-pointer transition-all',
            exportFormat === format.value
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
          @click="exportFormat = format.value"
        >
          <div class="flex items-center">
            <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0', exportFormat === format.value ? 'border-emerald-600' : 'border-gray-300']">
              <div v-if="exportFormat === format.value" class="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
              <p class="text-xs text-gray-500">{{ format.desc }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>

    <!-- 调班申请弹窗 -->
    <el-dialog v-model="showSwapModal" title="调班申请" width="500px">
      <el-form :model="swapForm" label-width="80px">
        <el-form-item label="申请人">
          <el-select v-model="swapForm.requesterId" placeholder="选择申请人" class="w-full">
            <el-option v-for="staff in store.staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标员工">
          <el-select v-model="swapForm.targetId" placeholder="选择目标员工" class="w-full">
            <el-option v-for="staff in store.staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="原日期">
          <el-date-picker v-model="swapForm.originalDate" type="date" class="w-full" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="目标日期">
          <el-date-picker v-model="swapForm.targetDate" type="date" class="w-full" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="调班原因">
          <el-input v-model="swapForm.reason" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSwapModal = false">取消</el-button>
        <el-button type="primary" @click="handleSwapSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 班次设置弹窗 -->
    <el-dialog v-model="showShiftEditor" title="班次设置" width="600px">
      <div class="space-y-4">
        <div v-for="config in store.shiftConfigs" :key="config.name" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div :class="['w-4 h-4 rounded', config.color]" />
          <span class="w-20 font-medium">{{ config.name }}</span>
          <el-time-select v-model="config.startTime" placeholder="开始" style="width: 120px" />
          <span class="text-gray-400">至</span>
          <el-time-select v-model="config.endTime" placeholder="结束" style="width: 120px" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showShiftEditor = false">取消</el-button>
        <el-button type="primary" @click="handleSaveShift">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Calendar, List, User, Setting, Plus, Clock, ArrowLeft, ArrowRight, Download, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useScheduleStore } from '@/stores/modules/schedule'

const store = useScheduleStore()

// 显示模式
const displayMode = ref('calendar')
const calendarDate = ref(new Date())

const currentYear = computed(() => calendarDate.value.getFullYear())
const currentMonth = computed(() => calendarDate.value.getMonth() + 1)

// 弹窗状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showSwapModal = ref(false)
const showShiftEditor = ref(false)
const showBatchEditModal = ref(false)
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

// 编辑表单
const showEditId = ref('')
const editForm = reactive({ shift: '早班', workZone: '' })

// 调班表单
const swapForm = reactive({ requesterId: '', targetId: '', originalDate: '', targetDate: '', reason: '' })

// 选中的排班
const selectedSchedule = ref(null)

// 分页后的排班
const paginatedSchedules = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return store.schedules.slice(start, end)
})

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

// 单条编辑
const handleEditSingle = (row) => {
  showEditId.value = row.id
  editForm.shift = row.shift
  editForm.workZone = row.workZone
  showEditModal.value = true
}

const handleSaveEdit = () => {
  store.updateSchedule(showEditId.value, { shift: editForm.shift, workZone: editForm.workZone })
  ElMessage.success('编辑已保存')
  showEditModal.value = false
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

// 调班申请
const handleSwapSubmit = () => {
  if (!swapForm.requesterId || !swapForm.targetId) { ElMessage.warning('请选择申请人和目标员工'); return }
  const requester = store.staffList.find(s => s.id === swapForm.requesterId)
  const target = store.staffList.find(s => s.id === swapForm.targetId)
  store.submitSwapRequest({
    requesterId: swapForm.requesterId,
    requesterName: requester?.name || '',
    targetId: swapForm.targetId,
    targetName: target?.name || '',
    originalDate: swapForm.originalDate,
    targetDate: swapForm.targetDate,
    reason: swapForm.reason,
  })
  ElMessage.success('调班申请已提交')
  showSwapModal.value = false
}

const handleSwapApprove = (request) => { store.handleSwapRequest(request.id, '已同意'); ElMessage.success('已同意调班申请') }
const handleSwapReject = (request) => { store.handleSwapRequest(request.id, '已拒绝'); ElMessage.success('已拒绝调班申请') }

const handleSaveShift = () => {
  ElMessage.success('班次设置已保存')
  showShiftEditor.value = false
}

// 初始化种子数据
onMounted(() => {
  store.initSeedData()
})
</script>
