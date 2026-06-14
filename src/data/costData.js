/**
 * 成本核算数据处理 - 严格 1:1 对齐 V1.1
 * V1.1: D:\TMcrop\yuanxingtu\V1.1\src\data\costData.ts
 *
 * 来源：基于 materialReceivingDetails (V1.1 12 条领料单 mock) 动态计算
 */
import { getCategoryByCode } from './materialReceivingMockData'

// ============================================
// 静态数据 - 1:1 对齐 V1.1 costData.ts
// ============================================

// 成本构成饼图数据（按物料分类）
export const costCategoryPieData = [
  { name: '肥料与土壤改良剂', value: 35800, amount: 35800, percentage: 28.5, gradient: ['#06B6D4', '#0891B2'], solid: '#06B6D4' },
  { name: '农药与植保产品', value: 22400, amount: 22400, percentage: 17.8, gradient: ['#8B5CF6', '#7C3AED'], solid: '#8B5CF6' },
  { name: '种质资源', value: 18600, amount: 18600, percentage: 14.8, gradient: ['#F59E0B', '#D97706'], solid: '#F59E0B' },
  { name: '农业机械', value: 15200, amount: 15200, percentage: 12.1, gradient: ['#F97316', '#EA580C'], solid: '#F97316' },
  { name: '劳保与防护用品', value: 12800, amount: 12800, percentage: 10.2, gradient: ['#EC4899', '#DB2777'], solid: '#EC4899' },
  { name: '采收容器', value: 8500, amount: 8500, percentage: 6.8, gradient: ['#64748B', '#475569'], solid: '#64748B' },
  { name: '监测设备', value: 6200, amount: 6200, percentage: 4.9, gradient: ['#10B981', '#059669'], solid: '#10B981' },
  { name: '其他', value: 5500, amount: 5500, percentage: 4.4, gradient: ['#9CA3AF', '#6B7280'], solid: '#9CA3AF' }
]

// 月度成本趋势数据（12个月）
export const monthlyCostTrendData = [
  { month: '2025-01', totalCost: 8920 },
  { month: '2025-02', totalCost: 10580 },
  { month: '2025-03', totalCost: 11860 },
  { month: '2025-04', totalCost: 13240 },
  { month: '2025-05', totalCost: 14710 },
  { month: '2025-06', totalCost: 16120 },
  { month: '2025-07', totalCost: 15220 },
  { month: '2025-08', totalCost: 13940 },
  { month: '2025-09', totalCost: 12630 },
  { month: '2025-10', totalCost: 11210 },
  { month: '2025-11', totalCost: 10060 },
  { month: '2025-12', totalCost: 9180 }
]

// 分类筛选选项
export const COST_CATEGORIES = ['种质资源', '肥料与土壤改良剂', '农药与植保产品', '农业机械', '劳保与防护用品', '采收容器', '监测设备', '其他']
export const COST_WAREHOUSES = ['仓库A区', '仓库B区', '仓库C区', '仓库D区', '仓库E区']
export const COST_DEPARTMENTS = ['生产部', '技术部', '设备部', '后勤部', '采后处理部']

// ============================================
// 动态数据计算函数 - 1:1 对齐 V1.1
// ============================================

/**
 * 1. 根据筛选条件过滤记录
 * @param {Array} data - 领料记录列表
 * @param {Object} filters - 筛选条件 {dateRange:{start,end},departments,warehouses,batches,categories}
 */
export function filterCostRecords(data, filters) {
  return (data || []).filter(record => {
    // 日期筛选
    if (filters.dateRange?.start && record.date < filters.dateRange.start) return false
    if (filters.dateRange?.end && record.date > filters.dateRange.end) return false
    // 部门筛选
    if (filters.departments?.length > 0 && !filters.departments.includes(record.department)) return false
    // 仓库筛选
    if (filters.warehouses?.length > 0 && !filters.warehouses.includes(record.warehouseLocation)) return false
    // 批次筛选
    if (filters.batches?.length > 0 && !filters.batches.includes(record.productionBatchCode)) return false
    // 分类筛选（检查物料明细）
    if (filters.categories?.length > 0) {
      const hasMatchCategory = (record.materials || []).some(mat => {
        const cat = getCategoryByCode(mat.materialCode)
        return filters.categories.includes(cat)
      })
      if (!hasMatchCategory) return false
    }
    return true
  })
}

/**
 * 2. 计算总成本
 */
export function calcCostTotal(records) {
  return (records || []).reduce((sum, record) => {
    const recordCost = (record.materials || []).reduce((matSum, mat) => {
      return matSum + (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0)
    }, 0)
    return sum + recordCost
  }, 0)
}

/**
 * 3. 计算本月成本
 */
export function calcMonthlyCost(records) {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return (records || [])
    .filter(r => (r.date || '').startsWith(currentMonth))
    .reduce((sum, record) => {
      return sum + (record.materials || []).reduce((matSum, mat) => {
        return matSum + (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0)
      }, 0)
    }, 0)
}

/**
 * 4. 按分类聚合
 * @returns {Array} [{category, requisitionCount, totalQuantity, totalAmount, percentage}]
 */
