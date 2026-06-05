import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as techSolutionService from '@/services/techSolutionService'

export const useTechSolutionStore = defineStore('techSolution', () => {
  // 状态
  const solutions = ref([])
  const isLoading = ref(false)
  // 修复 P0-BB：与 V1.1 L27 一致，添加 error 状态
  const error = ref(null)

  // 获取技术方案列表
  const fetchSolutions = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await techSolutionService.getTechSolutions()
      solutions.value = data || []
    } catch (err) {
      // 修复 P0-CF：与 V1.1 L43-52 一致，保存 error 信息
      error.value = (err instanceof Error ? err.message : String(err))
      solutions.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 添加技术方案
  // 修复 P0-CI：与 V1.1 L54-60 一致，返回后端完整数据
  const addSolution = async (solution) => {
    const newSolution = await techSolutionService.addTechSolution(solution)
    if (newSolution) {
      // 修复 P0-AZ：与 V1.1 L57-58 一致，[newSolution, ...state.solutions]
      solutions.value = [newSolution, ...solutions.value]
    }
    return newSolution
  }

  // 更新技术方案
  // 修复 P0-BA/CJ：与 V1.1 L65-67 一致，使用后端返回的完整数据 merge（merge 模式）
  // V2.0 原版：spread updates，会丢失后端转换的字段（如 scopes/status 重新计算）
  const updateSolution = async (id, updates) => {
    const updated = await techSolutionService.updateTechSolution(id, updates)
    if (updated) {
      const index = solutions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        solutions.value[index] = { ...solutions.value[index], ...updated }
      }
    }
    return updated
  }

  // 删除单个技术方案
  // 修复 P0-AA/CG：与 V1.1 L73-79 一致，添加单独的删除方法
  const deleteSolution = async (id) => {
    const result = await techSolutionService.deleteTechSolution(id)
    if (result) {
      solutions.value = solutions.value.filter(s => s.id !== id)
    }
    return result
  }

  // 批量删除技术方案
  // 修复 P0-CH：与 V1.1 L81-87 一致，返回 result
  const deleteSolutions = async (ids) => {
    const result = await techSolutionService.deleteTechSolutions(ids)
    if (result) {
      solutions.value = solutions.value.filter(s => !ids.includes(s.id))
    }
    return result
  }

  return {
    solutions,
    isLoading,
    error,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution,
    deleteSolutions
  }
})
