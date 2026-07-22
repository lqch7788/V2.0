/**
 * 作物管理模块共享常量
 * 所有状态映射、标签、颜色配置均从此文件导出
 * 各组件禁止在内部硬编码这些映射
 */

// ========== 种源状态映射 ==========
export const SEED_SOURCE_STATUS_MAP = {
  active: { label: '活跃', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: '已用完', color: 'bg-gray-100 text-gray-500' },
  draft: { label: '草稿', color: 'bg-amber-100 text-amber-700' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-700' },
}

// ========== 种源类型映射 ==========
export const SOURCE_TYPE_MAP = {
  seed: '种子',
  seedling: '种苗/实生苗',
  tissue_culture: '组培苗',
  grafting: '嫁接苗',
  cutting: '扦插苗',
  division: '分株苗',
  spore: '孢子/菌种',
  other: '其他',
}

// ========== 种源来源途径映射（与V1.1保持一致） ==========
export const SOURCE_ORIGIN_MAP = {
  internal_seed: '内部种源',
  external_purchase: '外部采购',
  tissue_culture: '组培苗',
  grafting: '嫁接苗',
  seedling_split: '分株繁殖',
  cutting: '扦插繁殖',
  direct_seedling: '直接育苗',
  direct_planting: '直接种植',
  external_harvest: '外购入库',
}

// ========== 2026-07-18 P0-DETAIL-002：种源详情「来源业务类型」字典 ==========
// 应用场景：SeedSourceDetailModal 调拨来源 Tab 的"来源业务类型"字段
// V1.1 源：src/constants/cropConstants.ts L70-77
// 数据源：inventoryTransfer.service.ts / inventoryInboundFromSource.service.ts 写入 transferred_from_business_type 字段
export const TRANSFERRED_FROM_BUSINESS_TYPE_MAP = {
  harvest: '采收',
  purchase: '外购入库',
  transfer: '库存调拨',
  inbound: '入库',
  external: '外部',
  manual: '手动'
}

// ========== 2026-07-18 P0-DETAIL-003：种源详情「原始来源模块」字典 ==========
// 应用场景：SeedSourceDetailModal 调拨来源 Tab 的"原始来源模块"字段
// V1.1 源：src/constants/cropConstants.ts L82-90
// 数据源：inventoryTransfer.service.ts 写入 original_source_module 字段
export const ORIGINAL_SOURCE_MODULE_MAP = {
  seed_source: '种源',
  seedling: '种苗',
  planting: '种植',
  harvest: '采收',
  inventory: '库存',
  manual: '手动',
  inbound: '入库'
}

// ========== 单位映射（英文→中文） ==========
export const UNIT_MAP = {
  g: '克',
  kg: '公斤',
  t: '吨',
  plant: '株',
  seed: '粒',
  bag: '袋',
  box: '箱',
  bundle: '捆',
  bottle: '瓶',
  tray: '盘',
  pot: '盆',
  group: '组',
  batch: '批',
  piece: '个',
  meter: '米',
  square_meter: '平方米',
}

// ========== 育苗状态映射 ==========
export const SEEDLING_STATUS_MAP = {
  in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  transplant_ready: { label: '待定植', color: 'bg-amber-100 text-amber-700' },
  completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
  abnormal: { label: '异常', color: 'bg-red-100 text-red-700' },
}

// ========== 定植记录状态映射 ==========
export const TRANSPLANT_STATUS_MAP = {
  in_stock: '库存中',
  transplanting: '定植中',
  growing: '生长期',
  harvested: '已采收',
}

// ========== 种植状态映射 ==========
export const PLANTING_STATUS_MAP = {
  planted: { label: '已定植', color: 'bg-blue-100 text-blue-700' },
  growing: { label: '生长期', color: 'bg-emerald-100 text-emerald-700' },
  harvesting: { label: '采收期', color: 'bg-amber-100 text-amber-700' },
  harvested: { label: '已采收', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
}

// ========== 作物实例状态映射（与V1.1 InstancePage.tsx保持一致） ==========
export const CROP_INSTANCE_STATUS_MAP = {
  seedling: { label: '育苗中', bg: 'bg-blue-100', text: 'text-blue-700' },
  planted: { label: '已定植', bg: 'bg-amber-100', text: 'text-amber-700' },
  growing: { label: '生长期', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  harvested: { label: '已采收', bg: 'bg-purple-100', text: 'text-purple-700' },
  outbound: { label: '已出库', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  cancelled: { label: '已取消', bg: 'bg-red-100', text: 'text-red-700' },
}

// ========== 入库类型映射 ==========
export const INBOUND_TYPE_MAP = {
  seed_source: { label: '种源入库', bg: 'bg-blue-100', text: 'text-blue-700' },
  seedling: { label: '育苗成活', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  planting_harvest: { label: '种植采收', bg: 'bg-orange-100', text: 'text-orange-700' },
}

// ========== 补录状态映射 ==========
export const SUPPLEMENTARY_STATUS_MAP = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
}

// ========== 品质等级映射 ==========
export const QUALITY_GRADE_MAP = {
  A: { label: 'A级', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  B: { label: 'B级', bg: 'bg-blue-100', text: 'text-blue-700' },
  C: { label: 'C级', bg: 'bg-amber-100', text: 'text-amber-700' },
  D: { label: '次品', bg: 'bg-red-100', text: 'text-red-700' },
}

// ========== 库存状态映射（ProduceInventory） ==========
export const INVENTORY_STATUS_MAP = {
  in_stock: { label: '正常', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  low_stock: { label: '库存不足', bg: 'bg-blue-100', text: 'text-blue-700' },
  expired: { label: '已过期', bg: 'bg-red-100', text: 'text-red-700' },
  out_of_stock: { label: '缺货', bg: 'bg-gray-100', text: 'text-gray-700' },
}

// ========== 采收状态映射（与V1.1 HarvestTable.tsx statusBadgeUtils.tsx保持一致） ==========
export const HARVEST_STATUS_MAP = {
  pending: { label: '待采收', color: 'bg-amber-100 text-amber-700' },
  harvesting: { label: '采收中', color: 'bg-blue-100 text-blue-700' },  // V1.1有采收中状态
  harvested: { label: '已采收', color: 'bg-emerald-100 text-emerald-700' },
  graded: { label: '已分级', color: 'bg-purple-100 text-purple-700' },
  stored: { label: '已入库', color: 'bg-cyan-100 text-cyan-700' },
  completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },  // V1.1有已完成状态
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
}

// ========== V1.1 采收状态颜色映射（内联hex颜色，用于getStatusBadge） ==========
export const HARVEST_STATUS_COLORS = {
  pending: '#FAAD14',       // 待采收 - 黄色
  harvesting: '#1677FF',   // 采收中 - 蓝色
  harvested: '#52C41A',    // 已采收 - 绿色
  completed: '#52C41A',    // 已完成 - 绿色
  graded: '#722ED1',       // 已分级 - 紫色
  stored: '#13C2C2',       // 已入库 - 青色
  cancelled: '#D9D9D9',   // 已取消 - 灰色
}

// ========== V1.1 品质等级颜色映射（内联hex颜色） ==========
export const QUALITY_GRADE_COLORS = {
  A: '#52C41A',  // 绿色
  B: '#FAAD14',  // 黄色
  C: '#FF4D4F',  // 红色
}

// ========== 库存预警默认值 ==========
export const DEFAULT_ALERT_SETTINGS = {
  enableStorageTimeAlert: false,
  storageTimeThreshold: 0,
  enableQuantityAlert: false,
  minQuantityThreshold: 0,
  maxQuantityThreshold: 0,
  minStock: 0,
  maxStock: 0,
  expirationDays: 0,
}

// ========== 分页选项 ==========
export const PAGE_SIZE_OPTIONS = [10, 20, 50]

// ========== 等级选项 ==========
export const GRADE_OPTIONS = [
  { value: 'A', label: 'A级' },
  { value: 'B', label: 'B级' },
  { value: 'C', label: 'C级' },
]

// ========== 库存状态选项 ==========
export const INVENTORY_STATUS_OPTIONS = [
  { value: 'in_stock', label: '正常' },
  { value: 'low_stock', label: '库存不足' },
  { value: 'expired', label: '已过期' },
  { value: 'out_of_stock', label: '缺货' },
]

// ========== 种源库存状态映射（StockStatus） ==========
export const STOCK_STATUS_MAP = {
  sufficient: { label: '充足', color: 'text-green-600 bg-green-50' },
  low: { label: '不足', color: 'text-amber-600 bg-amber-50' },
  depleted: { label: '耗尽', color: 'text-red-600 bg-red-50' },
  out_of_stock: { label: '缺货', color: 'text-gray-600 bg-gray-50' },
}

// ========== 默认作物编码（兜底值） ==========
export const DEFAULT_CROP_CODE = 'OT0000000000'

// ========== 2026-07-22 1:1 迁移自 V1.1 cropConstants.ts：每日记录字段映射 ==========

// 浇水方式映射（16 种主流浇水方式，覆盖人工/滴灌/喷灌/漫灌/其他 5 类）
export const WATERING_METHOD_MAP = {
  // 人工类
  manual_watering: '人工浇水',
  water_pot: '浇水壶',
  manual_dip: '人工浸盆',
  // 滴灌类
  drip_irrigation: '滴灌',
  drip_tube: '滴管',
  drip_emitter: '滴箭',
  drip_tape: '滴灌带',
  // 喷灌类
  sprinkler: '喷灌',
  spray: '喷淋',
  mist: '喷雾',
  micro_sprinkler: '微喷',
  atomization: '雾化',
  // 漫灌/沟灌类
  flood: '漫灌',
  furrow: '沟灌',
  basin: '淹灌',
  // 其他
  seepage: '渗灌',
  root_dip: '蘸根'
}

// 浇水量单位映射（7 种单位覆盖小量到大宗）
export const WATERING_UNIT_MAP = {
  ml: '毫升',
  L: '升',
  kg: '公斤',
  pot: '瓢',
  barrel: '桶',
  ton: '吨',
  m3: '立方米'
}

// 施肥类型映射
export const FERTILIZER_CATEGORY_MAP = {
  foliar: '叶面肥',
  base: '基肥',
  top: '追肥',
  dressing: '冲施肥',
  organic: '有机肥',
  compound: '复合肥',
  other: '其他'
}

// 药剂类型映射
export const PESTICIDE_CATEGORY_MAP = {
  fungicide: '杀菌剂',
  insecticide: '杀虫剂',
  herbicide: '除草剂',
  acaricide: '杀螨剂',
  bio: '生物制剂',
  other: '其他'
}

// 施用方式映射（施肥/用药共用）
export const APPLICATION_METHOD_MAP = {
  spray: '喷雾',
  pour: '浇灌',
  dip: '蘸根',
  spread: '撒施',
  dust: '喷粉',
  other: '其他'
}

// 稀释方式映射
export const DILUTION_TYPE_MAP = {
  dilute: '稀释',
  dry: '干施'
}

// 用量单位映射（施肥/用药共用，4 种标准重量/体积单位）
export const FEED_UNIT_MAP = {
  kg: '千克(kg)',
  g: '克(g)',
  L: '升(L)',
  ml: '毫升(ml)'
}
