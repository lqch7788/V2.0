/**
 * Tasks 子模块常量（P0-MISS-04 修复）
 * V1.1 TasksPage 状态/类型枚举与颜色映射 1:1 迁移
 */

export const TASK_TYPES = [
  { value: 'irrigation', label: '浇水' },
  { value: 'fertilization', label: '施肥' },
  { value: 'pruning', label: '整枝' },
  { value: 'harvest', label: '采收' },
  { value: 'scouting', label: '巡田' },
  { value: 'spraying', label: '打药' },
  { value: 'weeding', label: '除草' },
]

export const TASK_STATUSES = [
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待执行' },
  { value: 'assigned', label: '已派工' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

// P0-MISS-04: 6 状态颜色映射（与任务要求完全一致）
export const TASK_STATUS_CLASS = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}