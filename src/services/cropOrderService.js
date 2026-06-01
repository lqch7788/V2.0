/**
 * 作物订单数据 API 服务
 * 对接后端 /api/crop-orders
 *
 * 三级降级策略：
 * - GET 请求：API → localStorage
 * - POST/PUT/DELETE：API → localStorage（失败时作为降级）
 */

import { enhancedApiClient } from '../lib/apiClient'
import { storageGetJSON, storageSetJSON } from '../utils/storage'

const STORAGE_KEY = 'crop_orders_local'
const PENDING_ORDERS_KEY = 'crop_orders_pending'

function getLocalOrders() {
  try {
    return storageGetJSON(STORAGE_KEY, [])
  } catch {
    return []
  }
}

function saveLocalOrders(orders) {
  try {
    storageSetJSON(STORAGE_KEY, orders)
  } catch (error) {
    console.error('[cropOrderService] 保存到localStorage失败:', error)
  }
}

function getPendingOrders() {
  try {
    return storageGetJSON(PENDING_ORDERS_KEY, [])
  } catch {
    return []
  }
}

function savePendingOrders(orders) {
  try {
    storageSetJSON(PENDING_ORDERS_KEY, orders)
  } catch (error) {
    console.error('[cropOrderService] 保存待同步订单失败:', error)
  }
}

function addToPendingOrders(order) {
  const pending = getPendingOrders()
  const exists = pending.find(o => o.id === order.id)
  if (!exists) {
    pending.push(order)
    savePendingOrders(pending)
  }
}

function removeFromPendingOrders(orderId) {
  const pending = getPendingOrders()
  const filtered = pending.filter(o => o.id !== orderId)
  savePendingOrders(filtered)
}

/**
 * 将 snake_case 字段转换为 camelCase
 * 用于处理后端API返回的snake_case数据
 */
function toCamelCase(data) {
  if (data === null || data === undefined) return data
  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item))
  }
  if (typeof data === 'object') {
    const result = {}
    for (const [key, value] of Object.entries(data)) {
      // 跳过 instanceIds 字段（数组类型不需要转换）
      if (key === 'instanceIds') {
        result[key] = value
        continue
      }
      // 将 snake_case 转换为 camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = value
    }
    return result
  }
  return data
}

function toSnakeCase(data) {
  const snakeMap = {
    orderCode: 'order_code',
    orderName: 'order_name',
    orderType: 'order_type',
    cropName: 'crop_name',
    cropVariety: 'crop_variety',
    cropCategory: 'crop_category',
    plannedQuantity: 'planned_quantity',
    completedQuantity: 'completed_quantity',
    orderDate: 'order_date',
    expectedHarvestDate: 'expected_harvest_date',
    expectedCompletionDate: 'expected_completion_date',
    supplierName: 'supplier_name',
    unit: 'unit',
    remarks: 'remarks',
    status: 'status',
    createBy: 'create_by',
    updateTime: 'update_time',
    // 客户相关字段
    customerName: 'customer_name',
    customerPhone: 'customer_phone',
    deliveryAddress: 'delivery_address',
  }

  const result = {}
  for (const [key, value] of Object.entries(data)) {
    if (key === 'instanceIds') continue
    const snakeKey = snakeMap[key] || key
    result[snakeKey] = value
  }
  return result
}

export async function getOrders() {
  try {
    const data = await enhancedApiClient.get('/crop-orders')
    if (data && Array.isArray(data) && data.length > 0) {
      // 将后端返回的snake_case数据转换为camelCase
      const camelData = toCamelCase(data)
      saveLocalOrders(camelData)
      return camelData
    }
  } catch (error) {
    console.warn('[cropOrderService] API获取失败，降级到本地存储:', error)
  }

  const localOrders = getLocalOrders()
  if (localOrders.length > 0) {
    console.log('[cropOrderService] 使用localStorage缓存数据')
    return localOrders
  }

  return []
}

export async function getOrderDetail(id) {
  return getOrderById(id)
}

export async function getOrderById(id) {
  try {
    const data = await enhancedApiClient.get(`/crop-orders/${id}`)
    // 将后端返回的snake_case数据转换为camelCase
    return toCamelCase(data)
  } catch (error) {
    console.warn('[cropOrderService] 获取订单详情失败:', error)
    const localOrders = getLocalOrders()
    return localOrders.find(o => o.id === id)
  }
}

