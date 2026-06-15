/**
 * 巡查管理 API 服务
 * 从 V1.1 src/services/apiInspectionService.ts 1:1 翻译（TS→JS）
 *
 * 数据流：API → enhancedApiClient → 组件（无缓存层，V2.1 铁律）
 *
 * 降级策略：
 * - GET 请求：API 直连（V2.1 铁律：无缓存）
 * - POST/PUT/DELETE：API 直连 + enhancedApiClient 3 次重试（无离线队列）
 *
 * 对接后端: /api/inspections
 */

import { enhancedApiClient } from '@/lib/apiClient'

/**
 * 获取所有巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getAllInspections() {
  return await enhancedApiClient.get('/inspections')
}

/**
 * 根据ID获取巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspectionById(id) {
  return await enhancedApiClient.get(`/inspections/${id}`)
}

/**
 * 根据巡查编码获取巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspectionByCode(recordCode) {
  return await enhancedApiClient.get(`/inspections/code/${recordCode}`)
}

/**
 * 获取巡查记录列表（支持筛选）
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspections(filters = {}) {
  const params = {}
  if (filters.greenhouseId) params.greenhouseId = filters.greenhouseId
  if (filters.inspectorId) params.inspectorId = filters.inspectorId
  if (filters.status) params.status = filters.status
  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  if (filters.inspectionType) params.inspectionType = filters.inspectionType
  const paramsStr = new URLSearchParams(params).toString()
  const url = paramsStr ? `/inspections?${paramsStr}` : '/inspections'
  return await enhancedApiClient.get(url)
}

/**
 * 创建巡查记录
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 */
export async function createInspection(inspection) {
  return await enhancedApiClient.post('/inspections', inspection)
}

/**
 * 更新巡查记录
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 */
export async function updateInspection(id, updates) {
  const result = await enhancedApiClient.put(`/inspections/${id}`, updates)
  return result
}

/**
 * 删除巡查记录
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 */
export async function deleteInspection(id) {
  await enhancedApiClient.delete(`/inspections/${id}`)
  return true
}

/**
 * 批量删除巡查记录
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 */
export async function deleteInspections(ids) {
  await enhancedApiClient.delete(`/inspections/batch?ids=${ids.join(',')}`)
  return true
}

/**
 * 根据大棚ID获取巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspectionsByGreenhouse(greenhouseId) {
  return await enhancedApiClient.get(`/inspections/greenhouse/${greenhouseId}`)
}

/**
 * 根据巡查人员ID获取巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspectionsByInspector(inspectorId) {
  return await enhancedApiClient.get(`/inspections/inspector/${inspectorId}`)
}

/**
 * 根据日期范围获取巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspectionsByDateRange(startDate, endDate) {
  return await enhancedApiClient.get(`/inspections/date-range?start=${startDate}&end=${endDate}`)
}

/**
 * 根据状态获取巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspectionsByStatus(status) {
  return await enhancedApiClient.get(`/inspections/status/${status}`)
}

/**
 * 获取异常的巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getCriticalInspections() {
  return await enhancedApiClient.get('/inspections/critical')
}

/**
 * 生成巡查编码
 */
export async function generateInspectionCode() {
  return await enhancedApiClient.get('/inspections/generate-code')
}

/**
 * 关联问题分派
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 */
export async function assignProblem(inspectionId, problemId) {
  await enhancedApiClient.post(`/inspections/${inspectionId}/assign-problem`, { problemId })
  return true
}

/**
 * 创建问题并关联
 * 巡查异常 → 自动创建问题（待分派）
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 */
export async function createProblemFromInspection(inspectionId, problemData) {
  const result = await enhancedApiClient.post(`/inspections/${inspectionId}/create-problem`, problemData)
  return result.id
}

/**
 * 获取巡查统计
 * 返回 { total, normal, attention, critical }
 */
export async function getInspectionStats(filters = {}) {
  const params = {}
  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  if (filters.greenhouseId) params.greenhouseId = filters.greenhouseId
  const paramsStr = new URLSearchParams(params).toString()
  const url = paramsStr ? `/inspections/stats?${paramsStr}` : '/inspections/stats'
  return await enhancedApiClient.get(url)
}

/**
 * 根据批次获取巡查记录
 * 网络策略：API 直连（V2.1 铁律：无缓存）
 */
export async function getInspectionsByBatch(batchId) {
  return await enhancedApiClient.get(`/inspections/batch/${batchId}`)
}

/**
 * 关联任务
 * 网络策略：API 直连 + enhancedApiClient 3 次重试（V2.1 铁律：无离线队列）
 */
export async function linkTask(inspectionId, taskId, taskCode) {
  await enhancedApiClient.post(`/inspections/${inspectionId}/link-task`, { taskId, taskCode })
  return true
}
