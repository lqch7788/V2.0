/**
 * 问题来源模块配置
 * 从V1.1 sourceConfig.ts 1:1迁移
 */

/** @typedef {'inspection' | 'manual' | 'production' | 'equipment' | 'other'} SourceModuleType */

// 来源模块配置映射
export const SOURCE_MODULE_CONFIG = {
  inspection: { label: '巡查记录', color: 'text-blue-500', bgColor: 'bg-blue-50 border-blue-200' },
  manual: { label: '手动录入', color: 'text-gray-500', bgColor: 'bg-gray-50 border-gray-200' },
  production: { label: '生产管理', color: 'text-green-500', bgColor: 'bg-green-50 border-green-200' },
  equipment: { label: '设备管理', color: 'text-amber-500', bgColor: 'bg-amber-50 border-amber-200' },
  other: { label: '其他', color: 'text-purple-500', bgColor: 'bg-purple-50 border-purple-200' },
}

/** 获取来源配置 */
export const getSourceConfig = (module) => {
  return SOURCE_MODULE_CONFIG[module || 'other'] || SOURCE_MODULE_CONFIG.other
}

// 来源模块选项（用于下拉筛选）
export const SOURCE_MODULE_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'inspection', label: '巡查记录' },
  { value: 'manual', label: '手动录入' },
  { value: 'production', label: '生产管理' },
  { value: 'equipment', label: '设备管理' },
  { value: 'other', label: '其他' },
]
