<!--
  PredictedTasksPanel.vue - 预测任务面板
  V1.1 SmartDispatch.tsx PredictedTasksPanel 1:1 对齐
-->
<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <el-icon color="#f59e0b"><Lightning /></el-icon>
        预测任务
      </h3>
      <span class="text-xs text-gray-500">{{ tasks.length }} 项</span>
    </div>

    <div v-if="tasks.length === 0" class="text-xs text-gray-400 py-4 text-center">
      暂无预测任务
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="task in tasks.slice(0, 5)"
        :key="task.id"
        class="p-2 rounded hover:bg-amber-50 cursor-pointer flex items-center justify-between"
      >
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium text-gray-900 truncate">{{ task.title }}</div>
          <div class="text-xs text-gray-500">
            {{ task.predictedDate || task.estimatedDate }} · {{ task.typeName }}
          </div>
        </div>
        <span class="px-2 py-0.5 text-xs rounded" :class="priorityClass(task.priority)">
          {{ priorityLabel(task.priority) }}
        </span>
      </div>
    </div>

    <div v-if="overdueTasks?.length" class="mt-3 pt-3 border-t border-gray-100">
      <div class="text-xs text-red-600 mb-2">⚠️ 超期任务 {{ overdueTasks.length }} 项</div>
      <div v-for="t in overdueTasks.slice(0, 3)" :key="t.id" class="text-xs text-gray-600 mb-1">
        {{ t.title }} - 已超期 {{ t.overdueDays || 1 }} 天
      </div>
    </div>

    <div v-if="pestAlerts?.length" class="mt-3 pt-3 border-t border-gray-100">
      <div class="text-xs text-amber-600 mb-2">🐛 病虫害预警</div>
      <div v-for="(a, i) in pestAlerts.slice(0, 3)" :key="i" class="text-xs text-gray-600 mb-1">
        {{ a.message || a }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Lightning } from '@element-plus/icons-vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  overdueTasks: { type: Array, default: () => [] },
  pestAlerts: { type: Array, default: () => [] },
})

function priorityClass(p) {
  return { urgent: 'bg-red-100 text-red-700', high: 'bg-amber-100 text-amber-700', normal: 'bg-blue-100 text-blue-700', low: 'bg-gray-100 text-gray-700' }[p] || 'bg-gray-100 text-gray-700'
}
function priorityLabel(p) {
  return { urgent: '紧急', high: '高', normal: '一般', low: '低' }[p] || '一般'
}
</script>
