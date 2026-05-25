// ============================================================
// 审批超时与委托配置 — V2.0 Pinia Store化
// 文件路径：src/config/approvalTimeout.js
// V2.0改造：localStorage读取 → getSystemConfigValue()从Store/API读取
// 所有配置优先从Store，硬编码兜底
// ============================================================

import { ApprovalType } from '../types/approval.js'
import { getSystemConfigValue, getSystemConfigValueNumber } from './systemConfigReader.ts'

// ============================================================
// 超时级别
// ============================================================

export const TimeoutLevel = {
  NORMAL: 'normal',
  WARNING: 'warning',
  OVERDUE: 'overdue',
  ULTIMATE: 'ultimate',
}

// ============================================================
// 超时自动处理策略
// ============================================================

export const TimeoutAction = {
  ESCALATE: 'escalate',
  AUTO_APPROVE: 'auto_approve',
  AUTO_REJECT: 'auto_reject',
  NOTIFY: 'notify',
  SKIP: 'skip',
}

// ============================================================
// 默认超时配置（兜底值，Store未加载时使用）
// ============================================================

export const TIMEOUT_DEFAULTS = {
  urgent: {
    timeoutHours: 4,
    escalationHours: 2,
    autoEscalation: true,
    escalationType: 'urgent',
  },
  normal: {
    timeoutHours: 48,
    escalationHours: 24,
    autoEscalation: true,
    escalationType: 'notify_manager',
  },
  hr: {
    timeoutHours: 24,
    escalationHours: 12,
    autoEscalation: true,
    escalationType: 'urgent',
  },
  finance: {
    timeoutHours: 72,
    escalationHours: 48,
    autoEscalation: true,
    escalationType: 'notify_manager',
  },
  exempt: {
    timeoutHours: 1,
    escalationHours: 0.5,
    autoEscalation: false,
  },
}

// ============================================================
// V2.0: 从Store读取超时配置（替代原 localStorage 读取）
// ============================================================

function loadTimeoutConfigFromStore() {
  try {
    return {
      urgent: {
        timeoutHours: getSystemConfigValueNumber('approval.timeout.urgent-hours', TIMEOUT_DEFAULTS.urgent.timeoutHours),
        escalationHours: getSystemConfigValueNumber('approval.timeout.urgent-escalation', TIMEOUT_DEFAULTS.urgent.escalationHours ?? 2),
        autoEscalation: true,
        escalationType: 'urgent',
      },
      normal: {
        timeoutHours: getSystemConfigValueNumber('approval.timeout.normal-hours', TIMEOUT_DEFAULTS.normal.timeoutHours),
        escalationHours: getSystemConfigValueNumber('approval.timeout.normal-escalation', TIMEOUT_DEFAULTS.normal.escalationHours ?? 24),
        autoEscalation: true,
        escalationType: 'notify_manager',
      },
      hr: {
        timeoutHours: getSystemConfigValueNumber('approval.timeout.hr-hours', TIMEOUT_DEFAULTS.hr.timeoutHours),
        escalationHours: getSystemConfigValueNumber('approval.timeout.hr-escalation', TIMEOUT_DEFAULTS.hr.escalationHours ?? 12),
        autoEscalation: true,
        escalationType: 'urgent',
      },
      finance: {
        timeoutHours: getSystemConfigValueNumber('approval.timeout.finance-hours', TIMEOUT_DEFAULTS.finance.timeoutHours),
        escalationHours: getSystemConfigValueNumber('approval.timeout.finance-escalation', TIMEOUT_DEFAULTS.finance.escalationHours ?? 48),
        autoEscalation: true,
        escalationType: 'notify_manager',
      },
      exempt: {
        timeoutHours: getSystemConfigValueNumber('approval.timeout.exempt-hours', TIMEOUT_DEFAULTS.exempt.timeoutHours),
        escalationHours: 0.5,
        autoEscalation: false,
      },
      ultimateTimeoutHours: getSystemConfigValueNumber('approval.timeout.ultimate-hours', 168),
      ultimateAction: (getSystemConfigValue('approval.timeout.ultimate-action', 'auto_approve')) || 'auto_approve',
    }
  } catch (error) {
    console.error('【超时配置】读取Store失败，使用默认配置', error)
    return getDefaultTimeoutConfig()
  }
}

function getDefaultTimeoutConfig() {
  return {
    ...TIMEOUT_DEFAULTS,
    ultimateTimeoutHours: 168,
    ultimateAction: 'auto_approve',
  }
}

// ============================================================
// 获取超时配置（带缓存，CustomEvent自动清除）
// ============================================================

let cachedTimeoutConfig = null

// V2.0: 监听Store变更事件自动清除缓存
if (typeof window !== 'undefined') {
  window.addEventListener('system-config-changed', () => {
    cachedTimeoutConfig = null
  })
}

