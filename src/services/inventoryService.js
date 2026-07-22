/**
 * 2026-07-22 V2.0 兼容 shim
 * V1.1 src/services/inventoryService.ts 已被 V2.0 重构到 api/inventory/inventoryService.js
 * 本文件作为兼容入口，保留 V1.1 路径的所有方法
 */
import * as inventoryApi from '@/api/inventory/inventoryService'
import { enhancedApiClient } from '@/lib/apiClient'

// 直接重新导出 V2.0 api/inventory/inventoryService.js 的所有方法
export const getInventoryList = inventoryApi.getInventoryList
export const getInventoryStats = inventoryApi.getInventoryStats
export const freezeInventory = inventoryApi.freezeInventory
export const unfreezeInventory = inventoryApi.unfreezeInventory
export const batchUnfreeze = inventoryApi.batchUnfreeze
export const getAvailableQuantity = inventoryApi.getAvailableQuantity
export const getInventoryDetail = inventoryApi.getInventoryDetail
export const getInventoryById = inventoryApi.getInventoryDetail
export const getInventoryHistory = inventoryApi.getInventoryHistory
export const getTraceRecords = inventoryApi.getTraceRecords
export const getDownstreamTrace = inventoryApi.getDownstreamTrace
export const deleteInventory = inventoryApi.deleteInventory
export const searchAvailableForOutbound = inventoryApi.searchAvailableForOutbound
export const getWarehouses = inventoryApi.getWarehouses

// V1.1 专用：getActiveOrders（V2.0 暂无此 API，从 crop-orders/active 端点直接调用）
export async function getActiveOrders() {
  try {
    const res = await enhancedApiClient.get('/crop-orders/active')
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res?.items)) return res.items
    return []
  } catch (e) {
    console.error('[inventoryService] getActiveOrders 失败:', e)
    return []
  }
}
