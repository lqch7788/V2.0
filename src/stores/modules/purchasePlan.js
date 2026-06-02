/**
 * 采购计划 Pinia Store - 1:1 翻译自 V1.1
 * 管理采购计划的完整 CRUD 数据流 + 审批状态联动
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存 / 离线队列) → Store → 页面组件
 * - L1：Pinia Store 内存数组
 * - L2：（未使用）无 IndexedDB 缓存
 * - L3：（未使用）采购计划页面不读取 localStorage
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\stores\usePurchasePlanStore.ts
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getPurchasePlans,
  addPurchasePlan,
  updatePurchasePlan,
  deletePurchasePlan,
  deletePurchasePlans
} from '@/services/apiPurchasePlanService'

/**
 * 采购计划主体（来自后端 /purchase-plans）
 * @typedef {import('@/types/purchase').PurchasePlan} PurchasePlan
 */

/**
 * 采购计划状态联动更新条目
 * @typedef {Object} PurchasePlanStatusUpdate
 * @property {string} planId  采购计划 ID
 * @property {string} status  状态值
 * @property {string} statusText  状态中文文本
 * @property {string} updatedAt  ISO 字符串时间戳
 */

/** 创建采购计划入参（前端侧，不含 id） */
/**
 * @typedef {Omit<PurchasePlan, 'id'>} CreatePurchasePlanInput
 */

/** 更新采购计划入参（部分字段） */
/**
 * @typedef {Partial<Omit<PurchasePlan, 'id'>>} UpdatePurchasePlanInput
 */

export const usePurchasePlanStore = defineStore('purchasePlan', () => {
  // ============== 1:1 翻译 V1.1 state ==============
  /** @type {import('vue').Ref<PurchasePlan[]>} */
  const plans = ref([])

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)

  /** @type {import('vue').Ref<Record<string, PurchasePlanStatusUpdate>>} */
  const statusUpdates = ref({})

  // ============== 1:1 翻译 V1.1 getters ==============

  /**
   * 获取合并了 API 数据和审批状态更新的采购计划
   * 1:1 翻译自 V1.1 getPlansWithStatus（按 plan.id 合并 statusUpdates）
   * V2.0 消费者（PurchasePlan.vue）以属性方式访问，故暴露为 computed
   * @type {import('vue').ComputedRef<PurchasePlan[]>}
   */
  const getPlansWithStatus = computed(() => {
    return plans.value.map(plan => {
      const update = statusUpdates.value[plan.id]
      if (update) {
        return {
          ...plan,
          status: update.status,
          statusText: update.statusText
        }
      }
      return plan
    })
  })

  // ============== 1:1 翻译 V1.1 actions ==============

  /**
   * 获取采购计划列表
   * 1:1 翻译自 V1.1 fetchPlans
   * @returns {Promise<void>}
   */
  async function fetchPlans() {
    isLoading.value = true
    error.value = null
    try {
      const data = await getPurchasePlans()
      plans.value = data || []
    } catch (err) {
      // V1.1 不抛出，只设置 error 状态
      error.value = (err && err.message) || String(err)
      console.error('[usePurchasePlanStore] 获取采购计划失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 新增采购计划
   * 1:1 翻译自 V1.1 addPlan
   * @param {CreatePurchasePlanInput} data
   * @returns {Promise<PurchasePlan>}
   */
  async function addPlan(data) {
    const result = await addPurchasePlan(data)
    if (result) {
      // V1.1: set((state) => ({ plans: [result, ...state.plans] }))
      plans.value = [result, ...plans.value]
    }
    return result
  }

  /**
   * 更新采购计划
   * 1:1 翻译自 V1.1 updatePlan
   * @param {string} id
   * @param {UpdatePurchasePlanInput} updates
   * @returns {Promise<PurchasePlan | null>}
   */
  async function updatePlan(id, updates) {
    const result = await updatePurchasePlan(id, updates)
    if (result) {
      // V1.1: set((state) => ({ plans: state.plans.map((p) => (p.id === id ? { ...p, ...result } : p)) }))
      plans.value = plans.value.map(p => (p.id === id ? { ...p, ...result } : p))
    }
    return result
  }

  /**
   * 删除单个采购计划
   * 1:1 翻译自 V1.1 deletePlan
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async function deletePlan(id) {
    const result = await deletePurchasePlan(id)
    if (result) {
      // V1.1: set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }))
      plans.value = plans.value.filter(p => p.id !== id)
    }
    return result
  }

  /**
   * 批量删除采购计划
   * 1:1 翻译自 V1.1 deletePlans（按 { deleted, skipped } 过滤实际删除的 id）
   * @param {string[]} ids
   * @returns {Promise<{ deleted: number; skipped: { id: string; reason: string }[] }>}
   */
  async function deletePlans(ids) {
    const result = await deletePurchasePlans(ids)
    if (result && result.deleted > 0) {
      // V1.1 行为：未在 skipped 中的 id 从 plans 中过滤掉（部分删除支持）
      const deletedSet = new Set(
        ids.filter((id) => !(result.skipped || []).some((s) => s.id === id))
      )
      plans.value = plans.value.filter((p) => !deletedSet.has(p.id))
    }
    return result
  }

  /**
   * 更新采购计划状态（本地联动，1:1 翻译自 V1.1 updatePurchasePlanStatus）
   * @param {string} planId
   * @param {string} status
   * @param {string} statusText
   * @returns {void}
   */
  function updatePurchasePlanStatus(planId, status, statusText) {
    /** @type {PurchasePlanStatusUpdate} */
    const update = {
      planId,
      status,
      statusText,
      updatedAt: new Date().toISOString()
    }
    statusUpdates.value = {
      ...statusUpdates.value,
      [planId]: update
    }
  }

  /**
   * 获取所有状态联动更新
   * 1:1 翻译自 V1.1 getStatusUpdates
   * @returns {Record<string, PurchasePlanStatusUpdate>}
   */
  function getStatusUpdates() {
    return statusUpdates.value
  }

  /**
   * 清空所有状态联动更新
   * 1:1 翻译自 V1.1 clearAllUpdates
   * @returns {void}
   */
  function clearAllUpdates() {
    statusUpdates.value = {}
  }

  return {
    // state
    plans,
    isLoading,
    error,
    statusUpdates,
    // getters
    getPlansWithStatus,
    // actions
    fetchPlans,
    addPlan,
    updatePlan,
    deletePlan,
    deletePlans,
    updatePurchasePlanStatus,
    getStatusUpdates,
    clearAllUpdates
  }
})
