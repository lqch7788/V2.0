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
 * - /api/problems/daily-summary  → 问题每日汇总
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockChartData } from '@/data/mockData'

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

  // Mock 数据生成函数
  const generateMockOverview = () => ({
    yield: {
      monthHarvestCount: 24,
      monthTotalYield: 12580,
      monthTotalAmount: 87500,
    },
    task: {
      totalTasks: 156,
      completedTasks: 98,
      inProgressTasks: 32,
      pendingTasks: 26,
      completionRate: 62.8,
    },
    labor: {
      totalHours: 4520,
      totalLaborCost: 135600,
    },
    problem: {
      totalProblems: 42,
      resolvedProblems: 35,
      resolutionRate: 83.3,
    },
    batch: {
      activeCount: 8,
      totalBatches: 12,
    },
    totalCost: 198500,
  })

  const generateMockYieldItems = () => {
    return mockChartData.monthlyYield.map((item) => ({
      name: item.month,
      value: item.yield,
      count: Math.floor(item.yield / 50),
    }))
  }

  const generateMockBatchItems = () => [
    {
      id: 1,
      batchCode: 'B20260501',
      batchName: '番茄批次A',
      cropName: '番茄',
      variety: '大红番茄',
      greenhouse: '1号大棚-A区',
      plantingArea: '1000㎡',
      targetYield: 5000,
      actualQuantity: 3200,
      harvestQuantity: 2800,
      completionRate: 64,
      status: 'in_progress',
      plantingDate: '2026-03-15',
      expectedHarvestDate: '2026-06-15',
      actualHarvestDate: '',
      taskCount: 24,
      completedTaskCount: 15,
      pendingTaskCount: 5,
      inProgressTaskCount: 4,
      totalWorkHours: 320,
      laborCost: 9600,
      remainingYield: 1800,
    },
    {
      id: 2,
      batchCode: 'B20260502',
      batchName: '黄瓜批次A',
      cropName: '黄瓜',
      variety: '水果黄瓜',
      greenhouse: '2号大棚',
      plantingArea: '800㎡',
      targetYield: 4000,
      actualQuantity: 2800,
      harvestQuantity: 2400,
      completionRate: 70,
      status: 'in_progress',
      plantingDate: '2026-03-10',
      expectedHarvestDate: '2026-06-10',
      actualHarvestDate: '',
      taskCount: 20,
      completedTaskCount: 14,
      pendingTaskCount: 3,
      inProgressTaskCount: 3,
      totalWorkHours: 280,
      laborCost: 8400,
      remainingYield: 1200,
    },
    {
      id: 3,
      batchCode: 'B20260503',
      batchName: '辣椒批次A',
      cropName: '辣椒',
      variety: '朝天椒',
      greenhouse: '3号大棚',
      plantingArea: '600㎡',
      targetYield: 3000,
      actualQuantity: 1950,
      harvestQuantity: 1500,
      completionRate: 65,
      status: 'in_progress',
      plantingDate: '2026-03-20',
      expectedHarvestDate: '2026-06-20',
      actualHarvestDate: '',
      taskCount: 18,
      completedTaskCount: 10,
      pendingTaskCount: 4,
      inProgressTaskCount: 4,
      totalWorkHours: 200,
      laborCost: 6000,
      remainingYield: 1050,
    },
    {
      id: 4,
      batchCode: 'B20260401',
      batchName: '茄子批次A',
      cropName: '茄子',
      variety: '紫长茄',
      greenhouse: '1号大棚-B区',
      plantingArea: '500㎡',
      targetYield: 3500,
      actualQuantity: 3150,
      harvestQuantity: 3150,
      completionRate: 90,
      status: 'completed',
      plantingDate: '2026-02-15',
      expectedHarvestDate: '2026-05-15',
      actualHarvestDate: '2026-05-12',
      taskCount: 22,
      completedTaskCount: 22,
      pendingTaskCount: 0,
      inProgressTaskCount: 0,
      totalWorkHours: 350,
      laborCost: 10500,
      remainingYield: 0,
    },
    {
      id: 5,
      batchCode: 'B20260402',
      batchName: '生菜批次A',
      cropName: '生菜',
      variety: '奶油生菜',
      greenhouse: '露天区-1',
      plantingArea: '400㎡',
      targetYield: 2000,
      actualQuantity: 1850,
      harvestQuantity: 1850,
      completionRate: 92.5,
      status: 'completed',
      plantingDate: '2026-02-20',
      expectedHarvestDate: '2026-04-25',
      actualHarvestDate: '2026-04-23',
      taskCount: 16,
      completedTaskCount: 16,
      pendingTaskCount: 0,
      inProgressTaskCount: 0,
      totalWorkHours: 180,
      laborCost: 5400,
      remainingYield: 0,
    },
  ]

  const generateMockCostSummary = () => ({
    totalLaborCost: 135600,
    totalMaterialCost: 42800,
    totalEnergyCost: 20100,
    totalCost: 198500,
    totalWorkHours: 4520,
    avgHourlyRate: 30,
  })

  const generateMockIndicators = () => ({
    period: { start: '2026-01-01', end: '2026-05-21' },
    yield: {
      totalYield: 45800,
      harvestCount: 24,
      avgYieldPerHarvest: 1908,
    },
    task: {
      total: 156,
      completed: 98,
      completionRate: 62.8,
    },
    problem: {
      total: 42,
      resolved: 35,
      resolutionRate: 83.3,
    },
    labor: {
      totalHours: 4520,
      totalCost: 135600,
      workerCount: 28,
      efficiency: 78.5,
    },
    overallScore: 82,
  })

  const generateMockProblemItems = () => {
    const items = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)
      items.push({
        date: dateStr,
        month: dateStr.slice(0, 7),
        total: Math.floor(Math.random() * 5) + 1,
        pending: Math.floor(Math.random() * 2),
        inProgress: Math.floor(Math.random() * 2),
        resolved: Math.floor(Math.random() * 3),
        highPriority: Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0,
        mediumPriority: Math.floor(Math.random() * 3),
        lowPriority: Math.floor(Math.random() * 2),
      })
    }
    return items
  }

  // 获取生产报表概览
  const fetchOverview = async () => {
    isLoading.value = true
    error.value = null
    try {
      // 模拟 API 延迟
      await new Promise((resolve) => setTimeout(resolve, 500))
      overview.value = generateMockOverview()
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, overview: Date.now() }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 获取产量统计
  const fetchYieldStats = async (params) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      yieldGroupBy.value = params?.groupBy || 'month'
      yieldItems.value = generateMockYieldItems()
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, yieldStats: Date.now() }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 获取成本统计
  const fetchCostStats = async (params) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      costSummary.value = generateMockCostSummary()
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, costStats: Date.now() }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 获取人工统计
  const fetchLaborStats = async (params) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      laborGroupBy.value = params?.groupBy || 'month'
      laborItems.value = []
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, laborStats: Date.now() }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 获取批次统计
  const fetchBatchStats = async (params) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      batchItems.value = generateMockBatchItems()
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, batchStats: Date.now() }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 获取问题统计
  const fetchProblems = async (params) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      problemItems.value = generateMockProblemItems()
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, problems: Date.now() }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 获取生产指标
  const fetchIndicators = async (params) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      indicators.value = [generateMockIndicators()]
      lastFetchTimestamps.value = { ...lastFetchTimestamps.value, indicators: Date.now() }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 一次性获取所有汇总数据
  const fetchAll = async () => {
    isLoading.value = true
    error.value = null
    try {
      await Promise.all([
        fetchOverview(),
        fetchYieldStats(),
        fetchCostStats(),
        fetchBatchStats(),
        fetchProblems(),
        fetchIndicators(),
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
    getTaskStatus,
  }
})
