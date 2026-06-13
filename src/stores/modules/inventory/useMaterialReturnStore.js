/**
 * 物料退库 Store - 对应V1.1退库相关状态管理
 * 管理退库记录、退库明细状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getReturnRecords, getReturnRecordById, createReturnRecord, updateReturnRecord, deleteReturnRecord, approveReturnRecord, voidReturnRecord, deleteReturnRecordsBatch } from '@/api/material/apiMaterialReturnService'

export const useMaterialReturnStore = defineStore('materialReturn', () => {
  // 状态
  const returnRecords = ref([])
  const currentReturn = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)
  const pagination = ref({
    page: 1,
    limit: 20
  })

  /**
   * 加载退库记录列表
   * @param {Object} filters - 筛选条件
   */
  const loadReturnRecords = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: filters.page || pagination.value.page,
        limit: filters.limit || pagination.value.limit,
        ...filters
      }
      const res = await getReturnRecords(params)
      returnRecords.value = res || []
      total.value = res.total || 0
      if (filters.page) pagination.value.page = filters.page
      if (filters.limit) pagination.value.limit = filters.limit
    } catch (err) {
      error.value = err.message || '加载退库记录失败'
      console.error('loadReturnRecords error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载退库记录详情
   * @param {number} id - 退库记录ID
   */
  const loadReturnDetail = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await getReturnRecordById(id)
      currentReturn.value = res
      return res
    } catch (err) {
      error.value = err.message || '加载退库详情失败'
      console.error('loadReturnDetail error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建退库记录
   * @param {Object} data - 退库数据
   */
  const addReturn = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await createReturnRecord(data)
      // 重新加载列表
      await loadReturnRecords()
      return res
    } catch (err) {
      error.value = err.message || '创建退库记录失败'
      console.error('addReturn error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新退库记录
   * @param {number} id - 退库记录ID
   * @param {Object} data - 更新数据
   */
  const editReturn = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await updateReturnRecord(id, data)
      // 重新加载列表
      await loadReturnRecords()
      return res
    } catch (err) {
      error.value = err.message || '更新退库记录失败'
      console.error('editReturn error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除退库记录
   * @param {number} id - 退库记录ID
   */
  const removeReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteReturnRecord(id)
      // 重新加载列表
      await loadReturnRecords()
      return true
    } catch (err) {
      error.value = err.message || '删除退库记录失败'
      console.error('removeReturn error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 审批退库记录
   * @param {number} id - 退库记录ID
   * @param {string} action - 审批操作（approve/reject）
   * @param {string} rejectReason - 驳回原因
   */
  const approveReturn = async (id, action, rejectReason) => {
    loading.value = true
    error.value = null
    try {
      await approveReturnRecord(id, action, rejectReason)
      // 重新加载列表
      await loadReturnRecords()
      return true
    } catch (err) {
      error.value = err.message || '审批退库记录失败'
      console.error('approveReturn error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 作废退库记录
   * @param {number} id - 退库记录ID
   */
  const voidReturn = async (id) => {
    loading.value = true
    error.value = null
    try {
      await voidReturnRecord(id)
      // 重新加载列表
      await loadReturnRecords()
      return true
    } catch (err) {
      error.value = err.message || '作废退库记录失败'
      console.error('voidReturn error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新退库记录（V1.1 updateItem 乐观更新模式，不重载列表）
   * @param {string|number} id - 退库记录ID
   * @param {Object} updates - 更新数据
   */
  const updateItem = async (id, updates) => {
    try {
      const result = await updateReturnRecord(id, updates)
      if (result) {
        returnRecords.value = returnRecords.value.map(i =>
          i.id === id ? { ...i, ...updates } : i
        )
      }
      return result
    } catch (err) {
      console.error('updateItem error:', err)
      return false
    }
  }

  /**
   * 单条删除退库记录（V1.1 deleteItem 乐观更新模式，不重载列表）
   * @param {string|number} id - 退库记录ID
   */
  const deleteItem = async (id) => {
    try {
      const result = await deleteReturnRecord(id)
      if (result) {
        returnRecords.value = returnRecords.value.filter(i => i.id !== id)
      }
      return result
    } catch (err) {
      console.error('deleteItem error:', err)
      return false
    }
  }

  /**
   * 批量删除退库记录（V1.1 deleteItems 乐观更新模式）
   * @param {(string|number)[]} ids - ID列表
   */
  const deleteItems = async (ids) => {
    try {
      const result = await deleteReturnRecordsBatch(ids)
      if (result) {
        returnRecords.value = returnRecords.value.filter(i => !ids.includes(i.id))
      }
      return result
    } catch (err) {
      console.error('deleteItems error:', err)
      return false
    }
  }

  /**
   * 批量删除退库记录
   * @param {number[]} ids - ID列表
   */
  const removeReturnsBatch = async (ids) => {
    loading.value = true
    error.value = null
    try {
      await deleteReturnRecordsBatch(ids)
      // 重新加载列表
      await loadReturnRecords()
      return true
    } catch (err) {
      error.value = err.message || '批量删除退库记录失败'
      console.error('removeReturnsBatch error:', err)
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
   * 清空当前退库记录
   */
  const clearCurrentReturn = () => {
    currentReturn.value = null
  }

  return {
    // 状态
    returnRecords,
    currentReturn,
    loading,
    error,
    total,
    pagination,
    // 方法（V1.1 对齐）
    loadItems: loadReturnRecords,
    loadReturnRecords,
    loadReturnDetail,
    addItem: addReturn,
    addReturn,
    updateItem,
    editReturn,
    deleteItem,
    removeReturn,
    deleteItems,
    removeReturnsBatch,
    approveReturn,
    voidReturn,
    resetPagination,
    clearCurrentReturn
  }
})
