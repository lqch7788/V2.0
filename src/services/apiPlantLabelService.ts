// @ts-nocheck - 预先存在的类型问题
/**
 * 植株标签 API 服务
 * 对接后端 /api/plant-labels
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 */

import { enhancedApiClient } from '../lib/apiClient';

// ============================================
// 类型定义
// ============================================

/**
 * 标签标记
 */
export interface PlantMark {
  id: number;
  name: string;
  color: string;
  icon?: string;
  parentId: number;
  markAid: string;
  sortOrder: number;
  isUse: boolean;
}

/**
 * 标签
 */
export interface PlantLabel {
  id: number;
  labelNumber: string;
  plantingId?: number;
  seedlingId?: number;
  moveInAreaName?: string;
  moveInDate?: string;
  moveOutAreaName?: string;
  moveOutDate?: string;
  currentMarkId?: number;
  currentMarkName?: string;
  currentMarkColor?: string;
  createTime: string;
}

/**
 * 标签履历
 */
export interface PlantLabelResume {
  id: number;
  labelId: number;
  operationType: 'move_in' | 'move_out' | 'mark';
  fromAreaName?: string;
  toAreaName?: string;
  markId?: number;
  markName?: string;
  markColor?: string;
  operationDate: string;
  operatorName?: string;
  createTime: string;
}

// ============================================
// 标记 API
// ============================================

/**
 * 获取所有可用标记
 * 降级策略：API → IndexedDB 缓存
 */
export async function getAllMarks(): Promise<PlantMark[]> {
  const data = await enhancedApiClient.get<PlantMark[]>('/plant-labels/marks/all');
  return data || [];
}

/**
 * 分配标记给标签
 * @param markId 标记ID
 * @param labelIds 标签ID数组
 */
export async function assignMarkToLabels(markId: number, labelIds: number[]): Promise<{
  markId: number;
  markName: string;
  assignedCount: number;
}> {
  const data = await enhancedApiClient.post<{
    markId: number;
    markName: string;
    assignedCount: number;
  }>('/plant-labels/marks/assign', {
    mark_id: markId,
    label_ids: labelIds
  });
  return data;
}

/**
 * 创建标记
 */
export async function createMark(data: {
  name: string;
  color?: string;
  icon?: string;
  parentId?: number;
  markAid?: string;
  sortOrder?: number;
}): Promise<PlantMark | null> {
  try {
    const result = await enhancedApiClient.post<PlantMark>('/plant-labels/marks', {
      name: data.name,
      color: data.color,
      icon: data.icon,
      parent_id: data.parentId || 0,
      mark_aid: data.markAid || '',
      sort_order: data.sortOrder || 0
    });
    return result;
  } catch {
    return null;
  }
}

/**
 * 更新标记
 */
export async function updateMark(id: number, data: Partial<PlantMark>): Promise<PlantMark | null> {
  try {
    const result = await enhancedApiClient.put<PlantMark>(`/plant-labels/marks/${id}`, data);
    return result;
  } catch {
    return null;
  }
}

/**
 * 删除标记（软删除）
 */
export async function deleteMark(id: number): Promise<boolean> {
  try {
    await enhancedApiClient.delete(`/plant-labels/marks/${id}`);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// 标签 API
// ============================================

/**
 * 获取标签列表
 */
export async function getLabels(params?: {
  plantingId?: number;
  seedlingId?: number;
  page?: number;
  limit?: number;
}): Promise<{
  data: PlantLabel[];
  meta: { total: number; page: number; limit: number };
}> {
  const queryParams: Record<string, string> = {};
  if (params?.plantingId) queryParams.planting_id = String(params.plantingId);
  if (params?.seedlingId) queryParams.seedling_id = String(params.seedlingId);
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  return await enhancedApiClient.get('/plant-labels', queryParams);
}

/**
 * 按标签编号查询标签
 */
export async function queryLabelByNumber(labelCode: string): Promise<PlantLabel | null> {
  try {
    const data = await enhancedApiClient.get<PlantLabel[]>(
      '/plant-labels/query-by-label',
      { label_code: labelCode }
    );
    return data?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * 批量生成标签
 */
export async function generateBatchLabels(params: {
  count: number;
  plantingId?: number;
  seedlingId?: number;
  cropName?: string;
  areaName?: string;
  startDate?: string;
}): Promise<{
  labels: Array<{
    labelNumber: string;
    qrContent: string;
    cropName: string;
    areaName: string;
  }>;
  totalPrinted: number;
}> {
  return await enhancedApiClient.post('/plant-labels/generate-batch', {
    count: params.count,
    planting_id: params.plantingId,
    seedling_id: params.seedlingId,
    crop_name: params.cropName,
    area_name: params.areaName,
    start_date: params.startDate
  });
}

// ============================================
// 标签履历 API
// ============================================

/**
 * 获取标签履历
 */
export async function getLabelResumes(labelId: number): Promise<PlantLabelResume[]> {
  const data = await enhancedApiClient.get<PlantLabelResume[]>(
    `/plant-labels/${labelId}/resumes`
  );
  return data || [];
}

/**
 * 新增标签履历
 */
export async function addLabelResume(
  labelId: number,
  data: {
    operationType: 'move_in' | 'move_out' | 'mark';
    fromAreaName?: string;
    toAreaName?: string;
    markId?: number;
    markName?: string;
    markColor?: string;
    operationDate: string;
    operatorName?: string;
  }
): Promise<boolean> {
  try {
    await enhancedApiClient.post(`/plant-labels/${labelId}/resumes`, {
      operation_type: data.operationType,
      from_area_name: data.fromAreaName,
      to_area_name: data.toAreaName,
      mark_id: data.markId,
      mark_name: data.markName,
      mark_color: data.markColor,
      operation_date: data.operationDate,
      operator_name: data.operatorName
    });
    return true;
  } catch {
    return false;
  }
}
