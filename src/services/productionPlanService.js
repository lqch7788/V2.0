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
 * 查询与该生产计划关联的种源、育苗、种植、采收、库存记录
 */
export async function getProductionPlanRelations(productionPlanId, productionPlanCode) {
  const relations = []

  try {
    // 并行查询各模块数据
    const [seedlings, plantings, harvests, inventory] = await Promise.all([
      request.get('/seedlings', { params: { limit: 200 } }).catch(() => []),
      request.get('/plantings', { params: { limit: 200 } }).catch(() => []),
      request.get('/harvest', { params: { limit: 200 } }).catch(() => []),
      request.get('/inventory', { params: { limit: 200 } }).catch(() => []),
    ])

    const items = Array.isArray(seedlings) ? seedlings : (seedlings?.data || seedlings?.records || [])
    const plants = Array.isArray(plantings) ? plantings : (plantings?.data || plantings?.records || [])
    const harvestList = Array.isArray(harvests) ? harvests : (harvests?.data || harvests?.records || [])
    const invList = Array.isArray(inventory) ? inventory : (inventory?.data || inventory?.records || [])

    // 育苗关联：productionPlanCode 匹配
    items.forEach(item => {
      if (item.productionPlanCode === productionPlanCode) {
        relations.push({
          type: 'seedling',
          businessId: item.id,
          businessCode: item.seedlingCode || item.code || '',
          relatedDate: item.startDate || item.createTime || '',
          quantity: item.seedlingQuantity || item.quantity || 0,
          unit: item.unit || '株',
          status: item.status || '',
        })
      }
    })

    // 种植关联：productionPlanCode 匹配
    plants.forEach(item => {
      if (item.productionPlanCode === productionPlanCode) {
        relations.push({
          type: 'planting',
          businessId: item.id,
          businessCode: item.plantCode || item.plantingCode || item.code || '',
          relatedDate: item.plantingDate || item.startDate || item.createTime || '',
          quantity: item.plantingCount || item.quantity || 0,
          unit: item.unit || '株',
          status: item.status || '',
        })
      }
    })

    // 采收关联：productionPlanCode 匹配
    harvestList.forEach(item => {
      if (item.productionPlanCode === productionPlanCode) {
        relations.push({
          type: 'harvest',
          businessId: item.id,
          businessCode: item.harvestCode || item.code || '',
          relatedDate: item.harvestDate || item.createTime || '',
          quantity: item.harvestQuantity || item.quantity || 0,
          unit: item.unit || 'kg',
          status: item.status || '',
        })
      }
    })

    // 库存关联：batchCode 或 productionPlanCode 匹配
    invList.forEach(item => {
      const invCode = item.batchCode || item.productionPlanCode || ''
      if (invCode === productionPlanCode) {
        relations.push({
          type: 'inventory',
          businessId: item.id,
          businessCode: item.batchCode || item.code || '',
          relatedDate: item.storageDate || item.createTime || '',
          quantity: item.quantity || item.currentQuantity || 0,
          unit: item.unit || 'kg',
          status: item.status || '',
          instanceId: item.id,
        })
      }
    })

    const seedSourceCount = relations.filter(r => r.type === 'seedling').length
    const seedlingCount = relations.filter(r => r.type === 'seedling').length
    const plantingCount = relations.filter(r => r.type === 'planting').length
    const harvestCount = relations.filter(r => r.type === 'harvest').length

    return {
      productionPlanId,
      productionPlanCode,
      relations,
      summary: {
        seedSourceCount,
        seedlingCount,
        plantingCount,
        harvestCount,
        totalQuantity: relations.reduce((sum, r) => sum + (r.quantity || 0), 0),
      },
    }
  } catch (error) {
    console.error('加载生产计划关联记录失败:', error)
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
}

/**
 * 获取生产计划的审批记录
 * 1:1 翻译 V1.1 getProductionPlanApprovals
 * 调用后端 /api/approvals/by-business/production/{id}
 * @param {string} productionPlanId 生产计划ID
 * @returns {Promise<Array>}
 */
export async function getProductionPlanApprovals(productionPlanId) {
  try {
    const data = await request.get(`/approvals/by-business/production/${productionPlanId}`)
    if (Array.isArray(data)) {
      return data.map((item) => ({
        id: item.id,
        code: item.code,
        title: item.title,
        status: item.status,
        currentStep: item.currentStep,
        totalSteps: item.totalSteps,
        records: item.records || [],
        createdAt: item.created_at || item.createdAt,
      }))
    }
    return []
  } catch (error) {
    console.error('获取生产计划审批记录失败:', error)
    return []
  }
}
