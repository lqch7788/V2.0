/**
 * 审批流程配置 API 服务
 * 对接后端 /api/approval-workflows
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * @deprecated 自 2026-06 起，V2.0 改用 `src/api/system/approvalWorkflow.js`（标准 request 客户端）。
 * 本文件保留仅用于 V1.1 兼容路径，不再被任何模块引用。
 * 后续版本将彻底移除。
 */

import { enhancedApiClient } from '../lib/apiClient';

// ============================================
// 审批工作流 API
// ============================================

/**
 * 获取所有审批工作流
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkflows() {
  const data = await enhancedApiClient.get('/approval-workflows');
  return data || [];
}

/**
 * 根据业务类型获取工作流
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkflowsByType(businessType) {
  const data = await enhancedApiClient.get(`/approval-workflows/by-type/${encodeURIComponent(businessType)}`);
  return data || [];
}

/**
 * 获取单个审批工作流
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkflowById(id) {
  try {
    const data = await enhancedApiClient.get(`/approval-workflows/${id}`);
    return data;
  } catch {
    return null;
  }
}

/**
 * 创建审批工作流
 * 降级策略：API → 离线队列
 */
export async function createWorkflow(workflow) {
  const result = await enhancedApiClient.post('/approval-workflows', workflow);
  return result;
}

/**
 * 更新审批工作流
 * 降级策略：API → 离线队列
 */
export async function updateWorkflow(id, workflow) {
  await enhancedApiClient.put(`/approval-workflows/${id}`, workflow);
}

/**
 * 删除审批工作流
 * 降级策略：API → 离线队列
 */
export async function deleteWorkflow(id) {
  await enhancedApiClient.delete(`/approval-workflows/${id}`);
}

/**
 * 切换审批工作流状态
 * 降级策略：API → 离线队列
 */
export async function toggleWorkflow(id) {
  const result = await enhancedApiClient.patch(`/approval-workflows/${id}/toggle`);
  return result.status;
}

/**
 * 复制审批工作流
 * 降级策略：API → 离线队列
 */
export async function cloneWorkflow(id, newCode, newName) {
  const result = await enhancedApiClient.post(`/approval-workflows/${id}/clone`, { newCode, newName });
  return result;
}

/**
 * 验证审批条件
 * 降级策略：API
 */
export async function evaluateConditions(id, context) {
  const result = await enhancedApiClient.post(`/approval-workflows/${id}/evaluate-conditions`, { context });
  return result;
}

// ============================================
// 节点模板 API
// ============================================

/**
 * 获取节点模板列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getNodeTemplates() {
  const data = await enhancedApiClient.get('/approval-workflows/node-templates/list');
  return data || [];
}
