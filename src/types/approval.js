// 审批状态
export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
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
