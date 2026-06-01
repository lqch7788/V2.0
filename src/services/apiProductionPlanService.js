/**
 * 生产计划 API 服务
 * 对接后端 /api/production-plans
 *
 * 核心原则：服务器数据是唯一真相来源
 *
 * 数据流：API → request（无缓存）→ 组件
 *
 * 缓存策略（已确认无三级缓存）：
 * - L1：Pinia Store 内存数组
 * - L2：（未使用）无 IndexedDB 缓存
 * - L3：（未使用）生产计划页面不读取 localStorage
 *
 * 网络策略：失败时由 request 拦截器统一处理
 *
 * 1:1 翻译自 V1.1 src/services/apiProductionPlanService.ts
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\apiProductionPlanService.ts
 */

import request from '../api/request'

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
 * 处理后端字段名与前端接口名不一致的问题
 * @param {Record<string, unknown>} raw
 * @returns {CropBatch}
 */
function normalizeBatch(raw) {
  return {
    id: raw.id,
    batchCode: raw.batchCode,
    cropName: (raw.cropName) || '',
    cropType: (raw.cropType) || '',
    variety: (raw.variety) || '',
    greenhouseId: (raw.greenhouseId) || (raw.greenhouseName) || '',
    greenhouseName: (raw.greenhouseName) || '',
    plantingArea: (raw.plantingArea) || 0,
    plantingAreaUnit: raw.plantingAreaUnit,
    stage: (raw.stage) || 'seedling',
    stageName: (raw.stageName) || '',
    startDate: (raw.startDate) || '',
    expectedHarvestDate: (raw.expectedHarvestDate) || '',
    // API 返回 targetQuantity，映射到 targetYield
    targetYield: (raw.targetQuantity) || (raw.targetYield) || 0,
    actualYield: (raw.actualYield) || 0,
    // API 返回 status，前端用 batchStatus
    batchStatus: (raw.status) || (raw.batchStatus) || 'draft',
    plantingMode: (raw.plantingMode) || '',
    responsiblePerson: (raw.responsiblePerson) || '',
    publisher: raw.publisher,
    publishDate: raw.publishDate,
    lastModifyDate: raw.lastModifyDate,
    planDetailFileName: raw.planDetailFileName,
    planDetail: raw.planDetail,
    planType: raw.planType,
    planTypeName: raw.planTypeName,
    locationName: raw.locationName,
    targetQuantity: raw.targetQuantity,
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
 * @param {ProductionPlanFilters} [filters]
 * @returns {Promise<CropBatch[]>}
 */
export async function getProductionPlans(filters) {
  // 过滤掉空值字段（保留与 V1.1 一致的 URLSearchParams 行为）
  const params = {}
  if (filters) {
    if (filters.status) params.status = filters.status
    if (filters.planType) params.plan_type = filters.planType
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit
  }

  const data = await request({
    url: '/production-plans',
    method: 'get',
    params
  })
  if (!Array.isArray(data)) return []
  return data.map((item) => normalizeBatch(item))
}

/**
 * 根据ID获取单个生产计划
 * @param {string} id
 * @returns {Promise<CropBatch | undefined>}
 */
export async function getProductionPlanById(id) {
  const data = await request({
    url: `/production-plans/${id}`,
    method: 'get'
  })
  if (!data) return undefined
  return normalizeBatch(data)
}

/**
 * 创建生产计划
 * @param {Omit<CropBatch, 'id'>} plan
 * @returns {Promise<CropBatch>}
 */
export async function createProductionPlan(plan) {
  const data = await request({
    url: '/production-plans',
    method: 'post',
    data: plan
  })
  return normalizeBatch(data)
}

/**
 * 更新生产计划
 * @param {string} id
 * @param {Partial<CropBatch>} updates
 * @returns {Promise<CropBatch | null>}
 */
export async function updateProductionPlan(id, updates) {
  const data = await request({
    url: `/production-plans/${id}`,
    method: 'put',
    data: updates
  })
  if (!data) return null
  return normalizeBatch(data)
}

/**
 * 删除生产计划
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteProductionPlan(id) {
  await request({
    url: `/production-plans/${id}`,
    method: 'delete'
  })
  return true
}

/**
 * 批量删除生产计划
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteProductionPlans(ids) {
  await request({
    url: `/production-plans/batch?ids=${ids.join(',')}`,
    method: 'delete'
  })
  return true
}
