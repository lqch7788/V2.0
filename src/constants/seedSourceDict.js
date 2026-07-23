/**
 * 种源字典（V1.1 → V2.0 占位迁移版）
 * V1.1 源文件：src/constants/seedSourceDict.ts
 *
 * 当前状态：占位实现（导出 V1.1 的枚举字典基础）
 * 完整对齐待阶段2完成
 */

// 来源途径（V1.1+V2.0 合并版，确保 V1.1 数据 sync 后全部显示中文）
// V1.1 seedData.ts:2449-2456 + seedBasicData.ts:766,876 + sourceCategoryMapper.ts
export const SOURCE_ORIGINS = [
  // V1.1 实际数据库值（sync 后种源主要用这些）
  { value: 'planting_self_kept', label: '种植自留种' },
  { value: 'inventory_transfer', label: '库存调拨' },
  { value: 'external_purchase', label: '外部采购' },
  { value: 'self_produced', label: '自产' },
  { value: 'internal_seed', label: '内部育种/留种' },
  { value: 'commissioned', label: '委托生产' },
  { value: 'gift', label: '赠送/受赠' },
  { value: 'direct_seedling', label: '直接育苗' },
  { value: 'direct_planting', label: '直接定植' },
  { value: 'external_harvest', label: '外部采收' },
  { value: 'grafting', label: '嫁接' },
  { value: 'cutting', label: '扦插' },
  { value: 'seedling_split', label: '分株' },
  { value: 'tissue_culture', label: '组培' },
  // V2.0 旧版 enum（保留以兼容）
  { value: 'internal_transfer', label: '内部调拨' },
  { value: 'donation', label: '捐赠' },
  { value: 'wild_collection', label: '野外采集' },
  { value: 'inheritance', label: '留种继承' },
  { value: 'purchased_seedling', label: '外购种苗' },
  { value: 'other', label: '其他' }
]

// 种源类型（形态）
// V1.1 seedData.ts:2438-2446 + V1.1 实际数据库值
export const SOURCE_TYPES = [
  { value: 'seed', label: '种子' },
  { value: 'seedling', label: '种苗/实生苗' },
  { value: 'cutting', label: '扦插苗' },
  { value: 'grafting', label: '嫁接苗' },
  { value: 'tissue_culture', label: '组培苗' },
  { value: 'split', label: '分株苗' },
  { value: 'bulb', label: '种球/球根' },
  // V1.1 实际数据库值（sync 后种源 source_type 用到）
  { value: 'transfer', label: '调拨种源' },
  { value: 'external_seed', label: '外购种子' },
  { value: 'seedling_split', label: '分株' },
  // 兼容
  { value: 'other', label: '其他' }
]

// 来源途径映射（用于显示）
export const SOURCE_ORIGIN_MAP = SOURCE_ORIGINS.reduce((acc, item) => {
  acc[item.value] = item
  return acc
}, {})

// 种源类型映射
export const SOURCE_TYPE_MAP = SOURCE_TYPES.reduce((acc, item) => {
  acc[item.value] = item
  return acc
}, {})

// 种源状态选项
export const seedSourceStatusOptions = [
  { value: 'sufficient', label: '充足' },
  { value: 'low', label: '不足' },
  { value: 'depleted', label: '耗尽' }
]

// 库存状态映射（V1.1 STOCK_STATUS_MAP）
export const STOCK_STATUS_MAP = {
  sufficient: { label: '充足', color: 'bg-emerald-100 text-emerald-800' },
  low: { label: '不足', color: 'bg-amber-100 text-amber-800' },
  depleted: { label: '耗尽', color: 'bg-red-100 text-red-800' }
}

// V1.1 StockStatus 枚举对齐（SeedSourcePage 引用）
export const StockStatus = {
  SUFFICIENT: 'sufficient',
  LOW: 'low',
  DEPLETED: 'depleted'
}

// 库存状态实时计算
// V1.1: computeStockStatus(availableCount, initialCount)
export const LOW_THRESHOLD_RATIO = 0.2

