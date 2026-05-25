/**
 * 物料退库类型定义
 */

/**
 * 退库物料明细
 * @typedef {Object} MaterialItem
 * @property {string} sourceApplicationCode - 来源领料单号
 * @property {string} materialCode - 物料编码
 * @property {string} category - 物料分类（格式："中类-小类"）
 * @property {string} materialName - 物料名称
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {number} [quantity] - 领料数量（原单据数量，选填）
 * @property {number} returnQuantity - 本次退料数量
 * @property {number} unitPrice - 单价(元)
 * @property {string} warehousePosition - 仓库货位
 * @property {string} reason - 退料原因
 * @property {string} remark - 备注
 */

/**
 * 退库记录状态
 * @typedef {'approved'|'pending'|'rejected'|'completed'|'voided'|''} ReturnStatus
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
 * @property {ReturnStatus} status - 状态
 * @property {string} statusClass - 状态样式类
 * @property {string} remark - 备注
 * @property {string} operator - 操作人
 * @property {string} reviewer - 审核人
 * @property {string} reviewDate - 审核日期
 * @property {string} rejectReason - 驳回原因
 * @property {MaterialItem[]} materials - 物料明细
 */

/**
 * 搜索表单
 * @typedef {Object} SearchForm
 * @property {string} code - 退库单号
 * @property {string} material - 物料
 * @property {string} warehouse - 仓库
 * @property {string} applicant - 申请人
 * @property {string} status - 状态
 * @property {string} department - 部门
 */

/**
 * 编辑表单数据
 * @typedef {Object} EditFormData
 * @property {string} date - 日期
 * @property {string} type - 类型
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} status - 状态
 * @property {string} remark - 备注
 * @property {string} operator - 操作人
 * @property {string} reviewer - 审核人
 * @property {string} reviewDate - 审核日期
 * @property {string} rejectReason - 驳回原因
 * @property {MaterialItem[]} materials - 物料列表
 */

/**
 * 新增表单数据
 * @typedef {Object} AddFormData
 * @property {string} code - 单号
 * @property {string} date - 日期
 * @property {string} type - 类型
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} remark - 备注
 * @property {string} operator - 操作人
 * @property {string} reviewer - 审核人
 * @property {string} reviewDate - 审核日期
 * @property {string} rejectReason - 驳回原因
 * @property {MaterialItem[]} materials - 物料列表
 */

/**
 * 状态选项
 * @type {Array<{value: string, label: string}>}
 */
export const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: '待审批', label: '待审批' },
  { value: '已审批', label: '已审批' },
  { value: '已驳回', label: '已驳回' },
  { value: '已完成', label: '已完成' },
  { value: '已作废', label: '已作废' },
]

/**
 * 退料原因选项
 * @type {string[]}
 */
export const RETURN_REASONS = [
  '生产剩余',
  '产品质量问题',
  '领错物料',
  '规格不符',
  '过期产品',
  '运输损坏',
  '库存积压',
  '其他',
]

/**
 * 状态样式映射
 * @type {Record<string, {bg: string, text: string}>}
 */
export const STATUS_STYLE_MAP = {
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  voided: { bg: 'bg-gray-200', text: 'text-gray-500' },
  '': { bg: 'bg-gray-100', text: 'text-gray-700' },
}
