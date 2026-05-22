/**
 * 审批工作流 API 服务
 * 对接后端审批流程相关接口
 */
import { get, post, put, del } from '@/api/request'

// ============================================
// 类型定义
// ============================================

/**
 * 审批节点
 */
export const ApprovalNode = {
  id: '',
  name: '',
  approverRole: '',
  timeoutHours: 24,
  autoApproveOnTimeout: false,
  requireComment: true
}

/**
 * 审批工作流
 */
export const ApprovalWorkflow = {
  id: '',
  oid: '',
  name: '',
  code: '',
  description: '',
  module: '',
  triggerCondition: '',
  nodes: [],
  status: 'active'
}

// ============================================
// API 方法
// ============================================

/**
 * 获取审批工作流列表
 */
export function getApprovalWorkflows() {
  return get('/approval/workflows')
}

/**
 * 获取单个审批工作流
 */
export function getApprovalWorkflow(id) {
  return get(`/approval/workflows/${id}`)
}

/**
 * 创建审批工作流
 */
export function createApprovalWorkflow(data) {
  return post('/approval/workflows', data)
}

/**
 * 更新审批工作流
 */
export function updateApprovalWorkflow(id, data) {
  return put(`/approval/workflows/${id}`, data)
}

/**
 * 删除审批工作流
 */
export function deleteApprovalWorkflow(id) {
  return del(`/approval/workflows/${id}`)
}

/**
 * 切换审批工作流状态
 */
export function toggleApprovalWorkflowStatus(id) {
  return put(`/approval/workflows/${id}/toggle-status`)
}

// ============================================
// 导出 API 对象
// ============================================

export const approvalWorkflowApi = {
  getApprovalWorkflows,
  getApprovalWorkflow,
  createApprovalWorkflow,
  updateApprovalWorkflow,
  deleteApprovalWorkflow,
  toggleApprovalWorkflowStatus
}

export default approvalWorkflowApi
