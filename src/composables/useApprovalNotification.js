/**
 * 审批通知 Composable（V2.0 1:1 翻译自 V1.1 useApprovalNotification.ts）
 * 文件路径：src/composables/useApprovalNotification.js
 *
 * 数据来源：
 * - 通知数据：当前 V1.1 同样使用 mock 数据（实际生产环境需要对接后端 /api/notifications/list）
 * - 委托数据：当前 V1.1 同样使用 mock 数据（实际生产环境需要对接后端 /api/approvals/delegations）
 *
 * P0-006 修复：将 NotificationPanel.vue 中的空 ref([]) mock 替换为该 composable，
 * 提供真实的 mock 数据结构（与 V1.1 1:1 对齐），保证 UI 正常渲染真实数据结构。
 */

import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// ============================================================
// 通知类型枚举（与 V1.1 approvalNotification.ts 1:1 对齐）
// ============================================================

export const NotificationType = {
  PENDING_APPROVAL: 'pending_approval',     // 待审批通知
  APPROVAL_RESULT: 'approval_result',       // 审批结果通知
  APPROVAL_TIMEOUT: 'approval_timeout',     // 审批超时通知
  DELEGATION: 'delegation',                  // 委托通知
  REMINDER: 'reminder',                      // 提醒
  SYSTEM: 'system'                           // 系统通知
}

// ============================================================
// 通知级别枚举（与 V1.1 1:1 对齐）
// ============================================================

export const NotificationLevel = {
  INFO: 'info',
  WARNING: 'warning',
  IMPORTANT: 'important',
  URGENT: 'urgent'
}

// ============================================================
// 通知图标辅助（与 V1.1 getNotificationIcon 1:1 对齐）
// ============================================================

export function getNotificationIcon(type) {
  switch (type) {
    case NotificationType.PENDING_APPROVAL:
      return '📋'
    case NotificationType.APPROVAL_RESULT:
      return '✅'
    case NotificationType.APPROVAL_TIMEOUT:
      return '⏰'
    case NotificationType.DELEGATION:
      return '👤'
    case NotificationType.REMINDER:
      return '🔔'
    case NotificationType.SYSTEM:
      return '📢'
    default:
      return '📌'
  }
}

// 通知级别颜色（与 V1.1 getNotificationLevelColor 1:1 对齐）
export function getNotificationLevelColor(level) {
  switch (level) {
    case NotificationLevel.URGENT:
      return 'text-red-500'
    case NotificationLevel.WARNING:
      return 'text-yellow-500'
    case NotificationLevel.IMPORTANT:
      return 'text-orange-500'
    default:
      return 'text-blue-500'
  }
}

// 通知时间格式化（与 V1.1 formatNotificationTime 1:1 对齐）
export function formatNotificationTime(timeStr) {
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    return date.toLocaleDateString('zh-CN')
  } catch {
    return timeStr
  }
}

// ============================================================
// 初始 Mock 数据（与 V1.1 useApprovalNotification.ts L22-72 1:1 对齐）
// 注：实际生产环境需要从后端 /api/notifications/list 拉取
// ============================================================

