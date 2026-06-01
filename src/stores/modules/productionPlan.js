/**
 * 生产计划数据 Store
 * 1:1 翻译自 V1.1 Zustand store
 *
 * 数据流：API → request（无缓存）→ Store → 页面组件
 * - L1：Pinia Store 内存数组
 * - L2：（未使用）无 IndexedDB 缓存
 * - L3：（未使用）生产计划页面不读取 localStorage
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\stores\useProductionPlanStore.ts
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getProductionPlans,
  createProductionPlan,
  updateProductionPlan,
  deleteProductionPlan,
  deleteProductionPlans
} from '@/services/apiProductionPlanService'

/**
 * @typedef {import('@/services/apiProductionPlanService').CropBatch} CropBatch
 */

/**
 * 生产计划筛选条件
 * @typedef {Object} ProductionPlanFilters
 * @property {string} [status]
 * @property {string} [planType]
 * @property {string} [keyword]
 * @property {number} [page]
 * @property {number} [limit]
 */

export const useProductionPlanStore = defineStore('productionPlan', () => {
  // ============== 1:1 翻译 V1.1 state ==============
  /** @type {import('vue').Ref<CropBatch[]>} */
  const plans = ref([])

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)

  // ============== 1:1 翻译 V1.1 actions ==============

  /**
   * 获取生产计划列表
   * @param {ProductionPlanFilters} [filters]
   * @returns {Promise<void>}
   */
  async function fetchPlans(filters) {
    isLoading.value = true
    error.value = null
    try {
      const data = await getProductionPlans(filters)
      plans.value = data
    } catch (err) {
      // V1.1 不抛出，只设置 error 状态
      error.value = (err && err.message) || String(err)
      console.error('[useProductionPlanStore] 获取生产计划失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 新增生产计划
   * @param {Omit<CropBatch, 'id'>} plan
   * @returns {Promise<CropBatch>}
   */
  async function addPlan(plan) {
    const result = await createProductionPlan(plan)
    if (result) {
      // V1.1: set((state) => ({ plans: [result, ...state.plans] }))
      plans.value = [result, ...plans.value]
    }
    return result
  }

  /**
   * 更新生产计划
   * @param {string} id
   * @param {Partial<CropBatch>} updates
   * @returns {Promise<CropBatch | null>}
   */
  async function updatePlan(id, updates) {
    const result = await updateProductionPlan(id, updates)
    if (result) {
      // V1.1: set((state) => ({ plans: state.plans.map((p) => (p.id === id ? { ...p, ...result } : p)) }))
      plans.value = plans.value.map(p => (p.id === id ? { ...p, ...result } : p))
    }
    return result
  }

  /**
   * 删除单个生产计划
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async function deletePlan(id) {
    const result = await deleteProductionPlan(id)
    if (result) {
      // V1.1: set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }))
      plans.value = plans.value.filter(p => p.id !== id)
    }
    return result
  }

  /**
   * 批量删除生产计划
   * @param {string[]} ids
   * @returns {Promise<boolean>}
   */
  async function deletePlans(ids) {
    const result = await deleteProductionPlans(ids)
    if (result) {
      // V1.1: set((state) => ({ plans: state.plans.filter((p) => !ids.includes(p.id)) }))
      plans.value = plans.value.filter(p => !ids.includes(p.id))
    }
    return result
  }

  return {
    // state
    plans,
    isLoading,
    error,
    // actions
    fetchPlans,
    addPlan,
    updatePlan,
    deletePlan,
    deletePlans
  }
})
