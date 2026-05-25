/**
 * 物料管理类型定义
 * 从V1.1 src/components/materials/types.ts迁移
 */

/**
 * 仓库物料
 * @typedef {Object} WarehouseMaterial
 * @property {number} id - ID
 * @property {string} code - 物料编码
 * @property {string} name - 物料名称
 * @property {string} category - 分类
 * @property {string} unit - 单位
 * @property {number} quantity - 数量
 * @property {number} minStock - 最低库存
 * @property {string} price - 单价
 * @property {string} supplier - 供应商
 * @property {string} location - 存放位置
 */

/**
 * 入库物料明细
 * @typedef {Object} InboundMaterial
 * @property {number} id - ID
 * @property {string} code - 物料编码
 * @property {string} name - 物料名称
 * @property {string} category - 分类
 * @property {string} bigCategory - 大类
 * @property {string} midCategory - 中类
 * @property {string} subCategory - 小类
 * @property {string} specification - 规格
 * @property {string} barcode - 条码
 * @property {string} unit - 单位
 * @property {number} quantity - 数量
 * @property {string} price - 单价
 * @property {string} location - 存放位置
 * @property {string} batchNo - 批次号
 * @property {string} productionDate - 生产日期
 * @property {string} expiryDate - 过期日期
 * @property {string} remarks - 备注
 */

/**
 * 入库记录
 * @typedef {Object} InboundRecord
 * @property {number} id - ID
 * @property {string} code - 入库单号
 * @property {string} inboundDate - 入库日期
 * @property {string} supplier - 供应商
 * @property {string} operator - 操作员
 * @property {string} status - 状态
 * @property {InboundMaterial[]} materials - 物料明细
 * @property {string} [voidedDate] - 作废日期
 */

/**
 * 物料分类配置
 * @typedef {Object} CategoryConfig
 */

/**
 * 物料大类
 * @typedef {Object} BigCategory
 * @property {string} code - 编码
 * @property {string} name - 名称
 */

/**
 * 物料中类
 * @typedef {Object} MidCategory
 * @property {string} code - 编码
 * @property {string} name - 名称
 */

/**
 * 物料小类
 * @typedef {Object} SubCategory
 * @property {string} code - 编码
 * @property {string} name - 名称
 * @property {string} prefix - 前缀
 */

/**
 * 物料筛选条件
 * @typedef {Object} MaterialsFilters
 * @property {string} [keyword] - 关键词搜索
 * @property {string} [category] - 分类
 * @property {string} [supplier] - 供应商
 */

// 导出空对象表示这是类型定义文件
export {}
