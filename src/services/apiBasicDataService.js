/**
 * 基础数据 API 服务
 * 对接后端 /api/basic-data 和 /api/dictionary
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 */

import { enhancedApiClient } from '../lib/apiClient';

// ============================================
// 部门 API
// ============================================

/**
 * 获取所有部门
 * 降级策略：API → IndexedDB 缓存
 */
export async function getDepartments() {
  const data = await enhancedApiClient.get('/basic-data/departments');
  return data || [];
}

/** 创建部门 */
export async function createDepartment(dept) {
  const result = await enhancedApiClient.post('/basic-data/departments', dept);
  return result;
}

/** 更新部门 */
export async function updateDepartment(id, dept) {
  await enhancedApiClient.put(`/basic-data/departments/${id}`, dept);
}

/** 删除部门 */
export async function deleteDepartment(id) {
  await enhancedApiClient.delete(`/basic-data/departments/${id}`);
}

// ============================================
// 仓库 API
// ============================================

/**
 * 获取所有仓库
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWarehouses() {
  const data = await enhancedApiClient.get('/basic-data/warehouses');
  return data || [];
}

/**
 * 创建仓库
 * 降级策略：API → 离线队列
 */
export async function createWarehouse(warehouse) {
  const result = await enhancedApiClient.post('/basic-data/warehouses', warehouse);
  return result;
}

/**
 * 更新仓库
 * 降级策略：API → 离线队列
 */
export async function updateWarehouse(id, warehouse) {
  await enhancedApiClient.put(`/basic-data/warehouses/${id}`, warehouse);
}

/**
 * 删除仓库
 * 降级策略：API → 离线队列
 */
export async function deleteWarehouse(id) {
  await enhancedApiClient.delete(`/basic-data/warehouses/${id}`);
}

// ============================================
// 温室/基地 API
// ============================================

/**
 * 获取所有温室
 * 降级策略：API → IndexedDB 缓存
 */
export async function getGreenhouses() {
  const data = await enhancedApiClient.get('/basic-data/greenhouses');
  return data || [];
}

/**
 * 创建温室
 * 降级策略：API → 离线队列
 */
export async function createGreenhouse(greenhouse) {
  const result = await enhancedApiClient.post('/basic-data/greenhouses', greenhouse);
  return result;
}

/**
 * 更新温室
 * 降级策略：API → 离线队列
 */
export async function updateGreenhouse(id, greenhouse) {
  await enhancedApiClient.put(`/basic-data/greenhouses/${id}`, greenhouse);
}

/**
 * 删除温室
 * 降级策略：API → 离线队列
 */
export async function deleteGreenhouse(id) {
  await enhancedApiClient.delete(`/basic-data/greenhouses/${id}`);
}

// ============================================
// 区域 API
// ============================================

/**
 * 获取所有区域
 * 降级策略：API → IndexedDB 缓存
 */
export async function getZones() {
  const data = await enhancedApiClient.get('/basic-data/zones');
  return data || [];
}

/**
 * 创建区域
 * 降级策略：API → 离线队列
 */
export async function createZone(zone) {
  const result = await enhancedApiClient.post('/basic-data/zones', zone);
  return result;
}

/**
 * 更新区域
 * 降级策略：API → 离线队列
 */
export async function updateZone(id, zone) {
  await enhancedApiClient.put(`/basic-data/zones/${id}`, zone);
}

/**
 * 删除区域
 * 降级策略：API → 离线队列
 */
export async function deleteZone(id) {
  await enhancedApiClient.delete(`/basic-data/zones/${id}`);
}

// ============================================
// 地块 API
// ============================================

/**
 * 获取所有地块
 * 降级策略：API → IndexedDB 缓存
 */
export async function getBlocks() {
  const data = await enhancedApiClient.get('/basic-data/blocks');
  return data || [];
}

/**
 * 创建地块
 * 降级策略：API → 离线队列
 */
export async function createBlock(block) {
  const result = await enhancedApiClient.post('/basic-data/blocks', block);
  return result;
}

/**
 * 更新地块
 * 降级策略：API → 离线队列
 */
export async function updateBlock(id, block) {
  await enhancedApiClient.put(`/basic-data/blocks/${id}`, block);
}

/**
 * 删除地块
 * 降级策略：API → 离线队列
 */
export async function deleteBlock(id) {
  await enhancedApiClient.delete(`/basic-data/blocks/${id}`);
}

// ============================================
// 编码规则 API
// ============================================

/**
 * 获取所有编码规则
 * 降级策略：API → IndexedDB 缓存
 */
export async function getCodeRules() {
  const data = await enhancedApiClient.get('/basic-data/code-rules');
  return data || [];
}

// ============================================
// 系统配置 API
// ============================================

/**
 * 获取所有系统配置
 * 降级策略：API → IndexedDB 缓存
 */
