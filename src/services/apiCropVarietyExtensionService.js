/**
 * 作物品种库扩展 API 服务
 * 对接后端 API 存储用户新增的类型、品种，子品种
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

const API_BASE = '/crop-varieties/extensions';

// ==================== 类别扩展 ====================

/**
 * 获取所有类别扩展
 */
export async function getAllCategoryExtensions() {
  return await enhancedApiClient.get(`${API_BASE}/categories`);
}

/**
 * 创建类别扩展
 */
export async function addCategoryExtension(categoryCode, categoryName) {
  return await enhancedApiClient.post(`${API_BASE}/categories`, {
    category_code: categoryCode,
    category_name: categoryName
  });
}

/**
 * 删除类别扩展
 */
export async function deleteCategoryExtension(id) {
  await enhancedApiClient.delete(`${API_BASE}/categories/${id}`);
  return true;
}

/**
 * 更新类别扩展
 */
export async function updateCategoryExtension(id, categoryName, sortOrder, status) {
  await enhancedApiClient.put(`${API_BASE}/categories/${id}`, {
    category_name: categoryName,
    sort_order: sortOrder,
    status
  });
  return true;
}

// ==================== 类型扩展 ====================

/**
 * 获取所有类型扩展
 * 降级策略：API → IndexedDB 缓存
 */
export async function getAllTypeExtensions() {
  return await enhancedApiClient.get(`${API_BASE}/types`);
}

/**
 * 获取指定类别的类型扩展
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTypeExtensionsByCategory(categoryCode) {
  return await enhancedApiClient.get(`${API_BASE}/types/${categoryCode}`);
}

/**
 * 创建类型扩展
 * 降级策略：API → 离线队列
 */
export async function addTypeExtension(categoryCode, categoryName, typeCode, typeName) {
  return await enhancedApiClient.post(`${API_BASE}/types`, {
    category_code: categoryCode,
    category_name: categoryName,
    type_code: typeCode,
    type_name: typeName
  });
}

/**
 * 删除类型扩展
 * 降级策略：API → 离线队列
 */
export async function deleteTypeExtension(id) {
  await enhancedApiClient.delete(`${API_BASE}/types/${id}`);
  return true;
}

/**
 * 更新类型扩展
 * 降级策略：API → 离线队列
 */
export async function updateTypeExtension(id, typeName, sortOrder, status) {
  await enhancedApiClient.put(`${API_BASE}/types/${id}`, {
    type_name: typeName,
    sort_order: sortOrder,
    status
  });
  return true;
}

// ==================== 品种扩展 ====================

/**
 * 获取所有品种扩展
 * 降级策略：API → IndexedDB 缓存
 */
export async function getAllVarietyExtensions() {
  return await enhancedApiClient.get(`${API_BASE}/varieties`);
}

/**
 * 获取指定类型的品种扩展
 * 降级策略：API → IndexedDB 缓存
 */
export async function getVarietyExtensionsByType(categoryCode, typeCode) {
  return await enhancedApiClient.get(`${API_BASE}/varieties/${categoryCode}/${typeCode}`);
}

/**
 * 创建品种扩展
 * 降级策略：API → 离线队列
 */
export async function addVarietyExtension(categoryCode, typeCode, varietyCode, varietyName) {
  return await enhancedApiClient.post(`${API_BASE}/varieties`, {
    category_code: categoryCode,
    type_code: typeCode,
    variety_code: varietyCode,
    variety_name: varietyName
  });
}

/**
 * 删除品种扩展
 * 降级策略：API → 离线队列
 */
export async function deleteVarietyExtension(id) {
  await enhancedApiClient.delete(`${API_BASE}/varieties/${id}`);
  return true;
}

/**
 * 更新品种扩展
 * 降级策略：API → 离线队列
 */
export async function updateVarietyExtension(id, varietyName, sortOrder, status) {
  await enhancedApiClient.put(`${API_BASE}/varieties/${id}`, {
    variety_name: varietyName,
    sort_order: sortOrder,
    status
  });
  return true;
}

// ==================== 子品种1扩展 ====================

/**
 * 获取所有子品种1扩展
 * 降级策略：API → IndexedDB 缓存
 */
export async function getAllSubVariety1Extensions() {
  return await enhancedApiClient.get(`${API_BASE}/subvariety1`);
}

/**
 * 获取指定品种的子品种1扩展
 * 降级策略：API → IndexedDB 缓存
 */
export async function getSubVariety1ExtensionsByVariety(categoryCode, typeCode, varietyCode) {
  return await enhancedApiClient.get(`${API_BASE}/subvariety1/${categoryCode}/${typeCode}/${varietyCode}`);
}

/**
 * 创建子品种1扩展
 * 降级策略：API → 离线队列
 */
export async function addSubVariety1Extension(categoryCode, typeCode, varietyCode, subVariety1Code, subVariety1Name) {
  return await enhancedApiClient.post(`${API_BASE}/subvariety1`, {
    category_code: categoryCode,
    type_code: typeCode,
    variety_code: varietyCode,
    sub_variety1_code: subVariety1Code,
    sub_variety1_name: subVariety1Name
  });
}

/**
 * 删除子品种1扩展
 * 降级策略：API → 离线队列
 */
export async function deleteSubVariety1Extension(id) {
  await enhancedApiClient.delete(`${API_BASE}/subvariety1/${id}`);
  return true;
}

/**
 * 更新子品种1扩展
 * 降级策略：API → 离线队列
 */
export async function updateSubVariety1Extension(id, subVariety1Name, sortOrder, status) {
  await enhancedApiClient.put(`${API_BASE}/subvariety1/${id}`, {
    sub_variety1_name: subVariety1Name,
    sort_order: sortOrder,
    status
  });
  return true;
}
