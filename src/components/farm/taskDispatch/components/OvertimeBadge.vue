<template>
  <!-- 超时标记 - 从V1.1 OvertimeBadge.tsx 1:1迁移 -->
  <span
    v-if="isOvertime"
    class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded bg-red-50 text-red-600 border border-red-200"
  >
    <el-icon :size="12"><Clock /></el-icon>
    超时{{ overtimeHours }}h
  </span>
  <span v-else class="text-xs text-gray-400">-</span>
</template>

<script setup>
import { computed } from 'vue'
import { Clock } from '@element-plus/icons-vue'

const props = defineProps({
  /** 计划完成时间 */
  plannedEndTime: { type: String, default: '' },
  /** 实际完成时间 */
  actualEndTime: { type: String, default: '' },
  /** 任务状态 */
  status: { type: String, default: '' },
})

const isOvertime = computed(() => {
  if (!props.plannedEndTime) return false
  const now = props.actualEndTime ? new Date(props.actualEndTime) : new Date()
  const planned = new Date(props.plannedEndTime)
  return now > planned && !['completed', 'cancelled', 'abandoned'].includes(props.status)
})

const overtimeHours = computed(() => {
  if (!isOvertime.value || !props.plannedEndTime) return 0
  const now = props.actualEndTime ? new Date(props.actualEndTime) : new Date()
  const planned = new Date(props.plannedEndTime)
  return Math.round((now - planned) / (1000 * 60 * 60) * 10) / 10
})
</script>
