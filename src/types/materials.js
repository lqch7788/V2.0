/**
 * 物料管理类型定义（物料管理模块）
 */

/**
 * 仓库物料
 * @typedef {Object} WarehouseMaterial
 * @property {number} id - ID
 * @property {string} code - 物料编码
 * @property {string} name - 物料名称
 * @property {string} category - 物料分类
 * @property {string} unit - 单位
 * @property {number} quantity - 当前库存数量
 * @property {number} minStock - 最低库存阈值
 * @property {string} price - 单价
 * @property {string} supplier - 供应商
 * @property {string} location - 存放位置
 */

/**
 * 物料入库记录
 * @typedef {Object} InboundRecord
 * @property {number} id - ID
 * @property {string} code - 入库单号
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} quantity - 数量
 * @property {string} unit - 单位
 * @property {string} supplier - 供应商
 * @property {string} inboundDate - 入库日期
 * @property {string} operator - 操作员
 * @property {'completed'|'pending'} status - 状态
 */

/**
 * 新增入库表单
 * @typedef {Object} NewInboundForm
 * @property {string} orderCode - 订单编号
 * @property {string} bigCategory - 大类
 * @property {string} midCategory - 中类
 * @property {string} subCategory - 小类
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} quantity - 数量
 * @property {string} unit - 单位
 * @property {string} supplier - 供应商
 * @property {string} inboundDate - 入库日期
 * @property {string} operator - 操作员
 * @property {string} remarks - 备注
 */

/**
 * 编码生成器表单
 * @typedef {Object} CodeGeneratorForm
 * @property {string} bigCategory - 大类
 * @property {string} midCategory - 中类
 * @property {string} subCategory - 小类
 * @property {string} generatedCode - 生成的编码
 */

/**
 * 物料分类配置
 * @typedef {Object} CategoryConfig
 * @property {string} name - 分类名称
 * @property {Object} categories - 中类配置
 */

/**
 * 物料大类
 * @typedef {Object} BigCategory
 * @property {string} code - 编码
 * @property {string} name - 名称
 */
