/**
 * 采收记录 Store
 * 使用 enhancedApiClient 与后端 API 交互
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

export const useHarvestStore = defineStore('harvest', () => {
  // 采收记录列表
  const records = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const error = ref(null)

  // 统计数据
  const stats = ref({
    totalQuantity: 0,
    totalAmount: 0,
    todayQuantity: 0,
    todayAmount: 0
  })

  // API 基础路径
  const API_BASE = '/harvest'

  /**
   * 获取所有采收记录
   */
  async function fetchRecords(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (params.batchCode) queryParams.set('batchCode', params.batchCode)
      if (params.harvestCode) queryParams.set('harvestCode', params.harvestCode)
      if (params.status) queryParams.set('status', params.status)
      if (params.startDate) queryParams.set('startDate', params.startDate)
      if (params.endDate) queryParams.set('endDate', params.endDate)
      if (params.greenhouseId) queryParams.set('greenhouseId', params.greenhouseId)
      if (params.cropName) queryParams.set('cropName', params.cropName)
      if (params.grade) queryParams.set('grade', params.grade)
      if (params.harvesterName) queryParams.set('harvesterName', params.harvesterName)
      if (params.warehouseId) queryParams.set('warehouseId', params.warehouseId)

      const query = queryParams.toString()
      const url = `${API_BASE}${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || []

      records.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 获取采收记录失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取单条采收记录
   */
  async function fetchRecordById(id) {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${id}`)
      return response?.data || response
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 获取采收记录详情失败:', err)
      return null
    }
  }

  /**
   * 创建采收记录
   */
  async function createRecord(data) {
    try {
      const response = await enhancedApiClient.post(API_BASE, data)
      const newRecord = response?.data || response

      if (newRecord) {
        records.value.unshift(newRecord)
      }

      return { success: true, data: newRecord }
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 创建采收记录失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 更新采收记录
   */
  async function updateRecord(id, data) {
    try {
      const response = await enhancedApiClient.put(`${API_BASE}/${id}`, data)
      const updatedRecord = response?.data || response

      if (updatedRecord) {
        const index = records.value.findIndex(r => r.id === id)
        if (index !== -1) {
          records.value[index] = { ...records.value[index], ...updatedRecord }
        }
      }

      return { success: true, data: updatedRecord }
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 更新采收记录失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 删除单条采收记录
   */
  async function deleteRecord(id) {
    try {
      await enhancedApiClient.delete(`${API_BASE}/${id}`)
      records.value = records.value.filter(r => r.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 删除采收记录失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 批量删除采收记录
   */
  async function deleteRecords(ids) {
    try {
      await enhancedApiClient.delete(`${API_BASE}/batch`, { ids })
      records.value = records.value.filter(r => !ids.includes(r.id))
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 批量删除采收记录失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 批量更新采收记录
   */
  async function updateBatch(ids, data) {
    try {
      const response = await enhancedApiClient.put(`${API_BASE}/batch`, { ids, ...data })
      // 刷新列表
      await fetchRecords()
      return { success: true, data: response?.data }
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 批量更新采收记录失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 获取统计数据
   */
  async function fetchStats(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.set('startDate', params.startDate)
      if (params.endDate) queryParams.set('endDate', params.endDate)

      const query = queryParams.toString()
      const url = `${API_BASE}/stats${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      stats.value = response?.data || response || {
        totalQuantity: 0,
        totalAmount: 0,
        todayQuantity: 0,
        todayAmount: 0
      }
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 获取统计数据失败:', err)
    }
  }

  /**
   * 生成采收单号
   */
  async function generateCode() {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/generate-code`)
      return response?.data?.code || response?.code || ''
    } catch (err) {
      console.error('[HarvestStore] 生成采收单号失败:', err)
      return ''
    }
  }

  /**
   * 导出采收记录
   */
  async function exportRecords(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.format) queryParams.set('format', params.format)
      if (params.batchCode) queryParams.set('batchCode', params.batchCode)
      if (params.startDate) queryParams.set('startDate', params.startDate)
      if (params.endDate) queryParams.set('endDate', params.endDate)

      const query = queryParams.toString()
      const url = `${API_BASE}/export${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url, { responseType: 'blob' })
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 导出采收记录失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 根据批次号获取采收记录
   */
  async function fetchByBatchCode(batchCode) {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/batch-code/${batchCode}`)
      return response?.data || response || []
    } catch (err) {
      error.value = err.message
      console.error('[HarvestStore] 根据批次号获取采收记录失败:', err)
      return []
    }
  }

  return {
    // 状态
    records,
    isLoading,
    error,
    stats,
    // 方法
    fetchRecords,
    fetchRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    deleteRecords,
    updateBatch,
    fetchStats,
    generateCode,
    exportRecords,
    fetchByBatchCode
  }
})
