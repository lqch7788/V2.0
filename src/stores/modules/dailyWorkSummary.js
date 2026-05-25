/**
 * 每日工单汇总 Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDailyWorkSummaryStore = defineStore('dailyWorkSummary', () => {
  const summaries = ref([])
  const loading = ref(false)
  const filters = ref({
    date: '',
    greenhouse: '',
    taskType: '',
  })

  const filteredSummaries = computed(() => {
    return summaries.value.filter(s => {
      if (filters.value.date && s.date !== filters.value.date) return false
      if (filters.value.greenhouse && filters.value.greenhouse !== '全部' &&
        !s.greenhouse?.includes(filters.value.greenhouse)) return false
      if (filters.value.taskType && filters.value.taskType !== '全部' &&
        !s.taskType?.includes(filters.value.taskType)) return false
      return true
    })
  })

  const stats = computed(() => {
    const total = filteredSummaries.value.length
    const completed = filteredSummaries.value.filter(s => s.status === '已完成').length
    const inProgress = filteredSummaries.value.filter(s =>
      ['已接受', '处理中', '返工中'].includes(s.status)
    ).length
    const pending = filteredSummaries.value.filter(s => s.status === '待接受').length
    return { total, completed, inProgress, pending }
  })

  const filterOptions = computed(() => {
    const greenhouses = [...new Set(summaries.value.map(s => s.greenhouse).filter(Boolean))]
    const taskTypes = [...new Set(summaries.value.map(s => s.taskType).filter(Boolean))]
    return {
      dates: [{ value: '', label: '全部' }, ...[...new Set(summaries.value.map(s => s.date))].map(d => ({ value: d, label: d }))],
      greenhouses: [{ value: '', label: '全部' }, ...greenhouses.map(g => ({ value: g, label: g }))],
      taskTypes: [{ value: '', label: '全部' }, ...taskTypes.map(t => ({ value: t, label: t }))],
    }
  })

  const setFilter = (key, value) => {
    filters.value[key] = value
  }

  return {
    summaries,
    loading,
    filters,
    filteredSummaries,
    stats,
    filterOptions,
    setFilter,
  }
})
