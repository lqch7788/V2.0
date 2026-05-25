// ============================================================
// 分级审批配置 — V2.0 Pinia Store化
// 文件路径：src/config/approvalHierarchy.js
// 功能：根据金额和类型自动确定审批级别
// V2.0改造：getHighValueOrderThreshold() Pinia Store动态读取（优先），硬编码兜底
// ============================================================

import { ApprovalType } from '../types/approval.js'
import { getSystemConfigValueNumber, getSystemConfigValue } from './systemConfigReader.ts'

// ============================================================
// 审批级别枚举
// ============================================================

export const ApprovalLevel = {
  /** 免审批 - 自动通过 */
  EXEMPT: 'exempt',
  /** 快速审批 - 单人审批 */
  QUICK: 'quick',
  /** 标准审批 - 多级审批 */
  STANDARD: 'standard',
  /** 严格审批 - 多级多审 */
  STRICT: 'strict',
}

// ============================================================
// 审批级别配置映射
// ============================================================

export const APPROVAL_LEVEL_CONFIGS = {
  [ApprovalLevel.EXEMPT]: {
    level: ApprovalLevel.EXEMPT,
    name: '免审批',
    description: '金额低于阈值，自动通过，无需人工审批',
    approverCount: 0,
    requireMultiApprover: false,
  },
  [ApprovalLevel.QUICK]: {
    level: ApprovalLevel.QUICK,
    name: '快速审批',
    description: '单人审批，快速通过',
    approverCount: 1,
    requireMultiApprover: false,
    approverRoles: ['manager'],
  },
  [ApprovalLevel.STANDARD]: {
    level: ApprovalLevel.STANDARD,
    name: '标准审批',
    description: '部门主管 + 经理二级审批',
    approverCount: 2,
    requireMultiApprover: false,
    approverRoles: ['department_head', 'manager'],
  },
  [ApprovalLevel.STRICT]: {
    level: ApprovalLevel.STRICT,
    name: '严格审批',
    description: '部门主管 + 经理 + 总监三级审批',
    approverCount: 3,
    requireMultiApprover: true,
    approverRoles: ['department_head', 'manager', 'director'],
  },
}

// ============================================================
// 金额阈值配置（单位：元）
// ============================================================

// 按金额升序排列的阈值配置
export const AMOUNT_THRESHOLDS = [
  { max: 1000, level: ApprovalLevel.EXEMPT },      // < 1000 免审批
  { max: 10000, level: ApprovalLevel.QUICK },      // 1000-10000 快速审批
  { max: 50000, level: ApprovalLevel.STANDARD },   // 10000-50000 标准审批
  // >= 50000 严格审批
]

// ============================================================
// 审批类型特定配置
// ============================================================

