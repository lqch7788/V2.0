/**
 * 月度计划数据 API 服务
 * 对接后端 /api/monthly-plans
 *
 * 1:1 翻译自 V1.1 src/services/apiMonthlyPlanService.ts
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\apiMonthlyPlanService.ts
 */

import request from '../api/request'

/**
 * @typedef {import('@/types/planning').MonthlyPlan} MonthlyPlan
 * @typedef {import('@/types/planning').MonthlyPlanRecord} MonthlyPlanRecord
 */

/**
 * 后端返回的月度计划数据类型（snake_case）
 * @typedef {Object} BackendMonthlyPlan
 * @property {string} id
 * @property {string} plan_month
 * @property {string} plan_data
 * @property {string} created_by
 * @property {string} created_at
 * @property {string} updated_at
 * @property {MonthlyPlan | null} [planData]
 */

/**
 * 将后端返回的数据转换为前端格式
 * @param {BackendMonthlyPlan | BackendMonthlyPlan[]} data
 * @returns {MonthlyPlanRecord | MonthlyPlanRecord[]}
 */
function transformMonthlyPlan(data) {
  if (Array.isArray(data)) {
    return data.map((item) => transformSingle(item))
  }
  return transformSingle(data)
}

/**
 * 单条数据转换
 * @param {BackendMonthlyPlan} item
 * @returns {MonthlyPlanRecord}
 */
function transformSingle(item) {
  let planData = null
  if (item.plan_data) {
    try {
      planData = JSON.parse(item.plan_data)
    } catch (e) {
      // logger.warn(`[apiMonthlyPlanService] 解析 plan_data 失败:`, e);
      planData = null
    }
  } else if (item.planData) {
    planData = item.planData
  }

  return {
    id: item.id,
    planMonth: item.plan_month,
    planData: planData,
    createdBy: item.created_by,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }
}

/**
 * 获取所有月度计划
 * @returns {Promise<MonthlyPlanRecord[]>}
 */
export async function getMonthlyPlans() {
  const data = await request({
    url: '/monthly-plans',
    method: 'get'
  })
  return transformMonthlyPlan(data)
}

/**
 * 获取指定月份的月度计划
 * @param {string} month
 * @returns {Promise<MonthlyPlanRecord | null>}
 */
export async function getMonthlyPlanByMonth(month) {
  const data = await request({
    url: `/monthly-plans/${month}`,
    method: 'get'
  })
  if (!data) return null
  return transformMonthlyPlan(data)
}

/**
 * 保存月度计划
 * @param {MonthlyPlanRecord} planRecord
 * @returns {Promise<MonthlyPlanRecord>}
 */
export async function saveMonthlyPlan(planRecord) {
  const result = await request({
    url: '/monthly-plans',
    method: 'post',
    data: {
      id: planRecord.id,
      planMonth: planRecord.planMonth,
      planData: planRecord.planData,
      createdBy: planRecord.createdBy
    }
  })

  // 返回带有完整数据的记录
  return {
    ...planRecord,
    id: (result && result.id) || planRecord.id,
    planMonth: (result && result.planMonth) || planRecord.planMonth,
    createdAt: (result && result.createdAt) || planRecord.createdAt || new Date().toISOString(),
    updatedAt: (result && result.updatedAt) || new Date().toISOString()
  }
}

/**
 * 删除月度计划
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteMonthlyPlan(id) {
  await request({
    url: `/monthly-plans/${id}`,
    method: 'delete'
  })
  return true
}

/**
 * 根据月份删除月度计划
 * @param {string} month
 * @returns {Promise<boolean>}
 */
export async function deleteMonthlyPlanByMonth(month) {
  await request({
    url: `/monthly-plans/month/${month}`,
    method: 'delete'
  })
  return true
}
