/**
 * 指标数据 Store 模块
 * 使用 Pinia 管理指标数据状态
 * 对接后端: /api/indicators
 *
 * 对应 V1.1: useIndicatorDataStore + useIndicatorStore
 * 数据流：Store → 组件
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
    trend: db.trend || 'stable',
    frequency: db.frequency || '月度',
    source: db.source || '人工录入',
    warning: Number(db.warning) || 0,
    weight: Number(db.weight) || 0,
    createTime: db.create_time || db.createTime,
    updateTime: db.update_time || db.updateTime
  }
}

/**
 * 将前端 camelCase 字段转换为后端 snake_case
 */
function denormalizeIndicator(data) {
  const result = {}
  const fieldMap = {
    id: 'id', code: 'code', name: 'name', category: 'category',
    unit: 'unit', target: 'target', actual: 'actual', trend: 'trend',
    frequency: 'frequency', source: 'source', warning: 'warning', weight: 'weight'
  }
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel]
    }
  }
  return result
}

/** 生成临时ID */
function generateLocalId() {
  return `KPI_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ============================================
// 计算函数（与V1.1 computeCategorySummary / computeAnalyzeData 一致）
// ============================================

/** 分类颜色映射 */
const CATEGORY_COLORS = {
  '生产指标': '#06b6d4',
  '质量指标': '#7C3AED',
  '成本指标': '#22c55e',
  '效率指标': '#f59e0b',
  '服务指标': '#ec4899',
  '设备指标': '#0891b2',
  '资源指标': '#3b82f6',
  '效益指标': '#10b981',
  '安全指标': '#ef4444',
}

/** 从指标列表计算分类汇总 */
function computeCategorySummary(indicators) {
  const groups = {}
  for (const ind of indicators) {
    if (!groups[ind.category]) {
      groups[ind.category] = { count: 0, totalAchievement: 0 }
    }
    groups[ind.category].count++
    if (ind.target > 0) {
      groups[ind.category].totalAchievement += (ind.actual / ind.target) * 100
    }
  }
  return Object.entries(groups).map(([name, data]) => ({
    name,
    count: data.count,
    avgAchievement: data.count > 0 ? Math.round(data.totalAchievement / data.count * 10) / 10 : 0,
    color: CATEGORY_COLORS[name] || '#6b7280',
  }))
}

/** 从指标列表计算分析数据 */
function computeAnalyzeData(indicators) {
  return indicators.map(ind => ({
    month: ind.name,
    target: ind.target,
    actual: ind.actual,
    达成率: ind.target > 0 ? Math.round((ind.actual / ind.target) * 1000) / 10 : 0,
  }))
}

/** 默认评估数据 */
const DEFAULT_EVALUATION_DATA = [
  { id: '1', name: '上海松江基地', productionScore: 92, qualityScore: 95, costScore: 88, efficiencyScore: 90, totalScore: 91.25, rank: 1 },
  { id: '2', name: '上海崇明基地', productionScore: 88, qualityScore: 92, costScore: 85, efficiencyScore: 87, totalScore: 88.0, rank: 2 },
  { id: '3', name: '上海嘉定基地', productionScore: 85, qualityScore: 90, costScore: 90, efficiencyScore: 85, totalScore: 87.5, rank: 3 },
  { id: '4', name: '上海奉贤基地', productionScore: 90, qualityScore: 88, costScore: 82, efficiencyScore: 88, totalScore: 87.0, rank: 4 },
  { id: '5', name: '西安雁塔基地', productionScore: 82, qualityScore: 85, costScore: 88, efficiencyScore: 86, totalScore: 85.25, rank: 5 },
  { id: '6', name: '西安高新基地', productionScore: 80, qualityScore: 88, costScore: 85, efficiencyScore: 84, totalScore: 84.25, rank: 6 },
  { id: '7', name: '宁波北仑基地', productionScore: 78, qualityScore: 82, costScore: 86, efficiencyScore: 82, totalScore: 82.0, rank: 7 },
  { id: '8', name: '宁波镇海基地', productionScore: 75, qualityScore: 80, costScore: 84, efficiencyScore: 80, totalScore: 79.75, rank: 8 }
]

export const useIndicatorStore = defineStore('indicators', () => {
  // ========== 状态定义 ==========

  const indicators = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 分页信息
  const pagination = ref({ page: 1, limit: 50, total: 0 })

  // 评估数据
  const evaluationData = ref(DEFAULT_EVALUATION_DATA)

  // 指标状态更新记录（审批联动，对应V1.1 useIndicatorStore）
  const statusUpdates = ref({})

  // ========== 计算属性（从indicators动态派生，与V1.1一致）==========

  const categorySummary = computed(() => computeCategorySummary(indicators.value))

  const analyzeData = computed(() => computeAnalyzeData(indicators.value))

  // ========== Actions ==========

  const fetchIndicators = async (filters = {}) => {
    isLoading.value = true
    error.value = null
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
    } catch (err) {
      console.warn('[IndicatorStore] 获取指标列表失败:', err)
      error.value = err.message
      // 保持现有indicators不变（从localStorage恢复或空数组）
    } finally {
      isLoading.value = false
    }
  }

  const createIndicator = async (indicatorData) => {
    const localId = generateLocalId()
    const optimisticItem = {
      id: localId,
      code: indicatorData.code || '',
      name: indicatorData.name || '',
      category: indicatorData.category || '生产指标',
      unit: indicatorData.unit || '',
      target: indicatorData.target ?? 0,
      actual: indicatorData.actual ?? 0,
      trend: indicatorData.trend || 'stable',
      frequency: indicatorData.frequency || '月度',
      source: indicatorData.source || '人工录入',
      warning: indicatorData.warning ?? 0,
      weight: indicatorData.weight ?? 0,
    }
    // 乐观更新
    indicators.value = [optimisticItem, ...indicators.value]
    try {
      const body = { ...denormalizeIndicator(indicatorData), id: localId }
      const response = await enhancedApiClient.post('/indicators', body)
      const saved = response?.data || response
      if (saved && saved.id) {
        const normalized = normalizeIndicator({ ...indicatorData, ...saved })
        indicators.value = indicators.value.map(item =>
          item.id === localId ? { ...normalized, id: saved.id || localId } : item
        )
      }
      return saved || optimisticItem
    } catch (err) {
      console.warn('[IndicatorStore] 创建指标失败，回滚:', err)
      indicators.value = indicators.value.filter(item => item.id !== localId)
      throw err
    }
  }

  const updateIndicator = async (id, indicatorData) => {
    const prev = indicators.value.find(item => item.id === id)
    // 乐观更新
    indicators.value = indicators.value.map(item =>
      item.id === id ? { ...item, ...indicatorData, updateTime: new Date().toLocaleString() } : item
    )
    try {
      const body = denormalizeIndicator(indicatorData)
      await enhancedApiClient.put(`/indicators/${id}`, body)
    } catch (err) {
      console.warn('[IndicatorStore] 更新指标失败，回滚:', err)
      if (prev) {
        indicators.value = indicators.value.map(item =>
          item.id === id ? prev : item
        )
      }
      throw err
    }
  }

  const deleteIndicator = async (id) => {
    const prev = indicators.value.find(item => item.id === id)
    indicators.value = indicators.value.filter(item => item.id !== id)
    try {
      await enhancedApiClient.delete(`/indicators/${id}`)
      return true
    } catch (err) {
      console.warn('[IndicatorStore] 删除指标失败，回滚:', err)
      if (prev) {
        indicators.value = [...indicators.value, prev]
      }
      return false
    }
  }

  /**
   * 批量删除指标（对应V1.1 deleteIndicators）
   */
  const deleteIndicators = async (ids) => {
    const prevItems = indicators.value.filter(item => ids.includes(item.id))
    indicators.value = indicators.value.filter(item => !ids.includes(item.id))
    try {
      await Promise.all(ids.map(id =>
        enhancedApiClient.delete(`/indicators/${id}`).catch(() => {})
      ))
      return true
    } catch {
      console.warn('[IndicatorStore] 批量删除失败，回滚')
      if (prevItems.length > 0) {
        indicators.value = [...indicators.value, ...prevItems]
      }
      return false
    }
  }

  /**
   * 获取评估数据
   */
  const fetchEvaluations = async () => {
    try {
      const response = await enhancedApiClient.get('/indicator-evaluations')
      const rawData = Array.isArray(response) ? response : (response?.data || [])
      const normalized = rawData.map(item => ({
        id: item.id,
        name: item.name,
        productionScore: Number(item.productionScore ?? item.production_score ?? 0),
        qualityScore: Number(item.qualityScore ?? item.quality_score ?? 0),
        costScore: Number(item.costScore ?? item.cost_score ?? 0),
        efficiencyScore: Number(item.efficiencyScore ?? item.efficiency_score ?? 0),
        totalScore: Number(item.totalScore ?? item.total_score ?? 0),
        rank: Number(item.rank ?? 0),
      }))
      if (normalized.length > 0) {
        evaluationData.value = normalized
      }
    } catch (err) {
      console.warn('[IndicatorStore] 评估数据API获取失败:', err)
    }
  }

  /**
   * 更新指标状态（审批联动，对应V1.1 useIndicatorStore）
   */
  const updateIndicatorStatus = (indicatorId, status, updatedBy) => {
    statusUpdates.value = {
      ...statusUpdates.value,
      [indicatorId]: {
        indicatorId,
        status,
        updatedAt: new Date().toISOString(),
        updatedBy,
      }
    }
    // 同时更新indicators中的状态
    const idx = indicators.value.findIndex(item => item.id === indicatorId)
    if (idx !== -1) {
      indicators.value[idx] = { ...indicators.value[idx], status }
    }
  }

  const clearStatusUpdates = () => {
    statusUpdates.value = {}
  }

  return {
    // 状态
    indicators,
    isLoading,
    error,
    pagination,
    evaluationData,
    statusUpdates,
    // 计算属性（动态派生）
    categorySummary,
    analyzeData,
    // CRUD
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    deleteIndicators,
    // 评估
    fetchEvaluations,
    // 状态联动
    updateIndicatorStatus,
    clearStatusUpdates,
  }
})
