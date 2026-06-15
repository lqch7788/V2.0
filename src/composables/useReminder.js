/**
 * 催办 Composable - 1:1 对齐 V1.1 useReminderStore.ts
 *
 * V1.1 关键特性：
 * - 数据源：enhancedApiClient → /api/reminders
 * - 持久化：localStorage（V1.1 兼容行为），同时调后端 API
 * - 数据流：组件 → composable → API → DB
 *
 * V2.0 适配：
 * - 使用 @/services/apiClient（底层封装 enhancedApiClient）调后端
 * - 保留 localStorage 离线缓存（与 V1.1 行为一致）
 * - 暴露与 V1.1 一致的 records / loadRecords / sendReminder / updateRecord / deleteRecord
 */

import { ref, computed, readonly } from 'vue'
import { apiClient } from '@/services/apiClient'

// localStorage 持久化 key
const STORAGE_KEY = 'farm-reminders'

// ========== 持久化工具 ==========

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('[useReminder] 读取 localStorage 失败:', e)
    return []
  }
}

function saveToStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (e) {
    console.warn('[useReminder] 写入 localStorage 失败:', e)
  }
}

// ========== Composable 主体 ==========

/**
 * 催办 composable
 * 1:1 对齐 V1.1 useReminderStore（Zustand → Vue 组合式 API）
 *
 * @returns {{
 *   records: import('vue').Ref,
 *   isLoading: import('vue').Ref,
 *   error: import('vue').Ref,
 *   reminderCount: import('vue').ComputedRef,
 *   todayCount: import('vue').ComputedRef,
 *   loadRecords: Function,
 *   sendReminder: Function,
 *   updateRecord: Function,
 *   deleteRecord: Function,
 *   clearAll: Function,
 * }}
 */
export function useReminder() {
  // 数据
  const records = ref(loadFromStorage())
  const isLoading = ref(false)
  const error = ref(null)

  // ========== 计算属性 ==========

  /** 总催办记录数 */
  const reminderCount = computed(() => records.value.length)

  /** 今日催办记录数（对齐 V1.1 useReminder 的 todayCount 语义） */
  const todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return records.value.filter((r) => {
      const d = r.createTime || r.createdAt
      return d && d.startsWith(today)
    }).length
  })

  // ========== 内部方法 ==========

  const persist = () => {
    saveToStorage(records.value)
  }

  // ========== 数据获取（对齐 V1.1 loadRecords） ==========

  /**
   * 加载催办记录
   * V1.1 行为：API 优先，失败降级到 localStorage
   * @param {{ status?: string, taskId?: string }} [filters]
   */
  const loadRecords = async (filters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.taskId) params.taskId = filters.taskId
      const data = await apiClient.get('/reminders', params)
      const list = Array.isArray(data) ? data : (data?.data || [])
      if (list.length > 0 || filters.status || filters.taskId) {
        // 有筛选条件或服务端有数据，使用服务端数据
        records.value = list
      } else {
        // 无筛选且服务端空，保留本地
      }
      persist()
    } catch (e) {
      console.warn('[useReminder] loadRecords API 失败，使用本地缓存:', e)
      error.value = e?.message || '加载催办记录失败'
      // 失败降级：使用 localStorage 已有数据
    } finally {
      isLoading.value = false
    }
  }

  // ========== 发送催办（对齐 V1.1 sendReminder） ==========

  /**
   * 发送催办
   * V1.1 行为：调 API，API 成功则插入到 records 头部
   * @param {object} payload
   * @returns {Promise<object|null>}
   */
  const sendReminder = async (payload) => {
    try {
      const result = await apiClient.post('/reminders', payload)
      if (result) {
        const newRecord = {
          id: result.id || `REM-${Date.now()}`,
          ...result,
          createTime: result.createTime || new Date().toISOString(),
        }
        records.value = [newRecord, ...records.value]
        persist()
      }
      return result || null
    } catch (e) {
      console.warn('[useReminder] sendReminder API 失败，写入本地缓存:', e)
      // 降级：仅写入 localStorage
      const newRecord = {
        id: `LOCAL-${Date.now()}`,
        ...payload,
        status: payload.status || 'pending',
        createTime: new Date().toISOString(),
      }
      records.value = [newRecord, ...records.value]
      persist()
      return newRecord
    }
  }

  // ========== 更新记录（对齐 V1.1 updateRecord） ==========

  /**
   * 更新催办记录
   * V1.1 行为：先调 API，API 成功则更新本地
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<object|null>}
   */
  const updateRecord = async (id, updates) => {
    try {
      const result = await apiClient.put(`/reminders/${id}`, updates)
      if (result) {
        records.value = records.value.map((r) =>
          r.id === id ? { ...r, ...result } : r,
        )
        persist()
      }
      return result || null
    } catch (e) {
      console.warn('[useReminder] updateRecord API 失败，仅更新本地:', e)
      // 降级：仅更新本地
      records.value = records.value.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      )
      persist()
      return null
    }
  }

  // ========== 删除记录（对齐 V1.1 deleteRecord） ==========

  /**
   * 删除催办记录
   * V1.1 行为：先调 API，成功则从 records 移除
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  const deleteRecord = async (id) => {
    try {
      await apiClient.delete(`/reminders/${id}`)
      records.value = records.value.filter((r) => r.id !== id)
      persist()
      return true
    } catch (e) {
      console.warn('[useReminder] deleteRecord API 失败，仅删除本地:', e)
      // 降级：仅删除本地
      records.value = records.value.filter((r) => r.id !== id)
      persist()
      return false
    }
  }

  /** 清空所有记录（本地 + 服务端） */
  const clearAll = async () => {
    const ids = [...records.value.map((r) => r.id)]
    for (const id of ids) {
      await deleteRecord(id)
    }
  }

  return {
    // 状态
    records: readonly(records),
    isLoading: readonly(isLoading),
    error: readonly(error),
    // 计算属性
    reminderCount,
    todayCount,
    // 方法
    loadRecords,
    sendReminder,
    updateRecord,
    deleteRecord,
    clearAll,
  }
}

// 默认导出
export default useReminder
