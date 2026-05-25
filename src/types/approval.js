// 审批状态
export const ApprovalStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// 审批动作
export const ApprovalAction = {
  APPROVE: 'approve',
  REJECT: 'reject',
  PARTIALLY_APPROVE: 'partially_approve',
  CANCEL: 'cancel',
}

// 获取审批类型名称
export function getApprovalTypeName(type) {
  const typeNames = {
    [ApprovalType.MATERIAL_REQUEST]: '领料申请',
    [ApprovalType.RETURN_MATERIAL]: '退料单',
    [ApprovalType.PURCHASE_REQUEST]: '采购申请',
    [ApprovalType.MATERIAL_INBOUND]: '物料入库',
    [ApprovalType.MATERIAL_TRANSFER]: '库存调拨',
    [ApprovalType.SEED_SOURCE_INBOUND]: '种源入库',
    [ApprovalType.SEEDLING_PLAN]: '育苗计划',
    [ApprovalType.PLANTING_PLAN]: '种植计划',
    [ApprovalType.ORDER_CREATE]: '订单创建',
    [ApprovalType.ORDER_CHANGE]: '订单变更',
    [ApprovalType.PRODUCTION_PLAN]: '生产计划',
    [ApprovalType.PRODUCTION_BATCH]: '生产批次',
    [ApprovalType.BATCH_CHANGE]: '批次变更',
    [ApprovalType.BATCH_VOID]: '批次作废',
    [ApprovalType.TECH_SOLUTION]: '技术方案',
    [ApprovalType.TASK_DISPATCH]: '任务派发',
    [ApprovalType.TASK_CHANGE]: '任务变更',
    [ApprovalType.INSPECTION_ISSUE]: '巡查问题',
    [ApprovalType.ISSUE_RESOLVE]: '问题整改',
    [ApprovalType.HARVEST_REQUEST]: '采收申请',
    [ApprovalType.SEED_SOURCE_SUPPLEMENTARY]: '种源补录',
    [ApprovalType.SEEDLING_SUPPLEMENTARY]: '育苗补录',
    [ApprovalType.CROP_STORAGE_SUPPLEMENTARY]: '作物入库补录',
    [ApprovalType.INDICATOR_APPROVAL]: '指标发布',
    [ApprovalType.INDICATOR_ADJUST]: '指标调整',
    [ApprovalType.ANNOUNCEMENT_APPROVAL]: '公告审批',
    [ApprovalType.BUDGET_CREATE]: '预算编制',
    [ApprovalType.BUDGET_ADJUST]: '预算调整',
    [ApprovalType.LEAVE]: '请假',
    [ApprovalType.OVERTIME]: '加班',
    [ApprovalType.RESIGNATION]: '离职',
    [ApprovalType.RECRUITMENT]: '招聘',
    [ApprovalType.ONBOARDING]: '入职',
    [ApprovalType.ATTENDANCE_REPAIR]: '考勤补录',
    [ApprovalType.SALARY_ADJUSTMENT]: '调薪',
    [ApprovalType.CONTRACT_RENEWAL]: '合同续签',
    [ApprovalType.SALARY_BUDGET]: '工资预算',
    [ApprovalType.TRANSFER]: '转岗',
  }
  return typeNames[type] || type
}

// 获取状态名称
export function getApprovalStatusName(status) {
  const statusNames = {
    [ApprovalStatus.DRAFT]: '草稿',
    [ApprovalStatus.PENDING]: '待审批',
    [ApprovalStatus.APPROVED]: '已通过',
    [ApprovalStatus.PARTIALLY_APPROVED]: '部分通过',
    [ApprovalStatus.REJECTED]: '已拒绝',
    [ApprovalStatus.CANCELLED]: '已撤回',
  }
  return statusNames[status] || status
}

// 审批类型 - 完整枚举
export const ApprovalType = {
  // 业务审批
  MATERIAL_REQUEST: 'material_request',
  RETURN_MATERIAL: 'return_material',
  PURCHASE_REQUEST: 'purchase_request',
  MATERIAL_INBOUND: 'material_inbound',
  MATERIAL_TRANSFER: 'material_transfer',
  SEED_SOURCE_INBOUND: 'seed_source_inbound',
  SEEDLING_PLAN: 'seedling_plan',
  PLANTING_PLAN: 'planting_plan',
  ORDER_CREATE: 'order_create',
  ORDER_CHANGE: 'order_change',
  // 生产审批
  PRODUCTION_PLAN: 'production_plan',
  PRODUCTION_BATCH: 'production_batch',
  BATCH_CHANGE: 'batch_change',
  BATCH_VOID: 'batch_void',
  TECH_SOLUTION: 'tech_solution',
  // 农事审批
  TASK_DISPATCH: 'task_dispatch',
  TASK_CHANGE: 'task_change',
  INSPECTION_ISSUE: 'inspection_issue',
  ISSUE_RESOLVE: 'issue_resolve',
  // 采收审批
  HARVEST_REQUEST: 'harvest_request',
  // 作物补录审批
  SEED_SOURCE_SUPPLEMENTARY: 'seed_source_supplementary',
  SEEDLING_SUPPLEMENTARY: 'seedling_supplementary',
  CROP_STORAGE_SUPPLEMENTARY: 'crop_storage_supplementary',
  // 指标/公告审批
  INDICATOR_APPROVAL: 'indicator_approval',
  INDICATOR_ADJUST: 'indicator_adjust',
  ANNOUNCEMENT_APPROVAL: 'announcement_approval',
  // 成本审批
  BUDGET_CREATE: 'budget_create',
  BUDGET_ADJUST: 'budget_adjust',
  // HR审批
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  RESIGNATION: 'resignation',
  RECRUITMENT: 'recruitment',
  ONBOARDING: 'onboarding',
  ATTENDANCE_REPAIR: 'attendance_repair',
  SALARY_ADJUSTMENT: 'salary_adjustment',
  CONTRACT_RENEWAL: 'contract_renewal',
  SALARY_BUDGET: 'salary_budget',
  TRANSFER: 'transfer',
  // 通用
  MATERIAL: 'material',
  EXPENSE: 'expense',
  PRODUCTION: 'production'
}

// 审批记录
export const ApprovalRecord = {
  id: 0,
  type: 'material',
  title: '',
  content: '',
  applicantId: 0,
  applicantName: '',
  department: '',
  applyDate: '',
  status: 'pending',
  currentLevel: 0,
  totalLevel: 0,
  approvers: [],
  attachments: [],
  remark: ''
}

// 审批人
export const Approver = {
  level: 0,
  userId: 0,
  userName: '',
  status: 'pending',
  comment: '',
  actionDate: ''
}
