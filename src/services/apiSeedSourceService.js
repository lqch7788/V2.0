/**
 * 种源数据 API 服务（V2.0 1:1 兼容层）
 *
 * 2026-07-18 P0 优化：消除与 @/api/crop 的 API 双轨实现。
 *
 * 历史背景：
 * - 老轨（本文件）使用 enhancedApiClient + IndexedDB 缓存 + 离线队列
 * - 新轨（@/api/crop）使用标准 request
 *
 * 当前策略：
 * - 权威 API 入口：@/api/crop（标准 URL、清晰的请求/响应封装）
 * - 本文件作为**向后兼容层**：保留所有原有函数签名 + 字段转换（snake_case → camelCase）
 *   让所有老调用方（planting/AddModal.vue、seed-source/modals/DetailModal.vue 等）零改动
 * - 字段转换逻辑（transformSeedSourceFromBackend）保留，确保下游消费的 SeedSource 类型不变
 *
 * 数据流：组件 → 本文件（兼容层）→ @/api/crop → 后端 /api/seed-sources
 */
import * as cropApi from '@/api/crop'
import { SourceType } from '@/types/crop'

/**
 * 后端返回的字段类型（snake_case）
 * @typedef {Object} BackendSeedSource
 * @property {string} id
 * @property {string} seed_code
 * @property {string} source_type
 * @property {string} source_origin
 * @property {string} crop_category
 * @property {string} type_name
 * @property {string} variety_name
 * @property {string} crop_name
 * @property {string} crop_variety
 * @property {string} crop_code
 * @property {string} supplier_id
 * @property {string} supplier_name
 * @property {string} purchase_date
 * @property {number} quantity
 * @property {string} unit
 * @property {number} purchase_price
 * @property {number} total_amount
 * @property {number} remaining_quantity
 * @property {number} used_quantity
 * @property {string} status
 * @property {string} remarks
 * @property {string} create_by
 * @property {string} create_time
 * @property {string} update_time
 */

/**
 * 将后端返回的字段名映射到前端 SeedSource 类型（camelCase）
 * @param {BackendSeedSource|BackendSeedSource[]} data
 * @returns {Object|Object[]}
 */
function transformSeedSourceFromBackend(data) {
  if (Array.isArray(data)) {
    return data.map(item => transformSingleSeedSource(item))
  }
  if (data == null) return data
  return transformSingleSeedSource(data)
}

function transformSingleSeedSource(item) {
  let pictures = []
  if (item.pictures) {
    try {
      pictures = typeof item.pictures === 'string' ? JSON.parse(item.pictures) : item.pictures
    } catch {
      pictures = []
    }
  }

  let sourceType = SourceType.SEED
  if (item.sourceType === 'seedling') {
    sourceType = SourceType.SEEDLING
  } else if (item.sourceType === 'cutting') {
    sourceType = SourceType.CUTTING
  } else if (item.sourceType === 'grafting') {
    sourceType = SourceType.GRAFTING
  } else if (item.sourceType === 'tissue_culture') {
    sourceType = SourceType.TISSUE_CULTURE
  }

  let status = 'sufficient'
  if (item.status === 'low') {
    status = 'low'
  } else if (item.status === 'depleted') {
    status = 'depleted'
  }

  return {
    id: item.id,
    seedCode: item.seedCode || item.seed_code || '',
    sourceType,
    sourceOrigin: item.sourceOrigin || item.source_origin || 'external_purchase',
    cropCategory: item.cropCategory || item.crop_category || '',
    typeName: item.typeName || item.type_name || '',
    varietyName: item.varietyName || item.variety_name || '',
    cropName: item.cropName || item.crop_name || '',
    cropVariety: item.cropVariety || item.crop_variety || '',
    cropCode: item.cropCode || item.crop_code || '',
    supplierId: item.supplierId || item.supplier_id || '',
    supplierName: item.supplierName || item.supplier_name || '',
    purchaseDate: item.purchaseDate || item.purchase_date || '',
    quantity: item.quantity || 0,
    unit: item.unit || '',
    unitPrice: item.unitPrice ?? item.purchase_price ?? 0,
    totalAmount: item.totalAmount || item.total_amount || 0,
    initialCount: item.initialCount ?? item.quantity ?? 0,
    availableCount: item.availableCount ?? item.remaining_quantity ?? 0,
    pictures,
    remarks: item.remarks || '',
    status,
    printCount: item.printCount || 0,
    createBy: item.createBy || item.create_by || '',
    createTime: item.createTime || item.create_time || '',
    updateTime: item.updateTime || item.update_time || '',
    productionPlanId: item.productionPlanId || '',
    productionPlanCode: item.productionPlanCode || '',
    propagationType: item.propagationType || 'external',
    propagationStatus: item.propagationStatus,
    endTime: item.endTime,
    endType: item.endType
  }
}

