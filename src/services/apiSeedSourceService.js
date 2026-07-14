/**
 * 种源数据 API 服务
 * 对接后端 /api/seed-sources
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';
import { SourceType } from '../types/crop';

/**
 * @typedef {Object} BackendSeedSource
 * @property {string} id
 * @property {string} seedCode
 * @property {string} sourceName
 * @property {string} sourceType
 * @property {string} sourceOrigin
 * @property {string} cropCategory
 * @property {string} typeName
 * @property {string} varietyName
 * @property {string} cropName
 * @property {string} cropVariety
 * @property {string} cropCode
 * @property {string} supplierId
 * @property {string} supplierName
 * @property {string} purchaseDate
 * @property {number} quantity
 * @property {string} unit
 * @property {number} unitPrice
 * @property {number} totalAmount
 * @property {number} availableCount
 * @property {number} initialCount
 * @property {string} pictures
 * @property {number} usedQuantity
 * @property {number} remainingQuantity
 * @property {string} status
 * @property {string} remarks
 * @property {string} productionPlanCode
 * @property {number} printCount
 * @property {string} createBy
 * @property {string} createTime
 * @property {string} updateTime
 * @property {string} [propagationType]
 * @property {string} [propagationStatus]
 * @property {string} [propagationMethod]
 * @property {string} [parentMaleId]
 * @property {string} [parentMaleCode]
 * @property {string} [parentFemaleId]
 * @property {string} [parentFemaleCode]
 * @property {string} [motherPlantId]
 * @property {string} [motherPlantCode]
 * @property {string} [linkedPlantingId]
 * @property {string} [linkedPlantingCode]
 * @property {string} [propagationStartDate]
 * @property {string} [expectedHarvestDate]
 * @property {string} [actualHarvestDate]
 * @property {string} [breedingLocation]
 * @property {string} [targetTraits]
 * @property {string} [generation]
 * @property {*} [key] - 其他任意字段
 */

/**
 * 将后端返回的字段名映射到前端 SeedSource 类型
 * @param {BackendSeedSource|BackendSeedSource[]} data
 * @returns {Object|Object[]}
 */
function transformSeedSourceFromBackend(data) {
  if (Array.isArray(data)) {
    return data.map(item => transformSingleSeedSource(item));
  }
  return transformSingleSeedSource(data);
}

function transformSingleSeedSource(item) {
  let pictures = [];
  if (item.pictures) {
    try {
      pictures = JSON.parse(item.pictures);
    } catch {
      pictures = [];
    }
  }

  let sourceType = SourceType.SEED;
  if (item.sourceType === 'seedling') {
    sourceType = SourceType.SEEDLING;
  } else if (item.sourceType === 'cutting') {
    sourceType = SourceType.CUTTING;
  } else if (item.sourceType === 'grafting') {
    sourceType = SourceType.GRAFTING;
  } else if (item.sourceType === 'tissue_culture') {
    sourceType = SourceType.TISSUE_CULTURE;
  }

  let status = 'sufficient';
  if (item.status === 'low') {
    status = 'low';
  } else if (item.status === 'depleted') {
    status = 'depleted';
  }

  return {
    id: item.id,
    seedCode: item.seedCode || '',
    sourceType: sourceType,
    sourceOrigin: item.sourceOrigin || 'external_purchase',
    cropCategory: item.cropCategory || '',
    typeName: item.typeName || '',
    varietyName: item.varietyName || '',
    cropName: item.cropName || '',
    cropVariety: item.cropVariety || '',
    cropCode: item.cropCode || '',
    supplierId: item.supplierId || '',
    supplierName: item.supplierName || '',
    purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
    quantity: item.quantity || 0,
    unit: item.unit || '',
    unitPrice: item.unitPrice || 0,
    totalAmount: item.totalAmount || 0,
    initialCount: item.initialCount || 0,
    availableCount: item.availableCount || 0,
    pictures: pictures,
    remarks: item.remarks || '',
    status: status,
    printCount: item.printCount || 0,
    createBy: item.createBy || '',
    createTime: item.createTime ? item.createTime.split('T')[0] : '',
    updateTime: item.updateTime || '',
    // 关联生产计划字段
    productionPlanId: item.productionPlanId || '',
    productionPlanCode: item.productionPlanCode || '',
    // 繁殖途径字段
    propagationType: item.propagationType || 'external',
    propagationStatus: item.propagationStatus,
    propagationMethod: item.propagationMethod,
    parentMaleId: item.parentMaleId,
    parentMaleCode: item.parentMaleCode,
    parentFemaleId: item.parentFemaleId,
    parentFemaleCode: item.parentFemaleCode,
    motherPlantId: item.motherPlantId,
    motherPlantCode: item.motherPlantCode,
    linkedPlantingId: item.linkedPlantingId,
    linkedPlantingCode: item.linkedPlantingCode,
    propagationStartDate: item.propagationStartDate,
    expectedHarvestDate: item.expectedHarvestDate,
    actualHarvestDate: item.actualHarvestDate,
    breedingLocation: item.breedingLocation,
    targetTraits: item.targetTraits,
    generation: item.generation,
  };
}