export function getTimeoutConfig() {
  if (!cachedTimeoutConfig) {
    cachedTimeoutConfig = loadTimeoutConfigFromStore()
  }
  return cachedTimeoutConfig
}

/** 刷新超时配置缓存 */
export function refreshTimeoutConfig() {
  cachedTimeoutConfig = loadTimeoutConfigFromStore()
}

// ============================================================
// 根据审批类型获取超时配置
// ============================================================

export function getTimeoutConfigByType(type) {
  const config = getTimeoutConfig()

  // HR相关审批类型
  const hrTypes = [
    'leave', 'overtime', 'resignation', 'recruitment', 'onboarding',
    'attendance_repair', 'salary_adjustment', 'contract_renewal', 'salary_budget', 'transfer',
  ]

  // 财务相关审批类型
  const financeTypes = [
    'budget_create', 'budget_adjust',
  ]

  if (hrTypes.includes(type)) {
    return config.hr
  }

  if (financeTypes.includes(type)) {
    return config.finance
  }

  return config.normal
}

// ============================================================
// 获取最终超时配置
// ============================================================

export function getUltimateTimeoutConfig() {
  const config = getTimeoutConfig()
  return {
    hours: config.ultimateTimeoutHours,
    action: config.ultimateAction,
  }
}

// ============================================================
// 超时检测结果
// ============================================================

export function checkTimeout(waitedHours, config) {
  const ultimateConfig = getUltimateTimeoutConfig()

  let level = TimeoutLevel.NORMAL
  if (waitedHours >= ultimateConfig.hours) {
    level = TimeoutLevel.ULTIMATE
  } else if (waitedHours >= config.timeoutHours) {
    level = TimeoutLevel.OVERDUE
  } else if (config.escalationHours !== undefined && waitedHours >= config.escalationHours) {
    level = TimeoutLevel.WARNING
  }

  return {
    isTimeout: waitedHours >= ultimateConfig.hours,
    level,
    remainingHours: Math.max(0, config.timeoutHours - waitedHours),
    waitedHours,
    escalated: config.autoEscalation && config.escalationHours !== undefined && waitedHours >= config.escalationHours,
  }
}

// ============================================================
// 委托配置
// ============================================================

// 默认委托规则（兜底）
export const DELEGATION_RULE_DEFAULTS = [
  { fromRole: 'manager', toRole: 'department_head', enabled: true, remark: '经理外出时委托给部门主管' },
  { fromRole: 'department_head', toRole: 'manager', enabled: true, remark: '部门主管外出时委托给经理' },
  { fromRole: 'director', toRole: 'manager', enabled: true, remark: '总监外出时委托给经理' },
  { fromRole: 'hr', toRole: 'hr_manager', enabled: true, remark: '人事专员外出时委托给人事经理' },
]

// ============================================================
// V2.0: 从Store读取委托规则（替代原 localStorage 读取）
// ============================================================

function loadDelegationRulesFromStore() {
  try {
    const json = getSystemConfigValue('approval.delegation.rules', '')
    if (json) {
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (error) {
    console.warn('【委托规则】解析Store配置失败，使用默认规则', error)
  }
  return DELEGATION_RULE_DEFAULTS
}

// 获取委托规则（带缓存，CustomEvent自动清除）
let cachedDelegationRules = null

export function getDelegationRules() {
  if (!cachedDelegationRules) {
    cachedDelegationRules = loadDelegationRulesFromStore()
  }
  return cachedDelegationRules
}

/** 刷新委托规则缓存 */
export function refreshDelegationRules() {
  cachedDelegationRules = loadDelegationRulesFromStore()
}

// ============================================================
// 检查是否应该执行超时动作
// ============================================================

export function shouldExecuteTimeoutAction(waitedHours, config, action) {
  const ultimateConfig = getUltimateTimeoutConfig()

  switch (action) {
    case TimeoutAction.ESCALATE:
      return config.autoEscalation && config.escalationHours !== undefined
        && waitedHours >= config.escalationHours
    case TimeoutAction.AUTO_APPROVE:
      return waitedHours >= ultimateConfig.hours
    case TimeoutAction.NOTIFY:
      return config.autoEscalation
    default:
      return false
  }
}

// ============================================================
// 获取超时动作配置
// ============================================================

export function getUltimateTimeoutAction() {
  const ultimateConfig = getUltimateTimeoutConfig()
  return ultimateConfig.action === 'auto_approve' ? TimeoutAction.AUTO_APPROVE : TimeoutAction.AUTO_REJECT
}

// ============================================================
// 获取HR审批类型列表
// ============================================================

export function getHrApprovalTypes() {
  return [
    'leave', 'overtime', 'resignation', 'recruitment', 'onboarding',
    'attendance_repair', 'salary_adjustment', 'contract_renewal', 'salary_budget', 'transfer',
  ]
}

// ============================================================
// 获取财务审批类型列表
// ============================================================

export function getFinanceApprovalTypes() {
  return ['budget_create', 'budget_adjust']
}
