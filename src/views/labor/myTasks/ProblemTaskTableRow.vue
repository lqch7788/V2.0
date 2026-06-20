<!--
  问题任务表格行
  对标 V1.1 src/components/labor/myTasks/ProblemTaskTableRow.tsx
-->
<template>
  <div class="problem-task-row bg-white rounded-xl p-4 shadow-sm mb-2">
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-2">
        <el-tag type="danger" size="small">问题</el-tag>
        <span class="font-mono text-xs text-gray-500">{{ task.code }}</span>
      </div>
      <span class="text-xs text-gray-400">{{ task.plannedDate }}</span>
    </div>
    <h4 class="font-semibold text-gray-900 mb-1">{{ task.title }}</h4>
    <p class="text-sm text-gray-500 mb-2">{{ task.description }}</p>
    <div class="flex items-center justify-between text-xs">
      <span class="flex items-center gap-1 text-gray-500">
        <el-icon><User /></el-icon>
        {{ task.executorName }}
      </span>
      <div class="flex items-center gap-2">
        <el-button link type="primary" size="small" @click="$emit('view', task)">查看</el-button>
        <el-button link type="warning" size="small" @click="$emit('resolve', task)">整改</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User } from '@element-plus/icons-vue'

defineProps({
  task: { type: Object, required: true },
})

defineEmits(['view', 'resolve'])
</script>