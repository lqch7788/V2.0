import { get, post, put, del } from '../request'

// ========== 种源管理 API ==========

// 获取种源列表
export function getSeedSourceList(params) {
  return get('/seed-sources', params)
}

// 获取种源详情
export function getSeedSourceDetail(id) {
  return get(`/seed-sources/${id}`)
}

// 创建种源
export function createSeedSource(data) {
  return post('/seed-sources', data)
}

// 更新种源
export function updateSeedSource(id, data) {
  return put(`/seed-sources/${id}`, data)
}

// 删除种源
export function deleteSeedSource(id) {
  return del(`/seed-sources/${id}`)
}

// 批量删除种源
export function deleteSeedSources(ids) {
  return del(`/seed-sources/batch?ids=${ids.join(',')}`)
}

// 检查种源是否可删除
export function checkSeedSourceDeletable(id) {
  return get(`/seed-sources/${id}/check-deletable`)
}

// 添加繁殖过程记录
export function addPropagationRecord(seedSourceId, data) {
  return post(`/seed-sources/${seedSourceId}/propagation-records`, data)
}

// 获取繁殖过程记录列表
export function getPropagationRecords(seedSourceId) {
  return get(`/seed-sources/${seedSourceId}/propagation-records`)
}

// 更新繁殖阶段
export function updatePropagationStage(seedSourceId, newStage) {
  return put(`/seed-sources/${seedSourceId}/propagation-stage`, { new_stage: newStage })
}

// 完成繁殖入库
export function completePropagation(seedSourceId, quantity) {
  return post(`/seed-sources/${seedSourceId}/complete-propagation`, { quantity })
}

// 关键字搜索种源
export function searchSeedSources(keyword) {
  return get('/seed-sources/search', { keyword })
}

// 批量按 ID 获取种源
export function getSeedSourcesByIds(ids) {
  const idsStr = Array.isArray(ids) ? ids.join(',') : ids
  return get('/seed-sources/batch', { ids: idsStr })
}

// 扣减可用库存
export function decreaseAvailableCount(id, qty) {
  return post(`/seed-sources/${id}/decrease-available`, { quantity: qty })
}

// 获取指定日期的最大批号流水号
export function getTodayMaxSeedCodeSerial(date) {
  return get('/seed-sources/max-serial', { date })
}

// 自动生成下一个种源批号
export function generateSeedCode(date) {
  return get('/seed-sources/generate-code', { date })
}

// 检查种源批号是否已存在
export function checkSourceCodeExists(code) {
  return get('/seed-sources/check-source-code', { code })
}

// 更新繁殖过程记录
export function updatePropagationRecord(seedSourceId, recordId, data) {
  return put(`/seed-sources/${seedSourceId}/propagation-records/${recordId}`, data)
}

// 删除繁殖过程记录
export function deletePropagationRecord(seedSourceId, recordId) {
  return del(`/seed-sources/${seedSourceId}/propagation-records/${recordId}`)
}

// 获取所有种源的繁殖过程记录
export function getAllPropagationRecords(params) {
  return get('/seed-sources/propagation-records', params)
}

// 打印标签（增加打印计数）
export function printLabel(id, count, mode) {
  return post(`/seed-sources/${id}/print`, { count, mode })
}

// 创建标签打印记录
export function createPrintRecord(id, data) {
  return post(`/seed-sources/${id}/print-records`, data)
}

// 获取标签打印记录
export function getPrintRecords(id) {
  return get(`/seed-sources/${id}/print-records`)
}

// 可用种源查询（按库存查找可调拨的）
export function lookupAvailableSeedSources(params) {
  return get('/seed-sources/lookup', params)
}

// 获取种源使用记录（被哪些播种/育苗引用）
export function getSeedSourceUsageRecords(id) {
  return get(`/seed-sources/${id}/usage-records`)
}

// 获取种源入库历史（采购/调拨入库明细）
export function getSeedSourceInboundHistory(id) {
  return get(`/seed-sources/${id}/inbound-records`)
}

// ========== 育苗管理 API ==========

