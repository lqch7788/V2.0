/**
 * 工作日志 Pinia Store
 * V1.1 1:1 对齐：useWorkLogStore（Zustand + API 模式）
 * V2.0 升级：API 优先 + localStorage 降级
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { workLogApi } from '@/api/workLog.js'

const STORAGE_KEY = 'worklog-storage'

/** 读取localStorage中的种子/持久化数据 */
function loadInitialData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.workLogs?.length) return parsed.state.workLogs
    }
  } catch { /* ignore */ }
  return []
}

/** 保存到localStorage */
function persist(workLogs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { workLogs } }))
  } catch { /* ignore quota errors */ }
}

export const useWorkLogStore = defineStore('workLog', () => {
  const workLogs = ref(loadInitialData())
  const isLoading = ref(false)
  const error = ref(null)
  const filters = ref({ date: '', worker: '', greenhouse: '' })
  const pagination = ref({ currentPage: 1, pageSize: 10, total: 0, totalPages: 0 })

  /** 同步持久化 */
  function sync() {
    persist(workLogs.value)
  }

  /** 生成新日志编号 WL+年月日+3位流水号 */
  function generateCode() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const prefix = `WL${today}`
    const todayLogs = workLogs.value.filter(l => l.code?.startsWith(prefix))
    let maxSeq = 0
    todayLogs.forEach(l => {
      const seq = parseInt((l.code || '').replace(prefix, ''), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    })
    return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`
  }

  /** V1.1 fetchWorkLogs 1:1 对齐 */
  async function fetchWorkLogs(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await workLogApi.list(params)
      const data = response.data?.data || response.data || []
      workLogs.value = Array.isArray(data) ? data : []
      const total = response.data?.total || workLogs.value.length
      pagination.value = {
        currentPage: params.page || 1,
        pageSize: params.limit || 10,
        total,
        totalPages: Math.ceil(total / (params.limit || 10)),
      }
      sync()
      return workLogs.value
    } catch (err) {
      error.value = err?.message || '加载失败'
      console.warn('[WorkLog] fetchWorkLogs failed:', err)
      return workLogs.value
    } finally {
      isLoading.value = false
    }
  }

  /** V1.1 addWorkLog 1:1 对齐 */
  async function addWorkLog(data) {
    isLoading.value = true
    error.value = null
    try {
      const payload = {
        ...data,
        code: data.code || generateCode(),
        date: data.date || new Date().toISOString().split('T')[0],
        submitTime: data.submitTime || new Date().toISOString(),
      }
      const response = await workLogApi.create(payload)
      const newLog = response.data?.data || response.data || { ...payload, id: Date.now() }
      workLogs.value = [newLog, ...workLogs.value]
      sync()
      return newLog
    } catch (err) {
      error.value = err?.message || '新增失败'
      // 降级：直接本地保存
      const newLog = {
        id: Math.max(0, ...workLogs.value.map(l => l.id)) + 1,
        ...data,
        code: data.code || generateCode(),
      }
      workLogs.value = [newLog, ...workLogs.value]
      sync()
      return newLog
    } finally {
      isLoading.value = false
    }
  }

  /** V1.1 updateWorkLog 1:1 对齐 */
  async function updateWorkLog(id, updates) {
    isLoading.value = true
    error.value = null
    try {
      const response = await workLogApi.update(id, updates)
      const updated = response.data?.data || response.data
      workLogs.value = workLogs.value.map(log =>
        log.id === id ? { ...log, ...(updated || updates) } : log
      )
      sync()
    } catch (err) {
      error.value = err?.message || '更新失败'
      workLogs.value = workLogs.value.map(log =>
        log.id === id ? { ...log, ...updates } : log
      )
      sync()
    } finally {
      isLoading.value = false
    }
  }

  /** V1.1 deleteWorkLog 1:1 对齐 */
  async function deleteWorkLog(id) {
    isLoading.value = true
    error.value = null
    try {
      await workLogApi.delete(id)
      workLogs.value = workLogs.value.filter(log => log.id !== id)
      sync()
    } catch (err) {
      error.value = err?.message || '删除失败'
      workLogs.value = workLogs.value.filter(log => log.id !== id)
      sync()
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    workLogs,
    isLoading,
    error,
    filters,
    pagination,
    fetchWorkLogs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    setFilters,
    generateCode,
  }
})
