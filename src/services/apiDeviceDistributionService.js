/**
 * 设备分配 API 服务
 * 对接后端 /api/device-distributions
 * iAGS DeviceDistribution 集成 — 预留端口
 */
import { enhancedApiClient } from '../lib/apiClient';

/**
 * @typedef {Object} DeviceDistribution
 * @property {number} id
 * @property {string} oid
 * @property {string} deviceName
 * @property {string|null} deviceCode
 * @property {string|null} siteName
 * @property {string|null} areaName
 * @property {string|null} deviceType
 * @property {string|null} motorName
 * @property {number} sortOrder
 * @property {string|null} allowRuntime
 * @property {string|null} restTime
 * @property {string|null} initialStatus
 * @property {string|null} circuit
 * @property {string|null} slaveDevices
 * @property {string|null} startTime
 * @property {number} showCurve
 * @property {string|null} specs
 * @property {string|null} remarks
 * @property {string} status
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 */

export const apiDeviceDistributionService = {
  /** 获取设备分配列表
   * @param {Record<string, string>} [filters]
   * @returns {Promise<{success: boolean, data: any[]}>}
   */
  getList: async (filters) => {
    if (!enhancedApiClient) return { success: true, data: [] };
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const response = await enhancedApiClient.get(`/api/device-distributions${query}`);
    return response;
  },

  /** 创建分配记录
   * @param {Record<string, unknown>} data
   * @returns {Promise<{success: boolean, data: any}>}
   */
  create: async (data) => {
    const response = await enhancedApiClient.post('/api/device-distributions', data);
    return response;
  },

  /** 更新分配记录
   * @param {string} oid
   * @param {Record<string, unknown>} data
   * @returns {Promise<{success: boolean, data: any}>}
   */
  update: async (oid, data) => {
    const response = await enhancedApiClient.put(`/api/device-distributions/${oid}`, data);
    return response;
  },

  /** 删除分配记录
   * @param {string} oid
   * @returns {Promise<{success: boolean}>}
   */
  delete: async (oid) => {
    const response = await enhancedApiClient.delete(`/api/device-distributions/${oid}`);
    return response;
  },
};
