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
 * 兼容多种后端字段名：planCode/batchCode、plantingDate/startDate、plannedQuantity/targetYield
 * @param {Record<string, unknown> | null | undefined} raw
 * @returns {CropBatch}
 */
function normalizeBatch(raw) {
  const r = raw || {}
  return {
    id: r.id,
    // 后端返回 planCode，前端用 batchCode
    batchCode: r.batchCode || r.planCode || '',
    cropName: (r.cropName) || '',
    cropType: (r.cropType) || '',
    // 后端返回 cropVariety，前端用 variety
    variety: (r.variety) || (r.cropVariety) || '',
    // 后端 greenhouseId 永远为 null，用 greenhouseName（字符串，逗号分隔）作为唯一标识
    greenhouseId: (r.greenhouseId) || (r.greenhouseName) || '',
    greenhouseName: (r.greenhouseName) || '',
    plantingArea: (r.plantingArea) || 0,
    plantingAreaUnit: r.plantingAreaUnit,
    stage: (r.stage) || 'seedling',
    stageName: (r.stageName) || '',
    // 后端返回 plantingDate，前端用 startDate
    startDate: (r.startDate) || (r.plantingDate) || '',
    expectedHarvestDate: (r.expectedHarvestDate) || '',
    // 后端返回 plannedQuantity，前端用 targetYield
    targetYield: (r.targetYield) || (r.plannedQuantity) || (r.targetQuantity) || 0,
    actualYield: (r.actualYield) || 0,
    // API 返回 status，前端用 batchStatus
    batchStatus: (r.batchStatus) || (r.status) || 'draft',
    plantingMode: (r.plantingMode) || '',
    responsiblePerson: (r.responsiblePerson) || '',
    // 后端返回 createBy/updateTime，前端期望 publisher/lastModifyDate
    publisher: (r.publisher) || (r.createBy) || '',
    publishDate: r.publishDate,
    lastModifyDate: (r.lastModifyDate) || (r.updateTime) || '',
    planDetailFileName: r.planDetailFileName,
    planDetail: r.planDetail,
    planType: r.planType,
    planTypeName: r.planTypeName,
    locationName: r.locationName,
    targetQuantity: r.targetQuantity || r.plannedQuantity || 0,
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
 * 后端返回 {success: true, message, id, code} 格式（data 字段在顶层），
 * 而 request 拦截器对 success 状态返回 data 字段（即 undefined）。
 * 修复：传入整个 plan 数据 + 后端返回的 id/code 构造 CropBatch
 * @param {Omit<CropBatch, 'id'>} plan
 * @returns {Promise<CropBatch>}
 */
export async function createProductionPlan(plan) {
  await request({
    url: '/production-plans',
    method: 'post',
    data: plan
  })
  // 后端返回 {success, message, id, code}，data 字段为 undefined
  // 直接用 plan 数据 + 生成的 id 构造 CropBatch
  return normalizeBatch({
    ...plan,
    id: plan.id || `PP${Date.now()}`
  })
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