/**
 * 将前端 SeedSource（camelCase）转换为后端期望的字段（snake_case）
 * @param {Object} source
 * @returns {Object}
 */
function toBackendPayload(source) {
  return {
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
    remaining_quantity: source.availableCount ?? source.quantity,
    used_quantity: source.usedQuantity || 0,
    status: source.status,
    remarks: source.remarks || '',
    create_by: source.createBy
  }
}

/**
 * 获取所有种源（驼峰命名 + 字段标准化）
 * @returns {Promise<Object[]>}
 */
export async function getSeedSources() {
  const data = await cropApi.getSeedSourceList()
  return transformSeedSourceFromBackend(data || [])
}

/**
 * 关键字搜索种源
 * @param {string} keyword
 * @returns {Promise<Object[]>}
 */
export async function searchSeedSources(keyword) {
  const data = await cropApi.searchSeedSources(keyword)
  return transformSeedSourceFromBackend(data || [])
}

/**
 * 根据ID获取单个种源
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
export async function getSeedSourceById(id) {
  const data = await cropApi.getSeedSourceDetail(id)
  return transformSeedSourceFromBackend(data)
}

/**
 * 根据ID数组获取多个种源
 * @param {string[]} ids
 * @returns {Promise<Object[]>}
 */
export async function getSeedSourcesByIds(ids) {
  const data = await cropApi.getSeedSourcesByIds(ids)
  return transformSeedSourceFromBackend(data || [])
}

/**
 * 创建种源
 * @param {Object} source - 前端 SeedSource（camelCase）
 * @returns {Promise<Object>}
 */
export async function addSeedSource(source) {
  const result = await cropApi.createSeedSource(toBackendPayload(source))
  return { ...source, id: result?.id || result?.data?.id }
}

/**
 * 更新种源
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object|null>}
 */
export async function updateSeedSource(id, updates) {
  const result = await cropApi.updateSeedSource(id, toBackendPayload(updates))
  return result ? { ...updates, id } : null
}

/**
 * 删除种源
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteSeedSource(id) {
  await cropApi.deleteSeedSource(id)
  return true
}

/**
 * 批量删除种源
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deleteSeedSources(ids) {
  await cropApi.deleteSeedSources(ids)
  return true
}

/**
 * 检查种源是否可删除
 * @param {string} id
 * @returns {Promise<{deletable: boolean, references: Array}>}
 */
export async function checkSeedSourceDeletable(id) {
  const data = await cropApi.checkSeedSourceDeletable(id)
  return data || { deletable: true, references: [] }
}

/**
 * 减少可用数量
 * @param {string} id
 * @param {number} count
 * @returns {Promise<boolean>}
 */
export async function decreaseAvailableCount(id, count) {
  await cropApi.decreaseAvailableCount(id, count)
  return true
}

/**
 * 重置种源数据（开发用）
 * @returns {Promise<void>}
 */
export async function resetSeedSources() {
  // 该接口在 api/crop 中未实现，保留为 noop 兼容老调用方
  console.warn('[apiSeedSourceService] resetSeedSources 在新轨 @/api/crop 中未实现')
}

/**
 * 获取当日最大序号
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<number>}
 */
export async function getTodayMaxSeedCodeSerial(dateStr) {
  try {
    const data = await cropApi.getTodayMaxSeedCodeSerial(dateStr)
    return data?.max_serial ?? data ?? 0
  } catch {
    return 0
  }
}

/**
 * 生成种源编码
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<string>}
 */
export async function generateSeedCode(dateStr) {
  try {
    const data = await cropApi.generateSeedCode(dateStr)
    return data?.code || data || ''
  } catch {
    return ''
  }
}

