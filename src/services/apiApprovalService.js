/**
 * 审批管理 API 服务
 * 文件路径：src/services/apiApprovalService.js
 * 功能：提供审批列表查询、审批通过、审批拒绝等API调用
 *
 * API端点：
 * - GET    /api/approvals         - 获取审批列表
 * - GET    /api/approvals/:id     - 获取单个审批详情
 * - PATCH  /api/approvals/:id/action - 执行审批动作(approve/reject)
 */

import { enhancedApiClient } from '../lib/apiClient';

// ============================================================
// 类型定义
// ============================================================

/** 审批类型枚举 */
export const ApprovalType = {
  // 业务审批
  MATERIAL_REQUEST: 'material_request',
  RETURN_MATERIAL: 'return_material',
  PURCHASE_REQUEST: 'purchase_request',
  MATERIAL_INBOUND: 'material_inbound',
  MATERIAL_TRANSFER: 'material_transfer',
  SEED_SOURCE_INBOUND: 'seed_source_inbound',
  SEEDLING_PLAN: 'seedling_plan',
  PLANTING_PLAN: 'planting_plan',
  ORDER_CREATE: 'order_create',
  ORDER_CHANGE: 'order_change',
  // 生产审批
  PRODUCTION_PLAN: 'production_plan',
  PRODUCTION_BATCH: 'production_batch',
  BATCH_CHANGE: 'batch_change',
  BATCH_VOID: 'batch_void',
  TECH_SOLUTION: 'tech_solution',
  // 农事审批
  TASK_DISPATCH: 'task_dispatch',
  TASK_CHANGE: 'task_change',
  INSPECTION_ISSUE: 'inspection_issue',
  ISSUE_RESOLVE: 'issue_resolve',
  // 采收审批
  HARVEST_REQUEST: 'harvest_request',
  // 作物补录审批
  SEED_SOURCE_SUPPLEMENTARY: 'seed_source_supplementary',
  SEEDLING_SUPPLEMENTARY: 'seedling_supplementary',
  CROP_STORAGE_SUPPLEMENTARY: 'crop_storage_supplementary',
  // 指标/公告审批
  INDICATOR_APPROVAL: 'indicator_approval',
  INDICATOR_ADJUST: 'indicator_adjust',
  ANNOUNCEMENT_APPROVAL: 'announcement_approval',
  // 成本审批
  BUDGET_CREATE: 'budget_create',
  BUDGET_ADJUST: 'budget_adjust',
  // HR审批
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  RESIGNATION: 'resignation',
  RECRUITMENT: 'recruitment',
  ONBOARDING: 'onboarding',
  ATTENDANCE_REPAIR: 'attendance_repair',
  SALARY_ADJUSTMENT: 'salary_adjustment',
  CONTRACT_RENEWAL: 'contract_renewal',
  SALARY_BUDGET: 'salary_budget',
  TRANSFER: 'transfer',
}

/** 审批状态枚举 */
export const ApprovalStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
}

// ============================================================
// 字段映射：后端(snake_case) -> 前端(camelCase)
// ============================================================

const FIELD_MAP = {
  id: 'id',
  code: 'code',
  type: 'type',
  type_name: 'typeName',
  category: 'category',
  title: 'title',
  description: 'description',
  applicant_id: 'applicantId',
  applicant_name: 'applicantName',
  applicant_department: 'applicantDepartment',
  apply_date: 'applyDate',
  apply_time: 'applyTime',
  current_step: 'currentStep',
  total_steps: 'totalSteps',
  approvers: 'approvers',
  records: 'records',
  status: 'status',
  business_link: 'businessLink',
  attachments: 'attachments',
  priority: 'priority',
  due_date: 'dueDate',
  reminder_count: 'reminderCount',
  related_batch_code: 'relatedBatchCode',
  related_task_ids: 'relatedTaskIds',
  notification_sent: 'notificationSent',
  amount: 'amount',
  materials: 'materials',
  workflow_id: 'workflowId',
  workflow_name: 'workflowName',
  approval_level: 'approvalLevel',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
}

// ============================================================
// 规范化函数
// ============================================================

/**
 * 获取审批类型名称
 */
