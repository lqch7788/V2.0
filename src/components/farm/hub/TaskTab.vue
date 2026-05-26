<template>
  <div class="space-y-4">
    <!-- 筛选栏 - 与V1.1 TaskTab.tsx 完全一致 -->
    <div class="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2">
      <!-- 状态筛选 -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-sm text-gray-500 whitespace-nowrap">状态:</span>
        <el-select
          :model-value="filters.status"
          @change="(val) => onFilterChange('status', val)"
          placeholder="全部状态"
          class="min-w-[120px]"
          size="default"
        >
          <el-option
            v-for="s in STATUS_OPTIONS"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
      </div>

      <!-- 类型筛选 -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-sm text-gray-500 whitespace-nowrap">类型:</span>
        <el-select
          :model-value="filters.type"
          @change="(val) => onFilterChange('type', val)"
          placeholder="全部类型"
          class="min-w-[110px]"
          size="default"
        >
          <el-option label="全部类型" value="all" />
          <el-option
            v-for="t in TASK_TYPE_OPTIONS"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </div>

      <!-- 执行人筛选 -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-sm text-gray-500 whitespace-nowrap">执行人:</span>
        <el-select
          :model-value="filters.assignee"
          @change="(val) => onFilterChange('assignee', val)"
          placeholder="全部"
          class="min-w-[100px]"
          size="default"
        >
          <el-option label="全部" value="all" />
          <el-option
            v-for="name in assigneeOptions"
            :key="name"
            :label="name"
            :value="name"
          />
        </el-select>
      </div>

      <!-- 批次筛选 -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-sm text-gray-500 whitespace-nowrap">批次:</span>
        <el-select
          :model-value="filters.batchCode"
          @change="(val) => onFilterChange('batchCode', val)"
          placeholder="全部批次"
          class="min-w-[120px]"
          size="default"
        >
          <el-option label="全部批次" value="all" />
          <el-option
            v-for="code in batchCodeOptions"
            :key="code"
            :label="code"
            :value="code"
          />
        </el-select>
      </div>

      <!-- 执行人关键词搜索 -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <el-input
          :model-value="filters.search"
          @input="(val) => onFilterChange('search', val)"
          placeholder="搜索任务..."
          class="w-[160px]"
          size="default"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 重置按钮 -->
      <el-button size="default" @click="onResetFilters" class="flex-shrink-0">
        重置
      </el-button>

      <!-- 视图切换 -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-4 flex-shrink-0">
        <el-button
          :type="viewMode === 'list' ? 'primary' : ''"
          size="small"
          @click="viewMode = 'list'"
        >
          列表
        </el-button>
        <el-button
          :type="viewMode === 'calendar' ? 'primary' : ''"
          size="small"
          @click="viewMode = 'calendar'"
        >
          日历
        </el-button>
      </div>
    </div>

    <!-- 视图内容 -->
    <!-- 日历视图 -->
    <CalendarView
      v-if="viewMode === 'calendar'"
      :tasks="filteredTasks"
      :on-select-task="handleCalendarSelect"
    />

    <!-- 列表视图 - 使用 TaskTable 组件（与V1.1结构完全一致） -->
    <TaskTable
      v-else
      :tasks="filteredTasks"
      :stats="stats"
      :current-page="currentPage"
      :page-size="pageSize"
      :selected-ids="selectedIds"
      :export-mode="toolbarMode === 'export'"
      :batch-edit-mode="toolbarMode === 'batchEdit'"
      :batch-delete-mode="toolbarMode === 'batchDelete'"
      :batch-dispatch-mode="toolbarMode === 'batchDispatch'"
      :batch-verify-mode="toolbarMode === 'batchVerify'"
      :batch-reassign-mode="toolbarMode === 'batchReassign'"
      :can-remind="canRemindFn"
      :send-reminder="sendReminderFn"
      :on-select-row="handleSelectRow"
      :on-select-all="handleSelectAll"
      :on-view-detail="handleViewDetail"
      :on-view-sop="onViewSop"
      :on-accept="handleAccept"
      :on-withdraw="handleWithdraw"
      :on-cancel="handleCancel"
      :on-overtime="handleOvertime"
      :on-continue="handleContinue"
      :on-reassign="handleReassign"
      :on-select-executor="handleSelectExecutor"
      :on-publish="handlePublish"
      :is-my-tasks-view="false"
      :on-page-change="(page) => currentPage = page"
      :on-page-size-change="handlePageSizeChange"
      :on-confirm-export="handleConfirmExport"
      :on-cancel-export="toggleExportMode"
      :on-batch-edit="toggleBatchEditMode"
      :on-confirm-batch-edit="handleConfirmBatchEdit"
      :on-cancel-batch-edit="toggleBatchEditMode"
      :on-cancel-batch-delete="toggleBatchDeleteMode"
      :on-batch-delete="toggleBatchDeleteMode"
      :on-confirm-batch-delete="handleConfirmBatchDelete"
      :on-batch-dispatch="toggleBatchDispatchMode"
      :on-confirm-batch-dispatch="handleConfirmBatchDispatch"
      :on-batch-verify="toggleBatchVerifyMode"
      :on-confirm-batch-verify="handleConfirmBatchVerify"
      :on-batch-reassign="toggleBatchReassignMode"
      :on-confirm-batch-reassign="handleConfirmBatchReassign"
      :on-cancel-batch-reassign="toggleBatchReassignMode"
      :on-export="toggleExportMode"
      :on-import="onImport"
      :on-create="onCreate"
    />
  </div>
