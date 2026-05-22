/**
 * 作物品种库服务
 * 提供品种的 CRUD 和搜索功能
 * 数据来源：真实后端 API
 */

import { enhancedApiClient } from '../lib/apiClient.js';
import { produceCategories, getProduceTypesByCategory } from '../data/produceCodeRule.js';

// localStorage 存储键（仅用于本地缓存）
const STORAGE_KEY = 'crop_varieties';
const STORAGE_VERSION_KEY = 'crop_varieties_version';
const CURRENT_VERSION = 2;

// 品种库初始化状态
let isInitialized = false;

// 内存缓存
let cachedVarieties = [];

// ============================================
// 工具函数
// ============================================

/**
 * 将 snake_case 转换为 camelCase
 */
function snakeToCamel(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj !== 'object') return obj;

  const result = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    let value = obj[key];
    // alias 字段从 JSON 字符串解析为数组
    if (key === 'alias' && typeof value === 'string') {
      try { value = JSON.parse(value); } catch { value = []; }
    }
    result[camelKey] = snakeToCamel(value);
  }
  return result;
}

/**
 * 将 camelCase 转换为 snake_case
 */
function camelToSnake(obj) {
  const result = {};
  for (const key in obj) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeKey] = obj[key];
  }
  return result;
}

// ============================================
// 存储操作（仅用于离线缓存）
// ============================================

/**
 * 获取本地存储的品种数据
 * V2.0要求：不使用mock数据，返回空数组表示无数据
 */
function getStoredVarieties() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const version = localStorage.getItem(STORAGE_VERSION_KEY);

  if (stored) {
    try {
      let varieties = JSON.parse(stored);

      // 检测版本并迁移数据
      if (!version || parseInt(version, 10) < CURRENT_VERSION) {
        varieties = migrateDataToV2(varieties);
        saveVarieties(varieties);
        localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
      }

      return varieties;
    } catch (e) {
      console.error('解析品种数据失败:', e);
      return [];
    }
  }
  return [];
}

/**
 * 保存品种数据到本地存储
 */
function saveVarieties(varieties) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(varieties));
}

/**
 * 迁移旧版本数据到新版本
 * v1 -> v2: 编码从9位扩展到11位（添加 detailVarietyCode）
 */
function migrateDataToV2(varieties) {
  return varieties.map(v => {
    // 如果编码已经是11位，跳过
    if (v.cropCode && v.cropCode.length === 11) {
      return v;
    }
    // 旧编码格式：类别(2) + 类型(2) + 品种(2) + 子品种(3) = 9位
    // 新编码格式：类别(2) + 类型(2) + 品种(2) + 子品种(3) + 详细品种(2) = 11位
    if (v.cropCode && v.cropCode.length === 9) {
      const newCropCode = v.cropCode + '00';
      return {
        ...v,
        cropCode: newCropCode,
        detailVarietyCode: '00'
      };
    }
    return v;
  });
}

// ============================================
// 默认品种数据（从 produceCodeRule 导入）
// ============================================

/**
 * 从 produceCodeRule 导入默认品种数据
 * 编码结构：类别(2) + 类型(2) + 品种(2) + 子品种1(3) + 详细品种(2) = 11位
 */
