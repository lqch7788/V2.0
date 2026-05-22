/**
 * 系统配置纯函数读取器 — V2.0 Vue3/Pinia 版本
 *
 * 架构角色: L2 配置消费层（纯函数轨）
 * 数据流: Store响应式状态 → 类型转换 → 返回值+兜底
 *
 * 使用场景: apiClient.ts 等非React/Vue模块
 * 关键约束: 不在模块顶层调用（避免循环依赖），在函数内部惰性读取
 */

// ==================== 类型定义 ====================

interface SystemConfig {
  configKey: string;
  configValue: string;
  isActive: boolean;
}

// ==================== 旧key→新key向后兼容映射 ====================

const LEGACY_KEY_MAP: Record<string, string> = {
  // 系统安全
  'session_timeout_minutes': 'system.security.session-timeout-minutes',
  'password_min_length': 'system.security.password-min-length',
  'login_max_attempts': 'system.security.login-max-attempts',
  // 系统备份
  'backup_auto_enabled': 'system.backup.auto-enabled',
  'backup_interval_hours': 'system.backup.interval-hours',
  'backup_retention_days': 'system.backup.retention-days',
  // 系统名称
  'system_name': 'system.name',
  // 系统性能
  'auto_save_interval': 'system.performance.auto-save-interval',
  'data_retention_days': 'system.performance.data-retention-days',
  // UI
  'theme_color': 'theme.primary-color',
  'page_size': 'ui.table.default-page-size',
  // 功能开关
  'enable_notifications': 'notification.channel.master-switch',
  'enable_export': 'report.export.master-switch',
  'demo_mode': 'feature.demo-mode',
  'show_tutorial': 'feature.show-tutorial',
  // 任务超时
  'task_accept_warning_hours': 'task.overtime.accept-warning-hours',
  'task_accept_critical_hours': 'task.overtime.accept-critical-hours',
  'task_execution_warning_hours': 'task.overtime.execution-warning-hours',
  'task_execution_critical_hours': 'task.overtime.execution-critical-hours',
  'task_acceptance_warning_hours': 'task.overtime.acceptance-warning-hours',
  'task_acceptance_critical_hours': 'task.overtime.acceptance-critical-hours',
  'task_check_interval_ms': 'task.overtime.check-interval-ms',
  // 任务延期
  'task_max_extensions': 'task.deadline.max-extensions',
  'task_max_extension_hours': 'task.deadline.max-extension-hours',
  'task_total_max_extension_hours': 'task.deadline.total-max-extension-hours',
  // 任务催办
  'task_reminder_interval': 'task.reminder.min-interval-minutes',
  'task_reminder_advance_hours': 'task.reminder.auto-reminder-hours',
  'task_max_reminders_per_day': 'task.reminder.max-per-day',
  // 任务返工
  'task_max_rework_rounds': 'task.rework.max-count',
  // 任务存储
  'task_storage_days': 'task.storage.archive-after-days',
  // 审批超时
  'approval_timeout_hours': 'approval.timeout.normal-hours',
  'approval_auto_threshold': 'approval.threshold.auto-approve',
  'approval_allow_delegate': 'approval.delegation.enabled',
  'approval_require_comment': 'approval.workflow.require-comment',
  'approval_urgent_timeout': 'approval.timeout.urgent-hours',
  'approval_normal_timeout': 'approval.timeout.normal-hours',
  'approval_hr_timeout': 'approval.timeout.hr-hours',
  'approval_finance_timeout': 'approval.timeout.finance-hours',
  'approval_ultimate_timeout': 'approval.timeout.ultimate-hours',
  'approval_high_value_threshold': 'approval.threshold.high-value',
  // 业务
  'inventory_safe_stock': 'material.inventory.safe-stock-days',
  'task_reward_multiplier': 'labor.salary.reward-multiplier',
  'seedling_survival_threshold': 'crop.seedling.survival-threshold',
  'harvest_cycle_days': 'crop.harvest.default-cycle-days',
};

// ==================== 缓存层 ====================

/** 配置值缓存 */
const valueCache = new Map<string, string | null>();

// ==================== 核心读取函数 ====================

/**
 * 从Store惰性读取字符串配置值
 * @param key - 命名空间配置键
 * @param defaultValue - 配置缺失时的兜底值
 */
export function getSystemConfigValue(key: string, defaultValue: string): string {
  // 先查缓存
  const cached = valueCache.get(key);
  if (cached !== undefined) return cached ?? defaultValue;

  try {
    // 动态导入Pinia store（避免循环依赖）
    const { useSystemConfigStore } = require('../stores');
    const store = useSystemConfigStore();

    // Pinia组合式API: store.configs 是 ref
    const configs: SystemConfig[] = store.configs || [];

    // 1. 优先用新key查找
    let config = configs.find(
      (c) => c.configKey === key && c.isActive
    );

    // 2. 新key未命中 → 尝试旧key兼容查找
    if (!config) {
      const legacyKey = LEGACY_KEY_MAP[key];
      if (legacyKey) {
        config = configs.find(
          (c) => c.configKey === legacyKey && c.isActive
        );
      }
    }

    const val = config?.configValue ?? defaultValue;
    valueCache.set(key, val);
    return val;
  } catch {
    // Store未加载或任何异常 → 返回兜底值
    return defaultValue;
  }
}

/**
 * 从Store惰性读取数字配置值
 */
export function getSystemConfigValueNumber(key: string, defaultValue: number): number {
  const strVal = getSystemConfigValue(key, String(defaultValue));
  const num = Number(strVal);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 从Store惰性读取布尔配置值
 */
export function getSystemConfigValueBoolean(key: string, defaultValue: boolean): boolean {
  const strVal = getSystemConfigValue(key, String(defaultValue));
  if (strVal === 'true' || strVal === '1') return true;
  if (strVal === 'false' || strVal === '0') return false;
  return defaultValue;
}

/**
 * 批量获取同一前缀下的所有配置值
 */
export function getSystemConfigValuesByPrefix(prefix: string): Record<string, string> {
  try {
    const { useSystemConfigStore } = require('../stores');
    const store = useSystemConfigStore();
    const configs: SystemConfig[] = store.configs || [];

    const result: Record<string, string> = {};
    for (const c of configs) {
      if (c.configKey.startsWith(prefix) && c.isActive) {
        const shortKey = c.configKey.slice(prefix.length);
        result[shortKey] = c.configValue;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * 清除配置读取缓存
 */
export function clearConfigCache(): void {
  valueCache.clear();
}
