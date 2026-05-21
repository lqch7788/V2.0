/**
 * 采购计划类型定义
 */

// 采购计划状态
export const PurchasePlanStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  PURCHASING: 'purchasing',
  CANCELLED: 'cancelled'
}

// 采购类型
export const PurchaseType = {
  PRODUCTION: 'production',
  URGENT: 'urgent',
  ROUTINE: 'routine',
  SAFETY: 'safety',
  MATERIAL: 'material',
  EQUIPMENT: 'equipment',
  OTHER: 'other'
}

// 优先级
export const Priority = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
}

// 审批状态
export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 采购计划物料明细项
export const PurchasePlanItem = {
  id: '',
  materialName: '',
  specification: '',
  unit: '',
  quantity: 0,
  estimatedUnitPrice: 0,
  estimatedTotalPrice: 0,
  supplierName: '',
  remarks: ''
}

// 采购计划
export const PurchasePlan = {
  id: '',
  purchaseApplicationCode: '',
  relatedBatchCode: '',
  purchaseType: 'routine',
  purchaseTypeName: '',
  applicant: '',
  applicantId: '',
  applicantDepartment: '',
  applyDate: '',
  requiredDate: '',
  priority: 'normal',
  priorityText: '',
  status: 'draft',
  statusText: '',
  approvalStatus: 'pending',
  remarks: '',
  approvalPerson: '',
  items: [],
  totalAmount: 0,
  attachments: [],
  supplierName: '',
  planTitle: '',
  createTime: '',
  updateTime: ''
}

// 计算预警结果
export const OverdueAlert = {
  level: 'normal',
  message: '',
  daysLeft: 0
}

/**
 * 计算采购计划的预警状态
 * @param plan 采购计划
 * @returns 预警结果
 */
export function calculateOverdueAlert(plan) {
  if (!plan.requiredDate) {
    return { level: 'normal', message: '未设置交货日期' }
  }

  const today = new Date()
  const requiredDate = new Date(plan.requiredDate)
  const diffTime = requiredDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      level: 'overdue',
      message: `已逾期 ${Math.abs(diffDays)} 天`,
      daysLeft: diffDays
    }
  } else if (diffDays <= 3) {
    return {
      level: 'warning',
      message: `即将到期，剩余 ${diffDays} 天`,
      daysLeft: diffDays
    }
  } else {
    return {
      level: 'normal',
      message: `剩余 ${diffDays} 天`,
      daysLeft: diffDays
    }
  }
}
