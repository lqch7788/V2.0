import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as techSolutionService from '@/services/techSolutionService'

export const useTechSolutionStore = defineStore('techSolution', () => {
  // 状态
  const solutions = ref([])
  const isLoading = ref(false)

  // 获取技术方案列表
  const fetchSolutions = async () => {
    isLoading.value = true
    try {
      const data = await techSolutionService.getTechSolutions()
      solutions.value = data || []
    } catch (error) {
      console.error('获取技术方案数据失败:', error)
      solutions.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 添加技术方案
  const addSolution = async (solution) => {
    const newSolution = await techSolutionService.addTechSolution(solution)
    if (newSolution) {
      solutions.value.unshift(newSolution)
    }
    return newSolution
  }

  // 更新技术方案
  const updateSolution = async (id, updates) => {
    const updated = await techSolutionService.updateTechSolution(id, updates)
    if (updated) {
      const index = solutions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        solutions.value[index] = { ...solutions.value[index], ...updates }
      }
    }
    return updated
  }

  // 删除技术方案
  const deleteSolution = async (id) => {
    await techSolutionService.deleteTechSolution(id)
    solutions.value = solutions.value.filter(s => s.id !== id)
  }

  // 批量删除技术方案
  const deleteSolutions = async (ids) => {
    await techSolutionService.deleteTechSolutions(ids)
    solutions.value = solutions.value.filter(s => !ids.includes(s.id))
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
