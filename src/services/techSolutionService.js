/**
 * 技术方案数据 API 服务
 * 对接后端 /api/tech-solutions
 *
 * 迁移自 V1.1 src/services/apiTechSolutionService.ts
 */

import { enhancedApiClient } from '../lib/apiClient'

/**
 * 将后端返回的数据转换为前端格式
 */
function transformTechSolution(data) {
  if (Array.isArray(data)) {
    return data.map(item => transformSingle(item))
  }
  return transformSingle(data)
}

function transformSingle(item) {
  // V9.0: scopeNames 可能是字符串（逗号分隔）或数组
  let scopes = []
  if (Array.isArray(item.scopeNames)) {
    scopes = item.scopeNames
  } else if (typeof item.scopeNames === 'string' && item.scopeNames) {
    scopes = item.scopeNames.split(',').filter(Boolean)
  } else if (Array.isArray(item.scopes)) {
    scopes = item.scopes
  }

  return {
    id: item.id,
    code: item.code || '',
    title: item.title || '',
    crop: item.crop || '',
    cropCode: item.cropCode || '',
    plantingMode: item.plantingMode || '',
    stage: item.stage || '',
    scopes: scopes, // V9.0: 适用范围数组
    version: item.version || 'V1.0',
    content: item.content || '',
    author: item.author || '',
    authorId: item.authorId || '',
    createDate: item.createDate ? item.createDate.split('T')[0] : '',
    updateTime: item.updateTime || '',
    status: item.status || '草稿',
    batchStatus: item.batchStatus || 'draft',
    statusClass: item.statusClass || 'draft',
    approveStatus: item.approveStatus || '待审批',
    approvalCode: item.approvalCode || '',
    approvalDate: item.approvalDate || '',
    approver: item.approver || '',
    relatedBatchCode: item.relatedBatchCode || '',
    planDetailFileName: item.planDetailFileName || '',
    priority: item.priority || 'normal',
    remarks: item.remarks || '',
    lastSubmitTime: item.lastSubmitTime || '',
    isValid: item.isValid || '有效',
  }
}

/**
 * 获取所有技术方案
 */
export async function getTechSolutions() {
  const data = await enhancedApiClient.get('/tech-solutions')
  return transformTechSolution(data)
}

/**
 * 根据ID获取单个技术方案
 */
export async function getTechSolutionById(id) {
  const data = await enhancedApiClient.get(`/tech-solutions/${id}`)
  return transformTechSolution(data)
}

/**
 * 创建技术方案
 */
export async function addTechSolution(solution) {
  const result = await enhancedApiClient.post('/tech-solutions', solution)
  return { ...solution, id: result.id }
}

/**
 * 更新技术方案
 */
export async function updateTechSolution(id, updates) {
  const result = await enhancedApiClient.put(`/tech-solutions/${id}`, updates)
  return result ? { ...updates, id } : null
}

/**
 * 删除技术方案
 */
export async function deleteTechSolution(id) {
  await enhancedApiClient.delete(`/tech-solutions/${id}`)
  return true
}

/**
 * 批量删除技术方案
 */
export async function deleteTechSolutions(ids) {
  await enhancedApiClient.post('/tech-solutions/batch-delete', { ids })
  return true
}

/**
 * 重置技术方案
 */
export async function resetTechSolutions() {
  await enhancedApiClient.post('/tech-solutions/reset')
}

/**
 * 获取技术方案的审批记录
 * 修复 P0-007：改回 V1.1 专用端点 /api/approvals/by-business/tech_solution/:id
 * V2.0 原实现为 GET /approvals + 客户端 filter（全量拉取+内存过滤，破坏专用端点语义）
 *
 * @param {string} techSolutionId - 技术方案ID
 * @returns {Promise<Array>} 审批记录数组
 */
export async function getTechSolutionApprovals(techSolutionId) {
  try {
    const response = await fetch(
      `/api/approvals/by-business/tech_solution/${techSolutionId}`
    )
    const result = await response.json()
    if (result.success && Array.isArray(result.data)) {
      return result.data.map((item) => ({
        id: item.id,
        code: item.code,
        title: item.title,
        status: item.status,
        currentStep: item.currentStep,
        totalSteps: item.totalSteps,
        records: item.records || [],
        createdAt: item.created_at,
      }))
    }
    return []
  } catch (error) {
    console.error('获取技术方案审批记录失败:', error)
    return []
  }
}
