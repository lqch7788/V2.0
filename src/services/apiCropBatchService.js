/**
 * 生产批次服务
 * 提供生产批次相关的数据操作功能
 * 对接后端 /api/production-plans
 */

import * as productionPlanService from './productionPlanService'

// 获取生产批次列表
export async function getCropBatchList() {
  return await productionPlanService.getProductionPlans()
}

// 根据批次号获取生产批次
export async function getCropBatchByCode(batchCode) {
  return await productionPlanService.getProductionPlanByCode(batchCode)
}

// 获取批次完成率
// 计算公式：当前数量 / 目标数量
export function getCompletionRate(batch, currentQuantity) {
  if (!batch || !currentQuantity) return 0
  // batch.targetQuantity 是目标数量
  const target = batch.targetQuantity || batch.targetYield || 0
  if (target <= 0) return 0
  return currentQuantity / target
}

// 结束生产批次（正常结束/异常结束）
export async function endCropBatch(batchId, endType) {
  // 构建更新数据
  const updates = {
    batchStatus: 'completed',
    endType: endType,
  }

  try {
    await productionPlanService.updateProductionPlan(batchId, updates)
    return true
  } catch (error) {
    console.error('结束生产批次失败:', error)
    return false
  }
}