// 获取育苗列表
export function getSeedlingList(params) {
  return get('/seedlings', params)
}

// 获取育苗详情
export function getSeedlingDetail(id) {
  return get(`/seedlings/${id}`)
}

// 创建育苗
export function createSeedling(data) {
  return post('/seedlings', data)
}

// 更新育苗
export function updateSeedling(id, data) {
  return put(`/seedlings/${id}`, data)
}

// 删除育苗（对齐 V1.1 apiSeedlingService.ts deleteSeedling：强制返回 boolean）
export async function deleteSeedling(id) {
  await del(`/seedlings/${id}`)
  return true
}

// 批量删除育苗（对齐 V1.1 apiSeedlingService.ts deleteSeedlings：强制返回 boolean）
export async function deleteSeedlings(ids) {
  await del(`/seedlings/batch?ids=${Array.isArray(ids) ? ids.join(',') : ids}`)
  return true
}

// 结束育苗（正常结束/异常结束）
export function finishSeedling(id, data) {
  return put(`/seedlings/${id}/finish`, data)
}

// 添加每日记录
export function addDailyRecord(seedlingId, record) {
  return post(`/seedlings/${seedlingId}/daily-records`, record)
}

// 更新每日记录
export function updateDailyRecord(seedlingId, recordId, updates) {
  return put(`/seedlings/${seedlingId}/daily-records/${recordId}`, updates)
}

// 删除每日记录
export function deleteDailyRecord(seedlingId, recordId) {
  return del(`/seedlings/${seedlingId}/daily-records/${recordId}`)
}

// 增加已定植数量
export function increasePlantedCount(id, count) {
  return post(`/seedlings/${id}/increase-planted`, { count })
}

// ========== 标签管理 API ==========

// 获取标签列表
export function getPlantLabelList(params) {
  return get('/plant-labels', params)
}

// 获取标签详情
export function getPlantLabelDetail(id) {
  return get(`/plant-labels/${id}`)
}

// 获取标签履历
export function getPlantLabelResumes(labelId) {
  return get(`/plant-labels/${labelId}/resumes`)
}

// 批量生成标签
export function generateBatchLabels(data) {
  return post('/plant-labels/generate-batch', data)
}

// 新增标签履历（移入/移出/标记）
export function addPlantLabelResume(labelId, data) {
  return post(`/plant-labels/${labelId}/resumes`, data)
}

// 分配标记给标签
export function assignLabelMark(markId, labelIds) {
  return post('/plant-labels/marks/assign', { mark_id: markId, label_ids: labelIds })
}

// 获取所有标记
export function getAllMarks() {
  return get('/plant-labels/marks/all')
}

// 导出 API
export const cropApi = {
  // 种源管理
  getSeedSourceList,
  getSeedSourceDetail,
  createSeedSource,
  updateSeedSource,
  deleteSeedSource,
  deleteSeedSources,
  checkSeedSourceDeletable,
  addPropagationRecord,
  getPropagationRecords,
  updatePropagationStage,
  completePropagation,
  searchSeedSources,
  getSeedSourcesByIds,
  decreaseAvailableCount,
  getTodayMaxSeedCodeSerial,
  generateSeedCode,
  checkSourceCodeExists,
  updatePropagationRecord,
  deletePropagationRecord,
  getAllPropagationRecords,
  printLabel,
  createPrintRecord,
  getPrintRecords,
  lookupAvailableSeedSources,
  getSeedSourceUsageRecords,
  getSeedSourceInboundHistory,
  // 育苗管理
  getSeedlingList,
  getSeedlingDetail,
  createSeedling,
  updateSeedling,
  deleteSeedling,
  deleteSeedlings,
  finishSeedling,
  addDailyRecord,
  updateDailyRecord,
  deleteDailyRecord,
  increasePlantedCount,
  // 标签管理
  getPlantLabelList,
  getPlantLabelDetail,
  getPlantLabelResumes,
  generateBatchLabels,
  addPlantLabelResume,
  assignLabelMark,
  getAllMarks
}

export default cropApi