// 审批类型特定配置
export const TYPE_SPECIFIC_CONFIGS = [
  // ========== 业务审批 ==========
  {
    type: ApprovalType.MATERIAL_REQUEST,
    batchApprovalSupported: true,
    remark: '领料申请，根据金额确定审批级别',
  },
  {
    type: ApprovalType.RETURN_MATERIAL,
    batchApprovalSupported: true,
    remark: '退料单',
  },
  {
    type: ApprovalType.PURCHASE_REQUEST,
    batchApprovalSupported: true,
    remark: '采购申请，根据采购金额确定审批级别',
  },
  {
    type: ApprovalType.MATERIAL_INBOUND,
    forceExempt: false,
    batchApprovalSupported: true,
    remark: '物料入库',
  },
  {
    type: ApprovalType.MATERIAL_TRANSFER,
    batchApprovalSupported: true,
    remark: '库存调拨',
  },
  {
    type: ApprovalType.SEED_SOURCE_INBOUND,
    batchApprovalSupported: false,
    remark: '种源入库，需要严格审批',
  },
  {
    type: ApprovalType.SEEDLING_PLAN,
    batchApprovalSupported: false,
    forceStrict: false,
    remark: '育苗计划',
  },
  {
    type: ApprovalType.PLANTING_PLAN,
    batchApprovalSupported: false,
    remark: '种植计划',
  },
  {
    type: ApprovalType.ORDER_CREATE,
    batchApprovalSupported: false,
    remark: '订单创建，高价值订单需要严格审批',
  },
  {
    type: ApprovalType.ORDER_CHANGE,
    batchApprovalSupported: false,
    remark: '订单变更',
  },

  // ========== 生产审批 ==========
  {
    type: ApprovalType.PRODUCTION_PLAN,
    batchApprovalSupported: false,
    remark: '生产计划，需要标准审批',
  },
  {
    type: ApprovalType.PRODUCTION_BATCH,
    batchApprovalSupported: false,
    remark: '生产批次',
  },
  {
    type: ApprovalType.BATCH_CHANGE,
    batchApprovalSupported: false,
    remark: '批次变更',
  },
  {
    type: ApprovalType.BATCH_VOID,
    batchApprovalSupported: false,
    forceStrict: true,
    remark: '批次作废，强制严格审批',
  },
  {
    type: ApprovalType.TECH_SOLUTION,
    batchApprovalSupported: false,
    remark: '技术方案',
  },

  // ========== 农事审批 ==========
  {
    type: ApprovalType.TASK_DISPATCH,
    batchApprovalSupported: false,
    remark: '任务派发',
  },
  {
    type: ApprovalType.TASK_CHANGE,
    batchApprovalSupported: false,
    remark: '任务变更',
  },
  {
    type: ApprovalType.INSPECTION_ISSUE,
    batchApprovalSupported: false,
    remark: '巡查问题',
  },
  {
    type: ApprovalType.ISSUE_RESOLVE,
    batchApprovalSupported: false,
    remark: '问题整改',
  },

  // ========== 采收审批 ==========
  {
    type: ApprovalType.HARVEST_REQUEST,
    batchApprovalSupported: false,
    remark: '采收申请',
  },

  // ========== 作物补录审批 ==========
  {
    type: ApprovalType.SEED_SOURCE_SUPPLEMENTARY,
    forceStrict: true,
    batchApprovalSupported: false,
    remark: '种源补录，强制严格审批',
  },
  {
    type: ApprovalType.SEEDLING_SUPPLEMENTARY,
    forceStrict: true,
    batchApprovalSupported: false,
    remark: '育苗补录，强制严格审批',
  },
  {
    type: ApprovalType.CROP_STORAGE_SUPPLEMENTARY,
    forceStrict: true,
    batchApprovalSupported: false,
    remark: '作物入库补录，强制严格审批',
  },

  // ========== 指标/公告审批 ==========
  {
    type: ApprovalType.INDICATOR_APPROVAL,
    batchApprovalSupported: false,
    remark: '指标审批',
  },
  {
    type: ApprovalType.ANNOUNCEMENT_APPROVAL,
    batchApprovalSupported: false,
    remark: '公告审批',
  },

  // ========== 成本审批 ==========
  {
    type: ApprovalType.BUDGET_CREATE,
    batchApprovalSupported: false,
    remark: '预算编制，高金额需要严格审批',
  },
  {
    type: ApprovalType.BUDGET_ADJUST,
    batchApprovalSupported: false,
    remark: '预算调整，高金额需要严格审批',
  },

  // ========== HR审批 ==========
  {
    type: ApprovalType.LEAVE,
    batchApprovalSupported: false,
    remark: '请假，3天内快速审批',
  },
  {
    type: ApprovalType.OVERTIME,
    batchApprovalSupported: false,
    remark: '加班，2小时内免审批',
  },
  {
    type: ApprovalType.RESIGNATION,
    forceStrict: true,
    batchApprovalSupported: false,
    remark: '离职，强制严格审批',
  },
  {
    type: ApprovalType.RECRUITMENT,
    batchApprovalSupported: false,
    forcedLevel: ApprovalLevel.STANDARD,
    remark: '招聘，标准二级审批（部门主管+经理）',
  },
  {
    type: ApprovalType.ONBOARDING,
    batchApprovalSupported: false,
    remark: '入职',
  },
  {
    type: ApprovalType.ATTENDANCE_REPAIR,
    batchApprovalSupported: false,
    remark: '考勤补录',
  },
  {
    type: ApprovalType.SALARY_ADJUSTMENT,
    forceStrict: true,
    batchApprovalSupported: false,
    remark: '调薪，强制严格审批',
  },
  {
    type: ApprovalType.CONTRACT_RENEWAL,
    batchApprovalSupported: false,
    remark: '合同续签',
  },
  {
    type: ApprovalType.SALARY_BUDGET,
    forceStrict: true,
    batchApprovalSupported: false,
    remark: '工资预算，强制严格审批',
  },
  {
    type: ApprovalType.TRANSFER,
    forceStrict: true,
    batchApprovalSupported: false,
    remark: '转岗，强制严格审批',
  },
]

// ============================================================
// 从 Pinia Store 加载运行时配置（优先），硬编码配置作为降级
// ============================================================

let _storeLevelConfigs = []
let _storeAmountThresholds = []
let _storeTypeRules = []
let _storeReady = false

