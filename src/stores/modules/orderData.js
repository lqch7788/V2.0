/**
 * 订单数据 Store (V2.0 架构)
 * 管理订单的完整 CRUD 数据流
 *
 * 数据流：API → enhancedApiClient（无缓存）→ Store → 页面组件
 * - L1：Store 内存数据
 * - L2：（未使用）无 IndexedDB 缓存
 * - L3：（未使用）订单管理页面不读取 localStorage
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as orderService from '@/services/cropOrderService'

export const useOrderDataStore = defineStore('orderData', () => {
  // 状态
  const orders = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const stats = ref(null)

  // 获取订单列表
  const fetchOrders = async () => {
    isLoading.value = true
    try {
      const data = await orderService.getOrders()
      orders.value = data || []
      error.value = null
    } catch (err) {
      console.error('获取订单数据失败:', err)
      orders.value = []
      error.value = err?.message
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
        // 后端状态与前端 CropOrderStatus 枚举不匹配，使用前端本地数据计算
        stats.value = null
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 添加订单
  const addOrder = async (order) => {
    const newOrder = await orderService.createOrder(order)
    if (newOrder) {
      orders.value = [newOrder, ...orders.value]
    }
    return newOrder
  }

  // 更新订单
  const updateOrder = async (id, updates) => {
    const result = await orderService.updateOrder(id, updates)
    if (result) {
      orders.value = orders.value.map(o => (o.id === id ? { ...o, ...updates, updateTime: new Date().toISOString() } : o))
    }
    return result
  }

  // 删除订单
  const deleteOrder = async (id) => {
    await orderService.deleteOrder(id)
    orders.value = orders.value.filter(o => o.id !== id)
  }

  // 批量删除订单
  const deleteOrders = async (ids) => {
    await orderService.deleteOrders(ids)
    orders.value = orders.value.filter(o => !ids.includes(o.id))
  }

  // 同步待处理订单（对齐 V1.1 useOrderDataStore.ts:99-101：调用后端同步离线订单队列）
  const syncPending = async () => {
    try {
      const result = await orderService.syncPendingOrders()
      return result || { success: 0, failed: 0 }
    } catch (err) {
      // 后端可能没有 /crop-orders/sync-pending 接口，404/网络错误时降级为 0，不影响页面主流程
      console.error('同步待处理订单失败:', err)
      return { success: 0, failed: 0 }
    }
  }

  return {
    orders,
    isLoading,
    error,
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
