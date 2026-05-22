/**
 * 分级审批 API 服务
 * 对接后端 /api/basic-data/approval-level-configs 等接口
 */
import request from '@/api/request'
import { get, post, put, del } from '@/api/request'

// ============================================
// 类型定义（与 V1.1 apiBasicDataService.ts 保持一致）
// ============================================

/**
 * 审批级别配置项
 */
export const ApprovalLevelConfigItem = {
  id: 0,
  oid: '',
  levelCode: '',
  levelName: '',
  description: '',
  approverCount: 0,
  requireMultiApprover: 0,
  approverRoles: null,
  sortOrder: 0,
  status: 'active',
  createdAt: '',
  updatedAt: ''
}

/**
 * 金额阈值配置项
 */
export const ApprovalAmountThresholdItem = {
  id: 0,
  oid: '',
  maxAmount: 0,
  levelCode: '',
  sortOrder: 0,
  status: 'active',
  createdAt: '',
  updatedAt: ''
}

/**
 * 审批类型规则项
 */
export const ApprovalTypeRuleItem = {
  id: 0,
  oid: '',
  approvalType: '',
  forceExempt: 0,
  forceStrict: 0,
  forcedLevel: null,
  batchApprovalSupported: 0,
  customApproverCount: null,
  remark: '',
  status: 'active',
  createdAt: '',
  updatedAt: ''
}

// ============================================
// API 方法
// ============================================

/**
 * 获取所有审批级别配置
 */
export function getApprovalLevelConfigs() {
  return get('/basic-data/approval-level-configs')
}

/**
 * 更新审批级别配置
 */
export function updateApprovalLevelConfig(id, data) {
  return put(`/basic-data/approval-level-configs/${id}`, data)
}

/**
 * 获取所有金额阈值
 */
export function getApprovalAmountThresholds() {
  return get('/basic-data/approval-amount-thresholds')
}

/**
 * 创建金额阈值
 */
export function createApprovalAmountThreshold(data) {
  return post('/basic-data/approval-amount-thresholds', data)
}

/**
 * 更新金额阈值
 */
export function updateApprovalAmountThreshold(id, data) {
  return put(`/basic-data/approval-amount-thresholds/${id}`, data)
}

/**
 * 删除金额阈值
 */
export function deleteApprovalAmountThreshold(id) {
  return del(`/basic-data/approval-amount-thresholds/${id}`)
}

/**
 * 获取所有审批类型规则
 */
export function getApprovalTypeRules() {
  return get('/basic-data/approval-type-rules')
}

/**
 * 更新审批类型规则
 */
export function updateApprovalTypeRule(id, data) {
  return put(`/basic-data/approval-type-rules/${id}`, data)
}
