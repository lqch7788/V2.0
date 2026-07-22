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
  DIRECT_SEEDLING: 'direct_seedling',
  DIRECT_PLANTING: 'direct_planting',
  EXTERNAL_HARVEST: 'external_harvest'
}

/** 种子类型 */
export const SeedType = {
  SEED: 'seed',
  SEEDLING: 'seedling'
}

/** 育苗状态（对齐 V1.1 types/crop.ts L55-62，6 状态全映射）*/
export const SeedlingStatus = {
  SOWN: 'sown',                    // 已播种（建档后默认）
  IN_PROGRESS: 'in_progress',      // 苗床生长中
  TRANSPLANT_READY: 'transplant_ready',  // 待出圃
  COMPLETED: 'completed',          // 已完成（已出圃入库）
  CANCELLED: 'cancelled',          // 已取消
  ABNORMAL: 'abnormal'             // 异常结束
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

/**
 * 繁殖过程记录（V1.1 types/crop.ts PropagationRecord 1:1 迁移）
 * @typedef {Object} PropagationRecord
 * @property {string} id - 记录ID
 * @property {string} seedSourceId - 关联种源ID
 * @property {string} [seedSourceCode] - 关联种源批号
 * @property {PropagationType} propagationType - 繁殖途径
 * @property {PropagationStatus} [propagationStatus] - 繁殖阶段
 * @property {string} [propagationMethod] - 繁殖方法（自由文本）
 * @property {string} [parentMaleId] - 父本（雄）种源ID
 * @property {string} [parentMaleCode] - 父本（雄）种源批号
 * @property {string} [parentFemaleId] - 母本（雌）种源ID
 * @property {string} [parentFemaleCode] - 母本（雌）种源批号
 * @property {string} [motherPlantId] - 母株ID
 * @property {string} [motherPlantCode] - 母株批号
 * @property {string} [linkedPlantingId] - 关联种植记录ID
 * @property {string} [linkedPlantingCode] - 关联种植编号
 * @property {string} [propagationStartDate] - 繁殖开始日期（YYYY-MM-DD）
 * @property {string} [expectedHarvestDate] - 预计采收日期（YYYY-MM-DD）
 * @property {string} [actualHarvestDate] - 实际采收日期（YYYY-MM-DD）
 * @property {string} [breedingLocation] - 育种位置
 * @property {string} [targetTraits] - 目标性状
 * @property {string} [generation] - 世代（如 F1/F2）
 * @property {string} [remarks] - 备注
 * @property {string} [createBy] - 创建人
 * @property {string} [createTime] - 创建时间（ISO 8601）
 * @property {string} [updateTime] - 更新时间（ISO 8601）
 */
export const PropagationRecord = {}

/**
 * 种源记录（V1.1 types/crop.ts SeedSource 1:1 迁移 + 内部仓库模式调整）
 * - V1.1 v3.4 后：种源是纯仓库，不区分繁殖细节
 * - 状态（status）改为实时计算（基于 availableCount / initialCount）
 * @typedef {Object} SeedSource
 * @property {string} id - 唯一ID
 * @property {string} seedCode - 种源批号（格式：ZZ + YYYYMMDD + - + 流水号）
 * @property {SourceType} sourceType - 物质分类（种子/种苗/扦插苗/...）
 * @property {SourceOrigin} sourceOrigin - 来源途径
 * @property {string} [seedForm] - 入库物理形态（V1.1 seedFormDict）
 * @property {string} cropCategory - 作物类别
 * @property {string} [typeName] - 类型名称
 * @property {string} [varietyName] - 品种名称
 * @property {string} cropName - 作物名称（最细化）
 * @property {string} [cropVariety] - 子品种名称
 * @property {string} [cropCode] - 标准作物编码
 * @property {string} [supplierId] - 供应商ID
 * @property {string} [supplierName] - 供应商名称
 * @property {string} purchaseDate - 采购/入库日期（YYYY-MM-DD）
 * @property {number} quantity - 入库数量
 * @property {string} unit - 单位
 * @property {number} unitPrice - 单价（元）
 * @property {number} [totalAmount] - 总金额（元）= quantity * unitPrice
 * @property {number} initialCount - 初始数量（= quantity）
 * @property {number} availableCount - 当前可用数量（= initialCount - 已使用）
 * @property {string[]} [pictures] - 种源图片（base64 / URL）
 * @property {string} [remarks] - 备注
 * @property {string} [traceabilityCode] - 溯源码（TR + YYYYMMDD + cropName 前2字）
 * @property {number} [printCount] - 已打印次数
 * @property {string} createBy - 创建人
 * @property {string} createTime - 创建时间（ISO 8601）
 * @property {string} [updateTime] - 更新时间（ISO 8601）
 * @property {string} [productionPlanId] - 关联生产计划ID
 * @property {string} [productionPlanCode] - 关联生产计划编号
 * @property {PropagationType} [propagationType] - 繁殖途径（V1.1 字段保留）
 * @property {PropagationStatus} [propagationStatus] - 繁殖阶段（V1.1 字段保留）
 * @property {string} [endTime] - 强结时间（normal/abnormal 结束后填充）
 * @property {string} [endType] - 强结类型（normal | abnormal）
 */
export const SeedSource = {}

/**
 * 每日记录（育苗管理 - V1.1 types/crop.ts DailyRecord 1:1 迁移）
 * @typedef {Object} DailyRecord
 * @property {string} id - 记录ID
 * @property {string} seedlingId - 关联育苗批次ID
 * @property {string} recordDate - 记录日期（YYYY-MM-DD）
 * @property {number} [temperature] - 温度（℃）
 * @property {number} [humidity] - 湿度（%）
 * @property {number} [height] - 株高（cm）
 * @property {number} [leafCount] - 叶片数
 * @property {string} [growthStatus] - 生长状态描述
 * @property {string[]} [pictures] - 现场照片
 * @property {string} [remarks] - 备注
 * @property {string} [createBy] - 创建人
 * @property {string} [createTime] - 创建时间
 */
export const DailyRecord = {}

/**
 * 标签打印记录（V1.1 types/crop.ts PrintRecord 1:1 迁移）
 * @typedef {Object} PrintRecord
 * @property {string} id - 记录ID
 * @property {string} [seedSourceId] - 关联种源ID
 * @property {string} [seedlingId] - 关联育苗ID
 * @property {string} [labelCode] - 标签编号
 * @property {number} printCount - 打印份数
 * @property {PrintTemplate} [template] - 打印模板（small/large/detail）
 * @property {LabelPrintType} [printType] - 打印类型（新建/重打/批量）
 * @property {string} [printTime] - 打印时间（ISO 8601）
 * @property {string} [operator] - 操作人
 * @property {string} [remarks] - 备注
 */
export const PrintRecord = {}

/**
 * 栽种记录（V1.1 types/crop.ts TransplantRecord 1:1 迁移）
 * @typedef {Object} TransplantRecord
 * @property {string} id - 记录ID
 * @property {string} [seedlingId] - 关联育苗ID
 * @property {string} [plantingId] - 关联种植ID
 * @property {string} [labelId] - 关联标签ID
 * @property {TransplantAction} action - 栽种操作（移入/移出/定植/标记）
 * @property {number} quantity - 操作数量
 * @property {string} [fromLocation] - 源位置
 * @property {string} [toLocation] - 目标位置
 * @property {string} [operator] - 操作人
 * @property {string} [operateTime] - 操作时间
 * @property {TransplantRecordStatus} [status] - 栽种后状态
 * @property {string} [remarks] - 备注
 */
export const TransplantRecord = {}

/**
 * 栽种历史条目（V1.1 types/crop.ts TransplantHistoryItem 1:1 迁移）
 * @typedef {Object} TransplantHistoryItem
 * @property {string} id - 条目ID
 * @property {string} [date] - 日期
 * @property {string} [action] - 操作描述
 * @property {string} [operator] - 操作人
 * @property {number} [quantity] - 数量
 * @property {string} [location] - 位置
 * @property {string} [remarks] - 备注
 */
export const TransplantHistoryItem = {}

/**
 * 栽种历史（V1.1 types/crop.ts TransplantHistory 1:1 迁移）
 * @typedef {Object} TransplantHistory
 * @property {string} targetId - 关联实体ID（种源/育苗/标签）
 * @property {string} targetType - 关联实体类型
 * @property {TransplantHistoryItem[]} items - 历史条目列表
 */
export const TransplantHistory = {}

/**
 * 育苗记录（V1.1 types/crop.ts Seedling 1:1 迁移）
 * @typedef {Object} Seedling
 * @property {string} id - 育苗ID
 * @property {string} seedlingCode - 育苗批号
 * @property {string} cropCategory - 作物类别
 * @property {string} cropName - 作物名称
 * @property {string} [cropVariety] - 作物品种
 * @property {string} [seedSourceId] - 关联种源ID
 * @property {string} [seedSourceCode] - 关联种源批号
 * @property {SeedlingStatus} status - 育苗状态
 * @property {SeedlingPlanType} [planType] - 育苗计划类型
 * @property {SeedlingCalculateMode} [calculateMode] - 计算模式
 * @property {number} plannedCount - 计划数量
 * @property {number} currentCount - 当前数量
 * @property {number} [transplantedCount] - 已定植数量
 * @property {string} [unit] - 单位
 * @property {string} [startDate] - 育苗开始日期（YYYY-MM-DD）
 * @property {string} [expectedTransplantDate] - 预计定植日期
 * @property {string} [actualTransplantDate] - 实际定植日期
 * @property {string} [greenhouseName] - 温室/大棚名称
 * @property {string} [seedlingForm] - 种苗形态（穴盘苗/杯苗/裸根苗/...）
 * @property {string} [remarks] - 备注
 * @property {string} [createBy] - 创建人
 * @property {string} [createTime] - 创建时间
 * @property {string} [updateTime] - 更新时间
 */
export const Seedling = {}

/**
 * 种源筛选条件（V1.1 SeedSourceFilters 1:1 迁移）
 * 12+ 项过滤维度
 * @typedef {Object} SeedSourceFilters
 * @property {string} [cropCategory] - 作物类别
 * @property {string} [cropName] - 作物名称（模糊匹配）
 * @property {string} [cropType] - 作物类型（兼容字段）
 * @property {string} [seedCode] - 种源批号（模糊匹配）
 * @property {SourceType|string} [sourceType] - 物质分类
 * @property {SourceOrigin|string} [sourceOrigin] - 来源途径
 * @property {string} [supplierName] - 供应商名称（模糊匹配）
 * @property {StockStatus|string} [status] - 库存状态（实时计算）
 * @property {string} [startDate] - 入库起始日期
 * @property {string} [endDate] - 入库结束日期
 * @property {string} [createBy] - 创建人（模糊匹配）
 * @property {string} [recorderId] - 记录人ID（级联解析为名称）
 * @property {number} [surplusMin] - 剩余数量下限
 * @property {number} [surplusMax] - 剩余数量上限
 * @property {PropagationType} [propagationType] - 繁殖途径
 * @property {PropagationStatus} [propagationStatus] - 繁殖阶段
 */
export const SeedSourceFilters = {}

/**
 * 育苗筛选条件（V1.1 SeedlingFilters 1:1 迁移）
 * @typedef {Object} SeedlingFilters
 * @property {string} [cropCategory] - 作物类别
 * @property {string} [cropName] - 作物名称
 * @property {string} [seedSourceCode] - 关联种源批号
 * @property {SeedlingStatus} [status] - 育苗状态
 * @property {string} [startDate] - 起始日期
 * @property {string} [endDate] - 结束日期
 * @property {string} [createBy] - 创建人
 */
export const SeedlingFilters = {}

/**
 * 种植记录
 * 与后端 BackendPlanting 接口和 plantings 表字段对应
 */
export const Planting = {
  id: '',
  plantCode: '',
  sourceType: '',
  sourceId: '',
  sourceCode: '',
  cropCode: '',
  cropName: '',
  cropVariety: '',
  areaId: '',
  areaName: '',
  rootName: '',
  plantingCount: 0,
  plantingDate: '',
  soilPH: 0,
  soilEC: 0,
  transplantCount: 0,
  transplantDate: '',
  isHarvest: false,
  harvestDate: '',
  attritionRate: 0,
  printCount: 0,
  traceabilityCode: '',
  pictures: [],
  remarks: '',
  status: '',
  productionPlanId: '',
  productionPlanCode: '',
  createBy: '',
  createTime: '',
  updateTime: '',
  greenhouseName: '',
  plantedQuantity: 0,
  survivalQuantity: 0,
  survivalRate: 0,
  growthStatus: '',
  expectedHarvestDate: '',
  actualHarvestDate: '',
  harvestQuantity: 0,
  targetYield: 0,
  unit: ''
}

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
export const CropOrderFilters = {
  orderCode: '',
  orderName: '',
  cropName: '',
  status: '',
  startDate: '',
  endDate: '',
  createBy: ''
}

/**
 * 作物订单（与 V1.1 types/crop.ts CropOrder 接口完全一致）
 * @typedef {Object} CropOrder
 * @property {string} id - 订单唯一ID
 * @property {string} orderCode - 订单编号（如 DD202601001）
 * @property {string} orderName - 订单名称
 * @property {'breeding'|'seedling'|'production'|'research'|'other'} orderType - 订单类型
 * @property {string[]} [instanceIds] - 关联的作物实例ID列表
 * @property {string} [cropCategory] - 作物分类路径（如 茄果类>番茄>红颜）
 * @property {string} [cropName] - 作物名称
 * @property {string} [cropVariety] - 作物品种
 * @property {number} [plannedQuantity] - 计划数量
 * @property {number} [completedQuantity] - 完成数量
 * @property {string} [unit] - 单位（默认"株"）
 * @property {string} [supplierId] - 供应商ID
 * @property {string} [supplierName] - 供应商名称
 * @property {string} [customerId] - 客户ID
 * @property {string} [customerName] - 客户名称
 * @property {string} [customerPhone] - 客户电话
 * @property {string} [deliveryAddress] - 交付地址
 * @property {string} [orderDate] - 订单日期（YYYY-MM-DD）
 * @property {string} [expectedCompletionDate] - 预计完成日期
 * @property {string} [actualHarvestDate] - 实际采收日期
 * @property {CropOrderStatus} [status] - 订单状态（已计划/进行中/已完成/已取消）
 * @property {string} [remarks] - 备注
 * @property {string} [createBy] - 创建人
 * @property {string} [createTime] - 创建时间（ISO 8601）
 * @property {string} [updateTime] - 更新时间（ISO 8601）
 * @example
 * const order = {
 *   id: 'DD123',
 *   orderCode: 'DD202601001',
 *   orderName: '番茄订单',
 *   orderType: 'production',
 *   plannedQuantity: 1000,
 *   completedQuantity: 0,
 *   unit: '株',
 *   status: 'planned',
 *   orderDate: '2026-01-15'
 * }
 */
export const CropOrder = {
  id: '',
  orderCode: '',
  orderName: '',
  orderType: 'production',
  instanceIds: [],
  cropCategory: '',
  cropName: '',
  cropVariety: '',
  plannedQuantity: 0,
  completedQuantity: 0,
  unit: '株',
  supplierId: '',
  supplierName: '',
  customerId: '',
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  orderDate: '',
  expectedCompletionDate: '',
  actualHarvestDate: '',
  status: 'planned',
  remarks: '',
  createBy: '',
  createTime: '',
  updateTime: ''
}

/**
 * 作物实例 - 贯穿整个生命周期的核心实体
 * @typedef {Object} CropInstance
 * @property {string} id - 唯一ID
 * @property {string} instanceCode - 实例编码
 * @property {string} [orderId] - 关联的订单ID（可选）
 * @property {string} [orderCode] - 关联的订单编号（可选）
 * @property {string} cropCategory - 作物类别
 * @property {string} cropName - 作物名称
 * @property {string} cropVariety - 作物品种
 * @property {string} categoryCode - 大类代码
 * @property {string} typeCode - 类型代码
 * @property {string} subCode - 品种代码
 * @property {string} sourceOrigin - 来源类型
 * @property {string} [sourceDescription] - 来源描述
 * @property {number} initialQuantity - 初始数量
 * @property {number} currentQuantity - 当前剩余数量
 * @property {number} plantedQuantity - 已定植数量
 * @property {number} harvestedQuantity - 已采收数量
 * @property {string} status - 状态
 * @property {string} [seedEntryDate] - 种源入库日期
 * @property {string} [seedlingStartDate] - 育苗开始日期
 * @property {string} [plantingDate] - 定植日期
 * @property {string} [harvestDate] - 首次采收日期
 * @property {string} [outboundDate] - 出库日期
 * @property {string} [sourceInstanceId] - 来源实例ID
 * @property {string} createBy - 创建人
 * @property {string} createTime - 创建时间
 * @property {string} updateTime - 更新时间
 * @property {string} [unit] - 单位
 */
export const CropInstance = {}

/**
 * 作物实例状态枚举
 * @typedef {'seedling'|'planted'|'growing'|'harvested'|'outbound'|'cancelled'} CropInstanceStatus
 */
export const CropInstanceStatus = {
  SEEDLING: 'seedling',    // 育苗中
  PLANTED: 'planted',     // 已定植
  GROWING: 'growing',     // 生长期
  HARVESTED: 'harvested',   // 已采收
  OUTBOUND: 'outbound',    // 已出库
  CANCELLED: 'cancelled'  // 已取消
}

/**
 * 作物溯源链
 * @typedef {Object} CropTraceChain
 * @property {CropInstance} instance - 作物实例
 * @property {CropOrder} [order] - 关联订单
 * @property {SeedSource} [seedSource] - 兼容：保留第一条种源记录
 * @property {SeedSource[]} [seedSources] - 所有关联的种源记录
 * @property {Seedling[]} [seedlings] - 关联育苗记录
 * @property {Planting[]} [plantings] - 关联种植记录
 * @property {HarvestRecord[]} [harvests] - 关联采收记录
 */
export const CropTraceChain = {}
