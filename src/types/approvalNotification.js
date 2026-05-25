// ============================================================
// 审批通知类型定义
// 文件路径：src/types/approvalNotification.js
// ============================================================

// ============================================================
// 通知类型枚举
// ============================================================

export const NotificationType = {
  // 审批通知
  PENDING_APPROVAL: 'pending_approval',       // 待审批通知
  APPROVAL_RESULT: 'approval_result',         // 审批结果通知
  APPROVAL_COMMENT: 'approval_comment',       // 审批评论通知
  APPROVAL_DELEGATE: 'approval_delegate',     // 审批委托通知
  APPROVAL_TIMEOUT: 'approval_timeout',       // 审批超时提醒
  APPROVAL_CANCEL: 'approval_cancel',         // 审批撤回通知

  // 系统通知
  SYSTEM_ANNOUNCEMENT: 'system_announcement', // 系统公告
  TASK_REMINDER: 'task_reminder',             // 任务提醒
}

// ============================================================
// 通知级别
// ============================================================

export const NotificationLevel = {
  INFO: 'info',           // 一般信息
  WARNING: 'warning',     // 警告
  URGENT: 'urgent',       // 紧急
  IMPORTANT: 'important',  // 重要
}

// ============================================================
// 委托配置
// ============================================================

/**
 * @typedef {Object} DelegationConfig
 * @property {string} id - 委托ID
 * @property {string} delegatorId - 委托人ID
 * @property {string} delegatorName - 委托人姓名
 * @property {string} delegateeId - 受托人ID
 * @property {string} delegateeName - 受托人姓名
 * @property {string[]} approvalTypes - 委托的审批类型（空数组表示全部）
 * @property {string} startTime - 委托开始时间
 * @property {string} endTime - 委托结束时间
 * @property {string} [reason] - 委托原因
 * @property {boolean} isActive - 是否生效
 * @property {boolean} autoRecall - 委托人返回后是否自动召回
 */

// ============================================================
// 通知工具函数
// ============================================================

export function getNotificationIcon(type) {
  switch (type) {
    case NotificationType.PENDING_APPROVAL:
      return '📋'
    case NotificationType.APPROVAL_RESULT:
      return '✅'
    case NotificationType.APPROVAL_COMMENT:
      return '💬'
    case NotificationType.APPROVAL_DELEGATE:
      return '🔄'
    case NotificationType.APPROVAL_TIMEOUT:
      return '⏰'
    case NotificationType.APPROVAL_CANCEL:
      return '❌'
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return '📢'
    case NotificationType.TASK_REMINDER:
      return '📌'
    default:
      return '🔔'
  }
}

export function getNotificationLevelColor(level) {
  switch (level) {
    case NotificationLevel.INFO:
      return 'text-blue-600 bg-blue-50'
    case NotificationLevel.WARNING:
      return 'text-yellow-600 bg-yellow-50'
    case NotificationLevel.IMPORTANT:
      return 'text-orange-600 bg-orange-50'
    case NotificationLevel.URGENT:
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function formatNotificationTime(createdAt) {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return created.toLocaleDateString('zh-CN')
}
