/**
 * 通知设置 Store
 * 管理通知渠道、规则和个人偏好
 * 对接后端: /api/notifications/*
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// 事件类型选项
// P1-2 修复：补齐 JSDoc 类型（与 src/types/notification.d.ts 1:1 对齐）
/** @type {import('@/types/notification').EventOption[]} */
export const EVENT_OPTIONS = [
  { value: 'approval_pending', label: '审批待办' },
  { value: 'approval_result', label: '审批结果' },
  { value: 'alert', label: '系统预警' },
  { value: 'task_assigned', label: '任务分配' },
  { value: 'daily_summary', label: '每日汇总' },
  { value: 'announcement', label: '系统公告' },
  { value: 'inventory_low', label: '库存不足' },
  { value: 'device_offline', label: '设备离线' }
]

// 发送频率选项
/** @type {import('@/types/notification').FrequencyOption[]} */
export const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: '立即发送' },
  { value: 'hourly', label: '每小时汇总' },
  { value: 'daily', label: '每日汇总' }
]

// 渠道类型选项
/** @type {import('@/types/notification').ChannelTypeOption[]} */
export const CHANNEL_TYPES = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'in-app', label: '站内消息' },
  { value: 'wechat', label: '企业微信' }
]

// ==================== 字段映射 ====================

/** 渠道字段映射 */
const CHANNEL_FIELD_MAP = {
  id: 'id',
  channel_code: 'channelCode',
  channel_name: 'channelName',
  channel_type: 'channelType',
  is_active: 'isActive',
  config: 'config',
}

/** 规则字段映射 */
const RULE_FIELD_MAP = {
  id: 'id',
  rule_code: 'ruleCode',
  rule_name: 'ruleName',
  event_type: 'eventType',
  recipient_type: 'recipientType',
  recipient_ids: 'recipientIds',
  channel_ids: 'channelIds',
  frequency: 'frequency',
  is_active: 'isActive',
}

/**
 * 规范化渠道数据
 */
