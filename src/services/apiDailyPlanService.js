/**
 * 每日计划数据 API 服务
 * 对接后端 /api/daily-plans
 *
 * 1:1 翻译自 V1.1 src/services/apiDailyPlanService.ts
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\apiDailyPlanService.ts
 */

import request from '../api/request'

/**
 * @typedef {import('@/types/planning').DailyPlan} DailyPlan
 * @typedef {import('@/types/planning').DailyPlanRecord} DailyPlanRecord
 */

/**
 * 后端返回的日计划数据类型（snake_case）
 * @typedef {Object} BackendDailyPlan
 * @property {string} id
 * @property {string} plan_date
 * @property {string} plan_data
 * @property {string} created_by
 * @property {string} created_at
 * @property {string} updated_at
 * @property {DailyPlan | null} [planData]
 */

/**
 * 将后端返回的数据转换为前端格式
 * @param {BackendDailyPlan | BackendDailyPlan[]} data
 * @returns {DailyPlanRecord | DailyPlanRecord[]}
 */
function transformDailyPlan(data) {
  if (Array.isArray(data)) {
    return data.map((item) => transformSingle(item))
  }
  return transformSingle(data)
}

/**
 * 单条数据转换
 * @param {BackendDailyPlan} item
 * @returns {DailyPlanRecord}
 */
function transformSingle(item) {
  let planData = null
  if (item.plan_data) {
    try {
      planData = JSON.parse(item.plan_data)
    } catch (e) {
      // logger.warn(`[apiDailyPlanService] 解析 plan_data 失败:`, e);
      planData = null
    }
  } else if (item.planData) {
    planData = item.planData
  }

  return {
    id: item.id,
    planDate: item.plan_date,
    planData: planData,
    createdBy: item.created_by,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

/**
 * 获取所有每日计划
 * @returns {Promise<DailyPlanRecord[]>}
 */
export async function getDailyPlans() {
  const data = await request({
    url: '/daily-plans',
    method: 'get'
  })
  return transformDailyPlan(data)
}

/**
 * 获取指定日期的每日计划
 * @param {string} date
 * @returns {Promise<DailyPlanRecord | null>}
 */
export async function getDailyPlanByDate(date) {
  const data = await request({
    url: `/daily-plans/${date}`,
    method: 'get'
  })
  if (!data) return null
  return transformDailyPlan(data)
}

/**
 * 保存每日计划
 * @param {DailyPlanRecord} planRecord
 * @returns {Promise<DailyPlanRecord>}
 */
export async function saveDailyPlan(planRecord) {
  const result = await request({
    url: '/daily-plans',
    method: 'post',
    data: {
      id: planRecord.id,
      planDate: planRecord.planDate,
      planData: planRecord.planData,
      createdBy: planRecord.createdBy
    }
  })

  // 返回带有完整数据的记录
  return {
    ...planRecord,
    id: (result && result.id) || planRecord.id,
    planDate: (result && result.planDate) || planRecord.planDate,
    createdAt: (result && result.createdAt) || planRecord.createdAt || new Date().toISOString(),
    updatedAt: (result && result.updatedAt) || new Date().toISOString()
  }
}

/**
 * 删除每日计划
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteDailyPlan(id) {
  await request({
    url: `/daily-plans/${id}`,
    method: 'delete'
  })
  return true
}

/**
 * 根据日期删除每日计划
 * @param {string} date
 * @returns {Promise<boolean>}
 */
export async function deleteDailyPlanByDate(date) {
  await request({
    url: `/daily-plans/date/${date}`,
    method: 'delete'
  })
  return true
}
