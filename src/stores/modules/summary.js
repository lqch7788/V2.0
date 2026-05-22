/**
 * 生产汇总数据 Pinia Store
 *
 * 架构：API → Store → 组件
 * 数据流：Store → 组件
 *
 * 对接后端：
 * - /api/summary/overview     → 生产报表概览
 * - /api/summary/yield-stats  → 产量统计
 * - /api/summary/cost-stats   → 成本统计
 * - /api/summary/labor-stats  → 人工统计
 * - /api/summary/batch-stats  → 批次汇总
 * - /api/summary/indicators   → 生产指标
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ============================================
// 工具函数
// ============================================

/**
 * 规范化批次数据
 */
function normalizeBatch(db) {
  return {
    id: db.id,
    batchCode: db.batchCode,
    batchName: db.batchName,
    cropName: db.cropName,
    variety: db.variety,
    greenhouse: db.greenhouse,
    plantingArea: db.plantingArea,
    targetYield: Number(db.targetYield) || 0,
    actualQuantity: Number(db.actualQuantity) || 0,
    harvestQuantity: Number(db.harvestQuantity) || 0,
    completionRate: Number(db.completionRate) || 0,
    status: db.status,
    plantingDate: db.plantingDate,
    expectedHarvestDate: db.expectedHarvestDate,
    actualHarvestDate: db.actualHarvestDate,
    taskCount: Number(db.taskCount) || 0,
    completedTaskCount: Number(db.completedTaskCount) || 0,
    pendingTaskCount: Number(db.pendingTaskCount) || 0,
    inProgressTaskCount: Number(db.inProgressTaskCount) || 0,
    totalWorkHours: Number(db.totalWorkHours) || 0,
    laborCost: Number(db.laborCost) || 0,
    remainingYield: Number(db.remainingYield) || 0
  }
}

/**
 * 规范化产量统计数据项
 */
function normalizeYieldItem(db) {
  return {
    name: db.name,
    value: Number(db.value) || 0,
    count: Number(db.count) || 0,
    year: db.year,
    month: db.month
  }
}

/**
 * 规范化概览数据
 */
function normalizeOverview(db) {
  return {
    yield: {
      monthHarvestCount: Number(db.yield?.monthHarvestCount || db.yield?.month_harvest_count) || 0,
      monthTotalYield: Number(db.yield?.monthTotalYield || db.yield?.month_total_yield) || 0,
      monthTotalAmount: Number(db.yield?.monthTotalYield || db.yield?.month_total_amount) || 0
    },
    task: {
      totalTasks: Number(db.task?.totalTasks || db.task?.total_tasks) || 0,
      completedTasks: Number(db.task?.completedTasks || db.task?.completed_tasks) || 0,
      inProgressTasks: Number(db.task?.inProgressTasks || db.task?.in_progress_tasks) || 0,
      pendingTasks: Number(db.task?.pendingTasks || db.task?.pending_tasks) || 0,
      completionRate: Number(db.task?.completionRate || db.task?.completion_rate) || 0
    },
    labor: {
      totalHours: Number(db.labor?.totalHours || db.labor?.total_hours) || 0,
      totalLaborCost: Number(db.labor?.totalLaborCost || db.labor?.total_labor_cost) || 0
    },
    problem: {
      totalProblems: Number(db.problem?.totalProblems || db.problem?.total_problems) || 0,
      resolvedProblems: Number(db.problem?.resolvedProblems || db.problem?.resolved_problems) || 0,
      resolutionRate: Number(db.problem?.resolutionRate || db.problem?.resolution_rate) || 0
    },
    batch: {
      activeCount: Number(db.batch?.activeCount || db.batch?.active_count) || 0,
      totalBatches: Number(db.batch?.totalBatches || db.batch?.total_batches) || 0
    },
    totalCost: Number(db.totalCost || db.total_cost) || 0
  }
}

// ========== Store ==========

