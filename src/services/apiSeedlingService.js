/**
 * 育苗数据 API 服务
 * 对接后端 /api/seedlings
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

// SeedlingStatus 枚举映射
const SEEDLING_STATUS = {
  IN_PROGRESS: 'in_progress',
  TRANSPLANT_READY: 'transplant_ready',
  COMPLETED: 'completed',
  ABNORMAL: 'abnormal',
}

/**
 * 将后端返回的字段名映射到前端 Seedling 类型
 */
function transformSeedlingFromBackend(data) {
  if (Array.isArray(data)) {
    return data.map(item => transformSingleSeedling(item));
  }
  return transformSingleSeedling(data);
}

function transformSingleSeedling(item) {
  let pictures = [];
  if (item.pictures) {
    try {
      pictures = JSON.parse(item.pictures);
    } catch {
      pictures = [];
    }
  }

  let status = SEEDLING_STATUS.IN_PROGRESS;
  if (item.status === 'transplant_ready') {
    status = SEEDLING_STATUS.TRANSPLANT_READY;
  } else if (item.status === 'completed') {
    status = SEEDLING_STATUS.COMPLETED;
  } else if (item.status === 'abnormal') {
    status = SEEDLING_STATUS.ABNORMAL;
  }

  let survivalRate = item.survivalRate;
  if (typeof survivalRate !== 'number' || isNaN(survivalRate) || survivalRate > 100 || survivalRate < 0) {
    const initialCount = item.seedlingQuantity || 0;
    const survivalCount = item.survivalQuantity || 0;
    survivalRate = initialCount > 0 ? Math.round((survivalCount / initialCount) * 100) : 0;
  }

  const varietyPath = [
    item.categoryName,
    item.typeName,
    item.varietyName,
    item.subVarietyName
  ].filter(Boolean).join(' > ');

  return {
    id: item.id,
    seedlingCode: item.seedlingCode,
    sourceId: item.sourceId || '',
    sourceCode: item.sourceCode || '',
    productionPlanCode: item.productionPlanCode || '',
    cropName: item.cropName,
    cropVariety: item.varietyName || item.cropName || '',
    cropCode: item.cropCode || '',
    seedlingType: item.seedlingType || '',
    siteId: '',
    siteName: item.greenhouseName || item.areaName || '',
    startDate: item.seedlingDate ? item.seedlingDate.split('T')[0] : '',
    expectedEndDate: item.expectedFinishDate ? item.expectedFinishDate.split('T')[0] : '',
    endDate: item.actualFinishDate ? item.actualFinishDate.split('T')[0] : '',
    initialCount: item.seedlingQuantity || 0,
    survivalCount: item.survivalQuantity || 0,
    plantedCount: 0,
    survivalRate: survivalRate,
    lossCount: item.lossCount || 0,
    lossRate: item.lossRate || 0,
    isFinished: item.isFinished === 1,
    status: status,
    dailyRecords: [],
    pictures: pictures,
    qualityGrade: item.qualityGrade || '',
    printCount: item.printedCount || 0,
    remarks: item.remarks || '',
    createBy: item.createBy || '',
    createTime: item.createTime ? item.createTime.split('T')[0] : '',
    updateTime: item.updateTime || '',
    instanceId: undefined,
    orderId: undefined,
    orderCode: undefined,
    orgName: undefined,
    seedlingTaskTime: item.workHours || item.work_hours || undefined,
    planType: undefined,
    targetSurvivalRate: undefined,
    targetSurvivalCount: item.targetSurvivalCount,
    chargePerson: item.chargePerson,
    productionPlanId: undefined,
    calculateMode: undefined,
    motherPlantCount: undefined,
    propagationMultiple: undefined,
    theoreticalYield: undefined,
    categoryName: item.categoryName,
    typeName: item.typeName,
    varietyName: item.varietyName,
    subVarietyName: item.subVarietyName,
    varietyPath: varietyPath,
  };
}

