// @ts-nocheck - 类型模块预先缺失
/**
 * 供应商 API 服务
 * 对接后端 /api/suppliers
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

/**
 * @typedef {{id: number, name: string, code: string, contact?: string, phone?: string, status?: string}} Supplier
 */

/**
 * 初始化供应商数据
 * @returns {Promise<Supplier[]>}
 */
export async function initSuppliers() {
  return await enhancedApiClient.get('/suppliers/init');
}

/**
 * 获取所有供应商
 * @returns {Promise<Supplier[]>}
 */
export async function getAllSuppliers() {
  return await enhancedApiClient.get('/suppliers');
}

/**
 * 搜索供应商（按名称、编码、联系人搜索）
 * @param {string} keyword
 * @returns {Promise<Supplier[]>}
 */
export async function searchSuppliers(keyword) {
  return await enhancedApiClient.get(`/suppliers/search?keyword=${encodeURIComponent(keyword)}`);
}

/**
 * 根据ID获取供应商
 * @param {number} id
 * @returns {Promise<Supplier|undefined>}
 */
export async function getSupplierById(id) {
  return await enhancedApiClient.get(`/suppliers/${id}`);
}

/**
 * 获取合作中的供应商（用于下拉选择）
 * @returns {Promise<Array<{value: string, label: string, code: string}>>}
 */
export async function getActiveSuppliers() {
  return await enhancedApiClient.get('/suppliers/active');
}
