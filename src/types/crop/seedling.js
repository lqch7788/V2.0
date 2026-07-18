/**
 * 育苗管理模块 - 类型定义（V1.1 types/crop/seedling.ts 1:1 迁移）
 * 用于种子育苗批次管理
 * 2026-07-18 P0-MISS-009 修复：V2.0 此前缺失此文件
 */

// ============================================
// 育苗记录（备用枚举 — 4 状态老版本；types/crop.js 主 Seedling 用 6 状态枚举）
// ============================================

/**
 * 育苗状态（4 状态老版本 — 与 V1.1 types/crop.ts L122 6 状态并存）
 */
export const SEEDLING_STATUS = Object.freeze({
  SEEDLING: 'seedling',     // 育苗中
  READY: 'ready',           // 待定植
  PLANTED: 'planted',       // 已定植
  CANCELLED: 'cancelled'    // 已取消
})

/**
 * @typedef {typeof SEEDLING_STATUS[keyof typeof SEEDLING_STATUS]} SeedlingStatus
 */

export const SEEDLING_STATUS_LABELS = Object.freeze({
  [SEEDLING_STATUS.SEEDLING]: '育苗中',
  [SEEDLING_STATUS.READY]: '待定植',
  [SEEDLING_STATUS.PLANTED]: '已定植',
  [SEEDLING_STATUS.CANCELLED]: '已取消'
})

/**
 * 育苗记录（老版接口 — 备用；主 Seedling 接口见 types/crop.js）
 * @typedef {Object} SeedlingRecord
 * @property {string} seedlingId
 * @property {string} seedlingCode
 * @property {string} [seedId]
 * @property {string} [seedCode]
 * @property {string} cropTypeId
 * @property {string} cropTypeName
 * @property {string} cropId
 * @property {string} cropName
 * @property {string} varietyId
 * @property {string} varietyName
 * @property {string} greenhouseId
 * @property {string} greenhouseName
 * @property {string} seedlingDate
 * @property {string} [expectedPlantDate]
 * @property {string} [actualPlantDate]
 * @property {number} seedlingCount
 * @property {number} survivalCount
 * @property {number} plantingCount
 * @property {number} attritionCount
 * @property {number} attritionRate
 * @property {SeedlingStatus} status
 * @property {string} [description]
 * @property {string} [picture]
 * @property {string} [qrCode]
 * @property {string} userId
 * @property {string} userName
 * @property {string} createdAt
 * @property {string} updatedAt
 */
export const SeedlingRecord = {}

/**
 * 育苗录入表单
 * @typedef {Object} SeedlingFormData
 * @property {string} [seedId]
 * @property {string} cropTypeId
 * @property {string} cropId
 * @property {string} varietyId
 * @property {string} greenhouseId
 * @property {string} seedlingDate
 * @property {string} [expectedPlantDate]
 * @property {number} seedlingCount
 * @property {number} [survivalCount]
 * @property {string} [description]
 * @property {string} [picture]
 */
export const SeedlingFormData = {}

/**
 * 育苗筛选条件
 * @typedef {Object} SeedlingFilters
 * @property {string} [greenhouseId]
 * @property {string} [seedlingCode]
 * @property {string} [seedCode]
 * @property {string} [cropId]
 * @property {string} [cropTypeId]
 * @property {string} [userId]
 * @property {SeedlingStatus} [status]
 * @property {string} [seedlingDateFrom]
 * @property {string} [seedlingDateTo]
 * @property {string} [plantDateFrom]
 * @property {string} [plantDateTo]
 */
export const SeedlingFilters = {}

// ============================================
// 统计
// ============================================

/**
 * 育苗统计
 * @typedef {Object} SeedlingStats
 * @property {number} totalBatches - 总批次
 * @property {number} seedlingCount - 育苗中数量
 * @property {number} readyCount - 待定植数量
 * @property {number} plantedCount - 已定植数量
 * @property {number} survivalRate - 成活率
 */
export const SeedlingStats = {}

// ============================================
// 标签打印
// ============================================

/**
 * 标签数据
 * @typedef {Object} LabelData
 * @property {string} seedlingCode
 * @property {string} cropName
 * @property {string} varietyName
 * @property {number} seedlingCount
 * @property {string} seedlingDate
 * @property {string} [expectedPlantDate]
 * @property {string} qrCode
 */
export const LabelData = {}

// ============================================
// 导出
// ============================================

export const seedlingExports = Object.freeze({
  SEEDLING_STATUS,
  SEEDLING_STATUS_LABELS
})
