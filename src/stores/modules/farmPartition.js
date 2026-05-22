/**
 * 分区管理 Store - Pinia 版本
 * 对接后端: /api/farm-partitions
 * 与V1.1 useFarmPartitionStore 功能完全一致
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// 字段映射：后端 snake_case -> 前端 camelCase
const FIELD_MAP = {
  oid: 'oid',
  parent_oid: 'parentOid',
  name: 'name',
  area_type: 'areaType',
  greenhouse_type: 'greenhouseType',
  area: 'area',
  area_unit: 'areaUnit',
  manager_oid: 'managerOid',
  manager_name: 'managerName',
  hmi_device_oid: 'hmiDeviceOid',
  sensor_config: 'sensorConfig',
  camera_config: 'cameraConfig',
  water_fertilizer_config: 'waterFertilizerConfig',
  address: 'address',
  description: 'description',
  sort_order: 'sortOrder',
  status: 'status',
  created_at: 'createdAt',
  updated_at: 'updatedAt'
}

// 反向映射：前端 camelCase -> 后端 snake_case
const REVERSE_MAP = Object.entries(FIELD_MAP).reduce((acc, [k, v]) => {
  acc[v] = k
  return acc
}, {})

/**
 * 规范化后端数据为前端格式
 * @param {Object} db 后端返回的数据
 * @returns {Object} 前端格式数据
 */
function normalize(db) {
  const result = {}
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (db[snake] !== undefined) {
      result[camel] = db[snake]
    }
  }
  // 设置默认值
  result.areaType = result.areaType || 'greenhouse'
  result.area = Number(result.area) || 0
  result.sortOrder = Number(result.sortOrder) || 0
  result.status = result.status || 'active'
  // 解析 JSON 配置字段
  ;['sensorConfig', 'cameraConfig', 'waterFertilizerConfig'].forEach(f => {
    if (typeof result[f] === 'string' && result[f]) {
      try {
        result[f] = JSON.parse(result[f])
      } catch {
        result[f] = null
      }
    }
  })
  return result
}

/**
 * 反规范化前端数据为后端格式
 * @param {Object} data 前端数据
 * @returns {Object} 后端格式数据
 */
function denormalize(data) {
  const result = {}
  for (const [camel, snake] of Object.entries(REVERSE_MAP)) {
    if (data[camel] !== undefined) {
      // JSON 配置字段序列化
      if (['sensorConfig', 'cameraConfig', 'waterFertilizerConfig'].includes(camel) && typeof data[camel] === 'object') {
        result[snake] = JSON.stringify(data[camel])
      } else {
        result[snake] = data[camel]
      }
    }
  }
  return result
}

export const useFarmPartitionStore = defineStore('farmPartition', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * 获取分区列表
   * @param {Object} filters - 筛选条件 { parent_oid, area_type, status, keyword }
   */
  const fetchItems = async (filters) => {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v) params.set(k, v)
        })
      }
      const query = params.toString()
      const url = `/farm-partitions${query ? `?${query}` : ''}`

      // 调用后端 API
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response
        : Array.isArray(response?.data) ? response.data : []

      // 规范化数据
      items.value = data.map(item => normalize(item))
      isLoading.value = false
    } catch (err) {
      console.warn('[FarmPartitionStore] 获取分区列表失败:', err)
      error.value = err.message || '获取数据失败'
      isLoading.value = false
    }
  }

  /**
   * 创建分区
   * @param {Object} data 分区数据
   * @returns {Object|null} 创建成功返回新分区，失败返回null
   */
  const createItem = async (data) => {
    try {
      const body = denormalize(data)
      const response = await enhancedApiClient.post('/farm-partitions', body)
      const saved = response?.data || response
      const newItem = normalize({ ...data, ...saved })
      items.value = [newItem, ...items.value]
      return newItem
    } catch (err) {
      console.warn('[FarmPartitionStore] 创建分区失败:', err)
      error.value = err.message || '创建失败'
      return null
    }
  }

  /**
   * 更新分区
   * @param {string} oid 分区OID
   * @param {Object} updates 更新数据
   */
  const updateItem = async (oid, updates) => {
    // 先乐观更新
    items.value = items.value.map(item =>
      item.oid === oid ? { ...item, ...updates } : item
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`/farm-partitions/${oid}`, body)
    } catch (err) {
      console.warn('[FarmPartitionStore] 更新分区失败:', err)
      error.value = err.message || '更新失败'
    }
  }

  /**
   * 删除分区（软删除）
   * @param {string} oid 分区OID
   * @returns {boolean} 是否删除成功
   */
  const deleteItem = async (oid) => {
    // 先乐观删除
    items.value = items.value.filter(item => item.oid !== oid && item.parentOid !== oid)
    try {
      await enhancedApiClient.delete(`/farm-partitions/${oid}`)
      return true
    } catch (err) {
      console.warn('[FarmPartitionStore] 删除分区失败:', err)
      error.value = err.message || '删除失败'
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
