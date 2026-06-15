/**
 * 农事任务 Store - Pinia 状态管理
 * 1:1 对齐 V1.1 farmTaskStore.ts
 *
 * V1.1 关键特性：
 * - 6 状态机：draft / pending / accepted / in_progress / waiting_acceptance / completed / rejected / failed / cancelled / abandoned
 * - 数据获取：API 优先，失败降级到本地存储
 * - 乐观更新：本地先更新，再调 API
 * - 版本号：每次更新 version+1
 * - 持久化：localStorage('farm-tasks')，作为离线缓存
 * - API 客户端：V1.1 用 enhancedApiClient，V2.0 用 @/services/apiFarmTaskService
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getTasks,
  getTaskById,
  getTaskByCode,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  getTaskRecords,
  getOverdueTasks as apiGetOverdueTasks,
  getTaskStats,
} from '@/services/apiFarmTaskService'

// ========== 常量：6 状态机 + 终态扩展 ==========
export const TASK_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  WAITING_ACCEPTANCE: 'waiting_acceptance',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  ABANDONED: 'abandoned',
}

// 终态：进入后不再允许流转
const TERMINAL_STATUSES = ['completed', 'cancelled', 'abandoned', 'failed']

// localStorage 持久化 key（与 V1.1 一致）
const STORAGE_KEY = 'farm-tasks'

// ========== 持久化工具 ==========

/** 从 localStorage 读取任务列表 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('[farmTaskStore] 读取 localStorage 失败:', e)
    return []
  }
}

/** 写入 localStorage */
function saveToStorage(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.warn('[farmTaskStore] 写入 localStorage 失败:', e)
  }
}

// ========== Store 定义 ==========

