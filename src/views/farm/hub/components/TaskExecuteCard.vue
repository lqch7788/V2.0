<!--
  任务执行卡片
  对标 V1.1 src/components/farm/taskDispatch/components/TaskExecuteCard.tsx
-->
<template>
  <div class="task-execute-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <el-tag :type="priorityTagType(task.priority)" size="small">{{ priorityText(task.priority) }}</el-tag>
        <span class="text-xs text-gray-500">{{ task.code }}</span>
      </div>
      <el-tag :type="statusTagType(task.status)" size="small">{{ statusText(task.status) }}</el-tag>
    </div>
    <h4 class="font-semibold text-gray-900 mb-2">{{ task.title }}</h4>
    <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ task.description || '暂无描述' }}</p>
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span class="flex items-center gap-1">
        <el-icon><User /></el-icon>
        {{ task.executorName }}
      </span>
      <span class="flex items-center gap-1">
        <el-icon><Clock /></el-icon>
        {{ task.plannedDate }}
      </span>
    </div>
    <div class="mt-3 flex items-center gap-2">
      <el-button size="small" type="primary" @click="$emit('execute', task)">
        <el-icon><VideoPlay /></el-icon>
        执行
      </el-button>
      <el-button size="small" @click="$emit('view', task)">详情</el-button>
    </div>
  </div>
</template>

<script setup>
import { Clock, User, VideoPlay } from '@element-plus/icons-vue'

defineProps({
  task: { type: Object, required: true },
})

defineEmits(['execute', 'view'])

const PRIORITY_MAP = { urgent: { tag: 'danger', text: '加急' }, high: { tag: 'warning', text: '高' }, normal: { tag: 'info', text: '普通' } }
const STATUS_MAP = {
  pending: { tag: 'warning', text: '待执行' },
  executing: { tag: 'primary', text: '执行中' },
  completed: { tag: 'success', text: '已完成' },
  overdue: { tag: 'danger', text: '已超时' },
}

const priorityTagType = (p) => PRIORITY_MAP[p]?.tag || ''
const priorityText = (p) => PRIORITY_MAP[p]?.text || p
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>

<style scoped>
.task-execute-card .line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>