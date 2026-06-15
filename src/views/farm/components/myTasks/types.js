/**
 * 我的任务页面类型定义
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/types.ts
 */

// 任务扩展类型 - 统一任务管理中的任务可能包含 TaskDispatchTask 中没有的额外字段
// @typedef {Object} TaskWithExtras - V1.1 接口转换（JSDoc 注释）
export const TaskWithExtras = {} // 占位导出，方便 IDE 跳转

// 任务物资类型
// @typedef {Object} TaskMaterial
export const TaskMaterial = {}

// 反馈表单数据类型
// @typedef {Object} FeedbackFormData
export const FeedbackFormData = {}

// 弹窗状态类型
// @typedef {Object} ModalState
export const ModalState = {}

// 任务筛选类型
export const TASK_FILTER_TYPES = ['all', 'problem', 'production', 'temp', 'worklog']

/**
 * 筛选类型字符串常量（与 V1.1 TaskFilterType 等价）
 */
export const TaskFilterType = {
  ALL: 'all',
  PROBLEM: 'problem',
  PRODUCTION: 'production',
  TEMP: 'temp',
  WORKLOG: 'worklog',
}

// 任务类型配置项
// @typedef {Object} TaskTypeConfig
export const TaskTypeConfig = {}

// 状态配置项
// @typedef {Object} StatusConfig
export const StatusConfig = {}

// 优先级配置项
// @typedef {Object} PriorityConfig
export const PriorityConfig = {}

/**
 * 创建空的反馈表单初始值（与 V1.1 FeedbackFormData 默认值一致）
 */
export function createEmptyFeedbackForm() {
  return {
    resultStatus: '',
    resultText: '',
    progressText: '',
    progress: 0,
    workloadDays: '',
    workloadHours: '',
    workloadConfirm: null,
    photosBefore: [],
    photosAfter: [],
    gpsLocation: null,
    materialCode: '',
    voiceNote: '',
    cannotContinue: false,
    cannotContinueReason: '',
  }
}

/**
 * 创建空的弹窗状态
 */
export function createEmptyModalState() {
  return { isOpen: false, task: null }
}