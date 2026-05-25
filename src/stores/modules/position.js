/**
 * 职位 Store - Pinia 状态管理
 * 对应 V1.1 usePositionStore.ts
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPositions, createPosition, updatePosition, deletePosition } from '@/api/system/position'

export const usePositionStore = defineStore('position', () => {
  // 状态
  const positions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  /**
   * 加载职位列表
   */
  const loadPositions = async () => {
    const now = Date.now()
    // 5分钟内不重复加载
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && positions.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    try {
      const data = await getPositions()
      positions.value = Array.isArray(data) ? data : []
      lastFetch.value = now
    } catch (err) {
      error.value = err.message || '加载职位失败'
      console.error('加载职位失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增职位
   */
  const addPosition = async (position) => {
    const result = await createPosition(position)
    positions.value.push(result)
    return result
  }

  /**
   * 编辑职位
   */
  const editPosition = async (id, position) => {
    await updatePosition(id, position)
    const index = positions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      positions.value[index] = { ...positions.value[index], ...position }
    }
  }

  /**
   * 删除职位
   */
  const removePosition = async (id) => {
    await deletePosition(id)
    positions.value = positions.value.filter(p => p.id !== id)
  }

  /**
   * 刷新职位列表
   */
  const refreshPositions = async () => {
    lastFetch.value = null
    await loadPositions()
  }

  return {
    positions,
    loading,
    error,
    lastFetch,
    loadPositions,
    addPosition,
    editPosition,
    removePosition,
    refreshPositions
  }
})