/**
 * 获取所有种源
 * 降级策略：API → IndexedDB 缓存
 * @returns {Promise<Object[]>}
 */
export async function getSeedSources() {
  const data = await enhancedApiClient.get('/seed-sources');
  return transformSeedSourceFromBackend(data);
}

/**
 * 根据ID获取单个种源
 * 降级策略：API → IndexedDB 缓存
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
export async function getSeedSourceById(id) {
  const data = await enhancedApiClient.get(`/seed-sources/${id}`);
  return transformSeedSourceFromBackend(data);
}

/**
 * 根据ID数组获取多个种源
 * 降级策略：API → IndexedDB 缓存
 * @param {string[]} ids
 * @returns {Promise<Object[]>}
 */
export async function getSeedSourcesByIds(ids) {
  const data = await enhancedApiClient.get(`/seed-sources/batch?ids=${ids.join(',')}`);
  return transformSeedSourceFromBackend(data);
}

/**
 * 创建种源
 * 降级策略：API → 离线队列
 *
 * 注意：前端使用 camelCase，后端期望 snake_case，需要转换
 * @param {Object} source
 * @returns {Promise<Object>}
 */
export async function addSeedSource(source) {
  // 转换为后端期望的 snake_case 格式
  const backendData = {
    source_code: source.seedCode,
    source_name: source.supplierName,
    source_type: source.sourceType,
    source_origin: source.sourceOrigin,
    production_plan_code: source.productionPlanCode || '',
    crop_category: source.cropCategory,
    type_name: source.typeName,
    variety_name: source.varietyName,
    crop_name: source.cropName,
    crop_variety: source.cropVariety,
    crop_code: source.cropCode,
    supplier_id: source.supplierId,
    supplier_name: source.supplierName,
    purchase_date: source.purchaseDate,
    quantity: source.quantity,
    unit: source.unit,
    purchase_price: source.unitPrice,
    total_amount: source.totalAmount,
    remaining_quantity: source.quantity,
    used_quantity: source.usedQuantity || 0,
    status: source.status,
    remarks: source.remarks || '',
    create_by: source.createBy,
  };

  const result = await enhancedApiClient.post('/seed-sources', backendData);
  return { ...source, id: result.id };
}

/**
 * 更新种源
 * 降级策略：API → 离线队列
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object|null>}
 */
export async function updateSeedSource(id, updates) {
  // 转换为后端期望的 snake_case 格式
  const backendUpdates = {};

  if (updates.seedCode !== undefined) backendUpdates.source_code = updates.seedCode;
  if (updates.supplierName !== undefined) backendUpdates.source_name = updates.supplierName;
  if (updates.sourceType !== undefined) backendUpdates.source_type = updates.sourceType;
  if (updates.sourceOrigin !== undefined) backendUpdates.source_origin = updates.sourceOrigin;
  if (updates.productionPlanCode !== undefined) backendUpdates.production_plan_code = updates.productionPlanCode;
  if (updates.cropCategory !== undefined) backendUpdates.crop_category = updates.cropCategory;
  if (updates.typeName !== undefined) backendUpdates.type_name = updates.typeName;
  if (updates.varietyName !== undefined) backendUpdates.variety_name = updates.varietyName;
  if (updates.cropName !== undefined) backendUpdates.crop_name = updates.cropName;
  if (updates.cropVariety !== undefined) backendUpdates.crop_variety = updates.cropVariety;
  if (updates.cropCode !== undefined) backendUpdates.crop_code = updates.cropCode;
  if (updates.supplierId !== undefined) backendUpdates.supplier_id = updates.supplierId;
  if (updates.purchaseDate !== undefined) backendUpdates.purchase_date = updates.purchaseDate;
  if (updates.quantity !== undefined) backendUpdates.quantity = updates.quantity;
  if (updates.unit !== undefined) backendUpdates.unit = updates.unit;
  if (updates.unitPrice !== undefined) backendUpdates.purchase_price = updates.unitPrice;
  if (updates.totalAmount !== undefined) backendUpdates.total_amount = updates.totalAmount;
  if (updates.availableCount !== undefined) backendUpdates.remaining_quantity = updates.availableCount;
  if (updates.status !== undefined) backendUpdates.status = updates.status;
  if (updates.remarks !== undefined) backendUpdates.remarks = updates.remarks;

  const result = await enhancedApiClient.put(`/seed-sources/${id}`, backendUpdates);
  return result ? { ...updates, id } : null;
}

