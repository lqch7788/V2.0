/**
 * 物料退库类型定义
 * 从V1.1 src/components/materialReturn/types.ts迁移
 */

/**
 * 退库物料明细
 * @typedef {Object} MaterialItem
 * @property {string} sourceApplicationCode - 来源领料单号
 * @property {string} materialCode - 物料编码
 * @property {string} category - 物料分类
 * @property {string} materialName - 物料名称
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {number} quantity - 领料数量
 * @property {number} returnQuantity - 本次退料数量
 * @property {number} unitPrice - 单价
 * @property {string} warehousePosition - 仓库货位
 * @property {string} reason - 退料原因
 * @property {string} remark - 备注
 */

/**
 * 退库记录
 * @typedef {Object} ReturnRecord
 * @property {number} id - ID
 * @property {string} code - 退库单号
 * @property {string} date - 退库日期
 * @property {string} type - 类型
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} status - 状态
 * @property {string} statusClass - 状态样式类
 * @property {string} remark - 备注
 * @property {string} operator - 操作人
 * @property {string} reviewer - 审核人
 * @property {string} reviewDate - 审核日期
 * @property {string} rejectReason - 驳回原因
 * @property {MaterialItem[]} materials - 物料明细
 */

// 状态样式映射
export const STATUS_STYLE_MAP = {
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: '已完成' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: '待审批' },
  approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: '已审批' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: '已驳回' },
  voided: { bg: 'bg-gray-100', text: 'text-gray-600', label: '已作废' }
}

// 退库原因选项
export const RETURN_REASONS = [
  '质量问题',
  '规格不符',
  '过期产品',
  '运输损坏',
  '库存积压',
  '其他'
]