function importDefaultVarieties() {
  const varieties = [];
  let index = 1;

  for (const category of produceCategories) {
    const types = getProduceTypesByCategory(category.code);

    for (const type of types) {
      for (const sub of type.subCategories) {
        // 检查是否有子品种配置
        if (sub.subVarieties && sub.subVarieties.length > 0) {
          // 有子品种1配置
          for (const subVar of sub.subVarieties) {
            const sub1Code = subVar.code.padStart(3, '0');
            // 编码结构：类别(2) + 类型(2) + 品种(2) + 子品种1(3) + 详细品种(2) = 11位
            const cropCode = `${category.code}${type.code}${sub.code}${sub1Code}00`;
            varieties.push({
              id: `CV${String(index).padStart(4, '0')}`,
              cropCode,
              categoryCode: category.code,
              categoryName: category.name,
              typeCode: type.code,
              typeName: type.name,
              varietyCode: sub.code,
              varietyName: sub.name,
              subVariety1Code: sub1Code,
              subVariety1Name: subVar.name,
              detailVarietyCode: '00',
              status: 'active',
              createTime: new Date().toLocaleString('zh-CN'),
              updateTime: new Date().toLocaleString('zh-CN')
            });
            index++;
          }
        } else {
          // 没有子品种的基础品种
          // 编码结构：类别(2) + 类型(2) + 品种(2) + 子品种1(3) + 详细品种(2) = 11位
          const cropCode = `${category.code}${type.code}${sub.code}00000`;
          varieties.push({
            id: `CV${String(index).padStart(4, '0')}`,
            cropCode,
            categoryCode: category.code,
            categoryName: category.name,
            typeCode: type.code,
            typeName: type.name,
            varietyCode: sub.code,
            varietyName: sub.name,
            detailVarietyCode: '00',
            status: 'active',
            createTime: new Date().toLocaleString('zh-CN'),
            updateTime: new Date().toLocaleString('zh-CN')
          });
          index++;
        }
      }
    }
  }

  return varieties;
}

// ============================================
// API 交互
// ============================================

/**
 * 从后端 API 获取所有品种
 */
async function fetchVarietiesFromAPI() {
  try {
    const data = await enhancedApiClient.get('/crop-varieties');
    return data.map(item => snakeToCamel(item));
  } catch (error) {
    console.error('[cropVarietyService] 从API获取品种失败:', error);
    throw error;
  }
}

/**
 * 从后端 API 创建品种
 */
async function createVarietyAPI(data) {
  try {
    const snakeData = camelToSnake(data);
    const result = await enhancedApiClient.post('/crop-varieties', snakeData);
    return snakeToCamel(result);
  } catch (error) {
    console.error('[cropVarietyService] 创建品种失败:', error);
    throw error;
  }
}

/**
 * 从后端 API 更新品种
 */
async function updateVarietyAPI(id, data) {
  try {
    const snakeData = camelToSnake(data);
    const result = await enhancedApiClient.put(`/crop-varieties/${id}`, snakeData);
    return snakeToCamel(result);
  } catch (error) {
    console.error('[cropVarietyService] 更新品种失败:', error);
    throw error;
  }
}

/**
 * 从后端 API 删除品种
 */
async function deleteVarietyAPI(id) {
  try {
    await enhancedApiClient.delete(`/crop-varieties/${id}`);
    return true;
  } catch (error) {
    console.error('[cropVarietyService] 删除品种失败:', error);
    throw error;
  }
}

// ============================================
// 服务方法
// ============================================

/**
 * 初始化品种库（仅从 API 获取，不使用本地缓存）
 * V2.0要求：不使用mock数据或降级数据
 */
export async function initVarieties() {
  if (isInitialized && cachedVarieties.length > 0) {
    return cachedVarieties;
  }

  // 从 API 获取
  const apiData = await fetchVarietiesFromAPI();
  cachedVarieties = apiData;
  saveVarieties(cachedVarieties);
  isInitialized = true;
  return cachedVarieties;
}

/**
 * 获取所有品种（同步版本，使用缓存）
 */
export function getAllVarieties() {
  if (cachedVarieties.length > 0) {
    return cachedVarieties;
  }
  // 如果缓存为空，尝试从本地存储加载
  const storedData = getStoredVarieties();
  cachedVarieties = storedData;
  return cachedVarieties;
}

/**
 * 获取品种选项（用于下拉选择）
 */
