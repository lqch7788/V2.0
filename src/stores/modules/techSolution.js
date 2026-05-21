import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTechSolutionStore = defineStore('techSolution', () => {
  // 状态
  const solutions = ref([])
  const isLoading = ref(false)

  // 获取技术方案列表
  const fetchSolutions = async () => {
    isLoading.value = true
    try {
      const storedSolutions = localStorage.getItem('techSolutions')
      if (storedSolutions) {
        solutions.value = JSON.parse(storedSolutions)
      } else {
        solutions.value = []
      }
    } catch (error) {
      console.error('获取技术方案数据失败:', error)
      solutions.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 添加技术方案
  const addSolution = async (solution) => {
    const newSolution = {
      id: solution.id || `T${Date.now()}`,
      code: solution.code || '',
      title: solution.title || '',
      crop: solution.crop || '',
      cropCode: solution.cropCode || '',
      plantingMode: solution.plantingMode || '水培',
      stage: solution.stage || '',
      author: solution.author || localStorage.getItem('username') || '陆启闯',
      authorId: solution.authorId || '',
      createDate: new Date().toISOString().slice(0, 10),
      status: solution.status || '草稿',
      statusClass: solution.statusClass || 'draft',
      version: solution.version || 'V1.0',
      content: solution.content || '',
      relatedBatchCode: solution.relatedBatchCode || '',
      planDetailFileName: solution.planDetailFileName || '',
      lastSubmitTime: solution.lastSubmitTime || '',
      isValid: solution.isValid || '有效'
    }

    solutions.value.unshift(newSolution)
    saveSolutions()
    return newSolution
  }

  // 更新技术方案
  const updateSolution = async (id, updates) => {
    const index = solutions.value.findIndex(s => s.id === id)
    if (index !== -1) {
      solutions.value[index] = { ...solutions.value[index], ...updates }
      saveSolutions()
    }
  }

  // 删除技术方案
  const deleteSolution = async (id) => {
    solutions.value = solutions.value.filter(s => s.id !== id)
    saveSolutions()
  }

  // 批量删除技术方案
  const deleteSolutions = async (ids) => {
    solutions.value = solutions.value.filter(s => !ids.includes(s.id))
    saveSolutions()
  }

  // 保存到 localStorage
  const saveSolutions = () => {
    localStorage.setItem('techSolutions', JSON.stringify(solutions.value))
  }

  return {
    solutions,
    isLoading,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution,
    deleteSolutions
  }
})
