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
import { syncApprovalStoreData } from '@/config/approvalHierarchy'
import { getDictionaries } from '@/services/dictionaryService'

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
      // ✅ 修复：amount_threshold 字典同时尝试从 V1.1 字典表（category='amount_threshold'）
      // 和 V2.0 独立表（/basic-data/approval-amount-thresholds）读
      // V1.1 字典条目格式：{ name: "500", displayName: "免审批", sortNumber: 1 }
      // V2.0 表条目格式：{ maxAmount: 500, levelCode: "exempt", sortOrder: 1 }
      const [configs, thresholdsV2, rules, dictThresholds] = await Promise.all([
        getApprovalLevelConfigs(),
        getApprovalAmountThresholds().catch(() => []),
        getApprovalTypeRules(),
        getDictionaries('amount_threshold').catch(() => [])
      ])
      // 优先用 V2.0 表；表为空时回退用 V1.1 字典
      let mergedThresholds = thresholdsV2 || []
      if ((!mergedThresholds || mergedThresholds.length === 0) && dictThresholds && dictThresholds.length > 0) {
        mergedThresholds = dictThresholds
          .filter(d => d.status === 'active' || !d.status)
          .sort((a, b) => (a.sortNumber || 0) - (b.sortNumber || 0))
          .map((d, idx) => ({
            maxAmount: Number(d.name) || 0,
            levelCode: 'exempt',  // V1.1 字典 amount_threshold 默认都是免审批
            sortOrder: idx,
            status: 'active',
            displayName: d.displayName,
          }))
      }
      levelConfigs.value = configs || []
      amountThresholds.value = mergedThresholds
      typeRules.value = rules || []
      lastFetch.value = now
      // 同步数据到运行时配置（与 V1.1 useApprovalLevelStore 一致）
      syncApprovalStoreData({
        levelConfigs: levelConfigs.value,
        amountThresholds: amountThresholds.value,
        typeRules: typeRules.value
      })
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
