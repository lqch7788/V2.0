/**
 * 物料编码分类 API Service
 * 与后端 /api/material-code-categories 通信
 *
 * 注意: enhancedApiClient 自动提取 response.data，不包 axios 包装
 *   - GET 返回: data[] (已拆 .data)
 *   - POST 返回: { id, code, name, ... } (已拆 .data)
 *   - PUT/DELETE 返回: { success, message } (response 本身, 无 .data 字段)
 */

import { enhancedApiClient } from '../lib/apiClient';

/**
 * @typedef {('big'|'mid'|'sub')} CategoryLevel
 * @typedef {Object} MaterialCodeCategory
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} nameEn
 * @property {string} parentCode
 * @property {CategoryLevel} level
 * @property {string} ruleType
 * @property {number} sortOrder
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @typedef {Object} CreateCategoryPayload
 * @property {string} code
 * @property {string} name
 * @property {string} [nameEn]
 * @property {string} [parentCode]
 * @property {CategoryLevel} level
 * @property {string} [ruleType]
 * @typedef {Object} UpdateCategoryPayload
 * @property {string} name
 * @property {string} [nameEn]
 */

// 获取全部分类（扁平行列表）
// ruleType: 'material' | 'supplier'，默认为 'material'
// enhancedApiClient 已自动解包 response.data，直接返回数组
/**
 * @param {string} [ruleType='material']
 * @returns {Promise<MaterialCodeCategory[]>}
 */
export async function fetchCategories(ruleType = 'material') {
  const data = await enhancedApiClient.get(`/material-code-categories?rule_type=${ruleType}`);
  return Array.isArray(data) ? data : [];
}

// 新增分类
// enhancedApiClient 已解包 response.data，返回 { id, code, name, ... }
/**
 * @param {CreateCategoryPayload} payload
 * @returns {Promise<MaterialCodeCategory>}
 */
export async function createCategory(payload) {
  const data = await enhancedApiClient.post('/material-code-categories', payload);
  if (data && data.id) {
    return data;
  }
  throw new Error(data?.error || '创建分类失败');
}

// 更新分类名称
// PUT 无 .data 字段，直接返回 { success, message }
/**
 * @param {string} code
 * @param {UpdateCategoryPayload} payload
 * @returns {Promise<void>}
 */
export async function updateCategory(code, payload) {
  const result = await enhancedApiClient.put(`/material-code-categories/${code}`, payload);
  if (!result || !result.success) {
    throw new Error(result?.error || '更新分类失败');
  }
}

// 删除分类（软删除，级联删除子分类）
// DELETE 无 .data 字段，直接返回 { success, message }
/**
 * @param {string} code
 * @returns {Promise<void>}
 */
export async function deleteCategory(code) {
  const result = await enhancedApiClient.delete(`/material-code-categories/${code}`);
  if (!result || !result.success) {
    throw new Error(result?.error || '删除分类失败');
  }
}