/**
 * 检查种源批号是否已存在
 * @param {string} code
 * @returns {Promise<boolean>}
 */
export async function checkSourceCodeExists(code) {
  const data = await cropApi.checkSourceCodeExists(code)
  return data?.exists ?? !!data
}

/**
 * 添加繁殖过程记录
 * @param {string} seedSourceId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function addPropagationRecord(seedSourceId, data) {
  return cropApi.addPropagationRecord(seedSourceId, data)
}

/**
 * 获取繁殖过程记录列表
 * @param {string} seedSourceId
 * @returns {Promise<Object[]>}
 */
export async function getPropagationRecords(seedSourceId) {
  const data = await cropApi.getPropagationRecords(seedSourceId)
  return Array.isArray(data) ? data : []
}

/**
 * 更新繁殖过程记录
 * @param {string} seedSourceId
 * @param {string} recordId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updatePropagationRecord(seedSourceId, recordId, data) {
  return cropApi.updatePropagationRecord(seedSourceId, recordId, data)
}

/**
 * 删除繁殖过程记录
 * @param {string} seedSourceId
 * @param {string} recordId
 * @returns {Promise<boolean>}
 */
export async function deletePropagationRecord(seedSourceId, recordId) {
  await cropApi.deletePropagationRecord(seedSourceId, recordId)
  return true
}

/**
 * 获取所有种源的繁殖过程记录
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function getAllPropagationRecords(params = {}) {
  return cropApi.getAllPropagationRecords(params)
}

/**
 * 推进繁殖阶段
 * @param {string} seedSourceId
 * @param {string} newStage
 * @returns {Promise<{id: string, new_stage: string}>}
 */
export async function updatePropagationStage(seedSourceId, newStage) {
  return cropApi.updatePropagationStage(seedSourceId, newStage)
}

/**
 * 完成繁殖入库
 * @param {string} seedSourceId
 * @param {number} quantity
 * @returns {Promise<{id: string, quantity: number}>}
 */
export async function completePropagation(seedSourceId, quantity) {
  return cropApi.completePropagation(seedSourceId, quantity)
}

/**
 * 获取可用于留种的种植记录
 * @returns {Promise<Object[]>}
 */
export async function getPlantingsForSeedSaving() {
  const data = await cropApi.getPlantingsForSeedSaving?.() || []
  return Array.isArray(data) ? data : []
}

/**
 * 获取某一种源的使用记录
 * @param {string} seedSourceId
 * @returns {Promise<Object[]>}
 */
export async function getSeedSourceUsageRecords(seedSourceId) {
  if (!seedSourceId) return []
  const data = await cropApi.getSeedSourceUsageRecords(seedSourceId)
  return Array.isArray(data) ? data : []
}

/**
 * 获取某种源的入库历史
 * @param {string} seedSourceId
 * @returns {Promise<Object[]>}
 */
export async function getSeedSourceInboundHistory(seedSourceId) {
  if (!seedSourceId) return []
  const data = await cropApi.getSeedSourceInboundHistory(seedSourceId)
  return Array.isArray(data) ? data : []
}

/**
 * 获取标签打印记录
 * @param {string} seedSourceId
 * @returns {Promise<Object[]>}
 */
export async function getPrintRecords(seedSourceId) {
  if (!seedSourceId) return []
  const data = await cropApi.getPrintRecords(seedSourceId)
  return Array.isArray(data) ? data : []
}

/**
 * 创建标签打印记录
 * @param {string} seedSourceId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createPrintRecord(seedSourceId, data) {
  return cropApi.createPrintRecord(seedSourceId, data)
}

/**
 * 打印标签（增加打印计数）
 * @param {string} seedSourceId
 * @param {number} count
 * @param {string} mode
 * @returns {Promise<Object>}
 */
export async function printLabel(seedSourceId, count, mode) {
  return cropApi.printLabel(seedSourceId, count, mode)
}

/**
 * 可用种源查询（按库存查找可调拨的）
 * @param {Object} params
 * @returns {Promise<Object[]>}
 */
export async function lookupAvailableSeedSources(params) {
  const data = await cropApi.lookupAvailableSeedSources(params)
  return Array.isArray(data) ? data : []
}

// 兼容 V1.1 老调用方：从 constants/seedSourceDict 等模块可能引用 SourceType
export { SourceType }
