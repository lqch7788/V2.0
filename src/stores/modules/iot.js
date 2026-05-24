/**
 * IoT设备监控 Store
 * V2.0 - Pinia Implementation
 *
 * 架构：enhancedApiClient → /api/iot/* → SQLite iot_sensors 表
 * 数据流：Store → 组件
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ========== 类型定义（camelCase，匹配前端 IoTSensor 格式）==========

/**
 * @typedef {'air_temp'|'air_humidity'|'soil_moisture'|'soil_temp'|'soil_ec'|'soil_ph'|'light'|'co2'} DeviceType
 * @typedef {'normal'|'warning'|'critical'|'offline'} DeviceStatus
 */

/**
 * 传感器设备（前端格式，camelCase）
 * @typedef {Object} Device
 * @property {string} id
 * @property {string} sensorId
 * @property {string} greenhouseId
 * @property {string} greenhouseName
 * @property {DeviceType} type
 * @property {string} typeName
 * @property {number} value
 * @property {string} unit
 * @property {DeviceStatus} status
 * @property {string} lastUpdate
 * @property {string} [createTime]
 * @property {string} [updateTime]
 */

/**
 * 环境数据点
 * @typedef {Object} EnvironmentDataPoint
 * @property {string} timestamp
 * @property {number} value
 * @property {string} unit
 */

// ========== 字段映射表：后端(snake_case) → 前端(camelCase) ==========

const FIELD_MAP = {
  sensor_id: 'sensorId',
  greenhouse_id: 'greenhouseId',
  greenhouse_name: 'greenhouseName',
  type_name: 'typeName',
  last_update: 'lastUpdate',
  create_time: 'createTime',
  update_time: 'updateTime'
}

/**
 * 后端数据 → 前端 Device
 * @param {Object} raw - 后端返回的原始数据
 * @returns {Device}
 */
function normalize(raw) {
  const result = { ...raw }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  return {
    id: result.id || '',
    sensorId: result.sensorId || result.sensor_id || '',
    greenhouseId: result.greenhouseId || result.greenhouse_id || '',
    greenhouseName: result.greenhouseName || result.greenhouse_name || '',
    type: result.type || 'air_temp',
    typeName: result.typeName || result.type_name || '',
    value: Number(result.value ?? 0),
    unit: result.unit || '',
    status: result.status || 'normal',
    lastUpdate: result.lastUpdate || result.last_update || '',
    createTime: result.createTime || result.create_time,
    updateTime: result.updateTime || result.update_time
  }
}

export const useIotStore = defineStore('iot', () => {
  // 设备列表
  const devices = ref([])

  // 选中的设备
  const selectedDevice = ref(null)

  // 环境数据
  const environmentData = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const error = ref(null)

  /**
   * 获取设备列表
   * @param {Object} filters - 筛选条件
   * @param {string} [filters.greenhouse_id] - 温室ID
   * @param {string} [filters.device_type] - 设备类型
   * @param {string} [filters.status] - 设备状态
   */
  async function fetchDevices(filters) {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters?.greenhouse_id) params.set('greenhouse_id', filters.greenhouse_id)
      if (filters?.device_type) params.set('device_type', filters.device_type)
      if (filters?.status) params.set('status', filters.status)

      const data = await enhancedApiClient.get(`/iot/devices?${params.toString()}`)
      const normalized = Array.isArray(data) ? data.map(normalize) : []
      devices.value = normalized
    } catch (err) {
      console.warn('[IotStore] 获取设备列表失败:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取设备最新数据
   * @param {string} deviceId - 设备ID
   * @returns {Promise<Device|null>}
   */
  async function fetchDeviceLatest(deviceId) {
    try {
      const data = await enhancedApiClient.get(`/iot/devices/${deviceId}/latest`)
      return data ? normalize(data) : null
    } catch (err) {
      console.warn('[IotStore] 获取设备最新数据失败:', err)
      return null
    }
  }

  /**
   * 获取环境数据
   * @param {Object} params - 查询参数
   * @param {string} [params.greenhouse_id] - 温室ID
   * @param {string} params.data_type - 数据类型
   * @param {string} [params.interval] - 间隔
   */
  async function fetchEnvironmentData(params) {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.greenhouse_id) queryParams.set('greenhouse_id', params.greenhouse_id)
      queryParams.set('data_type', params.data_type)
      if (params.interval) queryParams.set('interval', params.interval)

      const data = await enhancedApiClient.get(`/iot/environment?${queryParams.toString()}`)
      if (Array.isArray(data)) {
        environmentData.value = data
      }
    } catch (err) {
      console.warn('[IotStore] 获取环境数据失败:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 设置选中的设备
   * @param {Device|null} device
   */
  function setSelectedDevice(device) {
    selectedDevice.value = device
  }

  /**
   * 清空环境数据
   */
  function clearEnvironmentData() {
    environmentData.value = []
  }

  return {
    devices,
    selectedDevice,
    environmentData,
    isLoading,
    error,
    fetchDevices,
    fetchDeviceLatest,
    fetchEnvironmentData,
    setSelectedDevice,
    clearEnvironmentData
  }
})

// ========== 辅助函数 ==========

/**
 * 根据温室ID获取设备列表
 * @param {string} greenhouseId
 * @returns {Device[]}
 */
export function getDevicesByGreenhouse(greenhouseId) {
  return useIotStore().devices.filter(d => d.greenhouseId === greenhouseId)
}

/**
 * 根据设备类型获取设备列表
 * @param {DeviceType} type
 * @returns {Device[]}
 */
export function getDevicesByType(type) {
  return useIotStore().devices.filter(d => d.type === type)
}

/**
 * 获取在线设备列表
 * @returns {Device[]}
 */
export function getOnlineDevices() {
  return useIotStore().devices.filter(d => d.status === 'normal')
}
