/**
 * 审批管理 API 服务
 * 文件路径：src/services/apiApprovalService.ts
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
export enum ApprovalType {
  // 业务审批
  MATERIAL_REQUEST = 'material_request',
  RETURN_MATERIAL = 'return_material',
  PURCHASE_REQUEST = 'purchase_request',
  MATERIAL_INBOUND = 'material_inbound',
  MATERIAL_TRANSFER = 'material_transfer',
  SEED_SOURCE_INBOUND = 'seed_source_inbound',
  SEEDLING_PLAN = 'seedling_plan',
  PLANTING_PLAN = 'planting_plan',
  ORDER_CREATE = 'order_create',
  ORDER_CHANGE = 'order_change',
  // 生产审批
  PRODUCTION_PLAN = 'production_plan',
  PRODUCTION_BATCH = 'production_batch',
  BATCH_CHANGE = 'batch_change',
  BATCH_VOID = 'batch_void',
  TECH_SOLUTION = 'tech_solution',
  // 农事审批
  TASK_DISPATCH = 'task_dispatch',
  TASK_CHANGE = 'task_change',
  INSPECTION_ISSUE = 'inspection_issue',
  ISSUE_RESOLVE = 'issue_resolve',
  // 采收审批
  HARVEST_REQUEST = 'harvest_request',
  // 作物补录审批
  SEED_SOURCE_SUPPLEMENTARY = 'seed_source_supplementary',
  SEEDLING_SUPPLEMENTARY = 'seedling_supplementary',
  CROP_STORAGE_SUPPLEMENTARY = 'crop_storage_supplementary',
  // 指标/公告审批
  INDICATOR_APPROVAL = 'indicator_approval',
  INDICATOR_ADJUST = 'indicator_adjust',
  ANNOUNCEMENT_APPROVAL = 'announcement_approval',
  // 成本审批
  BUDGET_CREATE = 'budget_create',
  BUDGET_ADJUST = 'budget_adjust',
  // HR审批
  LEAVE = 'leave',
  OVERTIME = 'overtime',
  RESIGNATION = 'resignation',
  RECRUITMENT = 'recruitment',
  ONBOARDING = 'onboarding',
  ATTENDANCE_REPAIR = 'attendance_repair',
  SALARY_ADJUSTMENT = 'salary_adjustment',
  CONTRACT_RENEWAL = 'contract_renewal',
  SALARY_BUDGET = 'salary_budget',
  TRANSFER = 'transfer',
}

/** 审批状态枚举 */
export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PARTIALLY_APPROVED = 'partially_approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

/** 审批人信息 */
export interface Approver {
  userId: string;
  userName: string;
  role: string;
  order: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  actionTime?: string;
}

/** 审批记录 */
export interface ApprovalRecord {
  id: string;
  approvalId: string;
  approverId: string;
  approverName: string;
  action: string;
  comment?: string;
  actionTime: string;
}

/** 业务关联数据 */
export interface BusinessLink {
  type: string;
  requestId: string;
  requestCode: string;
  [key: string]: unknown;
}

/** 物料项 */
export interface MaterialItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  unit: string;
}

/** 审批单 */
export interface Approval {
  id: string;
  code: string;
  type: ApprovalType;
  typeName: string;
  category: 'business' | 'hr' | 'quality';
  title: string;
  description?: string;
  applicantId: string;
  applicantName: string;
  applicantDepartment: string;
  applyDate: string;
  applyTime: string;
  currentStep: number;
  totalSteps: number;
  approvers: Approver[];
  records: ApprovalRecord[];
  status: ApprovalStatus;
  businessLink?: BusinessLink;
  attachments?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueDate?: string;
  reminderCount: number;
  createdAt: string;
  updatedAt: string;
  amount?: string;
  materials?: MaterialItem[];
  approvalLevel?: string;
}

/** 审批统计数据 */
export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  partiallyApproved: number;
  myPending: number;
  mySubmitted: number;
  overdue: number;
  urgent: number;
}

/** 筛选条件 */
export interface ApprovalFilters {
  type?: string[];
  status?: string[];
  category?: string[];
  department?: string[];
  priority?: string[];
  startDate?: string;
  endDate?: string;
  keyword?: string;
  myPending?: boolean;
  mySubmitted?: boolean;
}

/** 审批动作请求 */
export interface ApprovalActionRequest {
  action: 'approve' | 'reject' | 'cancel';
  comment?: string;
  approverId: string;
  approverName: string;
}

// ============================================================
// 字段映射：后端(snake_case) -> 前端(camelCase)
// ============================================================

const FIELD_MAP: Record<string, string> = {
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
};

// ============================================================
// 规范化函数
// ============================================================

/**
 * 获取审批类型名称
 */
