/**
 * 物料申请 API 服务
 * 对接后端 /api/material-requests
 */
import { enhancedApiClient } from '../lib/apiClient'

/**
 * 获取物料申请列表
 */
export async function getMaterialRequests(params) {
  try {
    const response = await enhancedApiClient.get('/material-requests', params)
    return {
      data: response?.data || [],
      total: response?.meta?.total || response?.data?.length || 0
    }
  } catch (err) {
    console.warn('[物料申请] 获取列表失败:', err)
    return { data: [], total: 0 }
  }
}

/**
 * 获取单个物料申请详情
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
 */
export async function createMaterialRequest(data) {
  return enhancedApiClient.post('/material-requests', data)
}

/**
 * 更新物料申请
 */
export async function updateMaterialRequest(id, updates) {
  return enhancedApiClient.put(`/material-requests/${id}`, updates)
}

/**
 * 删除物料申请
 */
export async function deleteMaterialRequest(id) {
  return enhancedApiClient.delete(`/material-requests/${id}`)
}
