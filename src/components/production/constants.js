// 批次状态颜色配置
export const batchStatusColors = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  pending_complete: 'bg-orange-100 text-orange-700',
  published: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-green-600 text-white',
  cancelled: 'bg-gray-300 text-gray-600',
}

// 计划类型选项配置
export const PlanType = {
  SEED_BREEDING: 'seed_breeding',
  SEEDLING: 'seedling',
  PLANTING: 'planting',
}

export const PlanTypeLabels = {
  [PlanType.SEED_BREEDING]: '育种计划',
  [PlanType.SEEDLING]: '育苗计划',
  [PlanType.PLANTING]: '种植计划',
}

export const PlanTypeColors = {
  [PlanType.SEED_BREEDING]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [PlanType.SEEDLING]: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  [PlanType.PLANTING]: { bg: 'bg-orange-100', text: 'text-orange-700' },
}

export const PlanTypeCodePrefix = {
  [PlanType.SEED_BREEDING]: 'JZ',
  [PlanType.SEEDLING]: 'YM',
  [PlanType.PLANTING]: 'ZZ',
}

export const planTypeOptions = Object.entries(PlanTypeLabels).map(([value, label]) => ({
  value,
  label,
  color: PlanTypeColors[value],
}))

// 批次状态文本配置
export const batchStatusLabels = {
  draft: '草稿',
  pending: '待审批',
  pending_complete: '待审批（完成）',
  published: '已发布',
  in_progress: '执行中',
  completed: '已完成',
  cancelled: '已作废',
}

export const stageProgress = {
  seedling: 15,
  vegetative: 40,
  flowering: 65,
  fruiting: 85,
  harvest: 100,
}

// 负责人列表（武侠人物）
export const RESPONSIBLE_PERSONS = [
  '郭靖', '黄蓉', '张无忌', '令狐冲', '萧峰', '段誉', '虚竹', '杨过'
]

// ============================================
// 各类计划的模式配置
// ============================================

export const SEED_BREEDING_MODES = [
  { value: 'supplier_direct', label: '供应商直供' },
  { value: 'bidding', label: '招标采购' },
  { value: 'designated', label: '定点采购' },
  { value: 'internal_seed', label: '内部种源' },
  { value: 'external_purchase', label: '外部采购' },
  { value: 'tissue_culture', label: '组培苗' },
  { value: 'grafting', label: '嫁接苗' },
  { value: 'seedling_split', label: '分株繁殖' },
  { value: 'cutting', label: '扦插繁殖' },
]

export const SEEDLING_MODES = [
  { value: 'plug_seedling', label: '穴盘育苗' },
  { value: 'floating', label: '漂浮育苗' },
  { value: 'nutrient_block', label: '营养钵育苗' },
  { value: 'grafting', label: '嫁接育苗' },
  { value: 'tissue_culture', label: '组培育苗' },
  { value: 'direct_seeding', label: '直播育苗' },
]

export const PLANTING_MODES = [
  { value: 'open_field', label: '露天栽培' },
  { value: 'greenhouse', label: '大棚栽培' },
  { value: 'mulch', label: '地膜覆盖' },
  { value: 'intercropping', label: '套种轮作' },
  { value: 'vertical', label: '立体栽培' },
  { value: 'hydroponic', label: '水培' },
  { value: 'substrate', label: '基质栽培' },
]

export function getModesByPlanType(planType) {
  switch (planType) {
    case PlanType.SEED_BREEDING:
      return SEED_BREEDING_MODES
    case PlanType.SEEDLING:
      return SEEDLING_MODES
    case PlanType.PLANTING:
      return PLANTING_MODES
    default:
      return PLANTING_MODES
  }
}
