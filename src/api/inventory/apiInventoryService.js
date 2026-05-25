/**
 * 库存 API 服务
 * 对接后端 /api/inventory
 */

import request from '../request';
import { get, post, put, del } from '../request';

/**
 * 库存记录类型
 * @typedef {Object} InventoryRecord
 * @property {string} id - ID
 * @property {string} instance_id - 库存实例ID
 * @property {string} stock_type - 库存类型
 * @property {string} business_id - 业务ID
 * @property {string} business_type - 业务类型
 * @property {string} crop_name - 作物名称
 * @property {string} variety_name - 品种名称
 * @property {number} current_quantity - 当前数量
 * @property {number} frozen_quantity - 冻结数量
 * @property {number} available_quantity - 可用数量
 * @property {string} unit - 单位
 * @property {string} warehouse_id - 仓库ID
 * @property {string} warehouse_name - 仓库名称
 * @property {string} inbound_date - 入库日期
 * @property {string} status - 状态
 */

/**
 * 库存查询参数
 * @typedef {Object} InventoryFilters
 * @property {string} [crop_name] - 作物名称
 * @property {string} [stock_type] - 库存类型
 * @property {string} [status] - 状态
 * @property {number} [page] - 页码
 * @property {number} [limit] - 每页数量
 */

/**
 * 获取库存列表
 * @param {InventoryFilters} filters - 查询参数
 * @returns {Promise<{data: InventoryRecord[], total: number}>}
 */
export async function getInventoryList(filters = {}) {
  const params = new URLSearchParams();
  if (filters.crop_name) params.append('crop_name', filters.crop_name);
  if (filters.stock_type) params.append('stock_type', filters.stock_type);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/inventory${query ? `?${query}` : ''}`);
}

/**
 * 按作物名称聚合查询库存
 * @param {string} [cropName] - 作物名称
 * @returns {Promise<any>}
 */
export async function getInventoryByCropName(cropName) {
  const params = new URLSearchParams();
  if (cropName) params.append('crop_name', cropName);

  const query = params.toString();
  return request.get(`/inventory/aggregate/by-crop${query ? `?${query}` : ''}`);
}

/**
 * 获取库存详情
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<InventoryRecord|null>}
 */
export async function getInventoryById(instanceId) {
  try {
    return await request.get(`/inventory/${instanceId}`);
  } catch {
    return null;
  }
}

/**
 * 获取库存详情（含流水）
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<{stock: InventoryRecord, transactions: any[]}>}
 */
export async function getInventoryDetail(instanceId) {
  return request.get(`/inventory/${instanceId}/detail`);
}

/**
 * 创建库存记录（采收入库）
 * @param {Object} data - 入库数据
 * @returns {Promise<any>}
 */
export async function createInventory(data) {
  return request.post('/inventory', data);
}

/**
 * 更新库存记录
 * @param {string} instanceId - 库存实例ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<boolean>}
 */
export async function updateInventory(instanceId, updates) {
  try {
    await request.put(`/inventory/${instanceId}`, updates);
    return true;
  } catch {
    return false;
  }
}

/**
 * 删除库存记录
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<boolean>}
 */
export async function deleteInventory(instanceId) {
  try {
    await request.delete(`/inventory/${instanceId}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 批量删除库存记录
 * @param {string[]} ids - ID列表
 * @returns {Promise<boolean>}
 */
export async function deleteInventoryBatch(ids) {
  try {
    await request.delete(`/inventory/batch?ids=${ids.join(',')}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 出库操作
 * @param {Object} data - 出库数据
 * @returns {Promise<any>}
 */
export async function outbound(data) {
  return request.post('/inventory/outbound', data);
}

/**
 * 冻结库存
 * @param {Object} data - 冻结数据
 * @returns {Promise<any>}
 */
export async function freezeInventory(data) {
  return request.post('/inventory/freeze', data);
}

/**
 * 解冻库存
 * @param {string} freezeId - 冻结记录ID
 * @returns {Promise<any>}
 */
export async function unfreezeInventory(freezeId) {
  return request.post(`/inventory/freeze/${freezeId}/unfreeze`);
}

/**
 * 获取库存统计
 * @param {Object} filters - 筛选条件
 * @returns {Promise<any>}
 */
export async function getInventoryStats(filters = {}) {
  return request.get('/inventory/stats', filters);
}
