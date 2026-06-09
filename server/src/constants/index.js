/**
 * 通用状态枚举常量
 * 解决魔法字符串问题，统一管理状态值
 */

// ============================================================
// 通用状态
// ============================================================

export const CommonStatus = {
  ACTIVE: 'active',           // 激活/启用
  INACTIVE: 'inactive',       // 未激活/停用
  PENDING: 'pending',         // 待处理
  APPROVED: 'approved',       // 已批准
  REJECTED: 'rejected',       // 已拒绝
  CANCELLED: 'cancelled',     // 已取消
  COMPLETED: 'completed',     // 已完成
  FAILED: 'failed',           // 失败
  DRAFT: 'draft',             // 草稿
}

// ============================================================
// 任务状态
// ============================================================

export const TaskStatus = {
  PENDING: 'pending',               // 待接受
  IN_PROGRESS: 'in_progress',       // 进行中
  COMPLETED: 'completed',           // 已完成
  CANCELLED: 'cancelled',           // 已取消
  OVERDUE: 'overdue',               // 已逾期
}

// ============================================================
// 作物生长阶段
// ============================================================

export const CropStage = {
  SEEDLING: 'seedling',             // 育苗期
  VEGETATIVE: 'vegetative',         // 营养生长期
  FLOWERING: 'flowering',           // 开花期
  FRUITING: 'fruiting',             // 结果期
  HARVEST: 'harvest',               // 采收期
  DORMANT: 'dormant',               // 休眠期
}

// ============================================================
// 库存状态
// ============================================================

export const InventoryStatus = {
  IN_STOCK: 'in_stock',             // 在库
  OUT_OF_STOCK: 'out_of_stock',     // 缺货
  LOW_STOCK: 'low_stock',           // 库存不足
  EXPIRED: 'expired',               // 已过期
  DAMAGED: 'damaged',               // 损坏
  RESERVED: 'reserved',             // 已预留
}

// ============================================================
// 审批状态（从前端 types/approval.ts 同步）
// ============================================================

export const ApprovalStatusEnum = {
  DRAFT: 'draft',                       // 草稿
  PENDING: 'pending',                   // 待审批
  APPROVED: 'approved',                 // 已通过
  PARTIALLY_APPROVED: 'partially_approved', // 部分通过
  REJECTED: 'rejected',                 // 已拒绝
  CANCELLED: 'cancelled',               // 已撤回
}

// ============================================================
// 审批动作
// ============================================================

export const ApprovalActionEnum = {
  APPROVE: 'approve',                   // 通过
  REJECT: 'reject',                     // 拒绝
  PARTIALLY_APPROVE: 'partially_approve', // 部分通过
  CANCEL: 'cancel',                     // 撤回
}

// ============================================================
// 优先级
// ============================================================

export const Priority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
}

// ============================================================
// 请假类型
// ============================================================

export const LeaveType = {
  ANNUAL: 'annual',                   // 年假
  SICK: 'sick',                       // 病假
  PERSONAL: 'personal',                // 事假
  MARRIAGE: 'marriage',               // 婚假
  MATERNITY: 'maternity',             // 产假
  FUNERAL: 'funeral',                 // 丧假
}

// ============================================================
// 加班类型
// ============================================================

export const OvertimeType = {
  WEEKDAY: 'weekday',                 // 工作日加班
  WEEKEND: 'weekend',                  // 周末加班
  HOLIDAY: 'holiday',                  // 节假日加班
}

// ============================================================
// 人员状态
// ============================================================

export const EmployeeStatus = {
  ON_BOARD: 'on_board',               // 在职
  RESIGNED: 'resigned',               // 已离职
  PROBATION: 'probation',              // 试用期
  SUSPENDED: 'suspended',              // 停职
  RETIRED: 'retired',                  // 退休
}

// ============================================================
// 性别
// ============================================================

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
}

// ============================================================
// 状态映射表（用于显示）- 每个枚举类型独立映射
// ============================================================

