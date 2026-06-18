/**
 * 工作日志 API 服务
 * V1.1 useWorkLogStore 1:1 对齐（4 个端点）
 */
import { get, post, put, del } from './request.js'

const BASE = '/work-logs'

export const workLogApi = {
  /** 获取工作日志列表 */
  list: (params) => get(BASE, params),
  /** 获取单个工作日志 */
  get: (id) => get(`${BASE}/${id}`),
  /** 新增工作日志 */
  create: (data) => post(BASE, data),
  /** 更新工作日志 */
  update: (id, data) => put(`${BASE}/${id}`, data),
  /** 删除工作日志 */
  delete: (id) => del(`${BASE}/${id}`),
  /** 批量删除 */
  batchDelete: (ids) => post(`${BASE}/batch-delete`, { ids }),
}

export default workLogApi
