/**
 * 农事任务 Store - Pinia 状态管理
 * 对应 V1.1 farmTaskStore.ts，提供完整的任务数据管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllTasks,
  getTasks,
  getTaskById,
  getTaskByCode,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  deleteTasks,
  publishTask,
  withdrawTask,
  acceptTask,
  startTask,
  submitProgress,
  submitForAcceptance,
  completeTask,
  rejectTask,
  cancelTask,
  abandonTask,
  overtimeContinue,
  overtimeAbandon,
  reassignTask,
  extendDeadline,
  remindTask,
  getTaskStats,
  getTaskRecords,
  getOverdueTasks,
  getPendingTasks,
  getInProgressTasks,
  getWaitingAcceptanceTasks,
  getTasksWithPagination,
} from '@/services/apiFarmTaskService'

export const useFarmTaskStore = defineStore('farmTask', () => {
  // ========== 数据状态 ==========
  const tasks = ref([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const currentTask = ref(null)

  // ========== 筛选状态 ==========
  const filters = ref({
    status: '',
    priority: '',
    keyword: '',
    assigneeId: '',
    greenhouseId: '',
  })

  // ========== 分页状态 ==========
  const pagination = ref({
    page: 1,
    pageSize: 10,
  })

  // ========== 计算属性 ==========

  /** 按状态分组统计 */
  const statusStats = computed(() => {
    const stats = {
      total: tasks.value.length,
      pending: 0,
      inProgress: 0,
      waitingAcceptance: 0,
      completed: 0,
      overdue: 0,
      cancelled: 0,
    }
    const now = new Date().toISOString().split('T')[0]
    tasks.value.forEach(t => {
      switch (t.status) {
        case 'pending': stats.pending++; break
        case 'accepted':
        case 'in_progress':
          stats.inProgress++
          if (t.dueDate && t.dueDate < now) stats.overdue++
          break
        case 'waiting_acceptance': stats.waitingAcceptance++; break
        case 'completed': stats.completed++; break
        case 'cancelled':
        case 'abandoned': stats.cancelled++; break
      }
    })
    return stats
  })

  /** 过滤后的任务列表 */
  const filteredTasks = computed(() => {
    let result = tasks.value
    if (filters.value.status) {
      result = result.filter(t => t.status === filters.value.status)
    }
    if (filters.value.priority) {
      result = result.filter(t => t.priority === filters.value.priority)
    }
    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      result = result.filter(t =>
        t.title?.toLowerCase().includes(kw) ||
        t.taskCode?.toLowerCase().includes(kw) ||
        t.assigneeName?.toLowerCase().includes(kw)
      )
    }
    if (filters.value.assigneeId) {
      result = result.filter(t => t.assigneeId === filters.value.assigneeId)
    }
    if (filters.value.greenhouseId) {
      result = result.filter(t => t.greenhouseId === filters.value.greenhouseId)
    }
    return result
  })

  // ========== 数据获取 ==========

  /** 获取任务列表（分页） */
  const fetchTasks = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const result = await getTasksWithPagination({
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.pageSize,
        status: params.status || filters.value.status,
        keyword: params.keyword || filters.value.keyword,
        assigneeId: params.assigneeId || filters.value.assigneeId,
        greenhouseId: params.greenhouseId || filters.value.greenhouseId,
      })
      if (result.data && Array.isArray(result.data)) {
        tasks.value = result.data
        total.value = result.total || result.data.length
      }
    } catch (e) {
      error.value = e.message || '获取任务列表失败'
      console.warn('[farmTaskStore] fetchTasks 失败:', e)
    } finally {
      loading.value = false
    }
  }

  /** 获取任务详情 */
  const fetchTaskDetail = async (id) => {
    try {
      currentTask.value = await getTaskById(id)
      return currentTask.value
    } catch (e) {
      console.warn('[farmTaskStore] fetchTaskDetail 失败:', e)
      return null
    }
  }

  /** 获取任务操作记录 */
  const fetchTaskRecords = async (taskId) => {
    try {
      return await getTaskRecords(taskId)
    } catch {
      return []
    }
  }

  // ========== CRUD 操作 ==========

  /** 创建任务 */
  const createTask = async (data) => {
    try {
      const result = await apiCreateTask(data)
      if (result) {
        tasks.value.unshift(result)
        total.value++
      }
      return result
    } catch (e) {
      console.warn('[farmTaskStore] createTask 失败:', e)
      throw e
    }
  }

  /** 更新任务 */
  const updateTask = async (id, data) => {
    try {
      const result = await apiUpdateTask(id, data)
      if (result) {
        const idx = tasks.value.findIndex(t => t.id === id)
        if (idx !== -1) {
          tasks.value[idx] = { ...tasks.value[idx], ...result }
        }
      }
      return result
    } catch (e) {
      console.warn('[farmTaskStore] updateTask 失败:', e)
      throw e
    }
  }

  /** 删除任务 */
  const removeTask = async (id) => {
    try {
      await apiDeleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e) {
      console.warn('[farmTaskStore] removeTask 失败:', e)
      throw e
    }
  }

  /** 批量删除 */
  const batchDelete = async (ids) => {
    try {
      await deleteTasks(ids)
      tasks.value = tasks.value.filter(t => !ids.includes(t.id))
      total.value = Math.max(0, total.value - ids.length)
    } catch (e) {
      console.warn('[farmTaskStore] batchDelete 失败:', e)
      throw e
    }
  }

  // ========== 状态流转操作 ==========

  const publish = async (id) => {
    const result = await publishTask(id).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'pending' }) }
    return result
  }

  const withdraw = async (id) => {
    const result = await withdrawTask(id).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'draft' }) }
    return result
  }

  const accept = async (id) => {
    const result = await acceptTask(id).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'accepted' }) }
    return result
  }

  const start = async (id) => {
    const result = await startTask(id).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'in_progress' }) }
    return result
  }

  const submitProgressData = async (id, progress, feedback) => {
    const result = await submitProgress(id, progress, feedback)
    if (result) updateLocalTask(id, result)
    return result
  }

  const submitAcceptance = async (id) => {
    const result = await submitForAcceptance(id)
    if (result) updateLocalTask(id, result)
    return result
  }

  const complete = async (id, comments) => {
    const result = await completeTask(id, comments).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'completed', progress: 100 }) }
    return result
  }

  const reject = async (id, reason) => {
    const result = await rejectTask(id, reason).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'rejected' }) }
    return result
  }

  const cancel = async (id, reason) => {
    const result = await cancelTask(id, reason).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'cancelled' }) }
    return result
  }

  const abandon = async (id, reason) => {
    const result = await abandonTask(id, reason).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'abandoned' }) }
    return result
  }

  const handleOvertimeContinue = async (id) => {
    const result = await overtimeContinue(id).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'in_progress' }) }
    return result
  }

  const handleOvertimeAbandon = async (id, reason) => {
    const result = await overtimeAbandon(id, reason).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'abandoned' }) }
    return result
  }

  const reassign = async (id, assigneeId) => {
    const result = await reassignTask(id, assigneeId).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { status: 'pending', assigneeId }) }
    return result
  }

  const extend = async (id, newDeadline, reason) => {
    const result = await extendDeadline(id, newDeadline, reason).catch(() => null)
    if (result) { updateLocalTask(id, result) }
    else { updateLocalTask(id, { dueDate: newDeadline }) }
    return result
  }

  const remind = async (id) => {
    try { return await remindTask(id) }
    catch { return true }
  }

  // ========== 筛选操作 ==========

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      status: '',
      priority: '',
      keyword: '',
      assigneeId: '',
      greenhouseId: '',
    }
  }

  const setPage = (page) => {
    pagination.value.page = page
  }

  const setPageSize = (size) => {
    pagination.value.pageSize = size
    pagination.value.page = 1
  }

  // ========== 内部辅助 ==========

  const updateLocalTask = (id, data) => {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1 && data) {
      tasks.value[idx] = { ...tasks.value[idx], ...data }
    }
  }

  return {
    // 状态
    tasks,
    total,
    loading,
    error,
    currentTask,
    filters,
    pagination,
    // 计算属性
    statusStats,
    filteredTasks,
    // 数据获取
    fetchTasks,
    fetchTaskDetail,
    fetchTaskRecords,
    // CRUD
    createTask,
    updateTask,
    removeTask,
    batchDelete,
    // 状态流转
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
    setPage,
    setPageSize,
  }
})