/**
 * 获取所有育苗记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getSeedlings() {
  const data = await enhancedApiClient.get('/seedlings');
  return transformSeedlingFromBackend(data);
}

/**
 * 根据ID获取单个育苗记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getSeedlingById(id) {
  const data = await enhancedApiClient.get(`/seedlings/${id}`);
  return transformSeedlingFromBackend(data);
}

/**
 * 根据ID数组获取多个育苗记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getSeedlingsByIds(ids) {
  const data = await enhancedApiClient.get(`/seedlings/batch?ids=${ids.join(',')}`);
  return transformSeedlingFromBackend(data);
}

/**
 * 根据种源ID获取育苗记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getSeedlingsBySourceId(sourceId) {
  const data = await enhancedApiClient.get(`/seedlings/source/${sourceId}`);
  return transformSeedlingFromBackend(data);
}

/**
 * 生成育苗单号
 * 降级策略：API 失败返回空字符串
 */
export async function generateSeedlingCode() {
  try {
    return await enhancedApiClient.get('/seedlings/generate-code');
  } catch {
    return '';
  }
}

/**
 * 根据日期生成育苗单号
 * 降级策略：API 失败返回空字符串
 */
export async function generateSeedlingCodeByDate(date) {
  try {
    return await enhancedApiClient.get('/seedlings/generate-code');
  } catch {
    return '';
  }
}

/**
 * 创建育苗记录
 * 降级策略：API → 离线队列
 */
export async function addSeedling(seedling) {
  const result = await enhancedApiClient.post('/seedlings', seedling);
  return { ...seedling, id: result.id };
}

/**
 * 更新育苗记录
 * 降级策略：API → 离线队列
 */
export async function updateSeedling(id, updates) {
  const result = await enhancedApiClient.put(`/seedlings/${id}`, updates);
  return result ? { ...updates, id } : null;
}

/**
 * 删除育苗记录
 * 降级策略：API → 离线队列
 */
export async function deleteSeedling(id) {
  await enhancedApiClient.delete(`/seedlings/${id}`);
  return true;
}

/**
 * 批量删除育苗记录
 * 降级策略：API → 离线队列
 */
export async function deleteSeedlings(ids) {
  await enhancedApiClient.delete(`/seedlings/batch?ids=${ids.join(',')}`);
  return true;
}

/**
 * 添加每日记录
 * 降级策略：API → 离线队列
 */
export async function addDailyRecord(seedlingId, record) {
  try {
    return await enhancedApiClient.post(`/seedlings/${seedlingId}/daily-records`, record);
  } catch {
    return null;
  }
}

/**
 * 删除每日记录
 * 降级策略：API → 离线队列
 */
export async function deleteDailyRecord(seedlingId, recordId) {
  await enhancedApiClient.delete(`/seedlings/${seedlingId}/daily-records/${recordId}`);
  return true;
}

/**
 * 更新每日记录
 * 降级策略：API → 离线队列
 */
export async function updateDailyRecord(seedlingId, recordId, updates) {
  await enhancedApiClient.put(`/seedlings/${seedlingId}/daily-records/${recordId}`, updates);
  return true;
}

/**
 * 增加定植数量
 * 降级策略：API → 离线队列
 */
export async function increasePlantedCount(id, count) {
  await enhancedApiClient.post(`/seedlings/${id}/increase-planted`, { count });
  return true;
}

/**
 * 获取可移栽的育苗记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTransplantReadySeedlings() {
  const data = await enhancedApiClient.get('/seedlings/transplant-ready');
  return transformSeedlingFromBackend(data);
}

/**
 * 获取可用移栽数量
 * 降级策略：API 失败返回0
 */
export async function getAvailableTransplantCount(id) {
  try {
    return await enhancedApiClient.get(`/seedlings/${id}/available-count`);
  } catch {
    return 0;
  }
}

/**
 * 重置育苗数据（仅调用后端）
 */
export async function resetSeedlings() {
  await enhancedApiClient.post('/seedlings/reset');
}

// ==================== 标签打印相关函数 ====================

