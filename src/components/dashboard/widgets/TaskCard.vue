<template>
  <div class="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- 标题和优先级 -->
        <div class="flex items-center gap-2">
          <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
          <span :class="['text-xs px-2 py-0.5 rounded-full', getPriorityColor(task.priority)]">
            {{ getPriorityText(task.priority) }}
          </span>
        </div>

        <!-- 大棚名称 -->
        <p class="text-sm text-gray-500 mt-1">{{ task.greenhouseName }}</p>

        <!-- 日期和时长 -->
        <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span class="flex items-center gap-1">
            <el-icon><Calendar /></el-icon>
            {{ task.dueDate }}
          </span>
          <span class="flex items-center gap-1">
            <el-icon><Clock /></el-icon>
            {{ task.workDuration }}小时
          </span>
        </div>
      </div>

      <!-- 状态和负责人 -->
      <div class="flex flex-col items-end gap-2">
        <span :class="['text-xs px-2 py-1 rounded-full', getStatusColor(task.status)]">
          {{ getStatusText(task.status) }}
        </span>
        <span class="text-xs text-gray-500">{{ task.assigneeName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Clock } from '@element-plus/icons-vue'

defineProps({})

const getPriorityColor = (priority) => {
  const colors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700'
  }
  return colors[priority] || 'bg-gray-100 text-gray-700'
}

const getPriorityText = (priority) => {
  const texts = {
    high: '紧急',
    medium: '重要',
    low: '一般'
  }
  return texts[priority] || priority
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待执行',
    in_progress: '进行中',
    completed: '已完成'
  }
  return texts[status] || status
}
</script>
