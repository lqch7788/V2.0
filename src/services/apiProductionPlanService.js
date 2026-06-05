/**
 * 生产计划 API 服务
 * 对接后端 /api/production-plans
 *
 * 1:1 翻译 V1.1 src/services/apiProductionPlanService.ts
 * 按用户要求"所有后端数据库对接样式都要与V1.1保持一样"
 *
 * 数据流：API → enhancedApiClient（无缓存，仅 3 次重试）→ 组件
 */

import { enhancedApiClient } from '@/lib/apiClient'

/**
 * 标准化 API 返回数据到 CropBatch 接口
 * 处理后端字段名与前端接口名不一致的问题
 */
function normalizeBatch(raw) {
  return {
    id: raw.id,
    batchCode: raw.batchCode,
    cropName: (raw.cropName) || '',
    cropType: (raw.cropType) || '',
    variety: (raw.variety) || (raw.cropVariety) || '',
    greenhouseId: (raw.greenhouseId) || (raw.greenhouseName) || '',
    greenhouseName: (raw.greenhouseName) || '',
    plantingArea: (raw.plantingArea) || 0,
    plantingAreaUnit: raw.plantingAreaUnit,
    stage: (raw.stage) || 'seedling',
    stageName: (raw.stageName) || '',
    startDate: (raw.startDate) || (raw.plantingDate) || '',
    expectedHarvestDate: (raw.expectedHarvestDate) || '',
    targetYield: (raw.targetQuantity) || (raw.targetYield) || 0,
    actualYield: (raw.actualYield) || 0,
    batchStatus: (raw.status) || (raw.batchStatus) || 'draft',
    plantingMode: (raw.plantingMode) || '',
    responsablePerson: (raw.responsablePerson) || '',
    publisher: raw.publisher,
    publishDate: raw.publishDate,
    lastModifyDate: (raw.lastModifyDate) || (raw.updateTime) || '',
    planDetailFileName: raw.planDetailFileName,
    planDetail: raw.planDetail,
    planType: raw.planType,
    planTypeName: raw.planTypeName,
    locationName: raw.locationName,
    targetQuantity: raw.targetQuantity || raw.plannedQuantity || 0,
    unit: raw.unit,
    supplierName: raw.supplierName,
    seedQuantity: raw.seedQuantity,
    seedlingSiteName: raw.seedlingSiteName,
    targetSeedlingCount: raw.targetSeedlingCount,
    orderId: raw.orderId,
    orderCode: raw.orderCode,
    remarks: raw.remarks,
    areaName: raw.areaName,
    executionStatus: raw.executionStatus,
  }
}

/**
 * 获取所有生产计划
 * 1:1 翻译 V1.1 apiProductionPlanService.ts L71-89（URLSearchParams 风格）
 */
export async function getProductionPlans(filters) {
  const params = new URLSearchParams()
  if (filters) {
    if (filters.status) params.append('status', filters.status)
    if (filters.planType) params.append('plan_type', filters.planType)
    if (filters.keyword) params.append('keyword', filters.keyword)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
  }

  const url = params.toString() ? `/production-plans?${params.toString()}` : '/production-plans'
  const data = await enhancedApiClient.get(url)
  if (!Array.isArray(data)) return []
  return data.map(normalizeBatch)
}

/**
 * 根据ID获取单个生产计划
 */
export async function getProductionPlanById(id) {
  const data = await enhancedApiClient.get(`/production-plans/${id}`)
  if (!data) return undefined
  return normalizeBatch(data)
}

/**
 * 创建生产计划
 */
export async function createProductionPlan(plan) {
  const data = await enhancedApiClient.post('/production-plans', plan)
  return normalizeBatch(data)
}

/**
 * 更新生产计划
 */
export async function updateProductionPlan(id, updates) {
  const data = await enhancedApiClient.put(`/production-plans/${id}`, updates)
  if (!data) return null
  return normalizeBatch(data)
}

/**
 * 删除生产计划
 */
export async function deleteProductionPlan(id) {
  await enhancedApiClient.delete(`/production-plans/${id}`)
  return true
}

/**
 * 批量删除生产计划
 */
export async function deleteProductionPlans(ids) {
  await enhancedApiClient.delete(`/production-plans/batch?ids=${ids.join(',')}`)
  return true
}
