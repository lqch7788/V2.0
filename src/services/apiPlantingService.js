/**
 * 种植数据 API 服务
 * 对接后端 /api/plantings
 *
 * 1:1 翻译自 V1.1 src/services/apiPlantingService.ts
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\apiPlantingService.ts
 */

import request from '../api/request'

/**
 * @typedef {import('@/types/crop').Planting} Planting
 * @typedef {import('@/types/crop').PlantingStatus} PlantingStatus
 * @typedef {import('@/types/crop').SourceType} SourceType
 */

/**
 * 后端返回的原始数据字段类型（已经过 queryToObjects 转换为驼峰命名）
 * @typedef {Object} BackendPlanting
 * @property {string} id
 * @property {string} plantCode
 * @property {string} sourceType
 * @property {string} sourceId
 * @property {string} sourceCode
 * @property {string} cropCode
 * @property {string} cropName
 * @property {string} cropVariety
 * @property {string} areaId
 * @property {string} areaName
 * @property {string} rootName
 * @property {number} plantingCount
 * @property {string} plantingDate
 * @property {number} soilPH
 * @property {number} soilEC
 * @property {number} transplantCount
 * @property {string} transplantDate
 * @property {boolean} isHarvest
 * @property {string} harvestDate
 * @property {number} attritionRate
 * @property {number} printCount
 * @property {string} traceabilityCode
 * @property {string} pictures
 * @property {string} greenhouseName
 * @property {number} plantedQuantity
 * @property {number} survivalQuantity
 * @property {number} survivalRate
 * @property {string} growthStatus
 * @property {string} expectedHarvestDate
 * @property {string} actualHarvestDate
 * @property {number} harvestQuantity
 * @property {string} status
 * @property {string} remarks
 * @property {string} productionPlanId
 * @property {string} productionPlanCode
 * @property {string} createBy
 * @property {string} createTime
 * @property {string} updateTime
 */

/**
 * 将后端返回的字段名映射到前端 Planting 类型
 * @param {BackendPlanting | BackendPlanting[]} data
 * @returns {Planting | Planting[]}
 */
function transformPlantingFromBackend(data) {
  if (Array.isArray(data)) {
    return data.map((item) => transformSinglePlanting(item))
  }
  return transformSinglePlanting(data)
}

/**
 * 单条数据转换
 * @param {BackendPlanting} item
 * @returns {Planting}
 */
function transformSinglePlanting(item) {
  /** @type {string[]} */
  let pictures = []
  if (item.pictures) {
    try {
      pictures = JSON.parse(item.pictures)
    } catch (e) {
      pictures = []
    }
  }

  /** @type {string} */
  let status = 'planted'
  if (item.status === 'growing') {
    status = 'growing'
  } else if (item.status === 'harvested') {
    status = 'harvested'
  } else if (item.status === 'cancelled') {
    status = 'cancelled'
  }

  /** @type {string} */
  let sourceType = 'seedling'
  if (item.sourceType === 'seed') {
    sourceType = 'seed'
  } else if (item.sourceType === 'cutting') {
    sourceType = 'cutting'
  } else if (item.sourceType === 'grafting') {
    sourceType = 'grafting'
  } else if (item.sourceType === 'tissue_culture') {
    sourceType = 'tissue_culture'
  }

  return {
    id: item.id,
    plantCode: item.plantCode || '',
    sourceType: sourceType,
    sourceId: item.sourceId || '',
    sourceCode: item.sourceCode || '',
    cropName: item.cropName || '',
    cropVariety: item.cropVariety || '',
    cropCode: item.cropCode || '',
    areaId: item.areaId || '',
    areaName: item.areaName || '',
    rootName: item.rootName || '',
    plantingCount: item.plantingCount || 0,
    plantingDate: item.plantingDate ? item.plantingDate.split('T')[0] : '',
    soilPH: item.soilPH || 0,
    soilEC: item.soilEC || 0,
    transplantCount: item.transplantCount || 0,
    transplantDate: item.transplantDate || '',
    isHarvest: item.isHarvest || false,
    harvestDate: item.harvestDate || '',
    attritionRate: item.attritionRate || 0,
    printCount: item.printCount || 0,
    traceabilityCode: item.traceabilityCode || '',
    pictures: pictures,
    remarks: item.remarks || '',
    status: status,
    productionPlanId: item.productionPlanId || '',
    productionPlanCode: item.productionPlanCode || '',
    createBy: item.createBy || '',
    createTime: item.createTime ? item.createTime.split('T')[0] : '',
    updateTime: item.updateTime || ''
  }
}

/**
 * 获取所有种植记录
 * 数据流：API → SQLite DB
 * @returns {Promise<Planting[]>}
 */
