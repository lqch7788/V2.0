/**
 * 领料统计 API 服务
 * 对接后端 GET /api/material-statistics/
 * 返回结构: { success, data: { material_statistics: [...] } }
 * 每条记录字段（snake_case）：
 *   material_code / material_name / category / spec / barcode / unit /
 *   supplier / batch_code / production_date / expiry_date /
 *   production_plan_batch_code / requisition_department / usage_area /
 *   requisitioner / requisition_time / requisition_count /
 *   total_quantity / actual_quantity / total_amount / main_warehouse
 */

import { enhancedApiClient } from '../../lib/apiClient'

/**
 * 物料统计记录（V2.0 内部 camelCase 形态）
 * @typedef {Object} MaterialStatItem
 * @property {string} materialCode
 * @property {string} materialName
 * @property {string} category
 * @property {string} spec
 * @property {string} barcode
 * @property {string} unit
 * @property {string} supplier
 * @property {string} batchCode
 * @property {string} productionDate
 * @property {string} expiryDate
 * @property {string} productionPlanBatchCode
 * @property {string} requisitionDepartment
 * @property {string} usageArea
 * @property {string} requisitioner
 * @property {string} requisitionTime
 * @property {number} requisitionCount
 * @property {number} totalQuantity
 * @property {number} actualQuantity
 * @property {number} totalAmount
 * @property {string} mainWarehouse
 */

// snake_case -> camelCase 字段映射
const SNAKE_TO_CAMEL = {
  material_code: 'materialCode',
  material_name: 'materialName',
  category: 'category',
  spec: 'spec',
  barcode: 'barcode',
  unit: 'unit',
  supplier: 'supplier',
  batch_code: 'batchCode',
  production_date: 'productionDate',
  expiry_date: 'expiryDate',
  production_plan_batch_code: 'productionPlanBatchCode',
  requisition_department: 'requisitionDepartment',
  usage_area: 'usageArea',
  requisitioner: 'requisitioner',
  requisition_time: 'requisitionTime',
  requisition_count: 'requisitionCount',
  total_quantity: 'totalQuantity',
  actual_quantity: 'actualQuantity',
  total_amount: 'totalAmount',
  main_warehouse: 'mainWarehouse',
}

const mapRecord = (r) => {
  const out = {}
  for (const [snake, camel] of Object.entries(SNAKE_TO_CAMEL)) {
    out[camel] = r[snake] !== undefined && r[snake] !== null ? r[snake] : (r[camel] !== undefined ? r[camel] : '')
  }
  // 数值字段兜底
  out.requisitionCount = Number(out.requisitionCount) || 0
  out.totalQuantity = Number(out.totalQuantity) || 0
  out.actualQuantity = Number(out.actualQuantity) || 0
  out.totalAmount = Number(out.totalAmount) || 0
  return out
}

/**
 * 获取物料领料统计数据（完整 4 个数据集）
 * @param {Object} [params] - 查询参数（暂未使用，预留）
 * @returns {Promise<{materialStatistics: MaterialStatItem[], monthlyStatistics: any[], categorySummary: any[], categoryTrend: any[]}>}
 */
export async function getMaterialStatistics(params) {
  try {
    const response = await enhancedApiClient.get('/material-statistics/', params)
    const data = response?.data || response || {}
    return {
      materialStatistics: (data.material_statistics || []).map(mapRecord),
      monthlyStatistics: data.monthly_statistics || [],
      categorySummary: data.category_summary || [],
      categoryTrend: data.category_trend || [],
    }
  } catch (err) {
    console.warn('[领料统计] 获取失败:', err)
    return { materialStatistics: [], monthlyStatistics: [], categorySummary: [], categoryTrend: [] }
  }
}