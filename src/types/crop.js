// 作物
export const Crop = {}

// 种植记录
export const PlantingRecord = {}

// 采收记录
export const HarvestRecord = {}

// ========== 枚举定义 ==========

/** 种源类型 - 基于繁殖方式分类 */
export const SourceType = {
  SEED: 'seed',                    // 种子
  SEEDLING: 'seedling',            // 种苗/实生苗
  CUTTING: 'cutting',              // 扦插苗
  GRAFTING: 'grafting',            // 嫁接苗
  TISSUE_CULTURE: 'tissue_culture', // 组培苗
  SPLIT: 'split',                  // 分株苗
  BULB: 'bulb',                    // 种球/球根
  OTHER: 'other'                   // 其他
}

/** 种源来源途径 - 基于获取渠道分类 */
export const SourceOrigin = {
  INTERNAL_SEED: 'internal_seed',
  EXTERNAL_PURCHASE: 'external_purchase',
  TISSUE_CULTURE: 'tissue_culture',
  GRAFTING: 'grafting',
  SEEDLING_SPLIT: 'seedling_split',
  CUTTING: 'cutting',
  DIRECT_SEEDLING: 'direct_seeding',
  DIRECT_PLANTING: 'direct_planting',
  EXTERNAL_HARVEST: 'external_harvest'
}

/** 种子类型 */
export const SeedType = {
  SEED: 'seed',
  SEEDLING: 'seedling'
}

/** 育苗状态 */
export const SeedlingStatus = {
  IN_PROGRESS: 'in_progress',      // 进行中
  TRANSPLANT_READY: 'transplant_ready',  // 待定植
  COMPLETED: 'completed',          // 已完成
  ABNORMAL: 'abnormal'             // 异常
}

/** 育苗计划类型 */
export const SeedlingPlanType = {
  ROUTINE: 'routine',            // 常规
  URGENT: 'urgent',              // 加急
  EXPERIMENT: 'experiment'       // 实验
}

/** 育苗计算模式 */
export const SeedlingCalculateMode = {
  SINGLE: 'single',              // 单株育苗
  PROPAGATION: 'propagation'     // 扩繁育苗
}

/** 种植状态 */
export const PlantingStatus = {
  PLANTED: 'planted',      // 已定植
  GROWING: 'growing',      // 生长期
  HARVESTED: 'harvested',  // 已采收
  CANCELLED: 'cancelled'   // 已取消
}

/** 打印模板类型 */
export const PrintTemplate = {
  SMALL: 'small',  // 小标签
  LARGE: 'large'    // 大标签
}

/** 标签打印类型 */
export const LabelPrintType = {
  NEW: 'new',           // 新建标签
  REPRINT: 'reprint',   // 重打印
  BATCH: 'batch'        // 批量打印
}

/** 定植记录状态 */
export const TransplantRecordStatus = {
  IN_STOCK: 'in_stock',       // 库存中
  TRANSPLANTING: 'transplanting', // 定植中
  GROWING: 'growing',         // 生长期
  HARVESTED: 'harvested'      // 已采收
}

/** 栽种操作类型 */
export const TransplantAction = {
  MOVE_IN: 'move_in',         // 移入
  MOVE_OUT: 'move_out',       // 移出
  TRANSPLANT: 'transplant',   // 定植
  MARK: 'mark'                // 标记
}

/** 种源库存状态 */
export const StockStatus = {
  SUFFICIENT: 'sufficient',  // 充足
  LOW: 'low',                // 不足
  DEPLETED: 'depleted'       // 耗尽
}

// ========== 繁殖途径类型 ==========

/** 繁殖途径类型 */
export const PropagationType = {
  EXTERNAL: 'external',       // 外购
  BREEDING: 'breeding',       // 育种计划产出
  SEED_SAVING: 'seed_saving', // 种植留种
  ASEXUAL: 'asexual',         // 无性繁殖
}

/** 统一繁殖阶段 */
export const PropagationStatus = {
  PLANNED: 'planned',             // 已计划
  IN_PROGRESS: 'in_progress',     // 进行中
  HARVESTED: 'harvested',         // 已采收
  QUALITY_CHECKED: 'quality_checked', // 已质检
  COMPLETED: 'completed',         // 已入库
  FAILED: 'failed',               // 失败
}

/** 育种方法 */
export const BreedingMethod = {
  CROSSBREEDING: 'crossbreeding',    // 杂交育种
  SELECTION: 'selection',             // 选择育种
  BACKCROSS: 'backcross',            // 回交育种
  HYBRID: 'hybrid',                   // 杂种优势
  OPEN_POLLINATION: 'open_pollination', // 开放授粉
  MUTATION: 'mutation',               // 诱变育种
  OTHER: 'other',                     // 其他
}

/** 无性繁殖方式 */
export const AsexualMethod = {
  CUTTING: 'cutting',                  // 扦插
  GRAFTING: 'grafting',               // 嫁接
  DIVISION: 'division',               // 分株
  TISSUE_CULTURE: 'tissue_culture',   // 组培
  BULB: 'bulb',                       // 种球/球根
  LAYERING: 'layering',               // 压条
}

/** 繁殖过程记录 */
export const PropagationRecord = {}

/** 种源记录 */
export const SeedSource = {}

/** 每日记录（育苗管理） */
export const DailyRecord = {}

/** 标签打印记录 */
export const PrintRecord = {}

/** 栽种记录 */
export const TransplantRecord = {}

/** 栽种历史条目 */
export const TransplantHistoryItem = {}

/** 栽种历史 */
export const TransplantHistory = {}

/** 育苗记录 */
export const Seedling = {}

/** 种源筛选条件 */
export const SeedSourceFilters = {}

/** 育苗筛选条件 */
export const SeedlingFilters = {}

/** 种植记录 */
export const Planting = {}

/** 种植筛选条件 */
export const PlantingFilters = {}

/** 订单状态枚举 */
export const CropOrderStatus = {
  PLANNED: 'planned',           // 已计划
  IN_PROGRESS: 'in_progress',   // 进行中
  COMPLETED: 'completed',       // 已完成
  CANCELLED: 'cancelled'        // 已取消
}

/** 订单筛选条件 */
export const CropOrderFilters = {}

/** 作物订单 */
export const CropOrder = {}

/** 作物实例 */
export const CropInstance = {}

/** 作物实例状态 */
export const CropInstanceStatus = {}

/** 作物溯源链 */
export const CropTraceChain = {}
