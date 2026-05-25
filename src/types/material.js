/**
 * 物料与设备类型定义
 * 用于农事管理系统的物料和设备相关类型
 */

/**
 * 物料类型
 * @typedef {'seed'|'fertilizer'|'pesticide'|'tool'|'other'} MaterialType
 */

/**
 * 物料单位
 * @typedef {'kg'|'g'|'L'|'mL'|'piece'|'bag'|'bottle'} MaterialUnit
 */

/**
 * 物料状态
 * @typedef {'available'|'low_stock'|'out_of_stock'|'expired'} MaterialStatus
 */

/**
 * 物料记录
 * @typedef {Object} Material
 * @property {string} id - ID
 * @property {string} code - 物料编码
 * @property {string} name - 物料名称
 * @property {MaterialType} type - 物料类型
 * @property {MaterialUnit} unit - 单位
 * @property {number} quantity - 当前库存数量
 * @property {number} minStock - 最低库存阈值
 * @property {number} maxStock - 最高库存阈值
 * @property {string} location - 存放位置
 * @property {string} [supplier] - 供应商
 * @property {string} [purchaseDate] - 采购日期
 * @property {string} [expiryDate] - 过期日期
 * @property {MaterialStatus} status - 状态
 * @property {string} [remark] - 备注
 */

/**
 * 物料使用记录
 * @typedef {Object} MaterialUsageRecord
 * @property {string} id - ID
 * @property {string} materialId - 物料ID
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {number} quantity - 数量
 * @property {MaterialUnit} unit - 单位
 * @property {string} usageDate - 使用日期
 * @property {'dispatch'|'manual'|'maintenance'} usageType - 使用类型
 * @property {string} [taskId] - 任务ID
 * @property {string} workerId - 工人ID
 * @property {string} workerName - 工人姓名
 * @property {string} [greenhouseId] - 大棚ID
 * @property {string} [remark] - 备注
 */

/**
 * 设备类型
 * @typedef {'irrigation'|'sprayer'|'pruner'|'sensor'|'vehicle'|'other'} EquipmentType
 */

/**
 * 设备状态
 * @typedef {'normal'|'maintenance'|'broken'|'idle'} EquipmentStatus
 */

/**
 * 设备
 * @typedef {Object} Equipment
 * @property {string} id - ID
 * @property {string} code - 设备编码
 * @property {string} name - 设备名称
 * @property {EquipmentType} type - 设备类型
 * @property {string} [model] - 型号
 * @property {string} location - 当前位置/区域
 * @property {EquipmentStatus} status - 状态
 * @property {string} [lastMaintenanceDate] - 上次保养日期
 * @property {string} [nextMaintenanceDate] - 下次保养日期
 * @property {number} totalUsageHours - 累计使用时长
 * @property {string} [remark] - 备注
 */

/**
 * 设备使用记录
 * @typedef {Object} EquipmentUsageRecord
 * @property {string} id - ID
 * @property {string} equipmentId - 设备ID
 * @property {string} equipmentCode - 设备编码
 * @property {string} equipmentName - 设备名称
 * @property {string} usageDate - 使用日期
 * @property {'dispatch'|'manual'} usageType - 使用类型
 * @property {string} [taskId] - 任务ID
 * @property {string} workerId - 工人ID
 * @property {string} workerName - 工人姓名
 * @property {number} duration - 使用时长（小时）
 * @property {string} [greenhouseId] - 大棚ID
 * @property {string} [remark] - 备注
 */

/**
 * 设备告警
 * @typedef {Object} EquipmentAlert
 * @property {string} id - ID
 * @property {string} equipmentId - 设备ID
 * @property {string} equipmentCode - 设备编码
 * @property {string} equipmentName - 设备名称
 * @property {'maintenance_due'|'breakdown'|'low_battery'} alertType - 告警类型
 * @property {'info'|'warning'|'critical'} alertLevel - 告警级别
 * @property {string} message - 告警消息
 * @property {string} createdAt - 创建时间
 * @property {boolean} acknowledged - 是否已确认
 * @property {string} [acknowledgedBy] - 确认人
 * @property {string} [acknowledgedAt] - 确认时间
 */

/**
 * 物料统计
 * @typedef {Object} MaterialStats
 * @property {number} total - 总数
 * @property {number} available - 可用数量
 * @property {number} lowStock - 低库存数量
 * @property {number} outOfStock - 缺货数量
 * @property {number} expired - 过期数量
 */

/**
 * 设备统计
 * @typedef {Object} EquipmentStats
 * @property {number} total - 总数
 * @property {number} normal - 正常数量
 * @property {number} maintenance - 维护中数量
 * @property {number} broken - 故障数量
 * @property {number} idle - 闲置数量
 */

/**
 * 物料设备概览
 * @typedef {Object} MaterialEquipmentOverview
 * @property {MaterialStats} materialStats - 物料统计
 * @property {EquipmentStats} equipmentStats - 设备统计
 * @property {Object} todayUsage - 今日使用
 * @property {MaterialUsageRecord[]} todayUsage.materials - 物料使用记录
 * @property {EquipmentUsageRecord[]} todayUsage.equipment - 设备使用记录
 * @property {EquipmentAlert[]} equipmentAlerts - 设备告警
 */
