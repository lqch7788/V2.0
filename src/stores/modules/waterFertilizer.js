/**
 * 水肥一体机管理 Store 模块
 * 灌溉时段、间隔和ABC混合比例参数配置
 * 对应 V1.1 useWaterFertilizerStore
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// 间隔单位常量
export const INTERVAL_UNITS = [
  { value: 'minute', label: '分钟' },
  { value: 'hour', label: '小时' },
  { value: 'day', label: '天' }
]

// ==================== 字段映射 ====================

/** 后端(snake_case) → 前端(camelCase) 字段名映射 */
const FIELD_MAP = {
  oid: 'oid',
  partition_oid: 'partitionOid',
  partition_name: 'partitionName',
  device_oid: 'deviceOid',
  device_code: 'deviceCode',
  machine_addr: 'machineAddr',
  mac_addr: 'macAddr',
  start_time: 'startTime',
  end_time: 'endTime',
  interval_value: 'intervalValue',
  interval_unit: 'intervalUnit',
  mix_ratio_a: 'mixRatioA',
  mix_ratio_b: 'mixRatioB',
  mix_ratio_c: 'mixRatioC',
  description: 'description',
  status: 'status',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
}

/**
 * 后端数据 → 前端数据（API 响应处理）
 */
function normalize(raw) {
  const result = { ...raw }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  result.status = result.status || 'active'
  return result
}

/**
 * 前端数据 → 后端数据（API 请求体处理）
 */
function denormalize(data) {
  const result = {}
  const reverse = {}
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    reverse[camel] = snake
  }
  for (const [key, value] of Object.entries(data)) {
    const backendKey = reverse[key] || key
    result[backendKey] = value
  }
  return result
}

export const useWaterFertilizerStore = defineStore('waterFertilizer', () => {
  // ========== 状态定义 ==========

  // 水肥配置列表
  const items = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const error = ref(null)

  // ========== 计算属性 ==========

  // 统计数据
  const stats = computed(() => {
    const total = items.value.length
    const activeCount = items.value.filter(it => it.status === 'active').length
    const inactiveCount = items.value.filter(it => it.status === 'inactive').length
    return { total, activeCount, inactiveCount }
  })

  // ========== Actions ==========

  /**
   * 获取水肥配置列表
   */
  const fetchItems = async (filters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `/water-fertilizer${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response
        : Array.isArray(response?.data) ? response.data : []
      items.value = data.map(normalize)
    } catch (e) {
      error.value = e.message
      console.warn('[WaterFertilizerStore] API 获取失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建水肥配置
   */
  const createItem = async (itemData) => {
    try {
      const body = denormalize(itemData)
      const response = await enhancedApiClient.post('/water-fertilizer', body)
      const saved = response?.data || response
      const newItem = normalize({ ...itemData, ...saved })
      items.value = [newItem, ...items.value]
      return newItem
    } catch (e) {
      error.value = e.message
      console.warn('[WaterFertilizerStore] 创建失败:', e)
      return null
    }
  }

  /**
   * 更新水肥配置
   */
  const updateItem = async (oid, itemData) => {
    items.value = items.value.map(item =>
      item.oid === oid ? { ...item, ...itemData } : item
    )
    try {
      const body = denormalize(itemData)
      await enhancedApiClient.put(`/water-fertilizer/${oid}`, body)
    } catch (e) {
      error.value = e.message
      console.warn('[WaterFertilizerStore] 更新失败:', e)
    }
  }

  /**
   * 删除水肥配置
   */
  const deleteItem = async (oid) => {
    const originalItems = [...items.value]
    items.value = items.value.filter(item => item.oid !== oid)
    try {
      await enhancedApiClient.delete(`/water-fertilizer/${oid}`)
      return true
    } catch (e) {
      error.value = e.message
      items.value = originalItems
      return false
    }
  }

  /**
   * 下发参数到设备
   */
  const dispatchParams = async (oid) => {
    try {
      await enhancedApiClient.post(`/water-fertilizer/${oid}/dispatch`)
      return true
    } catch (e) {
      error.value = e.message
      console.warn('[WaterFertilizerStore] 下发参数失败:', e)
      return false
    }
  }

  /**
   * 根据ID获取单条记录
   */
  const getItemById = (oid) => {
    return items.value.find(item => item.oid === oid) || null
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
    dispatchParams,
    getItemById
  }
})
