/**
 * 设备管理 Store
 * Vue3 + Pinia 版本
 * 数据流：Store → 组件 → API → 后端
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// API基础URL
const API_BASE = '/basic-data/devices'

// 设备状态
export const DeviceStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance'
}

// ==================== 字段映射 ====================

/** 后端(snake_case) → 前端(camelCase) 字段名映射 */
const FIELD_MAP = {
  id: 'id',
  oid: 'oid',
  device_name: 'deviceName',
  device_code: 'deviceCode',
  device_type: 'deviceType',
  manufacturer: 'manufacturer',
  serial_number: 'serialNumber',
  greenhouse_oid: 'greenhouseOid',
  greenhouse_name: 'greenhouseName',
  location: 'location',
  install_date: 'installDate',
  status: 'status',
  description: 'description',
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
  result.status = result.status || 'online'
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

export const useDeviceStore = defineStore('device', () => {
  // ========== 状态 ==========
  const devices = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ========== 计算属性 ==========
  // 统计数据
  const stats = computed(() => ({
    total: devices.value.length,
    online: devices.value.filter(d => d.status === DeviceStatus.ONLINE).length,
    offline: devices.value.filter(d => d.status === DeviceStatus.OFFLINE).length,
    maintenance: devices.value.filter(d => d.status === DeviceStatus.MAINTENANCE).length
  }))

  // ========== 方法 ==========
  // 获取设备列表
  const loadDevices = async (filters) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.keyword) params.set('keyword', filters.keyword)
        if (filters.deviceType && filters.deviceType !== 'all') params.set('device_type', filters.deviceType)
        if (filters.status && filters.status !== 'all') params.set('status', filters.status)
      }
      const query = params.toString()
      const response = await enhancedApiClient.get(`${API_BASE}${query ? `?${query}` : ''}`)
      const data = Array.isArray(response) ? response : (response?.data || [])
      devices.value = data.map(normalize)
    } catch (err) {
      error.value = err.message || '获取设备列表失败'
      console.warn('[DeviceStore] API 获取失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 创建设备
  const addDevice = async (data) => {
    try {
      const body = denormalize(data)
      const response = await enhancedApiClient.post(API_BASE, body)
      const saved = response?.data || response
      const newDevice = normalize({ ...data, ...saved })
      devices.value = [newDevice, ...devices.value]
      return newDevice
    } catch (err) {
      error.value = err.message || '创建设备失败'
      console.warn('[DeviceStore] 创建失败:', err)
      throw err
    }
  }

  // 更新设备
  const editDevice = async (oid, updates) => {
    devices.value = devices.value.map(d =>
      d.oid === oid ? { ...d, ...updates } : d
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`${API_BASE}/${oid}`, body)
    } catch (err) {
      error.value = err.message || '更新设备失败'
      console.warn('[DeviceStore] 更新失败:', err)
      throw err
    }
  }

  // 删除设备
  const removeDevice = async (oid) => {
    const original = [...devices.value]
    devices.value = devices.value.filter(d => d.oid !== oid)
    try {
      await enhancedApiClient.delete(`${API_BASE}/${oid}`)
      return true
    } catch (err) {
      error.value = err.message || '删除设备失败'
      devices.value = original
      console.warn('[DeviceStore] 删除失败:', err)
      return false
    }
  }

  return {
    // 状态
    devices,
    loading,
    error,
    // 计算属性
    stats,
    // 方法
    loadDevices,
    addDevice,
    editDevice,
    removeDevice
  }
})
