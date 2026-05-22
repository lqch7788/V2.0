/**
 * 摄像头 Store — iAGS Camera 集成
 * Vue3 + Pinia 版本
 * 数据流：Store → 组件 → API → 后端
 * 对接后端: /api/cameras
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ==================== 字段映射 ====================

/** 后端(snake_case) → 前端(camelCase) 字段名映射 */
const FIELD_MAP = {
  id: 'id',
  oid: 'oid',
  camera_name: 'cameraName',
  camera_code: 'cameraCode',
  rtsp_url: 'rtspUrl',
  http_url: 'httpUrl',
  partition_oid: 'partitionOid',
  greenhouse_oid: 'greenhouseOid',
  brand: 'brand',
  model: 'model',
  username: 'username',
  password: 'password',
  channel_count: 'channelCount',
  partition_name: 'partitionName',
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
  result.channelCount = Number(result.channelCount) || 1
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

export const useCameraStore = defineStore('camera', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 获取摄像头列表
  const fetchItems = async (filters) => {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `/cameras${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response
        : Array.isArray(response?.data) ? response.data : []
      items.value = data.map(normalize)
    } catch (e) {
      error.value = e.message
      console.warn('[CameraStore] API 获取失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 创建摄像头
  const createItem = async (data) => {
    try {
      const body = denormalize(data)
      const response = await enhancedApiClient.post('/cameras', body)
      const saved = response?.data || response
      const newItem = normalize({ ...data, ...saved })
      items.value = [newItem, ...items.value]
      return newItem
    } catch (e) {
      error.value = e.message
      console.warn('[CameraStore] 创建失败:', e)
      return null
    }
  }

  // 更新摄像头
  const updateItem = async (oid, updates) => {
    items.value = items.value.map(item =>
      item.oid === oid ? { ...item, ...updates } : item
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`/cameras/${oid}`, body)
    } catch (e) {
      error.value = e.message
      console.warn('[CameraStore] 更新失败:', e)
    }
  }

  // 删除摄像头
  const deleteItem = async (oid) => {
    items.value = items.value.filter(item => item.oid !== oid)
    try {
      await enhancedApiClient.delete(`/cameras/${oid}`)
      return true
    } catch (e) {
      error.value = e.message
      console.warn('[CameraStore] 删除失败:', e)
      return false
    }
  }

  // 统计数据
  const stats = computed(() => {
    const total = items.value.length
    const online = items.value.filter(i => i.status === 'active').length
    const offline = total - online
    return { total, online, offline }
  })

  return {
    items,
    isLoading,
    error,
    stats,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }
})
