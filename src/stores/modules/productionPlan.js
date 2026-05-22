/**
 * 生产计划数据 Store
 * 迁移自 VUE1.2 src/stores/productionPlan.js
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getProductionPlans,
  addProductionPlan,
  updateProductionPlan,
  deleteProductionPlan,
  deleteProductionPlans,
} from '../../services/productionPlanService'

export const useProductionPlanStore = defineStore('productionPlan', () => {
  const plans = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchPlans(filters) {
    isLoading.value = true
    error.value = null
    try {
      const data = await getProductionPlans(filters)
      const safeData = Array.isArray(data) ? data : []
      plans.value = safeData
    } catch (err) {
      console.error('[ProductionPlanStore] 获取生产计划失败:', err)
      error.value = err?.message
    } finally {
      isLoading.value = false
    }
  }

  async function addPlan(plan) {
    const result = await addProductionPlan(plan)
    const newPlan = { ...plan, id: result?.id || `PP${Date.now()}` }
    plans.value.unshift(newPlan)
    return newPlan
  }

  async function updatePlan(id, updates) {
    const result = await updateProductionPlan(id, updates)
    if (result) {
      plans.value = plans.value.map(p => (p.id === id ? { ...p, ...result } : p))
    }
    return result
  }

  async function deletePlan(id) {
    const result = await deleteProductionPlan(id)
    if (result) {
      plans.value = plans.value.filter(p => p.id !== id)
    }
    return result
  }

  async function deletePlans(ids) {
    const result = await deleteProductionPlans(ids)
    if (result) {
      plans.value = plans.value.filter(p => !ids.includes(p.id))
    }
    return result
  }

  return {
    plans,
    isLoading,
    error,
    fetchPlans,
    addPlan,
    updatePlan,
    deletePlan,
    deletePlans,
  }
})
