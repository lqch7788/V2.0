/**
 * 种植设置 Store - Pinia 版本
 * 对接后端: /api/plant-settings
 * 与V1.1 usePlantSettingStore 功能完全一致
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ==================== 字段映射 ====================

/** 后端(snake_case) → 前端(camelCase) 字段名映射 */
const FIELD_MAP = {
  id: 'id',
  oid: 'oid',
  setting_key: 'settingKey',
  setting_value: 'settingValue',
  crop_variety_oid: 'cropVarietyOid',
  icon_url: 'iconUrl',
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
  result.id = result.id ?? 0
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

export const usePlantSettingStore = defineStore('plantSetting', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * 获取种植设置列表
   * @param {Object} filters - 筛选条件
   */
  const fetchItems = async (filters) => {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `/plant-settings${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response
        : Array.isArray(response?.data) ? response.data : []
      items.value = data.map(normalize)
    } catch (err) {
      error.value = err.message || '获取数据失败'
      console.warn('[PlantSettingStore] API 获取失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建种植设置
   * @param {Object} data - 设置数据
   * @returns {Object|null} 创建的设置项
   */
  const createItem = async (data) => {
    try {
      const body = denormalize(data)
      const response = await enhancedApiClient.post('/plant-settings', body)
      const saved = response?.data || response
      const newItem = normalize({ ...data, ...saved })
      items.value = [newItem, ...items.value]
      return newItem
    } catch (err) {
      error.value = err.message || '创建失败'
      console.warn('[PlantSettingStore] 创建失败:', err)
      return null
    }
  }

  /**
   * 更新种植设置
   * @param {string} oid - 设置OID
   * @param {Object} updates - 更新数据
   */
  const updateItem = async (oid, updates) => {
    items.value = items.value.map(item =>
      item.oid === oid ? { ...item, ...updates } : item
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`/plant-settings/${oid}`, body)
    } catch (err) {
      error.value = err.message || '更新失败'
      console.warn('[PlantSettingStore] 更新失败:', err)
    }
  }

  /**
   * 删除种植设置
   * @param {string} oid - 设置OID
   * @returns {boolean} 是否删除成功
   */
  const deleteItem = async (oid) => {
    const originalItems = [...items.value]
    items.value = items.value.filter(item => item.oid !== oid)
    try {
      await enhancedApiClient.delete(`/plant-settings/${oid}`)
      return true
    } catch (err) {
      error.value = err.message || '删除失败'
      items.value = originalItems
      return false
    }
  }

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }
})
