/**
 * 2026-07-22 1:1 迁移自 V1.1 services/apiPlantingDailyRecordService.ts
 * 种植管理每日记录 API Service
 *
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 * 复用 daily_records 通用表，record_type='planting'
 */

import { enhancedApiClient } from '@/lib/apiClient'

/**
 * 获取某种植批次的所有每日记录
 * @param {string} plantingId
 * @returns {Promise<Array>}
 */
export async function getPlantingDailyRecords(plantingId) {
  try {
    const res = await enhancedApiClient.get(`/plantings/${plantingId}/daily-records?limit=200`)
    const payload = res
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.data)) return payload.data
    return []
  } catch {
    return []
  }
}

/**
 * 新增每日记录
 * @param {string} plantingId
 * @param {Object} record
 * @returns {Promise<Object|null>}
 */
export async function addPlantingDailyRecord(plantingId, record) {
  try {
    return await enhancedApiClient.post(`/plantings/${plantingId}/daily-records`, record)
  } catch {
    return null
  }
}

/**
 * 更新每日记录
 * @param {string} plantingId
 * @param {string} recordId
 * @param {Object} updates
 * @returns {Promise<boolean>}
 */
export async function updatePlantingDailyRecord(plantingId, recordId, updates) {
  try {
    await enhancedApiClient.put(`/plantings/${plantingId}/daily-records/${recordId}`, updates)
    return true
  } catch {
    return false
  }
}

/**
 * 删除每日记录
 * @param {string} plantingId
 * @param {string} recordId
 * @returns {Promise<boolean>}
 */
export async function deletePlantingDailyRecord(plantingId, recordId) {
  try {
    await enhancedApiClient.delete(`/plantings/${plantingId}/daily-records/${recordId}`)
    return true
  } catch {
    return false
  }
}
