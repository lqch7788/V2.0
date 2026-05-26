<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 表头 + 操作按钮 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-semibold text-gray-900">农事任务表</h3>
        <!-- 统计信息 -->
        <div v-if="stats" class="flex items-center gap-2 text-sm">
          <span class="text-gray-500">共</span>
          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold rounded">{{ stats.total }}</span>
          <span class="text-gray-500">条</span>
          <span class="text-amber-600">| 待执行 {{ stats.pending }}</span>
          <span class="text-blue-600">| 进行中 {{ stats.inProgress }}</span>
          <span class="text-green-600">| 已完成 {{ stats.completed }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <el-button type="success" size="small" @click="onConfirmExport" :disabled="selectedIds.length === 0">确认导出</el-button>
          <el-button size="small" @click="onCancelExport">取消</el-button>
        </template>
        <!-- 批量编辑模式 -->
        <template v-else-if="batchEditMode">
          <el-button type="primary" size="small" @click="onConfirmBatchEdit" :disabled="selectedIds.length === 0">确认编辑</el-button>
          <el-button size="small" @click="onCancelBatchEdit">取消</el-button>
        </template>
        <!-- 批量删除模式 -->
        <template v-else-if="batchDeleteMode">
          <el-button type="danger" size="small" @click="onConfirmBatchDelete" :disabled="selectedIds.length === 0">确认删除</el-button>
          <el-button size="small" @click="onCancelBatchDelete">取消</el-button>
        </template>
        <!-- 批量派发模式 -->
        <template v-else-if="batchDispatchMode">
          <el-button size="small" @click="onConfirmBatchDispatch" :disabled="selectedIds.length === 0" class="bg-purple-600 text-white hover:bg-purple-700">确认派发</el-button>
          <el-button size="small" @click="onCancelBatchDelete">取消</el-button>
        </template>
        <!-- 批量验收模式 -->
        <template v-else-if="batchVerifyMode">
          <el-button type="success" size="small" @click="onConfirmBatchVerify" :disabled="selectedIds.length === 0">确认验收</el-button>
          <el-button size="small" @click="onCancelBatchDelete">取消</el-button>
        </template>
        <!-- 批量重派模式 -->
        <template v-else-if="batchReassignMode">
          <el-button type="warning" size="small" @click="onConfirmBatchReassign" :disabled="selectedIds.length === 0">确认重派</el-button>
          <el-button size="small" @click="onCancelBatchReassign">取消</el-button>
        </template>
        <!-- 正常模式按钮 -->
        <template v-else>
          <el-button v-if="onCreate" type="success" size="small" @click="onCreate">新建</el-button>
          <el-button v-if="onBatchEdit" type="primary" size="small" @click="onBatchEdit">编辑</el-button>
          <el-button v-if="onBatchDelete" type="danger" size="small" @click="onBatchDelete">删除</el-button>
          <!-- 更多操作下拉 -->
          <div v-if="hasMoreActions" class="relative" ref="moreActionsRef">
            <el-button size="small" @click="showMoreActions = !showMoreActions">
              更多
              <el-icon class="el-icon--right">
                <ArrowUp v-if="showMoreActions" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
            <div v-if="showMoreActions" class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1.5 flex items-center gap-1">
              <el-button v-if="onBatchDispatch" size="small" @click="onBatchDispatch(); showMoreActions = false;" class="bg-purple-600 text-white hover:bg-purple-700 whitespace-nowrap">派发</el-button>
              <el-button v-if="onBatchVerify" type="success" size="small" @click="onBatchVerify(); showMoreActions = false;" class="whitespace-nowrap">验收</el-button>
              <el-button v-if="onBatchReassign" type="warning" size="small" @click="onBatchReassign(); showMoreActions = false;" class="whitespace-nowrap">重派</el-button>
              <el-button v-if="onExport" type="success" size="small" @click="onExport(); showMoreActions = false;" class="whitespace-nowrap">导出</el-button>
              <el-button v-if="onImport" type="primary" size="small" @click="onImport(); showMoreActions = false;" class="whitespace-nowrap">导入</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <TaskTableHeader
            :export-mode="exportMode"
            :batch-edit-mode="batchEditMode"
            :batch-delete-mode="batchDeleteMode"
            :batch-dispatch-mode="batchDispatchMode"
            :batch-verify-mode="batchVerifyMode"
            :batch-reassign-mode="batchReassignMode"
            :is-all-selected="isAllSelected"
            :is-some-selected="isSomeSelected"
            :on-select-all="onSelectAll"
          />
        </thead>
        <tbody class="divide-y divide-gray-300">
          <TaskTableRow
            v-for="(task, index) in paginatedTasks"
            :key="task.id"
            :task="task"
            :index="index"
            :show-checkbox="showCheckbox"
            :is-selected="selectedIds.includes(task.id)"
            :is-selectable="getSelectable(task)"
            :selectable-reason="getSelectableReason(task)"
            :on-select="() => handleRowSelect(index)"
            :on-view-detail="() => onViewDetail(task)"
            :on-view-sop="onViewSop ? () => onViewSop(task) : undefined"
            :on-accept="onAccept ? () => onAccept(task) : undefined"
            :on-withdraw="onWithdraw ? () => onWithdraw(task) : undefined"
            :on-cancel="onCancel ? () => onCancel(task) : undefined"
            :on-overtime="onOvertime ? () => onOvertime(task) : undefined"
            :on-continue="onContinue ? () => onContinue(task.id) : undefined"
            :on-reassign="onReassign ? () => onReassign(task) : undefined"
            :on-select-executor="onSelectExecutor ? () => onSelectExecutor(task) : undefined"
            :on-publish="onPublish ? () => onPublish(task) : undefined"
            :is-my-tasks-view="isMyTasksView"
            :can-remind="canRemind"
            :send-reminder="sendReminder"
          />
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <Pagination
      :model-value="{ currentPage, pageSize }"
      :total="totalCount"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="onPageChange"
      @size-change="onPageSizeChange"
    />

    <!-- 导出模式底部栏 -->
    <div v-if="exportMode" class="flex items-center gap-4 px-4 py-3 border-t border-gray-100">
      <span class="text-sm text-gray-500">{{ selectedIds.length === tasks.length ? '全不选' : '全选' }}</span>
      <span class="text-sm text-gray-500">已选择 {{ selectedIds.length }} 项</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 任务表格组件
 * 整合表头、行、分页器，是整个任务表格的容器组件
 * 对应 V1.1 TaskTable.tsx 1:1 映射
 */
import { ref, computed } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { EDITABLE_STATUSES, STATUS_MAP } from '@/constants/taskDispatch'
import TaskTableHeader from './TaskTableHeader.vue'
import TaskTableRow from './TaskTableRow.vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

const props = defineProps({
  /** 任务数据列表 */
  tasks: { type: Array, default: () => [] },
  /** 统计信息 */
  stats: { type: Object, default: undefined },
  /** 当前页码 */
  currentPage: { type: Number, default: 1 },
  /** 每页条数 */
  pageSize: { type: Number, default: 10 },
  /** 已选中任务ID列表 */
  selectedIds: { type: Array, default: () => [] },
  /** 批量导出模式 */
  exportMode: { type: Boolean, default: false },
  /** 批量编辑模式 */
  batchEditMode: { type: Boolean, default: false },
  /** 批量删除模式 */
  batchDeleteMode: { type: Boolean, default: false },
  /** 批量派发模式 */
  batchDispatchMode: { type: Boolean, default: false },
  /** 批量验收模式 */
  batchVerifyMode: { type: Boolean, default: false },
  /** 批量重派模式 */
  batchReassignMode: { type: Boolean, default: false },
  /** 检查是否可催办的函数 */
  canRemind: { type: Function, default: () => ({ allowed: false }) },
  /** 发送催办消息的函数 */
  sendReminder: { type: Function, default: () => {} },
  /** 选择行回调 */
  onSelectRow: { type: Function, default: () => {} },
  /** 全选回调 */
  onSelectAll: { type: Function, default: () => {} },
  /** 查看详情回调 */
  onViewDetail: { type: Function, default: () => {} },
  /** 查看SOP回调 */
  onViewSop: { type: Function, default: undefined },
  /** 接受任务回调 */
  onAccept: { type: Function, default: undefined },
  /** 拒绝/撤回回调 */
  onWithdraw: { type: Function, default: undefined },
  /** 取消任务回调 */
  onCancel: { type: Function, default: undefined },
  /** 超时处理回调 */
  onOvertime: { type: Function, default: undefined },
  /** 继续执行回调 */
  onContinue: { type: Function, default: undefined },
  /** 重新派发回调 */
  onReassign: { type: Function, default: undefined },
  /** 选择执行人回调 */
  onSelectExecutor: { type: Function, default: undefined },
  /** 发布回调 */
  onPublish: { type: Function, default: undefined },
  /** 是否为"我的任务"视图 */
  isMyTasksView: { type: Boolean, default: false },
  /** 分页切换回调 */
  onPageChange: { type: Function, default: () => {} },
  /** 每页条数切换回调 */
  onPageSizeChange: { type: Function, default: () => {} },
  /** 确认导出回调 */
  onConfirmExport: { type: Function, default: undefined },
  /** 取消导出回调 */
  onCancelExport: { type: Function, default: undefined },
  /** 批量编辑回调 */
  onBatchEdit: { type: Function, default: undefined },
  /** 确认批量编辑回调 */
  onConfirmBatchEdit: { type: Function, default: undefined },
  /** 取消批量编辑回调 */
  onCancelBatchEdit: { type: Function, default: undefined },
  /** 取消批量删除回调 */
  onCancelBatchDelete: { type: Function, default: undefined },
  /** 批量删除回调 */
  onBatchDelete: { type: Function, default: undefined },
  /** 确认批量删除回调 */
  onConfirmBatchDelete: { type: Function, default: undefined },
  /** 批量派发回调 */
  onBatchDispatch: { type: Function, default: undefined },
  /** 确认批量派发回调 */
  onConfirmBatchDispatch: { type: Function, default: undefined },
  /** 批量验收回调 */
  onBatchVerify: { type: Function, default: undefined },
  /** 确认批量验收回调 */
  onConfirmBatchVerify: { type: Function, default: undefined },
  /** 批量重派回调 */
  onBatchReassign: { type: Function, default: undefined },
  /** 确认批量重派回调 */
  onConfirmBatchReassign: { type: Function, default: undefined },
  /** 取消批量重派回调 */
  onCancelBatchReassign: { type: Function, default: undefined },
  /** 导出回调 */
  onExport: { type: Function, default: undefined },
  /** 导入回调 */
  onImport: { type: Function, default: undefined },
  /** 新建回调 */
  onCreate: { type: Function, default: undefined },
})

/** 更多操作下拉可见性 */
const showMoreActions = ref(false)

/** 是否有更多操作（派发/验收/重派/导出/导入） */
const hasMoreActions = computed(() =>
  props.onBatchDispatch || props.onBatchVerify || props.onBatchReassign || props.onExport || props.onImport
)

/** 任务总数 */
const totalCount = computed(() => props.tasks.length)

/** 当前页数据（分页切片） */
const paginatedTasks = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return props.tasks.slice(start, start + props.pageSize)
})

