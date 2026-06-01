/**
 * 每日计划 Pinia Store - 1:1 翻译自 V1.1
 * 管理每日计划的完整数据流（按日期 keyed）
 *
 * 数据流：API → request（无缓存）→ Store → 页面组件
 * - L1：Pinia Store 内存 Map（key 为日期 YYYY-MM-DD）
 * - L2：（未使用）无 IndexedDB 缓存
 * - L3：（未使用）日计划页面不读取 localStorage
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\stores\useDailyPlanStore.ts
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getDailyPlans,
  getDailyPlanByDate,
  saveDailyPlan,
  deleteDailyPlanByDate
} from '@/services/apiDailyPlanService'

/**
 * 日计划主体（每日计划的核心数据）
 * @typedef {import('@/types/planning').DailyPlan} DailyPlan
 */

/**
 * 日计划存储记录（含日期 key 与 planData 包装）
 * @typedef {import('@/types/planning').DailyPlanRecord} DailyPlanRecord
 */

export const useDailyPlanningStore = defineStore('dailyPlanning', () => {
  // ============== 1:1 翻译 V1.1 state ==============
  /**
   * 日计划 Map - key 为日期 (YYYY-MM-DD)
   * @type {import('vue').Ref<Record<string, DailyPlanRecord>>}
   */
  const plans = ref({})

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)

  // ============== 1:1 翻译 V1.1 actions ==============

  /**
   * 获取所有每日计划
   * 1:1 翻译自 V1.1 fetchPlans（V1.1 不抛错，仅设置 error 状态）
   * @returns {Promise<void>}
   */
  async function fetchPlans() {
    isLoading.value = true
    error.value = null
    try {
      const data = await getDailyPlans()
      /** @type {Record<string, DailyPlanRecord>} */
      const plansMap = {}
      if (Array.isArray(data)) {
        data.forEach((record) => {
          if (record && record.planDate) {
            plansMap[record.planDate] = record
          }
        })
      }
      plans.value = plansMap
    } catch (err) {
      error.value = (err && err.message) || String(err)
      console.error('[useDailyPlanningStore] 获取每日计划失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取指定日期的每日计划详情
   * 1:1 翻译自 V1.1 fetchPlanByDate（V1.1 失败返回 null，不抛错）
   * @param {string} date 日期 YYYY-MM-DD
   * @returns {Promise<DailyPlan | null>}
   */
  async function fetchPlanByDate(date) {
    try {
      const record = await getDailyPlanByDate(date)
      if (record && record.planData) {
        plans.value = { ...plans.value, [date]: record }
        return record.planData
      }
      return null
    } catch (err) {
      console.error('[useDailyPlanningStore] 获取每日计划详情失败:', err)
      return null
    }
  }

  /**
   * 保存每日计划
   * 1:1 翻译自 V1.1 savePlan（V1.1 失败返回 false，不抛错）
   * @param {string} date 日期 YYYY-MM-DD
   * @param {DailyPlan} plan 日计划内容
   * @returns {Promise<boolean>}
   */
  async function savePlan(date, plan) {
    try {
      const planRecord = {
        planDate: date,
        planData: plan
      }
      const savedRecord = await saveDailyPlan(planRecord)
      plans.value = { ...plans.value, [date]: savedRecord }
      return true
    } catch (err) {
      console.error('[useDailyPlanningStore] 保存每日计划失败:', err)
      return false
    }
  }

  /**
   * 根据日期删除每日计划
   * 1:1 翻译自 V1.1 deletePlan（V1.1 失败返回 false，不抛错）
   * @param {string} date 日期 YYYY-MM-DD
   * @returns {Promise<boolean>}
   */
  async function deletePlan(date) {
    try {
      const success = await deleteDailyPlanByDate(date)
      if (success) {
        const newPlans = { ...plans.value }
        delete newPlans[date]
        plans.value = newPlans
      }
      return success
    } catch (err) {
      console.error('[useDailyPlanningStore] 删除每日计划失败:', err)
      return false
    }
  }

  /**
   * 获取指定日期的日计划（本地缓存同步读取）
   * 1:1 翻译自 V1.1 getPlan（V1.1 通过 get() 同步访问 state）
   * @param {string} date 日期 YYYY-MM-DD
   * @returns {DailyPlan | null}
   */
  function getPlan(date) {
    const record = plans.value[date]
    return (record && record.planData) ? record.planData : null
  }

  return {
    // state
    plans,
    isLoading,
    error,
    // actions
    fetchPlans,
    fetchPlanByDate,
    savePlan,
    deletePlan,
    getPlan
  }
})
