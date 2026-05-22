/**
 * 设备系统 Store - iAGS deviceSystem 集成
 * Vue3 + Pinia 版本
 * 数据流：Store → 组件 → API → 后端
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// API基础URL
const API_BASE = '/device-systems'

// 设备系统类型定义
export const DeviceSystemType = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

// 设备系统状态映射
export const statusMap = {
  active: { label: '使用中', type: 'success' },
  inactive: { label: '已停用', type: 'info' }
}

// ==================== 字段映射 ====================

/** 后端(snake_case) → 前端(camelCase) 字段名映射 */
const FIELD_MAP = {
  id: 'id',
  oid: 'oid',
  system_code: 'systemCode',
  system_name: 'systemName',
  idc_url: 'idcUrl',
  idc_token: 'idcToken',
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

export const useDeviceSystemStore = defineStore('deviceSystem', () => {
  // ========== 状态 ==========
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // ========== 计算属性 ==========
  // 统计数据
  const stats = computed(() => ({
    total: items.value.length,
    active: items.value.filter(i => i.status === 'active').length,
    inactive: items.value.filter(i => i.status === 'inactive').length,
    withIdc: items.value.filter(i => i.idcUrl).length
  }))

  // ========== 方法 ==========
  // 获取设备系统列表
  const fetchItems = async (filters) => {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `${API_BASE}${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response
        : Array.isArray(response?.data) ? response.data : []
      items.value = data.map(normalize)
    } catch (err) {
      error.value = err.message || '获取数据失败'
      console.warn('[DeviceSystemStore] API 获取失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 创建设备系统
  const createItem = async (data) => {
    try {
      const body = denormalize(data)
      const response = await enhancedApiClient.post(API_BASE, body)
      const saved = response?.data || response
      const newItem = normalize({ ...data, ...saved })
      items.value = [newItem, ...items.value]
      return newItem
    } catch (err) {
      error.value = err.message || '创建失败'
      console.warn('[DeviceSystemStore] 创建失败:', err)
      return null
    }
  }

  // 更新设备系统
  const updateItem = async (oid, updates) => {
    items.value = items.value.map(item =>
      item.oid === oid ? { ...item, ...updates } : item
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`${API_BASE}/${oid}`, body)
    } catch (err) {
      error.value = err.message || '更新失败'
      console.warn('[DeviceSystemStore] 更新失败:', err)
    }
  }

  // 删除设备系统
  const deleteItem = async (oid) => {
    const originalItems = [...items.value]
    items.value = items.value.filter(item => item.oid !== oid)
    try {
      await enhancedApiClient.delete(`${API_BASE}/${oid}`)
      return true
    } catch (err) {
      error.value = err.message || '删除失败'
      items.value = originalItems
      return false
    }
  }

  return {
    // 状态
    items,
    isLoading,
    error,
    // 计算属性
    stats,
    // 方法
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }
})
