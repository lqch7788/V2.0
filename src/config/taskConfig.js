/**
 * 农事任务配置常量
 * 从 V1.1 src/config/taskConfig.ts 1:1 迁移
 */

// ============================================
// 超时配置
// ============================================
export const OVERTIME_CONFIG = {
  acceptWarningHours: 12,
  acceptCriticalHours: 24,
  executionWarningHours: 24,
  executionCriticalHours: 48,
  acceptanceWarningHours: 24,
  acceptanceCriticalHours: 48,
  checkIntervalMs: 5 * 60 * 1000,
}

// ============================================
// 延期限制
// ============================================
export const DEADLINE_CONFIG = {
  maxExtensions: 3,
  maxExtensionHours: 72,
  totalMaxExtensionHours: 168,
}

// ============================================
// 催办限制
// ============================================
export const REMINDER_CONFIG = {
  minIntervalMinutes: 60,
  maxRemindersPerDay: 5,
  autoReminderHours: 12,
}

// ============================================
// 返工规则
// ============================================
export const REWORK_CONFIG = {
  maxReworkCount: 2,
}

// ============================================
// 存储容量
// ============================================
export const STORAGE_CONFIG = {
  maxRecordsPerTask: 100,
  maxRecords: 500,
  archiveAfterDays: 90,
  warnThreshold: 0.8,
  criticalThreshold: 0.95,
}

// ============================================
// 操作权限矩阵
// ============================================
export const TASK_PERMISSIONS = {
  withdraw: { roles: ['admin'], statuses: ['pending'] },
  cancel: { roles: ['admin'], statuses: ['accepted', 'in_progress'] },
  reassign: { roles: ['admin'], statuses: ['failed', 'abandoned'] },
  accept: { roles: ['assignee'], statuses: ['pending'] },
  verify: { roles: ['assigner', 'admin'], statuses: ['waiting_acceptance'] },
  continue: { roles: ['assignee'], statuses: ['rejected'] },
  submitProgress: { roles: ['assignee'], statuses: ['accepted', 'in_progress'] },
  remind: { roles: ['admin'], statuses: ['*'] },
}

// ============================================
// 状态转换限制
// ============================================
export const STATUS_TRANSITIONS = {
  draft: ['pending', 'cancelled'],
  pending: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['waiting_acceptance', 'cancelled', 'abandoned'],
  waiting_acceptance: ['completed', 'rejected'],
  rejected: ['in_progress', 'failed'],
  failed: ['pending'],
  abandoned: ['pending'],
  cancelled: [],
  completed: [],
}

// ============================================
// 任务状态配置（与V1.1完全一致）
// ============================================
export const TASK_STATUS_CONFIG = {
  draft: { label: '草稿', color: 'text-gray-600', bg: 'bg-gray-100' },
  pending: { label: '待接受', color: 'text-gray-600', bg: 'bg-gray-100' },
  accepted: { label: '已接受', color: 'text-blue-600', bg: 'bg-blue-100' },
  in_progress: { label: '处理中', color: 'text-blue-600', bg: 'bg-blue-100' },
  waiting_acceptance: { label: '待验收', color: 'text-orange-600', bg: 'bg-orange-100' },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { label: '返工中', color: 'text-red-600', bg: 'bg-red-100' },
  failed: { label: '任务失败', color: 'text-purple-600', bg: 'bg-purple-100' },
  cancelled: { label: '已取消', color: 'text-gray-500', bg: 'bg-gray-50' },
  abandoned: { label: '已放弃', color: 'text-red-400', bg: 'bg-red-50' },
}

// ============================================
// 任务操作行为配置
// ============================================
export const TASK_ACTION_CONFIG = {
  create: { label: '创建任务', color: 'text-blue-600', bg: 'bg-blue-50' },
  publish: { label: '派发任务', color: 'text-blue-600', bg: 'bg-blue-50' },
  withdraw: { label: '撤回任务', color: 'text-gray-600', bg: 'bg-gray-50' },
  cancel: { label: '取消任务', color: 'text-gray-600', bg: 'bg-gray-50' },
  accept: { label: '接受任务', color: 'text-green-600', bg: 'bg-green-50' },
  start: { label: '开始执行', color: 'text-green-600', bg: 'bg-green-50' },
  progress: { label: '提交进度', color: 'text-blue-600', bg: 'bg-blue-50' },
  submit: { label: '申请验收', color: 'text-orange-600', bg: 'bg-orange-50' },
  overtime_continue: { label: '超时继续', color: 'text-amber-600', bg: 'bg-amber-50' },
  overtime_abandon: { label: '超时放弃', color: 'text-red-600', bg: 'bg-red-50' },
  complete: { label: '验收通过', color: 'text-green-600', bg: 'bg-green-50' },
  reject: { label: '验收驳回', color: 'text-red-600', bg: 'bg-red-50' },
  continue: { label: '继续执行', color: 'text-blue-600', bg: 'bg-blue-50' },
  reassign: { label: '重新派发', color: 'text-purple-600', bg: 'bg-purple-50' },
  remind: { label: '催办', color: 'text-red-600', bg: 'bg-red-50' },
  extend_deadline: { label: '延期', color: 'text-amber-600', bg: 'bg-amber-50' },
}

