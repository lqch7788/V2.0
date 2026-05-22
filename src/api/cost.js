/**
 * 成本核算 API 模块
 * 对接后端: /api/basic-data/cost-categories 和 /api/basic-data/cost-budgets
 */
import { get, post, put, del } from './request'

/**
 * 获取成本类别列表
 */
export function getCostCategories() {
  return get('/basic-data/cost-categories')
}

/**
 * 创建成本类别
 */
export function createCostCategory(data) {
  return post('/basic-data/cost-categories', data)
}

/**
 * 更新成本类别
 */
export function updateCostCategory(id, data) {
  return put(`/basic-data/cost-categories/${id}`, data)
}

/**
 * 删除成本类别
 */
export function deleteCostCategory(id) {
  return del(`/basic-data/cost-categories/${id}`)
}

/**
 * 获取预算列表
 */
export function getCostBudgets() {
  return get('/basic-data/cost-budgets')
}

/**
 * 创建预算
 */
export function createCostBudget(data) {
  return post('/basic-data/cost-budgets', data)
}

/**
 * 更新预算
 */
export function updateCostBudget(id, data) {
  return put(`/basic-data/cost-budgets/${id}`, data)
}

/**
 * 删除预算
 */
export function deleteCostBudget(id) {
  return del(`/basic-data/cost-budgets/${id}`)
}

/**
 * 获取成本统计（成本分析Tab使用）
 * V1.1使用 /api/summary/cost-stats
 */
export function getCostStats(params) {
  return get('/summary/cost-stats', params)
}

export default {
  getCostCategories,
  createCostCategory,
  updateCostCategory,
  deleteCostCategory,
  getCostBudgets,
  createCostBudget,
  updateCostBudget,
  deleteCostBudget,
  getCostStats
}
