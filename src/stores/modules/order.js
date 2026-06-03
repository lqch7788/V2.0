/**
 * 订单状态联动 Store (V2.0 Pinia 版)
 *
 * 对齐 V1.1 useOrderStore.ts (zustand) 行为：
 * - 维护订单状态的客户端状态更新（用于审批联动、跨模块状态共享）
 * - V1.1 中由 useApprovalBusinessDetail.ts 在审批回调时调用 updateOrderStatus
 * - V1.1 OrderPage.tsx 不直接使用本 Store，但保留以确保跨模块状态联动一致性
 *
 * 注意：本 Store 仅做客户端状态记录，不直接调用后端 API；
 * 实际状态持久化仍由后端完成（通过 orderService.updateOrderStatus）。
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 订单状态类型（与 V1.1 useOrderStore.ts:7-12 一致）
 * 可选值：'draft' | 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'rejected'
 */

export const useOrderStore = defineStore('order', () => {
  // 状态更新映射表：orderId -> { orderId, status, updatedAt, updatedBy? }
  const statusUpdates = ref({})

  /**
   * 更新订单状态（对齐 V1.1 useOrderStore.ts:50-60）
   * @param {string} orderId
   * @param {string} status OrderStatus
   * @param {string} [updatedBy]
   */
  const updateOrderStatus = (orderId, status, updatedBy) => {
    const update = {
      orderId,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy,
    }
    statusUpdates.value = {
      ...statusUpdates.value,
      [orderId]: update,
    }
  }

  /**
   * 获取合并了状态更新的订单（对齐 V1.1 useOrderStore.ts:62-65）
   * @template {{ id: string, status: string }} T
   * @param {T} order
   * @returns {T}
   */
  const getOrderWithStatus = (order) => {
    const update = statusUpdates.value[order.id]
    return update ? { ...order, status: update.status } : order
  }

  /**
   * 获取所有状态更新
   * @returns {Record<string, { orderId: string, status: string, updatedAt: string, updatedBy?: string }>}
   */
  const getStatusUpdates = () => statusUpdates.value

  /**
   * 清空所有状态更新
   */
  const clearAllUpdates = () => {
    statusUpdates.value = {}
  }

  return {
    statusUpdates,
    updateOrderStatus,
    getOrderWithStatus,
    getStatusUpdates,
    clearAllUpdates,
  }
})
