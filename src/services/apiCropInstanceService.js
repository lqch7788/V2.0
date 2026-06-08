/**
 * 作物实例数据 API 服务
 * 对接后端 /api/crop-instances
 * 核心功能：管理作物实例的全生命周期
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';
import { mapFieldsToCamelCase } from './fieldMapping';

/**
 * 初始化数据
 * 降级策略：API → IndexedDB 缓存
 * @returns {Promise<Array>}
 */
export async function initInstances() {
  return await enhancedApiClient.get('/crop-instances/init');
}

/**
 * 获取所有作物实例
 * 降级策略：API → IndexedDB 缓存
 * @returns {Promise<Array>}
 */
export async function getInstances() {
  const data = await enhancedApiClient.get('/crop-instances');
  // 将后端返回的 snake_case 字段转换为前端使用的 camelCase
  return mapFieldsToCamelCase(data);
}

/**
 * 根据ID获取单个作物实例
 * 降级策略：API → IndexedDB 缓存
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
export async function getInstanceById(id) {
  const data = await enhancedApiClient.get(`/crop-instances/${id}`);
  // 将后端返回的 snake_case 字段转换为前端使用的 camelCase
  return data ? mapFieldsToCamelCase(data) : undefined;
}

/**
 * 根据ID数组获取多个作物实例
 * 降级策略：API → IndexedDB 缓存
 * @param {string[]} ids
 * @returns {Promise<Array>}
 */
export async function getInstancesByIds(ids) {
  const data = await enhancedApiClient.get(`/crop-instances/batch?ids=${ids.join(',')}`);
  // 将后端返回的 snake_case 字段转换为前端使用的 camelCase
  return mapFieldsToCamelCase(data);
}

/**
 * 根据订单ID获取关联的作物实例
 * 降级策略：API → IndexedDB 缓存
 * @param {string} orderId
 * @returns {Promise<Array>}
 */
export async function getInstancesByOrderId(orderId) {
  const data = await enhancedApiClient.get(`/crop-instances/order/${orderId}`);
  // 将后端返回的 snake_case 字段转换为前端使用的 camelCase
  return mapFieldsToCamelCase(data);
}

/**
 * 创建作物实例
 * 降级策略：API → 离线队列
 * @param {Object} cropInfo
 * @param {string} sourceOrigin
 * @param {number} initialQuantity
 * @param {Object} [options]
 * @returns {Promise<Object>}
 */
export async function createInstance(cropInfo, sourceOrigin, initialQuantity, options) {
  return await enhancedApiClient.post('/crop-instances', {
    cropInfo,
    sourceOrigin,
    initialQuantity,
    options
  });
}

/**
 * 更新作物实例
 * 降级策略：API → 离线队列
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object|null>}
 */
export async function updateInstance(id, updates) {
  const result = await enhancedApiClient.put(`/crop-instances/${id}`, updates);
  return result ? { ...updates, id } : null;
}

/**
 * 删除作物实例
 * 降级策略：API → 离线队列
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteInstance(id) {
  await enhancedApiClient.delete(`/crop-instances/${id}`);
  return true;
}

/**
 * 批量删除作物实例
 * 降级策略：API → 离线队列
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteInstances(ids) {
  await enhancedApiClient.delete(`/crop-instances/batch?ids=${ids.join(',')}`);
  return true;
}

/**
 * 更新实例数量
 * 降级策略：API → 离线队列
 * @param {string} id
 * @param {('seedling'|'plant'|'harvest')} type
 * @param {number} quantity
 * @returns {Promise<boolean>}
 */
export async function updateQuantity(id, type, quantity) {
  await enhancedApiClient.post(`/crop-instances/${id}/update-quantity`, { type, quantity });
  return true;
}

/**
 * 更新实例状态
 * 降级策略：API → 离线队列
 * @param {string} id
 * @param {string} status
 * @returns {Promise<boolean>}
 */
export async function updateStatus(id, status) {
  await enhancedApiClient.put(`/crop-instances/${id}/status`, { status });
  return true;
}

/**
 * 获取实例的完整溯源链
 * 降级策略：API → IndexedDB 缓存
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getTraceChain(id) {
  try {
    const data = await enhancedApiClient.get(`/crop-instances/${id}/trace-chain`);
    // 将后端返回的 snake_case 字段转换为前端使用的 camelCase
    return mapFieldsToCamelCase(data);
  } catch {
    return null;
  }
}

/**
 * 重置数据到默认状态（仅调用后端）
 * @returns {Promise<void>}
 */
export async function resetInstances() {
  await enhancedApiClient.post('/crop-instances/reset');
}
