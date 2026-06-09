/**
 * 入职管理 API 服务
 * 对接后端 /api/onboarding
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

/**
 * 获取入职记录列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getOnboardingRecords(filters, pagination) {
  const params = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.keyword) params.keyword = filters.keyword;
  if (pagination?.page) params.page = String(pagination.page);
  if (pagination?.limit) params.limit = String(pagination.limit);

  const paramsStr = new URLSearchParams(params).toString();
  const url = paramsStr ? `/onboarding?${paramsStr}` : '/onboarding';
  return await enhancedApiClient.get(url);
}

/**
 * 获取单个入职记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getOnboardingById(id) {
  return await enhancedApiClient.get(`/onboarding/${id}`);
}

/**
 * 创建入职记录
 * 降级策略：API → 离线队列
 */
export async function createOnboardingRecord(record) {
  return await enhancedApiClient.post('/onboarding', record);
}

/**
 * 更新入职记录
 * 降级策略：API → 离线队列
 */
export async function updateOnboardingRecord(id, updates) {
  const result = await enhancedApiClient.put(`/onboarding/${id}`, updates);
  return result ? { ...updates, id } : null;
}

/**
 * 删除入职记录
 * 降级策略：API → 离线队列
 */
export async function deleteOnboardingRecord(id) {
  await enhancedApiClient.delete(`/onboarding/${id}`);
  return true;
}

/**
 * 批量删除入职记录
 * 降级策略：API → 离线队列
 */
export async function deleteOnboardingRecords(ids) {
  await enhancedApiClient.post('/onboarding/batch-delete', { ids });
  return true;
}

/**
 * 更新入职状态
 * 降级策略：API → 离线队列
 */
export async function updateOnboardingStatus(id, params) {
  await enhancedApiClient.post(`/onboarding/${id}/status`, params);
  return true;
}
