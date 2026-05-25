/**
 * 物料领用 API 服务
 * 对接后端 /api/materialRequest
 */

import request from '../request';

/**
 * 领料单物料明细
 * @typedef {Object} MaterialItem
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {string} category - 分类
 * @property {number} requestedQuantity - 申请数量
 * @property {number} stockQuantity - 库存数量
 * @property {number} unitPrice - 单价
 * @property {string} warehousePosition - 仓库货位
 * @property {string} [batchNo] - 批次号
 * @property {string} [remark] - 备注
 */

/**
 * 领料单记录
 * @typedef {Object} MaterialReceivingRecord
 * @property {number} id - ID
 * @property {string} code - 领料单号
 * @property {string} date - 领料日期
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} plantArea - 种植区域
 * @property {string} reviewer - 审核人
 * @property {string} productionBatchCode - 生产批次编号
 * @property {string} status - 状态
 * @property {string} statusClass - 状态样式类
 * @property {string} [rejectReason] - 驳回原因
 * @property {MaterialItem[]} materials - 物料明细
 */

/**
 * 领料出库物料明细
 * @typedef {Object} ExecuteMaterialItem
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} [batchNo] - 批次号
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {string} category - 分类
 * @property {number} requestedQuantity - 申请数量
 * @property {number} stockQuantity - 库存数量
 * @property {number} actualQuantity - 实际数量
 * @property {string} [remark] - 备注
 * @property {string} applicationCode - 来源申请单号
 * @property {number} [unitPrice] - 单价
 * @property {string} [warehousePosition] - 仓库货位
 */

/**
 * 领料出库单
 * @typedef {Object} MaterialExecuteRecord
 * @property {string|number} id - ID
 * @property {string} code - 出库单号
 * @property {string} date - 出库日期
 * @property {string} applicant - 申请人
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} reviewer - 审核人
 * @property {string} operator - 操作员
 * @property {string} productionBatchCode - 生产批次编号
 * @property {string[]} sourceApplicationCodes - 来源申请单号列表
 * @property {string} executeStatus - 执行状态
 * @property {string} executeStatusClass - 执行状态样式类
 * @property {ExecuteMaterialItem[]} materials - 物料明细
 */

/**
 * 获取领料单列表（申请Tab）
 * @param {Object} filters - 筛选条件
 * @returns {Promise<{data: MaterialReceivingRecord[], total: number}>}
 */
export async function getApplicationList(filters = {}) {
  const params = new URLSearchParams();
  if (filters.code) params.append('code', filters.code);
  if (filters.applicant) params.append('applicant', filters.applicant);
  if (filters.department) params.append('department', filters.department);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/materialRequest${query ? `?${query}` : ''}`);
}

/**
 * 获取领料单详情
 * @param {number} id - 领料单ID
 * @returns {Promise<MaterialReceivingRecord>}
 */
export async function getApplicationById(id) {
  return request.get(`/materialRequest/${id}`);
}

/**
 * 创建领料单
 * @param {Object} data - 领料单数据
 * @returns {Promise<Object>}
 */
export async function createApplication(data) {
  return request.post('/materialRequest', data);
}

/**
 * 更新领料单
 * @param {number} id - 领料单ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateApplication(id, data) {
  return request.put(`/materialRequest/${id}`, data);
}

/**
 * 删除领料单
 * @param {number} id - 领料单ID
 * @returns {Promise<boolean>}
 */
export async function deleteApplication(id) {
  try {
    await request.delete(`/materialRequest/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 审批领料单
 * @param {number} id - 领料单ID
 * @param {string} action - 审批操作（approve/reject）
 * @param {string} [rejectReason] - 驳回原因
 * @returns {Promise<boolean>}
 */
export async function approveApplication(id, action, rejectReason) {
  try {
    await request.post(`/materialRequest/${id}/${action}`, { rejectReason });
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取领料出库列表（执行Tab）
 * @param {Object} filters - 筛选条件
 * @returns {Promise<{data: MaterialExecuteRecord[], total: number}>}
 */
export async function getExecuteList(filters = {}) {
  const params = new URLSearchParams();
  if (filters.code) params.append('code', filters.code);
  if (filters.applicant) params.append('applicant', filters.applicant);
  if (filters.executeStatus) params.append('executeStatus', filters.executeStatus);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/materialRequest/execute${query ? `?${query}` : ''}`);
}

/**
 * 获取领料出库详情
 * @param {string|number} id - 出库单ID
 * @returns {Promise<MaterialExecuteRecord>}
 */
export async function getExecuteById(id) {
  return request.get(`/materialRequest/execute/${id}`);
}

/**
 * 创建领料出库单
 * @param {Object} data - 出库单数据
 * @returns {Promise<Object>}
 */
export async function createExecute(data) {
  return request.post('/materialRequest/execute', data);
}

/**
 * 更新领料出库单
 * @param {string|number} id - 出库单ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateExecute(id, data) {
  return request.put(`/materialRequest/execute/${id}`, data);
}

/**
 * 确认领料出库
 * @param {string|number} id - 出库单ID
 * @returns {Promise<boolean>}
 */
export async function confirmExecute(id) {
  try {
    await request.post(`/materialRequest/execute/${id}/confirm`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取领料统计（月度统计Tab）
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Object>}
 */
export async function getStatistics(filters = {}) {
  const params = new URLSearchParams();
  if (filters.year) params.append('year', filters.year);
  if (filters.month) params.append('month', filters.month);
  if (filters.department) params.append('department', filters.department);

  const query = params.toString();
  return request.get(`/materialRequest/statistics${query ? `?${query}` : ''}`);
}

/**
 * 获取物料统计（物料统计Tab）
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Object>}
 */
export async function getMaterialStatistics(filters = {}) {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.department) params.append('department', filters.department);

  const query = params.toString();
  return request.get(`/materialRequest/statistics/material${query ? `?${query}` : ''}`);
}

/**
 * 获取成本统计（成本Tab）
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Object>}
 */
export async function getCostStatistics(filters = {}) {
  const params = new URLSearchParams();
  if (filters.year) params.append('year', filters.year);
  if (filters.month) params.append('month', filters.month);
  if (filters.department) params.append('department', filters.department);
  if (filters.category) params.append('category', filters.category);

  const query = params.toString();
  return request.get(`/materialRequest/statistics/cost${query ? `?${query}` : ''}`);
}

/**
 * 批量删除领料单
 * @param {number[]} ids - ID列表
 * @returns {Promise<boolean>}
 */
export async function deleteApplicationsBatch(ids) {
  try {
    await request.delete(`/materialRequest/batch?ids=${ids.join(',')}`);
    return true;
  } catch {
    return false;
  }
}
