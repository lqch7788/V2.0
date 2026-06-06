/**
 * 药剂知识库 Store
 * V2.0 新增
 * 使用 Pinia + enhancedApiClient 与后端 API 交互
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// API 基础路径
const API_BASE = '/pesticide-library'

/**
 * 将后端返回的snake_case字段转换为前端camelCase
 */
function transformRecord(record) {
  if (!record) return null
  return {
    id: record.id,
    pesticideCode: record.pesticideCode || record.pesticide_code,
    pesticideName: record.pesticideName || record.pesticide_name,
    controlType: record.controlType || record.control_type,
    functionDesc: record.functionDesc || record.function_desc,
    tabooDesc: record.tabooDesc || record.taboo_desc,
    targetPests: record.targetPests || record.target_pests,
    ingredient: record.ingredient,
    mechanism: record.mechanism,
    status: record.status,
    createTime: record.createTime || record.create_time,
    updateTime: record.updateTime || record.update_time,
    specs: (record.specs || []).map(transformSpec)
  }
}

/**
 * 转换规格明细
 */
function transformSpec(spec) {
  if (!spec) return null
  return {
    id: spec.id,
    pesticideId: spec.pesticide_id,
    specContent: spec.spec_content,
    formulation: spec.formulation,
    manufacturer: spec.manufacturer,
    suggestedDosage: spec.suggested_dosage,
    suggestedRatio: spec.suggested_ratio,
    dosageUnit: spec.dosage_unit,
    mechanism: spec.mechanism,
    brandName: spec.brand_name,
    remark: spec.remark,
    status: spec.status,
    createTime: spec.create_time
  }
}

/**
 * 将前端camelCase转换为后端snake_case
 */
function transformToApi(item) {
  return {
    pesticide_code: item.pesticideCode,
    pesticide_name: item.pesticideName,
    control_type: item.controlType,
    function_desc: item.functionDesc,
    taboo_desc: item.tabooDesc,
    target_pests: item.targetPests,
    ingredient: item.ingredient,
    mechanism: item.mechanism,
    status: item.status
  }
}

/**
 * 规格转API格式
 */
function specToApi(spec) {
  return {
    spec_content: spec.specContent,
    formulation: spec.formulation,
    manufacturer: spec.manufacturer,
    suggested_dosage: spec.suggestedDosage,
    suggested_ratio: spec.suggestedRatio,
    dosage_unit: spec.dosageUnit,
    mechanism: spec.mechanism,
    brand_name: spec.brandName,
    remark: spec.remark,
    status: spec.status
  }
}