export const useSummaryStore = defineStore('summary', () => {
  // 状态
  const overview = ref(null)
  const yieldItems = ref([])
  const yieldGroupBy = ref('month')
  const costDetailItems = ref([])
  const costSummary = ref(null)
  const laborItems = ref([])
  const laborGroupBy = ref('month')
  const batchItems = ref([])
  const problemItems = ref([])
  const indicators = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetchTimestamps = ref({})

  // 获取生产报表概览
  const fetchOverview = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.set('start_date', params.start_date)
      if (params.end_date) queryParams.set('end_date', params.end_date)

      const query = queryParams.toString()
      const url = `/summary/overview${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response
      overview.value = normalizeOverview(data || {})
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, overview: Date.now() }
    } catch (err) {
      error.value = err.message
      console.error('[SummaryStore] 获取生产报表概览失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取产量统计
  const fetchYieldStats = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.set('start_date', params.start_date)
      if (params.end_date) queryParams.set('end_date', params.end_date)
      if (params.group_by) queryParams.set('group_by', params.group_by)
      else queryParams.set('group_by', 'month')
      if (params.crop_name) queryParams.set('crop_name', params.crop_name)
      if (params.greenhouse_name) queryParams.set('greenhouse_name', params.greenhouse_name)

      yieldGroupBy.value = params?.groupBy || 'month'

      const query = queryParams.toString()
      const url = `/summary/yield-stats${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || []
      yieldItems.value = Array.isArray(data) ? data.map(item => normalizeYieldItem(item)) : []
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, yieldStats: Date.now() }
    } catch (err) {
      error.value = err.message
      console.error('[SummaryStore] 获取产量统计失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取成本统计
  const fetchCostStats = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.set('start_date', params.start_date)
      if (params.end_date) queryParams.set('end_date', params.end_date)
      if (params.batch_code) queryParams.set('batch_code', params.batch_code)
      if (params.cost_type) queryParams.set('cost_type', params.cost_type)
      if (params.group_by) queryParams.set('group_by', params.group_by)

      const query = queryParams.toString()
      const url = `/summary/cost-stats${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || {}
      costDetailItems.value = data.labor || data.material || data.energy || []
      costSummary.value = {
        totalLaborCost: Number(data.summary?.total_labor_cost || data.summary?.totalLaborCost) || 0,
        totalMaterialCost: Number(data.summary?.total_material_cost || data.summary?.totalMaterialCost) || 0,
        totalEnergyCost: Number(data.summary?.total_energy_cost || data.summary?.totalEnergyCost) || 0,
        totalCost: Number(data.summary?.total_cost || data.summary?.totalCost) || 0,
        totalWorkHours: Number(data.summary?.total_work_hours || data.summary?.totalWorkHours) || 0,
        avgHourlyRate: Number(data.summary?.avg_hourly_rate || data.summary?.avgHourlyRate) || 0
      }
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, costStats: Date.now() }
    } catch (err) {
      error.value = err.message
      console.error('[SummaryStore] 获取成本统计失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取人工统计
  const fetchLaborStats = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.set('start_date', params.start_date)
      if (params.end_date) queryParams.set('end_date', params.end_date)
      if (params.group_by) queryParams.set('group_by', params.group_by)
      else queryParams.set('group_by', 'month')
      if (params.greenhouse_name) queryParams.set('greenhouse_name', params.greenhouse_name)
      if (params.worker_name) queryParams.set('worker_name', params.worker_name)

      laborGroupBy.value = params?.groupBy || 'month'

      const query = queryParams.toString()
      const url = `/summary/labor-stats${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || {}
      laborItems.value = data.details || []
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, laborStats: Date.now() }
    } catch (err) {
      error.value = err.message
      console.error('[SummaryStore] 获取人工统计失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取批次统计
  const fetchBatchStats = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.crop_name) queryParams.set('crop_name', params.crop_name)
      if (params.status) queryParams.set('status', params.status)
      if (params.greenhouse_name) queryParams.set('greenhouse_name', params.greenhouse_name)
      if (params.start_date) queryParams.set('start_date', params.start_date)
      if (params.end_date) queryParams.set('end_date', params.end_date)
      if (params.page) queryParams.set('page', String(params.page))
      else queryParams.set('page', '1')
      if (params.limit) queryParams.set('limit', String(params.limit))
      else queryParams.set('limit', '50')

      const query = queryParams.toString()
      const url = `/summary/batch-stats${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || []
      batchItems.value = Array.isArray(data) ? data.map(item => normalizeBatch(item)) : []
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, batchStats: Date.now() }
    } catch (err) {
      error.value = err.message
      console.error('[SummaryStore] 获取批次统计失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取问题统计
  const fetchProblems = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      // 问题统计使用 problems API
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.set('start_date', params.start_date)
      if (params.end_date) queryParams.set('end_date', params.end_date)
      if (params.page) queryParams.set('page', String(params.page))
      else queryParams.set('page', '1')
      if (params.limit) queryParams.set('limit', String(params.limit))
      else queryParams.set('limit', '100')

      const query = queryParams.toString()
      const url = `/problems/summary${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || []
      // 规范化问题数据
      problemItems.value = Array.isArray(data) ? data.map(item => ({
        date: item.date,
        month: item.month,
        total: Number(item.total) || 0,
        pending: Number(item.pending) || 0,
        inProgress: Number(item.inProgress) || 0,
        resolved: Number(item.resolved) || 0,
        highPriority: Number(item.highPriority) || 0,
        mediumPriority: Number(item.mediumPriority) || 0,
        lowPriority: Number(item.lowPriority) || 0
      })) : []
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, problems: Date.now() }
    } catch (err) {
      error.value = err.message
      console.error('[SummaryStore] 获取问题统计失败:', err)
      // 失败时使用空数组
      problemItems.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 获取生产指标
  const fetchIndicators = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.set('start_date', params.start_date)
      if (params.end_date) queryParams.set('end_date', params.end_date)

      const query = queryParams.toString()
      const url = `/summary/indicators${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response

      if (data) {
        indicators.value = [{
          period: data.period || { start: '', end: '' },
          yield: {
            totalYield: Number(data.yield?.totalYield || data.yield?.total_yield) || 0,
            harvestCount: Number(data.yield?.harvestCount || data.yield?.harvest_count) || 0,
            avgYieldPerHarvest: Number(data.yield?.avgYieldPerHarvest || data.yield?.avg_yield_per_harvest) || 0
          },
          task: {
            total: Number(data.task?.total) || 0,
            completed: Number(data.task?.completed) || 0,
            completionRate: Number(data.task?.completionRate || data.task?.completion_rate) || 0
          },
          problem: {
            total: Number(data.problem?.total) || 0,
            resolved: Number(data.problem?.resolved) || 0,
            resolutionRate: Number(data.problem?.resolutionRate || data.problem?.resolution_rate) || 0
          },
          labor: {
            totalHours: Number(data.labor?.totalHours || data.labor?.total_hours) || 0,
            totalCost: Number(data.labor?.totalCost || data.labor?.total_cost) || 0,
            workerCount: Number(data.labor?.workerCount || data.labor?.worker_count) || 0,
            efficiency: Number(data.labor?.efficiency) || 0
          },
          overallScore: Number(data.overallScore || data.overall_score) || 0
        }]
      }
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, indicators: Date.now() }
    } catch (err) {
      error.value = err.message
      console.error('[SummaryStore] 获取生产指标失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 一次性获取所有汇总数据
  const fetchAll = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      await Promise.all([
        fetchOverview(params),
        fetchYieldStats(params),
        fetchCostStats(params),
        fetchBatchStats(params),
        fetchProblems(params),
        fetchIndicators(params)
      ])
    } finally {
      isLoading.value = false
    }
  }

  // 清空所有缓存数据
  const invalidateAll = () => {
    overview.value = null
    yieldItems.value = []
    yieldGroupBy.value = 'month'
    costDetailItems.value = []
    costSummary.value = null
    laborItems.value = []
    laborGroupBy.value = 'month'
    batchItems.value = []
    problemItems.value = []
    indicators.value = []
    error.value = null
    lastFetchTimestamps.value = {}
  }

  // 检查缓存是否过期
  const isCacheStale = (key, maxAgeMs) => {
    const timestamp = lastFetchTimestamps.value[key]
    if (!timestamp) return true
    return Date.now() - timestamp > maxAgeMs
  }

  // 任务状态判断
  const getTaskStatus = (completionRate) => {
    if (completionRate >= 80) return 'good'
    if (completionRate >= 50) return 'warning'
    return 'critical'
  }

  return {
    // 状态
    overview,
    yieldItems,
    yieldGroupBy,
    costDetailItems,
    costSummary,
    laborItems,
    laborGroupBy,
    batchItems,
    problemItems,
    indicators,
    isLoading,
    error,
    lastFetchTimestamps,

    // 方法
    fetchOverview,
    fetchYieldStats,
    fetchCostStats,
    fetchLaborStats,
    fetchBatchStats,
    fetchProblems,
    fetchIndicators,
    fetchAll,
    invalidateAll,
    isCacheStale,
    getTaskStatus
  }
})
