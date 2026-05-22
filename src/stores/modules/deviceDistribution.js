/**
 * 设备分配 Store — iAGS DeviceDistribution 集成
 *
 * 对接后端: /api/device-distributions
 * IoT设备分配到温室/区域 + 运行参数配置
 * 预留端口 — V2.0 暂无真实IoT设备
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiDeviceDistributionService } from '@/services/apiDeviceDistributionService'

export const useDeviceDistributionStore = defineStore('deviceDistribution', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * 获取设备分配列表
   * @param {Object} filters - 筛选条件
   */
  const fetchItems = async (filters) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiDeviceDistributionService.getList(filters)
      if (response.success) {
        items.value = response.data || []
      } else {
        error.value = '获取数据失败'
      }
    } catch (err) {
      error.value = err.message || '获取数据异常'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建设备分配记录
   * @param {Object} data - 设备分配数据
   * @returns {Promise<Object|null>}
   */
  const createItem = async (data) => {
    try {
      const response = await apiDeviceDistributionService.create(data)
      if (response.success && response.data) {
        items.value.unshift(response.data)
        return response.data
      }
      return null
    } catch (err) {
      error.value = err.message || '创建数据异常'
      return null
    }
  }

  /**
   * 更新设备分配记录
   * @param {string} oid - 记录OID
   * @param {Object} updates - 更新数据
   */
  const updateItem = async (oid, updates) => {
    // 乐观更新：先更新本地数据
    const index = items.value.findIndex(item => item.oid === oid)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
    }

    try {
      await apiDeviceDistributionService.update(oid, updates)
    } catch (err) {
      // 失败时回滚已在乐观更新中处理
      error.value = err.message || '更新数据异常'
    }
  }

  /**
   * 删除设备分配记录
   * @param {string} oid - 记录OID
   * @returns {Promise<boolean>}
   */
  const deleteItem = async (oid) => {
    // 乐观更新：先删除本地数据
    const originalItems = [...items.value]
    items.value = items.value.filter(item => item.oid !== oid)

    try {
      const response = await apiDeviceDistributionService.delete(oid)
      if (!response.success) {
        // 回滚
        items.value = originalItems
        return false
      }
      return true
    } catch (err) {
      // 回滚
      items.value = originalItems
      error.value = err.message || '删除数据异常'
      return false
    }
  }

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }
})
