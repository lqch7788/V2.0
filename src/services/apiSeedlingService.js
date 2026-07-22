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

// SeedlingStatus 枚举映射（对齐 V1.1 apiSeedlingService.ts L93-107）
const SEEDLING_STATUS = {
  SOWN: 'sown',
  IN_PROGRESS: 'in_progress',
  TRANSPLANT_READY: 'transplant_ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
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
  // 对齐 V1.1 apiSeedlingService.ts L93-107：6 状态全映射（sown/cancelled 漏映射会导致取消后闪现又变回 in_progress）
  if (item.status === 'sown') {
    status = SEEDLING_STATUS.SOWN;
  } else if (item.status === 'in_progress') {
    status = SEEDLING_STATUS.IN_PROGRESS;
  } else if (item.status === 'transplant_ready') {
    status = SEEDLING_STATUS.TRANSPLANT_READY;
  } else if (item.status === 'completed') {
    status = SEEDLING_STATUS.COMPLETED;
  } else if (item.status === 'abnormal') {
    status = SEEDLING_STATUS.ABNORMAL;
  } else if (item.status === 'cancelled') {
    status = SEEDLING_STATUS.CANCELLED;
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
    seedlingForm: item.seedlingForm || '',
    siteId: item.areaName || '',
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
    endTime: item.endTime,
    endType: item.endType,
    createBy: item.createBy || '',
    createTime: item.createTime ? item.createTime.split('T')[0] : '',
    updateTime: item.updateTime || '',
    instanceId: undefined,
    orderId: undefined,
    orderCode: undefined,
    orgName: undefined,
    seedlingTaskTime: typeof item.work_hours === 'number' ? item.work_hours : undefined,
    planType: undefined,
    productionPlanId: undefined,
    calculateMode: undefined,
    categoryName: item.categoryName,
    typeName: item.typeName,
    varietyName: item.varietyName,
    subVarietyName: item.subVarietyName,
    varietyPath: varietyPath,
    propagationMode: item.propagationMode || 'one_to_one',
    motherPlantCount: item.motherPlantCount ?? 0,
    expandedPlantCount: item.expandedPlantCount ?? 0,
    scionCount: item.scionCount ?? 0,
    chargePerson: item.chargePerson ?? '',
    motherLossCount: item.motherLossCount ?? 0,
    seedlingLossCount: item.seedlingLossCount ?? 0,
    harvestStockedCount: item.harvestStockedCount ?? 0,
    replantCount: item.replantCount ?? 0,
    availableTransplantCount: Math.max(0,
      (item.expandedPlantCount ?? 0)
      - (item.seedlingLossCount ?? 0)
      - (item.harvestStockedCount ?? 0)
    ),
    propagationMultiple: item.propagationMultiple ?? 0,
    customMultiple: item.customMultiple ?? 0,
    theoreticalYield: item.theoreticalYield ?? 0,
    targetSurvivalRate: item.targetSurvivalRate ?? 0,
    targetSurvivalCount: item.targetSurvivalCount ?? 0,
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
export async function generateSeedlingCodeByDate(_date) {
  try {
    return await enhancedApiClient.get('/seedlings/generate-code');
  } catch {
    return '';
  }
}

/**
 * 创建育苗记录
 * 降级策略：API → 离线队列
 * 注意：前端 camelCase → 后端 snake_case 转换
 */
export async function addSeedling(seedling) {
  const backendData = {
    seedling_code: seedling.seedlingCode,
    source_id: seedling.sourceId,
    source_name: seedling.sourceCode,
    production_plan_code: seedling.productionPlanCode || '',
    crop_code: seedling.cropCode,
    crop_name: seedling.cropName,
    crop_variety: seedling.cropVariety,
    seedling_type: seedling.seedlingType,
    greenhouse_name: seedling.siteName,
    area_name: seedling.siteId,
    seedling_date: seedling.startDate,
    expected_finish_date: seedling.expectedEndDate,
    actual_finish_date: seedling.endDate,
    seedling_quantity: seedling.initialCount,
    survival_rate: seedling.survivalRate || 0,
    target_survival_rate: seedling.targetSurvivalRate ?? null,
    target_survival_count: seedling.targetSurvivalCount ?? null,
    status: seedling.status,
    remarks: seedling.remarks,
    create_by: seedling.createBy,
    work_hours: seedling.seedlingTaskTime,
    pictures: Array.isArray(seedling.pictures) ? JSON.stringify(seedling.pictures) : seedling.pictures,
    propagation_mode: seedling.propagationMode || 'one_to_one',
    mother_plant_count: seedling.motherPlantCount ?? 0,
    expanded_plant_count: seedling.expandedPlantCount ?? 0,
    scion_count: seedling.scionCount ?? 0,
    charge_person: seedling.chargePerson ?? null,
    mother_loss_count: seedling.motherLossCount ?? 0,
    seedling_loss_count: seedling.seedlingLossCount ?? 0,
    harvest_stocked_count: seedling.harvestStockedCount ?? 0,
    propagation_multiple: seedling.propagationMultiple ?? 0,
    custom_multiple: seedling.customMultiple ?? 0,
    theoretical_yield: seedling.theoreticalYield ?? 0,
    seedling_form: seedling.seedlingForm ?? null,
  };
  const result = await enhancedApiClient.post('/seedlings', backendData);
  return { ...seedling, id: result.id };
}

/**
 * 将育苗对象转换为后端 snake_case payload（用于 with-deduct 接口）
 */
function toBackendSeedlingPayload(s) {
  return {
    seedling_code: s.seedlingCode,
    source_id: s.sourceId,
    source_name: s.sourceCode,
    production_plan_code: s.productionPlanCode || '',
    crop_code: s.cropCode,
    crop_name: s.cropName,
    crop_variety: s.cropVariety,
    seedling_type: s.seedlingType,
    greenhouse_name: s.greenhouseName || s.siteName,
    area_name: s.areaName || s.siteId,
    seedling_date: s.seedlingDate || s.startDate,
    expected_finish_date: s.expectedFinishDate || s.expectedEndDate,
    seedling_quantity: s.seedlingQuantity ?? s.initialCount,
    survival_rate: s.survivalRate ?? 0,
    target_survival_rate: s.targetSurvivalRate ?? null,
    target_survival_count: s.targetSurvivalCount ?? null,
    status: s.status,
    remarks: s.remarks,
    create_by: s.createBy,
    work_hours: s.workHours,
    pictures: Array.isArray(s.pictures) ? JSON.stringify(s.pictures) : s.pictures,
    source_mode: s.sourceMode || 'internal',
    external_seed_code: s.externalSeedCode,
    external_seed_name: s.externalSeedName,
    external_seed_quantity: s.externalSeedQuantity,
    external_seed_note: s.externalSeedNote,
    propagation_mode: s.propagationMode || 'one_to_one',
    mother_plant_count: s.motherPlantCount ?? 0,
    expanded_plant_count: s.expandedPlantCount ?? 0,
    scion_count: s.scionCount ?? 0,
    charge_person: s.chargePerson ?? null,
    mother_loss_count: s.motherLossCount ?? 0,
    seedling_loss_count: s.seedlingLossCount ?? 0,
    harvest_stocked_count: s.harvestStockedCount ?? 0,
    propagation_multiple: s.propagationMultiple ?? 0,
    custom_multiple: s.customMultiple ?? 0,
    theoretical_yield: s.theoreticalYield ?? 0,
    seedling_form: s.seedlingForm ?? null,
  };
}

/**
 * 原子操作：扣减种源 + 创建育苗记录（调用后端 /with-deduct）
 */
export async function addSeedlingWithDeduct(data) {
  const result = await enhancedApiClient.post('/seedlings/with-deduct', {
    sourceId: data.sourceId,
    count: data.count,
    seedling: toBackendSeedlingPayload(data.seedling),
  });
  return result;
}

/**
 * 更新育苗记录
 * 降级策略：API → 离线队列
 * 注意：前端 camelCase → 后端 snake_case 转换
 */
const FIELD_TO_SNAKE = {
  seedlingCode: 'seedling_code',
  sourceId: 'source_id',
  sourceCode: 'source_name',
  productionPlanCode: 'production_plan_code',
  cropCode: 'crop_code',
  cropName: 'crop_name',
  cropVariety: 'crop_variety',
  seedlingType: 'seedling_type',
  seedlingForm: 'seedling_form',
  greenhouseName: 'greenhouse_name',
  siteName: 'greenhouse_name',
  areaName: 'area_name',
  siteId: 'area_name',
  startDate: 'seedling_date',
  expectedEndDate: 'expected_finish_date',
  endDate: 'actual_finish_date',
  initialCount: 'seedling_quantity',
  survivalRate: 'survival_rate',
  qualityGrade: 'quality_grade',
  workHours: 'work_hours',
  endType: 'end_type',
  endTime: 'end_time',
  targetSurvivalRate: 'target_survival_rate',
  targetSurvivalCount: 'target_survival_count',
  lossCount: 'loss_count',
  lossRate: 'loss_rate',
  printCount: 'print_count',
  chargePerson: 'charge_person',
};

export async function updateSeedling(id, updates) {
  const backendUpdates = {};
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    backendUpdates[FIELD_TO_SNAKE[k] ?? k] = v;
  }
  const result = await enhancedApiClient.put(`/seedlings/${id}`, backendUpdates);
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
 * 获取育苗的每日记录列表
 * 2026-06-05: modal 需要独立拉取，因为 GET /seedlings 列表不返回 dailyRecords 字段
 */
export async function getDailyRecords(seedlingId) {
  try {
    const res = await enhancedApiClient.get(`/seedlings/${seedlingId}/daily-records?limit=200`);
    const payload = res;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  } catch {
    return [];
  }
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
