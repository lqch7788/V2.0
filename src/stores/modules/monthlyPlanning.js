/**
 * 月度计划 Pinia Store - 1:1 翻译自 V1.1
 * 管理月度计划的完整数据流（按月份 keyed）
 *
 * 数据流：API → request（无缓存）→ Store → 页面组件
 * - L1：Pinia Store 内存 Map（key 为月份 YYYY-MM）
 * - L2：（未使用）无 IndexedDB 缓存
 * - L3：（未使用）月计划页面不读取 localStorage
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\stores\useMonthlyPlanStore.ts
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getMonthlyPlans,
  getMonthlyPlanByMonth,
  saveMonthlyPlan,
  deleteMonthlyPlanByMonth
} from '@/services/apiMonthlyPlanService'

/**
 * 月计划主体（月度计划的核心数据）
 * @typedef {import('@/types/planning').MonthlyPlan} MonthlyPlan
 */

/**
 * 月计划存储记录（含月份 key 与 planData 包装）
 * @typedef {import('@/types/planning').MonthlyPlanRecord} MonthlyPlanRecord
 */

export const useMonthlyPlanningStore = defineStore('monthlyPlanning', () => {
  // ============== 1:1 翻译 V1.1 state ==============
  /**
   * 月计划 Map - key 为月份 (YYYY-MM)
   * @type {import('vue').Ref<Record<string, MonthlyPlanRecord>>}
   */
  const plans = ref({})

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)

  // ============== 1:1 翻译 V1.1 actions ==============

  /**
   * 获取所有月度计划
   * 1:1 翻译自 V1.1 fetchPlans（V1.1 不抛错，仅设置 error 状态）
   * @returns {Promise<void>}
   */
  async function fetchPlans() {
    isLoading.value = true
    error.value = null
    try {
      const data = await getMonthlyPlans()
      /** @type {Record<string, MonthlyPlanRecord>} */
      const plansMap = {}
      if (Array.isArray(data)) {
        data.forEach((record) => {
          if (record && record.planMonth) {
            plansMap[record.planMonth] = record
          }
        })
      }
      plans.value = plansMap
    } catch (err) {
      error.value = (err && err.message) || String(err)
      console.error('[useMonthlyPlanningStore] 获取月度计划失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取指定月份的月度计划详情
   * 1:1 翻译自 V1.1 fetchPlanByMonth（V1.1 失败返回 null，不抛错）
   * @param {string} month 月份 YYYY-MM
   * @returns {Promise<MonthlyPlan | null>}
   */
  async function fetchPlanByMonth(month) {
    try {
      const record = await getMonthlyPlanByMonth(month)
      if (record && record.planData) {
        plans.value = { ...plans.value, [month]: record }
        return record.planData
      }
      return null
    } catch (err) {
      console.error('[useMonthlyPlanningStore] 获取月度计划详情失败:', err)
      return null
    }
  }

  /**
   * 保存月度计划
   * 1:1 翻译自 V1.1 savePlan（V1.1 失败返回 false，不抛错）
   * @param {string} month 月份 YYYY-MM
   * @param {MonthlyPlan} plan 月计划内容
   * @returns {Promise<boolean>}
   */
  async function savePlan(month, plan) {
    try {
      const planRecord = {
        planMonth: month,
        planData: plan
      }
      const savedRecord = await saveMonthlyPlan(planRecord)
      plans.value = { ...plans.value, [month]: savedRecord }
      return true
    } catch (err) {
      console.error('[useMonthlyPlanningStore] 保存月度计划失败:', err)
      return false
    }
  }

  /**
   * 根据月份删除月度计划
   * 1:1 翻译自 V1.1 deletePlan（V1.1 失败返回 false，不抛错）
   * @param {string} month 月份 YYYY-MM
   * @returns {Promise<boolean>}
   */
  async function deletePlan(month) {
    try {
      const success = await deleteMonthlyPlanByMonth(month)
      if (success) {
        const newPlans = { ...plans.value }
        delete newPlans[month]
        plans.value = newPlans
      }
      return success
    } catch (err) {
      console.error('[useMonthlyPlanningStore] 删除月度计划失败:', err)
      return false
    }
  }

  /**
   * 获取指定月份的月计划（本地缓存同步读取）
   * 1:1 翻译自 V1.1 getPlan（V1.1 通过 get() 同步访问 state）
   * @param {string} month 月份 YYYY-MM
   * @returns {MonthlyPlan | null}
   */
  function getPlan(month) {
    const record = plans.value[month]
    return (record && record.planData) ? record.planData : null
  }

  return {
    // state
    plans,
    isLoading,
    error,
    // actions
    fetchPlans,
    fetchPlanByMonth,
    savePlan,
    deletePlan,
    getPlan
  }
})
