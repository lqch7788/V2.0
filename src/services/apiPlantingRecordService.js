/**
 * 种植季记录 API 服务（基地空间架构 V1.0）
 * 对接后端 /api/planting-records
 *
 * 1:1 翻译自 V1.1 src/services/apiPlantingRecordService.ts
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\apiPlantingRecordService.ts
 */

import request from '../api/request'

/**
 * @typedef {Object} PlantingRecord
 * @property {number} id
 * @property {string} oid
 * @property {string} facilityOid
 * @property {string} blockOid
 * @property {string} seasonCode
 * @property {string} cropVarietyOid
 * @property {string} cropName
 * @property {string} varietyName
 * @property {string} startDate
 * @property {string | null} endDate
 * @property {string} status
 * @property {number | null} yieldAmount
 * @property {string} yieldUnit
 * @property {string | null} qualityGrade
 * @property {string} notes
 * @property {string} [facilityName]
 * @property {string} [facilityCode]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string | null} deletedAt
 */

/**
 * @typedef {Object} PlantingRecordQuery
 * @property {string} [facility_oid]
 * @property {string} [block_oid]
 * @property {string} [season_code]
 * @property {string} [status]
 * @property {string} [year]
 */

/**
 * @typedef {Object} CreatePlantingRecordData
 * @property {string} facility_oid
 * @property {string} [block_oid]
 * @property {string} [crop_variety_oid]
 * @property {string} crop_name
 * @property {string} [variety_name]
 * @property {string} [start_date]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} EndPlantingSeasonData
 * @property {string} end_date
 * @property {number} [yield_amount]
 * @property {string} [yield_unit]
 * @property {string} [quality_grade]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} BackendPlantingRecord
 * @property {number} id
 * @property {string} oid
 * @property {string} facility_oid
 * @property {string} [block_oid]
 * @property {string} season_code
 * @property {string} [crop_variety_oid]
 * @property {string} crop_name
 * @property {string} [variety_name]
 * @property {string} start_date
 * @property {string | null} [end_date]
 * @property {string} status
 * @property {number | null} [yield_amount]
 * @property {string} [yield_unit]
 * @property {string | null} [quality_grade]
 * @property {string} [notes]
 * @property {string} [facility_name]
 * @property {string} [facility_code]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} [deleted_at]
 */

/**
 * 将后端 snake_case 数据转换为前端 camelCase 格式
 * @param {BackendPlantingRecord} r
 * @returns {PlantingRecord}
 */
function transformPlantingRecord(r) {
  return {
    id: r.id,
    oid: r.oid,
    facilityOid: r.facility_oid,
    blockOid: r.block_oid || '',
    seasonCode: r.season_code,
    cropVarietyOid: r.crop_variety_oid || '',
    cropName: r.crop_name,
    varietyName: r.variety_name || '',
    startDate: r.start_date,
    endDate: r.end_date || null,
    status: r.status,
    yieldAmount: r.yield_amount ?? null,
    yieldUnit: r.yield_unit || 'kg',
    qualityGrade: r.quality_grade || null,
    notes: r.notes || '',
    facilityName: r.facility_name,
    facilityCode: r.facility_code,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at || null
  }
}

/**
 * 获取种植季记录列表
 * @param {PlantingRecordQuery} [query]
 * @returns {Promise<PlantingRecord[]>}
 */
export async function getPlantingRecords(query) {
  // 过滤掉空值字段（保留与 V1.1 一致的 URLSearchParams 行为）
  const params = {}
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v
    })
  }
  const records = await request({
    url: '/planting-records',
    method: 'get',
    params
  })
  if (!records) return []
  // 后端返回 snake_case，转换为 camelCase
  return records.map((r) => transformPlantingRecord(r))
}

/**
 * 获取单条种植季记录
 * @param {string} oid
 * @returns {Promise<PlantingRecord>}
 */
export async function getPlantingRecord(oid) {
  const r = await request({
    url: `/planting-records/${oid}`,
    method: 'get'
  })
  return transformPlantingRecord(r)
}

/**
 * 创建种植季记录
 * @param {CreatePlantingRecordData} data
 * @returns {Promise<PlantingRecord>}
 */
export async function createPlantingRecord(data) {
  const r = await request({
    url: '/planting-records',
    method: 'post',
    data
  })
  return transformPlantingRecord(r)
}

/**
 * 更新种植季记录
 * @param {string} oid
 * @param {Record<string, any>} data
 * @returns {Promise<PlantingRecord>}
 */
export async function updatePlantingRecord(oid, data) {
  const r = await request({
    url: `/planting-records/${oid}`,
    method: 'put',
    data
  })
  return transformPlantingRecord(r)
}

/**
 * 结束种植季
 * @param {string} oid
 * @param {EndPlantingSeasonData} data
 * @returns {Promise<PlantingRecord>}
 */
export async function endPlantingSeason(oid, data) {
  const r = await request({
    url: `/planting-records/${oid}/end`,
    method: 'put',
    data
  })
  return transformPlantingRecord(r)
}

/**
 * 删除种植季记录（软删除）
 * @param {string} oid
 * @returns {Promise<void>}
 */
export async function deletePlantingRecord(oid) {
  await request({
    url: `/planting-records/${oid}`,
    method: 'delete'
  })
}
