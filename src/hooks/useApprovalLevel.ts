// ============================================================
// 审批级别 Hook
// 文件路径：src/hooks/useApprovalLevel.ts
// 功能：根据金额和类型计算审批级别
// ============================================================

import { ApprovalType } from '../types/approval';

// 审批级别结果
export interface LevelResult {
  level: string;
  approverCount: number;
  autoApprove: boolean;
  threshold: number;
}

// 审批级别配置（与V1.1金额阈值完全对齐）
const LEVEL_THRESHOLDS = {
  // 金额阈值配置（单位：元）
  // V1.1: <1000免审批, 1000-10000快速(1人), 10000-50000标准(2人), >=50000严格(3人)
  QUICK_VALUE_THRESHOLD: 1000,     // 免审批上限
  STANDARD_VALUE_THRESHOLD: 10000,  // 快速审批上限（1人→2人分界线）
  STRICT_VALUE_THRESHOLD: 50000,    // 标准审批上限（2人→3人分界线）

  // 审批人数量配置
  STRICT_VALUE_APPROVERS: 3,       // 严格审批3人
  STANDARD_VALUE_APPROVERS: 2,      // 标准审批2人
  QUICK_VALUE_APPROVERS: 1,        // 快速审批1人
};

// 自动通过阈值（低于此金额自动通过）
const AUTO_APPROVE_THRESHOLD = 1000;

/**
 * 创建审批级别
 */
export function createApprovalWithLevel(params: {
  type: ApprovalType;
  amount: number;
  applicantId: string;
  applicantName: string;
  applicantDepartment: string;
  title: string;
  additionalData?: Record<string, any>;
  businessLink?: Record<string, any>;
}): { approval: Record<string, any>; levelResult: LevelResult } {
  const { amount } = params;

  // 确定审批级别
  let level: string;
  let approverCount: number;
  let autoApprove = false;
  let threshold = 0;

  if (amount <= AUTO_APPROVE_THRESHOLD) {
    // 小金额自动通过（<1000元，与V1.1 EXEMPT对齐）
    level = 'auto';
    approverCount = 0;
    autoApprove = true;
    threshold = AUTO_APPROVE_THRESHOLD;
  } else if (amount >= LEVEL_THRESHOLDS.STRICT_VALUE_THRESHOLD) {
    // 严格审批（>=50000元，3人审批，与V1.1 STRICT对齐）
    level = 'high';
    approverCount = LEVEL_THRESHOLDS.STRICT_VALUE_APPROVERS;
    threshold = LEVEL_THRESHOLDS.STRICT_VALUE_THRESHOLD;
  } else if (amount >= LEVEL_THRESHOLDS.STANDARD_VALUE_THRESHOLD) {
    // 标准审批（10000-50000元，2人审批，与V1.1 STANDARD对齐）
    level = 'medium';
    approverCount = LEVEL_THRESHOLDS.STANDARD_VALUE_APPROVERS;
    threshold = LEVEL_THRESHOLDS.STANDARD_VALUE_THRESHOLD;
  } else {
    // 快速审批（1000-10000元，1人审批，与V1.1 QUICK对齐）
    level = 'normal';
    approverCount = LEVEL_THRESHOLDS.QUICK_VALUE_APPROVERS;
    threshold = LEVEL_THRESHOLDS.QUICK_VALUE_THRESHOLD;
  }

  const levelResult: LevelResult = {
    level,
    approverCount,
    autoApprove,
    threshold,
  };

  // 构建审批数据
  const approval = {
    type: params.type,
    title: params.title,
    amount: params.amount,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.applicantDepartment,
    level,
    approverCount,
    autoApprove,
    threshold,
    additionalData: params.additionalData || {},
    businessLink: params.businessLink || {},
    createTime: new Date().toISOString(),
  };

  return { approval, levelResult };
}

/**
 * 获取审批级别标签
 */
export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    auto: '自动通过',
    normal: '普通审批',
    medium: '中等金额审批',
    high: '高金额审批',
  };
  return labels[level] || level;
}

/**
 * 获取审批级别颜色
 */
export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    auto: 'green',
    normal: 'blue',
    medium: 'orange',
    high: 'red',
  };
  return colors[level] || 'gray';
}

export default {
  createApprovalWithLevel,
  getLevelLabel,
  getLevelColor,
};
