/**
 * 2026-07-22 1:1 迁移自 V1.1 outboundConstants.ts
 * 出库业务类型（出库用途/目的）
 * 与入库业务类型语义独立。
 * DB 字段 inventory_transaction.business_type 仍为 VARCHAR，存此枚举的字符串值。
 */
export const OutboundBusinessType = {
  CUSTOMER_SALE:    'customer_sale',
  TRANSFER_OUT:     'transfer_out',
  DAMAGE_LOSS:      'damage_loss',
  GIFT_SAMPLE:      'gift_sample',
  INVENTORY_ADJUST: 'inventory_adjust',
  OTHER:            'other'
}

export const OUTBOUND_BUSINESS_TYPE_META = {
  [OutboundBusinessType.CUSTOMER_SALE]:     { label: '销售交货', color: 'bg-emerald-100 text-emerald-700' },
  [OutboundBusinessType.TRANSFER_OUT]:      { label: '调拨出库', color: 'bg-blue-100 text-blue-700' },
  [OutboundBusinessType.DAMAGE_LOSS]:       { label: '损耗报损', color: 'bg-red-100 text-red-700' },
  [OutboundBusinessType.GIFT_SAMPLE]:       { label: '赠送/试吃', color: 'bg-purple-100 text-purple-700' },
  [OutboundBusinessType.INVENTORY_ADJUST]:  { label: '盘点调整', color: 'bg-cyan-100 text-cyan-700' },
  [OutboundBusinessType.OTHER]:             { label: '其他',     color: 'bg-gray-100 text-gray-700' }
}

const LEGACY_BUSINESS_TYPE_SET = new Set([
  'harvest', 'purchase', 'manual', 'transfer',
  'seed_source', 'seedling', 'planting'
])

const OUTBOUND_TYPE_SET = new Set(Object.values(OutboundBusinessType))

export function mapLegacyBusinessType(legacy) {
  if (!legacy) return OutboundBusinessType.OTHER
  if (LEGACY_BUSINESS_TYPE_SET.has(legacy)) return OutboundBusinessType.OTHER
  if (OUTBOUND_TYPE_SET.has(legacy)) return legacy
  return OutboundBusinessType.OTHER
}

export const STOCK_TYPE_LABEL = {
  seed:     { label: '种源', color: 'bg-amber-500 text-white',    icon: '🌱' },
  seedling: { label: '种苗', color: 'bg-green-500 text-white',    icon: '🌿' },
  product:  { label: '成品', color: 'bg-emerald-500 text-white',  icon: '📦' }
}
