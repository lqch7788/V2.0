/**
 * 统一库存管理系统 V3.0 类型定义
 * 基于架构设计：双核心驱动 + 循环闭环 + instance_id 追溯
 */

/**
 * 库存实例状态
 * @enum {string}
 */
export const InventoryStatus = {
  /** 正常库存 */
  IN_STOCK: 'in_stock',
  /** 低库存警告 */
  LOW_STOCK: 'low_stock',
  /** 冻结中 */
  FROZEN: 'frozen',
  /** 已出库 */
  OUTBOUND: 'outbound',
  /** 已用完 */
  EMPTY: 'empty',
}

/**
 * 库存类型（种源/种苗/成品）
 * @enum {string}
 */
export const StockType = {
  /** 种源 */
  SEED: 'seed',
  /** 种苗 */
  SEEDLING: 'seedling',
  /** 成品 */
  PRODUCT: 'product',
}

/**
 * 来源类型（自产/外购）
 * @enum {string}
 */
export const SourceType = {
  /** 自产 */
  SELF_PRODUCED: 'self_produced',
  /** 外购 */
  EXTERNAL_PURCHASED: 'external_purchased',
}

/**
 * 库存交易类型
 * @enum {string}
 */
export const TransactionType = {
  /** 入库 */
  INBOUND: 'inbound',
  /** 出库 */
  OUTBOUND: 'outbound',
  /** 调拨 */
  TRANSFER: 'transfer',
  /** 冻结 */
  FREEZE: 'freeze',
  /** 解冻 */
  UNFREEZE: 'unfreeze',
  /** 调整 */
  ADJUST: 'adjust',
}

/**
 * 业务类型（关联的业务模块）
 * @enum {string}
 */
export const BusinessType = {
  /** 种源管理 */
  SEED_SOURCE: 'seed_source',
  /** 育苗管理 */
  SEEDLING: 'seedling',
  /** 种植管理 */
  PLANTING: 'planting',
  /** 采收入库 */
  HARVEST: 'harvest',
  /** 采购入库 */
  PURCHASE: 'purchase',
  /** 其他 */
  OTHER: 'other',
}

/**
 * 冻结类型
 * @enum {string}
 */
export const FrozenType = {
  /** 任务冻结（农事任务占用） */
  TASK: 'task',
  /** 预留冻结（预分配） */
  RESERVED: 'reserved',
  /** 质检冻结（待质检） */
  QC: 'qc',
  /** 其他冻结 */
  OTHER: 'other',
}

/**
 * 冻结状态
 * @enum {string}
 */
export const FreezeStatus = {
  /** 已冻结 */
  FROZEN: 'frozen',
  /** 部分解冻 */
  PARTIAL_UNFROZEN: 'partial_unfrozen',
  /** 已解冻 */
  UNFROZEN: 'unfrozen',
}

/**
 * 库存中心表 - instance_id 为唯一标识
 * @typedef {Object} InventoryStock
 * @property {string} instanceId - 库存实例ID（格式：类型-日期-序号，如 INS-20260430-001）
 * @property {string} stockType - 库存类型
 * @property {string} businessId - 关联的业务ID（如种源ID、采收ID等）
 * @property {string} businessType - 业务类型
 * @property {string} cropId - 品种ID
 * @property {string} cropName - 品种名称
 * @property {string} [varietyId] - 品种细分ID
 * @property {string} [varietyName] - 品种细分名称
 * @property {number} currentQuantity - 当前库存数量
 * @property {number} frozenQuantity - 已冻结数量
 * @property {number} availableQuantity - 可用数量 = current - frozen
 * @property {string} unit - 单位
 * @property {string} sourceType - 来源类型
 * @property {string} [supplierId] - 供应商ID（外购时必填）
 * @property {string} [supplierName] - 供应商名称
 * @property {string} [baseId] - 基地ID（自产时必填）
 * @property {string} [baseName] - 基地名称
 * @property {string} [productionPlanId] - 关联的生产计划ID
 * @property {string} [productionPlanCode] - 关联的生产计划编号
 * @property {string} [sourceInstanceId] - 来源库存实例ID
 * @property {string} [sourceBusinessId] - 来源业务ID
 * @property {string} [sourceBusinessType] - 来源业务类型
 * @property {string} status - 库存状态
 * @property {string} inboundDate - 入库日期
 * @property {string} [lastOutboundDate] - 最后出库日期
 * @property {string} [expiryDate] - 过期/保质期日期
 * @property {number} version - 版本号（乐观锁）
 * @property {Object} [extensions] - 扩展字段（JSON格式存储）
 */