export async function getPlantings() {
  const data = await request({
    url: '/plantings',
    method: 'get'
  })
  return transformPlantingFromBackend(data)
}

/**
 * 根据ID获取单个种植记录
 * 数据流：API → SQLite DB
 * @param {string} id
 * @returns {Promise<Planting | undefined>}
 */
export async function getPlantingById(id) {
  const data = await request({
    url: `/plantings/${id}`,
    method: 'get'
  })
  return transformPlantingFromBackend(data)
}

/**
 * 根据ID数组获取多个种植记录
 * 数据流：API → SQLite DB
 * @param {string[]} ids
 * @returns {Promise<Planting[]>}
 */
export async function getPlantingsByIds(ids) {
  const data = await request({
    url: `/plantings/batch?ids=${ids.join(',')}`,
    method: 'get'
  })
  return transformPlantingFromBackend(data)
}

/**
 * 根据来源获取种植记录
 * 数据流：API → SQLite DB
 * @param {string} sourceId
 * @returns {Promise<Planting[]>}
 */
export async function getPlantingsBySourceId(sourceId) {
  const data = await request({
    url: `/plantings/source/${sourceId}`,
    method: 'get'
  })
  return transformPlantingFromBackend(data)
}

/**
 * 创建种植记录
 * 数据流：API → SQLite DB
 * @param {Omit<Planting, 'id' | 'createTime' | 'updateTime'>} planting
 * @returns {Promise<Planting>}
 */
export async function addPlanting(planting) {
  const result = await request({
    url: '/plantings',
    method: 'post',
    data: planting
  })
  return { ...planting, id: result.id }
}

/**
 * 更新种植记录
 * 数据流：API → SQLite DB
 * @param {string} id
 * @param {Partial<Planting>} updates
 * @returns {Promise<Planting | null>}
 */
export async function updatePlanting(id, updates) {
  const result = await request({
    url: `/plantings/${id}`,
    method: 'put',
    data: updates
  })
  return result ? { ...updates, id } : null
}

/**
 * 删除种植记录
 * 数据流：API → SQLite DB
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deletePlanting(id) {
  await request({
    url: `/plantings/${id}`,
    method: 'delete'
  })
  return true
}

/**
 * 批量删除种植记录
 * 数据流：API → SQLite DB
 * @param {string[]} ids
 * @returns {Promise<boolean>}
 */
export async function deletePlantings(ids) {
  await request({
    url: `/plantings/batch?ids=${ids.join(',')}`,
    method: 'delete'
  })
  return true
}

/**
 * 检查种植记录是否可删除（是否被标签引用）
 * 1:1 翻译自 V2.0 已有 apiPlantingService.ts（V1.1 中无此函数）
 * @param {string} id
 * @returns {Promise<{ deletable: boolean, labelCount: number }>}
 */
export async function checkPlantingDeletable(id) {
  try {
    const data = await request({
      url: `/plantings/${id}/check-deletable`,
      method: 'get'
    })
    return data || { deletable: true, labelCount: 0 }
  } catch (e) {
    // 检查失败时返回可删除（降级策略）
    return { deletable: true, labelCount: 0 }
  }
}

/**
 * 采收种植记录
 * 数据流：API → SQLite DB
 * @param {string} id
 * @param {string} harvestDate
 * @param {number} [harvestCount]
 * @returns {Promise<boolean>}
 */
export async function harvestPlanting(id, harvestDate, harvestCount) {
  await request({
    url: `/plantings/${id}/harvest`,
    method: 'post',
    data: { harvestDate, harvestCount }
  })
  return true
}

/**
 * 获取未采收的种植记录
 * 数据流：API → SQLite DB
 * @returns {Promise<Planting[]>}
 */
export async function getUnharvestedPlantings() {
  const data = await request({
    url: '/plantings/unharvested',
    method: 'get'
  })
  return transformPlantingFromBackend(data)
}

/**
 * 获取已采收的种植记录
 * 数据流：API → SQLite DB
 * @returns {Promise<Planting[]>}
 */
export async function getHarvestedPlantings() {
  const data = await request({
    url: '/plantings/harvested',
    method: 'get'
  })
  return transformPlantingFromBackend(data)
}

/**
 * 生成种植单号
 * 数据流：API → SQLite DB
 * @param {string} sourceCode
 * @returns {Promise<string>}
 */
export async function generatePlantCode(sourceCode) {
  try {
    const data = await request({
      url: `/plantings/generate-code?sourceCode=${sourceCode}`,
      method: 'get'
    })
    return data || ''
  } catch (e) {
    return ''
  }
}

/**
 * 重置种植数据（仅调用后端）
 * @returns {Promise<void>}
 */
export async function resetPlantings() {
  await request({
    url: '/plantings/reset',
    method: 'post'
  })
}
