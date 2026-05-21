import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePurchasePlanStore = defineStore('purchasePlan', () => {
  // 状态
  const plans = ref([])
  const isLoading = ref(false)
  const statusUpdates = ref({})

  // 获取采购计划列表
  const fetchPlans = async () => {
    isLoading.value = true
    try {
      const storedPlans = localStorage.getItem('purchasePlans')
      if (storedPlans) {
        plans.value = JSON.parse(storedPlans)
      } else {
        plans.value = []
      }
    } catch (error) {
      console.error('获取采购计划数据失败:', error)
      plans.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 获取合并了API数据和审批状态更新的采购计划
  const getPlansWithStatus = computed(() => {
    return plans.value.map(plan => {
      const statusText = statusUpdates.value[plan.purchaseApplicationCode] || getDefaultStatusText(plan)
      const priorityText = getPriorityText(plan.priority)
      const purchaseTypeName = getPurchaseTypeName(plan.purchaseType)

      return {
        ...plan,
        statusText,
        priorityText,
        purchaseTypeName
      }
    })
  })

  // 获取默认状态文本
  const getDefaultStatusText = (plan) => {
    if (plan.approvalStatus === 'rejected') return '审批被拒绝'
    if (plan.status === 'completed') return '已完成'
    if (plan.status === 'purchasing') return '采购中'
    if (plan.status === 'pending') return '待审批'
    if (plan.status === 'draft') return '草稿'
    return '待审批'
  }

  // 获取优先级文本
  const getPriorityText = (priority) => {
    const map = {
      urgent: '紧急',
      high: '高',
      normal: '中',
      low: '低'
    }
    return map[priority] || priority
  }

  // 获取采购类型名称
  const getPurchaseTypeName = (type) => {
    const map = {
      production: '生产物资采购',
      urgent: '紧急采购',
      routine: '常规采购',
      safety: '劳保用品',
      material: '通用物资',
      equipment: '设备采购',
      other: '其他'
    }
    return map[type] || type
  }

  // 添加采购计划
  const addPlan = async (plan) => {
    const newPlan = {
      id: plan.id || `PP${Date.now()}`,
      purchaseApplicationCode: plan.purchaseApplicationCode || '',
      relatedBatchCode: plan.relatedBatchCode || '',
      purchaseType: plan.purchaseType || 'production',
      applicant: plan.applicant || '',
      applicantId: plan.applicantId || '',
      applicantDepartment: plan.applicantDepartment || '',
      applyDate: plan.applyDate || new Date().toISOString().slice(0, 10),
      requiredDate: plan.requiredDate || '',
      priority: plan.priority || 'normal',
      status: plan.status || 'pending',
      approvalStatus: plan.approvalStatus || 'pending',
      remarks: plan.remarks || '',
      approvalPerson: plan.approvalPerson || '',
      items: plan.items || [],
      totalAmount: plan.totalAmount || 0,
      attachments: plan.attachments || [],
      supplierName: plan.supplierName || '',
      planTitle: plan.planTitle || `${plan.purchaseType || ''} - ${plan.purchaseApplicationCode || ''}`
    }

    plans.value.unshift(newPlan)
    savePlans()
    return newPlan
  }

  // 更新采购计划
  const updatePlan = async (id, updates) => {
    const index = plans.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plans.value[index] = { ...plans.value[index], ...updates }
      savePlans()
    }
  }

  // 删除采购计划
  const deletePlan = async (id) => {
    plans.value = plans.value.filter(p => p.id !== id)
    savePlans()
  }

  // 批量删除采购计划
  const deletePlans = async (ids) => {
    plans.value = plans.value.filter(p => !ids.includes(p.id))
    savePlans()
  }

  // 保存到 localStorage
  const savePlans = () => {
    localStorage.setItem('purchasePlans', JSON.stringify(plans.value))
  }

  return {
    plans,
    isLoading,
    statusUpdates,
    fetchPlans,
    getPlansWithStatus,
    addPlan,
    updatePlan,
    deletePlan,
    deletePlans
  }
})
