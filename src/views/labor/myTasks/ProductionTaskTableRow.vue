<!--
  生产任务表格行
  对标 V1.1 src/components/labor/myTasks/ProductionTaskTableRow.tsx
-->
<template>
  <div class="production-task-row bg-white rounded-xl p-4 shadow-sm mb-2">
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-2">
        <el-tag type="primary" size="small">生产</el-tag>
        <span class="font-mono text-xs text-gray-500">{{ task.code }}</span>
      </div>
      <el-tag :type="statusTagType(task.status)" size="small">{{ statusText(task.status) }}</el-tag>
    </div>
    <h4 class="font-semibold text-gray-900 mb-1">{{ task.title }}</h4>
    <div class="text-sm text-gray-500 mb-2">
      <span>数量：{{ task.quantity }} {{ task.unit || '件' }}</span>
      <span class="ml-3">截止：{{ task.deadline || task.plannedDate }}</span>
    </div>
    <div class="flex items-center justify-between text-xs">
      <span class="flex items-center gap-1 text-gray-500">
        <el-icon><User /></el-icon>
        {{ task.executorName }}
      </span>
      <div class="flex items-center gap-2">
        <el-button link type="primary" size="small" @click="$emit('view', task)">查看</el-button>
        <el-button link type="success" size="small" @click="$emit('feedback', task)">反馈</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User } from '@element-plus/icons-vue'

defineProps({
  task: { type: Object, required: true },
})

defineEmits(['view', 'feedback'])

const STATUS_MAP = {
  pending: { tag: 'warning', text: '待执行' },
  executing: { tag: 'primary', text: '执行中' },
  completed: { tag: 'success', text: '已完成' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>