export const getApprovalTypeName = (type: ApprovalType | string): string => {
  const typeNames: Record<string, string> = {
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
export const getApprovalStatusName = (status: ApprovalStatus | string): string => {
  const statusNames: Record<string, string> = {
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
function normalizeApproval(db: Record<string, unknown>): Approval {
  const result: Record<string, unknown> = { ...db };

  // 应用字段映射（snake_case → camelCase）
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake];
    }
  }

  // JSON字段解析
  if (typeof result.approvers === 'string') {
    try { result.approvers = JSON.parse(result.approvers as string); } catch { result.approvers = []; }
  }
  if (!Array.isArray(result.approvers)) result.approvers = [];

  if (typeof result.records === 'string') {
    try { result.records = JSON.parse(result.records as string); } catch { result.records = []; }
  }
  if (!Array.isArray(result.records)) result.records = [];

  if (typeof result.businessLink === 'string') {
    try { result.businessLink = JSON.parse(result.businessLink as string); } catch { result.businessLink = undefined; }
  }

  if (typeof result.materials === 'string') {
    try { result.materials = JSON.parse(result.materials as string); } catch { result.materials = []; }
  }
  if (!Array.isArray(result.materials)) result.materials = [];

  if (typeof result.relatedTaskIds === 'string') {
    try { result.relatedTaskIds = JSON.parse(result.relatedTaskIds as string); } catch { result.relatedTaskIds = []; }
  }
  if (typeof result.attachments === 'string') {
    try { result.attachments = JSON.parse(result.attachments as string); } catch { result.attachments = []; }
  }

  // 默认值
  result.typeName = result.typeName || getApprovalTypeName(result.type as ApprovalType) || '';
  result.status = (result.status as string) || ApprovalStatus.PENDING;
  result.category = result.category || 'business';
  result.priority = result.priority || 'normal';
  result.reminderCount = result.reminderCount ?? 0;
  result.notificationSent = result.notificationSent ?? false;
  result.currentStep = result.currentStep ?? 1;
  result.totalSteps = result.totalSteps ?? 1;
  result.createdAt = result.createdAt || result.applyDate || new Date().toISOString();
  result.updatedAt = result.updatedAt || result.createdAt || new Date().toISOString();

  return result as unknown as Approval;
}

/**
 * 反规范化审批数据（前端 -> 后端）
 */
function denormalizeApproval(data: Partial<Approval>): Record<string, unknown> {
  const reverse: Record<string, string> = {};
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    reverse[camel] = snake;
  }

  const result: Record<string, unknown> = {};
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
  async getApprovals(filters?: ApprovalFilters): Promise<Approval[]> {
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
      const response = await enhancedApiClient.get<unknown[]>(url);

      // enhancedApiClient.get 返回的是 result.data（数组），直接处理
      if (Array.isArray(response)) {
        return response.map(item => normalizeApproval(item as Record<string, unknown>));
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
  async getApprovalById(id: string): Promise<Approval | null> {
    try {
      const response = await enhancedApiClient.get<unknown>(`${API_BASE}/${id}`);

      // enhancedApiClient.get 返回的是 result.data（已经处理过的数据）
      if (response && typeof response === 'object') {
        return normalizeApproval(response as Record<string, unknown>);
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
  async executeAction(
    id: string,
    action: 'approve' | 'reject' | 'cancel',
    comment: string,
    approverId: string,
    approverName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const request: ApprovalActionRequest = {
        action,
        comment,
        approverId,
        approverName,
      };

      const response = await enhancedApiClient.patch<{ success: boolean; error?: string }>(
        `${API_BASE}/${id}/action`,
        request
      );

      return response as { success: boolean; error?: string };
    } catch (error) {
      console.error('[ApiApprovalService] 执行审批动作失败:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 审批通过
   */
  async approve(id: string, comment?: string): Promise<{ success: boolean; error?: string }> {
    const approverId = localStorage.getItem('userId') || '';
    const approverName = localStorage.getItem('username') || '系统';
    return this.executeAction(id, 'approve', comment || '', approverId, approverName);
  }

  /**
   * 审批拒绝
   */
  async reject(id: string, comment: string): Promise<{ success: boolean; error?: string }> {
    const approverId = localStorage.getItem('userId') || '';
    const approverName = localStorage.getItem('username') || '系统';
    return this.executeAction(id, 'reject', comment, approverId, approverName);
  }

  /**
   * 批量审批通过
   */
  async batchApprove(
    ids: string[],
    comment?: string
  ): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 创建审批
   */
  async createApproval(data: Partial<Approval>): Promise<Approval | null> {
    try {
      const body = denormalizeApproval(data);
      const response = await enhancedApiClient.post<{ success: boolean; data: unknown }>(
        API_BASE, body
      );
      if ((response as { success: boolean; data: unknown }).success && (response as { success: boolean; data: unknown }).data) {
        return normalizeApproval((response as { success: boolean; data: unknown }).data as Record<string, unknown>);
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
  async updateApproval(id: string, updates: Partial<Approval>): Promise<boolean> {
    try {
      const body = denormalizeApproval(updates);
      const response = await enhancedApiClient.put<{ success: boolean }>(
        `${API_BASE}/${id}`, body
      );
      return (response as { success: boolean }).success;
    } catch (error) {
      console.error('[ApiApprovalService] 更新审批失败:', error);
      return false;
    }
  }

  /**
   * 删除审批
   */
  async deleteApproval(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await enhancedApiClient.delete<{ success: boolean }>(`${API_BASE}/${id}`);
      return { success: (response as { success: boolean }).success || false };
    } catch (error) {
      console.error('[ApiApprovalService] 删除审批失败:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 批量审批拒绝
   */
  async batchReject(
    ids: string[],
    comment: string
  ): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: (error as Error).message };
    }
  }
}

// ============================================================
// 导出单例
// ============================================================

export const apiApprovalService = new ApiApprovalService();

export default apiApprovalService;
