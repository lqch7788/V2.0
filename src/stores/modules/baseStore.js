/**
 * 公司基地 Store - 对应V1.1 useBaseStore
 * 公司基地、设施管理，区块划分和种植记录
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBases, createBase, updateBase, deleteBase } from '@/services/apiBasicDataService'

export const useBaseStore = defineStore('base', () => {
  // 状态
  const bases = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * 加载基地数据 - 调用真实API
   */
  const loadBases = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await getBases()
      bases.value = data || []
    } catch (err) {
      error.value = err.message || '加载基地数据失败'
    } finally {
      loading.value = false
    }
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
    loadBases,
    addBase,
    editBase,
    removeBase
  }
})
