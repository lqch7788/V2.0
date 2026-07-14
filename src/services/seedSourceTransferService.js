/**
 * 种源调拨 / 退库服务（V1.1 → V2.0 完整迁移版）
 * V1.1 源文件：src/services/seedSourceTransferService.ts
 *
 * 完整API（V1.1 1:1 迁移）：
 * 1. listTransferableSources: 列出可调拨的库存（按 cropName/cropVariety 过滤）
 * 2. createFromTransfer: 从调拨创建新种源（create_new 模式）
 * 3. appendToExistingSeedSource: 调拨入库（append_existing 模式）
 * 4. returnToInventory: 退库到原作物库存（严格 1:1 关联）
 * 5. listReturnableInboundRecords: 列出可退库的入库记录
 */

import { enhancedApiClient } from '@/lib/apiClient'

/**
 * 列出可调拨的库存（V1.1 listTransferableSources）
 * @param {Object} filters
 * @param {string[]} filters.stockType - ['seed', 'seedling', 'product']
 * @param {string} filters.keyword
 * @param {string} filters.dateFrom
 * @param {string} filters.dateTo
 * @param {number} filters.limit
 * @param {number} filters.offset
 * @param {string} filters.cropName
 * @param {string} filters.cropVariety
 * @returns {Promise<Array>}
 */
export async function listTransferableSources(filters = {}) {
  const params = {}
  if (filters.stockType && filters.stockType.length > 0) {
    params.stockType = filters.stockType.join(',')
  }
  if (filters.keyword) params.keyword = filters.keyword
  if (filters.dateFrom) params.dateFrom = filters.dateFrom
  if (filters.dateTo) params.dateTo = filters.dateTo
  if (filters.limit) params.limit = filters.limit
  if (filters.offset) params.offset = filters.offset
  if (filters.cropName) params.cropName = filters.cropName
  if (filters.cropVariety) params.cropVariety = filters.cropVariety

  const res = await enhancedApiClient.get('/inventory/transferable-sources', { params })
  return res?.data || res?.items || res || []
}

/**
 * 从调拨创建新种源（V1.1 createFromTransfer）
 * @param {Array} items - 1-100 条
 * @param {Object} operator - { id, name }
 * @returns {Promise<Array<{newSeedSourceId, newSeedSourceCode, newInventoryStockId, transferOutTxId, transferInTxId}>>}
 */
export async function createFromTransfer(items, operator) {
  if (!items || items.length < 1 || items.length > 100) {
    throw new Error('调拨明细必须在 1-100 条之间')
  }
  return enhancedApiClient.post('/inventory/transfer-to-source', {
    items,
    operatorId: operator?.id,
    operatorName: operator?.name
  })
}

/**
 * 追加到现有种源（V1.1 appendToExistingSeedSource）
 * @param {Object} params
 * @param {string} params.targetSeedSourceId
 * @param {Array} params.items - [{sourceStockId, transferQuantity, unit, seedForm?}]
 * @param {Object} params.operator - { id, name }
 * @param {string} params.remarks
 * @returns {Promise<{appendedCount, newAvailableCount, newQuantity}>}
 */
export async function appendToExistingSeedSource({ targetSeedSourceId, items, operator, remarks }) {
  if (!targetSeedSourceId) throw new Error('缺少 targetSeedSourceId')
  if (!items || items.length < 1 || items.length > 100) {
    throw new Error('调拨明细必须在 1-100 条之间')
  }
  return enhancedApiClient.post('/seed-sources/append-from-inventory', {
    targetSeedSourceId,
    items,
    operatorId: operator?.id,
    operatorName: operator?.name,
    remarks
  })
}

/**
 * 退库到原作物库存（V1.1 returnToInventory）
 * @param {Object} params
 * @param {string} params.targetSeedSourceId
 * @param {Array} params.items - [{inboundRecordId, quantity, unit?}]
 * @param {Object} params.operator
 * @param {string} params.remarks
 * @returns {Promise<{returnedCount, newSourceRemaining, newSourceTotal}>}
 */
export async function returnToInventory({ targetSeedSourceId, items, operator, remarks }) {
  if (!targetSeedSourceId) throw new Error('缺少 targetSeedSourceId')
  if (!items || items.length < 1 || items.length > 100) {
    throw new Error('退库明细必须在 1-100 条之间')
  }
  return enhancedApiClient.post('/seed-sources/return-to-inventory', {
    targetSeedSourceId,
    items,
    operatorId: operator?.id,
    operatorName: operator?.name,
    remarks
  })
}

/**
 * 列出可退库的入库记录（V1.1 listReturnableInboundRecords）
 * @param {string} seedSourceId
 * @returns {Promise<Array<{id, sourceId, sourceCode, ...}>>}
 */
export async function listReturnableInboundRecords(seedSourceId) {
  if (!seedSourceId) throw new Error('缺少 seedSourceId')
  const res = await enhancedApiClient.get(`/seed-sources/${seedSourceId}/inbound-records`)
  return res?.data || res?.items || res || []
}

export const seedSourceTransferService = {
  listTransferableSources,
  createFromTransfer,
  appendToExistingSeedSource,
  returnToInventory,
  listReturnableInboundRecords
}