export async function createOrder(orderData) {
  const tempId = `ORD${Date.now()}`
  const now = new Date().toISOString()

  const localOrder = {
    ...orderData,
    id: tempId,
    createTime: now,
    updateTime: now,
  }

  try {
    const snakeData = toSnakeCase(orderData)
    const result = await enhancedApiClient.post('/crop-orders', snakeData)
    console.log('[cropOrderService] 创建订单成功:', result)
    // 将后端返回的snake_case数据转换为camelCase
    return toCamelCase(result)
  } catch (error) {
    console.warn('[cropOrderService] API创建失败，降级到localStorage:', error)
    const localOrders = getLocalOrders()
    localOrders.unshift(localOrder)
    saveLocalOrders(localOrders)
    addToPendingOrders(localOrder)
    console.log('[cropOrderService] 订单已保存到本地，等待同步')
    return localOrder
  }
}

export async function updateOrder(id, updates) {
  try {
    const snakeData = toSnakeCase(updates)
    await enhancedApiClient.put(`/crop-orders/${id}`, snakeData)
    return await getOrderById(id)
  } catch (error) {
    console.warn('[cropOrderService] API更新失败，降级到localStorage:', error)
    const localOrders = getLocalOrders()
    const index = localOrders.findIndex(o => o.id === id)

    if (index !== -1) {
      localOrders[index] = {
        ...localOrders[index],
        ...updates,
        updateTime: new Date().toISOString(),
      }
      saveLocalOrders(localOrders)
      return localOrders[index]
    }

    return null
  }
}

export async function deleteOrder(id) {
  try {
    await enhancedApiClient.delete(`/crop-orders/${id}`)
    return true
  } catch (error) {
    console.warn('[cropOrderService] API删除失败，标记本地删除:', error)
    const localOrders = getLocalOrders()
    const filtered = localOrders.filter(o => o.id !== id)
    saveLocalOrders(filtered)
    removeFromPendingOrders(id)
    return true
  }
}

export async function deleteOrders(ids) {
  for (const id of ids) {
    await deleteOrder(id)
  }
  return true
}

export async function linkInstances(orderId, instanceIds) {
  try {
    await enhancedApiClient.post(`/crop-orders/${orderId}/link-instances`, { instanceIds })
    return true
  } catch (error) {
    console.warn('[cropOrderService] 关联实例失败:', error)
    return false
  }
}

export async function unlinkInstances(orderId, instanceIds) {
  try {
    await enhancedApiClient.post(`/crop-orders/${orderId}/unlink-instances`, { instanceIds })
    return true
  } catch (error) {
    console.warn('[cropOrderService] 取消关联实例失败:', error)
    return false
  }
}

export async function updateOrderStatus(id, status) {
  try {
    await enhancedApiClient.put(`/crop-orders/${id}/status`, { status })
    return true
  } catch (error) {
    console.warn('[cropOrderService] 更新订单状态失败:', error)
    await updateOrder(id, { status })
    return true
  }
}

export async function resetOrders() {
  await enhancedApiClient.post('/crop-orders/reset')
}

export async function getOrderStats() {
  try {
    const backendStats = await enhancedApiClient.get('/crop-orders/stats/summary')
    return {
      total: backendStats.total ?? 0,
      inProgress: (backendStats.confirmed ?? 0) + (backendStats.processing ?? 0),
      completed: (backendStats.delivered ?? 0) + (backendStats.shipped ?? 0),
      thisMonth: backendStats.this_month ?? backendStats.thisMonth ?? 0,
    }
  } catch (error) {
    console.warn('[cropOrderService] 获取订单统计失败:', error)
    return null
  }
}

export async function syncPendingOrders() {
  const pending = getPendingOrders()
  if (pending.length === 0) {
    return { success: 0, failed: 0 }
  }

  console.log(`[cropOrderService] 开始同步 ${pending.length} 条待处理订单`)

  let success = 0
  let failed = 0

  for (const order of pending) {
    try {
      const snakeData = toSnakeCase(order)
      const result = await enhancedApiClient.post('/crop-orders', snakeData)
      removeFromPendingOrders(order.id)

      const localOrders = getLocalOrders()
      const index = localOrders.findIndex(o => o.id === order.id)
      if (index !== -1 && result && result.id !== order.id) {
        localOrders[index] = { ...localOrders[index], id: result.id }
        saveLocalOrders(localOrders)
      }

      success++
      console.log(`[cropOrderService] 同步订单成功: ${order.id} -> ${result?.id}`)
    } catch (error) {
      console.warn(`[cropOrderService] 同步订单失败: ${order.id}`, error)
      failed++
    }
  }

  console.log(`[cropOrderService] 同步完成: 成功 ${success}, 失败 ${failed}`)
  return { success, failed }
}

export function getLocalOrdersCount() {
  return getLocalOrders().length
}

export function getPendingOrdersCount() {
  return getPendingOrders().length
}