export function getVarietyOptions() {
  const varieties = getAllVarieties();
  return varieties
    .filter(v => v.status === 'active')
    .map(v => ({
      value: v.cropCode,
      label: v.detailVarietyName || v.subVariety1Name || v.varietyName,
      category: v.categoryName,
      categoryCode: v.categoryCode,
      typeName: v.typeName,
      typeCode: v.typeCode,
      varietyCode: v.varietyCode,
      subVariety1Name: v.subVariety1Name,
      subVariety1Code: v.subVariety1Code,
      detailVarietyCode: v.detailVarietyCode,
      detailVarietyName: v.detailVarietyName,
      alias: v.alias,
      fullPath: `${v.categoryName} > ${v.typeName} > ${v.varietyName}${v.subVariety1Name ? ` > ${v.subVariety1Name}` : ''}${v.detailVarietyName ? ` > ${v.detailVarietyName}` : ''}`
    }));
}

/**
 * 获取所有类别选项
 */
export function getCategoryOptions() {
  return produceCategories.map(c => ({
    value: c.code,
    label: c.name
  }));
}

/**
 * 根据类别获取类型选项
 */
export function getTypeOptionsByCategory(categoryCode) {
  const types = getProduceTypesByCategory(categoryCode);
  return types.map(t => ({
    value: t.code,
    label: t.name
  }));
}

/**
 * 根据类别和类型获取品种选项
 */
export function getVarietyOptionsByType(categoryCode, typeCode) {
  const types = getProduceTypesByCategory(categoryCode);
  const type = types.find(t => t.code === typeCode);
  if (!type) return [];

  return type.subCategories.map(s => ({
    value: s.code,
    label: s.name
  }));
}

/**
 * 根据类别、类型和品种获取子品种1选项
 */
export function getSubVariety1Options(categoryCode, typeCode, varietyCode) {
  const types = getProduceTypesByCategory(categoryCode);
  const type = types.find(t => t.code === typeCode);
  if (!type) return [];

  const variety = type.subCategories.find(v => v.code === varietyCode);
  if (!variety || !variety.subVarieties) return [];

  return variety.subVarieties.map(s => ({
    value: s.code,
    label: s.name
  }));
}

/**
 * 生成新的作物编码
 * @param {string} categoryCode - 类别代码
 * @param {string} typeCode - 类型代码
 * @param {string} varietyCode - 品种代码
 * @param {string} subVariety1Code - 子品种1代码（可选，3位）
 * @param {string} detailVarietyCode - 详细品种代码（可选，2位）
 * @returns {string} 新的11位作物编码
 */
export function generateCropCode(categoryCode, typeCode, varietyCode, subVariety1Code, detailVarietyCode) {
  const sub1 = subVariety1Code ? subVariety1Code.padStart(3, '0') : '000';
  const detail = detailVarietyCode ? detailVarietyCode.padStart(2, '0') : '00';
  return `${categoryCode}${typeCode}${varietyCode}${sub1}${detail}`;
}

/**
 * 获取指定子品种1下的最大详细品种代码
 */
export function getMaxDetailVarietyCode(categoryCode, typeCode, varietyCode, subVariety1Code) {
  const varieties = getAllVarieties();
  let maxCode = 0;

  for (const v of varieties) {
    if (v.categoryCode === categoryCode &&
        v.typeCode === typeCode &&
        v.varietyCode === varietyCode &&
        v.subVariety1Code === (subVariety1Code || '')) {
      const code = parseInt(v.detailVarietyCode || '0', 10);
      if (code > maxCode) {
        maxCode = code;
      }
    }
  }

  const nextCode = maxCode + 1;
  return String(nextCode).padStart(2, '0');
}

/**
 * 新增品种（调用真实API）
 */
