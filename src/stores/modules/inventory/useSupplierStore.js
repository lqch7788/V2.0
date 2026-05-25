/**
 * 供应商管理 Store - 对应V1.1供应商管理状态
 * 管理供应商信息CRUD及搜索状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getSuppliers, getSupplierById, createSupplier,
  updateSupplier, deleteSupplier, deleteSuppliersBatch
} from '@/api/supplier/apiSupplierService'

export const useSupplierStore = defineStore('supplier', () => {
  // 状态
  const suppliers = ref([])
  const currentSupplier = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)
  const pagination = ref({
    page: 1,
    limit: 20
  })

  /**
   * 加载供应商列表
   * @param {Object} filters - 筛选条件
   */
  const loadSuppliers = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: filters.page || pagination.value.page,
        limit: filters.limit || pagination.value.limit,
        ...filters
      }
      const res = await getSuppliers(params)
      suppliers.value = res.data || []
      total.value = res.total || res.meta?.total || 0
      if (filters.page) pagination.value.page = filters.page
      if (filters.limit) pagination.value.limit = filters.limit
    } catch (err) {
      error.value = err.message || '加载供应商列表失败'
      console.error('loadSuppliers error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载供应商详情
   * @param {string|number} id - 供应商ID
   */
  const loadSupplierDetail = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await getSupplierById(id)
      currentSupplier.value = res
      return res
    } catch (err) {
      error.value = err.message || '加载供应商详情失败'
      console.error('loadSupplierDetail error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建供应商
   * @param {Object} data - 供应商数据
   */
  const addSupplier = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await createSupplier(data)
      await loadSuppliers()
      return res
    } catch (err) {
      error.value = err.message || '创建供应商失败'
      console.error('addSupplier error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新供应商
   * @param {string|number} id - 供应商ID
   * @param {Object} data - 更新数据
   */
  const editSupplier = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await updateSupplier(id, data)
      await loadSuppliers()
      return res
    } catch (err) {
      error.value = err.message || '更新供应商失败'
      console.error('editSupplier error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除供应商
   * @param {string|number} id - 供应商ID
   */
  const removeSupplier = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteSupplier(id)
      await loadSuppliers()
      return true
    } catch (err) {
      error.value = err.message || '删除供应商失败'
      console.error('removeSupplier error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除供应商
   * @param {Array<string|number>} ids - ID列表
   */
  const removeSuppliersBatch = async (ids) => {
    loading.value = true
    error.value = null
    try {
      await deleteSuppliersBatch(ids)
      await loadSuppliers()
      return true
    } catch (err) {
      error.value = err.message || '批量删除供应商失败'
      console.error('removeSuppliersBatch error:', err)
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
   * 清空当前供应商
   */
  const clearCurrentSupplier = () => {
    currentSupplier.value = null
  }

  return {
    // 状态
    suppliers,
    currentSupplier,
    loading,
    error,
    total,
    pagination,
    // 方法
    loadSuppliers,
    loadSupplierDetail,
    addSupplier,
    editSupplier,
    removeSupplier,
    removeSuppliersBatch,
    resetPagination,
    clearCurrentSupplier
  }
})