const initialMockNotifications = [
  {
    id: 'notif-001',
    type: NotificationType.PENDING_APPROVAL,
    level: NotificationLevel.IMPORTANT,
    title: '您有待审批的单据',
    content: '采购订单 P20260315001 需要您审批',
    approvalId: 'approval-001',
    approvalCode: 'P20260315001',
    approvalType: 'purchase_order',
    senderId: 'system',
    senderName: '系统',
    recipientId: 'current-user',
    recipientName: '当前用户',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif-002',
    type: NotificationType.APPROVAL_RESULT,
    level: NotificationLevel.INFO,
    title: '您的申请已通过',
    content: '领料单 L20260314002 已审批通过',
    approvalId: 'approval-002',
    approvalCode: 'L20260314002',
    approvalType: 'material_requisition',
    senderId: 'approver-001',
    senderName: '张经理',
    recipientId: 'current-user',
    recipientName: '当前用户',
    isRead: true,
    readTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'notif-003',
    type: NotificationType.APPROVAL_TIMEOUT,
    level: NotificationLevel.WARNING,
    title: '审批即将超时',
    content: '生产计划 P20260310001 已等待审批超过48小时',
    approvalId: 'approval-003',
    approvalCode: 'P20260310001',
    approvalType: 'production_plan',
    senderId: 'system',
    senderName: '系统',
    recipientId: 'current-user',
    recipientName: '当前用户',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
]

// ============================================================
// useNotification Composable（1:1 翻译 V1.1 useNotification hook）
// ============================================================

export function useNotification() {
  const notifications = ref([...initialMockNotifications])
  const isLoading = ref(false)
  const error = ref(null)

  // 计算未读数量
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })

  // 标记单条通知为已读
  const markAsRead = (notificationId) => {
    notifications.value = notifications.value.map(n =>
      n.id === notificationId
        ? { ...n, isRead: true, readTime: new Date().toISOString() }
        : n
    )
  }

  // 标记所有通知为已读
  const markAllAsRead = () => {
    notifications.value = notifications.value.map(n => ({
      ...n,
      isRead: true,
      readTime: n.readTime || new Date().toISOString()
    }))
  }

  // 删除通知
  const deleteNotification = (notificationId) => {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }

  // 刷新通知（实际生产环境从 /api/notifications/list 拉取）
  const refresh = async () => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 调用 API 拉取真实通知
      // const data = await enhancedApiClient.get('/notifications/list')
      // notifications.value = data || []
      notifications.value = [...initialMockNotifications]
    } catch (err) {
      error.value = err?.message || '刷新通知失败'
      ElMessage.error('刷新通知失败')
    } finally {
      isLoading.value = false
    }
  }

  // 初始加载
  onMounted(() => {
    refresh()
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    getNotificationIcon,
    getNotificationLevelColor,
    formatNotificationTime
  }
}

// ============================================================
// useDelegation Composable（1:1 翻译 V1.1 useDelegation hook）
// ============================================================

export function useDelegation() {
  const delegations = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 获取生效的委托
  const activeDelegations = computed(() => {
    const now = new Date()
    return delegations.value.filter(d =>
      d.isActive &&
      new Date(d.startTime) <= now &&
      new Date(d.endTime) >= now
    )
  })

  // 创建委托
  const createDelegation = async (config) => {
    isLoading.value = true
    try {
      // TODO: 调用 API 创建委托
      const newDelegation = {
        ...config,
        id: `delegation-${Date.now()}`
      }
      delegations.value = [...delegations.value, newDelegation]
    } catch (err) {
      error.value = err?.message || '创建委托失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 取消委托
  const cancelDelegation = async (delegationId) => {
    isLoading.value = true
    try {
      // TODO: 调用 API 取消委托
      delegations.value = delegations.value.map(d =>
        d.id === delegationId ? { ...d, isActive: false } : d
      )
    } catch (err) {
      error.value = err?.message || '取消委托失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 召回委托
  const recallDelegation = async (delegationId) => {
    isLoading.value = true
    try {
      // TODO: 调用 API 召回委托
      delegations.value = delegations.value.map(d =>
        d.id === delegationId ? { ...d, isActive: false } : d
      )
    } catch (err) {
      error.value = err?.message || '召回委托失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 刷新
  const refresh = async () => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 从 API 拉取真实委托
      // const data = await enhancedApiClient.get('/approvals/delegations')
      // delegations.value = data || []
      delegations.value = []
    } catch (err) {
      error.value = err?.message || '刷新委托失败'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    refresh()
  })

  return {
    delegations,
    activeDelegations,
    isLoading,
    error,
    createDelegation,
    cancelDelegation,
    recallDelegation,
    refresh
  }
}
