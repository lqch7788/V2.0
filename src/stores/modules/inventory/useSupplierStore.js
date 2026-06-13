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
  const lastFetch = ref(null)  // V1.1 缓存时间戳
  const pagination = ref({
    page: 1,
    limit: 20
  })

  /** 5分钟内不重复请求（V1.1 STALE_MS 对齐） */
  const STALE_MS = 5 * 60 * 1000

  /**
   * 加载供应商列表
   * @param {Object} filters - 筛选条件
   */
  const loadSuppliers = async (filters = {}) => {
    // 防止并发
    if (loading.value) return
    // 5分钟内不重复拉取（V1.1 缓存对齐）
    if (!filters.force && suppliers.value.length > 0 && lastFetch.value
        && Date.now() - lastFetch.value < STALE_MS) {
      return
    }
    loading.value = true
    error.value = null
    try {
      const params = {
        page: filters.page || pagination.value.page,
        limit: filters.limit || pagination.value.limit,
        ...filters
      }
      const res = await getSuppliers(params)
      const data = res || []
      suppliers.value = data
      total.value = data.length || suppliers.value.length
      lastFetch.value = Date.now()
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
   * 前端内存关键字搜索（V1.1 search 对齐）
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的供应商列表
   */
  const search = (keyword) => {
    const items = suppliers.value
    if (!keyword || !keyword.trim()) return items
    const lower = keyword.toLowerCase().trim()
    return items.filter(s =>
      s.name?.toLowerCase().includes(lower) ||
      s.code?.toLowerCase().includes(lower) ||
      s.contact?.toLowerCase().includes(lower) ||
      (s.mobilePhone || '').includes(keyword)
    )
  }

  /**
   * 获取合作中的供应商下拉选项（V1.1 getActiveOptions 对齐）
   * @returns {Array<{value: string, label: string, code: string}>}
   */
  const getActiveOptions = () => {
    return suppliers.value
      .filter(s => s.status === '合作中' || s.status === 'active')
      .map(s => ({ value: String(s.id), label: s.name, code: s.code }))
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
    lastFetch,
    pagination,
    // 方法
    loadSuppliers,
    loadSupplierDetail,
    addSupplier,
    editSupplier,
    removeSupplier,
    removeSuppliersBatch,
    search,
    getActiveOptions,
    resetPagination,
    clearCurrentSupplier
  }
})
