/**
 * 工序定义 Store - Pinia 版本
 * 对应系统设置 → 工序管理
 * 数据流：组件 → Store → Backend API
 * 与V1.1 useProcessDefinitionStore 功能完全一致
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

export const useProcessDefinitionStore = defineStore('processDefinition', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  // 工序类型选项（从字典读取，备用硬编码）
  const FALLBACK_PROCESS_TYPES = [
    { value: '耕地', label: '耕地' },
    { value: '播种', label: '播种' },
    { value: '施肥', label: '施肥' },
    { value: '灌溉', label: '灌溉' },
    { value: '除草', label: '除草' },
    { value: '植保', label: '植保' },
    { value: '修剪', label: '修剪' },
    { value: '授粉', label: '授粉' },
    { value: '采收', label: '采收' },
    { value: '包装', label: '包装' },
  ]

  // 计量单位选项
  const UNIT_OPTIONS = [
    { value: '亩', label: '亩' },
    { value: '株', label: '株' },
    { value: '公斤', label: '公斤' },
    { value: '小时', label: '小时' },
    { value: '次', label: '次' },
    { value: '平方米', label: '平方米' },
  ]

  // 计算属性：启用中的工序数量
  const activeCount = computed(() => {
    return items.value.filter(p => p.status === 'active').length
  })

  // 计算属性：停用的工序数量
  const inactiveCount = computed(() => {
    return items.value.length - activeCount.value
  })

  // ==================== 字段映射 ====================

  /** 后端(snake_case) → 前端(camelCase) 字段名映射 */
  const FIELD_MAP = {
    id: 'id',
    oid: 'oid',
    process_code: 'processCode',
    process_name: 'processName',
    process_type: 'processType',
    unit: 'unit',
    default_price: 'defaultPrice',
    default_bonus: 'defaultBonus',
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

  /**
   * 获取工序定义列表
   * @param {Object} filters - 筛选条件（可选）
   */
  const fetchItems = async (filters) => {
    const now = Date.now()
    // 缓存5分钟
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && items.value.length > 0) {
      return
    }

    isLoading.value = true
    error.value = null
    try {
      // 构建查询参数
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v) params.set(k, v)
        })
      }
      const query = params.toString()

      // 调用真实API获取工序定义列表
      const response = await enhancedApiClient.get(`/basic-data/process-definitions${query ? `?${query}` : ''}`)
      const data = Array.isArray(response) ? response : (response?.data || [])
      items.value = data.map(normalize)
      lastFetch.value = now
    } catch (err) {
      error.value = err.message || '获取工序定义失败'
      console.warn('[ProcessDefinitionStore] API 获取失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建工序定义
   * @param {Object} data - 工序数据
   * @returns {Object|null} 创建的工序项
   */
  const createItem = async (data) => {
    try {
      const body = denormalize(data)
      const response = await enhancedApiClient.post('/basic-data/process-definitions', body)
      const saved = response?.data || response
      const newItem = normalize({ ...data, ...saved })
      items.value = [newItem, ...items.value]
      return newItem
    } catch (err) {
      error.value = err.message || '创建工序定义失败'
      console.warn('[ProcessDefinitionStore] 创建失败:', err)
      return null
    }
  }

  /**
   * 更新工序定义
   * @param {string|number} id - 工序ID
   * @param {Object} updates - 更新数据
   */
  const updateItem = async (id, updates) => {
    items.value = items.value.map(item =>
      item.id === id || String(item.id) === String(id)
        ? { ...item, ...updates }
        : item
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`/basic-data/process-definitions/${id}`, body)
    } catch (err) {
      error.value = err.message || '更新工序定义失败'
      console.warn('[ProcessDefinitionStore] 更新失败:', err)
    }
  }

  /**
   * 删除工序定义
   * @param {string|number} id - 工序ID
   * @returns {boolean} 是否删除成功
   */
  const deleteItem = async (id) => {
    const originalItems = [...items.value]
    items.value = items.value.filter(item => item.id !== id && String(item.id) !== String(id))
    try {
      await enhancedApiClient.delete(`/basic-data/process-definitions/${id}`)
      return true
    } catch (err) {
      error.value = err.message || '删除工序定义失败'
      items.value = originalItems
      console.warn('[ProcessDefinitionStore] 删除失败:', err)
      return false
    }
  }

  /**
   * 刷新工序定义列表（清除缓存后重新加载）
   */
  const refreshItems = async () => {
    lastFetch.value = null
    await fetchItems()
  }

  return {
    items,
    isLoading,
    error,
    lastFetch,
    activeCount,
    inactiveCount,
    FALLBACK_PROCESS_TYPES,
    UNIT_OPTIONS,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    refreshItems
  }
})
