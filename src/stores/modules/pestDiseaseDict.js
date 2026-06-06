/**
 * 病虫害字典 Store
 * 修复 P0-3/4/5/7/8: 对齐 seedling.js 风格（enhancedApiClient + snake_case fallback + 完整 relations 体系）
 * 完整还原 V1.1 usePestDiseaseDictStore.ts 的所有 action
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

const API_BASE = '/pest-disease-dict'

// 修复 P0-5: 字段映射兼容 snake_case（与其他 store 风格一致）
function mapItem(item) {
  if (!item) return null
  return {
    id: item.id,
    dictCode: item.dictCode || item.dict_code || '',
    dictName: item.dictName || item.dict_name || '',
    dictType: item.dictType || item.dict_type || '',
    targetCrops: item.targetCrops || item.target_crops || '',
    description: item.description || '',
    status: item.status || 'active',
    createTime: item.createTime || item.create_time || '',
    updateTime: item.updateTime || item.update_time || ''
  }
}

// 修复 P0-4: 响应解析适配 enhancedApiClient（自动解包 {success, data} → 返回 data 字段）
// 同时兼容直接返回数组的情况
function unwrapData(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  if (response && response.items && Array.isArray(response.items)) return response.items
  return []
}

export const usePestDiseaseDictStore = defineStore('pestDiseaseDict', () => {
  // ========== 状态定义 ==========
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 修复 P0-3/4/6/5（第四批审核）：V1.1 store 中持有的 UI 状态
  // V2.0 view 通过 v-model 双向绑定这些字段，缺失会导致页面打开即报 undefined
  const activeTab = ref('pest')  // 当前 tab: 'pest' | 'disease'
  const searchKeyword = ref('')  // 搜索关键字
  const filters = reactive({
    targetCrops: '',
    status: ''
  })
  const saveLoading = ref(false)  // 新增/编辑保存按钮 loading

  // 修复 P0-1: stats computed（V1.1 PestDiseaseDictPage.tsx L99-103 风格）
  const stats = computed(() => ({
    pestCount: items.value.filter(it => it.dictType === 'pest').length,
    diseaseCount: items.value.filter(it => it.dictType === 'disease').length
  }))

  // 修复 P0-2: filteredItems computed（V1.1 PestDiseaseDictPage.tsx L96 风格）
  // 按 activeTab + searchKeyword + filters 过滤
  const filteredItems = computed(() => {
    let list = items.value.filter(item => item.dictType === activeTab.value)
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      list = list.filter(item =>
        (item.dictName && item.dictName.toLowerCase().includes(kw)) ||
        (item.dictCode && item.dictCode.toLowerCase().includes(kw))
      )
    }
    if (filters.targetCrops) {
      list = list.filter(item =>
        item.targetCrops && item.targetCrops.includes(filters.targetCrops)
      )
    }
    if (filters.status) {
      list = list.filter(item => item.status === filters.status)
    }
    return list
  })

  // 修复 P0-5: loading 别名（view 用 loading，store 内部用 isLoading）
  const loading = computed(() => isLoading.value)

  // 加载列表
  const loadData = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = { limit: 10000, ...params }
      if (activeTab.value) queryParams.dictType = activeTab.value
      const response = await enhancedApiClient.get(API_BASE, { params: queryParams })
      const records = unwrapData(response)
      items.value = records.map(mapItem).filter(Boolean)
    } catch (e) {
      error.value = e.message
      console.error('[PestDiseaseDictStore] 加载列表失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 修复 P0-7: 按作物查询（V1.1 fetchByCrop）
  const fetchByCrop = async (cropName) => {
    try {
      const response = await enhancedApiClient.get(
        `${API_BASE}/by-crop/${encodeURIComponent(cropName)}`
      )
      const records = unwrapData(response)
      return records.map(mapItem).filter(Boolean)
    } catch (e) {
      console.error('[PestDiseaseDictStore] 按作物查询失败:', e)
      return []
    }
  }

  // 获取下一个编码
  const fetchNextCode = async (type) => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/next-code`, {
        params: { type }
      })
      // 后端返回 { next_code: 'PD-P-0001' }
      return response?.next_code || response?.nextCode || ''
    } catch (e) {
      console.error('[PestDiseaseDictStore] 获取下一编码失败:', e)
      return ''
    }
  }

  // 获取详情
  const getDetail = async (id) => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${id}`)
      return mapItem(response)
    } catch (e) {
      console.error('[PestDiseaseDictStore] 获取详情失败:', e)
      return null
    }
  }

  // 新增
  const createItem = async (payload) => {
    saveLoading.value = true  // 修复 P0-6
    try {
      const response = await enhancedApiClient.post(API_BASE, {
        dict_code: payload.dictCode,
        dict_name: payload.dictName,
        dict_type: payload.dictType,
        target_crops: payload.targetCrops,
        description: payload.description,
        status: payload.status || 'active'
      })
      const newItem = mapItem(response)
      if (newItem) items.value.unshift(newItem)
      return newItem
    } catch (e) {
      console.error('[PestDiseaseDictStore] 新增失败:', e)
      throw e
    } finally {
      saveLoading.value = false
    }
  }

  // 更新
  const updateItem = async (id, payload) => {
    saveLoading.value = true  // 修复 P0-6
    try {
      const response = await enhancedApiClient.put(`${API_BASE}/${id}`, {
        dict_name: payload.dictName,
        dict_type: payload.dictType,
        target_crops: payload.targetCrops,
        description: payload.description,
        status: payload.status
      })
      const updated = mapItem(response)
      if (updated) {
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) items.value[index] = { ...items.value[index], ...updated }
      }
      return updated
    } catch (e) {
      console.error('[PestDiseaseDictStore] 更新失败:', e)
      throw e
    } finally {
      saveLoading.value = false
    }
  }

  // 删除
  const deleteItem = async (id) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/${id}`)
      items.value = items.value.filter(item => item.id !== id)
      return true
    } catch (e) {
      console.error('[PestDiseaseDictStore] 删除失败:', e)
      throw e
    }
  }

  // ========== 关联药剂方法（修复 P0-1/8: 完整还原 V1.1 store 体系） ==========

  // 获取病虫害关联的药剂列表
  const fetchRelatedPesticides = async (pestId) => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${pestId}/relations`)
      const records = unwrapData(response)
      return records.map(r => ({
        id: r.id,
        pesticideCode: r.pesticideCode || r.pesticide_code || '',
        pesticideName: r.pesticideName || r.pesticide_name || '',
        controlType: r.controlType || r.control_type || ''
      }))
    } catch (e) {
      console.error('[PestDiseaseDictStore] 获取关联药剂失败:', e)
      return []
    }
  }

  // 添加关联（从病虫害侧发起）
  const addRelation = async (pesticideId, pestId) => {
    try {
      await enhancedApiClient.post(`${API_BASE}/${pestId}/relations`, { pesticideId })
      return true
    } catch (e) {
      console.error('[PestDiseaseDictStore] 添加关联失败:', e)
      return false
    }
  }

  // 删除关联
  const removeRelation = async (pesticideId, pestId) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/${pestId}/relations/${pesticideId}`)
      return true
    } catch (e) {
      console.error('[PestDiseaseDictStore] 删除关联失败:', e)
      return false
    }
  }

  // 修复 P0-1/8: 批量更新关联（在病虫害侧基于差集算法，1 次 + N 次 add/remove 替代 N 次完整更新）
  const updateRelations = async (pestId, pesticideIds) => {
    try {
      // 获取当前关联
      const current = await fetchRelatedPesticides(pestId)
      const currentIds = current.map(p => p.id)
      const targetIds = pesticideIds || []

      // 添加新关联
      for (const pesticideId of targetIds) {
        if (!currentIds.includes(pesticideId)) {
          await addRelation(pesticideId, pestId)
        }
      }
      // 删除不再关联
      for (const pesticideId of currentIds) {
        if (!targetIds.includes(pesticideId)) {
          await removeRelation(pesticideId, pestId)
        }
      }
      return true
    } catch (e) {
      console.error('[PestDiseaseDictStore] 批量更新关联失败:', e)
      return false
    }
  }

  return {
    // 状态
    items,
    isLoading,
    loading,           // 修复 P0-5: 别名（view 用 loading）
    error,
    activeTab,         // 修复 P0-3: 当前 tab
    searchKeyword,     // 修复 P0-4: 搜索关键字
    filters,           // 修复 P0-4: 适用作物/状态筛选
    saveLoading,       // 修复 P0-6: 保存按钮 loading
    stats,             // 修复 P0-1: 统计（pestCount/diseaseCount）
    filteredItems,     // 修复 P0-2: 过滤后列表
    // 基础 CRUD
    loadData,
    fetchByCrop,
    fetchNextCode,
    getDetail,
    createItem,
    updateItem,
    deleteItem,
    // 关联药剂
    fetchRelatedPesticides,
    addRelation,
    removeRelation,
    updateRelations
  }
})
