/**
 * 人效分析 composable
 * 对标 V1.1 src/components/labor/efficiency/hooks/useEfficiency.ts
 */
import { ref, computed } from 'vue'

const MOCK_DATA = [
  { id: '1', date: '2024-01', department: '生产部', totalWorkers: 25, totalOutput: 50000, avgOutputPerWorker: 2000, totalHours: 5000, avgEfficiency: 0.85, taskCompletionRate: 0.92, attendanceRate: 0.96, laborCostRate: 0.35, skillCoverage: 0.85 },
  { id: '2', date: '2024-02', department: '生产部', totalWorkers: 25, totalOutput: 52000, avgOutputPerWorker: 2080, totalHours: 5000, avgEfficiency: 0.87, taskCompletionRate: 0.93, attendanceRate: 0.97, laborCostRate: 0.34, skillCoverage: 0.86 },
  { id: '3', date: '2024-03', department: '生产部', totalWorkers: 25, totalOutput: 55000, avgOutputPerWorker: 2200, totalHours: 5000, avgEfficiency: 0.90, taskCompletionRate: 0.95, attendanceRate: 0.95, laborCostRate: 0.33, skillCoverage: 0.88 },
  { id: '4', date: '2024-01', department: '技术部', totalWorkers: 12, totalOutput: 30000, avgOutputPerWorker: 2500, totalHours: 2400, avgEfficiency: 0.92, taskCompletionRate: 0.94, attendanceRate: 0.98, laborCostRate: 0.40, skillCoverage: 0.90 },
  { id: '5', date: '2024-02', department: '技术部', totalWorkers: 12, totalOutput: 31000, avgOutputPerWorker: 2583, totalHours: 2400, avgEfficiency: 0.93, taskCompletionRate: 0.95, attendanceRate: 0.98, laborCostRate: 0.39, skillCoverage: 0.91 },
]

export function useEfficiency() {
  const data = ref([...MOCK_DATA])

  const filters = ref({
    startDate: '2023-05',
    endDate: '2024-04',
    department: '全部',
  })

  const departments = computed(() => ['全部', ...new Set(data.value.map((d) => d.department))])

  const trendData = computed(() =>
    data.value.map((d) => ({ date: d.date, value: d.avgOutputPerWorker }))
  )

  const summaryMetrics = computed(() => {
    const total = data.value.reduce(
      (acc, d) => ({
        totalOutput: acc.totalOutput + d.totalOutput,
        totalHours: acc.totalHours + d.totalHours,
        totalWorkers: Math.max(acc.totalWorkers, d.totalWorkers),
      }),
      { totalOutput: 0, totalHours: 0, totalWorkers: 0 }
    )
    return {
      totalOutput: total.totalOutput,
      avgOutput: total.totalWorkers ? (total.totalOutput / total.totalWorkers).toFixed(1) : 0,
      avgEfficiency: data.value.length
        ? (data.value.reduce((s, d) => s + d.avgEfficiency, 0) / data.value.length * 100).toFixed(1) + '%'
        : '0%',
      taskRate: data.value.length
        ? (data.value.reduce((s, d) => s + d.taskCompletionRate, 0) / data.value.length * 100).toFixed(1) + '%'
        : '0%',
      attendanceRate: data.value.length
        ? (data.value.reduce((s, d) => s + d.attendanceRate, 0) / data.value.length * 100).toFixed(1) + '%'
        : '0%',
    }
  })

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    data,
    trendData,
    summaryMetrics,
    filters,
    departments,
    updateFilters,
  }
}