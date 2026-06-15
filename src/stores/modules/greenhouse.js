/**
 * 温室/大棚 Store - Pinia 版本
 * 迁移自 V1.1 useGreenhouseStore.ts（zustand）
 *
 * 数据流：Store → 组件 → API → 后端 (/api/basic-data/greenhouses)
 * 持久化：localStorage key 'greenhouses'
 *
 * 与 V1.1 useGreenhouseStore.ts 1:1 对齐：
 * - state: greenhouses / loading / error / lastFetch
 * - action: loadGreenhouses / addGreenhouse / editGreenhouse / removeGreenhouse / refreshGreenhouses
 * - 辅助函数: getGreenhouseByOid / getGreenhousesByBase / getActiveGreenhouses
 *
 * 在 V2.0 基础上扩展：
 * - getter: greenhousesByZone / activeGreenhouses
 * - 温室类型字典动态加载（对齐 V1.1 useDictionaryStore 模式）
 * - snake_case ↔ camelCase 字段映射（适配后端响应）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { getDictionaries } from '@/services/dictionaryService'

const STORAGE_KEY = 'greenhouses'

export const useGreenhouseStore = defineStore('greenhouse', () => {
  // ==================== 状态 ====================

  /** 温室列表 */
  const greenhouses = ref([])
  /** 加载状态 */
  const loading = ref(false)
  /** 错误信息 */
  const error = ref(null)
  /** 上次加载时间戳（5 分钟缓存，对齐 V1.1） */
  const lastFetch = ref(null)

  // ----- 设施类型选项（V2.0 已有，字典动态加载） -----
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

  // ==================== Getters ====================

  /**
   * 按区域（baseOid）分组温室
   * @param {string} baseOid - 基地 OID
   * @returns {Array}
   */
  const greenhousesByZone = computed(() => {
    return (baseOid) => greenhouses.value.filter(g =>
      g.baseOid === baseOid || g.base_oid === baseOid
    )
  })

  /** 活跃温室列表（status === 'active'，对齐 V1.1 getActiveGreenhouses） */
  const activeGreenhouses = computed(() =>
    greenhouses.value.filter(g => g.status === 'active')
  )

  // ==================== Actions ====================

  /**
   * 加载温室列表（对齐 V1.1 loadGreenhouses）
   * - 5 分钟缓存：lastFetch 距今 < 5min 且数据非空时直接返回
   */
  const loadGreenhouses = async () => {
    const now = Date.now()
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && greenhouses.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    try {
      const response = await enhancedApiClient.get('/basic-data/greenhouses')
      const data = Array.isArray(response) ? response : (response?.data || [])
      const safeData = Array.isArray(data) ? data : []
      greenhouses.value = safeData.map(normalize)
      lastFetch.value = now
      // 同步到 localStorage（V2.0 增强可观察性）
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(greenhouses.value)) } catch (_) { /* 忽略 */ }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载温室失败'
      console.warn('[GreenhouseStore] API 加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  /** 强制刷新温室列表（对齐 V1.1 refreshGreenhouses） */
  const refreshGreenhouses = async () => {
    lastFetch.value = null
    await loadGreenhouses()
  }

  /**
   * 加载温室类型字典（V2.0 已有，字典动态加载）
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

  // ----- CRUD（对齐 V1.1 addGreenhouse / editGreenhouse / removeGreenhouse） -----

  /**
   * 添加温室
   * @param {Partial<Object>} ghData
   * @returns {Promise<Object|null>}
   */
  const addGreenhouse = async (ghData) => {
    try {
      const body = denormalize(ghData)
      const response = await enhancedApiClient.post('/basic-data/greenhouses', body)
      const saved = response?.data || response
      const newGh = normalize({ ...ghData, ...saved })
      greenhouses.value = [newGh, ...greenhouses.value]
      return newGh
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加温室失败'
      console.warn('[GreenhouseStore] 添加失败:', err)
      return null
    }
  }

  /**
   * 编辑温室
   * @param {string} id - 温室 ID/OID
   * @param {Partial<Object>} ghData
   */
  const editGreenhouse = async (id, ghData) => {
    greenhouses.value = greenhouses.value.map(g =>
      (g.id === id || g.oid === id) ? { ...g, ...ghData } : g
    )
    try {
      const body = denormalize(ghData)
      await enhancedApiClient.put(`/basic-data/greenhouses/${id}`, body)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新温室失败'
      console.warn('[GreenhouseStore] 更新失败:', err)
    }
  }

  /**
   * 删除温室
   * @param {string} id - 温室 ID/OID
   * @returns {Promise<boolean>}
   */
  const removeGreenhouse = async (id) => {
    const original = [...greenhouses.value]
    greenhouses.value = greenhouses.value.filter(g => g.id !== id && g.oid !== id)
    try {
      await enhancedApiClient.delete(`/basic-data/greenhouses/${id}`)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除温室失败'
      greenhouses.value = original
      console.warn('[GreenhouseStore] 删除失败:', err)
      return false
    }
  }

  return {
    // 状态
    greenhouses,
    loading,
    error,
    lastFetch,
    greenhouseTypes,
    typesLoading,
    // Getters
    greenhousesByZone,
    activeGreenhouses,
    // Actions
    loadGreenhouses,
    refreshGreenhouses,
    loadGreenhouseTypes,
    addGreenhouse,
    editGreenhouse,
    removeGreenhouse
  }
})

// ==================== 辅助函数（对齐 V1.1）====================

/**
 * 根据 OID 查找温室
 * @param {string} oid
 * @returns {Object|undefined}
 */
export const getGreenhouseByOid = (oid) => {
  return useGreenhouseStore().greenhouses.find(g => g.oid === oid)
}

/**
 * 根据基地 OID 获取温室列表
 * @param {string} baseOid
 * @returns {Array}
 */
export const getGreenhousesByBase = (baseOid) => {
  return useGreenhouseStore().greenhouses.filter(g => g.baseOid === baseOid)
}

/**
 * 获取活跃温室列表
 * @returns {Array}
 */
export const getActiveGreenhouses = () => {
  return useGreenhouseStore().greenhouses.filter(g => g.status === 'active')
}
