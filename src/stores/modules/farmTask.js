import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

export const useFarmTaskStore = defineStore('farmTask', () => {
  // 状态
  const tasks = ref([])
  const total = ref(0)
  const loading = ref(false)
  const currentTask = ref(null)
  const error = ref(null)
  // 离线状态
  const isOnline = ref(navigator.onLine)
  const pendingSyncCount = ref(0)

  // 方法
  const fetchTasks = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await enhancedApiClient.get('/farm-tasks')
      if (Array.isArray(data) && data.length > 0) {
        tasks.value = data
        total.value = data.length
      }
    } catch (err) {
      console.warn('[FarmTaskStore] API获取失败:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchTaskDetail = async (id) => {
    loading.value = true
    try {
      const data = await enhancedApiClient.get(`/farm-tasks/${id}`)
      currentTask.value = data
    } catch (err) {
      console.warn('[FarmTaskStore] 获取任务详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (data) => {
    try {
      const saved = await enhancedApiClient.post('/farm-tasks', data)
      if (saved) {
        tasks.value = [saved, ...tasks.value]
        total.value++
      }
      return saved
    } catch (err) {
      console.warn('[FarmTaskStore] 创建任务失败:', err)
      throw err
    }
  }

  const updateTask = async (id, data) => {
    // 乐观更新
    tasks.value = tasks.value.map(t =>
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    )
    try {
      await enhancedApiClient.put(`/farm-tasks/${id}`, data)
    } catch (err) {
      console.warn('[FarmTaskStore] 更新任务失败:', err)
    }
  }

  const deleteTask = async (id) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    total.value--
    try {
      await enhancedApiClient.delete(`/farm-tasks/${id}`)
    } catch (err) {
      console.warn('[FarmTaskStore] 删除任务失败:', err)
    }
  }

  const completeTask = async (id) => {
    await updateTask(id, { status: 'completed' })
  }

  // 筛选
  const setFilters = (filters) => {
    // 预留筛选接口
  }

  // 离线同步
  const syncPendingChanges = async () => {
    // 预留离线同步逻辑
  }

  return {
    tasks,
    total,
    loading,
    currentTask,
    error,
    isOnline,
    pendingSyncCount,
    fetchTasks,
    fetchTaskDetail,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setFilters,
    syncPendingChanges
  }
})
