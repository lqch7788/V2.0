/**
 * 统一库存服务 V3.0
 * 基于架构设计：instance_id 追溯 + 事务日志 + 冻结管理 + 乐观锁
 */

import request from '../request';
import { StockType, InventoryStatus, TransactionType, FreezeStatus } from '../../types/inventory';

/**
 * 生成 instance_id
 * @param {string} stockType - 库存类型
 * @returns {string}
 */
function generateInstanceId(stockType) {
  const prefix = stockType === StockType.SEED ? 'INS'
    : stockType === StockType.SEEDLING ? 'ISE'
    : 'IPR';
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${prefix}-${dateStr}-${sequence}`;
}

/**
 * 生成交易ID
 * @returns {string}
 */
function generateTransactionId() {
  return `TRX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/**
 * 生成冻结ID
 * @returns {string}
 */
function generateFreezeId() {
  return `FRZ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/**
 * 计算可用数量
 * @param {Object} stock - 库存记录
 * @returns {number}
 */
export function calculateAvailableQuantity(stock) {
  return Math.max(0, stock.currentQuantity - stock.frozenQuantity);
}

// ============================================
// API 调用
// ============================================

const API_BASE_URL = '/api';

/**
 * 入库操作
 * @param {Object} requestData - 入库请求数据
 * @returns {Promise<Object>}
 */
export async function inbound(requestData) {
  try {
    const response = await request.post('/inventory/inbound', requestData);
    return {
      success: true,
      instanceId: response.instanceId,
      newQuantity: response.currentQuantity
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || '入库失败'
    };
  }
}

/**
 * 出库操作（带乐观锁校验）
 * @param {Object} requestData - 出库请求数据
 * @returns {Promise<Object>}
 */
export async function outbound(requestData) {
  try {
    // 先获取库存详情
    const stock = await request.get(`/inventory/${requestData.instanceId}`);
    if (!stock) {
      return { success: false, error: `库存实例 ${requestData.instanceId} 不存在` };
    }

    // 检查可用数量
    const available = calculateAvailableQuantity(stock);
    if (available < requestData.quantity) {
      return {
        success: false,
        error: `可用数量不足：可用 ${available}，需要 ${requestData.quantity}`
      };
    }

    const response = await request.post('/inventory/outbound', {
      instanceId: requestData.instanceId,
      businessId: requestData.businessId,
      businessType: requestData.businessType,
      businessCode: requestData.businessCode,
      quantity: requestData.quantity,
      operatorId: requestData.operatorId,
      operatorName: requestData.operatorName,
      remarks: requestData.remarks
    });

    return {
      success: true,
      instanceId: requestData.instanceId,
      newQuantity: response.currentQuantity
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || '出库失败'
    };
  }
}

/**
 * 冻结库存
 * @param {Object} requestData - 冻结请求数据
 * @returns {Promise<Object>}
 */
export async function freezeInventory(requestData) {
  try {
    const stock = await request.get(`/inventory/${requestData.instanceId}`);
    if (!stock) {
      return { success: false, error: `库存实例 ${requestData.instanceId} 不存在` };
    }

    const available = calculateAvailableQuantity(stock);
    if (available < requestData.frozenQuantity) {
      return {
        success: false,
        error: `冻结数量超过可用数量：可用 ${available}，欲冻结 ${requestData.frozenQuantity}`
      };
    }

    const response = await request.post('/inventory/freeze', requestData);
    return {
      success: true,
      instanceId: requestData.instanceId,
      newQuantity: stock.currentQuantity
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || '冻结失败'
    };
  }
}

/**
 * 解冻库存
 * @param {string} freezeId - 冻结记录ID
 * @returns {Promise<Object>}
 */
export async function unfreezeInventory(freezeId) {
  try {
    const response = await request.post(`/inventory/freeze/${freezeId}/unfreeze`);
    return {
      success: true,
      instanceId: response.instanceId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || '解冻失败'
    };
  }
}

/**
 * 获取可用数量
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<Object|null>}
 */
export async function getAvailableQuantity(instanceId) {
  try {
    const stock = await request.get(`/inventory/${instanceId}`);
    if (!stock) return null;

    return {
      instanceId: stock.instanceId,
      currentQuantity: stock.currentQuantity,
      frozenQuantity: stock.frozenQuantity,
      availableQuantity: calculateAvailableQuantity(stock)
    };
  } catch {
    return null;
  }
}

/**
 * 溯源查询
 * @param {string} instanceId - 库存实例ID
 * @param {number} maxDepth - 最大深度
 * @returns {Promise<Array>}
 */
export async function traceUpstream(instanceId, maxDepth = 10) {
  const results = [];
  const visited = new Set();
  const queue = [{ instanceId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();

    if (visited.has(current.instanceId) || current.depth > maxDepth) continue;
    visited.add(current.instanceId);

    try {
      const stock = await request.get(`/inventory/${current.instanceId}`);
      if (!stock) continue;

      results.push({
        instanceId: stock.instanceId,
        stockType: stock.stockType,
        businessType: stock.businessType,
        businessId: stock.businessId,
        cropName: stock.cropName,
        varietyName: stock.varietyName,
        quantity: stock.currentQuantity,
        inboundDate: stock.inboundDate,
        sourceInstanceId: stock.sourceInstanceId
      });

      if (stock.sourceInstanceId && !visited.has(stock.sourceInstanceId)) {
        queue.push({ instanceId: stock.sourceInstanceId, depth: current.depth + 1 });
      }
    } catch {
      break;
    }
  }

  return results;
}

/**
 * 下游追溯
 * @param {string} instanceId - 库存实例ID
 * @param {number} maxDepth - 最大深度
 * @returns {Promise<Array>}
 */
export async function traceDownstream(instanceId, maxDepth = 10) {
  try {
    const transactions = await request.get(`/inventory/${instanceId}/transactions`);
    const results = [];
    const visited = new Set();
    const queue = [{ instanceId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();

      if (visited.has(current.instanceId) || current.depth > maxDepth) continue;
      visited.add(current.instanceId);

      const relatedTxs = transactions.filter(
        t => t.transactionType === TransactionType.OUTBOUND && t.businessId === current.instanceId
      );

      for (const tx of relatedTxs) {
        results.push({
          instanceId: tx.instanceId,
          stockType: tx.stockType,
          businessType: tx.businessType,
          businessId: tx.businessId,
          outboundQuantity: Math.abs(tx.quantity),
          outboundDate: tx.operateDate,
          targetInstanceId: tx.businessId
        });

        if (!visited.has(tx.businessId)) {
          queue.push({ instanceId: tx.businessId, depth: current.depth + 1 });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * 获取库存列表
 * @param {Object} filters - 筛选条件
 * @returns {Promise<{data: Array, total: number}>}
 */
export async function getInventoryList(filters = {}) {
  const params = new URLSearchParams();
  if (filters.stockType) params.append('stock_type', filters.stockType);
  if (filters.status) params.append('status', filters.status);
  if (filters.sourceType) params.append('source_type', filters.sourceType);
  if (filters.productionPlanId) params.append('production_plan_id', filters.productionPlanId);
  if (filters.baseId) params.append('base_id', filters.baseId);
  if (filters.supplierId) params.append('supplier_id', filters.supplierId);
  if (filters.cropName) params.append('crop_name', filters.cropName);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  return request.get(`/inventory${query ? `?${query}` : ''}`);
}

/**
 * 根据业务ID获取库存
 * @param {string} businessId - 业务ID
 * @returns {Promise<Object|null>}
 */
export async function getInventoryByBusinessId(businessId) {
  try {
    return await request.get(`/inventory/business/${businessId}`);
  } catch {
    return null;
  }
}

/**
 * 获取交易记录
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<Array>}
 */
export async function getTransactions(instanceId) {
  try {
    return await request.get(`/inventory/${instanceId}/transactions`);
  } catch {
    return [];
  }
}

/**
 * 获取冻结记录
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<Array>}
 */
export async function getFreezes(instanceId) {
  try {
    return await request.get(`/inventory/${instanceId}/freezes`);
  } catch {
    return [];
  }
}

/**
 * 获取库存统计
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Object>}
 */
export async function getInventoryStats(filters = {}) {
  return request.get('/inventory/stats', filters);
}

/**
 * 按作物名称聚合查询库存
 * @param {string} cropName - 作物名称
 * @returns {Promise<Object>}
 */
export async function searchInventoryByCropName(cropName) {
  const params = new URLSearchParams();
  if (cropName) params.append('crop_name', cropName);

  const query = params.toString();
  return request.get(`/inventory/aggregate/by-crop${query ? `?${query}` : ''}`);
}

/**
 * 获取库存详情（含流水）
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<{stock: Object, transactions: Array}>}
 */
export async function getInventoryDetail(instanceId) {
  return request.get(`/inventory/${instanceId}/detail`);
}
