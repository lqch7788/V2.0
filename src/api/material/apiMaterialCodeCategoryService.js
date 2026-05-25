/**
 * 物料编码分类 API 服务
 * 对接后端 /api/materialCodeCategories
 */

import request from '../request';

/**
 * 物料大类
 * @typedef {Object} BigCategory
 * @property {string} code - 编码
 * @property {string} name - 名称
 */

/**
 * 物料中类
 * @typedef {Object} MidCategory
 * @property {string} code - 编码
 * @property {string} name - 名称
 */

/**
 * 物料小类
 * @typedef {Object} SubCategory
 * @property {string} code - 编码
 * @property {string} name - 名称
 * @property {string} prefix - 前缀
 */

/**
 * 获取物料大类列表
 * @returns {Promise<BigCategory[]>}
 */
export async function getBigCategories() {
  return request.get('/materialCodeCategories/big');
}

/**
 * 获取物料中类列表
 * @param {string} bigCode - 大类编码
 * @returns {Promise<MidCategory[]>}
 */
export async function getMidCategories(bigCode) {
  return request.get(`/materialCodeCategories/${bigCode}/mid`);
}

/**
 * 获取物料小类列表
 * @param {string} bigCode - 大类编码
 * @param {string} midCode - 中类编码
 * @returns {Promise<SubCategory[]>}
 */
export async function getSubCategories(bigCode, midCode) {
  return request.get(`/materialCodeCategories/${bigCode}/${midCode}/sub`);
}

/**
 * 生成物料编码
 * @param {Object} params - 编码参数
 * @param {string} params.bigCategory - 大类编码
 * @param {string} params.midCategory - 中类编码
 * @param {string} params.subCategory - 小类编码
 * @returns {Promise<string>}
 */
export async function generateMaterialCode(params) {
  return request.post('/materialCodeCategories/generate', params);
}

/**
 * 验证物料编码是否已存在
 * @param {string} code - 物料编码
 * @returns {Promise<boolean>}
 */
export async function validateMaterialCode(code) {
  try {
    await request.get(`/materialCodeCategories/validate/${code}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取物料分类配置
 * @returns {Promise<Object>}
 */
export async function getCategoryConfig() {
  return request.get('/materialCodeCategories/config');
}

/**
 * 创建物料分类
 * @param {Object} data - 分类数据
 * @returns {Promise<Object>}
 */
export async function createCategory(data) {
  return request.post('/materialCodeCategories', data);
}

/**
 * 更新物料分类
 * @param {string} code - 分类编码
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateCategory(code, data) {
  return request.put(`/materialCodeCategories/${code}`, data);
}

/**
 * 删除物料分类
 * @param {string} code - 分类编码
 * @returns {Promise<boolean>}
 */
export async function deleteCategory(code) {
  try {
    await request.delete(`/materialCodeCategories/${code}`);
    return true;
  } catch {
    return false;
  }
}
