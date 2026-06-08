/**
 * 农事操作记录 API 服务
 * 对接后端 /api/operation-records
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

// ============================================
// 类型定义
// ============================================

/**
 * @typedef {('task'|'tempTask'|'manual'|'inspection')} OperationSourceType
 * 操作记录来源类型
 *
 * @typedef {Object} FarmOperationRecordChild
 * @property {string} id
 * @property {string} recordCode
 * @property {('accept'|'progress'|'complete'|'reject'|'accept_confirm'|'create')} operationType
 * @property {string} operationTypeName
 * @property {string} operatorId
 * @property {string} operatorName
 * @property {string} operationDate
 * @property {string} [time]
 * @property {number} [progress]
 * @property {number} [progressIncrement]
 * @property {string} [area]
 * @property {number} [workload]
 * @property {number} [workloadDays]
 * @property {number} [workloadHours]
 * @property {number} [workers]
 * @property {string} [unit]
 * @property {Array<{name: string, qty: number, unit: string}>} [materials]
 * @property {{lat: number, lng: number}} [gpsLocation]
 * @property {string[]} [photosBefore]
 * @property {string[]} [photosAfter]
 * @property {string} [voiceNote]
 * @property {string} [materialCode]
 * @property {string} [remarks]
 * @property {string} [rejectReason]
 * @property {string} createdAt
 *
 * @typedef {Object} FarmOperationRecord
 * @property {string} id
 * @property {string} recordCode
 * @property {OperationSourceType} sourceType
 * @property {string} [sourceId]
 * @property {string} [sourceCode]
 * @property {string} operationType
 * @property {string} operationTypeName
 * @property {string} status
 * @property {string} greenhouseId
 * @property {string} greenhouseName
 * @property {string} cropName
 * @property {string} [variety]
 * @property {string} [batchId]
 * @property {string} [batchCode]
 * @property {string} operatorId
 * @property {string} operatorName
 * @property {string} operationDate
 * @property {string} [startTime]
 * @property {string} [endTime]
 * @property {number} [duration]
 * @property {number} [workload]
 * @property {number} [workloadDays]
 * @property {number} [workloadHours]
 * @property {number} [workers]
 * @property {string} [unit]
 * @property {Array<{name: string, qty: number, unit: string}>} [materials]
 * @property {{lat: number, lng: number}} [gpsLocation]
 * @property {string[]} [photosBefore]
 * @property {string[]} [photosAfter]
 * @property {string} [voiceNote]
 * @property {string} [materialCode]
 * @property {string} [remarks]
 * @property {number} [progress]
 * @property {number} [progressIncrement]
 * @property {string} [area]
 * @property {FarmOperationRecordChild[]} [children]
 * @property {string} [rejectReason]
 * @property {string} createdAt
 * @property {string} [updatedAt]
 *
 * @typedef {Object} OperationRecordFilters
 * @property {OperationSourceType} [sourceType]
 * @property {string} [status]
 * @property {string} [operationType]
 * @property {string} [greenhouseId]
 * @property {string} [operatorId]
 * @property {string} [dateFrom]
 * @property {string} [dateTo]
 * @property {string} [search]
 * @property {number} [page]
 * @property {number} [limit]
 *
 * @typedef {Object} OperationRecordResult
 * @property {FarmOperationRecord[]} data
 * @property {{total: number, page: number, limit: number, totalPages: number}} meta
 */

// ============================================
// 工具函数
// ============================================

/**
 * 将 snake_case 转换为 camelCase
 * @param {unknown} obj
 * @returns {unknown}
 */
function snakeToCamel(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj !== 'object') return obj;

  const result = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    let value = obj[key];
    // 解析 JSON 字段
    if ((key === 'materials' || key === 'gps_location' || key === 'photos_before' || key === 'photos_after') && typeof value === 'string') {
      try { value = JSON.parse(value); } catch { value = []; }
    }
    result[camelKey] = snakeToCamel(value);
  }
  return result;
}

/**
 * 将 camelCase 转换为 snake_case
 * @param {Record<string, unknown>} obj
 * @returns {Record<string, unknown>}
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
// 操作记录 API
// ============================================

/**
 * 获取操作记录列表（支持分页和筛选）
 * 降级策略：API → IndexedDB 缓存
 * @param {OperationRecordFilters} [filters]
 * @returns {Promise<OperationRecordResult>}
 */
export async function getOperationRecords(filters) {
  const params = {};

  if (filters) {
    if (filters.sourceType) params.source_type = filters.sourceType;
    if (filters.status) params.status = filters.status;
    if (filters.operationType) params.operation_type = filters.operationType;
    if (filters.greenhouseId) params.greenhouse_id = filters.greenhouseId;
    if (filters.operatorId) params.operator_id = filters.operatorId;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
  }

  const data = await enhancedApiClient.get('/operation-records', params);
  return data;
}

/**
 * 获取单个操作记录详情
 * 降级策略：API → IndexedDB 缓存
 * @param {string} id
 * @returns {Promise<FarmOperationRecord|null>}
 */
export async function getOperationRecordById(id) {
  try {
    const data = await enhancedApiClient.get(`/operation-records/${id}`);
    return snakeToCamel(data);
  } catch {
    return null;
  }
}

/**
 * 创建操作记录（手动录入）
 * 降级策略：API → 离线队列
 * @param {Partial<FarmOperationRecord>} data
 * @returns {Promise<string>}
 */
export async function createOperationRecord(data) {
  const snakeData = camelToSnake(data);
  const result = await enhancedApiClient.post('/operation-records', snakeData);
  return result.id;
}

/**
 * 更新操作记录
 * 降级策略：API → 离线队列
 * @param {string} id
 * @param {Partial<FarmOperationRecord>} data
 * @returns {Promise<string|null>}
 */
export async function updateOperationRecord(id, data) {
  const snakeData = camelToSnake(data);
  const result = await enhancedApiClient.put(`/operation-records/${id}`, snakeData);
  return result?.id || null;
}

/**
 * 删除操作记录
 * 降级策略：API → 离线队列
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteOperationRecord(id) {
  await enhancedApiClient.delete(`/operation-records/${id}`);
  return true;
}

/**
 * 批量删除操作记录
 * 降级策略：API → 离线队列
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteOperationRecords(ids) {
  await enhancedApiClient.delete('/operation-records/batch', { ids });
  return true;
}

/**
 * 获取操作记录统计
 * @returns {Promise<{total: number, task: number, tempTask: number, manual: number, inspection: number}>}
 */
export async function getOperationRecordStats() {
  const data = await enhancedApiClient.get('/operation-records/stats/summary');
  return data;
}

/**
 * 根据来源ID获取操作记录
 * @param {string} sourceId
 * @param {OperationSourceType} sourceType
 * @returns {Promise<FarmOperationRecord[]>}
 */
export async function getOperationRecordsBySourceId(sourceId, sourceType) {
  const data = await enhancedApiClient.get(
    `/operation-records/by-source/${sourceId}`,
    { sourceType }
  );
  return (data || []).map(item => snakeToCamel(item));
}