export const getApprovalTypeName = (type) => {
  const typeNames = {
    [ApprovalType.MATERIAL_REQUEST]: '领料申请',
    [ApprovalType.RETURN_MATERIAL]: '退料单',
    [ApprovalType.PURCHASE_REQUEST]: '采购申请',
    [ApprovalType.MATERIAL_INBOUND]: '物料入库',
    [ApprovalType.MATERIAL_TRANSFER]: '库存调拨',
    [ApprovalType.SEED_SOURCE_INBOUND]: '种源入库',
    [ApprovalType.SEEDLING_PLAN]: '育苗计划',
    [ApprovalType.PLANTING_PLAN]: '种植计划',
    [ApprovalType.ORDER_CREATE]: '订单创建',
    [ApprovalType.ORDER_CHANGE]: '订单变更',
    [ApprovalType.PRODUCTION_PLAN]: '生产计划',
    [ApprovalType.PRODUCTION_BATCH]: '生产批次',
    [ApprovalType.BATCH_CHANGE]: '批次变更',
    [ApprovalType.BATCH_VOID]: '批次作废',
    [ApprovalType.TECH_SOLUTION]: '技术方案',
    [ApprovalType.TASK_DISPATCH]: '任务派发',
    [ApprovalType.TASK_CHANGE]: '任务变更',
    [ApprovalType.INSPECTION_ISSUE]: '巡查问题',
    [ApprovalType.ISSUE_RESOLVE]: '问题整改',
    [ApprovalType.HARVEST_REQUEST]: '采收申请',
    [ApprovalType.SEED_SOURCE_SUPPLEMENTARY]: '种源补录',
    [ApprovalType.SEEDLING_SUPPLEMENTARY]: '育苗补录',
    [ApprovalType.CROP_STORAGE_SUPPLEMENTARY]: '作物入库补录',
    [ApprovalType.INDICATOR_APPROVAL]: '指标发布',
    [ApprovalType.INDICATOR_ADJUST]: '指标调整',
    [ApprovalType.ANNOUNCEMENT_APPROVAL]: '公告审批',
    [ApprovalType.BUDGET_CREATE]: '预算编制',
    [ApprovalType.BUDGET_ADJUST]: '预算调整',
    [ApprovalType.LEAVE]: '请假',
    [ApprovalType.OVERTIME]: '加班',
    [ApprovalType.RESIGNATION]: '离职',
    [ApprovalType.RECRUITMENT]: '招聘',
    [ApprovalType.ONBOARDING]: '入职',
    [ApprovalType.ATTENDANCE_REPAIR]: '考勤补录',
    [ApprovalType.SALARY_ADJUSTMENT]: '调薪',
    [ApprovalType.CONTRACT_RENEWAL]: '合同续签',
    [ApprovalType.SALARY_BUDGET]: '工资预算',
    [ApprovalType.TRANSFER]: '转岗',
  };
  return typeNames[type] || type;
};

/**
 * 获取审批状态名称
 */
export const getApprovalStatusName = (status) => {
  const statusNames = {
    [ApprovalStatus.DRAFT]: '草稿',
    [ApprovalStatus.PENDING]: '待审批',
    [ApprovalStatus.APPROVED]: '已通过',
    [ApprovalStatus.PARTIALLY_APPROVED]: '部分通过',
    [ApprovalStatus.REJECTED]: '已拒绝',
    [ApprovalStatus.CANCELLED]: '已撤回',
  };
  return statusNames[status] || status;
};

/**
 * 规范化审批数据（后端 -> 前端）
 */
function normalizeApproval(db) {
  const result = { ...db };

  // 应用字段映射（snake_case → camelCase）
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake];
    }
  }

  // JSON字段解析
  if (typeof result.approvers === 'string') {
    try { result.approvers = JSON.parse(result.approvers); } catch { result.approvers = []; }
  }
  if (!Array.isArray(result.approvers)) result.approvers = [];

  if (typeof result.records === 'string') {
    try { result.records = JSON.parse(result.records); } catch { result.records = []; }
  }
  if (!Array.isArray(result.records)) result.records = [];

  if (typeof result.businessLink === 'string') {
    try { result.businessLink = JSON.parse(result.businessLink); } catch { result.businessLink = undefined; }
  }

  if (typeof result.materials === 'string') {
    try { result.materials = JSON.parse(result.materials); } catch { result.materials = []; }
  }
  if (!Array.isArray(result.materials)) result.materials = [];

  if (typeof result.relatedTaskIds === 'string') {
    try { result.relatedTaskIds = JSON.parse(result.relatedTaskIds); } catch { result.relatedTaskIds = []; }
  }
  if (typeof result.attachments === 'string') {
    try { result.attachments = JSON.parse(result.attachments); } catch { result.attachments = []; }
  }

  // 默认值
  result.typeName = result.typeName || getApprovalTypeName(result.type) || '';
  result.status = result.status || ApprovalStatus.PENDING;
  result.category = result.category || 'business';
  result.priority = result.priority || 'normal';
  result.reminderCount = result.reminderCount ?? 0;
  result.notificationSent = result.notificationSent ?? false;
  result.currentStep = result.currentStep ?? 1;
  result.totalSteps = result.totalSteps ?? 1;
  result.createdAt = result.createdAt || result.applyDate || new Date().toISOString();
  result.updatedAt = result.updatedAt || result.createdAt || new Date().toISOString();

  return result;
}

/**
 * 反规范化审批数据（前端 -> 后端）
 */
function denormalizeApproval(data) {
  const reverse = {};
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    reverse[camel] = snake;
  }

  const result = {};
  for (const [key, value] of Object.entries(data)) {
    const backendKey = reverse[key] || key;
    // JSON字段序列化
    if (['approvers', 'records', 'businessLink', 'materials', 'relatedTaskIds', 'attachments'].includes(key) && typeof value === 'object') {
      result[backendKey] = JSON.stringify(value);
    } else {
      result[backendKey] = value;
    }
  }
  return result;
}

