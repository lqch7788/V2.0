/**
 * 成本核算 Store - Pinia 状态管理
 * 统一管理成本类别和预算的增删改查
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getCostCategories,
  createCostCategory as apiCreateCategory,
  updateCostCategory as apiUpdateCategory,
  deleteCostCategory as apiDeleteCategory,
  getCostBudgets,
  createCostBudget as apiCreateBudget,
  updateCostBudget as apiUpdateBudget,
  deleteCostBudget as apiDeleteBudget,
  getCostStats
} from '@/api/cost'

// 成本类别类型映射
export const COST_CATEGORY_TYPE_MAP = {
  material: '物料',
  labor: '人工',
  equipment: '设备',
  energy: '能源',
  other: '其他'
}

// 成本类别状态映射
export const COST_CATEGORY_STATUS_MAP = {
  active: '启用',
  inactive: '停用'
}

// 预算状态映射
export const BUDGET_STATUS_MAP = {
  active: '进行中',
  completed: '已完成',
  cancelled: '已取消'
}

export const useCostStore = defineStore('cost', () => {
  // 状态
  const categories = ref([])
  const budgets = ref([])
  const stats = ref(null)
  const loading = ref(false)
  const statsLoading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  /**
   * 加载所有数据（类别和预算）
   */
  const loadAll = async () => {
    const now = Date.now()
    const last = lastFetch.value
    // 5分钟内不重复加载
    if (last && now - last < 5 * 60 * 1000 && categories.value.length > 0) return

    loading.value = true
    error.value = null
    try {
      const [cats, buds] = await Promise.all([getCostCategories(), getCostBudgets()])
      categories.value = cats || []
      budgets.value = buds || []
      lastFetch.value = now
    } catch (err) {
      error.value = err.message || '加载成本数据失败'
      console.warn('[CostStore] loadAll failed:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载成本类别
   */
  const loadCategories = async () => {
    try {
      const data = await getCostCategories()
      categories.value = data || []
    } catch (err) {
      error.value = err.message || '加载成本类别失败'
      console.warn('[CostStore] loadCategories failed:', err)
    }
  }

  /**
   * 加载预算
   */
  const loadBudgets = async () => {
    try {
      const data = await getCostBudgets()
      budgets.value = data || []
    } catch (err) {
      error.value = err.message || '加载预算失败'
      console.warn('[CostStore] loadBudgets failed:', err)
    }
  }

  /**
   * 添加成本类别
   */
  const addCategory = async (data) => {
    loading.value = true
    error.value = null
    try {
      const created = await apiCreateCategory(data)
      categories.value = [...categories.value, created]
      return created
    } catch (err) {
      error.value = err.message || '创建成本类别失败'
      console.warn('[CostStore] addCategory failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新成本类别
   */
  const updateCategory = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      await apiUpdateCategory(id, data)
      categories.value = categories.value.map(c =>
        c.id === id ? { ...c, ...data } : c
      )
    } catch (err) {
      error.value = err.message || '更新成本类别失败'
      console.warn('[CostStore] updateCategory failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除成本类别
   */
  const removeCategory = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiDeleteCategory(id)
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err.message || '删除成本类别失败'
      console.warn('[CostStore] removeCategory failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加预算
   */
  const addBudget = async (data) => {
    loading.value = true
    error.value = null
    try {
      const created = await apiCreateBudget(data)
      budgets.value = [...budgets.value, created]
      return created
    } catch (err) {
      error.value = err.message || '创建预算失败'
      console.warn('[CostStore] addBudget failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新预算
   */
  const updateBudget = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      await apiUpdateBudget(id, data)
      budgets.value = budgets.value.map(b =>
        b.id === id ? { ...b, ...data } : b
      )
    } catch (err) {
      error.value = err.message || '更新预算失败'
      console.warn('[CostStore] updateBudget failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除预算
   */
  const removeBudget = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiDeleteBudget(id)
      budgets.value = budgets.value.filter(b => b.id !== id)
    } catch (err) {
      error.value = err.message || '删除预算失败'
      console.warn('[CostStore] removeBudget failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载成本统计数据（成本分析）
   */
  const loadStats = async (params = {}) => {
    statsLoading.value = true
    try {
      const data = await getCostStats(params)
      stats.value = data
      return data
    } catch (err) {
      console.warn('[CostStore] loadStats failed:', err)
      return null
    } finally {
      statsLoading.value = false
    }
  }

  /**
   * 刷新所有数据
   */
  const refreshAll = async () => {
    lastFetch.value = null
    await loadAll()
  }

  return {
    // 状态
    categories,
    budgets,
    stats,
    loading,
    statsLoading,
    error,
    // 方法
    loadAll,
    loadCategories,
    loadBudgets,
    addCategory,
    updateCategory,
    removeCategory,
    addBudget,
    updateBudget,
    removeBudget,
    loadStats,
    refreshAll
  }
})
