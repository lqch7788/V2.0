/**
 * 仓库管理 API 服务
 * 对接后端 /api/warehouse
 */

import request from '../request';

/**
 * 仓库类型
 * @typedef {'seed_storage'|'seedling'|'cold_storage'|'normal'} WarehouseType
 */

/**
 * 仓库状态
 * @typedef {'active'|'inactive'|'maintenance'} WarehouseStatus
 */

/**
 * 仓库
 * @typedef {Object} Warehouse
 * @property {string} id - ID
 * @property {string} code - 仓库编码
 * @property {string} name - 仓库名称
 * @property {WarehouseType} type - 仓库类型
 * @property {string} location - 位置
 * @property {number} capacity - 容量
 * @property {number} currentStock - 当前库存
 * @property {string} manager - 管理员
 * @property {WarehouseStatus} status - 状态
 * @property {string} [description] - 描述
 * @property {string} createTime - 创建时间
 * @property {string} updateTime - 更新时间
 */

/**
 * 获取仓库列表
 * @param {Object} filters - 筛选条件
 * @returns {Promise<{data: Warehouse[], total: number}>}
 */
export async function getWarehouses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.name) params.append('name', filters.name);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/warehouse${query ? `?${query}` : ''}`);
}

/**
 * 获取仓库详情
 * @param {string} id - 仓库ID
 * @returns {Promise<Warehouse>}
 */
export async function getWarehouseById(id) {
  return request.get(`/warehouse/${id}`);
}

/**
 * 创建仓库
 * @param {Object} data - 仓库数据
 * @returns {Promise<Object>}
 */
export async function createWarehouse(data) {
  return request.post('/warehouse', data);
}

/**
 * 更新仓库
 * @param {string} id - 仓库ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateWarehouse(id, data) {
  return request.put(`/warehouse/${id}`, data);
}

/**
 * 删除仓库
 * @param {string} id - 仓库ID
 * @returns {Promise<boolean>}
 */
export async function deleteWarehouse(id) {
  try {
    await request.delete(`/warehouse/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取仓库库存统计
 * @param {string} id - 仓库ID
 * @returns {Promise<Object>}
 */
export async function getWarehouseStats(id) {
  return request.get(`/warehouse/${id}/stats`);
}

/**
 * 获取仓库库存明细
 * @param {string} id - 仓库ID
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Object>}
 */
export async function getWarehouseInventory(id, filters = {}) {
  const params = new URLSearchParams();
  if (filters.stockType) params.append('stockType', filters.stockType);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/warehouse/${id}/inventory${query ? `?${query}` : ''}`);
}

/**
 * 仓库盘点
 * @param {string} id - 仓库ID
 * @param {Object} data - 盘点数据
 * @returns {Promise<Object>}
 */
export async function inventoryCheck(id, data) {
  return request.post(`/warehouse/${id}/check`, data);
}

/**
 * 获取仓库列表（简单列表，用于下拉选择）
 * @returns {Promise<Warehouse[]>}
 */
export async function getWarehouseSimpleList() {
  return request.get('/warehouse/simple');
}
