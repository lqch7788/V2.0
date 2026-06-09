/**
 * 仓库物料 API 服务
 * 对接后端 /api/materials
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

/**
 * 获取物料列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getMaterials() {
  return await enhancedApiClient.get('/materials');
}

/**
 * 获取入库记录列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getInboundRecords() {
  return await enhancedApiClient.get('/materials/inbound');
}

/**
 * 创建入库记录
 * 降级策略：API → 离线队列
 */
export async function createInboundRecord(record) {
  return await enhancedApiClient.post('/materials/inbound', record);
}

/**
 * 更新入库记录
 * 降级策略：API → 离线队列
 */
export async function updateInboundRecord(id, updates) {
  return await enhancedApiClient.put(`/materials/inbound/${id}`, updates);
}

/**
 * 创建物料
 * 降级策略：API → 离线队列
 */
export async function createMaterial(material) {
  return await enhancedApiClient.post('/materials', material);
}

/**
 * 更新物料
 * 降级策略：API → 离线队列
 */
export async function updateMaterial(id, updates) {
  const result = await enhancedApiClient.put(`/materials/${id}`, updates);
  return result;
}

/**
 * 删除物料
 * 降级策略：API → 离线队列
 */
export async function deleteMaterial(id) {
  await enhancedApiClient.delete(`/materials/${id}`);
  return true;
}

/**
 * 删除入库记录
 * 降级策略：API → 离线队列
 */
export async function deleteInboundRecord(id) {
  await enhancedApiClient.delete(`/materials/inbound/${id}`);
  return true;
}
