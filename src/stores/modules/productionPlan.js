import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductionPlanStore = defineStore('productionPlan', () => {
  // 状态
  const plans = ref([])
  const isLoading = ref(false)

  // 获取生产计划列表
  const fetchPlans = async () => {
    isLoading.value = true
    try {
      const storedPlans = localStorage.getItem('productionPlans')
      if (storedPlans) {
        plans.value = JSON.parse(storedPlans)
      } else {
        plans.value = []
      }
    } catch (error) {
      console.error('获取生产计划数据失败:', error)
      plans.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 添加生产计划
  const addPlan = async (plan) => {
    const newPlan = {
      id: plan.id || `PP${Date.now()}`,
      batchCode: plan.batchCode || '',
      batchName: plan.batchName || '',
      planType: plan.planType || 'planting',
      cropName: plan.cropName || '',
      cropType: plan.cropType || '',
      variety: plan.variety || '',
      greenhouseId: plan.greenhouseId || '',
      greenhouseName: plan.greenhouseName || '',
      plantingArea: plan.plantingArea || 0,
      stage: plan.stage || 'seedling',
      stageName: plan.stageName || '苗期',
      startDate: plan.startDate || '',
      expectedHarvestDate: plan.expectedHarvestDate || '',
      targetYield: plan.targetYield || 0,
      actualYield: plan.actualYield || 0,
      status: plan.status || 'planned',
      plantingMode: plan.plantingMode || '',
      responsiblePerson: plan.responsiblePerson || '',
      publisher: plan.publisher || '',
      publishDate: plan.publishDate || '',
      lastModifyDate: new Date().toISOString().slice(0, 10),
      batchStatus: plan.batchStatus || 'draft',
      planTypeName: plan.planTypeName || '',
      description: plan.description || '',
      planDetail: plan.planDetail || ''
    }

    plans.value.unshift(newPlan)
    savePlans()
    return newPlan
  }

  // 更新生产计划
  const updatePlan = async (id, updates) => {
    const index = plans.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plans.value[index] = { ...plans.value[index], ...updates, lastModifyDate: new Date().toISOString().slice(0, 10) }
      savePlans()
    }
  }

  // 删除生产计划
  const deletePlan = async (id) => {
    plans.value = plans.value.filter(p => p.id !== id)
    savePlans()
  }

  // 批量删除生产计划
  const deletePlans = async (ids) => {
    plans.value = plans.value.filter(p => !ids.includes(p.id))
    savePlans()
  }

  // 保存到 localStorage
  const savePlans = () => {
    localStorage.setItem('productionPlans', JSON.stringify(plans.value))
  }

  return {
    plans,
    isLoading,
    fetchPlans,
    addPlan,
    updatePlan,
    deletePlan,
    deletePlans
  }
})
