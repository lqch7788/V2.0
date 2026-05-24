/**
 * 施肥管理 Store 模块
 * 使用 Pinia + enhancedApiClient 与后端 API 交互
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// API 基础路径
const API_BASE = '/fertilizer'

/**
 * 将后端返回的snake_case字段转换为前端camelCase
 */
function transformRecord(record) {
  if (!record) return null
  return {
    id: record.id,
    fertilizerCode: record.fertilizer_code,
    fertilizerName: record.fertilizer_name,
    fertilizerType: record.fertilizer_type,
    cropName: record.crop_name,
    greenhouseName: record.greenhouse_name,
    dilutionRatio: record.dilution_ratio,
    quantity: record.quantity,
    unit: record.unit,
    unitPrice: record.unit_price,
    totalCost: record.total_cost,
    fertilizeTime: record.fertilize_time,
    dataSource: record.data_source,
    iotDeviceId: record.iot_device_id,
    operatorName: record.operator_name,
    description: record.description,
    productionPlanCode: record.production_plan_code,
    productionPlanId: record.production_plan_id,
    plantingCode: record.planting_code,
    farmTaskId: record.farm_task_id,
    createTime: record.create_time,
    updateTime: record.update_time
  }
}

export const useFertilizerStore = defineStore('fertilizer', () => {
  // ========== 状态定义 ==========

  // 施肥记录列表
  const items = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const error = ref(null)

  // ========== 计算属性 ==========

  // 统计数据
  const stats = computed(() => {
    const total = items.value.length
    const totalQuantity = items.value.reduce((sum, it) => sum + (it.quantity || 0), 0)
    const totalCost = items.value.reduce((sum, it) => sum + (it.totalCost || 0), 0)
    const iotCount = items.value.filter((it) => it.dataSource === 'auto_iot').length
    return { total, totalQuantity, totalCost, iotCount }
  })

  // ========== Actions ==========

  /**
   * 获取施肥记录列表
   * V1.1 兼容：支持筛选参数
   */
  const fetchItems = async (filters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()
      if (filters.fertilizerName) queryParams.set('fertilizer_name', filters.fertilizerName)
      if (filters.fertilizerType) queryParams.set('fertilizer_type', filters.fertilizerType)
      if (filters.cropName) queryParams.set('crop_name', filters.cropName)
      if (filters.greenhouseName) queryParams.set('greenhouse_name', filters.greenhouseName)
      if (filters.dataSource) queryParams.set('data_source', filters.dataSource)
      if (filters.startDate) queryParams.set('start_date', filters.startDate)
      if (filters.endDate) queryParams.set('end_date', filters.endDate)
      if (filters.operatorName) queryParams.set('operator_name', filters.operatorName)
      if (filters.plantingCode) queryParams.set('planting_code', filters.plantingCode)
      if (filters.page) queryParams.set('page', filters.page)
      if (filters.limit) queryParams.set('limit', filters.limit)

      const query = queryParams.toString()
      const url = `${API_BASE}${query ? `?${query}` : ''}`

      // 调用后端 API
      const data = await enhancedApiClient.get(url)

      // V1.1 兼容：支持多种响应格式
      let records = []
      if (Array.isArray(data)) {
        records = data
      } else if (data?.records && Array.isArray(data.records)) {
        records = data.records
      } else if (data?.results && Array.isArray(data.results)) {
        records = data.results
      }

      // 转换字段名：snake_case -> camelCase
      items.value = records.map(transformRecord).filter(Boolean)
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerStore] 获取施肥记录失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建施肥记录
   */
  const createItem = async (itemData) => {
    try {
      const response = await enhancedApiClient.post(API_BASE, itemData)
      const newItem = response?.data || response

      if (newItem) {
        // 转换字段名：snake_case -> camelCase
        const transformed = transformRecord(newItem)
        if (transformed) {
          items.value.unshift(transformed)
        }
      }

      return { success: true, data: transformRecord(newItem) }
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerStore] 创建施肥记录失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 更新施肥记录
   */
  const updateItem = async (id, itemData) => {
    try {
      const response = await enhancedApiClient.put(`${API_BASE}/${id}`, itemData)
      const updatedItem = response?.data || response

      if (updatedItem) {
        const transformed = transformRecord(updatedItem)
        if (transformed) {
          const index = items.value.findIndex(item => item.id === id)
          if (index !== -1) {
            items.value[index] = { ...items.value[index], ...transformed }
          }
        }
      }

      return { success: true, data: transformRecord(updatedItem) }
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerStore] 更新施肥记录失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 删除单条施肥记录
   */
  const deleteItem = async (id) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/${id}`)
      items.value = items.value.filter(item => item.id !== id)
      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerStore] 删除施肥记录失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 批量删除施肥记录
   */
  const deleteItems = async (ids) => {
    try {
      await enhancedApiClient.post(`${API_BASE}/batch-delete`, { ids })
      items.value = items.value.filter(item => !ids.includes(item.id))
      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerStore] 批量删除施肥记录失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 根据ID获取单条记录
   */
  const getItemById = async (id) => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${id}`)
      return response?.data || response || null
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerStore] 获取施肥记录详情失败:', e)
      return null
    }
  }

  /**
   * 获取统计数据
   */
  const fetchStats = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.startDate) queryParams.set('start_date', filters.startDate)
      if (filters.endDate) queryParams.set('end_date', filters.endDate)
      if (filters.cropName) queryParams.set('crop_name', filters.cropName)
      if (filters.greenhouseName) queryParams.set('greenhouse_name', filters.greenhouseName)

      const query = queryParams.toString()
      const url = `${API_BASE}/stats${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      return response?.data || response || []
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerStore] 获取统计数据失败:', e)
      return []
    }
  }

  /**
   * 生成施肥编号
   */
  const generateCode = async () => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/generate-code`)
      return response?.code || response?.data?.code || ''
    } catch (e) {
      console.error('[FertilizerStore] 生成施肥编号失败:', e)
      return ''
    }
  }

  return {
    // 状态
    items,
    isLoading,
    error,
    stats,
    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    getItemById,
    fetchStats,
    generateCode
  }
})

// 字典项名称映射
const dictLabels = {
  fertilizer_type: {
    organic: '有机肥',
    inorganic: '无机肥',
    biological: '生物肥',
    compound: '复合肥',
    trace: '微量元素肥'
  }
}

/**
 * 获取字典项显示名称
 */
export const getDictItemName = (category, code) => {
  if (!code) return ''
  const categoryMap = dictLabels[category]
  if (!categoryMap) return code
  return categoryMap[code] || code
}
