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
  return del('/seed-sources/batch', { ids })
}

// 检查种源是否可删除
export function checkSeedSourceDeletable(id) {
  return get(`/seed-sources/${id}/check-deletable`)
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

// 删除育苗
export function deleteSeedling(id) {
  return del(`/seedlings/${id}`)
}

// 批量删除育苗
export function deleteSeedlings(ids) {
  return del('/seedlings/batch', { ids })
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
  // 育苗管理
  getSeedlingList,
  getSeedlingDetail,
  createSeedling,
  updateSeedling,
  deleteSeedling,
  deleteSeedlings
}

export default cropApi
