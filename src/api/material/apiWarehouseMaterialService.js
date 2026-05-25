/**
 * 仓库物料 API 服务
 * 对接后端 /api/materials
 */

import request from '../request';

/**
 * 物料类型
 * @typedef {Object} Material
 * @property {number} id - ID
 * @property {string} code - 物料编码
 * @property {string} name - 物料名称
 * @property {string} category - 分类
 * @property {string} specification - 规格
 * @property {string} unit - 单位
 * @property {number} quantity - 数量
 * @property {number} minStock - 最低库存
 * @property {number} maxStock - 最高库存
 * @property {string} price - 单价
 * @property {string} supplier - 供应商
 * @property {string} location - 存放位置
 * @property {string} barcode - 条码
 * @property {string} batchNo - 批次号
 * @property {string} productionDate - 生产日期
 * @property {string} expiryDate - 过期日期
 */

/**
 * 入库物料明细
 * @typedef {Object} InboundMaterial
 * @property {number} id - ID
 * @property {string} code - 物料编码
 * @property {string} name - 物料名称
 * @property {string} category - 分类
 * @property {string} bigCategory - 大类
 * @property {string} midCategory - 中类
 * @property {string} subCategory - 小类
 * @property {string} specification - 规格
 * @property {string} barcode - 条码
 * @property {string} unit - 单位
 * @property {number} quantity - 数量
 * @property {string} price - 单价
 * @property {string} location - 存放位置
 * @property {string} batchNo - 批次号
 * @property {string} productionDate - 生产日期
 * @property {string} expiryDate - 过期日期
 * @property {string} remarks - 备注
 */

/**
 * 入库记录
 * @typedef {Object} InboundRecord
 * @property {number} id - ID
 * @property {string} code - 入库单号
 * @property {string} inboundDate - 入库日期
 * @property {string} supplier - 供应商
 * @property {string} operator - 操作员
 * @property {string} status - 状态
 * @property {InboundMaterial[]} materials - 物料明细
 * @property {string} [voidedDate] - 作废日期
 */

/**
 * 获取物料列表
 * @returns {Promise<Material[]>}
 */
export async function getMaterials() {
  return request.get('/materials');
}

/**
 * 获取物料详情
 * @param {number} id - 物料ID
 * @returns {Promise<Material>}
 */
export async function getMaterialById(id) {
  return request.get(`/materials/${id}`);
}

/**
 * 创建物料
 * @param {Object} data - 物料数据
 * @returns {Promise<Object>}
 */
export async function createMaterial(data) {
  return request.post('/materials', data);
}

/**
 * 更新物料
 * @param {number} id - 物料ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateMaterial(id, data) {
  return request.put(`/materials/${id}`, data);
}

/**
 * 删除物料
 * @param {number} id - 物料ID
 * @returns {Promise<boolean>}
 */
export async function deleteMaterial(id) {
  try {
    await request.delete(`/materials/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取入库记录列表
 * @param {Object} filters - 筛选条件
 * @returns {Promise<{data: InboundRecord[], total: number}>}
 */
export async function getInboundRecords(filters = {}) {
  const params = new URLSearchParams();
  if (filters.code) params.append('code', filters.code);
  if (filters.supplier) params.append('supplier', filters.supplier);
  if (filters.status) params.append('status', filters.status);
  if (filters.materialName) params.append('materialName', filters.materialName);
  if (filters.materialCode) params.append('materialCode', filters.materialCode);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/materials/inbound${query ? `?${query}` : ''}`);
}

/**
 * 获取入库记录详情
 * @param {number} id - 入库记录ID
 * @returns {Promise<InboundRecord>}
 */
export async function getInboundRecordById(id) {
  return request.get(`/materials/inbound/${id}`);
}

/**
 * 创建入库记录
 * @param {Object} data - 入库数据
 * @returns {Promise<Object>}
 */
export async function createInboundRecord(data) {
  return request.post('/materials/inbound', data);
}

/**
 * 更新入库记录
 * @param {number} id - 入库记录ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateInboundRecord(id, data) {
  return request.put(`/materials/inbound/${id}`, data);
}

/**
 * 作废入库记录
 * @param {number} id - 入库记录ID
 * @returns {Promise<boolean>}
 */
export async function voidInboundRecord(id) {
  try {
    await request.post(`/materials/inbound/${id}/void`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 批量删除物料
 * @param {number[]} ids - ID列表
 * @returns {Promise<boolean>}
 */
export async function deleteMaterialsBatch(ids) {
  try {
    await request.delete(`/materials/batch?ids=${ids.join(',')}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取物料分类统计
 * @returns {Promise<Object>}
 */
export async function getMaterialCategoryStats() {
  return request.get('/materials/stats/category');
}

/**
 * 搜索物料
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Material[]>}
 */
export async function searchMaterials(keyword) {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  const query = params.toString();
  return request.get(`/materials/search${query ? `?${query}` : ''}`);
}
