/**
 * 日工单分析 Composable（V2.0）
 * V1.1 1:1 接口对齐：useDailyWorkOrderAnalysis.ts
 */
import { ref, computed } from 'vue'

export function useDailyWorkOrderAnalysis() {
  const todayWorkOrders = ref([])
  const todaySummary = ref({ total: 0, completed: 0, inProgress: 0, pending: 0 })

  const analysis = computed(() => ({
    completionRate: todaySummary.value.total > 0
      ? (todaySummary.value.completed / todaySummary.value.total) * 100
      : 0,
    avgDuration: 4.5,
  }))

  return {
    todayWorkOrders,
    todaySummary,
    analysis,
  }
}