export function computeStockStatus(availableCount, initialCount) {
  // V1.1 风格：未入库或初始数为 0 → 视为"充足"（无库存可消耗）
  if (!initialCount || initialCount <= 0) return 'sufficient'
  const ratio = availableCount / initialCount
  if (ratio === 0) return 'depleted'
  if (ratio < LOW_THRESHOLD_RATIO) return 'low'
  return 'sufficient'
}

// 单位字典（SeedSourceTable 形态列/单位列共用）
export const UNIT_MAP = {
  seed: '粒', seedling: '株', cutting: '株', grafting: '株',
  tissue_culture: '株', split: '株', bulb: '球',
  transfer: '袋', external_seed: '袋', seedling_split: '株',
  other: ''
}

/**
 * 防御性查找：即使 key 不在字典里，也返回中文 label 而不是英文原值
 * 用法：safeLabel(SOURCE_ORIGIN_MAP, rawValue, '其他来源')
 * @param {Object} map - 字典映射表
 * @param {string} rawValue - 原始 enum 值
 * @param {string} fallback - 完全没匹配时的兜底文案
 */
export function safeLabel(map, rawValue, fallback = '-') {
  if (rawValue == null || rawValue === '') return fallback
  if (map && map[rawValue]) return map[rawValue].label
  // 未匹配的英文 enum 值：尝试友好转换
  // 例：inventory_transfer → 库存调拨
  const friendly = FRIENDLY_MAP[rawValue]
  if (friendly) return friendly
  return rawValue
}

// 兜底友好映射（处理 V1.1 数据 sync 后未登记的 enum 值）
const FRIENDLY_MAP = {
  planting_self_kept: '种植自留种',
  inventory_transfer: '库存调拨',
  external_purchase: '外部采购',
  self_produced: '自产',
  internal_seed: '内部育种/留种',
  commissioned: '委托生产',
  gift: '赠送/受赠',
  direct_seedling: '直接育苗',
  direct_planting: '直接定植',
  external_harvest: '外部采收',
  external_seed: '外购种子',
  seedling_split: '分株'
}

// 2026-07-22 1:1 迁移自 V1.1 seedSourceDict.ts L40-50
// 种源类型 → 供应商类型缩写（AddModal 专用）
export const ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE = {
  seed: 'SP',              // 种子 → 原材料供应
  seedling: 'SP',          // 种苗 → 原材料供应
  cutting: 'SP',           // 扦插苗 → 原材料供应
  grafting: 'SP',          // 嫁接苗 → 原材料供应
  tissue_culture: 'SP',    // 组培苗 → 原材料供应
  split: 'SP',             // 分株苗 → 原材料供应
  bulb: 'SP',              // 种球 → 原材料供应
  other: null              // 其他 → 显示全部供应商
}

// 2026-07-22 1:1 迁移自 V1.1 seedSourceDict.ts
// 原始来源模块映射（DetailModal 显示调拨来源）
export const ORIGINAL_SOURCE_MODULE_MAP = {
  inventory: '作物库存',
  planting: '种植管理',
  seedling: '育苗管理',
  seedSource: '内部种源',
  manual: '手动录入',
  transfer: '调拨入库',
  other: '其他'
}

// 2026-07-22 1:1 迁移自 V1.1 seedSourceDict.ts
// 调拨来源业务类型映射
export const TRANSFERRED_FROM_BUSINESS_TYPE_MAP = {
  harvest: '采收入库',
  purchase: '外部采购',
  manual: '手动录入',
  transfer: '调拨入库',
  seed_source: '内部种源',
  seedling: '种苗',
  planting: '种植',
  other: '其他'
}

// 2026-07-22 1:1 迁移自 V1.1 seedSourceDict.ts L52-70
// 种源形态 → 简化标签
export const PROPAGATION_FORM_LABELS = {
  seed: '种子',
  seedling: '种苗',
  cutting: '扦插苗',
  grafting: '嫁接苗',
  tissue_culture: '组培苗',
  split: '分株苗',
  bulb: '种球',
  flower: '花朵',
  scion: '穗条',
  branch: '枝条'
}
