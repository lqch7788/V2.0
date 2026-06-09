/**
 * 采购计划数据 API 服务
 * 对接后端 /api/purchase-plans
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

// 注：PurchasePlan / PurchasePlanItem 类型在 ./purchasePlanService.js 中以 @typedef 形式定义。
// JSDoc 类型不需要真实 import，IDE 能识别，但运行时浏览器会因找不到 export 而报 SyntaxError。
// 这里不导入该模块，依赖 JSDoc 注释的类型提示。

// 后端返回的数据字段类型
/**
 * @typedef {Object} BackendPurchasePlanItem
 * @property {string} id
 * @property {string} materialId
 * @property {string} materialCode
 * @property {string} materialName
 * @property {string} category
 * @property {string} specification
 * @property {string} unit
 * @property {number} quantity
 * @property {number} estimatedPrice
 * @property {number} estimatedTotalPrice
 * @property {string} supplier
 * @property {string} location
 * @property {string} batchNo
 * @property {string} productionDate
 * @property {string} expiryDate
 * @property {string} purpose
 * @property {string} remark
 * @property {string} [relatedBatchCode]
 *
 * @typedef {Object} BackendPurchasePlan
 * @property {string} id
 * @property {string} purchaseApplicationCode
 * @property {string} relatedBatchCode
 * @property {string} purchaseType
 * @property {string} purchaseTypeName
 * @property {string} applicant
 * @property {string} applicantId
 * @property {string} applicantDepartment
 * @property {string} applyDate
 * @property {string} requiredDate
 * @property {string} priority
 * @property {string} priorityText
 * @property {string} status
 * @property {string} statusText
 * @property {number} itemCount
 * @property {BackendPurchasePlanItem[]} items
 * @property {string} remarks
 * @property {string} approvalPerson
 * @property {string} approvalStatus
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} planCode
 * @property {string} planTitle
 * @property {string} planType
 * @property {string} departmentName
 * @property {string} applicantName
 * @property {string} applyDate2
 * @property {string} expectedDate
 * @property {string} supplierId
 * @property {string} supplierName
 * @property {number} totalAmount
 * @property {string[]} attachments
 * @property {*} [key] - 其他任意字段
 */

/**
 * 将后端返回的数据转换为前端格式
 * @param {BackendPurchasePlan|BackendPurchasePlan[]} data
 * @returns {PurchasePlan|PurchasePlan[]}
 */
function transformPurchasePlan(data) {
  if (Array.isArray(data)) {
    return data.map(item => transformSingle(item));
  }
  return transformSingle(data);
}

/**
 * @param {BackendPurchasePlanItem} item
 * @returns {PurchasePlanItem}
 */
function transformItem(item) {
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
  };
}

/**
 * @param {BackendPurchasePlan} item
 * @returns {PurchasePlan}
 */
function transformSingle(item) {
  return {
    id: item.id,
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
    // ✅ 修复 P0-D2: 显式映射 executionStatus（V1.1 L119），未提供时默认 pending_execution
    ...((item).executionStatus !== undefined ? { executionStatus: (item).executionStatus } : { executionStatus: 'pending_execution' }),
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
  };
}

/**
 * 获取所有采购计划
 * 降级策略：API → IndexedDB 缓存
 * @returns {Promise<PurchasePlan[]>}
 */
export async function getPurchasePlans() {
  const data = await enhancedApiClient.get('/purchase-plans');
  return transformPurchasePlan(data);
}

/**
 * 根据ID获取单个采购计划
 * 降级策略：API → IndexedDB 缓存
 * @param {string} id
 * @returns {Promise<PurchasePlan|undefined>}
 */
export async function getPurchasePlanById(id) {
  const data = await enhancedApiClient.get(`/purchase-plans/${id}`);
  return transformPurchasePlan(data);
}

/**
 * 创建采购计划
 * 降级策略：API → 离线队列
 * @param {Omit<PurchasePlan, 'id'>} plan
 * @returns {Promise<PurchasePlan>}
 */
export async function addPurchasePlan(plan) {
  const result = await enhancedApiClient.post('/purchase-plans', plan);
  // POST 响应现在返回经过 mapToFrontendFormat 的完整数据
  return transformPurchasePlan(result);
}

/**
 * 更新采购计划
 * 降级策略：API → 离线队列
 *
 * 1:1 对齐 V1.1 apiPurchasePlanService.ts L173-177：
 * enhancedApiClient 已自动解包 { success, data }，result 就是 plan 本身
 * @param {string} id
 * @param {Partial<PurchasePlan>} updates
 * @returns {Promise<PurchasePlan | null>}
 */
export async function updatePurchasePlan(id, updates) {
  const result = await enhancedApiClient.put(`/purchase-plans/${id}`, updates);
  return result ? transformPurchasePlan(result) : null;
}

/**
 * 删除采购计划
 * 降级策略：API → 离线队列
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deletePurchasePlan(id) {
  await enhancedApiClient.delete(`/purchase-plans/${id}`);
  return true;
}

/**
 * 批量删除采购计划
 * 降级策略：API → 离线队列
 *
 * 1:1 对齐 V1.1：返回 { deleted, skipped[] } 以支持部分删除场景
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\apiPurchasePlanService.ts
 * @param {string[]} ids
 * @returns {Promise<{deleted: number, skipped: {id: string, reason: string}[]}>}
 */
export async function deletePurchasePlans(ids) {
  const result = await enhancedApiClient.post(
    '/purchase-plans/batch-delete',
    { ids }
  );
  return result || { deleted: 0, skipped: [] };
}

/**
 * 重置采购计划（仅调用后端，不做降级）
 * @returns {Promise<void>}
 */
export async function resetPurchasePlans() {
  await enhancedApiClient.post('/purchase-plans/reset');
}

/**
 * 获取下一个可用的采购申请批次号
 * 规则：PA + YYYYMM + 4位流水号（基于数据库最大已用序号 +1）
 * 用于"生成"按钮和打开新建弹窗时的初始值
 *
 * 1:1 对齐 V1.1 src/services/apiPurchasePlanService.ts
 * @returns {Promise<string>}
 */
export async function getNextPurchaseApplicationCode() {
  const result = await enhancedApiClient.get('/purchase-plans/next-code');
  return result?.code || '';
}

/**
 * 更新采购计划执行状态（pending_execution / purchasing / completed / cancelled）
 * 1:1 对齐 V1.1 apiPurchasePlanService.ts L222-232
 * PATCH /purchase-plans/{id}/execution-status
 *
 * enhancedApiClient 已自动解包 { success, data }，result 就是 plan 本身
 * @param {string} id
 * @param {string} executionStatus
 * @returns {Promise<PurchasePlan | null>}
 */
export async function updateExecutionStatus(id, executionStatus) {
  // ✅ 修复 P0-1: HTTP 方法对齐 V1.1（V1.1 L227-230 用 patch，V2.0 server router.patch）
  // 原 V2.0 用 put，与 server 不一致导致 404/405
  const result = await enhancedApiClient.patch(
    `/purchase-plans/${id}/execution-status`,
    { executionStatus }
  );
  return result ? transformPurchasePlan(result) : null;
}
