<!--
  TaskDetailModal.vue - 任务详情弹窗
  V1.1 TaskDetailModal.tsx 1:1 迁移（14 区块）
-->
<template>
  <el-dialog
    :model-value="!!task"
    @update:model-value="(v) => !v && emit('close')"
    title="任务详情"
    width="780px"
    destroy-on-close
    top="3vh"
  >
    <div v-if="task" class="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin space-y-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">任务编号</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.taskCode }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">任务类型</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.typeName || task.type }}</p>
        </div>
        <div class="col-span-2">
          <p class="text-xs text-gray-500 uppercase tracking-wide">任务标题</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.title }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">所属批次</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.batchCode || '-' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">作业区域</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.greenhouseName || '-' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">执行人</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.assigneeName || '-' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">派单人</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.assignerName || '-' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">截止时间</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.dueDate || '-' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">预计工时</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ task.workDuration || task.estimatedHours || 0 }} 小时</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">优先级</p>
          <div class="mt-1">
            <TaskPriorityBadge :priority="task.priority" />
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">状态</p>
          <div class="mt-1">
            <TaskStatusBadge :status="task.status" />
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">任务模式</p>
          <p class="text-sm font-medium text-gray-900 mt-1">{{ modeText(task.mode) }}</p>
        </div>
        <div class="col-span-2">
          <p class="text-xs text-gray-500 uppercase tracking-wide">任务描述</p>
          <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{{ task.description || '-' }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
      <el-button v-if="task && task.status !== 'completed'" type="primary" @click="emit('confirm-complete', task)">
        确认完成
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import TaskStatusBadge from './TaskStatusBadge.vue'
import TaskPriorityBadge from './TaskPriorityBadge.vue'

defineProps({ task: { type: Object, default: null } })
const emit = defineEmits(['close', 'confirm-complete'])

function modeText(mode) {
  return { glass: '玻璃温室', solar: '日光温室', field: '大田', dispatch: '派工', self: '自主' }[mode] || mode || '-'
}
</script>