</template>

<script setup>
/**
 * 农事任务中心 - 任务管理Tab
 * 使用 TaskTable/TaskTableRow/TaskTableHeader 组件
 * 与 V1.1 TaskTab.tsx 结构完全一致
 */
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  STATUS_OPTIONS, EDITABLE_STATUSES, BATCH_DISPATCH_STATUSES, BATCH_REASSIGN_STATUSES
} from '@/constants/taskDispatch'
import CalendarView from '@/components/farm/hub/CalendarView.vue'
import TaskTable from '@/components/farm/hub/TaskTable.vue'

// ========== 任务类型选项（与V1.1 FARM_OPERATION_TYPES 完全一致，从 config 导入） ==========
import { FARM_OPERATION_TYPES } from '@/config/taskConfig'
const TASK_TYPE_OPTIONS = FARM_OPERATION_TYPES

// 可批量验收的状态
const BATCH_ACCEPT_STATUSES = ['waiting_acceptance']

// ========== Props ==========
const props = defineProps({
  tasks: { type: Array, default: () => [] },
  stats: { type: Object, default: undefined },
  selectedIds: { type: Array, default: () => [] },
  filters: {
    type: Object,
    default: () => ({
      status: 'all', type: 'all', area: 'all', search: '', assignee: 'all', batchCode: 'all',
    }),
  },
  // 选择操作
  onToggleSelect: { type: Function, default: () => {} },
  onSelectAll: { type: Function, default: () => {} },
  onClearSelection: { type: Function, default: () => {} },
  // 筛选操作
  onFilterChange: { type: Function, default: () => {} },
  onResetFilters: { type: Function, default: () => {} },
  // 任务操作回调
  onViewTask: { type: Function, default: null },
  onViewTaskInCalendar: { type: Function, default: null },
  onWithdraw: { type: Function, default: null },
  onCancel: { type: Function, default: null },
  onReassign: { type: Function, default: null },
  onOvertime: { type: Function, default: null },
  onContinue: { type: Function, default: null },
  onAccept: { type: Function, default: null },
  onRemind: { type: Function, default: null },
  canRemind: { type: Function, default: null },
  onViewSop: { type: Function, default: null },
  onSelectExecutor: { type: Function, default: null },
  onPublish: { type: Function, default: null },
  // 批量操作回调
  onBatchDispatch: { type: Function, default: null },
  onBatchVerify: { type: Function, default: null },
  onBatchDelete: { type: Function, default: null },
  onBatchEdit: { type: Function, default: null },
  onBatchReassign: { type: Function, default: null },
  // 导入/导出/新建
  onImport: { type: Function, default: null },
  onExport: { type: Function, default: null },
  onCreate: { type: Function, default: null },
})

