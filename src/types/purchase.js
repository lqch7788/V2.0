/**
 * 采购申请单类型定义
 * 1:1 翻译 V1.1 src/types/purchase.ts（V1.1 TypeScript interface → V2.0 JSDoc typedef + 默认值对象）
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\types\purchase.ts
 */

// ============================================================
// 状态/类型枚举常量
// ============================================================

/** 采购计划状态（6 档） */
export const PurchasePlanStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  PURCHASING: 'purchasing',
  CANCELLED: 'cancelled',
}

/** 采购类型（7 档，含 safety 劳保用品，对齐 V1.1 server L29-32） */
export const PurchaseType = {
  PRODUCTION: 'production',
  URGENT: 'urgent',
  ROUTINE: 'routine',
  SAFETY: 'safety',
  MATERIAL: 'material',
  EQUIPMENT: 'equipment',
  OTHER: 'other',
}

/** 优先级（4 档） */
export const Priority = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
}

/** 审批状态（3 档） */
export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

// ============================================================
// 状态显示文本映射
// ============================================================

export const PURCHASE_STATUS_TEXT = {
  draft: '草稿',
  pending: '待审批',
  approved: '已通过',
  purchasing: '采购中',
  completed: '已完成',
  cancelled: '已取消',
}

export const PURCHASE_PRIORITY_TEXT = {
  urgent: '紧急',
  high: '高',
  normal: '中',
  low: '低',
}

export const PURCHASE_TYPE_TEXT = {
  production: '生产物资采购',
  urgent: '紧急采购',
  routine: '常规采购',
  material: '通用物资',
  safety: '劳保用品',
  equipment: '设备采购',
  other: '其他',
}

// ============================================================
// 状态样式映射（Tailwind 类）
// ============================================================

export const PURCHASE_STATUS_STYLE = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  approved: { bg: 'bg-blue-100', text: 'text-blue-700' },
  purchasing: { bg: 'bg-purple-100', text: 'text-purple-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
}