export function aggregateByCategory(records) {
  const totalCost = calcCostTotal(records)
  const categoryMap = new Map()

  ;(records || []).forEach(record => {
    ;(record.materials || []).forEach(mat => {
      const cat = getCategoryByCode(mat.materialCode)
      const amount = (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0)
      const existing = categoryMap.get(cat)
      if (existing) {
        existing.requisitionCount += 1
        existing.totalQuantity += Number(mat.requestedQuantity) || 0
        existing.totalAmount += amount
      } else {
        categoryMap.set(cat, {
          category: cat,
          requisitionCount: 1,
          totalQuantity: Number(mat.requestedQuantity) || 0,
          totalAmount: amount,
          percentage: 0
        })
      }
    })
  })

  const result = Array.from(categoryMap.values())
  result.forEach(item => {
    item.percentage = totalCost > 0 ? (item.totalAmount / totalCost) * 100 : 0
  })
  return result.sort((a, b) => b.totalAmount - a.totalAmount)
}

/**
 * 5. 按部门聚合
 */
export function aggregateByDepartment(records) {
  const totalCost = calcCostTotal(records)
  const deptMap = new Map()

  ;(records || []).forEach(record => {
    const amount = (record.materials || []).reduce((sum, mat) => {
      return sum + (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0)
    }, 0)
    const matTypes = (record.materials || []).length
    const existing = deptMap.get(record.department)
    if (existing) {
      existing.requisitionCount += 1
      existing.totalAmount += amount
      existing.materialTypes += matTypes
    } else {
      deptMap.set(record.department, {
        department: record.department,
        requisitionCount: 1,
        materialTypes: matTypes,
        totalAmount: amount,
        percentage: 0
      })
    }
  })

  const result = Array.from(deptMap.values())
  result.forEach(item => {
    item.percentage = totalCost > 0 ? (item.totalAmount / totalCost) * 100 : 0
  })
  return result.sort((a, b) => b.totalAmount - a.totalAmount)
}

/**
 * 6. 按批次聚合
 */
export function aggregateByBatch(records) {
  const batchMap = new Map()

  ;(records || []).forEach(record => {
    const amount = (record.materials || []).reduce((sum, mat) => {
      return sum + (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0)
    }, 0)
    const matTypes = (record.materials || []).length
    const existing = batchMap.get(record.productionBatchCode)
    if (existing) {
      existing.requisitionCount += 1
      existing.totalAmount += amount
      existing.materialTypes += matTypes
    } else {
      batchMap.set(record.productionBatchCode, {
        batchCode: record.productionBatchCode,
        cropName: (record.plantArea || '').split('-')[0] || '未知',
        area: '0m²',
        requisitionCount: 1,
        materialTypes: matTypes,
        totalAmount: amount,
        unitCost: 0
      })
    }
  })

  return Array.from(batchMap.values()).sort((a, b) => b.totalAmount - a.totalAmount)
}

/**
 * 7. 按月份聚合（趋势图用）
 */
export function aggregateByMonth(records) {
  const monthMap = new Map()

  ;(records || []).forEach(record => {
    const month = (record.date || '').substring(0, 7)
    if (!month) return
    const amount = (record.materials || []).reduce((sum, mat) => {
      return sum + (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0)
    }, 0)
    monthMap.set(month, (monthMap.get(month) || 0) + amount)
  })

  return Array.from(monthMap.entries())
    .map(([month, totalAmount]) => ({ month, totalAmount }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * 8. 获取筛选后的明细数据（用于弹窗）
 */
export function getFilteredMaterialDetails(records, dimension, dimensionValue) {
  return (records || [])
    .filter(record => {
      if (dimension === 'department' && record.department !== dimensionValue) return false
      if (dimension === 'batch' && record.productionBatchCode !== dimensionValue) return false
      return true
    })
    .flatMap(record => record.materials || [])
    .filter(mat => {
      if (dimension === 'category') {
        return getCategoryByCode(mat.materialCode) === dimensionValue
      }
      return true
    })
    .map(mat => ({
      code: mat.materialCode,
      name: mat.materialName,
      spec: mat.spec,
      unit: mat.unit,
      quantity: Number(mat.requestedQuantity) || 0,
      unitPrice: Number(mat.unitPrice) || 0,
      amount: (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0),
      category: getCategoryByCode(mat.materialCode)
    }))
}

/**
 * 9. 获取批次的物料明细汇总（每批次最多 4 个）
 */
export function getBatchMaterialDetails(records) {
  const result = {}

  ;(records || []).forEach(record => {
    const batchCode = record.productionBatchCode
    if (!batchCode) return
    if (!result[batchCode]) result[batchCode] = []
    ;(record.materials || []).forEach(mat => {
      const existing = result[batchCode].find(m => m.materialCode === mat.materialCode)
      const amount = (Number(mat.requestedQuantity) || 0) * (Number(mat.unitPrice) || 0)
      if (existing) {
        existing.totalAmount += amount
      } else {
        result[batchCode].push({
          materialCode: mat.materialCode,
          materialName: mat.materialName,
          totalAmount: amount
        })
      }
    })
  })

  Object.keys(result).forEach(batchCode => {
    result[batchCode] = result[batchCode]
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 4)
  })
  return result
}
