/**
 * 采收记录 Store
 * 使用 enhancedApiClient 与后端 API 交互
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { inboundHarvest } from '@/api/inventory/inventoryIntegration'

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
   * 蛇形转驼峰字段映射（后端字段 -> 前端字段）
   * 后端返回 snake_case，前端使用 camelCase
   */
  const FIELD_MAP = {
    harvest_code: 'harvestCode',
    source_id: 'sourceId',
    source_name: 'sourceName',
    crop_name: 'cropName',
    crop_variety: 'cropVariety',
    greenhouse_name: 'greenhouseName',
    harvest_date: 'harvestDate',
    harvest_quantity: 'harvestQuantity',
    unit_price: 'unitPrice',
    total_amount: 'totalAmount',
    quality_grade: 'grade',
    buyer_id: 'buyerId',
    buyer_name: 'buyerName',
    sales_channel: 'salesChannel',
    warehouse_id: 'warehouseId',
    warehouse_name: 'warehouseName',
    auditor_id: 'auditor',
    create_by: 'createBy',
    create_time: 'createTime',
    update_time: 'updateTime',
    inbound_type: 'inboundType',
    harvester_ids: 'harvesterNames',
    batch_code: 'batchCode',
    batch_id: 'batchId',
    planting_mode: 'plantingMode',
    target_yield: 'targetYield'
  }

  /**
   * 将后端蛇形字段转换为前端驼峰字段
   * @param {Object} record - 后端返回的记录对象
   * @returns {Object} 转换后的记录对象
   */
  function convertFields(record) {
    if (!record || typeof record !== 'object') return record
    const converted = {}
    for (const [key, value] of Object.entries(record)) {
      const mappedKey = FIELD_MAP[key] || key
      converted[mappedKey] = value
    }
    return converted
  }

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

      // V1.1 兼容：支持多种响应格式 { data: [] } 或直接返回 []
      const response = await enhancedApiClient.get(url)
      let data = []
      if (Array.isArray(response)) {
        data = response
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data
      } else if (response?.records && Array.isArray(response.records)) {
        data = response.records
      } else if (response?.results && Array.isArray(response.results)) {
        data = response.results
      }

      // 将后端蛇形字段转换为前端驼峰字段
      records.value = data.map(item => convertFields(item))
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
      const record = response?.data || response
      return record ? convertFields(record) : null
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
        // 将后端蛇形字段转换为前端驼峰字段
        records.value.unshift(convertFields(newRecord))

        // 自动入库：采收记录创建成功后同步到统一库存服务
        try {
          const harvestRecord = {
            id: newRecord.id || newRecord.harvest_code,
            harvestType: data.harvest_type || data.harvestType || 'product',
            targetInventory: data.target_inventory || data.targetInventory || 'product',
            cropCode: data.crop_code || data.cropCode,
            cropName: data.crop_name || data.cropName,
            variety: data.variety_name || data.variety || data.varietyName,
            harvestQuantity: data.harvest_quantity || data.harvestQuantity,
            unit: data.unit || 'kg',
            productionPlanId: data.production_plan_id || data.productionPlanId,
            productionPlanCode: data.production_plan_code || data.productionPlanCode,
            plantingInstanceId: data.planting_instance_id || data.plantingInstanceId || data.source_id || data.sourceId,
            harvestCode: data.harvest_code || data.harvestCode,
            batchCode: data.batch_code || data.batchCode,
            greenhouseName: data.greenhouse_name || data.greenhouseName,
            plantingMode: data.planting_mode || data.plantingMode,
            quality: data.quality || 'good',
            grade: data.grade || data.quality_grade || 'A',
          }
          await inboundHarvest(harvestRecord, data.operator_id || data.operatorId || '', data.operator_name || data.operatorName || '')
        } catch (integrationErr) {
          // 入库集成失败不影响采收记录创建
          console.warn('[HarvestStore] 自动入库失败（采收记录已创建）:', integrationErr.message)
        }
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
        const convertedRecord = convertFields(updatedRecord)
        const index = records.value.findIndex(r => r.id === id)
        if (index !== -1) {
          records.value[index] = { ...records.value[index], ...convertedRecord }
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
   * V1.1 兼容：使用 query string 传递 IDs
   */
  async function deleteRecords(ids) {
    try {
      // V1.1 兼容：使用 query string 传递 IDs
      await enhancedApiClient.delete(`${API_BASE}/batch?ids=${ids.join(',')}`)
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
   * V1.1 兼容：内部逐条调用 updateRecord，保持 API 调用模式一致
   */
  async function updateBatch(ids, data) {
    try {
      const failedIds = []
      // V1.1 兼容：逐条更新，保持与 updateItem 相同的 API 调用模式
      for (const id of ids) {
        const updates = data[id]
        if (updates) {
          const result = await updateRecord(id, updates)
          if (!result.success) {
            failedIds.push(id)
          }
        }
      }
      // 刷新列表
      await fetchRecords()
      if (failedIds.length > 0) {
        return { success: false, error: `更新失败的ID: ${failedIds.join(', ')}` }
      }
      return { success: true }
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
      const data = response?.data || response || []
      // 将后端蛇形字段转换为前端驼峰字段
      return Array.isArray(data) ? data.map(item => convertFields(item)) : data
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
