/**
 * 状态字面量常量（第二阶段 Y5 重构）
 * 消除散落各处的字符串字面量，统一状态枚举引用，便于将来扩展时一处改全局同步
 *
 * 涵盖 4 大类状态：
 * 1. 订单/批次状态：orderStatus
 * 2. 任务进度状态：taskStatus
 * 3. 方案状态：techSolutionStatus
 * 4. 方案是否有效：techSolutionValidity
 * 5. 审批状态：approvalStatus
 * 6. 审批操作类型：approvalAction
 * 7. 任务进度状态（高级）：progressStatus
 */

export const ORDER_STATUS = Object.freeze({
  DRAFT: 'draft',
  PLANNING: 'planning',
  PLANNED: 'planned',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  PLANTED: 'planted',
  GROWING: 'growing',
  HARVESTING: 'harvesting',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',
})

export const ORDER_STATUS_LABEL = Object.freeze({
  draft: '草稿',
  planning: '规划中',
  planned: '计划中',
  published: '已发布',
  in_progress: '进行中',
  planted: '已种植',
  growing: '生长中',
  harvesting: '采收中',
  completed: '已完成',
  cancelled: '已取消',
  suspended: '已暂停',
})

export const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
})

export const TASK_STATUS_LABEL = Object.freeze({
  pending: '待执行',
  completed: '已完成',
  cancelled: '已取消',
  delayed: '已推迟',
})

// 方案状态（V1.1 tech solution status 6 个枚举）
export const TECH_SOLUTION_STATUS = Object.freeze({
  PUBLISHED: '已发布',
  DRAFT: '草稿',
  REVIEWING: '审核中',
  PENDING: '待审批',
  REJECTED: '已拒绝',
  INVALID: '已作废',
})

// 方案是否有效（V1.1 2 枚举）
export const TECH_SOLUTION_VALIDITY = Object.freeze({
  VALID: '有效',
  INVALID: '作废',
})

// 审批状态（V1.1 approval.tsx 5 枚举）
export const APPROVAL_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  PARTIALLY_APPROVED: 'partially_approved',
})

export const APPROVAL_STATUS_LABEL = Object.freeze({
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已撤销',
  partially_approved: '部分通过',
})

// 审批操作类型（V1.1 L75 4 枚举）
export const APPROVAL_ACTION = Object.freeze({
  APPROVE: 'approve',
  REJECT: 'reject',
  PARTIALLY_APPROVE: 'partially_approve',
  CANCEL: 'cancel',
})

export const APPROVAL_ACTION_LABEL = Object.freeze({
  approve: '通过',
  reject: '拒绝',
  partially_approve: '部分通过',
  cancel: '撤销',
})

// 任务进度状态（DailyPlanning.vue L177 等使用）
export const PROGRESS_STATUS = Object.freeze({
  AHEAD: 'ahead',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled',
})

export const PROGRESS_STATUS_LABEL = Object.freeze({
  ahead: '提前完成',
  delayed: '已推迟',
  cancelled: '已取消',
})

// 全部状态过滤器值（用于 TechSolutionFilters 下拉）
export const TECH_SOLUTION_FILTER_OPTIONS = Object.freeze([
  { label: '全部', value: '全部' },
  { label: '已发布', value: TECH_SOLUTION_STATUS.PUBLISHED },
  { label: '草稿', value: TECH_SOLUTION_STATUS.DRAFT },
  { label: '审核中', value: TECH_SOLUTION_STATUS.REVIEWING },
  { label: '待审批', value: TECH_SOLUTION_STATUS.PENDING },
  { label: '已拒绝', value: TECH_SOLUTION_STATUS.REJECTED },
  { label: '已作废', value: TECH_SOLUTION_STATUS.INVALID },
])
