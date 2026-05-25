<template>
  <div class="space-y-4 p-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Calendar /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">排班调度中心</h1>
          <p class="text-gray-500">管理员工排班、班次设置和调班申请</p>
        </div>
      </div>
    </div>

    <!-- 快捷操作栏 -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <!-- 左侧操作 -->
        <div class="flex items-center gap-2">
          <el-button
            :type="displayMode === 'calendar' ? 'primary' : ''"
            @click="displayMode = 'calendar'"
          >
            <el-icon><Calendar /></el-icon>
            日历视图
          </el-button>
          <el-button
            :type="displayMode === 'table' ? 'primary' : ''"
            @click="displayMode = 'table'"
          >
            <el-icon><List /></el-icon>
            表格视图
          </el-button>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-2">
          <el-button type="warning" @click="showSwapModal = true">
            <el-icon><User /></el-icon>
            调班申请
          </el-button>
          <el-button @click="showShiftEditor = true">
            <el-icon><Setting /></el-icon>
            班次设置
          </el-button>
          <el-button type="primary" @click="showAddModal = true">
            <el-icon><Plus /></el-icon>
            新增排班
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <el-icon :size="20" class="text-blue-600"><Calendar /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">今日排班</p>
            <p class="text-xl font-bold text-gray-800">{{ todayScheduleCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <el-icon :size="20" class="text-green-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">本周已执行</p>
            <p class="text-xl font-bold text-gray-800">{{ weekExecutedCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><User /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">待调班申请</p>
            <p class="text-xl font-bold text-gray-800">{{ pendingSwapCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <el-icon :size="20" class="text-purple-600"><List /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">本月排班总数</p>
            <p class="text-xl font-bold text-gray-800">{{ monthScheduleCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="grid grid-cols-3 gap-6">
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
              <div class="relative">
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
          <el-table :data="paginatedSchedules" style="width: 100%">
            <el-table-column type="selection" width="55" />
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
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
                <el-button link type="danger" size="small" @click="handleCancel(row)" v-if="row.status === '已排班'">取消</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="flex justify-end p-4">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="scheduleList.length"
              layout="total, sizes, prev, pager, next"
            />
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-6">
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
              <el-tag :type="getStatusType(selectedSchedule.status)" size="small">{{ selectedSchedule.status }}</el-tag>
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
            type="danger"
            class="w-full mt-4"
            @click="handleCancel(selectedSchedule)"
          >
            取消排班
          </el-button>
        </div>

        <!-- 调班申请列表 -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium text-gray-800">调班申请</h3>
            <span class="text-xs text-gray-500">{{ pendingSwapCount }} 待处理</span>
          </div>
          <div class="space-y-3">
            <div v-for="request in swapRequests.slice(0, 3)" :key="request.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-800">{{ request.requesterName }}</span>
                <el-tag :type="getSwapStatusType(request.status)" size="small">{{ request.status }}</el-tag>
              </div>
              <p class="text-xs text-gray-500">{{ request.originalDate }} → {{ request.targetDate }}</p>
              <div class="flex gap-2 mt-2">
                <el-button size="small" type="success" @click="handleSwapApprove(request)">同意</el-button>
                <el-button size="small" type="danger" @click="handleSwapReject(request)">拒绝</el-button>
              </div>
            </div>
            <div v-if="swapRequests.length === 0" class="text-center text-gray-400 py-4">
              暂无调班申请
            </div>
          </div>
        </div>

        <!-- 班次图例 -->
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="font-medium text-gray-800 mb-3">班次图例</h3>
          <div class="space-y-2">
            <div v-for="config in shiftConfigs" :key="config.name" class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded', config.color]" />
              <span class="text-sm text-gray-600">{{ config.name }}</span>
              <span class="text-xs text-gray-400 ml-auto">{{ config.startTime }}-{{ config.endTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增排班弹窗 -->
    <el-dialog v-model="showAddModal" title="新增排班" width="500px">
      <el-form :model="newSchedule" label-width="80px">
        <el-form-item label="员工">
          <el-select v-model="newSchedule.staffId" placeholder="选择员工" class="w-full">
            <el-option v-for="staff in staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="newSchedule.date"
            type="date"
            placeholder="选择日期"
            class="w-full"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="newSchedule.shift" placeholder="选择班次" class="w-full">
            <el-option v-for="config in shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
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

    <!-- 调班申请弹窗 -->
    <el-dialog v-model="showSwapModal" title="调班申请" width="500px">
      <el-form :model="swapForm" label-width="80px">
        <el-form-item label="申请人">
          <el-select v-model="swapForm.requesterId" placeholder="选择申请人" class="w-full">
            <el-option v-for="staff in staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标员工">
          <el-select v-model="swapForm.targetId" placeholder="选择目标员工" class="w-full">
            <el-option v-for="staff in staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
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
        <div v-for="config in shiftConfigs" :key="config.name" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div :class="['w-4 h-4 rounded', config.color]" />
          <span class="w-20 font-medium">{{ config.name }}</span>
          <el-time-select
            v-model="config.startTime"
            placeholder="开始时间"
            style="width: 120px"
          />
          <span class="text-gray-400">至</span>
          <el-time-select
            v-model="config.endTime"
            placeholder="结束时间"
            style="width: 120px"
          />
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
import { ref, computed } from 'vue'
import { Calendar, List, User, Setting, Plus, Clock, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useScheduleStore } from '@/stores/modules/schedule'

// Pinia store
const store = useScheduleStore()

// 显示模式
const displayMode = ref('calendar')

// 日历日期
const calendarDate = ref(new Date())

// 当前年月
const currentYear = computed(() => calendarDate.value.getFullYear())
const currentMonth = computed(() => calendarDate.value.getMonth() + 1)

// 弹窗状态
const showAddModal = ref(false)
const showSwapModal = ref(false)
const showShiftEditor = ref(false)

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 新排班表单
const newSchedule = ref({
  staffId: '',
  staffName: '',
  date: '',
  shift: '早班',
  workZone: ''
})

// 调班表单
const swapForm = ref({
  requesterId: '',
  requesterName: '',
  targetId: '',
  targetName: '',
  originalDate: '',
  targetDate: '',
  reason: ''
})

// 选中的排班
const selectedSchedule = ref(null)

// 员工列表 - 保留本地mock数据（store中无员工数据）
const staffList = ref([
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' },
  { id: '4', name: '赵六' }
])

// 从store映射数据，保持模板变量名不变
const scheduleList = computed(() => store.schedules)
const shiftConfigs = computed(() => store.shiftConfigs)
const swapRequests = computed(() => store.swapRequests)

// 统计数据 - 使用store的计算属性
const todayScheduleCount = computed(() => store.todayCount)
const weekExecutedCount = computed(() => store.executedCount)
const pendingSwapCount = computed(() => store.pendingSwapCount)
const monthScheduleCount = computed(() => store.schedules.length)

// 分页后的排班
const paginatedSchedules = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return scheduleList.value.slice(start, end)
})

// 获取日期的排班数量
const getScheduleCountForDate = (date) => {
  return scheduleList.value.filter(s => s.date === date).length
}

// 获取班次类型
const getShiftType = (shift) => {
  const typeMap = {
    '早班': '',
    '中班': 'warning',
    '晚班': 'danger'
  }
  return typeMap[shift] || ''
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '已排班': 'info',
    '已执行': 'success',
    '已取消': 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取调班状态类型
const getSwapStatusType = (status) => {
  const typeMap = {
    '待审批': 'warning',
    '已同意': 'success',
    '已拒绝': 'danger'
  }
  return typeMap[status] || 'info'
}

// 上个月
const prevMonth = () => {
  calendarDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}

// 下个月
const nextMonth = () => {
  calendarDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

// 查看详情
const handleView = (row) => {
  selectedSchedule.value = row
}

// 取消排班
const handleCancel = (row) => {
  ElMessageBox.confirm(`确定要取消 ${row.staffName} 的排班吗？`, '取消确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.cancelSchedule(row.id)
    ElMessage.success('已取消排班')
  }).catch(() => {})
}

// 新增排班 - 调用store.addSchedule
const handleAddSchedule = () => {
  if (!newSchedule.value.staffId || !newSchedule.value.date) {
    ElMessage.warning('请选择员工和日期')
    return
  }
  const staff = staffList.value.find(s => s.id === newSchedule.value.staffId)
  if (staff) {
    const shiftConfig = store.shiftConfigs.find(c => c.name === newSchedule.value.shift)
    store.addSchedule({
      date: newSchedule.value.date,
      staffId: newSchedule.value.staffId,
      staffName: staff.name,
      shift: newSchedule.value.shift,
      workZone: newSchedule.value.workZone,
      startTime: shiftConfig?.startTime || '',
      endTime: shiftConfig?.endTime || '',
    })
    ElMessage.success('排班添加成功')
    showAddModal.value = false
    newSchedule.value = { staffId: '', staffName: '', date: '', shift: '早班', workZone: '' }
  }
}

// 提交调班申请 - 调用store.addSwapRequest
const handleSwapSubmit = () => {
  if (!swapForm.value.requesterId || !swapForm.value.targetId) {
    ElMessage.warning('请选择申请人和目标员工')
    return
  }
  const requester = staffList.value.find(s => s.id === swapForm.value.requesterId)
  const target = staffList.value.find(s => s.id === swapForm.value.targetId)
  store.addSwapRequest({
    requesterName: requester?.name || '',
    targetName: target?.name || '',
    originalDate: swapForm.value.originalDate,
    targetDate: swapForm.value.targetDate,
    reason: swapForm.value.reason
  })
  ElMessage.success('调班申请已提交')
  showSwapModal.value = false
}

// 同意调班 - 调用store.approveSwap
const handleSwapApprove = (request) => {
  store.approveSwap(request.id)
  ElMessage.success('已同意调班申请')
}

// 拒绝调班 - 调用store.rejectSwap
const handleSwapReject = (request) => {
  store.rejectSwap(request.id)
  ElMessage.success('已拒绝调班申请')
}

// 保存班次设置
const handleSaveShift = () => {
  ElMessage.success('班次设置已保存')
  showShiftEditor.value = false
}
</script>
