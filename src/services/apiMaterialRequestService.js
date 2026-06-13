/**
 * 物料申请 API 服务
 * 对接后端 /api/material-requests
 */
import { enhancedApiClient } from '../lib/apiClient'

/**
 * 获取物料申请列表
 * @param {Object} [params] - 查询参数
 * @returns {Promise<any[]>} 物料申请记录数组
 */
export async function getMaterialRequests(params) {
  try {
    const response = await enhancedApiClient.get('/material-requests', params)
    // apiClient 已拆包 {success, data}，response 通常是数组；
    // 兼容两种形态：直接数组 或 { data, meta } 包装
    if (Array.isArray(response)) return response
    if (response?.data && Array.isArray(response.data)) return response.data
    if (response?.success && response?.data) return response.data
    return []
  } catch (err) {
    console.warn('[物料申请] 获取列表失败:', err)
    return []
  }
}

/**
 * 获取单个物料申请详情
 * @param {string|number} id
 * @returns {Promise<any|null>}
 */
export async function getMaterialRequestById(id) {
  try {
    return await enhancedApiClient.get(`/material-requests/${id}`)
  } catch (err) {
    console.warn('[物料申请] 获取详情失败:', err)
    return null
  }
}

/**
 * 创建物料申请
 * @param {Object} data
 * @returns {Promise<any>}
 */
export async function createMaterialRequest(data) {
  return enhancedApiClient.post('/material-requests', data)
}

/**
 * 更新物料申请
 * @param {string|number} id
 * @param {Object} updates
 * @returns {Promise<any>}
 */
export async function updateMaterialRequest(id, updates) {
  return enhancedApiClient.put(`/material-requests/${id}`, updates)
}

/**
 * 删除物料申请
 * @param {string|number} id
 * @returns {Promise<any>}
 */
export async function deleteMaterialRequest(id) {
  return enhancedApiClient.delete(`/material-requests/${id}`)
}
