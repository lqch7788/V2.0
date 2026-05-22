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

// 审批级别配置
const LEVEL_THRESHOLDS = {
  // 金额阈值配置（单位：元）
  HIGH_VALUE_THRESHOLD: 10000,    // 高金额阈值
  MEDIUM_VALUE_THRESHOLD: 5000,   // 中金额阈值

  // 审批人数量配置
  HIGH_VALUE_APPROVERS: 3,       // 高金额需要3人审批
  MEDIUM_VALUE_APPROVERS: 2,      // 中金额需要2人审批
  DEFAULT_APPROVERS: 1,           // 默认1人审批
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
    // 小金额自动通过
    level = 'auto';
    approverCount = 0;
    autoApprove = true;
    threshold = AUTO_APPROVE_THRESHOLD;
  } else if (amount > LEVEL_THRESHOLDS.HIGH_VALUE_THRESHOLD) {
    level = 'high';
    approverCount = LEVEL_THRESHOLDS.HIGH_VALUE_APPROVERS;
    threshold = LEVEL_THRESHOLDS.HIGH_VALUE_THRESHOLD;
  } else if (amount > LEVEL_THRESHOLDS.MEDIUM_VALUE_THRESHOLD) {
    level = 'medium';
    approverCount = LEVEL_THRESHOLDS.MEDIUM_VALUE_APPROVERS;
    threshold = LEVEL_THRESHOLDS.MEDIUM_VALUE_THRESHOLD;
  } else {
    level = 'normal';
    approverCount = LEVEL_THRESHOLDS.DEFAULT_APPROVERS;
    threshold = LEVEL_THRESHOLDS.MEDIUM_VALUE_THRESHOLD;
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