/**
 * 生成标签编号
 * 降级策略：API 失败返回空字符串
 */
export async function generateLabelNumber(seedlingCode, index) {
  try {
    return await enhancedApiClient.get(`/seedlings/label-number?code=${seedlingCode}&index=${index}`);
  } catch {
    return '';
  }
}

/**
 * 打印标签
 * 降级策略：API → 离线队列
 */
export async function printLabel(seedlingId, printType, printCount, operator, labelNumbers) {
  try {
    return await enhancedApiClient.post(`/seedlings/${seedlingId}/print`, {
      printType,
      printCount,
      operator,
      labelNumbers
    });
  } catch {
    return null;
  }
}

/**
 * 批量打印标签
 * 降级策略：API → 离线队列
 */
export async function batchPrintLabel(seedlingIds, operator) {
  try {
    return await enhancedApiClient.post('/seedlings/batch-print', { seedlingIds, operator });
  } catch {
    return [];
  }
}

/**
 * 获取打印记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getPrintRecords(seedlingId) {
  try {
    return await enhancedApiClient.get(`/seedlings/${seedlingId}/print-records`);
  } catch {
    return [];
  }
}

/**
 * 更新打印记录标签编号
 * 降级策略：API → 离线队列
 */
export async function updatePrintRecordLabelNumbers(seedlingId, printRecordId, labelNumbers) {
  await enhancedApiClient.put(`/seedlings/${seedlingId}/print-records/${printRecordId}`, { labelNumbers });
  return true;
}

// ==================== 栽种记录相关函数 ====================

/**
 * 添加栽种记录
 * 降级策略：API → 离线队列
 */
export async function addTransplantRecord(seedlingId, record) {
  try {
    return await enhancedApiClient.post(`/seedlings/${seedlingId}/transplant-records`, record);
  } catch {
    return null;
  }
}

/**
 * 获取栽种记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTransplantRecords(seedlingId) {
  try {
    return await enhancedApiClient.get(`/seedlings/${seedlingId}/transplant-records`);
  } catch {
    return [];
  }
}

/**
 * 更新栽种记录状态
 * 降级策略：API → 离线队列
 */
export async function updateTransplantRecordStatus(seedlingId, recordId, status) {
  await enhancedApiClient.put(`/seedlings/${seedlingId}/transplant-records/${recordId}/status`, { status });
  return true;
}

// ==================== 栽种履历相关函数 ====================

/**
 * 添加栽种履历
 * 降级策略：API → 离线队列
 */
export async function addTransplantHistoryItem(seedlingId, labelNumber, historyItem) {
  try {
    return await enhancedApiClient.post(`/seedlings/${seedlingId}/transplant-history/${labelNumber}`, historyItem);
  } catch {
    return null;
  }
}

/**
 * 获取栽种履历
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTransplantHistory(seedlingId) {
  try {
    return await enhancedApiClient.get(`/seedlings/${seedlingId}/transplant-history`);
  } catch {
    return [];
  }
}

/**
 * 获取标签栽种履历
 * 降级策略：API → IndexedDB 缓存
 */
export async function getLabelTransplantHistory(seedlingId, labelNumber) {
  try {
    return await enhancedApiClient.get(`/seedlings/${seedlingId}/transplant-history/${labelNumber}`);
  } catch {
    return undefined;
  }
}

/**
 * 更新标签状态
 * 降级策略：API → 离线队列
 */
export async function updateLabelStatus(seedlingId, labelNumber, status) {
  await enhancedApiClient.put(`/seedlings/${seedlingId}/transplant-history/${labelNumber}/status`, { status });
  return true;
}

/**
 * 生成所有标签编号
 * 降级策略：API 失败返回空数组
 */
export async function generateAllLabelNumbers(seedlingId) {
  try {
    return await enhancedApiClient.get(`/seedlings/${seedlingId}/all-label-numbers`);
  } catch {
    return [];
  }
}

// 导出 SeedlingStatus 供其他模块使用
export const SeedlingStatus = SEEDLING_STATUS;
