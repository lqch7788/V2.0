/**
 * 订单管理共享工具函数
 *
 * 提取自 Order.vue 和 OrderTable.vue 的重复定义：
 * - getStatusLabel: 订单状态 → 中文标签
 * - getOrderTypeLabel: 订单类型 → 中文标签
 * - getStatusBadgeClass: 订单状态 → Badge 样式
 * - getOrderTypeBadgeClass: 订单类型 → Badge 样式
 *
 * 调用方：
 * - Order.vue (导出 + UI)
 * - OrderTable.vue (表格列渲染)
 */

import { CropOrderStatus } from '@/types/crop'

/**
 * 订单状态 → 中文标签
 * @param {{ status: string, completedQuantity?: number }} record
 * @returns {string}
 */
export function getOrderStatusLabel(record) {
  if (record.status === CropOrderStatus.COMPLETED) return '已完成'
  if (record.status === CropOrderStatus.CANCELLED) return '已取消'
  if ((record.completedQuantity || 0) > 0) return '进行中'
  return '已计划'
}

/**
 * 订单状态 → Badge class
 * @param {{ status: string, completedQuantity?: number }} record
 * @returns {string}
 */
export function getOrderStatusBadgeClass(record) {
  if (record.status === CropOrderStatus.COMPLETED) {
    return 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full'
  }
  if (record.status === CropOrderStatus.CANCELLED) {
    return 'px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full'
  }
  if ((record.completedQuantity || 0) > 0) {
    return 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'
  }
  return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
}

/**
 * 订单类型 → 中文标签
 * @param {string} type
 * @returns {string}
 */
export function getOrderTypeLabel(type) {
  switch (type) {
    case 'breeding': return '育种订单'
    case 'seedling': return '育苗订单'
    case 'production': return '生产订单'
    case 'research': return '研发订单'
    case 'other': return '其他'
    default: return type || ''
  }
}

/**
 * 订单类型 → Badge class
 * @param {string} type
 * @returns {string}
 */
export function getOrderTypeBadgeClass(type) {
  switch (type) {
    case 'breeding':
      return 'px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full'
    case 'seedling':
      return 'px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full'
    case 'production':
      return 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full'
    case 'research':
      return 'px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full'
    case 'other':
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}