// ========== 本地状态 ==========
const viewMode = ref('list')
const currentPage = ref(1)
const pageSize = ref(20)
const toolbarMode = ref('normal') // 'normal' | 'export' | 'batchEdit' | 'batchDelete' | 'batchDispatch' | 'batchVerify' | 'batchReassign'

// ========== 计算属性 ==========
const assigneeOptions = computed(() => {
  const names = [...new Set(props.tasks.map(t => t.assigneeName).filter(Boolean))]
  return names.sort()
})

const batchCodeOptions = computed(() => {
  const codes = [...new Set(props.tasks.map(t => t.batchCode).filter(Boolean))]
  return codes.sort()
})

const filteredTasks = computed(() => {
  return props.tasks.filter(task => {
    if (props.filters.status !== 'all' && task.status !== props.filters.status) return false
    if (props.filters.type !== 'all' && task.type !== props.filters.type) return false
    if (props.filters.area !== 'all' && task.greenhouseName !== props.filters.area) return false
    if (props.filters.assignee !== 'all' && task.assigneeName !== props.filters.assignee) return false
    if (props.filters.batchCode !== 'all' && task.batchCode !== props.filters.batchCode) return false
    return true
  })
})

// ========== 日历视图选择回调 ==========
const handleCalendarSelect = (task) => {
  if (props.onViewTaskInCalendar) {
    props.onViewTaskInCalendar(task)
  } else if (props.onViewTask) {
    props.onViewTask(task.id)
  }
}

// ========== 工具栏模式切换（与V1.1完全一致） ==========
const toggleExportMode = () => {
  toolbarMode.value = toolbarMode.value === 'export' ? 'normal' : 'export'
  props.onClearSelection()
}
const toggleBatchEditMode = () => {
  toolbarMode.value = toolbarMode.value === 'batchEdit' ? 'normal' : 'batchEdit'
  props.onClearSelection()
}
const toggleBatchDeleteMode = () => {
  toolbarMode.value = toolbarMode.value === 'batchDelete' ? 'normal' : 'batchDelete'
  props.onClearSelection()
}
const toggleBatchDispatchMode = () => {
  toolbarMode.value = toolbarMode.value === 'batchDispatch' ? 'normal' : 'batchDispatch'
  props.onClearSelection()
}
const toggleBatchVerifyMode = () => {
  toolbarMode.value = toolbarMode.value === 'batchVerify' ? 'normal' : 'batchVerify'
  props.onClearSelection()
}
const toggleBatchReassignMode = () => {
  toolbarMode.value = toolbarMode.value === 'batchReassign' ? 'normal' : 'batchReassign'
  props.onClearSelection()
}

// ========== 任务操作回调封装（与V1.1 TaskTab.tsx 完全一致） ==========
const handleViewDetail = (task) => {
  if (props.onViewTask) props.onViewTask(task.id)
}
const handleAccept = (task) => {
  if (props.onAccept) props.onAccept(task)
}
const handleWithdraw = (task) => {
  if (props.onWithdraw) props.onWithdraw(task)
}
const handleCancel = (task) => {
  if (props.onCancel) props.onCancel(task)
}
const handleOvertime = (task) => {
  if (props.onOvertime) props.onOvertime(task)
}
const handleContinue = (taskId) => {
  if (props.onContinue) props.onContinue(taskId)
}
const handleReassign = (task) => {
  if (props.onReassign) props.onReassign(task)
}
const handleSelectExecutor = (task) => {
  if (props.onSelectExecutor) props.onSelectExecutor(task)
}
const handlePublish = (task) => {
  if (props.onPublish) props.onPublish(task)
}

