/**
 * 农事管理模块 - 通用类型定义（V2.0 从 V1.1 迁移）
 * 包含巡查记录、问题分类、天气选项等常量
 */

// ============================================
// 天气选项
// ============================================
export const WEATHER_OPTIONS = [
  { value: '晴', label: '晴' },
  { value: '多云', label: '多云' },
  { value: '阴', label: '阴' },
  { value: '雨', label: '雨' },
  { value: '雪', label: '雪' },
  { value: '雾', label: '雾' },
] as const

// ============================================
// 作物状态
// ============================================
export const CROP_STATUS_OPTIONS = [
  { value: '良好', label: '良好' },
  { value: '一般', label: '一般' },
  { value: '较差', label: '较差' },
  { value: '有病虫害', label: '有病虫害' },
] as const

// ============================================
// 问题分类（用于巡查问题统计）
// ============================================
export const ISSUE_CATEGORIES = [
  { value: 'disease', label: '病害' },
  { value: 'pest', label: '虫害' },
  { value: 'environment', label: '环境' },
  { value: 'growth', label: '长势' },
  { value: 'equipment', label: '设备' },
  { value: 'other', label: '其他' },
] as const

// ============================================
// 问题预设选项（按分类）
// ============================================
export const ISSUE_PRESETS: Record<string, string[]> = {
  disease: ['灰霉病', '病毒病', '白粉病', '枯萎病', '疫病', '叶霉病'],
  pest: ['蚜虫', '红蜘蛛', '白粉虱', '蓟马', '菜青虫', '粉蝶'],
  environment: ['温度过高', '温度过低', '湿度过大', '积水', '通风不良', '光照不足'],
  growth: ['叶片发黄', '萎蔫', '生长缓慢', '畸形', '落花落果', '徒长'],
  equipment: ['滴灌异常', '遮阳网故障', '通风异常', '灌溉系统故障', '施肥系统故障'],
  other: [],
}

// ============================================
// 期望完成时间选项
// ============================================
export const COMPLETION_TIME_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: 'tomorrow', label: '明天' },
  { value: 'three_days', label: '3天内' },
  { value: 'week', label: '本周' },
] as const

// ============================================
// 巡查记录状态
// ============================================
export const INSPECTION_STATUS = {
  NORMAL: 'normal',
  ATTENTION: 'attention',
  CRITICAL: 'critical',
} as const

// ============================================
// 问题严重程度
// ============================================
export const PROBLEM_SEVERITY = {
  LIGHT: '轻微',
  MEDIUM: '中等',
  SERIOUS: '严重',
} as const

// ============================================
// 农事操作类型
// ============================================
export const FARM_OPERATION_TYPES = [
  { value: 'planting', label: '定植' },
  { value: 'irrigation', label: '灌溉' },
  { value: 'fertilization', label: '施肥' },
  { value: 'pest_control', label: '病虫害防治' },
  { value: 'pruning', label: '修剪' },
  { value: 'harvest', label: '采收' },
  { value: 'weeding', label: '中耕除草' },
  { value: 'other', label: '其他' },
] as const

export type FarmOperationType = typeof FARM_OPERATION_TYPES[number]['value']

// ============================================
// 优先级选项
// ============================================
export const PRIORITY_OPTIONS = [
  { value: 'high', label: '高', color: 'red' },
  { value: 'medium', label: '中', color: 'yellow' },
  { value: 'low', label: '低', color: 'green' },
] as const