export const PURCHASE_PRIORITY_STYLE = {
  urgent: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  normal: { bg: 'bg-blue-100', text: 'text-blue-700' },
  low: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

/** 采购执行状态显示文本（4 档） */
export const PURCHASE_EXECUTION_STATUS_TEXT = {
  pending_execution: '待执行',
  purchasing: '采购中',
  completed: '已完成',
  cancelled: '已取消',
}

/** 采购执行状态 badge 样式 */
export const PURCHASE_EXECUTION_STATUS_STYLE = {
  pending_execution: { bg: 'bg-amber-100', text: 'text-amber-700' },
  purchasing: { bg: 'bg-purple-100', text: 'text-purple-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

/** 4 档下拉选项（用于详情弹窗编辑 / 批量编辑） */
export const PURCHASE_EXECUTION_STATUS_OPTIONS = [
  { value: 'pending_execution', label: '待执行' },
  { value: 'purchasing', label: '采购中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

// ============================================================
// 业务规则（前后端共用的纯函数）
// ============================================================

/** 允许删除的状态集合（草稿/待审批/已拒绝） */
const DELETABLE_STATUSES = new Set(['draft', 'pending', 'rejected'])

/** 允许编辑的状态集合（排除已审批、采购中、已完成、已取消） */
const EDITABLE_STATUSES = new Set(['draft', 'pending', 'rejected'])

/**
 * 判断采购计划是否可删除
 * 规则：草稿 / 待审批 / 已拒绝 状态可删除；其他状态不可删除
 * @param {Pick<PurchasePlan, 'status' | 'approvalStatus'> | null | undefined} plan
 * @returns {boolean}
 */
export function canDeletePurchasePlan(plan) {
  if (!plan) return false
  if (plan.approvalStatus === 'rejected') return true
  return DELETABLE_STATUSES.has(plan.status)
}

/**
 * 判断采购计划是否可编辑
 * 规则：草稿 / 待审批 / 已拒绝 状态可编辑
 * @param {Pick<PurchasePlan, 'status'> | null | undefined} plan
 * @returns {boolean}
 */
export function canEditPurchasePlan(plan) {
  if (!plan) return false
  return EDITABLE_STATUSES.has(plan.status)
}

// ============================================================
// 类型定义（JSDoc typedef，对齐 V1.1 TypeScript interface）
// ============================================================

/**
 * 采购计划物料明细项（17 字段，1:1 翻译 V1.1 PurchaseItem L42-80）
 * @typedef {Object} PurchasePlanItem
 * @property {string} id
 * @property {string} [relatedBatchCode]        // 关联生产计划批次号
 * @property {string} materialId
 * @property {string} materialCode              // 物料编码
 * @property {string} materialName              // 物料名称
 * @property {string} [barcode]                 // 条码
 * @property {string} category                  // 分类
 * @property {string} [bigCategory]             // 大分类
 * @property {string} [midCategory]             // 中分类
 * @property {string} [subCategory]             // 子分类
 * @property {string} specification             // 规格型号
 * @property {string} unit                      // 单位
 * @property {number} quantity                  // 采购数量
 * @property {number} estimatedPrice            // 预估单价（元）
 * @property {number} estimatedTotalPrice       // 预估总价 = quantity * estimatedPrice
 * @property {string} supplier                  // 供应商
 * @property {string} [location]                // 期望存放位置
 * @property {string} [batchNo]                 // 批号
 * @property {string} [productionDate]          // 生产日期
 * @property {string} [expiryDate]              // 有效期/到期日期
 * @property {string} [purpose]                 // 用途说明（关键业务字段）
 * @property {string} [remark]                  // 备注
 */

/**
 * 采购计划主体（32 字段，1:1 翻译 V1.1 PurchaseApplication L86-123）
 * @typedef {Object} PurchasePlan
 * @property {string} id
 * @property {string} purchaseApplicationCode   // 采购申请编号（必填，唯一标识）
 * @property {string} [relatedBatchCode]        // 关联生产计划批次号
 * @property {string} purchaseType              // 采购类型
 * @property {string} purchaseTypeName          // 类型显示名称
 * @property {string} applicant                 // 申请人
 * @property {string} applicantId               // 申请人ID
 * @property {string} applicantDepartment       // 申请部门
 * @property {string} applyDate                 // 申请日期
 * @property {string} requiredDate              // 需求日期
 * @property {string} priority                  // 优先级
 * @property {string} priorityText              // 优先级显示文本
 * @property {string} status                    // 状态
 * @property {string} statusText                // 状态显示文本
 * @property {string} [executionStatus]          // 采购执行状态
 * @property {PurchasePlanItem[]} items         // 物料明细数组
 * @property {number} itemCount                 // 物料种类数
 * @property {string} [approvalId]
 * @property {string} [approvalCode]
 * @property {string} [approvalStatus]
 * @property {string} [approvalPerson]          // 审批人
 * @property {string} [remark]                  // 备注
 * @property {string} createdAt                 // 时间戳
 * @property {string} updatedAt                 // 时间戳
 * @property {number} [totalAmount]             // 总金额
 * @property {string} [supplierName]            // 供应商名称
 * @property {string} [planTitle]               // 计划名称
 * @property {string} [planCode]                // 计划编码
 * @property {string} [planType]                // 计划类型
 * @property {string} [departmentName]          // 部门名称
 * @property {string} [applicantName]            // 申请人姓名
 * @property {string} [attachments]             // 附件 JSON
 */

/**
 * 排序字段（1:1 翻译 V1.1 PurchaseSortField L137-145）
 * @typedef {('relatedBatchCode'|'purchaseType'|'applicant'|'applicantDepartment'|'applyDate'|'requiredDate'|'priority'|'status')} PurchaseSortField
 */

/**
 * 排序方向
 * @typedef {('asc'|'desc')} SortDirection
 */

/**
 * 排序配置
 * @typedef {Object} SortConfig
 * @property {PurchaseSortField} field
 * @property {SortDirection} direction
 */

/**
 * 预警等级
 * @typedef {('normal'|'warning'|'overdue')} OverdueAlertLevel
 */

/**
 * 预警信息
 * @typedef {Object} OverdueAlert
 * @property {OverdueAlertLevel} level
 * @property {number} daysOverdue                // 负数表示剩余天数
 * @property {string} message
 */

/**
 * 筛选条件（1:1 翻译 V1.1 PurchaseFilters L259-273）
 * @typedef {Object} PurchaseFilters
 * @property {string} [relatedBatchCode]
 * @property {string} [purchaseType]             // 'all' 或 PurchaseType
 * @property {string} [status]                   // 'all' 或 PurchaseStatus
 * @property {string} [applicant]
 * @property {string} [applicantDepartment]
 * @property {string} [priority]                 // 'all' 或 PurchasePriority
 * @property {string} [requiredStartDate]
 * @property {string} [requiredEndDate]
 * @property {string} [applyStartDate]
 * @property {string} [applyEndDate]
 * @property {string} [keyword]                  // 搜索关键字
 * @property {string} [materialName]             // 物料名称
 * @property {string} [supplier]
 */

/**
 * 预警样式映射
 */
export const OVERDUE_ALERT_STYLE = {
  normal: { bg: '', text: '', icon: '' },
  warning: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⚠️' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: '🔴' },
}

// ============================================================
// 默认值对象（用于 spread 初始值）
// 保留 V1.1 默认值对象形式（运行时用作 `{ ...PurchasePlan, ...overrides }`）
// ============================================================

/** 采购计划物料明细项默认值（17 字段，1:1 翻译 V1.1 PurchaseItem L42-80） */
export const PurchasePlanItem = {
  id: '',
  relatedBatchCode: '',
  materialId: '',
  materialCode: '',
  materialName: '',
  barcode: '',
  category: '',
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  specification: '',
  unit: '',
  quantity: 0,
  estimatedPrice: 0,        // V1.1 用 estimatedPrice（V2.0 旧版误用 estimatedUnitPrice，已修正）
  estimatedTotalPrice: 0,
  supplier: '',
  location: '',
  batchNo: '',
  productionDate: '',
  expiryDate: '',
  purpose: '',
  remark: '',
}

/** 采购计划默认值（32 字段，1:1 翻译 V1.1 PurchaseApplication L86-123） */
export const PurchasePlan = {
  id: '',
  purchaseApplicationCode: '',
  relatedBatchCode: '',
  purchaseType: 'production',
  purchaseTypeName: '',
  applicant: '',
  applicantId: '',
  applicantDepartment: '',
  applyDate: '',
  requiredDate: '',
  priority: 'normal',
  priorityText: '中',
  status: 'draft',
  statusText: '草稿',
  executionStatus: 'pending_execution',
  items: [],
  itemCount: 0,
  approvalId: '',
  approvalCode: '',
  approvalStatus: 'pending',
  approvalPerson: '',
  remark: '',               // V1.1 用 remark（V2.0 旧版误用 remarks，已修正）
  totalAmount: 0,
  supplierName: '',
  planTitle: '',
  planCode: '',
  planType: '',
  departmentName: '',
  applicantName: '',
  attachments: [],
  createdAt: '',
  updatedAt: '',
}

/** 预警默认值 */
export const OverdueAlert = {
  level: 'normal',
  message: '',
  daysLeft: 0,
}

// ============================================================
// 预警计算函数（1:1 翻译 V1.1 calculateOverdueAlert L212-245）
// ============================================================

/**
 * 计算采购计划的预警状态
 * @param {PurchasePlan} plan
 * @returns {OverdueAlert}
 */
export function calculateOverdueAlert(plan) {
  if (!plan.requiredDate) {
    return { level: 'normal', message: '未设置交货日期' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const requiredDate = new Date(plan.requiredDate)
  requiredDate.setHours(0, 0, 0, 0)

  const diffTime = requiredDate.getTime() - today.getTime()
  const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysOverdue < 0) {
    return {
      level: 'overdue',
      message: `已逾期 ${Math.abs(daysOverdue)} 天`,
      daysLeft: daysOverdue,
    }
  } else if (daysOverdue <= 3) {
    return {
      level: 'warning',
      message: `即将到期，剩余 ${daysOverdue} 天`,
      daysLeft: daysOverdue,
    }
  } else {
    return {
      level: 'normal',
      message: `剩余 ${daysOverdue} 天`,
      daysLeft: daysOverdue,
    }
  }
}

// ============================================================
// 兼容旧代码的别名导出（1:1 翻译 V1.1 L325-353）
// ============================================================

export const PURCHASE_PLAN_STATUS_TEXT = PURCHASE_STATUS_TEXT
export const PURCHASE_PLAN_PRIORITY_TEXT = PURCHASE_PRIORITY_TEXT
export const PURCHASE_PLAN_TYPE_TEXT = PURCHASE_TYPE_TEXT
export const PURCHASE_PLAN_STATUS_STYLE = PURCHASE_STATUS_STYLE
export const PURCHASE_PLAN_PRIORITY_STYLE = PURCHASE_PRIORITY_STYLE