function normalizeChannel(raw) {
  const result = { ...raw }
  for (const [snake, camel] of Object.entries(CHANNEL_FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  result.id = result.id || String(Date.now())
  result.isActive = result.isActive ?? true
  return result
}

/**
 * 规范化规则数据
 */
function normalizeRule(raw) {
  const result = { ...raw }
  for (const [snake, camel] of Object.entries(RULE_FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  result.id = result.id || String(Date.now())
  result.isActive = result.isActive ?? true
  return result
}

/**
 * 规范化偏好数据
 */
function normalizePreferences(raw) {
  return {
    approvalNotify: raw.approval_notify ?? raw.approvalNotify ?? true,
    alertNotify: raw.alert_notify ?? raw.alertNotify ?? true,
    dailySummary: raw.daily_summary ?? raw.dailySummary ?? false,
    announcementNotify: raw.announcement_notify ?? raw.announcementNotify ?? true,
    dndEnabled: raw.dnd_enabled ?? raw.dndEnabled ?? false,
    dndStartTime: raw.dnd_start_time ?? raw.dndStartTime ?? '22:00',
    dndEndTime: raw.dnd_end_time ?? raw.dndEndTime ?? '08:00',
  }
}

export const useNotificationSettingsStore = defineStore('notificationSettings', () => {
  // 状态
  const channels = ref([])
  const rules = ref([])
  const preferences = ref({
    approvalNotify: true,
    alertNotify: true,
    dailySummary: false,
    announcementNotify: true,
    dndEnabled: false,
    dndStartTime: '22:00',
    dndEndTime: '08:00'
  })
  const loading = ref(false)
  const error = ref(null)

  // 加载所有数据
  const loadAll = async () => {
    loading.value = true
    error.value = null
    try {
      const [channelsRes, rulesRes] = await Promise.all([
        enhancedApiClient.get('/notifications/channels'),
        enhancedApiClient.get('/notifications/rules')
      ])
      channels.value = (Array.isArray(channelsRes) ? channelsRes : channelsRes?.data || []).map(normalizeChannel)
      rules.value = (Array.isArray(rulesRes) ? rulesRes : rulesRes?.data || []).map(normalizeRule)
    } catch (err) {
      error.value = err.message || '加载失败'
      console.warn('[NotificationSettingsStore] API 加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 加载用户偏好
  const loadPreferences = async (userId) => {
    try {
      const response = await enhancedApiClient.get(`/notifications/preferences/${userId}`)
      preferences.value = normalizePreferences(response || {})
    } catch (err) {
      console.warn('[NotificationSettingsStore] 加载偏好失败:', err)
    }
  }

  // 切换渠道启用状态
  const toggleChannelActive = async (channelId) => {
    const channel = channels.value.find(c => c.id === channelId)
    if (channel) {
      const newStatus = !channel.isActive
      channels.value = channels.value.map(c =>
        c.id === channelId ? { ...c, isActive: newStatus } : c
      )
      try {
        await enhancedApiClient.put(`/notifications/channels/${channelId}`, { is_active: newStatus })
      } catch (err) {
        // 回滚
        channels.value = channels.value.map(c =>
          c.id === channelId ? { ...c, isActive: !newStatus } : c
        )
        console.warn('[NotificationSettingsStore] 切换渠道状态失败:', err)
      }
    }
  }

  // 添加渠道
  const addChannel = async (data) => {
    try {
      const response = await enhancedApiClient.post('/notifications/channels', data)
      const newChannel = normalizeChannel(response?.data || response || data)
      channels.value = [newChannel, ...channels.value]
      return newChannel
    } catch (err) {
      console.warn('[NotificationSettingsStore] 添加渠道失败:', err)
      return null
    }
  }

  // 更新渠道
  const updateChannel = async (channelId, data) => {
    const original = channels.value.find(c => c.id === channelId)
    channels.value = channels.value.map(c =>
      c.id === channelId ? { ...c, ...data } : c
    )
    try {
      await enhancedApiClient.put(`/notifications/channels/${channelId}`, data)
    } catch (err) {
      if (original) {
        channels.value = channels.value.map(c =>
          c.id === channelId ? original : c
        )
      }
      console.warn('[NotificationSettingsStore] 更新渠道失败:', err)
    }
  }

  // 删除渠道
  const removeChannel = async (channelId) => {
    const original = [...channels.value]
    channels.value = channels.value.filter(c => c.id !== channelId)
    try {
      await enhancedApiClient.delete(`/notifications/channels/${channelId}`)
      return true
    } catch (err) {
      channels.value = original
      console.warn('[NotificationSettingsStore] 删除渠道失败:', err)
      return false
    }
  }

  // 切换规则启用状态
  const toggleRuleActive = async (ruleId) => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (rule) {
      const newStatus = !rule.isActive
      rules.value = rules.value.map(r =>
        r.id === ruleId ? { ...r, isActive: newStatus } : r
      )
      try {
        await enhancedApiClient.put(`/notifications/rules/${ruleId}`, { is_active: newStatus })
      } catch (err) {
        rules.value = rules.value.map(r =>
          r.id === ruleId ? { ...r, isActive: !newStatus } : r
        )
        console.warn('[NotificationSettingsStore] 切换规则状态失败:', err)
      }
    }
  }

  // 添加规则
  const addRule = async (data) => {
    try {
      const response = await enhancedApiClient.post('/notifications/rules', data)
      const newRule = normalizeRule(response?.data || response || data)
      rules.value = [newRule, ...rules.value]
      return newRule
    } catch (err) {
      console.warn('[NotificationSettingsStore] 添加规则失败:', err)
      return null
    }
  }

  // 更新规则
  const updateRule = async (ruleId, data) => {
    const original = rules.value.find(r => r.id === ruleId)
    rules.value = rules.value.map(r =>
      r.id === ruleId ? { ...r, ...data } : r
    )
    try {
      await enhancedApiClient.put(`/notifications/rules/${ruleId}`, data)
    } catch (err) {
      if (original) {
        rules.value = rules.value.map(r =>
          r.id === ruleId ? original : r
        )
      }
      console.warn('[NotificationSettingsStore] 更新规则失败:', err)
    }
  }

  // 删除规则
  const removeRule = async (ruleId) => {
    const original = [...rules.value]
    rules.value = rules.value.filter(r => r.id !== ruleId)
    try {
      await enhancedApiClient.delete(`/notifications/rules/${ruleId}`)
      return true
    } catch (err) {
      rules.value = original
      console.warn('[NotificationSettingsStore] 删除规则失败:', err)
      return false
    }
  }

  // 保存用户偏好
  const saveUserPreferences = async (userId, prefs) => {
    const original = { ...preferences.value }
    preferences.value = { ...prefs }
    try {
      await enhancedApiClient.post(`/notifications/preferences/${userId}`, prefs)
    } catch (err) {
      preferences.value = original
      console.warn('[NotificationSettingsStore] 保存偏好失败:', err)
    }
  }

  return {
    channels,
    rules,
    preferences,
    loading,
    error,
    loadAll,
    loadPreferences,
    toggleChannelActive,
    addChannel,
    updateChannel,
    removeChannel,
    toggleRuleActive,
    addRule,
    updateRule,
    removeRule,
    saveUserPreferences
  }
})