export const COMMON_STATUS_LABELS = {
  [CommonStatus.ACTIVE]: '启用',
  [CommonStatus.INACTIVE]: '停用',
  [CommonStatus.PENDING]: '待处理',
  [CommonStatus.APPROVED]: '已批准',
  [CommonStatus.REJECTED]: '已拒绝',
  [CommonStatus.CANCELLED]: '已取消',
  [CommonStatus.COMPLETED]: '已完成',
  [CommonStatus.FAILED]: '失败',
  [CommonStatus.DRAFT]: '草稿',
};

export const TASK_STATUS_LABELS = {
  [TaskStatus.PENDING]: '待接受',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.COMPLETED]: '已完成',
  [TaskStatus.CANCELLED]: '已取消',
  [TaskStatus.OVERDUE]: '已逾期',
};

export const CROP_STAGE_LABELS = {
  [CropStage.SEEDLING]: '育苗期',
  [CropStage.VEGETATIVE]: '营养生长期',
  [CropStage.FLOWERING]: '开花期',
  [CropStage.FRUETING]: '结果期',
  [CropStage.HARVEST]: '采收期',
  [CropStage.DORMANT]: '休眠期',
};

export const INVENTORY_STATUS_LABELS = {
  [InventoryStatus.IN_STOCK]: '在库',
  [InventoryStatus.OUT_OF_STOCK]: '缺货',
  [InventoryStatus.LOW_STOCK]: '库存不足',
  [InventoryStatus.EXPIRED]: '已过期',
  [InventoryStatus.DAMAGED]: '损坏',
  [InventoryStatus.RESERVED]: '已预留',
};

export const APPROVAL_STATUS_LABELS = {
  [ApprovalStatusEnum.DRAFT]: '草稿',
  [ApprovalStatusEnum.PENDING]: '待审批',
  [ApprovalStatusEnum.APPROVED]: '已通过',
  [ApprovalStatusEnum.PARTIALLY_APPROVED]: '部分通过',
  [ApprovalStatusEnum.REJECTED]: '已拒绝',
  [ApprovalStatusEnum.CANCELLED]: '已撤回',
};

export const PRIORITY_LABELS = {
  [Priority.LOW]: '低',
  [Priority.NORMAL]: '普通',
  [Priority.HIGH]: '高',
  [Priority.URGENT]: '紧急',
};

export const LEAVE_TYPE_LABELS = {
  [LeaveType.ANNUAL]: '年假',
  [LeaveType.SICK]: '病假',
  [LeaveType.PERSONAL]: '事假',
  [LeaveType.MARRIAGE]: '婚假',
  [LeaveType.MATERNITY]: '产假',
  [LeaveType.FUNERAL]: '丧假',
};

export const OVERTIME_TYPE_LABELS = {
  [OvertimeType.WEEKDAY]: '工作日加班',
  [OvertimeType.WEEKEND]: '周末加班',
  [OvertimeType.HOLIDAY]: '节假日加班',
};

export const EMPLOYEE_STATUS_LABELS = {
  [EmployeeStatus.ON_BOARD]: '在职',
  [EmployeeStatus.RESIGNED]: '已离职',
  [EmployeeStatus.PROBATION]: '试用期',
  [EmployeeStatus.SUSPENDED]: '停职',
  [EmployeeStatus.RETIRED]: '退休',
};

/**
 * 获取状态标签（通用版本）
 */
export function getCommonStatusLabel(status) {
  return COMMON_STATUS_LABELS[status] || status;
}

export function getTaskStatusLabel(status) {
  return TASK_STATUS_LABELS[status] || status;
}

export function getCropStageLabel(status) {
  return CROP_STAGE_LABELS[status] || status;
}

export function getInventoryStatusLabel(status) {
  return INVENTORY_STATUS_LABELS[status] || status;
}

export function getApprovalStatusLabel(status) {
  return APPROVAL_STATUS_LABELS[status] || status;
}

export function getPriorityLabel(priority) {
  return PRIORITY_LABELS[priority] || priority;
}

export function getLeaveTypeLabel(type) {
  return LEAVE_TYPE_LABELS[type] || type;
}

export function getOvertimeTypeLabel(type) {
  return OVERTIME_TYPE_LABELS[type] || type;
}

export function getEmployeeStatusLabel(status) {
  return EMPLOYEE_STATUS_LABELS[status] || status;
}
