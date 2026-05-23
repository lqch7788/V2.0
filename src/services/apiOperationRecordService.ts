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
 * 操作记录来源类型
 */
export type OperationSourceType = 'task' | 'tempTask' | 'manual' | 'inspection';

/**
 * 操作记录
 */
export interface FarmOperationRecord {
  id: string;
  recordCode: string;         // 操作记录编号

  // 来源信息
  sourceType: OperationSourceType;  // 来源类型
  sourceId?: string;         // 来源ID（任务ID/临时任务ID）
  sourceCode?: string;       // 来源编号

  // 操作信息
  operationType: string;     // 操作类型值
  operationTypeName: string; // 操作类型名称
  status: string;           // 状态

  // 地块与作物
  greenhouseId: string;
  greenhouseName: string;
  cropName: string;
  variety?: string;
  batchId?: string;
  batchCode?: string;

  // 执行信息
  operatorId: string;
  operatorName: string;
  operationDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;         // 工作时长（分钟）

  // 工作量
  workload?: number;
  workloadDays?: number;
  workloadHours?: number;
  workers?: number;
  unit?: string;

  // 物料使用
  materials?: { name: string; qty: number; unit: string }[];

  // 反馈信息
  gpsLocation?: { lat: number; lng: number };
  photosBefore?: string[];
  photosAfter?: string[];
  voiceNote?: string;
  materialCode?: string;

  // 备注
  remarks?: string;

  // 进度（关联任务时有）
  progress?: number;
  progressIncrement?: number;  // 本次增加的进度

  // 区域（分解任务时使用）
  area?: string;

  // 子记录（用于折叠展示）
  children?: FarmOperationRecordChild[];

  // 驳回原因
  rejectReason?: string;

  // 时间戳
  createdAt: string;
  updatedAt?: string;
}

/**
 * 子记录（每次进度提交都生成一条）
 */
export interface FarmOperationRecordChild {
  id: string;
  recordCode: string;

  // 操作类型
  operationType: 'accept' | 'progress' | 'complete' | 'reject' | 'accept_confirm' | 'create';
  operationTypeName: string;

  // 执行信息
  operatorId: string;
  operatorName: string;
  operationDate: string;
  time?: string;

  // 进度信息
  progress?: number;
  progressIncrement?: number;
  area?: string;

  // 工作量
  workload?: number;
  workloadDays?: number;
  workloadHours?: number;
  workers?: number;
  unit?: string;

  // 物料
  materials?: { name: string; qty: number; unit: string }[];

  // 反馈信息
  gpsLocation?: { lat: number; lng: number };
  photosBefore?: string[];
  photosAfter?: string[];
  voiceNote?: string;
  materialCode?: string;

  // 备注
  remarks?: string;

  // 驳回原因
  rejectReason?: string;

  // 时间戳
  createdAt: string;
}

/**
 * 操作记录筛选条件
 */
export interface OperationRecordFilters {
  sourceType?: OperationSourceType;
  status?: string;
  operationType?: string;
  greenhouseId?: string;
  operatorId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * 操作记录分页结果
 */
export interface OperationRecordResult {
  data: FarmOperationRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// 工具函数
// ============================================

/**
 * 将 snake_case 转换为 camelCase
 */
function snakeToCamel(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return (obj as unknown[]).map(snakeToCamel);
  if (typeof obj !== 'object') return obj;

  const result: Record<string, unknown> = {};
  for (const key in obj as Record<string, unknown>) {
    const camelKey = key.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
    let value = (obj as Record<string, unknown>)[key];
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
 */
function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
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
 */
export async function getOperationRecords(filters?: OperationRecordFilters): Promise<OperationRecordResult> {
  const params: Record<string, string> = {};

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

  const data = await enhancedApiClient.get<OperationRecordResult>('/operation-records', params);
  return data;
}

/**
 * 获取单个操作记录详情
 * 降级策略：API → IndexedDB 缓存
 */
export async function getOperationRecordById(id: string): Promise<FarmOperationRecord | null> {
  try {
    const data = await enhancedApiClient.get<Record<string, unknown>>(`/operation-records/${id}`);
    return snakeToCamel(data) as FarmOperationRecord;
  } catch {
    return null;
  }
}

/**
 * 创建操作记录（手动录入）
 * 降级策略：API → 离线队列
 */
export async function createOperationRecord(data: Partial<FarmOperationRecord>): Promise<string> {
  const snakeData = camelToSnake(data as Record<string, unknown>);
  const result = await enhancedApiClient.post<{ id: string }>('/operation-records', snakeData);
  return result.id;
}

/**
 * 更新操作记录
 * 降级策略：API → 离线队列
 */
export async function updateOperationRecord(id: string, data: Partial<FarmOperationRecord>): Promise<string | null> {
  const snakeData = camelToSnake(data as Record<string, unknown>);
  const result = await enhancedApiClient.put<{ id: string }>(`/operation-records/${id}`, snakeData);
  return result?.id || null;
}

/**
 * 删除操作记录
 * 降级策略：API → 离线队列
 */
export async function deleteOperationRecord(id: string): Promise<boolean> {
  await enhancedApiClient.delete(`/operation-records/${id}`);
  return true;
}

/**
 * 批量删除操作记录
 * 降级策略：API → 离线队列
 */
export async function deleteOperationRecords(ids: string[]): Promise<boolean> {
  await enhancedApiClient.delete('/operation-records/batch', { ids });
  return true;
}

/**
 * 获取操作记录统计
 */
export async function getOperationRecordStats(): Promise<{
  total: number;
  task: number;
  tempTask: number;
  manual: number;
  inspection: number;
}> {
  const data = await enhancedApiClient.get<{
    total: number;
    task: number;
    tempTask: number;
    manual: number;
    inspection: number;
  }>('/operation-records/stats/summary');
  return data;
}

/**
 * 根据来源ID获取操作记录
 */
export async function getOperationRecordsBySourceId(sourceId: string, sourceType: OperationSourceType): Promise<FarmOperationRecord[]> {
  const data = await enhancedApiClient.get<Record<string, unknown>[]>(
    `/operation-records/by-source/${sourceId}`,
    { sourceType }
  );
  return (data || []).map(item => snakeToCamel(item) as FarmOperationRecord);
}
