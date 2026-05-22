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

  return {
    // 状态
    indicators,
    isLoading,
    pagination,
    // Actions
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator
  }
})