// ========== 行选择（通过索引映射到任务ID） ==========
const handleSelectRow = (index) => {
  const task = filteredTasks.value[index]
  if (task) props.onToggleSelect(task.id)
}

// ========== 全选（根据当前模式选中符合条件的任务） ==========
const handleSelectAll = () => {
  const mode = toolbarMode.value
  if (mode === 'normal' || mode === 'export' || mode === 'batchDelete') {
    filteredTasks.value.forEach(task => {
      if (!props.selectedIds.includes(task.id)) props.onToggleSelect(task.id)
    })
  } else if (mode === 'batchEdit') {
    filteredTasks.value.forEach(task => {
      if (EDITABLE_STATUSES.includes(task.status) && !props.selectedIds.includes(task.id)) {
        props.onToggleSelect(task.id)
      }
    })
  } else if (mode === 'batchDispatch') {
    filteredTasks.value.forEach(task => {
      if (BATCH_DISPATCH_STATUSES.includes(task.status) && !props.selectedIds.includes(task.id)) {
        props.onToggleSelect(task.id)
      }
    })
  } else if (mode === 'batchVerify') {
    filteredTasks.value.forEach(task => {
      if (BATCH_ACCEPT_STATUSES.includes(task.status) && !props.selectedIds.includes(task.id)) {
        props.onToggleSelect(task.id)
      }
    })
  } else if (mode === 'batchReassign') {
    filteredTasks.value.forEach(task => {
      if (BATCH_REASSIGN_STATUSES.includes(task.status) && !props.selectedIds.includes(task.id)) {
        props.onToggleSelect(task.id)
      }
    })
  }
}

// ========== 批量操作确认 ==========
const handleConfirmExport = () => {
  if (props.onExport && props.selectedIds.length > 0) {
    props.onExport(props.selectedIds)
  }
  toolbarMode.value = 'normal'
}
const handleConfirmBatchEdit = () => {
  if (props.onBatchEdit && props.selectedIds.length > 0) {
    props.onBatchEdit(props.selectedIds)
  }
  toolbarMode.value = 'normal'
  props.onClearSelection()
}
const handleConfirmBatchDelete = () => {
  if (props.onBatchDelete && props.selectedIds.length > 0) {
    props.onBatchDelete(props.selectedIds)
  }
  toolbarMode.value = 'normal'
  props.onClearSelection()
}
const handleConfirmBatchDispatch = () => {
  if (props.onBatchDispatch && props.selectedIds.length > 0) {
    props.onBatchDispatch(props.selectedIds)
  }
  toolbarMode.value = 'normal'
  props.onClearSelection()
}
const handleConfirmBatchVerify = () => {
  if (props.onBatchVerify && props.selectedIds.length > 0) {
    props.onBatchVerify(props.selectedIds)
  }
  toolbarMode.value = 'normal'
  props.onClearSelection()
}
const handleConfirmBatchReassign = () => {
  if (props.onBatchReassign && props.selectedIds.length > 0) {
    props.onBatchReassign(props.selectedIds)
  }
  toolbarMode.value = 'normal'
  props.onClearSelection()
}

// ========== 分页 ==========
const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// ========== 催办功能（优先使用父组件传入的 canRemind，降级使用兜底） ==========
const canRemindFn = (taskId) => {
  if (typeof props.canRemind === 'function') {
    return props.canRemind(taskId)
  }
  return { allowed: true }
}

const sendReminderFn = (taskId, taskCode, assigneeId, assigneeName, senderId, senderName) => {
  const task = props.tasks.find(t => t.id === taskId)
  if (task && props.onRemind) {
    props.onRemind(task)
  }
}
</script>
