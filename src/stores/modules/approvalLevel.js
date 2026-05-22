/**
 * 分级审批配置 Store — Pinia 状态管理
 * 管理审批级别配置、金额阈值、类型规则三类数据
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getApprovalLevelConfigs,
  updateApprovalLevelConfig as apiUpdateLevelConfig,
  getApprovalAmountThresholds,
  createApprovalAmountThreshold as apiCreateThreshold,
  updateApprovalAmountThreshold as apiUpdateThreshold,
  deleteApprovalAmountThreshold as apiDeleteThreshold,
  getApprovalTypeRules,
  updateApprovalTypeRule as apiUpdateTypeRule
} from '@/api/system/approvalLevel'

export const useApprovalLevelStore = defineStore('approvalLevel', () => {
  // 状态
  const levelConfigs = ref([])
  const amountThresholds = ref([])
  const typeRules = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  // 加载所有数据
  const loadAll = async () => {
    const now = Date.now()
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && levelConfigs.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    try {
      const [configs, thresholds, rules] = await Promise.all([
        getApprovalLevelConfigs(),
        getApprovalAmountThresholds(),
        getApprovalTypeRules()
      ])
      levelConfigs.value = configs || []
      amountThresholds.value = thresholds || []
      typeRules.value = rules || []
      lastFetch.value = now
    } catch (err) {
      console.warn('[ApprovalLevelStore] 加载数据失败:', err)
      error.value = err.message || '加载分级审批数据失败'
    } finally {
      loading.value = false
    }
  }

  // 刷新所有数据
  const refreshAll = async () => {
    lastFetch.value = null
    await loadAll()
  }

  // 更新级别配置
  const updateLevelConfig = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      await apiUpdateLevelConfig(id, data)
      levelConfigs.value = levelConfigs.value.map(item =>
        item.id === id ? { ...item, ...data } : item
      )
    } catch (err) {
      console.warn('[ApprovalLevelStore] 更新级别配置失败:', err)
      error.value = err.message || '更新审批级别配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 添加金额阈值
  const addAmountThreshold = async (data) => {
    loading.value = true
    error.value = null
    try {
      const created = await apiCreateThreshold(data)
      // 重新加载以获取完整数据
      const thresholds = await getApprovalAmountThresholds()
      amountThresholds.value = thresholds || []
      return created
    } catch (err) {
      console.warn('[ApprovalLevelStore] 创建金额阈值失败:', err)
      error.value = err.message || '创建金额阈值失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新金额阈值
  const updateAmountThreshold = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      await apiUpdateThreshold(id, data)
      amountThresholds.value = amountThresholds.value.map(item =>
        item.id === id ? { ...item, ...data } : item
      )
    } catch (err) {
      console.warn('[ApprovalLevelStore] 更新金额阈值失败:', err)
      error.value = err.message || '更新金额阈值失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除金额阈值
  const removeAmountThreshold = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiDeleteThreshold(id)
      amountThresholds.value = amountThresholds.value.filter(item => item.id !== id)
    } catch (err) {
      console.warn('[ApprovalLevelStore] 删除金额阈值失败:', err)
      error.value = err.message || '删除金额阈值失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新类型规则
  const updateTypeRule = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      await apiUpdateTypeRule(id, data)
      typeRules.value = typeRules.value.map(item =>
        item.id === id ? { ...item, ...data } : item
      )
    } catch (err) {
      console.warn('[ApprovalLevelStore] 更新审批类型规则失败:', err)
      error.value = err.message || '更新审批类型规则失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    levelConfigs,
    amountThresholds,
    typeRules,
    loading,
    error,
    // 方法
    loadAll,
    refreshAll,
    updateLevelConfig,
    addAmountThreshold,
    updateAmountThreshold,
    removeAmountThreshold,
    updateTypeRule
  }
})
