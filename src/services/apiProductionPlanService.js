/**
 * 生产计划 API 服务
 * 对接后端 /api/production-plans
 *
 * 核心原则：服务器数据是唯一真相来源
 *
 * 数据流：API → enhancedApiClient（无缓存）→ 组件
 *
 * 1:1 翻译自 V1.1 src/services/apiProductionPlanService.ts
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\apiProductionPlanService.ts
 *
 * V2.0 修改（P0-1 架构统一）：
 * - 客户端：request (axios) → enhancedApiClient (fetch)，与 order/tech/purchase 一致
 * - normalizeBatch：去掉 snake_case 兼容分支，后端 mapFieldsToFrontend 已完整映射
 */

import { enhancedApiClient } from '@/lib/apiClient'

/**
 * 作物批次接口
 * @typedef {Object} CropBatch
 * @property {string} id
 * @property {string} batchCode
 * @property {string} cropName
 * @property {string} cropType
 * @property {string} variety
 * @property {string} greenhouseId
 * @property {string} greenhouseName
 * @property {number} plantingArea
 * @property {string} [plantingAreaUnit]
 * @property {'seedling'|'vegetative'|'flowering'|'fruiting'|'harvest'} stage
 * @property {string} stageName
 * @property {string} startDate
 * @property {string} expectedHarvestDate
 * @property {number} targetYield
 * @property {number} actualYield
 * @property {'draft'|'pending'|'approved'|'in_progress'|'completed'|'cancelled'|'rejected'} batchStatus
 * @property {string} plantingMode
 * @property {string} responsiblePerson
 * @property {string} [publisher]
 * @property {string} [publishDate]
 * @property {string} [lastModifyDate]
 * @property {string} [planDetailFileName]
 * @property {string} [planDetail]
 * @property {string} [planType]
 * @property {string} [planTypeName]
 * @property {string} [locationName]
 * @property {number} [targetQuantity]
 * @property {string} [unit]
 * @property {string} [supplierName]
 * @property {number} [seedQuantity]
 * @property {string} [seedlingSiteName]
 * @property {number} [targetSeedlingCount]
 * @property {string} [orderId]
 * @property {string} [orderCode]
 * @property {string} [remarks]
 * @property {string} [areaName]
 * @property {'pending_execution'|'in_progress'|'completed'} [executionStatus]
 */

/**
 * 生产计划筛选条件
 * @typedef {Object} ProductionPlanFilters
 * @property {string} [status]
 * @property {string} [planType]
 * @property {string} [keyword]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * 标准化 API 返回数据到 CropBatch 接口
 * 1:1 翻译 V1.1 normalizeBatch：后端 mapFieldsToFrontend 已做 snake_case→camelCase→前端期望字段映射
 * @param {Record<string, unknown> | null | undefined} raw
 * @returns {CropBatch}
 */
function normalizeBatch(raw) {
  const r = raw || {}
  return {
    id: r.id,
    batchCode: r.batchCode || '',
    cropName: (r.cropName) || '',
    cropType: (r.cropType) || '',
    variety: (r.variety) || '',
    // 后端 greenhouseId 永远为 null，用 greenhouseName（字符串，逗号分隔）作为唯一标识
    greenhouseId: (r.greenhouseId) || (r.greenhouseName) || '',
    greenhouseName: (r.greenhouseName) || '',
    plantingArea: (r.plantingArea) || 0,
    plantingAreaUnit: r.plantingAreaUnit,
    stage: (r.stage) || 'seedling',
    stageName: (r.stageName) || '',
    startDate: (r.startDate) || '',
    expectedHarvestDate: (r.expectedHarvestDate) || '',
    // API 返回 targetQuantity（后端 mapFieldsToFrontend: plannedQuantity→targetQuantity），前端用 targetYield
    targetYield: (r.targetYield) || (r.targetQuantity) || 0,
    actualYield: (r.actualYield) || 0,
    // API 返回 status，前端用 batchStatus
    batchStatus: (r.batchStatus) || (r.status) || 'draft',
    plantingMode: (r.plantingMode) || '',
    responsiblePerson: (r.responsiblePerson) || '',
    // 后端 mapFieldsToFrontend: create_by→publisher, update_time→lastModifyDate
    publisher: r.publisher || '',
    publishDate: r.publishDate,
    lastModifyDate: r.lastModifyDate || '',
    planDetailFileName: r.planDetailFileName,
    planDetail: r.planDetail,
    planType: r.planType,
    planTypeName: r.planTypeName,
    locationName: r.locationName,
    targetQuantity: r.targetQuantity,
    unit: r.unit,
    supplierName: r.supplierName,
    seedQuantity: r.seedQuantity,
    seedlingSiteName: r.seedlingSiteName,
    targetSeedlingCount: r.targetSeedlingCount,
    orderId: r.orderId,
    orderCode: r.orderCode,
    remarks: r.remarks,
    areaName: r.areaName,
    executionStatus: r.executionStatus,
  }
}

/**
 * 获取所有生产计划
 * 1:1 翻译 V1.1 getProductionPlans
 * @param {ProductionPlanFilters} [filters]
 * @returns {Promise<CropBatch[]>}
 */
export async function getProductionPlans(filters) {
  // V1.1: URLSearchParams + 字符串拼接；V2.0 用 URLSearchParams 保持一致
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
 * 1:1 翻译 V1.1 getProductionPlanById
 * @param {string} id
 * @returns {Promise<CropBatch | undefined>}
 */
export async function getProductionPlanById(id) {
  const data = await enhancedApiClient.get(`/production-plans/${id}`)
  if (!data) return undefined
  return normalizeBatch(data)
}

/**
 * 创建生产计划
 * 1:1 翻译 V1.1 createProductionPlan
 * 后端 P0-3 修复：现在 POST 返回 {success, message, data: createdData}，data 是完整对象
 * @param {Omit<CropBatch, 'id'>} plan
 * @returns {Promise<CropBatch>}
 */
export async function createProductionPlan(plan) {
  const data = await enhancedApiClient.post('/production-plans', plan)
  return normalizeBatch(data)
}

/**
 * 更新生产计划
 * 1:1 翻译 V1.1 updateProductionPlan
 * @param {string} id
 * @param {Partial<CropBatch>} updates
 * @returns {Promise<CropBatch | null>}
 */
export async function updateProductionPlan(id, updates) {
  const data = await enhancedApiClient.put(`/production-plans/${id}`, updates)
  if (!data) return null
  return normalizeBatch(data)
}

/**
 * 删除生产计划
 * 1:1 翻译 V1.1 deleteProductionPlan
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteProductionPlan(id) {
  await enhancedApiClient.delete(`/production-plans/${id}`)
  return true
}

/**
 * 批量删除生产计划
 * 1:1 翻译 V1.1 deleteProductionPlans
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteProductionPlans(ids) {
  await enhancedApiClient.delete(`/production-plans/batch?ids=${ids.join(',')}`)
  return true
}
