/**
 * 采购计划数据 API 服务
 * 对接后端 /api/purchase-plans
 *
 * 降级策略：
 * - GET 请求：API → 失败时自动降级
 * - POST/PUT/DELETE：API → 失败时抛出错误
 */

import request from '../api/request'

/**
 * 获取所有采购计划
 */
export async function getPurchasePlans() {
  const data = await request.get('/purchase-plans')
  return transformPurchasePlan(data)
}

/**
 * 根据ID获取单个采购计划
 */
export async function getPurchasePlanById(id) {
  const data = await request.get(`/purchase-plans/${id}`)
  return transformPurchasePlan(data)
}

/**
 * 创建采购计划
 */
export async function addPurchasePlan(plan) {
  const result = await request.post('/purchase-plans', plan)
  return transformPurchasePlan(result)
}

/**
 * 更新采购计划
 */
export async function updatePurchasePlan(id, updates) {
  const result = await request.put(`/purchase-plans/${id}`, updates)
  if (result?.data) {
    return transformPurchasePlan(result.data)
  }
  return transformPurchasePlan(result)
}

/**
 * 删除采购计划
 */
export async function deletePurchasePlan(id) {
  await request.delete(`/purchase-plans/${id}`)
  return true
}

/**
 * 批量删除采购计划
 */
export async function deletePurchasePlans(ids) {
  await request.post('/purchase-plans/batch-delete', { ids })
  return true
}

/**
 * 重置采购计划
 */
export async function resetPurchasePlans() {
  await request.post('/purchase-plans/reset')
}

// ==================== 数据转换 ====================

function transformPurchasePlan(data) {
  if (Array.isArray(data)) {
    return data.map((item) => transformSingle(item))
  }
  if (!data) return data
  return transformSingle(data)
}

function transformSingle(item) {
  if (!item || typeof item !== 'object') return item
  return {
    id: item.id || '',
    purchaseApplicationCode: item.purchaseApplicationCode || '',
    relatedBatchCode: item.relatedBatchCode || '',
    purchaseType: item.purchaseType || '',
    purchaseTypeName: item.purchaseTypeName || '',
    applicant: item.applicant || '',
    applicantId: item.applicantId || '',
    applicantDepartment: item.applicantDepartment || '',
    applyDate: item.applyDate ? item.applyDate.split('T')[0] : '',
    requiredDate: item.requiredDate ? item.requiredDate.split('T')[0] : '',
    priority: item.priority || 'normal',
    priorityText: item.priorityText || '中',
    status: item.status || 'draft',
    statusText: item.statusText || '草稿',
    itemCount: item.itemCount || 0,
    items: Array.isArray(item.items) ? item.items.map(transformItem) : [],
    remarks: item.remarks || '',
    approvalPerson: item.approvalPerson || '',
    approvalStatus: item.approvalStatus || 'pending',
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
    planCode: item.planCode || '',
    planTitle: item.planTitle || '',
    planType: item.planType || '',
    departmentName: item.departmentName || '',
    applicantName: item.applicantName || '',
    applyDate2: item.applyDate2 || '',
    expectedDate: item.expectedDate || '',
    supplierId: item.supplierId || '',
    supplierName: item.supplierName || '',
    totalAmount: item.totalAmount || 0,
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
  }
}

function transformItem(item) {
  if (!item || typeof item !== 'object') return item
  return {
    id: item.id || '',
    materialId: item.materialId || '',
    materialCode: item.materialCode || '',
    materialName: item.materialName || '',
    category: item.category || '',
    specification: item.specification || '',
    unit: item.unit || '',
    quantity: item.quantity || 0,
    estimatedPrice: item.estimatedPrice || 0,
    estimatedTotalPrice: item.estimatedTotalPrice || 0,
    supplier: item.supplier || '',
    location: item.location || '',
    batchNo: item.batchNo || '',
    productionDate: item.productionDate || '',
    expiryDate: item.expiryDate || '',
    purpose: item.purpose || '',
    remark: item.remark || '',
    relatedBatchCode: item.relatedBatchCode,
  }
}
