/**
 * 行政区划 Store - 严格 1:1 对齐 V1.1 useRegionStore.ts
 * V1.1: Zustand → V2.0: Pinia (功能等价)
 * 功能: 四级级联懒加载 (国家→省份→城市→区县)
 * 策略: cache-first, 数据极少变化
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api/request'

/**
 * @typedef {Object} RegionNode
 * @property {number} id
 * @property {string} name
 * @property {number} parentId
 * @property {'country'|'province'|'city'|'area'} level
 */

export const useRegionStore = defineStore('region', () => {
  // 状态
  const provinces = ref([])
  const childrenCache = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * 获取省份列表 (parent_id=1 表示中国)
   * V1.1: GET /region?parent_id=1
   */
  const fetchProvinces = async () => {
    if (provinces.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      const data = await request.get('/region?parent_id=1')
      const list = Array.isArray(data) ? data : (data?.data || [])
      provinces.value = list
    } catch (err) {
      error.value = err.message || '获取省份列表失败'
      console.error('fetchProvinces error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取子级区域 (懒加载 + 缓存)
   * V1.1: GET /region?parent_id={parentId}
   * @param {number} parentId
   * @returns {Promise<RegionNode[]>}
   */
  const getChildren = async (parentId) => {
    const cached = childrenCache.value[parentId]
    if (cached && cached.length > 0) return cached
    try {
      const data = await request.get(`/region?parent_id=${parentId}`)
      const list = Array.isArray(data) ? data : (data?.data || [])
      childrenCache.value = { ...childrenCache.value, [parentId]: list }
      return list
    } catch (err) {
      console.error(`getChildren(${parentId}) error:`, err)
      return []
    }
  }

  /**
   * 搜索区域 (V1.1 风格, 可选)
   * V1.1: GET /region/search?keyword=&level=
   */
  const searchRegions = async (keyword, level) => {
    try {
      const params = new URLSearchParams({ keyword })
      if (level) params.append('level', level)
      const data = await request.get(`/region/search?${params.toString()}`)
      return Array.isArray(data) ? data : (data?.data || [])
    } catch {
      return []
    }
  }

  /**
   * 初始化区域数据 (V1.1 风格, 用于第一次部署)
   * V1.1: POST /region/init
   */
  const initRegions = async () => {
    isLoading.value = true
    error.value = null
    try {
      await request.post('/region/init')
      const data = await request.get('/region?parent_id=1')
      const list = Array.isArray(data) ? data : (data?.data || [])
      provinces.value = list
    } catch (err) {
      error.value = err.message || '初始化区域数据失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    provinces,
    childrenCache,
    isLoading,
    error,
    // 方法
    fetchProvinces,
    getChildren,
    searchRegions,
    initRegions
  }
})
