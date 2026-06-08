/**
 * 生产退料 API 服务
 * 对接后端 /api/material-returns
 */
import { enhancedApiClient } from '../lib/apiClient';

/**
 * @typedef {Object} MaterialReturnItem
 * @property {string} sourceApplicationCode
 * @property {string} materialCode
 * @property {string} category
 * @property {string} materialName
 * @property {string} spec
 * @property {string} unit
 * @property {number} returnQuantity
 * @property {number} unitPrice
 * @property {string} warehousePosition
 * @property {string} reason
 * @property {string} remark
 *
 * @typedef {Object} MaterialReturnRecord
 * @property {string|number} id
 * @property {string} code
 * @property {string} date
 * @property {string} type
 * @property {string} applicant
 * @property {string} department
 * @property {string} warehouseLocation
 * @property {string} status
 * @property {string} statusClass
 * @property {string} [remark]
 * @property {string} [operator]
 * @property {string} [reviewer]
 * @property {string} [reviewDate]
 * @property {string} [rejectReason]
 * @property {MaterialReturnItem[]} materials
 * @property {string} [createBy]
 * @property {string} [createTime]
 * @property {string} [updateTime]
 */

/** 获取退料列表
 * @param {Record<string, string>} [params]
 * @returns {Promise<MaterialReturnRecord[]>}
 */
export async function getMaterialReturns(params) {
  let url = '/material-returns';
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }
  const resp = await enhancedApiClient.get(url);
  if (resp?.data) return resp.data;
  if (resp?.success && resp?.data) return resp.data;
  return Array.isArray(resp) ? resp : [];
}

/** 创建退料记录
 * @param {Omit<MaterialReturnRecord, 'id'>} data
 * @returns {Promise<MaterialReturnRecord | null>}
 */
export async function createMaterialReturn(data) {
  const result = await enhancedApiClient.post('/material-returns', data);
  return result?.data || result;
}

/** 更新退料记录
 * @param {string|number} id
 * @param {Partial<MaterialReturnRecord>} updates
 * @returns {Promise<boolean>}
 */
export async function updateMaterialReturn(id, updates) {
  await enhancedApiClient.put(`/material-returns/${id}`, updates);
  return true;
}

/** 删除退料记录
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function deleteMaterialReturn(id) {
  await enhancedApiClient.delete(`/material-returns/${id}`);
  return true;
}

/** 批量删除退料记录
 * @param {(string|number)[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteMaterialReturns(ids) {
  const results = await Promise.all(ids.map(id => deleteMaterialReturn(id)));
  return results.every(Boolean);
}