export const useFarmTaskStore = defineStore('farmTask', () => {
  // ========== 数据状态 ==========
  const tasks = ref(loadFromStorage())
  const currentTask = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 离线状态
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const pendingSyncCount = ref(0)

  // 筛选状态
  const filters = ref({})

  // ========== 计算属性（对齐 V1.1） ==========

  /** 按状态分组的统计（对齐 V1.1 statusStats 语义） */
  const statusStats = computed(() => {
    const stats = {
      total: tasks.value.length,
      draft: 0,
      pending: 0,
      accepted: 0,
      inProgress: 0,
      waitingAcceptance: 0,
      completed: 0,
      rejected: 0,
      failed: 0,
      cancelled: 0,
      abandoned: 0,
      overdue: 0,
    }
    const now = new Date().toISOString().split('T')[0]
    tasks.value.forEach((t) => {
      switch (t.status) {
        case 'draft':
          stats.draft++
          break
        case 'pending':
          stats.pending++
          break
        case 'accepted':
          stats.accepted++
          break
        case 'in_progress':
          stats.inProgress++
          if (t.dueDate && t.dueDate < now) stats.overdue++
          break
        case 'waiting_acceptance':
          stats.waitingAcceptance++
          break
        case 'completed':
          stats.completed++
          break
        case 'rejected':
          stats.rejected++
          break
        case 'failed':
          stats.failed++
          break
        case 'cancelled':
          stats.cancelled++
          break
        case 'abandoned':
          stats.abandoned++
          break
      }
    })
    return stats
  })

  /** V1.1 taskCountByStatus getter：返回按 status 分组的任务数量 */
  const taskCountByStatus = computed(() => {
    const counts = {}
    tasks.value.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return counts
  })

  /** V1.1 overdueTasks getter：超时未完成的任务 */
  const overdueTasks = computed(() => {
    const now = new Date().toISOString().split('T')[0]
    return tasks.value.filter(
      (t) =>
        t.dueDate &&
        t.dueDate < now &&
        !TERMINAL_STATUSES.includes(t.status),
    )
  })

  /** V1.1 todayTasks getter：今日截止的任务 */
  const todayTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.value.filter((t) => t.dueDate === today)
  })

  // ========== 内部方法 ==========

  /** 持久化到 localStorage */
  const persist = () => {
    saveToStorage(tasks.value)
  }

  /** 根据状态找出本地的任务 */
  const findIndexById = (id) => tasks.value.findIndex((t) => t.id === id)

  /** 合并 API 返回数据到本地任务（保留本地字段，仅用 API 数据补充） */
  const mergeTask = (apiTask) => {
    if (!apiTask) return null
    const realId = apiTask.id || apiTask.taskCode
    const idx = findIndexById(realId)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...apiTask, id: realId }
    } else {
      tasks.value.unshift({ ...apiTask, id: realId })
    }
    persist()
    return tasks.value.find((t) => t.id === realId) || apiTask
  }

  // ========== 数据获取（对齐 V1.1 fetchTasks） ==========

  /**
   * 获取任务列表
   * V1.1 行为：API 优先 → 失败降级到 localStorage
   * 1:1 对齐：enhancedApiClient.get('/farm-tasks') → 本地
   */
  const fetchTasks = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      // 调用 V2.0 API 服务（底层用 enhancedApiClient）
      const apiData = await getTasks(params)
      // 兼容多种返回：数组 / {data: []} / null
      let list = []
      if (Array.isArray(apiData)) {
        list = apiData
      } else if (apiData && Array.isArray(apiData.data)) {
        list = apiData.data
      } else if (apiData && Array.isArray(apiData.tasks)) {
        list = apiData.tasks
      }

      if (list.length > 0) {
        tasks.value = list
        persist()
      } else if (tasks.value.length === 0) {
        // 首次使用且 API 无数据，保留空数组
        tasks.value = []
      }
    } catch (e) {
      console.warn('[farmTaskStore] fetchTasks API 失败，使用本地缓存:', e)
      error.value = e?.message || '获取任务失败'
      // 失败降级：localStorage 已有数据就用本地
    } finally {
      isLoading.value = false
    }
    return tasks.value
  }

  /** 按日期获取任务（对齐 V1.1 fetchTasksByDate） */
  const fetchTasksByDate = async (date) => {
    return tasks.value.filter((task) => task.dueDate === date)
  }

  /** 获取任务详情 */
  const fetchTaskDetail = async (id) => {
    try {
      const data = await getTaskById(id)
      if (data) {
        currentTask.value = data
        mergeTask(data)
      }
      return data
    } catch (e) {
      console.warn('[farmTaskStore] fetchTaskDetail 失败:', e)
      // 降级到本地
      const local = tasks.value.find((t) => t.id === id)
      if (local) currentTask.value = local
      return local || null
    }
  }

  /** 获取任务操作记录 */
  const fetchTaskRecords = async (taskId) => {
    try {
      return await getTaskRecords(taskId)
    } catch (e) {
      console.warn('[farmTaskStore] fetchTaskRecords 失败:', e)
      return []
    }
  }

  // ========== 增删改（对齐 V1.1 addTask / updateTask / deleteTask） ==========

  /**
   * 创建任务
   * V1.1 行为：先乐观插入本地（tempId），再调 API，API 成功合并数据
   */
  const createTask = async (task) => {
    const tempId = `TEMP-${Date.now()}`
    // 保留用户传入的 taskCode（前端 form 已生成 NS+日期+序号）
    const taskCode =
      task.taskCode ||
      task.id ||
      `NS${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
        Math.floor(Math.random() * 1000),
      ).padStart(3, '0')}`
    const now = new Date().toISOString()

    const newTask = {
      ...task,
      id: tempId,
      taskCode,
      version: 1,
      createdAt: now,
      updatedAt: now,
      status: task.status || 'draft',
      progress: task.progress ?? 0,
      reworkCount: task.reworkCount ?? 0,
      reworkHistory: task.reworkHistory || [],
      deadlineExtensions: task.deadlineExtensions || [],
    }

    // 乐观插入本地
    tasks.value = [newTask, ...tasks.value]
    persist()

    try {
      const savedTask = await apiCreateTask({ ...task, taskCode })
      if (savedTask) {
        const realId = savedTask.id || savedTask.taskCode || tempId
        tasks.value = tasks.value.map((t) =>
          t.id === tempId
            ? {
                ...t,
                ...savedTask,
                id: realId,
                taskCode: savedTask.taskCode || t.taskCode || taskCode,
              }
            : t,
        )
        persist()
        return savedTask
      }
      return newTask
    } catch (e) {
      console.warn('[farmTaskStore] createTask API 失败:', e)
      pendingSyncCount.value++
      return newTask
    }
  }

  /**
   * 更新任务
   * V1.1 行为：先乐观更新本地（version+1），再调 API
   */
  const updateTask = async (id, updates) => {
    // 乐观更新本地
    tasks.value = tasks.value.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: (t.version || 0) + 1,
          }
        : t,
    )
    persist()

    try {
      const result = await apiUpdateTask(id, updates)
      if (result) {
        // API 成功：用返回数据进一步合并
        mergeTask({ ...result, id: result.id || id })
      }
    } catch (e) {
      console.warn('[farmTaskStore] updateTask API 失败:', e)
      pendingSyncCount.value++
    }
  }

  /**
   * 删除任务
   * V1.1 行为：先乐观删除本地，再调 API
   */
  const deleteTask = async (id) => {
    // 乐观删除本地
    tasks.value = tasks.value.filter((t) => t.id !== id)
    persist()

    try {
      await apiDeleteTask(id)
    } catch (e) {
      console.warn('[farmTaskStore] deleteTask API 失败:', e)
      pendingSyncCount.value++
    }
  }

  /** 简写：删除任务（与 V2.0 现有 import 兼容） */
  const removeTask = deleteTask

  /** 状态更新快捷方法（对齐 V1.1 updateTaskStatus） */
  const updateTaskStatus = async (id, status) => {
    await updateTask(id, { status })
  }

  // ========== 6 状态机流转（V1.1 完整实现） ==========

  /**
   * 接受任务：pending → accepted
   * V1.1 acceptTask
   */
  const acceptTask = async (id) => {
    await updateTask(id, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
    })
  }

  /**
   * 拒绝任务：pending → rejected
   * V1.1 rejectTask
   */
  const rejectTask = async (id, reason) => {
    await updateTask(id, {
      status: 'rejected',
      rejectReason: reason,
    })
  }

  /**
   * 开始执行：accepted → in_progress
   * V1.1 startTask
   */
  const startTask = async (id) => {
    await updateTask(id, {
      status: 'in_progress',
      startTime: new Date().toISOString(),
    })
  }

  /**
   * 提交完成：in_progress → waiting_acceptance
   * V1.1 submitCompletion
   */
  const submitCompletion = async (id, data = {}) => {
    await updateTask(id, {
      status: 'waiting_acceptance',
      progress: data.progress ?? 100,
      feedback: data.feedback,
      submittedAt: new Date().toISOString(),
      ...data,
    })
  }

  /**
   * 验收通过：waiting_acceptance → completed
   * V1.1 acceptCompletion
   */
  const acceptCompletion = async (id, comments) => {
    await updateTask(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      acceptanceComments: comments,
    })
  }

  /**
   * 验收驳回：waiting_acceptance → in_progress（返工）
   * V1.1 rejectCompletion
   */
  const rejectCompletion = async (id, reason) => {
    const task = tasks.value.find((t) => t.id === id)
    const reworkCount = (task?.reworkCount || 0) + 1
    const reworkHistory = [
      ...(task?.reworkHistory || []),
      {
        reworkCount,
        reworkReason: reason,
        reworkBy: '',
        reworkAt: new Date().toISOString(),
        taskStatusBeforeRework: 'waiting_acceptance',
      },
    ]
    await updateTask(id, {
      status: 'in_progress',
      rejectReason: reason,
      reworkCount,
      reworkHistory,
    })
  }

  /**
   * 派发任务：draft → pending
   * V1.1 dispatchTask
   */
  const dispatchTask = async (id, payload = {}) => {
    await updateTask(id, {
      status: 'pending',
      assigneeId: payload.assigneeId,
      assigneeName: payload.assigneeName,
      assignerId: payload.assignerId,
      assignerName: payload.assignerName,
      dispatchedAt: new Date().toISOString(),
    })
  }

  /**
   * 催办任务：保持原状态，记录催办标记
   * V1.1 remindTask
   */
  const remindTask = async (id) => {
    try {
      await updateTask(id, {
        lastRemindedAt: new Date().toISOString(),
        remindCount: (tasks.value.find((t) => t.id === id)?.remindCount || 0) + 1,
      })
      return true
    } catch (e) {
      console.warn('[farmTaskStore] remindTask 失败:', e)
      return false
    }
  }

  /**
   * 重新派发：任意状态 → pending
   * V1.1 reassignTask
   */
  const reassignTask = async (id, assigneeId, assigneeName) => {
    await updateTask(id, {
      status: 'pending',
      assigneeId,
      assigneeName,
      reassignedAt: new Date().toISOString(),
    })
  }

  // ========== 状态机辅助（V1.1 dispatch / accept / 等方法名兼容） ==========

  const publish = async (id) => {
    await updateTask(id, { status: 'pending' })
  }

  const withdraw = async (id) => {
    await updateTask(id, { status: 'draft' })
  }

  const accept = acceptTask
  const start = startTask

  const submitProgressData = async (id, progress, feedback) => {
    await updateTask(id, { progress, feedback })
  }

  const submitAcceptance = async (id) => {
    await updateTask(id, { status: 'waiting_acceptance' })
  }

  const complete = async (id, comments) => {
    await acceptCompletion(id, comments)
  }

  const reject = async (id, reason) => {
    await rejectTask(id, reason)
  }

  const cancel = async (id, reason) => {
    await updateTask(id, { status: 'cancelled', cancelReason: reason })
  }

  const abandon = async (id, reason) => {
    await updateTask(id, { status: 'abandoned', abandonReason: reason })
  }

  const handleOvertimeContinue = async (id) => {
    await updateTask(id, { status: 'in_progress' })
  }

  const handleOvertimeAbandon = async (id, reason) => {
    await updateTask(id, { status: 'abandoned', overtimeAbandonReason: reason })
  }

  const reassign = async (id, assigneeId) => {
    await reassignTask(id, assigneeId)
  }

  const extend = async (id, newDeadline, reason) => {
    const task = tasks.value.find((t) => t.id === id)
    const extensions = [
      ...(task?.deadlineExtensions || []),
      {
        id: `ext-${Date.now()}`,
        originalDeadline: task?.dueDate,
        newDeadline,
        reason,
        extendedBy: '',
        extendedAt: new Date().toISOString(),
      },
    ]
    await updateTask(id, { dueDate: newDeadline, deadlineExtensions: extensions })
  }

  const remind = remindTask

  // ========== 批量操作（V1.1 batchDelete 等价） ==========

  const batchDelete = async (ids) => {
    tasks.value = tasks.value.filter((t) => !ids.includes(t.id))
    persist()
  }

  // ========== 筛选 ==========

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {}
  }

  // ========== 同步 ==========

  const syncPendingChanges = async () => {
    if (pendingSyncCount.value === 0) return
    // 重新拉取，覆盖本地
    await fetchTasks()
    pendingSyncCount.value = 0
  }

  // ========== 辅助查询函数（V1.1 末尾 export 函数） ==========

  const getTasksByStatus = (status) =>
    tasks.value.filter((task) => task.status === status)

  const getTasksByAssignee = (assigneeId) =>
    tasks.value.filter((task) => task.assigneeId === assigneeId)

  const getTasksByDateRange = (startDate, endDate) =>
    tasks.value.filter(
      (task) => task.dueDate && task.dueDate >= startDate && task.dueDate <= endDate,
    )

  const getOverdueTasks = () => {
    const now = new Date().toISOString().split('T')[0]
    return tasks.value.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < now &&
        !TERMINAL_STATUSES.includes(task.status),
    )
  }

  return {
    // 状态
    tasks,
    currentTask,
    filters,
    isLoading,
    error,
    isOnline,
    pendingSyncCount,
    // 计算属性
    statusStats,
    taskCountByStatus,
    overdueTasks,
    todayTasks,
    // 数据获取
    fetchTasks,
    fetchTasksByDate,
    fetchTaskDetail,
    fetchTaskRecords,
    // CRUD
    createTask,
    updateTask,
    removeTask,
    deleteTask,
    updateTaskStatus,
    batchDelete,
    // 6 状态机流转
    acceptTask,
    rejectTask,
    startTask,
    submitCompletion,
    acceptCompletion,
    rejectCompletion,
    dispatchTask,
    remindTask,
    reassignTask,
    // 兼容旧 API 名
    publish,
    withdraw,
    accept,
    start,
    submitProgressData,
    submitAcceptance,
    complete,
    reject,
    cancel,
    abandon,
    handleOvertimeContinue,
    handleOvertimeAbandon,
    reassign,
    extend,
    remind,
    // 筛选
    setFilters,
    resetFilters,
    // 同步
    syncPendingChanges,
    // 辅助查询
    getTasksByStatus,
    getTasksByAssignee,
    getTasksByDateRange,
    getOverdueTasks,
  }
})
