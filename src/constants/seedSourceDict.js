/**
 * 种源字典（V1.1 → V2.0 占位迁移版）
 * V1.1 源文件：src/constants/seedSourceDict.ts
 *
 * 当前状态：占位实现（导出 V1.1 的枚举字典基础）
 * 完整对齐待阶段2完成
 */

// 来源途径（9 枚举）
export const SOURCE_ORIGINS = [
  { value: 'external_purchase', label: '外部采购' },
  { value: 'self_produced', label: '自产' },
  { value: 'internal_transfer', label: '内部调拨' },
  { value: 'donation', label: '捐赠' },
  { value: 'wild_collection', label: '野外采集' },
  { value: 'inheritance', label: '留种继承' },
  { value: 'purchased_seedling', label: '外购种苗' },
  { value: 'external_harvest', label: '外购成品' },
  { value: 'other', label: '其他' }
]

// 种源类型（形态）
export const SOURCE_TYPES = [
  { value: 'seed', label: '种子' },
  { value: 'seedling', label: '种苗/实生苗' },
  { value: 'cutting', label: '扦插苗' },
  { value: 'grafting', label: '嫁接苗' },
  { value: 'tissue_culture', label: '组培苗' },
  { value: 'split', label: '分株苗' },
  { value: 'bulb', label: '种球/球根' },
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
  if (initialCount === 0 || initialCount == null) return 'depleted'
  const ratio = availableCount / initialCount
  if (ratio === 0) return 'depleted'
  if (ratio < LOW_THRESHOLD_RATIO) return 'low'
  return 'sufficient'
}