/** 是否显示复选框 */
const showCheckbox = computed(() =>
  props.exportMode || props.batchEditMode || props.batchDeleteMode ||
  props.batchDispatchMode || props.batchVerifyMode || props.batchReassignMode
)

/** 当前页可编辑的任务ID列表（批量编辑模式时只包含可编辑状态） */
const currentPageEditableIds = computed(() => {
  if (props.batchEditMode) {
    return paginatedTasks.value
      .filter(task => EDITABLE_STATUSES.includes(task.status))
      .map(task => task.id)
  }
  return paginatedTasks.value.map(task => task.id)
})

/** 是否全选（当前页所有可编辑任务都被选中） */
const isAllSelected = computed(() =>
  currentPageEditableIds.value.length > 0 &&
  currentPageEditableIds.value.every(id => props.selectedIds.includes(id))
)

/** 是否部分选中 */
const isSomeSelected = computed(() =>
  currentPageEditableIds.value.some(id => props.selectedIds.includes(id)) ||
  props.selectedIds.length > 0
)

/** 判断任务是否可选中 */
const getSelectable = (task) => {
  if (props.batchEditMode && !EDITABLE_STATUSES.includes(task.status)) {
    return false
  }
  return true
}

/** 获取不可选中时的原因文字 */
const getSelectableReason = (task) => {
  if (props.batchEditMode && !EDITABLE_STATUSES.includes(task.status)) {
    const statusName = STATUS_MAP[task.status]?.label || task.status
    return `${statusName}状态不支持此操作`
  }
  return undefined
}

/** 处理行选择 */
const handleRowSelect = (index) => {
  props.onSelectRow(index)
}
</script>
