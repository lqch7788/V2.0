/**
 * 库存 API 服务 (V2.1 架构 - 已简化)
 * 对接后端 /api/inventory
 * 数据流：API → 组件 (无缓存层)
 */

import { enhancedApiClient } from '../lib/apiClient';

/**
 * @typedef {Object} InventoryRecord
 * @property {string} id
 * @property {string} product_code
 * @property {string} crop_name
 * @property {string} variety
 * @property {number} quantity
 * @property {string} unit
 * @property {string} grade
 * @property {string} warehouse_name
 * @property {string} storage_location
 * @property {string} harvest_date
 * @property {string} storage_date
 * @property {string} batch_code
 * @property {string} greenhouse_name
 * @property {string} planting_mode
 * @property {string} stock_type
 * @property {string} status
 * @property {string} create_time
 * @property {string} update_time
 *
 * @typedef {Object} InventoryFilters
 * @property {string} [crop_name]
 * @property {('seed'|'seedling'|'product')} [stock_type]
 * @property {string} [status]
 * @property {number} [page]
 * @property {number} [limit]
 *
 * @typedef {Object} InventoryAggregation
 * @property {string} crop_name
 * @property {InventoryRecord[]} seed
 * @property {InventoryRecord[]} seedling
 * @property {InventoryRecord[]} product
 * @property {number} total
 * @property {{seed: number, seedling: number, product: number}} totalQuantity
 */

/**
 * 获取库存列表
 * @param {InventoryFilters} [filters]
 * @returns {Promise<InventoryRecord[]>}
 */
export async function getInventoryList(filters) {
  const params = {};
  if (filters?.crop_name) params.crop_name = filters.crop_name;
  if (filters?.stock_type) params.stock_type = filters.stock_type;
  if (filters?.status) params.status = filters.status;
  if (filters?.page) params.page = String(filters.page);
  if (filters?.limit) params.limit = String(filters.limit);

  const query = new URLSearchParams(params).toString();
  return await enhancedApiClient.get(`/inventory${query ? `?${query}` : ''}`);
}

/**
 * 按作物名称聚合查询库存
 * @param {string} [cropName]
 * @returns {Promise<InventoryAggregation>}
 */
export async function getInventoryByCropName(cropName) {
  const params = {};
  if (cropName) params.crop_name = cropName;

  const query = new URLSearchParams(params).toString();
  return await enhancedApiClient.get(`/inventory/aggregate/by-crop${query ? `?${query}` : ''}`);
}

/**
 * 获取库存详情
 * @param {string} id
 * @returns {Promise<InventoryRecord|null>}
 */
export async function getInventoryById(id) {
  try {
    return await enhancedApiClient.get(`/inventory/${id}`);
  } catch {
    return null;
  }
}

/**
 * 创建库存记录
 * @param {Partial<InventoryRecord>} data
 * @returns {Promise<InventoryRecord|null>}
 */
export async function createInventory(data) {
  try {
    const response = await enhancedApiClient.post('/inventory', data);
    return response;
  } catch {
    return null;
  }
}

/**
 * 更新库存记录
 * @param {string} id
 * @param {Partial<InventoryRecord>} updates
 * @returns {Promise<boolean>}
 */
export async function updateInventory(id, updates) {
  try {
    await enhancedApiClient.put(`/inventory/${id}`, updates);
    return true;
  } catch {
    return false;
  }
}

/**
 * 删除库存记录
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteInventory(id) {
  try {
    await enhancedApiClient.delete(`/inventory/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 批量删除库存记录
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteInventoryBatch(ids) {
  try {
    await enhancedApiClient.delete(`/inventory/batch?ids=${ids.join(',')}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 行级采收入库（统一入库端点 - 对齐 V1.1 UnifiedRowHarvestInboundModal）
 * POST /api/inventory/inbound-from-source
 * @param {Object} input
 * @param {string} input.stockType - 库存类型 'seed' | 'seedling' | 'product'
 * @param {string} input.sourceModule - 来源模块 'seedling' | 'planting'
 * @param {string} input.sourceId - 来源记录 ID
 * @param {string} input.harvestDate - 采收日期 YYYY-MM-DD
 * @param {string} input.warehouseId - 仓库 ID
 * @param {string} input.warehouseName - 仓库名称
 * @param {string[]} input.harvesterIds - 采收员 IDs
 * @param {string} input.operator - 操作员（审核员）
 * @param {string} input.remarks - 备注
 * @param {string} input.unit - 单位
 * @param {boolean} input.isSupplementary - 是否补录
 * @param {string} input.supplementaryReason - 补录原因
 * @param {Array} input.products - 产品明细 [{ cropCode, cropName, harvestQuantity, unit, grade, sourceForm, productForm }]
 */
export async function submitUnifiedInbound(input) {
  try {
    const result = await enhancedApiClient.post('/inventory/inbound-from-source', input);
    return result;
  } catch (error) {
    console.error('submitUnifiedInbound failed:', error);
    throw error;
  }
}

/**
 * 获取仓库列表
 * GET /api/inventory/warehouses
 */
export async function getWarehouses() {
  try {
    return await enhancedApiClient.get('/inventory/warehouses');
  } catch {
    return [];
  }
}

/**
 * 获取采收历史记录
 * GET /api/inventory/harvest-records?sourceModule=...&sourceId=...
 */
export async function getHarvestRecords(sourceModule, sourceId) {
  try {
    return await enhancedApiClient.get(`/inventory/harvest-records?sourceModule=${sourceModule}&sourceId=${sourceId}`);
  } catch {
    return [];
  }
}
