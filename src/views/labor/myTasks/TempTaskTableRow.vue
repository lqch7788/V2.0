<!--
  临时任务表格行
  对标 V1.1 src/components/labor/myTasks/TempTaskTableRow.tsx
-->
<template>
  <div class="temp-task-row bg-white rounded-xl p-4 shadow-sm mb-2">
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-2">
        <el-tag type="warning" size="small">临时</el-tag>
        <span class="font-mono text-xs text-gray-500">{{ task.code }}</span>
      </div>
      <el-tag :type="statusTagType(task.status)" size="small">{{ statusText(task.status) }}</el-tag>
    </div>
    <h4 class="font-semibold text-gray-900 mb-1">{{ task.title }}</h4>
    <p class="text-sm text-gray-500 mb-2">{{ task.description }}</p>
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-500">{{ task.estimatedHours }} 小时</span>
      <div class="flex items-center gap-2">
        <el-button link type="primary" size="small" @click="$emit('view', task)">查看</el-button>
        <el-button link type="success" size="small" @click="$emit('feedback', task)">反馈</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: { type: Object, required: true },
})

defineEmits(['view', 'feedback'])

const STATUS_MAP = {
  pending: { tag: 'warning', text: '待审批' },
  approved: { tag: 'success', text: '已通过' },
  executing: { tag: 'primary', text: '执行中' },
  completed: { tag: 'success', text: '已完成' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>