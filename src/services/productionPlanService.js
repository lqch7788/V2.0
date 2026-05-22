/**
 * 生产计划数据 API 服务
 * 对接后端 /api/production-plans
 * 迁移自 VUE1.2 src/services/productionPlanService.js
 */

import request from '../api/request'

/**
 * 将后端返回的数据转换为前端格式
 */
function transformProductionPlan(data) {
  if (Array.isArray(data)) {
    return data.map(item => transformSingle(item))
  }
  return transformSingle(data)
}

function transformSingle(item) {
  return {
    id: item.id,
    batchCode: item.batchCode || '',
    batchName: item.batchName || '',
    planType: item.planType || '',
    cropName: item.cropName || '',
    variety: item.variety || '',
    greenhouseName: item.greenhouseName || '',
    areaName: item.areaName || '',
    targetQuantity: item.targetQuantity || 0,
    targetYield: item.targetYield || 0,
    actualYield: item.actualYield || 0,
    startDate: item.startDate ? item.startDate.split('T')[0] : '',
    expectedHarvestDate: item.expectedHarvestDate ? item.expectedHarvestDate.split('T')[0] : '',
    actualHarvestDate: item.actualHarvestDate ? item.actualHarvestDate.split('T')[0] : '',
    status: item.status || 'planning',
    stage: item.stage || 'seedling',
    stageName: item.stageName || '苗期',
    priority: item.priority || 'normal',
    remarks: item.remarks || '',
    publisher: item.publisher || '',
    createBy: item.createBy || '',
    createTime: item.createTime || '',
    updateTime: item.updateTime || '',
    responsiblePerson: item.responsiblePerson || '',
    unit: item.unit || '',
    publishDate: item.publishDate ? item.publishDate.split('T')[0] : '',
    batchStatus: item.batchStatus || 'draft',
    planDetail: item.planDetail || '',
    planDetailFileName: item.planDetailFileName || '',
    plantingArea: item.plantingArea || 0,
    plantingMode: item.plantingMode || '',
    supplierName: item.supplierName || '',
    seedlingSiteName: item.seedlingSiteName || '',
    seedQuantity: item.seedQuantity || 0,
    targetSeedlingCount: item.targetSeedlingCount || 0,
    greenhouseId: item.greenhouseId || '',
    areaId: item.areaId || '',
  }
}

/**
 * 获取所有生产计划
 */
export async function getProductionPlans() {
  const data = await request.get('/production-plans')
  return transformProductionPlan(data)
}

/**
 * 根据ID获取单个生产计划
 */
export async function getProductionPlanById(id) {
  const data = await request.get(`/production-plans/${id}`)
  return transformProductionPlan(data)
}

/**
 * 根据批次编号获取生产计划
 */
export async function getProductionPlanByCode(batchCode) {
  const data = await request.get(`/production-plans/code/${batchCode}`)
  return transformProductionPlan(data)
}

/**
 * 创建生产计划
 */
export async function addProductionPlan(plan) {
  const result = await request.post('/production-plans', plan)
  return transformProductionPlan(result)
}

/**
 * 更新生产计划
 */
export async function updateProductionPlan(id, updates) {
  const result = await request.put(`/production-plans/${id}`, updates)
  return result?.data ? transformProductionPlan(result.data) : transformProductionPlan(result)
}

/**
 * 删除生产计划
 */
export async function deleteProductionPlan(id) {
  await request.delete(`/production-plans/${id}`)
  return true
}

/**
 * 批量删除生产计划
 */
export async function deleteProductionPlans(ids) {
  await request.delete(`/production-plans/batch?ids=${ids.join(',')}`)
  return true
}

/**
 * 重置生产计划
 */
export async function resetProductionPlans() {
  await request.post('/production-plans/reset')
}

/**
 * 生产计划关联记录
 */
export async function getProductionPlanRelations(productionPlanId, productionPlanCode) {
  // VUE1.2 降级实现：缺少 inventory/seed/seedling/planting/harvest 等服务
  // 保留调用逻辑，返回空数组作为降级
  return {
    productionPlanId,
    productionPlanCode,
    relations: [],
    summary: {
      seedSourceCount: 0,
      seedlingCount: 0,
      plantingCount: 0,
      harvestCount: 0,
      totalQuantity: 0,
    },
  }
}