/**
 * 库存流水表 - 记录所有库存变动
 * @typedef {Object} InventoryTransaction
 * @property {string} id - 交易记录ID
 * @property {string} instanceId - 关联的库存实例ID
 * @property {string} stockType - 库存类型
 * @property {string} transactionType - 交易类型
 * @property {number} quantity - 数量变化（正数表示增加，负数表示减少）
 * @property {number} balanceBefore - 交易前余额
 * @property {number} balanceAfter - 交易后余额
 * @property {string} [businessId] - 关联的业务ID
 * @property {string} businessType - 业务类型
 * @property {string} [businessCode] - 业务单号
 * @property {string} operatorId - 操作人ID
 * @property {string} operatorName - 操作人姓名
 * @property {string} operateDate - 操作日期
 * @property {string} [remarks] - 备注
 * @property {Object} [extensions] - 扩展字段
 */

/**
 * 库存冻结表 - 记录冻结详情
 * @typedef {Object} InventoryFreeze
 * @property {string} id - 冻结记录ID
 * @property {string} instanceId - 关联的库存实例ID
 * @property {string} frozenType - 冻结类型
 * @property {number} frozenQuantity - 冻结数量
 * @property {string} [businessId] - 关联的业务ID（如任务ID）
 * @property {string} [businessType] - 业务类型
 * @property {string} status - 冻结状态
 * @property {string} frozenDate - 冻结时间
 * @property {string} [unfrozenDate] - 解冻时间
 * @property {string} operatorId - 操作人ID
 * @property {string} operatorName - 操作人姓名
 * @property {string} [remarks] - 备注
 */

/**
 * 库存操作返回结果
 * @typedef {Object} InventoryOperationResult
 * @property {boolean} success - 是否成功
 * @property {string} [instanceId] - 库存实例ID
 * @property {number} [newQuantity] - 新数量
 * @property {string} [error] - 错误信息
 */

/**
 * 可用数量计算结果
 * @typedef {Object} AvailableQuantityResult
 * @property {string} instanceId - 库存实例ID
 * @property {number} currentQuantity - 当前数量
 * @property {number} frozenQuantity - 冻结数量
 * @property {number} availableQuantity - 可用数量
 */

/**
 * 业务关联信息
 * @typedef {Object} BusinessInfo
 * @property {string} businessId - 业务ID
 * @property {string} businessType - 业务类型
 * @property {string} businessCode - 业务编号
 */

/**
 * 溯源结果
 * @typedef {Object} TraceResult
 * @property {string} instanceId - 库存实例ID
 * @property {string} stockType - 库存类型
 * @property {string} businessType - 业务类型
 * @property {string} businessId - 业务ID
 * @property {string} cropName - 品种名称
 * @property {string} [varietyName] - 品种细分名称
 * @property {number} quantity - 数量
 * @property {string} inboundDate - 入库日期
 * @property {string} [sourceInstanceId] - 来源库存实例ID
 */

/**
 * 下游追溯结果
 * @typedef {Object} DownstreamTraceResult
 * @property {string} instanceId - 库存实例ID
 * @property {string} stockType - 库存类型
 * @property {string} businessType - 业务类型
 * @property {string} businessId - 业务ID
 * @property {number} outboundQuantity - 出库数量
 * @property {string} outboundDate - 出库日期
 * @property {string} [targetInstanceId] - 目标库存实例ID
 */

/**
 * 库存统计结果
 * @typedef {Object} InventoryStats
 * @property {number} totalInstances - 总实例数
 * @property {number} totalQuantity - 总数量
 * @property {Object} byStockType - 按库存类型统计
 * @property {number} lowStockCount - 低库存数量
 * @property {number} expiringCount - 临期数量
 */

/**
 * 入库请求
 * @typedef {Object} InboundRequest
 * @property {string} stockType - 库存类型
 * @property {string} businessId - 业务ID
 * @property {string} businessType - 业务类型
 * @property {string} cropId - 品种ID
 * @property {string} cropName - 品种名称
 * @property {string} [varietyId] - 品种细分ID
 * @property {string} [varietyName] - 品种细分名称
 * @property {number} quantity - 数量
 * @property {string} unit - 单位
 * @property {string} sourceType - 来源类型
 * @property {string} [supplierId] - 供应商ID
 * @property {string} [supplierName] - 供应商名称
 * @property {string} [baseId] - 基地ID
 * @property {string} [baseName] - 基地名称
 * @property {string} [productionPlanId] - 生产计划ID
 * @property {string} [productionPlanCode] - 生产计划编号
 * @property {string} [sourceInstanceId] - 来源库存实例ID
 * @property {string} [sourceBusinessId] - 来源业务ID
 * @property {string} [sourceBusinessType] - 来源业务类型
 * @property {string} [remarks] - 备注
 * @property {Object} [extensions] - 扩展字段
 */