/**
 * 删除种源
 * 降级策略：API → 离线队列
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteSeedSource(id) {
  await enhancedApiClient.delete(`/seed-sources/${id}`);
  return true;
}

/**
 * 批量删除种源
 * 降级策略：API → 离线队列
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteSeedSources(ids) {
  await enhancedApiClient.delete(`/seed-sources/batch?ids=${ids.join(',')}`);
  return true;
}

/**
 * 减少可用数量
 * 降级策略：API → 离线队列
 * @param {string} id
 * @param {number} count
 * @returns {Promise<boolean>}
 */
export async function decreaseAvailableCount(id, count) {
  await enhancedApiClient.post(`/seed-sources/${id}/decrease-available`, { count });
  return true;
}

/**
 * 重置种源数据（仅调用后端）
 * @returns {Promise<void>}
 */
export async function resetSeedSources() {
  await enhancedApiClient.post('/seed-sources/reset');
}

/**
 * 获取当日最大序号
 * 降级策略：API → 失败返回0
 * @param {string} dateStr
 * @returns {Promise<number>}
 */
export async function getTodayMaxSeedCodeSerial(dateStr) {
  try {
    return await enhancedApiClient.get(`/seed-sources/max-serial?date=${dateStr}`);
  } catch {
    return 0;
  }
}

/**
 * 生成种源编码
 * 降级策略：API → 失败返回空字符串
 * @param {string} dateStr
 * @returns {Promise<string>}
 */
export async function generateSeedCode(dateStr) {
  try {
    return await enhancedApiClient.get(`/seed-sources/generate-code?date=${dateStr}`);
  } catch {
    return '';
  }
}

// ========== 繁殖过程记录 API ==========

/**
 * 添加繁殖过程记录
 * @param {string} seedSourceId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function addPropagationRecord(seedSourceId, data) {
  const result = await enhancedApiClient.post(
    `/seed-sources/${seedSourceId}/propagation-records`,
    data
  );
  return result;
}

/**
 * 获取繁殖过程记录列表
 * @param {string} seedSourceId
 * @returns {Promise<Object[]>}
 */
export async function getPropagationRecords(seedSourceId) {
  const data = await enhancedApiClient.get(
    `/seed-sources/${seedSourceId}/propagation-records`
  );
  return data;
}

/**
 * 推进繁殖阶段
 * @param {string} seedSourceId
 * @param {string} newStage
 * @returns {Promise<{id: string, new_stage: string}>}
 */
export async function updatePropagationStage(seedSourceId, newStage) {
  const result = await enhancedApiClient.put(
    `/seed-sources/${seedSourceId}/propagation-stage`,
    { new_stage: newStage }
  );
  return result;
}

/**
 * 完成繁殖入库
 * @param {string} seedSourceId
 * @param {number} quantity
 * @returns {Promise<{id: string, quantity: number}>}
 */
export async function completePropagation(seedSourceId, quantity) {
  const result = await enhancedApiClient.post(
    `/seed-sources/${seedSourceId}/complete-propagation`,
    { quantity }
  );
  return result;
}

/**
 * 获取可用于留种的种植记录
 * @returns {Promise<Object[]>}
 */
export async function getPlantingsForSeedSaving() {
  const data = await enhancedApiClient.get('/seed-sources/available-for-seed-saving');
  return data;
}

/**
 * 获取某一种源的使用记录（含被育苗使用 + 种植移入/移出）
 * V1.1 源：V1.1/src/services/apiSeedSourceService.ts getSeedSourceUsageRecords
 * 错误直接抛给上层（V2.1 铁律：禁止吞错返回默认值）
 * @param {string} seedSourceId
 * @returns {Promise<Object[]>}
 */
export async function getSeedSourceUsageRecords(seedSourceId) {
  if (!seedSourceId) return []
  const rows = await enhancedApiClient.get(`/seed-sources/${seedSourceId}/usage-records`)
  return Array.isArray(rows) ? rows : []
}
