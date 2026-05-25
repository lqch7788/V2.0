/**
 * 仓库管理 Store - 对应V1.1仓库管理状态
 * 管理仓库信息、库存统计状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getWarehouses, getWarehouseById, createWarehouse, updateWarehouse, deleteWarehouse, getWarehouseStats, getWarehouseInventory, inventoryCheck, getWarehouseSimpleList } from '@/api/warehouse/warehouseService'

export const useWarehouseStore = defineStore('warehouse', () => {
  // 状态
  const warehouses = ref([])
  const simpleList = ref([])
  const currentWarehouse = ref(null)
  const currentStats = ref(null)
  const currentInventory = ref([])
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)
  const pagination = ref({
    page: 1,
    limit: 20
  })

  /**
   * 加载仓库列表
   * @param {Object} filters - 筛选条件
   */
  const loadWarehouses = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: filters.page || pagination.value.page,
        limit: filters.limit || pagination.value.limit,
        ...filters
      }
      const res = await getWarehouses(params)
      warehouses.value = res.data || []
      total.value = res.total || 0
      if (filters.page) pagination.value.page = filters.page
      if (filters.limit) pagination.value.limit = filters.limit
    } catch (err) {
      error.value = err.message || '加载仓库列表失败'
      console.error('loadWarehouses error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载仓库简单列表（下拉选择用）
   */
  const loadSimpleList = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await getWarehouseSimpleList()
      simpleList.value = res || []
    } catch (err) {
      error.value = err.message || '加载仓库简单列表失败'
      console.error('loadSimpleList error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载仓库详情
   * @param {string} id - 仓库ID
   */
  const loadWarehouseDetail = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await getWarehouseById(id)
      currentWarehouse.value = res
      return res
    } catch (err) {
      error.value = err.message || '加载仓库详情失败'
      console.error('loadWarehouseDetail error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建仓库
   * @param {Object} data - 仓库数据
   */
  const addWarehouse = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await createWarehouse(data)
      // 重新加载列表
      await loadWarehouses()
      return res
    } catch (err) {
      error.value = err.message || '创建仓库失败'
      console.error('addWarehouse error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新仓库
   * @param {string} id - 仓库ID
   * @param {Object} data - 更新数据
   */
  const editWarehouse = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await updateWarehouse(id, data)
      // 重新加载列表
      await loadWarehouses()
      return res
    } catch (err) {
      error.value = err.message || '更新仓库失败'
      console.error('editWarehouse error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除仓库
   * @param {string} id - 仓库ID
   */
  const removeWarehouse = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteWarehouse(id)
      // 重新加载列表
      await loadWarehouses()
      return true
    } catch (err) {
      error.value = err.message || '删除仓库失败'
      console.error('removeWarehouse error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载仓库库存统计
   * @param {string} id - 仓库ID
   */
  const loadWarehouseStats = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await getWarehouseStats(id)
      currentStats.value = res
      return res
    } catch (err) {
      error.value = err.message || '加载仓库统计失败'
      console.error('loadWarehouseStats error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载仓库库存明细
   * @param {string} id - 仓库ID
   * @param {Object} filters - 筛选条件
   */
  const loadWarehouseInventory = async (id, filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await getWarehouseInventory(id, filters)
      currentInventory.value = res.data || []
      return res
    } catch (err) {
      error.value = err.message || '加载仓库库存明细失败'
      console.error('loadWarehouseInventory error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 仓库盘点
   * @param {string} id - 仓库ID
   * @param {Object} data - 盘点数据
   */
  const checkWarehouse = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await inventoryCheck(id, data)
      return res
    } catch (err) {
      error.value = err.message || '仓库盘点失败'
      console.error('checkWarehouse error:', err)
      throw err
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
   * 清空当前仓库
   */
  const clearCurrentWarehouse = () => {
    currentWarehouse.value = null
    currentStats.value = null
    currentInventory.value = []
  }

  return {
    // 状态
    warehouses,
    simpleList,
    currentWarehouse,
    currentStats,
    currentInventory,
    loading,
    error,
    total,
    pagination,
    // 方法
    loadWarehouses,
    loadSimpleList,
    loadWarehouseDetail,
    addWarehouse,
    editWarehouse,
    removeWarehouse,
    loadWarehouseStats,
    loadWarehouseInventory,
    checkWarehouse,
    resetPagination,
    clearCurrentWarehouse
  }
})
