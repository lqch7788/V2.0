import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as orderService from '@/services/cropOrderService'

export const useOrderDataStore = defineStore('orderData', () => {
  // 状态
  const orders = ref([])
  const isLoading = ref(false)
  const stats = ref(null)

  // 获取订单列表
  const fetchOrders = async () => {
    isLoading.value = true
    try {
      const data = await orderService.getOrders()
      orders.value = data || []
    } catch (error) {
      console.error('获取订单数据失败:', error)
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const backendStats = await orderService.getOrderStats()
      if (backendStats) {
        stats.value = backendStats
      } else {
        // 降级：从本地数据计算
        stats.value = {
          total: orders.value.length,
          inProgress: orders.value.filter(o => o.status === 'in_progress').length,
          completed: orders.value.filter(o => o.status === 'completed').length,
          thisMonth: orders.value.filter(o => {
            const date = new Date(o.createTime || '')
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          }).length
        }
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 添加订单
  const addOrder = async (order) => {
    const newOrder = await orderService.createOrder(order)
    if (newOrder) {
      orders.value.unshift(newOrder)
      await fetchStats()
    }
    return newOrder
  }

  // 更新订单
  const updateOrder = async (id, updates) => {
    const updated = await orderService.updateOrder(id, updates)
    if (updated) {
      const index = orders.value.findIndex(o => o.id === id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...updated }
      }
      await fetchStats()
    }
    return updated
  }

  // 删除订单
  const deleteOrder = async (id) => {
    await orderService.deleteOrder(id)
    orders.value = orders.value.filter(o => o.id !== id)
    await fetchStats()
  }

  // 批量删除订单
  const deleteOrders = async (ids) => {
    await orderService.deleteOrders(ids)
    orders.value = orders.value.filter(o => !ids.includes(o.id))
    await fetchStats()
  }

  // 同步待处理订单
  const syncPending = async () => {
    return await orderService.syncPendingOrders()
  }

  return {
    orders,
    isLoading,
    stats,
    fetchOrders,
    fetchStats,
    addOrder,
    updateOrder,
    deleteOrder,
    deleteOrders,
    syncPending
  }
})
