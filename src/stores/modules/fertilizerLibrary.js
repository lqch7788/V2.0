/**
 * 肥料知识库 Store
 * V12.0 新增
 * 使用 Pinia + enhancedApiClient 与后端 API 交互
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// API 基础路径
const API_BASE = '/fertilizer-library'

/**
 * 将后端返回的snake_case字段转换为前端camelCase
 */
function transformRecord(record) {
  if (!record) return null
  return {
    id: record.id,
    fertilizerCode: record.fertilizerCode || record.fertilizer_code,
    fertilizerName: record.fertilizerName || record.fertilizer_name,
    fertilizerType: record.fertilizerType || record.fertilizer_type,
    applicationTiming: record.applicationTiming || record.application_timing,
    functionDesc: record.functionDesc || record.function_desc,
    tabooDesc: record.tabooDesc || record.taboo_desc,
    shelfLife: record.shelfLife || record.shelf_life,
    storageCondition: record.storageCondition || record.storage_condition,
    supplierInfo: record.supplierInfo || record.supplier_info,
    status: record.status,
    createTime: record.createTime || record.create_time,
    updateTime: record.updateTime || record.update_time,
    specs: record.specs || []
  }
}

/**
 * 将前端camelCase转换为后端snake_case
 */
function transformToApi(item) {
  return {
    fertilizer_code: item.fertilizerCode,
    fertilizer_name: item.fertilizerName,
    fertilizer_type: item.fertilizerType,
    application_timing: item.applicationTiming,
    function_desc: item.functionDesc,
    taboo_desc: item.tabooDesc,
    shelf_life: item.shelfLife,
    storage_condition: item.storageCondition,
    supplier_info: item.supplierInfo,
    status: item.status
  }
}

export const useFertilizerLibraryStore = defineStore('fertilizerLibrary', () => {
  // ========== 状态定义 ==========

  // 肥料列表
  const items = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const error = ref(null)

  // ========== Actions ==========

  /**
   * 获取肥料列表
   */
  const fetchItems = async (filters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (filters.fertilizer_type) queryParams.set('fertilizer_type', filters.fertilizer_type)
      if (filters.keyword) queryParams.set('keyword', filters.keyword)
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
      console.error('[FertilizerLibraryStore] 获取肥料列表失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取单条肥料详情（含规格）
   */
  const fetchItemById = async (id) => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${id}`)
      const data = response?.data || response
      return transformRecord(data)
    } catch (e) {
      console.error('[FertilizerLibraryStore] 获取肥料详情失败:', e)
      return null
    }
  }

  /**
   * 创建肥料
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
      console.error('[FertilizerLibraryStore] 创建肥料失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 更新肥料
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
      console.error('[FertilizerLibraryStore] 更新肥料失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 删除肥料
   */
  const deleteItem = async (id) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/${id}`)
      items.value = items.value.filter(item => item.id !== id)
      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('[FertilizerLibraryStore] 删除肥料失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 生成肥料编码
   */
  const generateCode = async () => {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/generate-code`)
      return response?.data || response
    } catch (e) {
      console.error('[FertilizerLibraryStore] 生成编码失败:', e)
      return { code: '' }
    }
  }

  // ========== 规格明细操作 ==========

  /**
   * 创建规格
   */
  const createSpec = async (fertilizerId, specData) => {
    try {
      const body = {
        brand_name: specData.brandName,
        spec_content: specData.specContent,
        manufacturer: specData.manufacturer,
        suggested_dosage: specData.suggestedDosage,
        suggested_ratio: specData.suggestedRatio,
        dosage_unit: specData.dosageUnit,
        remark: specData.remark
      }
      const response = await enhancedApiClient.post(`${API_BASE}/${fertilizerId}/specs`, body)
      const created = response?.data || response
      // V1.1 风格：创建后回写 items[].specs
      if (created) {
        const target = items.value.find(i => i.id === fertilizerId)
        if (target) {
          target.specs = [...(target.specs || []), created]
        }
      }
      return { success: true, data: created }
    } catch (e) {
      console.error('[FertilizerLibraryStore] 创建规格失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 更新规格
   */
  const updateSpec = async (specId, specData) => {
    try {
      const body = {
        brand_name: specData.brandName,
        spec_content: specData.specContent,
        manufacturer: specData.manufacturer,
        suggested_dosage: specData.suggestedDosage,
        suggested_ratio: specData.suggestedRatio,
        dosage_unit: specData.dosageUnit,
        remark: specData.remark
      }
      const response = await enhancedApiClient.put(`${API_BASE}/specs/${specId}`, body)
      const updated = response?.data || response
      // V1.1 风格：更新后回写 items[].specs
      if (updated) {
        for (const item of items.value) {
          if (item.specs) {
            item.specs = item.specs.map(s => s.id === specId ? { ...s, ...updated } : s)
          }
        }
      }
      return { success: true, data: updated }
    } catch (e) {
      console.error('[FertilizerLibraryStore] 更新规格失败:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * 删除规格
   */
  const deleteSpec = async (specId) => {
    try {
      await enhancedApiClient.delete(`${API_BASE}/specs/${specId}`)
      // V1.1 风格：删除后回写 items[].specs
      for (const item of items.value) {
        if (item.specs) {
          item.specs = item.specs.filter(s => s.id !== specId)
        }
      }
      return { success: true }
    } catch (e) {
      console.error('[FertilizerLibraryStore] 删除规格失败:', e)
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
    generateCode,
    createSpec,
    updateSpec,
    deleteSpec
  }
})
