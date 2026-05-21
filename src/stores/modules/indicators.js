/**
 * 指标数据 Store 模块
 * 使用 Pinia 管理指标数据状态
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  mockIndicators,
  mockEvaluationData,
  mockAnalyzeData,
  mockCategorySummary
} from '@/data/indicatorsData'

export const useIndicatorStore = defineStore('indicators', () => {
  // ========== 状态定义 ==========

  // 指标列表数据
  const indicators = ref([...mockIndicators])

  // 评估数据
  const evaluationData = ref([...mockEvaluationData])

  // 分析数据
  const analyzeData = ref([...mockAnalyzeData])

  // 分类汇总数据
  const categorySummary = ref([...mockCategorySummary])

  // 加载状态
  const isLoading = ref(false)

  // ========== Actions ==========

  /**
   * 获取指标列表
   */
  const fetchIndicators = async () => {
    isLoading.value = true
    try {
      // 模拟异步请求
      await new Promise(resolve => setTimeout(resolve, 300))
      indicators.value = [...mockIndicators]
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取评估数据
   */
  const fetchEvaluations = async () => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      evaluationData.value = [...mockEvaluationData]
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建指标
   */
  const createIndicator = async (indicatorData) => {
    const newIndicator = {
      id: `IND${Date.now()}`,
      code: `IND${String(indicators.value.length + 1).padStart(3, '0')}`,
      name: indicatorData.name || '',
      category: indicatorData.category || '生产指标',
      unit: indicatorData.unit || '',
      target: indicatorData.target || 0,
      actual: indicatorData.actual || 0,
      trend: 'stable',
      frequency: indicatorData.frequency || '月度',
      source: indicatorData.source || '人工录入',
      warning: indicatorData.warning || 0,
      weight: indicatorData.weight || 0,
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString()
    }
    indicators.value.push(newIndicator)
    return newIndicator
  }

  /**
   * 更新指标
   */
  const updateIndicator = async (id, indicatorData) => {
    const index = indicators.value.findIndex(item => item.id === id)
    if (index !== -1) {
      indicators.value[index] = {
        ...indicators.value[index],
        ...indicatorData,
        updateTime: new Date().toLocaleString()
      }
    }
  }

  /**
   * 删除指标
   */
  const deleteIndicator = async (id) => {
    const index = indicators.value.findIndex(item => item.id === id)
    if (index !== -1) {
      indicators.value.splice(index, 1)
    }
  }

  return {
    // 状态
    indicators,
    evaluationData,
    analyzeData,
    categorySummary,
    isLoading,
    // Actions
    fetchIndicators,
    fetchEvaluations,
    createIndicator,
    updateIndicator,
    deleteIndicator
  }
})
