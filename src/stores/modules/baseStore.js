/**
 * 公司基地 Store - 对应V1.1 useBaseStore
 * 公司基地、设施管理，区块划分和种植记录
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBases, createBase, updateBase, deleteBase } from '@/services/apiBasicDataService'

// P1-4: 5 分钟缓存窗口(对齐 V1.1 useBaseStore lastFetch 机制)
const CACHE_TTL = 5 * 60 * 1000

export const useBaseStore = defineStore('base', () => {
  // 状态
  const bases = ref([])
  const loading = ref(false)
  const error = ref(null)
  // P1-4: 上次拉取时间戳
  const lastFetch = ref(null)

  /**
   * 加载基地数据 - 调用真实API
   * P1-4: 5 分钟内重复调用直接复用缓存(避免抖动/并发)
   */
  const loadBases = async (companyOid) => {
    const now = Date.now()
    if (lastFetch.value && now - lastFetch.value < CACHE_TTL && bases.value.length > 0) {
      return
    }
    loading.value = true
    error.value = null
    try {
      const data = await getBases(companyOid)
      bases.value = data || []
      lastFetch.value = now
    } catch (err) {
      error.value = err.message || '加载基地数据失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 强制刷新(忽略缓存)
   * P1-4: 对齐 V1.1 refreshBases
   */
  const refreshBases = async () => {
    lastFetch.value = null
    await loadBases()
  }

  /**
   * 添加基地 - 调用真实API
   */
  const addBase = async (baseData) => {
    try {
      const newBase = await createBase(baseData)
      bases.value.push(newBase)
      return newBase
    } catch (err) {
      error.value = err.message || '添加基地失败'
      throw err
    }
  }

  /**
   * 编辑基地 - 调用真实API
   */
  const editBase = async (oid, baseData) => {
    try {
      await updateBase(oid, baseData)
      const index = bases.value.findIndex(b => b.oid === oid)
      if (index !== -1) {
        bases.value[index] = { ...bases.value[index], ...baseData }
      }
    } catch (err) {
      error.value = err.message || '编辑基地失败'
      throw err
    }
  }

  /**
   * 删除基地 - 调用真实API
   */
  const removeBase = async (oid) => {
    try {
      await deleteBase(oid)
      bases.value = bases.value.filter(b => b.oid !== oid)
    } catch (err) {
      error.value = err.message || '删除基地失败'
      throw err
    }
  }

  return {
    bases,
    loading,
    error,
    lastFetch,
    loadBases,
    refreshBases,
    addBase,
    editBase,
    removeBase
  }
})