export async function getSystemConfigs() {
  const data = await enhancedApiClient.get('/basic-data/system-configs');
  return data || [];
}

/**
 * 创建系统配置
 * 降级策略：API → 离线队列
 */
export async function createSystemConfig(config) {
  const result = await enhancedApiClient.post('/basic-data/system-configs', config);
  return result;
}

/**
 * 更新系统配置
 * 降级策略：API → 离线队列
 */
export async function updateSystemConfig(id, config) {
  await enhancedApiClient.put(`/basic-data/system-configs/${id}`, config);
}

/**
 * 删除系统配置
 * 降级策略：API → 离线队列
 */
export async function deleteSystemConfig(id) {
  await enhancedApiClient.delete(`/basic-data/system-configs/${id}`);
}

// ============================================
// 字典 API
// ============================================

/**
 * 获取所有字典项
 * 降级策略：API → IndexedDB 缓存
 *
 * 注意：后端返回 snake_case (category_code, dict_code)，
 * 需要转换为前端使用的 camelCase (categoryCode, dictCode)
 */
export async function getDictionaries(category) {
  // 临时禁用缓存，确保获取最新数据
  const response = await enhancedApiClient.get('/dictionary/dictionaries');

  if (!response) return [];

  // 转换 snake_case 为 camelCase
  return response.map(item => ({
    id: item.id,
    categoryCode: item.category_code,
    dictCode: item.dict_code,
    dictLabel: item.dict_label,
    dictValue: item.dict_value,
    sortOrder: item.sort_order,
    color: item.color,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

/**
 * 获取字典分类列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getDictionaryCategories() {
  const data = await enhancedApiClient.get('/dictionary/dictionaries/categories');
  return data || [];
}

// ============================================
// 班组 API
// ============================================

/**
 * 获取所有班组
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTeams() {
  const data = await enhancedApiClient.get('/basic-data/teams');
  return data || [];
}

/**
 * 创建班组
 * 降级策略：API → 离线队列
 */
export async function createTeam(team) {
  const result = await enhancedApiClient.post('/basic-data/teams', team);
  return result;
}

/**
 * 更新班组
 * 降级策略：API → 离线队列
 */
export async function updateTeam(id, team) {
  await enhancedApiClient.put(`/basic-data/teams/${id}`, team);
}

/**
 * 删除班组
 * 降级策略：API → 离线队列
 */
export async function deleteTeam(id) {
  await enhancedApiClient.delete(`/basic-data/teams/${id}`);
}

// ============================================
// 职位 API
// ============================================

/**
 * 获取所有职位
 * 降级策略：API → IndexedDB 缓存
 */
export async function getPositions() {
  const data = await enhancedApiClient.get('/basic-data/positions');
  return data || [];
}

/**
 * 创建职位
 * 降级策略：API → 离线队列
 */
export async function createPosition(position) {
  const result = await enhancedApiClient.post('/basic-data/positions', position);
  return result;
}

/**
 * 更新职位
 * 降级策略：API → 离线队列
 */
export async function updatePosition(id, position) {
  await enhancedApiClient.put(`/basic-data/positions/${id}`, position);
}

/**
 * 删除职位
 * 降级策略：API → 离线队列
 */
export async function deletePosition(id) {
  await enhancedApiClient.delete(`/basic-data/positions/${id}`);
}

// ============================================
// 设备 API
// ============================================

/**
 * 获取所有设备
 * 降级策略：API → IndexedDB 缓存
 */
export async function getDevices() {
  const data = await enhancedApiClient.get('/basic-data/devices');
  return data || [];
}

/**
 * 创建设备
 * 降级策略：API → 离线队列
 */
export async function createDevice(device) {
  const result = await enhancedApiClient.post('/basic-data/devices', device);
  return result;
}

/**
 * 更新设备
 * 降级策略：API → 离线队列
 */
export async function updateDevice(id, device) {
  await enhancedApiClient.put(`/basic-data/devices/${id}`, device);
}

/**
 * 删除设备
 * 降级策略：API → 离线队列
 */
export async function deleteDevice(id) {
  await enhancedApiClient.delete(`/basic-data/devices/${id}`);
}

// ============================================
// 工序定义 API
// ============================================

/** 获取所有工序定义 */
export async function getProcessDefinitions() {
  const data = await enhancedApiClient.get('/basic-data/process-definitions');
  return data || [];
}

/** 创建工序定义 */
export async function createProcessDefinition(item) {
  const result = await enhancedApiClient.post('/basic-data/process-definitions', item);
  return result;
}

/** 更新工序定义 */
export async function updateProcessDefinition(id, item) {
  await enhancedApiClient.put(`/basic-data/process-definitions/${id}`, item);
}

/** 删除工序定义 */
export async function deleteProcessDefinition(id) {
  await enhancedApiClient.delete(`/basic-data/process-definitions/${id}`);
}

// ============================================
// 分级审批 — 审批级别配置
// ============================================

/** 获取所有审批级别配置 */
export async function getApprovalLevelConfigs() {
  const data = await enhancedApiClient.get('/basic-data/approval-level-configs');
  return data || [];
}

/** 更新审批级别配置 */
export async function updateApprovalLevelConfig(id, item) {
  await enhancedApiClient.put(`/basic-data/approval-level-configs/${id}`, item);
}

// ============================================
// 分级审批 — 审批金额阈值
// ============================================

/** 获取所有金额阈值 */
export async function getApprovalAmountThresholds() {
  const data = await enhancedApiClient.get('/basic-data/approval-amount-thresholds');
  return data || [];
}

/** 创建金额阈值 */
export async function createApprovalAmountThreshold(item) {
  const result = await enhancedApiClient.post('/basic-data/approval-amount-thresholds', item);
  return result;
}

/** 更新金额阈值 */
export async function updateApprovalAmountThreshold(id, item) {
  await enhancedApiClient.put(`/basic-data/approval-amount-thresholds/${id}`, item);
}

/** 删除金额阈值 */
export async function deleteApprovalAmountThreshold(id) {
  await enhancedApiClient.delete(`/basic-data/approval-amount-thresholds/${id}`);
}

// ============================================
// 分级审批 — 审批类型规则
// ============================================

/** 获取所有审批类型规则 */
export async function getApprovalTypeRules() {
  const data = await enhancedApiClient.get('/basic-data/approval-type-rules');
  return data || [];
}

/** 更新审批类型规则 */
export async function updateApprovalTypeRule(id, item) {
  await enhancedApiClient.put(`/basic-data/approval-type-rules/${id}`, item);
}

// ============================================
// 班次管理
// ============================================

/** 获取所有班次 */
export async function getShifts() {
  const data = await enhancedApiClient.get('/basic-data/shifts');
  return data || [];
}

/** 创建班次 */
export async function createShift(shift) {
  const result = await enhancedApiClient.post('/basic-data/shifts', shift);
  return result;
}

/** 更新班次 */
export async function updateShift(id, shift) {
  await enhancedApiClient.put(`/basic-data/shifts/${id}`, shift);
}

/** 删除班次 */
export async function deleteShift(id) {
  await enhancedApiClient.delete(`/basic-data/shifts/${id}`);
}

// ============================================
// 成本核算管理
// ============================================

export async function getCostCategories() {
  const data = await enhancedApiClient.get('/basic-data/cost-categories');
  return data || [];
}

export async function createCostCategory(item) {
  return await enhancedApiClient.post('/basic-data/cost-categories', item);
}

export async function updateCostCategory(id, item) {
  await enhancedApiClient.put(`/basic-data/cost-categories/${id}`, item);
}

export async function deleteCostCategory(id) {
  await enhancedApiClient.delete(`/basic-data/cost-categories/${id}`);
}

export async function getCostBudgets() {
  const data = await enhancedApiClient.get('/basic-data/cost-budgets');
  return data || [];
}

export async function createCostBudget(item) {
  return await enhancedApiClient.post('/basic-data/cost-budgets', item);
}

export async function updateCostBudget(id, item) {
  await enhancedApiClient.put(`/basic-data/cost-budgets/${id}`, item);
}

export async function deleteCostBudget(id) {
  await enhancedApiClient.delete(`/basic-data/cost-budgets/${id}`);
}

// ========== 物料类型 & API ==========

export async function getMaterialTypes() {
  const data = await enhancedApiClient.get('/basic-data/material-types');
  return data || [];
}

export async function createMaterialType(item) {
  return await enhancedApiClient.post('/basic-data/material-types', item);
}

export async function updateMaterialType(id, item) {
  await enhancedApiClient.put(`/basic-data/material-types/${id}`, item);
}

export async function deleteMaterialType(id) {
  await enhancedApiClient.delete(`/basic-data/material-types/${id}`);
}

// ============================================
// 基地管理 API（基地空间架构 V1.0）
// ============================================

/** 获取基地列表 */
export async function getBases(companyOid) {
  let url = '/basic-data/bases';
  if (companyOid) url += `?company_oid=${companyOid}`;
  const data = await enhancedApiClient.get(url);
  return data || [];
}

/** 创建基地 */
export async function createBase(base) {
  const result = await enhancedApiClient.post('/basic-data/bases', base);
  return result;
}

/** 更新基地 */
export async function updateBase(oid, base) {
  await enhancedApiClient.put(`/basic-data/bases/${oid}`, base);
}

/** 删除基地 */
export async function deleteBase(oid) {
  await enhancedApiClient.delete(`/basic-data/bases/${oid}`);
}
