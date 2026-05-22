/**
 * 设备分配 API 服务
 * 对接后端 /api/device-distributions
 */
import { enhancedApiClient } from '@/lib/apiClient'

// 设备分配数据类型
export const DeviceDistributionType = {
  id: Number,
  oid: String,
  deviceName: String,
  deviceCode: String,
  siteName: String,
  areaName: String,
  deviceType: String,
  motorName: String,
  sortOrder: Number,
  allowRuntime: String,
  restTime: String,
  initialStatus: String,
  circuit: String,
  slaveDevices: String,
  startTime: String,
  showCurve: Number,
  specs: String,
  remarks: String,
  status: String,
  createdAt: String,
  updatedAt: String
}

// 字段映射：snake_case (后端) <-> camelCase (前端)
const FIELD_MAP = {
  id: 'id', oid: 'oid',
  device_name: 'deviceName', device_code: 'deviceCode',
  site_name: 'siteName', area_name: 'areaName',
  device_type: 'deviceType', motor_name: 'motorName',
  sort_order: 'sortOrder', allow_runtime: 'allowRuntime',
  rest_time: 'restTime', initial_status: 'initialStatus',
  circuit: 'circuit', slave_devices: 'slaveDevices',
  start_time: 'startTime', show_curve: 'showCurve',
  specs: 'specs', remarks: 'remarks',
  status: 'status', created_at: 'createdAt', updated_at: 'updatedAt'
}

/**
 * 规范化后端数据为前端格式
 */
function normalize(db) {
  const result = { ...db }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  result.id = result.id ?? 0
  result.sortOrder = result.sortOrder ?? 0
  result.showCurve = result.showCurve ?? 0
  result.status = result.status || 'active'
  return result
}

/**
 * 反规范化前端数据为后端格式
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

export const apiDeviceDistributionService = {
  /**
   * 获取设备分配列表
   */
  getList: async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.keyword) params.set('keyword', filters.keyword)
        if (filters.deviceType) params.set('device_type', filters.deviceType)
      }
      const query = params.toString()
      const response = await enhancedApiClient.get(`/device-distributions${query ? `?${query}` : ''}`)
      const data = Array.isArray(response) ? response : (response?.data || [])
      return { success: true, data: data.map(normalize) }
    } catch (err) {
      console.warn('[apiDeviceDistributionService] 获取列表失败:', err)
      return { success: false, error: err.message }
    }
  },

  /**
   * 创建分配记录
   */
  create: async (record) => {
    try {
      const body = denormalize(record)
      const response = await enhancedApiClient.post('/device-distributions', body)
      const saved = response?.data || response
      return { success: true, data: normalize({ ...record, ...saved }) }
    } catch (err) {
      console.warn('[apiDeviceDistributionService] 创建失败:', err)
      return { success: false, error: err.message }
    }
  },

  /**
   * 更新分配记录
   */
  update: async (oid, updates) => {
    try {
      const body = denormalize(updates)
      const response = await enhancedApiClient.put(`/device-distributions/${oid}`, body)
      const saved = response?.data || response
      return { success: true, data: normalize({ ...updates, ...saved }) }
    } catch (err) {
      console.warn('[apiDeviceDistributionService] 更新失败:', err)
      return { success: false, error: err.message }
    }
  },

  /**
   * 删除分配记录
   */
  delete: async (oid) => {
    try {
      await enhancedApiClient.delete(`/device-distributions/${oid}`)
      return { success: true }
    } catch (err) {
      console.warn('[apiDeviceDistributionService] 删除失败:', err)
      return { success: false, error: err.message }
    }
  }
}
