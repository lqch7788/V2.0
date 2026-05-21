import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderDataStore = defineStore('orderData', () => {
  // 状态
  const orders = ref([])
  const isLoading = ref(false)
  const stats = ref(null)

  // 获取订单列表
  const fetchOrders = async () => {
    isLoading.value = true
    try {
      // 从 localStorage 读取订单数据
      const storedOrders = localStorage.getItem('cropOrders')
      if (storedOrders) {
        orders.value = JSON.parse(storedOrders)
      } else {
        orders.value = []
      }
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
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 添加订单
  const addOrder = async (order) => {
    const newOrder = {
      id: order.id || `DD${Date.now()}`,
      orderCode: order.orderCode || '',
      orderName: order.orderName || '',
      orderType: order.orderType || 'production',
      cropName: order.cropName || '',
      cropCategory: order.cropCategory || '',
      cropVariety: order.cropVariety || '',
      plannedQuantity: order.plannedQuantity || 0,
      actualQuantity: order.actualQuantity || 0,
      unit: order.unit || 'kg',
      orderDate: order.orderDate || '',
      expectedHarvestDate: order.expectedHarvestDate || '',
      status: order.status || 'planned',
      createBy: order.createBy || localStorage.getItem('username') || '陆启闯',
      createTime: new Date().toISOString(),
      remarks: order.remarks || ''
    }

    orders.value.unshift(newOrder)
    saveOrders()
    await fetchStats()
    return newOrder
  }

  // 更新订单
  const updateOrder = async (id, updates) => {
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      orders.value[index] = { ...orders.value[index], ...updates }
      saveOrders()
      await fetchStats()
    }
  }

  // 删除订单
  const deleteOrder = async (id) => {
    orders.value = orders.value.filter(o => o.id !== id)
    saveOrders()
    await fetchStats()
  }

  // 批量删除订单
  const deleteOrders = async (ids) => {
    orders.value = orders.value.filter(o => !ids.includes(o.id))
    saveOrders()
    await fetchStats()
  }

  // 同步待处理订单
  const syncPending = async () => {
    // 模拟同步操作
    return { success: 0, failed: 0 }
  }

  // 保存到 localStorage
  const saveOrders = () => {
    localStorage.setItem('cropOrders', JSON.stringify(orders.value))
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
