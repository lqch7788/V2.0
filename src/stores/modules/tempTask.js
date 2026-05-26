/**
 * 临时任务 Pinia Store
 * 从 V1.1 useTempTaskStore.ts 1:1迁移
 * 对接后端: /api/temp-tasks
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// 后端字段名 → 前端字段名
const FIELD_MAP = {
  task_code: 'taskCode', task_title: 'title', task_type: 'type',
  task_content: 'description', requester_id: 'requesterId', requester_name: 'requesterName',
  assignee_id: 'assigneeId', assignee_name: 'assigneeName',
  greenhouse_id: 'greenhouseId', greenhouse_name: 'greenhouseName',
  area_name: 'location', request_date: 'requestDate', request_time: 'requestTime',
  completion_date: 'completionDate', completion_note: 'completionRemarks',
  create_time: 'createdAt', update_time: 'updatedAt',
  reject_reason: 'rejectReason', acceptance_remarks: 'acceptanceRemarks',
  due_date: 'dueDate', estimated_hours: 'estimatedHours', estimated_days: 'estimatedDays',
  worker_count: 'workerCount', actual_hours: 'actualHours', progress: 'progress',
  reject_count: 'rejectCount', urgency: 'urgency', operation_records: 'operationRecords',
  title: 'title', location: 'location', priority: 'priority', status: 'status', remarks: 'remarks',
}

/** 后端 → 前端 字段映射 */
function normalizeTask(db) {
  const result = { ...db }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  result.title = result.title || result.taskTitle || result.task_title || ''
  result.type = result.type || result.taskType || result.task_type || ''
  result.description = result.description || result.taskContent || result.task_content || ''
  result.taskCode = result.taskCode || result.task_code || ''
  result.priority = result.priority || result.urgency || 'normal'
  result.status = result.status || 'draft'
  result.createdAt = result.createdAt || result.create_time || new Date().toISOString()
  return result
}

/** 前端 → 后端 字段映射 */
function denormalizeTask(task) {
  const result = {}
  const reverse = {}
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    reverse[camel] = snake
  }
  for (const [key, value] of Object.entries(task)) {
    const backendKey = reverse[key] || key
    result[backendKey] = value
  }
  return result
}

export const useTempTaskStore = defineStore('tempTask', () => {
  const tasks = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchTasks(filters) {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `/temp-tasks${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response : []
      tasks.value = data.map(normalizeTask)
    } catch (e) {
      console.warn('[TempTaskStore] API获取失败，使用本地数据:', e)
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(task) {
    try {
      const body = denormalizeTask(task)
      const response = await enhancedApiClient.post('/temp-tasks', body)
      const newId = response?.id || `TT${Date.now()}`
      const newTask = normalizeTask({ ...task, id: newId })
      tasks.value = [newTask, ...tasks.value]
      return newTask
    } catch (e) {
      console.warn('[TempTaskStore] 创建任务API失败，已加入离线队列:', e)
      error.value = e.message
      return null
    }
  }

  async function updateTask(id, updates) {
    const body = denormalizeTask(updates)
    tasks.value = tasks.value.map(t => t.id === id ? { ...t, ...updates } : t)
    try {
      await enhancedApiClient.put(`/temp-tasks/${id}`, body)
    } catch (e) {
      console.warn('[TempTaskStore] 更新任务API失败，已加入离线队列:', e)
    }
  }

  async function deleteTask(id) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    try {
      await enhancedApiClient.delete(`/temp-tasks/${id}`)
      return true
    } catch (e) {
      console.warn('[TempTaskStore] 删除任务API失败，已加入离线队列:', e)
      return false
    }
  }

  async function deleteTasks(ids) {
    tasks.value = tasks.value.filter(t => !ids.includes(t.id))
    try {
      await Promise.all(ids.map(id => enhancedApiClient.delete(`/temp-tasks/${id}`).catch(() => {})))
      return true
    } catch { return false }
  }

  return {
    tasks, isLoading, error,
    fetchTasks, createTask, updateTask, deleteTask, deleteTasks,
  }
})
