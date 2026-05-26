/**
 * 物料入库 Store - 对应V1.1入库相关状态管理
 * 管理入库记录、入库明细状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInboundRecords, getInboundRecordById, createInboundRecord, updateInboundRecord, voidInboundRecord, deleteMaterialsBatch } from '@/api/material/apiWarehouseMaterialService'

export const useInboundStore = defineStore('inbound', () => {
  // 状态
  const inboundRecords = ref([])
  const currentInbound = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)
  const pagination = ref({
    page: 1,
    limit: 20
  })

  /**
   * 加载入库记录列表
   * @param {Object} filters - 筛选条件
   */
  const loadInboundRecords = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: filters.page || pagination.value.page,
        limit: filters.limit || pagination.value.limit,
        ...filters
      }
      const res = await getInboundRecords(params)
      inboundRecords.value = res || []
      total.value = res.total || 0
      if (filters.page) pagination.value.page = filters.page
      if (filters.limit) pagination.value.limit = filters.limit
    } catch (err) {
      error.value = err.message || '加载入库记录失败'
      console.error('loadInboundRecords error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载入库记录详情
   * @param {number} id - 入库记录ID
   */
  const loadInboundDetail = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await getInboundRecordById(id)
      currentInbound.value = res
      return res
    } catch (err) {
      error.value = err.message || '加载入库详情失败'
      console.error('loadInboundDetail error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建入库记录
   * @param {Object} data - 入库数据
   */
  const addInbound = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await createInboundRecord(data)
      // 重新加载列表
      await loadInboundRecords()
      return res
    } catch (err) {
      error.value = err.message || '创建入库记录失败'
      console.error('addInbound error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新入库记录
   * @param {number} id - 入库记录ID
   * @param {Object} data - 更新数据
   */
  const editInbound = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await updateInboundRecord(id, data)
      // 重新加载列表
      await loadInboundRecords()
      return res
    } catch (err) {
      error.value = err.message || '更新入库记录失败'
      console.error('editInbound error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 作废入库记录
   * @param {number} id - 入库记录ID
   */
  const voidInbound = async (id) => {
    loading.value = true
    error.value = null
    try {
      await voidInboundRecord(id)
      // 重新加载列表
      await loadInboundRecords()
      return true
    } catch (err) {
      error.value = err.message || '作废入库记录失败'
      console.error('voidInbound error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除物料
   * @param {number[]} ids - ID列表
   */
  const removeMaterials = async (ids) => {
    loading.value = true
    error.value = null
    try {
      await deleteMaterialsBatch(ids)
      // 重新加载列表
      await loadInboundRecords()
      return true
    } catch (err) {
      error.value = err.message || '删除物料失败'
      console.error('removeMaterials error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置分页
   */
  const resetPagination = () => {
    pagination.value = { page: 1, limit: 20 }
  }

  /**
   * 清空当前入库记录
   */
  const clearCurrentInbound = () => {
    currentInbound.value = null
  }

  return {
    // 状态
    inboundRecords,
    currentInbound,
    loading,
    error,
    total,
    pagination,
    // 方法
    loadInboundRecords,
    loadInboundDetail,
    addInbound,
    editInbound,
    voidInbound,
    removeMaterials,
    resetPagination,
    clearCurrentInbound
  }
})
