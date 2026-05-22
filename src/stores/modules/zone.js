/**
 * 区块管理 Store - Pinia 版本
 * 对应V1.1的 useZoneStore
 * 对接后端: /api/basic-data/zones
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

export const useZoneStore = defineStore('zone', () => {
  // 状态
  const zones = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==================== 字段映射 ====================

  /** 后端(snake_case) → 前端(camelCase) 字段名映射 */
  const FIELD_MAP = {
    id: 'id',
    oid: 'oid',
    zone_code: 'zoneCode',
    zone_name: 'zoneName',
    greenhouse_oid: 'greenhouseOid',
    base_oid: 'baseOid',
    base_name: 'baseName',
    zone_type: 'zoneType',
    area: 'area',
    sort_order: 'sortOrder',
    status: 'status',
    description: 'description',
    created_at: 'createdAt',
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
    result.id = result.id || result.oid || String(Date.now())
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
   * 加载区块列表
   * @param {Object} filters - 筛选条件（可选）
   */
  const loadZones = async (filters) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.baseOid && filters.baseOid !== 'all') params.set('base_oid', filters.baseOid)
        if (filters.status && filters.status !== 'all') params.set('status', filters.status)
      }
      const query = params.toString()
      const response = await enhancedApiClient.get(`/basic-data/zones${query ? `?${query}` : ''}`)
      const data = Array.isArray(response) ? response : (response?.data || [])
      zones.value = data.map(normalize)
    } catch (err) {
      error.value = err.message || '获取区块数据失败'
      console.warn('[ZoneStore] API 加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加区块
   * @param {Object} zoneData - 区块数据
   * @returns {Object} 新增的区块
   */
  const addZone = async (zoneData) => {
    try {
      const body = denormalize(zoneData)
      const response = await enhancedApiClient.post('/basic-data/zones', body)
      const saved = response?.data || response
      const newZone = normalize({ ...zoneData, ...saved })
      zones.value = [newZone, ...zones.value]
      return newZone
    } catch (err) {
      error.value = err.message || '添加区块失败'
      console.warn('[ZoneStore] 添加失败:', err)
      throw err
    }
  }

  /**
   * 编辑区块
   * @param {string} id - 区块ID
   * @param {Object} zoneData - 更新的数据
   * @returns {Object} 更新后的区块
   */
  const editZone = async (id, zoneData) => {
    zones.value = zones.value.map(z =>
      (z.id === id || z.oid === id) ? { ...z, ...zoneData } : z
    )
    try {
      const body = denormalize(zoneData)
      await enhancedApiClient.put(`/basic-data/zones/${id}`, body)
    } catch (err) {
      error.value = err.message || '编辑区块失败'
      console.warn('[ZoneStore] 编辑失败:', err)
      throw err
    }
  }

  /**
   * 删除区块
   * @param {string} id - 区块ID
   */
  const removeZone = async (id) => {
    const original = [...zones.value]
    zones.value = zones.value.filter(z => z.id !== id && z.oid !== id)
    try {
      await enhancedApiClient.delete(`/basic-data/zones/${id}`)
      return true
    } catch (err) {
      error.value = err.message || '删除区块失败'
      zones.value = original
      console.warn('[ZoneStore] 删除失败:', err)
      return false
    }
  }

  return {
    zones,
    loading,
    error,
    loadZones,
    addZone,
    editZone,
    removeZone
  }
})
