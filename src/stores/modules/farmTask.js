import { defineStore } from 'pinia'
import { ref } from 'vue'
import { farmApi } from '@/api/farm'

export const useFarmTaskStore = defineStore('farmTask', () => {
  // 状态
  const tasks = ref([])
  const total = ref(0)
  const loading = ref(false)
  const currentTask = ref(null)

  // 方法
  const fetchTasks = async (params) => {
    loading.value = true
    try {
      const result = await farmApi.getTaskList(params)
      tasks.value = result.items
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  const fetchTaskDetail = async (id) => {
    loading.value = true
    try {
      currentTask.value = await farmApi.getTaskDetail(id)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (data) => {
    await farmApi.createTask(data)
    await fetchTasks({ page: 1, pageSize: 10 })
  }

  const updateTask = async (id, data) => {
    await farmApi.updateTask(id, data)
    await fetchTasks({ page: 1, pageSize: 10 })
  }

  const deleteTask = async (id) => {
    await farmApi.deleteTask(id)
    await fetchTasks({ page: 1, pageSize: 10 })
  }

  const completeTask = async (id) => {
    await farmApi.completeTask(id)
    await fetchTasks({ page: 1, pageSize: 10 })
  }

  return {
    tasks,
    total,
    loading,
    currentTask,
    fetchTasks,
    fetchTaskDetail,
    createTask,
    updateTask,
    deleteTask,
    completeTask
  }
})