// ============================================
// 超时检测函数（与V1.1 detectOvertime 逻辑完全一致）
// ============================================
export function detectOvertime(task) {
  const now = new Date()

  // 1. 接受超时检测（pending状态）
  if (task.status === 'pending') {
    const publishedAt = new Date(task.createdAt)
    const hoursDiff = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)
    if (hoursDiff >= OVERTIME_CONFIG.acceptCriticalHours) {
      return { type: 'accept', severity: 'critical', startedAt: task.createdAt, deadline: '' }
    }
    if (hoursDiff >= OVERTIME_CONFIG.acceptWarningHours) {
      return { type: 'accept', severity: 'warning', startedAt: task.createdAt, deadline: '' }
    }
  }

  // 2. 执行超时检测（in_progress状态）
  if (task.status === 'in_progress' && task.acceptedAt) {
    const deadline = new Date(task.acceptedAt)
    const estimatedHours = (task.estimatedDays || 1) * 24
    deadline.setHours(deadline.getHours() + estimatedHours)
    if (now > deadline) {
      return { type: 'execution', severity: 'critical', startedAt: task.updatedAt, deadline: deadline.toISOString() }
    }
    const warningThreshold = estimatedHours * 0.8
    const elapsedHours = (now.getTime() - new Date(task.acceptedAt).getTime()) / (1000 * 60 * 60)
    if (elapsedHours >= warningThreshold) {
      return { type: 'execution', severity: 'warning', startedAt: task.updatedAt, deadline: deadline.toISOString() }
    }
  }

  // 3. 验收超时检测（waiting_acceptance状态）
  if (task.status === 'waiting_acceptance') {
    const submittedAt = new Date(task.updatedAt)
    const hoursDiff = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60)
    if (hoursDiff >= OVERTIME_CONFIG.acceptanceCriticalHours) {
      return { type: 'acceptance', severity: 'critical', startedAt: task.updatedAt, deadline: '' }
    }
    if (hoursDiff >= OVERTIME_CONFIG.acceptanceWarningHours) {
      return { type: 'acceptance', severity: 'warning', startedAt: task.updatedAt, deadline: '' }
    }
  }

  return undefined
}

// ============================================
// 任务类型标签映射（与V1.1 getTypeLabel 完全一致）
// ============================================
export const TYPE_LABEL_MAP = {
  fertilization: '施肥',
  irrigation: '灌溉',
  pruning: '修剪',
  pesticide: '植保',
  rootIrrigation: '灌根',
  planting: '定植',
  harvest: '采收',
  weeding: '除草',
  other: '其他',
  fertilizing: '施肥',
  pest_control: '病虫害防治',
  harvesting: '采收',
  soil_management: '土壤管理',
  seedling: '育苗',
  transplanting: '移栽',
}

// ============================================
// 农事操作类型（与V1.1 FARM_OPERATION_TYPES 完全一致）
// ============================================
export const FARM_OPERATION_TYPES = [
  { value: 'fertilization', label: '施肥' },
  { value: 'irrigation', label: '灌溉' },
  { value: 'pruning', label: '修剪' },
  { value: 'pesticide', label: '植保' },
  { value: 'planting', label: '定植' },
  { value: 'harvest', label: '采收' },
  { value: 'weeding', label: '除草' },
  { value: 'other', label: '其他' },
]

// ============================================
// Tab配置（与V1.1 TAB_CONFIG 完全一致）
// ============================================
export const TAB_CONFIG = [
  { key: 'task', label: '农事任务' },
  { key: 'tempTask', label: '临时任务' },
  { key: 'inspection', label: '巡查记录' },
  { key: 'problem', label: '问题管理' },
]
