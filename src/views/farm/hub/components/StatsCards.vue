<!--
  农场 Hub 统计卡片
  对标 V1.1 src/components/farm/hub/components/StatsCards.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="stat in stats" :key="stat.key" class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="stat.bgClass">
          <el-icon :size="20" :color="stat.color"><component :is="stat.icon" /></el-icon>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CircleCheck, Clock, DataAnalysis, WarningFilled } from '@element-plus/icons-vue'

defineProps({
  total: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  overdue: { type: Number, default: 0 },
})

const stats = [
  { key: 'total', label: '总任务', icon: DataAnalysis, color: '#059669', bgClass: 'bg-emerald-50' },
  { key: 'pending', label: '待执行', icon: Clock, color: '#f59e0b', bgClass: 'bg-amber-50' },
  { key: 'completed', label: '已完成', icon: CircleCheck, color: '#3b82f6', bgClass: 'bg-blue-50' },
  { key: 'overdue', label: '已超时', icon: WarningFilled, color: '#ef4444', bgClass: 'bg-red-50' },
]
</script>