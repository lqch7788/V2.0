/**
 * 指标数据 Store 模块
 * 使用 Pinia 管理指标数据状态
 * 对接后端: /api/indicators
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ============================================
// 工具函数
// ============================================

/**
 * 将后端 snake_case 字段转换为前端 camelCase
 */
function normalizeIndicator(db) {
  return {
    id: db.id,
    code: db.code,
    name: db.name,
    category: db.category,
    unit: db.unit,
    target: Number(db.target) || 0,
    actual: Number(db.actual) || 0,
    trend: db.trend,
    frequency: db.frequency,
    source: db.source,
    warning: Number(db.warning) || 0,
    weight: Number(db.weight) || 0,
    createTime: db.create_time,
    updateTime: db.update_time
  }
}

/**
 * 将前端 camelCase 字段转换为后端 snake_case
 */
function denormalizeIndicator(data) {
  const result = {}
  const fieldMap = {
    id: 'id',
    code: 'code',
    name: 'name',
    category: 'category',
    unit: 'unit',
    target: 'target',
    actual: 'actual',
    trend: 'trend',
    frequency: 'frequency',
    source: 'source',
    warning: 'warning',
    weight: 'weight'
  }
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel]
    }
  }
  return result
}

export const useIndicatorStore = defineStore('indicators', () => {
  // ========== 状态定义 ==========

  // 指标列表数据
  const indicators = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 分页信息
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0
  })

  // 评估数据（基地考核排名）
  const evaluationData = ref([
    { id: '1', name: '上海松江基地', productionScore: 92, qualityScore: 95, costScore: 88, efficiencyScore: 90, totalScore: 91.25, rank: 1 },
    { id: '2', name: '上海崇明基地', productionScore: 88, qualityScore: 92, costScore: 85, efficiencyScore: 87, totalScore: 88.0, rank: 2 },
    { id: '3', name: '上海嘉定基地', productionScore: 85, qualityScore: 90, costScore: 90, efficiencyScore: 85, totalScore: 87.5, rank: 3 },
    { id: '4', name: '上海奉贤基地', productionScore: 90, qualityScore: 88, costScore: 82, efficiencyScore: 88, totalScore: 87.0, rank: 4 },
    { id: '5', name: '西安雁塔基地', productionScore: 82, qualityScore: 85, costScore: 88, efficiencyScore: 86, totalScore: 85.25, rank: 5 },
    { id: '6', name: '西安高新基地', productionScore: 80, qualityScore: 88, costScore: 85, efficiencyScore: 84, totalScore: 84.25, rank: 6 },
    { id: '7', name: '宁波北仑基地', productionScore: 78, qualityScore: 82, costScore: 86, efficiencyScore: 82, totalScore: 82.0, rank: 7 },
    { id: '8', name: '宁波镇海基地', productionScore: 75, qualityScore: 80, costScore: 84, efficiencyScore: 80, totalScore: 79.75, rank: 8 }
  ])

  // 分析数据（月度达成率）
  const analyzeData = ref([
    { month: '1月', target: 4800, actual: 4900, 达成率: 102.1 },
    { month: '2月', target: 4900, actual: 5000, 达成率: 102.0 },
    { month: '3月', target: 5000, actual: 5100, 达成率: 102.0 },
    { month: '4月', target: 5100, actual: 5050, 达成率: 99.0 },
    { month: '5月', target: 5000, actual: 5200, 达成率: 104.0 },
    { month: '6月', target: 5200, actual: 5300, 达成率: 101.9 }
  ])

  // 分类汇总数据
  const categorySummary = ref([
    { name: '生产指标', count: 12, avgAchievement: 98.5, color: '#06b6d4' },
    { name: '质量指标', count: 8, avgAchievement: 97.2, color: '#7C3AED' },
    { name: '成本指标', count: 6, avgAchievement: 95.8, color: '#22c55e' },
    { name: '效率指标', count: 5, avgAchievement: 96.5, color: '#f59e0b' },
    { name: '服务指标', count: 3, avgAchievement: 98.0, color: '#ec4899' },
    { name: '设备指标', count: 5, avgAchievement: 92.5, color: '#0891b2' },
    { name: '资源指标', count: 4, avgAchievement: 94.2, color: '#3b82f6' },
    { name: '安全指标', count: 2, avgAchievement: 100.0, color: '#ef4444' }
  ])

  // ========== Actions ==========

  /**
   * 获取指标列表
   * @param {Object} filters - 筛选条件 { category, keyword }
   */
  const fetchIndicators = async (filters = {}) => {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      if (filters.category && filters.category !== '全部') params.set('category', filters.category)
      if (filters.keyword) params.set('keyword', filters.keyword)
      params.set('page', String(pagination.value.page))
      params.set('limit', String(pagination.value.limit))

      const query = params.toString()
      const url = `/indicators${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || []
      const meta = response?.meta || {}

      indicators.value = Array.isArray(data) ? data.map(item => normalizeIndicator(item)) : []
      pagination.value.total = meta.total || indicators.value.length
    } catch (error) {
      console.error('[IndicatorStore] 获取指标列表失败:', error)
      indicators.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建指标
   */
  const createIndicator = async (indicatorData) => {
    try {
      const body = denormalizeIndicator(indicatorData)
      const response = await enhancedApiClient.post('/indicators', body)
      const saved = response?.data || response
      const newIndicator = normalizeIndicator({ ...indicatorData, ...saved })
      indicators.value.unshift(newIndicator)
      return newIndicator
    } catch (error) {
      console.error('[IndicatorStore] 创建指标失败:', error)
      throw error
    }
  }

  /**
   * 更新指标
   */
  const updateIndicator = async (id, indicatorData) => {
    try {
      const body = denormalizeIndicator(indicatorData)
      await enhancedApiClient.put(`/indicators/${id}`, body)
      const index = indicators.value.findIndex(item => item.id === id)
      if (index !== -1) {
        indicators.value[index] = {
          ...indicators.value[index],
          ...indicatorData,
          updateTime: new Date().toLocaleString()
        }
      }
    } catch (error) {
      console.error('[IndicatorStore] 更新指标失败:', error)
      throw error
    }
  }

  /**
   * 删除指标
   */
  const deleteIndicator = async (id) => {
    try {
      await enhancedApiClient.delete(`/indicators/${id}`)
      indicators.value = indicators.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('[IndicatorStore] 删除指标失败:', error)
      throw error
    }
  }

  /**
   * 获取评估数据（占位方法）
   */
  const fetchEvaluations = async () => {
    // 评估功能暂未实现
    console.log('[IndicatorStore] fetchEvaluations 暂未实现')
  }

  return {
    // 状态
    indicators,
    isLoading,
    pagination,
    evaluationData,
    analyzeData,
    categorySummary,
    // Actions
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    fetchEvaluations
  }
})
