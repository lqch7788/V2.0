/**
 * 温室/大棚 Store - Pinia 版本
 * 对接后端: /api/basic-data/greenhouses
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { getDictionaries } from '@/services/dictionaryService'

export const useGreenhouseStore = defineStore('greenhouse', () => {
  // 状态
  const greenhouses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 设施类型选项 - 改用字典动态加载(对齐 V1.1 useDictionaryStore + dictionaryService)
  const greenhouseTypes = ref([])
  const typesLoading = ref(false)

  // ==================== 字段映射 ====================

  /** 后端(snake_case) → 前端(camelCase) 字段名映射 */
  const FIELD_MAP = {
    id: 'id',
    oid: 'oid',
    code: 'code',
    name: 'name',
    greenhouse_type: 'greenhouseType',
    area: 'area',
    location: 'location',
    base_oid: 'baseOid',
    base_name: 'baseName',
    company_id: 'companyId',
    company_name: 'companyName',
    lng: 'lng',
    lat: 'lat',
    crop: 'crop',
    growth_day: 'growthDay',
    manager: 'manager',
    phone: 'phone',
    soil_type: 'soilType',
    ph: 'ph',
    intro: 'intro',
    greenhouse_count: 'greenhouseCount',
    field_area: 'fieldArea',
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

  // 加载温室列表
  const loadGreenhouses = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await enhancedApiClient.get('/basic-data/greenhouses')
      const data = Array.isArray(response) ? response : (response?.data || [])
      greenhouses.value = data.map(normalize)
    } catch (err) {
      error.value = err.message || '加载温室数据失败'
      console.warn('[GreenhouseStore] API 加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载温室类型字典 - 改用 dictionaryService.getDictionaries('greenhouse_type')
   * 对齐 V1.1 useDictionaryStore 的动态加载方式
   */
  const loadGreenhouseTypes = async () => {
    if (greenhouseTypes.value.length > 0) return greenhouseTypes.value
    typesLoading.value = true
    try {
      const dicts = await getDictionaries('greenhouse_type')
      greenhouseTypes.value = (dicts || []).map(d => ({
        dictCode: d.code,
        dictLabel: d.name
      }))
    } catch (err) {
      console.warn('[GreenhouseStore] 加载温室类型字典失败:', err)
    } finally {
      typesLoading.value = false
    }
    return greenhouseTypes.value
  }

  // 添加温室
  const addGreenhouse = async (ghData) => {
    try {
      const body = denormalize(ghData)
      const response = await enhancedApiClient.post('/basic-data/greenhouses', body)
      const saved = response?.data || response
      const newGh = normalize({ ...ghData, ...saved })
      greenhouses.value = [newGh, ...greenhouses.value]
      return newGh
    } catch (err) {
      error.value = err.message || '添加温室失败'
      console.warn('[GreenhouseStore] 添加失败:', err)
      return null
    }
  }

  // 编辑温室
  const editGreenhouse = async (id, ghData) => {
    greenhouses.value = greenhouses.value.map(g =>
      (g.id === id || g.oid === id) ? { ...g, ...ghData } : g
    )
    try {
      const body = denormalize(ghData)
      await enhancedApiClient.put(`/basic-data/greenhouses/${id}`, body)
    } catch (err) {
      error.value = err.message || '更新温室失败'
      console.warn('[GreenhouseStore] 更新失败:', err)
    }
  }

  // 删除温室
  const removeGreenhouse = async (id) => {
    const original = [...greenhouses.value]
    greenhouses.value = greenhouses.value.filter(g => g.id !== id && g.oid !== id)
    try {
      await enhancedApiClient.delete(`/basic-data/greenhouses/${id}`)
      return true
    } catch (err) {
      error.value = err.message || '删除温室失败'
      greenhouses.value = original
      console.warn('[GreenhouseStore] 删除失败:', err)
      return false
    }
  }

  return {
    greenhouses,
    loading,
    error,
    greenhouseTypes,
    typesLoading,
    loadGreenhouseTypes,
    loadGreenhouses,
    addGreenhouse,
    editGreenhouse,
    removeGreenhouse
  }
})