// ============================================================
// API服务类
// ============================================================

// P0-2 修复 (2026-06-03): 移除重复 /api 前缀
// 背景：apiClient.ts 的 API_BASE_URL 已含 /api 前缀，service 端不能再加一次
// 之前：'/api/approvals' → 调用后变成 'http://localhost:5000/api/api/approvals' (404)
// 现在：'/approvals' → 正确变成 'http://localhost:5000/api/approvals' (200)
// 同步对照：apiApprovalWorkflowService.ts 用 '/approval-workflows'，apiCropVarietyExtensionService.ts 用 '/crop-varieties'
const API_BASE = '/approvals';

class ApiApprovalService {
  /**
   * 获取审批列表
   */
  async getApprovals(filters) {
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (filters) {
        if (filters.type?.length) params.append('type', filters.type.join(','));
        if (filters.status?.length) params.append('status', filters.status.join(','));
        if (filters.category?.length) params.append('category', filters.category.join(','));
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.myPending) params.append('myPending', 'true');
        if (filters.mySubmitted) params.append('mySubmitted', 'true');
      }

      const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
      const response = await enhancedApiClient.get(url);

      // enhancedApiClient.get 返回的是 result.data（数组），直接处理
      if (Array.isArray(response)) {
        return response.map(item => normalizeApproval(item));
      }

      return [];
    } catch (error) {
      console.error('[ApiApprovalService] 获取审批列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个审批详情
   */
  async getApprovalById(id) {
    try {
      const response = await enhancedApiClient.get(`${API_BASE}/${id}`);

      // enhancedApiClient.get 返回的是 result.data（已经处理过的数据）
      if (response && typeof response === 'object') {
        return normalizeApproval(response);
      }

      return null;
    } catch (error) {
      console.error('[ApiApprovalService] 获取审批详情失败:', error);
      throw error;
    }
  }

  /**
   * 执行审批动作（通过/拒绝）
   */
  async executeAction(id, action, comment, approverId, approverName) {
    try {
      const request = {
        action,
        comment,
        approverId,
        approverName,
      };

      const response = await enhancedApiClient.patch(
        `${API_BASE}/${id}/action`,
        request
      );

      return response;
    } catch (error) {
      console.error('[ApiApprovalService] 执行审批动作失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 审批通过
   */
  async approve(id, comment) {
    const approverId = localStorage.getItem('userId') || '';
    const approverName = localStorage.getItem('username') || '系统';
    return this.executeAction(id, 'approve', comment || '', approverId, approverName);
  }

  /**
   * 审批拒绝
   */
  async reject(id, comment) {
    const approverId = localStorage.getItem('userId') || '';
    const approverName = localStorage.getItem('username') || '系统';
    return this.executeAction(id, 'reject', comment, approverId, approverName);
  }

  /**
   * 批量审批通过
   */
  async batchApprove(ids, comment) {
    try {
      const approverId = localStorage.getItem('userId') || '';
      const approverName = localStorage.getItem('username') || '系统';

      const promises = ids.map(id =>
        this.executeAction(id, 'approve', comment || '', approverId, approverName)
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.success);

      if (failed.length > 0) {
        return { success: false, error: `${failed.length}个审批操作失败` };
      }

      return { success: true };
    } catch (error) {
      console.error('[ApiApprovalService] 批量审批通过失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 创建审批
   */
  async createApproval(data) {
    try {
      const body = denormalizeApproval(data);
      const response = await enhancedApiClient.post(API_BASE, body);
      if (response.success && response.data) {
        return normalizeApproval(response.data);
      }
      return null;
    } catch (error) {
      console.error('[ApiApprovalService] 创建审批失败:', error);
      return null;
    }
  }

  /**
   * 更新审批
   */
  async updateApproval(id, updates) {
    try {
      const body = denormalizeApproval(updates);
      const response = await enhancedApiClient.put(`${API_BASE}/${id}`, body);
      return response.success;
    } catch (error) {
      console.error('[ApiApprovalService] 更新审批失败:', error);
      return false;
    }
  }

  /**
   * 删除审批
   */
  async deleteApproval(id) {
    try {
      const response = await enhancedApiClient.delete(`${API_BASE}/${id}`);
      return { success: response.success || false };
    } catch (error) {
      console.error('[ApiApprovalService] 删除审批失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量审批拒绝
   */
  async batchReject(ids, comment) {
    try {
      const approverId = localStorage.getItem('userId') || '';
      const approverName = localStorage.getItem('username') || '系统';

      const promises = ids.map(id =>
        this.executeAction(id, 'reject', comment, approverId, approverName)
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.success);

      if (failed.length > 0) {
        return { success: false, error: `${failed.length}个审批操作失败` };
      }

      return { success: true };
    } catch (error) {
      console.error('[ApiApprovalService] 批量审批拒绝失败:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================================
// 导出单例
// ============================================================

export const apiApprovalService = new ApiApprovalService();

export default apiApprovalService;
