/**
 * 仓库物料 Store - 对应V1.1 useWarehouseMaterialStore
 * 管理仓库物料、库存查询状态
 *
 * 数据流：API → Store → 页面组件
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, deleteMaterialsBatch } from '@/api/material/apiWarehouseMaterialService'

export const useWarehouseMaterialStore = defineStore('warehouseMaterial', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * 加载物料列表
   */
  const loadItems = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getMaterials()
      items.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.message || '加载物料列表失败'
      console.error('[useWarehouseMaterialStore] 获取物料失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 添加物料
   * @param {Object} item - 物料数据（不含id）
   * @returns {Promise<Object|null>}
   */
  const addItem = async (item) => {
    try {
      const result = await createMaterial(item)
      if (result) {
        await loadItems()
      }
      return result
    } catch (err) {
      console.error('[useWarehouseMaterialStore] 添加物料失败:', err)
      return null
    }
  }

  /**
   * 更新物料
   * @param {number} id - 物料ID
   * @param {Object} updates - 更新数据
   * @returns {Promise<Object|null>}
   */
  const updateItem = async (id, updates) => {
    try {
      const result = await updateMaterial(id, updates)
      if (result) {
        await loadItems()
      }
      return result
    } catch (err) {
      console.error('[useWarehouseMaterialStore] 更新物料失败:', err)
      return null
    }
  }

  /**
   * 删除单个物料
   * @param {number} id - 物料ID
   * @returns {Promise<boolean>}
   */
  const deleteItem = async (id) => {
    try {
      const result = await deleteMaterial(id)
      if (result) {
        await loadItems()
      }
      return result
    } catch (err) {
      console.error('[useWarehouseMaterialStore] 删除物料失败:', err)
      return false
    }
  }

  /**
   * 批量删除物料
   * @param {number[]} ids - ID数组
   * @returns {Promise<boolean>}
   */
  const deleteItems = async (ids) => {
    try {
      const results = await deleteMaterialsBatch(ids)
      if (results) {
        await loadItems()
      }
      return results
    } catch (err) {
      console.error('[useWarehouseMaterialStore] 批量删除物料失败:', err)
      return false
    }
  }

  return {
    // 状态
    items,
    isLoading,
    error,
    // 方法
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    deleteItems
  }
})
