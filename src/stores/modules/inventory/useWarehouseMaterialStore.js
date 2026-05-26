/**
 * 仓库物料 Store - 对应V1.1仓库物料管理状态
 * 管理仓库物料、库存查询状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, deleteMaterialsBatch, searchMaterials } from '@/api/material/apiWarehouseMaterialService'

export const useWarehouseMaterialStore = defineStore('warehouseMaterial', () => {
  // 状态
  const materials = ref([])
  const currentMaterial = ref(null)
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * 加载物料列表
   */
  const loadMaterials = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await getMaterials()
      materials.value = res || []
    } catch (err) {
      error.value = err.message || '加载物料列表失败'
      console.error('loadMaterials error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载物料详情
   * @param {number} id - 物料ID
   */
  const loadMaterialDetail = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await getMaterialById(id)
      currentMaterial.value = res
      return res
    } catch (err) {
      error.value = err.message || '加载物料详情失败'
      console.error('loadMaterialDetail error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建物料
   * @param {Object} data - 物料数据
   */
  const addMaterial = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await createMaterial(data)
      // 重新加载列表
      await loadMaterials()
      return res
    } catch (err) {
      error.value = err.message || '创建物料失败'
      console.error('addMaterial error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新物料
   * @param {number} id - 物料ID
   * @param {Object} data - 更新数据
   */
  const editMaterial = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await updateMaterial(id, data)
      // 重新加载列表
      await loadMaterials()
      return res
    } catch (err) {
      error.value = err.message || '更新物料失败'
      console.error('editMaterial error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除物料（使用批量API，并行删除）
   * @param {number[]} ids - ID列表
   */
  const removeMaterialsBatch = async (ids) => {
    loading.value = true
    error.value = null
    try {
      await deleteMaterialsBatch(ids)
      await loadMaterials()
      return true
    } catch (err) {
      error.value = err.message || '批量删除物料失败'
      console.error('removeMaterialsBatch error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除物料
   * @param {number} id - 物料ID
   */
  const removeMaterial = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteMaterial(id)
      // 重新加载列表
      await loadMaterials()
      return true
    } catch (err) {
      error.value = err.message || '删除物料失败'
      console.error('removeMaterial error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索物料
   * @param {string} keyword - 搜索关键词
   */
  const searchMaterial = async (keyword) => {
    loading.value = true
    error.value = null
    try {
      const res = await searchMaterials(keyword)
      searchResults.value = res || []
      return res
    } catch (err) {
      error.value = err.message || '搜索物料失败'
      console.error('searchMaterial error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空搜索结果
   */
  const clearSearchResults = () => {
    searchResults.value = []
  }

  /**
   * 清空当前物料
   */
  const clearCurrentMaterial = () => {
    currentMaterial.value = null
  }

  return {
    // 状态
    materials,
    currentMaterial,
    searchResults,
    loading,
    error,
    // 方法
    loadMaterials,
    loadMaterialDetail,
    addMaterial,
    editMaterial,
    removeMaterial,
    removeMaterialsBatch,
    searchMaterial,
    clearSearchResults,
    clearCurrentMaterial
  }
})
