/**
 * 领料出库数据 Store (Vue3 Pinia 版本)
 * 用于领料出库数据的 CRUD 操作
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// 后端字段映射
const FIELD_MAP = {
  id: 'id',
  code: 'code',
  date: 'date',
  applicant: 'applicant',
  warehouse_location: 'warehouseLocation',
  reviewer: 'reviewer',
  operator: 'operator',
  production_batch_code: 'productionBatchCode',
  source_application_codes: 'sourceApplicationCodes',
  execute_status: 'executeStatus',
  execute_status_class: 'executeStatusClass',
  materials: 'materials',
  create_by: 'createBy',
  create_time: 'createTime',
  update_time: 'updateTime'
}

/**
 * 规范化后端数据 -> 前端数据
 */
function normalize(db) {
  const result = { ...db }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result) {
      result[camel] = result[snake]
    }
  }
  result.id = result.id || `CK${Date.now()}`
  result.executeStatus = result.executeStatus || '已出库'
  result.executeStatusClass = result.executeStatusClass || 'completed'
  // 解析 JSON 字段
  if (typeof result.sourceApplicationCodes === 'string') {
    try { result.sourceApplicationCodes = JSON.parse(result.sourceApplicationCodes) } catch { result.sourceApplicationCodes = [] }
  }
  if (!Array.isArray(result.sourceApplicationCodes)) result.sourceApplicationCodes = []
  if (typeof result.materials === 'string') {
    try { result.materials = JSON.parse(result.materials) } catch { result.materials = [] }
  }
  if (!Array.isArray(result.materials)) result.materials = []
  return result
}

/**
 * 反规范化前端数据 -> 后端数据
 */
function denormalize(data) {
  const reverse = {}
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    reverse[camel] = snake
  }
  const result = {}
  for (const [key, value] of Object.entries(data)) {
    const backendKey = reverse[key] || key
    result[backendKey] = value
  }
  return result
}

export const useExecuteStore = defineStore('execute', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 获取所有领料出库记录
  const fetchItems = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await enhancedApiClient.get('/material-executes')
      const data = Array.isArray(response) ? response : []
      items.value = data.map(normalize)
    } catch (err) {
      console.warn('[ExecuteStore] API获取失败:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 创建领料出库记录
  const createItem = async (data) => {
    try {
      const body = denormalize(data)
      body.id = data.id || `CK${Date.now()}`
      const response = await enhancedApiClient.post('/material-executes', body)
      const newId = response?.id || body.id
      const newItem = normalize({ ...data, id: newId })
      items.value.unshift(newItem)
      return newItem
    } catch (err) {
      console.warn('[ExecuteStore] 创建失败:', err)
      // 乐观更新
      const newItem = normalize({ ...data, id: data.id || `CK${Date.now()}` })
      items.value.unshift(newItem)
      return newItem
    }
  }

  // 更新领料出库记录
  const updateItem = async (id, updates) => {
    // 乐观更新
    items.value = items.value.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`/material-executes/${id}`, body)
    } catch (err) {
      console.warn('[ExecuteStore] 更新失败:', err)
    }
  }

  // 删除单个记录
  const deleteItem = async (id) => {
    // 乐观更新
    items.value = items.value.filter(item => item.id !== id)
    try {
      await enhancedApiClient.delete(`/material-executes/${id}`)
      return true
    } catch (err) {
      console.warn('[ExecuteStore] 删除失败:', err)
      return false
    }
  }

  // 批量删除
  const deleteItems = async (ids) => {
    // 乐观更新
    items.value = items.value.filter(item => !ids.includes(item.id))
    try {
      await Promise.all(
        ids.map(id => enhancedApiClient.delete(`/material-executes/${id}`).catch(() => {}))
      )
      return true
    } catch {
      return false
    }
  }

  // 批量更新
  const updateItems = async (editedRecords) => {
    for (const [id, updates] of Object.entries(editedRecords)) {
      await updateItem(id, updates)
    }
  }

  // 生成编号
  const generateCode = () => {
    const d = new Date()
    const prefix = `CK${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const existing = items.value.filter(i => i.code.startsWith(prefix))
    return `${prefix}${String(existing.length + 1).padStart(3, '0')}`
  }

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    updateItems,
    generateCode
  }
}, {
  persist: true,
  persistOptions: {
    name: 'yuanxingtu-execute-data',
    version: 2
  }
})
