// ============================================================
// 人工管理模块 - HR审批类型定义
// 文件路径：src/types/labor/approval.js
// 提供人工管理模块特有的标签映射
// ============================================================

import { ApprovalType, ApprovalStatus, getApprovalTypeName, getApprovalStatusName } from '../approval.js'

// 重新导出
export { ApprovalType, ApprovalStatus, getApprovalTypeName, getApprovalStatusName }

// ============================================================
// 审批状态标签映射表
// 用于在UI中展示审批状态的中文名称和对应颜色
// ============================================================

export const ApprovalStatusLabels = {
  [ApprovalStatus.DRAFT || 'draft']: {
    label: '草稿',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  [ApprovalStatus.PENDING]: {
    label: '待审批',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
  },
  [ApprovalStatus.APPROVED]: {
    label: '已通过',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
  },
  [ApprovalStatus.REJECTED]: {
    label: '已拒绝',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
  },
  [ApprovalStatus.CANCELLED]: {
    label: '已取消',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
}