/**
 * 出库请求
 * @typedef {Object} OutboundRequest
 * @property {string} instanceId - 库存实例ID
 * @property {string} businessId - 业务ID
 * @property {string} businessType - 业务类型
 * @property {string} [businessCode] - 业务单号
 * @property {number} quantity - 数量
 * @property {string} operatorId - 操作人ID
 * @property {string} operatorName - 操作人姓名
 * @property {string} [remarks] - 备注
 */

/**
 * 冻结请求
 * @typedef {Object} FreezeRequest
 * @property {string} instanceId - 库存实例ID
 * @property {string} frozenType - 冻结类型
 * @property {number} frozenQuantity - 冻结数量
 * @property {string} [businessId] - 业务ID
 * @property {string} [businessType] - 业务类型
 * @property {string} operatorId - 操作人ID
 * @property {string} operatorName - 操作人姓名
 * @property {string} [remarks] - 备注
 */

/**
 * 预警信息
 * @typedef {Object} AlertInfo
 * @property {'storage_time'|'low_stock'|'high_stock'|'expiration'} type - 预警类型
 * @property {'info'|'warning'|'critical'} level - 预警级别
 * @property {string} instanceId - 库存实例ID
 * @property {string} message - 预警消息
 * @property {number} threshold - 阈值
 * @property {number} currentValue - 当前值
 */

/**
 * 预警设置
 * @typedef {Object} AlertSettings
 * @property {boolean} enableStorageTimeAlert - 启用库存时间预警
 * @property {number} storageTimeThreshold - 库存时间阈值
 * @property {boolean} enableQuantityAlert - 启用数量预警
 * @property {number} minQuantityThreshold - 最小数量阈值
 * @property {number} maxQuantityThreshold - 最大数量阈值
 * @property {number} minStock - 最低库存
 * @property {number} maxStock - 最高库存
 * @property {number} expirationDays - 过期天数
 */

/**
 * 采收产品库存（兼容V2.0）
 * @typedef {Object} ProduceInventory
 * @property {string} id - ID
 * @property {string} harvestRecordId - 采收记录ID
 * @property {string} productCode - 产品编号
 * @property {string} cropName - 品种名称
 * @property {string} variety - 品种
 * @property {string} [stockType] - 库存类型：种子/种苗/成品
 * @property {number} quantity - 数量
 * @property {string} unit - 单位
 * @property {'A'|'B'|'C'} grade - 等级
 * @property {'excellent'|'good'|'average'|'poor'} quality - 质量
 * @property {string} warehouseId - 仓库ID
 * @property {string} warehouseName - 仓库名称
 * @property {string} storageLocation - 存放位置
 * @property {string} harvestDate - 采收日期
 * @property {string} storageDate - 入库日期
 * @property {string} expirationDate - 过期日期
 * @property {AlertSettings} alertSettings - 预警设置
 * @property {string} batchCode - 批次编号
 * @property {string} greenhouseName - 大棚名称
 * @property {string} plantingMode - 种植模式
 * @property {string} status - 状态
 * @property {InventoryTransaction[]} inboundRecords - 入库记录
 * @property {InventoryTransaction[]} outboundRecords - 出库记录
 */

/**
 * 作物库存聚合查询结果
 * @typedef {Object} CropInventoryAggregation
 * @property {string} cropName - 品种名称
 * @property {ProduceInventory[]} seed - 种子库存
 * @property {ProduceInventory[]} seedling - 种苗库存
 * @property {ProduceInventory[]} product - 成品库存
 * @property {number} total - 总数
 * @property {Object} totalQuantity - 各类型总数量
 */

/**
 * 预警统计
 * @typedef {Object} AlertStats
 * @property {number} totalAlerts - 预警总数
 * @property {number} storageTimeAlerts - 库存时间预警数
 * @property {number} lowStockAlerts - 低库存预警数
 * @property {number} highStockAlerts - 高库存预警数
 * @property {number} expirationAlerts - 过期预警数
 */