/** 由 useApprovalStore 在数据加载完成后调用，同步运行时配置 */
export function syncApprovalStoreData(data) {
  _storeLevelConfigs = data.levelConfigs || []
  _storeAmountThresholds = data.amountThresholds || []
  _storeTypeRules = data.typeRules || []
  _storeReady = _storeLevelConfigs.length > 0 || _storeAmountThresholds.length > 0 || _storeTypeRules.length > 0
}

// ============================================================
// 根据类型获取特定配置
// ============================================================

export function getTypeSpecificConfig(type) {
  if (_storeReady && _storeTypeRules.length > 0) {
    const rule = _storeTypeRules.find((r) => r.approvalType === type)
    if (rule) {
      return {
        type: rule.approvalType,
        forceExempt: !!rule.forceExempt,
        forceStrict: !!rule.forceStrict,
        forcedLevel: rule.forcedLevel || undefined,
        customApproverCount: rule.customApproverCount,
        batchApprovalSupported: !!rule.batchApprovalSupported,
        remark: rule.remark,
      }
    }
  }
  return TYPE_SPECIFIC_CONFIGS.find(config => config.type === type)
}

// ============================================================
// 根据金额获取审批级别
// ============================================================

export function getLevelByAmount(amount) {
  if (_storeReady && _storeAmountThresholds.length > 0) {
    const sorted = [..._storeAmountThresholds].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    for (const t of sorted) {
      if (amount < t.maxAmount) {
        return t.levelCode
      }
    }
  } else {
    for (const threshold of AMOUNT_THRESHOLDS) {
      if (amount < threshold.max) {
        return threshold.level
      }
    }
  }
  return ApprovalLevel.STRICT
}

// ============================================================
// 获取审批级别配置
// ============================================================

export function getApprovalLevelConfig(level) {
  if (_storeReady && _storeLevelConfigs.length > 0) {
    const config = _storeLevelConfigs.find((c) => c.levelCode === level)
    if (config) {
      let approverRoles
      if (config.approverRoles) {
        approverRoles = Array.isArray(config.approverRoles) ? config.approverRoles : []
      }
      return {
        level: config.levelCode,
        name: config.levelName,
        description: config.description || '',
        approverCount: config.approverCount || 0,
        requireMultiApprover: !!config.requireMultiApprover,
        approverRoles,
      }
    }
  }
  return APPROVAL_LEVEL_CONFIGS[level]
}

// ============================================================
// V2.0: 从Store读取运行时配置（替代原 localStorage 读取）
// ============================================================

/** 高价值订单阈值默认值 */
const HIGH_VALUE_ORDER_THRESHOLD_DEFAULT = 100000

/**
 * 获取高价值订单阈值（V2.0: 优先Store，兜底常量）
 */
export function getHighValueOrderThreshold() {
  try {
    return getSystemConfigValueNumber('approval.threshold.high-value', HIGH_VALUE_ORDER_THRESHOLD_DEFAULT)
  } catch (error) {
    console.error('【审批配置】加载高价值订单阈值失败', error)
    return HIGH_VALUE_ORDER_THRESHOLD_DEFAULT
  }
}

/** 从Store动态读取金额阈值（优先），硬编码兜底 */
export function getAmountThresholds() {
  try {
    const exemptMax = getSystemConfigValueNumber('approval.threshold.exempt-max', 1000)
    const quickMax = getSystemConfigValueNumber('approval.threshold.quick-max', 10000)
    const standardMax = getSystemConfigValueNumber('approval.threshold.standard-max', 50000)

    return [
      { max: exemptMax, level: ApprovalLevel.EXEMPT },
      { max: quickMax, level: ApprovalLevel.QUICK },
      { max: standardMax, level: ApprovalLevel.STANDARD },
    ]
  } catch {
    return AMOUNT_THRESHOLDS // 兜底
  }
}

/**
 * 检查订单是否为高价值订单（从数据字典加载阈值）
 */
export function isHighValueOrder(amount) {
  const threshold = getHighValueOrderThreshold()
  return amount >= threshold
}

// ============================================================
// 审批级别名称映射
// ============================================================

export const APPROVAL_LEVEL_NAMES = {
  [ApprovalLevel.EXEMPT]: '免审批',
  [ApprovalLevel.QUICK]: '快速审批',
  [ApprovalLevel.STANDARD]: '标准审批',
  [ApprovalLevel.STRICT]: '严格审批',
}

/**
 * 获取审批级别的中文名称
 */
export function getApprovalLevelName(level) {
  return APPROVAL_LEVEL_NAMES[level] || APPROVAL_LEVEL_CONFIGS[level]?.name || level
}