export const usePesticideLibraryStore = defineStore('pesticideLibrary', () => {
  // ========== 状态定义 ==========

  // 药剂列表
  const items = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const error = ref(null)

  // ========== Actions ==========

  /**
   * 获取药剂列表
   */
  const fetchItems = async (filters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (filters.control_type) queryParams.set('control_type', filters.control_type)
      if (filters.keyword) queryParams.set('keyword', filters.keyword)
      if (filters.pesticide_name) queryParams.set('pesticide_name', filters.pesticide_name)
      // 修复 P0-5: 支持生产厂家过滤
      if (filters.manufacturer) queryParams.set('manufacturer', filters.manufacturer)
      queryParams.set('limit', '10000')

      const query = queryParams.toString()
      const url = `${API_BASE}${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)

      // 处理响应数据
      let records = []
      if (Array.isArray(response)) {
        records = response
      } else if (response?.data && Array.isArray(response.data)) {
        records = response.data
      }

      // 转换字段名：snake_case -> camelCase
      items.value = records.map(transformRecord).filter(Boolean)
    } catch (e) {
      error.value = e.message
      console.error('[PesticideLibraryStore] 获取药剂列表失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取单条药剂详情（含规格）
   */
  const fetchItemById = async (id) => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${id}`)
      const data = response?.data || response
      return transformRecord(data)
    } catch (e) {
      console.error('[PesticideLibraryStore] 获取药剂详情失败:', e)
      return null
    }
  }

  /**
   * 创建药剂
   */
  const createItem = async (itemData) => {
    try {
      const body = transformToApi(itemData)
      const response = await enhancedApiClient.post(API_BASE, body)
      const newItem = transformRecord(response?.data || response)
      if (newItem) {
        items.value.unshift(newItem)
      }
      return { success: true, data: newItem }
    } catch (e) {
      error.value = e.message
      console.error('[PesticideLibraryStore] 创建药剂失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 更新药剂
   */
  const updateItem = async (id, itemData) => {
    try {
      const body = transformToApi(itemData)
      const response = await enhancedApiClient.put(`${API_BASE}/${id}`, body)
      const updated = transformRecord(response?.data || response)
      if (updated) {
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = { ...items.value[index], ...updated }
        }
      }
      return { success: true, data: updated }
    } catch (e) {
      error.value = e.message
      console.error('[PesticideLibraryStore] 更新药剂失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 删除药剂
   */
  const deleteItem = async (id) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/${id}`)
      items.value = items.value.filter(item => item.id !== id)
      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('[PesticideLibraryStore] 删除药剂失败:', e)
      return { success: false, error: e.message }
    }
  }

  // ========== 规格明细操作 ==========

  /**
   * 创建规格
   */
  const createSpec = async (pesticideId, specData) => {
    try {
      const body = specToApi(specData)
      const response = await enhancedApiClient.post(`${API_BASE}/${pesticideId}/specs`, body)
      const newSpec = transformSpec(response?.data || response)

      // 更新本地列表中的specs
      const item = items.value.find(i => i.id === pesticideId)
      if (item) {
        if (!item.specs) item.specs = []
        item.specs.push(newSpec)
      }
      return { success: true, data: newSpec }
    } catch (e) {
      console.error('[PesticideLibraryStore] 创建规格失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 更新规格
   */
  const updateSpec = async (specId, specData) => {
    try {
      const body = specToApi(specData)
      const response = await enhancedApiClient.put(`${API_BASE}/specs/${specId}`, body)
      const updated = transformSpec(response?.data || response)

      // 更新本地列表中的specs
      for (const item of items.value) {
        if (item.specs) {
          const specIndex = item.specs.findIndex(s => s.id === specId)
          if (specIndex !== -1) {
            item.specs[specIndex] = { ...item.specs[specIndex], ...updated }
            break
          }
        }
      }
      return { success: true, data: updated }
    } catch (e) {
      console.error('[PesticideLibraryStore] 更新规格失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 删除规格
   */
  const deleteSpec = async (specId) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/specs/${specId}`)

      // 更新本地列表中的specs
      for (const item of items.value) {
        if (item.specs) {
          item.specs = item.specs.filter(s => s.id !== specId)
        }
      }
      return { success: true }
    } catch (e) {
      console.error('[PesticideLibraryStore] 删除规格失败:', e)
      return { success: false, error: e.message }
    }
  }

  // ========== 关联病虫害操作 ==========

  /**
   * 获取药剂关联的病虫害列表
   */
  const fetchRelatedPests = async (pesticideId) => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${pesticideId}/relations`)
      return response?.data || response || []
    } catch (e) {
      console.error('[PesticideLibraryStore] 获取关联病虫害失败:', e)
      return []
    }
  }

  /**
   * 批量更新关联
   */
  const updateRelations = async (pesticideId, pestIds) => {
    try {
      await enhancedApiClient.put(`${API_BASE}/${pesticideId}/relations`, { pestIds })
      return { success: true }
    } catch (e) {
      console.error('[PesticideLibraryStore] 更新关联失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 删除单个关联
   */
  const removeRelation = async (pesticideId, pestId) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/${pesticideId}/relations/${pestId}`)
      return { success: true }
    } catch (e) {
      console.error('[PesticideLibraryStore] 删除关联失败:', e)
      return { success: false, error: e.message }
    }
  }

  return {
    // 状态
    items,
    isLoading,
    error,
    // Actions
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    createSpec,
    updateSpec,
    deleteSpec,
    fetchRelatedPests,
    updateRelations,
    removeRelation
  }
})