export async function addVariety(input) {
  // 生成新编码
  const cropCode = generateCropCode(
    input.categoryCode,
    input.typeCode,
    input.varietyCode,
    input.subVariety1Code,
    input.detailVarietyCode
  );

  const now = new Date().toLocaleString('zh-CN');
  const newVariety = {
    ...input,
    id: `CV${Date.now()}`,
    cropCode,
    createTime: now,
    updateTime: now
  };

  try {
    // 调用API创建
    const created = await createVarietyAPI(newVariety);
    // 更新本地缓存
    cachedVarieties = [...cachedVarieties, created];
    return created;
  } catch (error) {
    // API失败时使用本地存储
    cachedVarieties.push(newVariety);
    saveVarieties(cachedVarieties);
    return newVariety;
  }
}

/**
 * 更新品种（调用真实API）
 */
export async function updateVariety(id, updates) {
  try {
    // 调用API更新
    const updated = await updateVarietyAPI(id, updates);
    // 更新本地缓存
    const index = cachedVarieties.findIndex(v => v.id === id);
    if (index !== -1) {
      cachedVarieties[index] = {
        ...cachedVarieties[index],
        ...updates,
        updateTime: new Date().toLocaleString('zh-CN')
      };
    }
    return updated;
  } catch (error) {
    // API失败时使用本地存储
    const index = cachedVarieties.findIndex(v => v.id === id);
    if (index !== -1) {
      cachedVarieties[index] = {
        ...cachedVarieties[index],
        ...updates,
        updateTime: new Date().toLocaleString('zh-CN')
      };
      saveVarieties(cachedVarieties);
    }
    return cachedVarieties[index];
  }
}

/**
 * 删除品种（调用真实API）
 */
export async function deleteVariety(id) {
  try {
    // 调用API删除
    await deleteVarietyAPI(id);
    // 更新本地缓存
    cachedVarieties = cachedVarieties.filter(v => v.id !== id);
    return true;
  } catch (error) {
    // API失败时使用本地存储
    cachedVarieties = cachedVarieties.filter(v => v.id !== id);
    saveVarieties(cachedVarieties);
    return true;
  }
}

/**
 * 搜索品种
 */
export function searchVarieties(keyword) {
  if (!keyword.trim()) {
    return [];
  }

  const varieties = getAllVarieties();
  const lowerKeyword = keyword.toLowerCase().trim();
  const results = [];

  for (const variety of varieties) {
    if (variety.cropCode.toLowerCase().includes(lowerKeyword)) {
      results.push({ variety, matchField: 'cropCode', matchText: variety.cropCode });
      continue;
    }

    if (variety.varietyName.toLowerCase().includes(lowerKeyword)) {
      results.push({ variety, matchField: 'varietyName', matchText: variety.varietyName });
      continue;
    }

    if (variety.subVariety1Name && variety.subVariety1Name.toLowerCase().includes(lowerKeyword)) {
      results.push({ variety, matchField: 'subVariety1Name', matchText: variety.subVariety1Name });
      continue;
    }

    if (variety.alias && variety.alias.some(a => a.toLowerCase().includes(lowerKeyword))) {
      const matchedAlias = variety.alias.find(a => a.toLowerCase().includes(lowerKeyword));
      results.push({ variety, matchField: 'alias', matchText: matchedAlias });
    }
  }

  return results;
}

/**
 * 获取品种统计信息
 */
export function getVarietyStats() {
  const varieties = getAllVarieties();
  const stats = {
    total: varieties.length,
    active: 0,
    inactive: 0,
    byCategory: {}
  };

  for (const v of varieties) {
    if (v.status === 'active') stats.active++;
    else stats.inactive++;

    if (!stats.byCategory[v.categoryName]) {
      stats.byCategory[v.categoryName] = 0;
    }
    stats.byCategory[v.categoryName]++;
  }

  return stats;
}

/**
 * 强制刷新品种数据
 */
export async function refreshVarieties() {
  try {
    const apiData = await fetchVarietiesFromAPI();
    cachedVarieties = apiData;
    saveVarieties(cachedVarieties);
    return cachedVarieties;
  } catch (error) {
    console.warn('[cropVarietyService] 刷新失败，使用缓存:', error);
    return cachedVarieties;
  }
}
