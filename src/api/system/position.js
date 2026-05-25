/**
 * 职位管理 API 服务
 * 对接后端 /api/basic-data/positions
 */
import { get, post, put, del } from '../request'

/**
 * 获取职位列表
 */
export function getPositions(params) {
  return get('/basic-data/positions', params)
}

/**
 * 获取单个职位
 */
export function getPositionById(id) {
  return get(`/basic-data/positions/${id}`)
}

/**
 * 创建职位
 */
export function createPosition(data) {
  return post('/basic-data/positions', data)
}

/**
 * 更新职位
 */
export function updatePosition(id, data) {
  return put(`/basic-data/positions/${id}`, data)
}

/**
 * 删除职位
 */
export function deletePosition(id) {
  return del(`/basic-data/positions/${id}`)
}

export const positionApi = {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
}

export default positionApi
