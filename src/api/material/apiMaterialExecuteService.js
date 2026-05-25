/**
 * 领料出库 API 服务
 * 对接后端 /api/material-executes
 */

import request from '../request';

/**
 * 领料出库记录类型
 * @typedef {Object} MaterialExecuteRecord
 * @property {string} id - ID
 * @property {string} code - 出库单号
 * @property {string} date - 出库日期
 * @property {string} applicant - 申领人
 * @property {string} warehouse_location - 库存地点
 * @property {string} reviewer - 审核人
 * @property {string} operator - 操作人
 * @property {string} production_batch_code - 生产批次号
 * @property {string[]} source_application_codes - 来源领料单号列表
 * @property {string} execute_status - 执行状态
 * @property {string} execute_status_class - 执行状态样式类
 * @property {MaterialExecuteItem[]} materials - 物料明细
 * @property {string} create_by - 创建人
 * @property {string} create_time - 创建时间
 * @property {string} update_time - 更新时间
 */

/**
 * 领料出库物料明细类型
 * @typedef {Object} MaterialExecuteItem
 * @property {string} applicationCode - 来源领料单号
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {number} requestedQuantity - 申请数量
 * @property {number} actualQuantity - 实际出库数量
 * @property {number} stockQuantity - 实际库存
 * @property {number} unitPrice - 单价
 * @property {string} warehousePosition - 仓库货位
 * @property {string} remark - 备注
 */

/**
 * 获取领料出库列表
 * @param {Object} filters - 筛选条件
 * @returns {Promise<{data: MaterialExecuteRecord[], total: number}>}
 */
export async function getMaterialExecutes(filters = {}) {
  const params = new URLSearchParams();
  if (filters.code) params.append('code', filters.code);
  if (filters.applicant) params.append('applicant', filters.applicant);
  if (filters.warehouse_location) params.append('warehouse_location', filters.warehouse_location);
  if (filters.production_batch_code) params.append('production_batch_code', filters.production_batch_code);
  if (filters.execute_status) params.append('execute_status', filters.execute_status);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/material-executes${query ? `?${query}` : ''}`);
}

/**
 * 获取领料出库详情
 * @param {string} id - 出库记录ID
 * @returns {Promise<MaterialExecuteRecord>}
 */
export async function getMaterialExecuteById(id) {
  return request.get(`/material-executes/${id}`);
}

/**
 * 创建领料出库记录
 * @param {Object} data - 出库数据
 * @returns {Promise<{id: string, code: string}>}
 */
export async function createMaterialExecute(data) {
  return request.post('/material-executes', data);
}

/**
 * 更新领料出库记录
 * @param {string} id - 出库记录ID
 * @param {Object} data - 更新数据
 * @returns {Promise<{id: string}>}
 */
export async function updateMaterialExecute(id, data) {
  return request.put(`/material-executes/${id}`, data);
}

/**
 * 删除领料出库记录
 * @param {string} id - 出库记录ID
 * @returns {Promise<boolean>}
 */
export async function deleteMaterialExecute(id) {
  try {
    await request.delete(`/material-executes/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 批量删除领料出库记录
 * @param {string[]} ids - ID列表
 * @returns {Promise<boolean>}
 */
export async function deleteMaterialExecutesBatch(ids) {
  try {
    await Promise.all(ids.map(id => request.delete(`/material-executes/${id}`)));
    return true;
  } catch {
    return false;
  }
}
