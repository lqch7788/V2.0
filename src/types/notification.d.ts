/**
 * 通知设置 - 类型定义
 * P1-2 修复：补齐 TypeScript 类型声明，与 V1.1 NotificationSettings.tsx 类型保持一致
 */

/** 事件类型枚举值 */
export type NotificationEventType =
  | 'approval_pending'
  | 'approval_result'
  | 'alert'
  | 'task_assigned'
  | 'daily_summary'
  | 'announcement'
  | 'inventory_low'
  | 'device_offline'

/** 发送频率枚举值 */
export type NotificationFrequency = 'immediate' | 'hourly' | 'daily'

/** 渠道类型枚举值 */
export type NotificationChannelType = 'email' | 'sms' | 'in-app' | 'wechat'

/** 通用选项结构 */
export interface NotificationOption<T extends string> {
  value: T
  label: string
}

/** 事件类型选项（强类型） */
export type EventOption = NotificationOption<NotificationEventType>

/** 发送频率选项（强类型） */
export type FrequencyOption = NotificationOption<NotificationFrequency>

/** 渠道类型选项（强类型） */
export type ChannelTypeOption = NotificationOption<NotificationChannelType>

/** 通知渠道 */
export interface NotificationChannel {
  id: string
  channelCode?: string
  channelName: string
  channelType: NotificationChannelType
  isActive: boolean
  config?: Record<string, string | number | boolean>
}

/** 通知规则 */
export interface NotificationRule {
  id: string
  ruleCode?: string
  ruleName: string
  eventType: NotificationEventType
  recipientType?: string
  recipientIds?: string[]
  channelIds?: string[]
  frequency: NotificationFrequency
  isActive: boolean
}

/** 通知偏好 */
export interface NotificationPreferences {
  approvalNotify: boolean
  alertNotify: boolean
  dailySummary: boolean
  announcementNotify: boolean
  dndEnabled: boolean
  dndStartTime?: string
  dndEndTime?: string
}
