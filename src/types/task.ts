/**
 * 农事任务类型定义
 * 供 apiFarmTaskService.ts 使用
 */

export type TaskStatus =
  | 'draft'
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'waiting_acceptance'
  | 'completed'
  | 'rejected'
  | 'failed'
  | 'cancelled'
  | 'abandoned'

export type TaskPriority = 'urgent' | 'high' | 'normal'

export type TaskSourceType = 'dispatch' | 'tempTask' | 'smart'

export interface Task {
  id: string
  taskCode: string
  title: string
  type: string
  typeName: string
  status: TaskStatus
  priority: TaskPriority
  progress: number
  sourceType: TaskSourceType
  dispatchMode?: 'farm' | 'tempTask' | 'smart'
  assigneeId: string
  assigneeName: string
  assignerId: string
  assignerName: string
  dueDate?: string
  startTime?: string
  endTime?: string
  acceptedAt?: string
  completedAt?: string
  greenhouseId?: string
  greenhouseName?: string
  cropName?: string
  field?: string
  planStart?: string
  planEnd?: string
  estimatedDays?: number
  estimatedHours?: number
  materials?: string[]
  tools?: string[]
  sopContent?: string
  typeConfig?: Record<string, unknown>
  sourceProblemId?: string
  sourceInspectionId?: string
  feedbackRequirements?: FeedbackRequirement[]
  reworkCount: number
  reworkHistory: ReworkRecord[]
  deadlineExtensions: DeadlineExtension[]
  version: number
  createdAt: string
  updatedAt: string
  remarks?: string
  description?: string
  batchId?: string
  batchCode?: string
}

export interface FeedbackRequirement {
  type: 'gps' | 'image_before' | 'image_after' | 'text' | 'materials'
  label: string
  required: boolean
}

export interface ReworkRecord {
  reworkCount: number
  reworkReason: string
  reworkBy: string
  reworkAt: string
  taskStatusBeforeRework: TaskStatus
}

export interface DeadlineExtension {
  id: string
  originalDeadline: string
  newDeadline: string
  reason: string
  extendedBy: string
  extendedAt: string
}

export interface TaskFilters {
  status?: TaskStatus[]
  sourceType?: TaskSourceType
  assigneeId?: string
  assignerId?: string
  greenhouseId?: string
  batchId?: string
  priority?: TaskPriority
  keyword?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  waitingAcceptance: number
  overdue: number
}
