/**
 * 物料退库 API 服务
 * 对接后端 /api/material-returns
 */

import request from '../request';

/**
 * 退库物料明细
 * @typedef {Object} MaterialItem
 * @property {string} sourceApplicationCode - 来源领料单号
 * @property {string} materialCode - 物料编码
 * @property {string} category - 物料分类
 * @property {string} materialName - 物料名称
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {number} quantity - 领料数量
 * @property {number} returnQuantity - 本次退料数量
 * @property {number} unitPrice - 单价
 * @property {string} warehousePosition - 仓库货位
 * @property {string} reason - 退料原因
 * @property {string} remark - 备注
 */

/**
 * 退库记录
 * @typedef {Object} ReturnRecord
 * @property {number} id - ID
 * @property {string} code - 退库单号
 * @property {string} date - 退库日期
 * @property {string} type - 类型
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} status - 状态
 * @property {string} statusClass - 状态样式类
 * @property {string} remark - 备注
 * @property {string} operator - 操作人
 * @property {string} reviewer - 审核人
 * @property {string} reviewDate - 审核日期
 * @property {string} rejectReason - 驳回原因
 * @property {MaterialItem[]} materials - 物料明细
 */

/**
 * 获取退库记录列表
 * @param {Object} filters - 筛选条件
 * @returns {Promise<{data: ReturnRecord[], total: number}>}
 */
export async function getReturnRecords(filters = {}) {
  const params = new URLSearchParams();
  if (filters.code) params.append('code', filters.code);
  if (filters.material) params.append('material', filters.material);
  if (filters.warehouse) params.append('warehouse', filters.warehouse);
  if (filters.applicant) params.append('applicant', filters.applicant);
  if (filters.status) params.append('status', filters.status);
  if (filters.department) params.append('department', filters.department);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/material-returns${query ? `?${query}` : ''}`);
}

/**
 * 获取退库记录详情
 * @param {number} id - 退库记录ID
 * @returns {Promise<ReturnRecord>}
 */
export async function getReturnRecordById(id) {
  return request.get(`/material-returns/${id}`);
}

/**
 * 创建退库记录
 * @param {Object} data - 退库数据
 * @returns {Promise<Object>}
 */
export async function createReturnRecord(data) {
  return request.post('/material-returns', data);
}

/**
 * 更新退库记录
 * @param {number} id - 退库记录ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateReturnRecord(id, data) {
  return request.put(`/material-returns/${id}`, data);
}

/**
 * 删除退库记录
 * @param {number} id - 退库记录ID
 * @returns {Promise<boolean>}
 */
export async function deleteReturnRecord(id) {
  try {
    await request.delete(`/material-returns/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 审批退库记录
 * @param {number} id - 退库记录ID
 * @param {string} action -审批操作（approve/reject）
 * @param {string} [rejectReason] - 驳回原因
 * @returns {Promise<boolean>}
 */
export async function approveReturnRecord(id, action, rejectReason) {
  try {
    await request.post(`/material-returns/${id}/${action}`, { rejectReason });
    return true;
  } catch {
    return false;
  }
}

/**
 * 作废退库记录
 * @param {number} id - 退库记录ID
 * @returns {Promise<boolean>}
 */
export async function voidReturnRecord(id) {
  try {
    await request.post(`/material-returns/${id}/void`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 批量删除退库记录
 * @param {number[]} ids - ID列表
 * @returns {Promise<boolean>}
 */
export async function deleteReturnRecordsBatch(ids) {
  try {
    await request.delete(`/material-returns/batch?ids=${ids.join(',')}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取退库统计
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Object>}
 */
export async function getReturnStats(filters = {}) {
  return request.get('/material-returns/stats', filters);
}
