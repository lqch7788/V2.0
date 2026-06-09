/**
 * 库存服务 - V3.0统一库存架构
 */

import { getDatabase, saveDatabase } from '../db/index.js';
import { inventoryStockRepository } from '../repositories/inventory.repository.js';
import { inventoryTransactionRepository } from '../repositories/inventory-tx.repository.js';
import { queryToObjects } from '../utils/queryHelper.js';

// warehouseType → stockType 映射
const WAREHOUSE_TYPE_TO_STOCK_TYPE = {
  'seed_storage': 'seed',
  'seedling': 'seedling',
  'cold_storage': 'product',
  'normal': 'product',
};

export class InventoryService {
  async getInventory(params) {
    const db = getDatabase();
    const { cropName, warehouseId, status, page = 1, limit = 20 } = params;

    const sql = 'SELECT * FROM inventory WHERE 1=1';
    const conditions = [];
    const queryParams = [];

    if (cropName) {
      conditions.push('crop_name LIKE ?');
      queryParams.push(`%${cropName}%`);
    }
    if (warehouseId) {
      conditions.push('warehouse_id = ?');
      queryParams.push(warehouseId);
    }
    if (status) {
      conditions.push('status = ?');
      queryParams.push(status);
    }

    const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const finalSql = `${sql}${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const stmt = db.prepare(finalSql);
    stmt.bind([...queryParams, limit, offset]);

    const items = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();

    const countSql = `SELECT COUNT(*) as total FROM inventory WHERE 1=1${whereClause}`;
    const countStmt = db.prepare(countSql);
    countStmt.bind(queryParams);
    countStmt.step();
    const countResult = countStmt.getAsObject();
    countStmt.free();

    return {
      data: items,
      total: countResult.total,
    };
  }

  async getById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM inventory WHERE id = ?');
    stmt.bind([id]);

    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return null;
  }

  async create(inventory) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = inventory.id || `inv_${Date.now()}`;

    db.run(`
      INSERT INTO inventory (
        id, batch_code, crop_name, warehouse_id, warehouse_name,
        quantity, unit, status, harvest_record_id, planting_id, remarks,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      inventory.batch_code || '',
      inventory.crop_name || '',
      inventory.warehouse_id || '',
      inventory.warehouse_name || '',
      inventory.quantity || 0,
      inventory.unit || '',
      inventory.status || 'in_stock',
      inventory.harvest_record_id || null,
      inventory.planting_id || null,
      inventory.remarks || '',
      now,
      now,
    ]);

    saveDatabase();
    return id;
  }

  async updateQuantity(id, quantity) {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.run('UPDATE inventory SET quantity = ?, updated_at = ? WHERE id = ?', [quantity, now, id]);
    saveDatabase();
    return true;
  }

  async delete(id) {
    const db = getDatabase();
    db.run('DELETE FROM inventory WHERE id = ?', [id]);
    saveDatabase();
    return true;
  }

  /**
   * 采收入库 - V3.0核心功能
   */
  async inbound(request) {
    try {
      // 1. 校验仓库
      const db = getDatabase();
      const warehouseSql = `SELECT * FROM warehouses WHERE oid = ?`;
      const warehouses = queryToObjects(db, warehouseSql, [request.warehouseId]);

      if (warehouses.length === 0) {
        return { success: false, error: '仓库不存在' };
      }

      const warehouse = warehouses[0];

      // 2. 校验仓库类型与 stockType 匹配
      const expectedStockType = WAREHOUSE_TYPE_TO_STOCK_TYPE[warehouse.warehouseType];
      if (!expectedStockType || expectedStockType !== request.stockType) {
        return {
          success: false,
          error: `仓库类型不匹配：期望 ${expectedStockType}，实际 ${warehouse.warehouseType}`
        };
      }

      // 3. 生成 instanceId
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = request.stockType === 'seed' ? 'INS'
        : request.stockType === 'seedling' ? 'ISE'
        : 'IPR';
      const instanceId = `${prefix}-${dateStr}-${String(Math.random().toString(36).slice(2, 6)).toUpperCase()}`;

      // 4. 创建库存记录
      const stock = await inventoryStockRepository.create({
        instance_id: instanceId,
        stock_type: request.stockType,
        business_id: request.businessId,
        business_type: request.businessType,
        business_code: request.businessCode,
        crop_id: request.cropId,
        crop_name: request.cropName,
        variety_id: request.varietyId,
        variety_name: request.varietyName,
        current_quantity: request.quantity,
        frozen_quantity: 0,
        available_quantity: request.quantity,
        unit: request.unit,
        warehouse_id: request.warehouseId,
        warehouse_name: request.warehouseName,
        inbound_date: request.inboundDate || now.toISOString().slice(0, 10),
        source_type: request.sourceType || 'self_produced',
        production_plan_code: request.productionPlanCode,
        source_instance_id: request.sourceInstanceId,
        status: 'in_stock',
      });

      // 5. 创建入库流水
      const transactionId = `TRX-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await inventoryTransactionRepository.create({
        transaction_id: transactionId,
        instance_id: instanceId,
        stock_type: request.stockType,
        transaction_type: 'inbound',
        quantity: request.quantity,
        balance_before: 0,
        balance_after: request.quantity,
        business_id: request.businessId,
        business_type: request.businessType,
        business_code: request.businessCode,
        operator_id: request.operatorId,
        operator_name: request.operatorName || '系统管理员',
        operate_date: now.toISOString().slice(0, 10),
        remarks: request.remarks || '采收入库',
      });

      console.log('[InventoryService] 入库成功:', { instanceId, transactionId, quantity: request.quantity });

      return {
        success: true,
        instanceId,
        transactionId,
        currentQuantity: request.quantity,
        availableQuantity: request.quantity,
      };
    } catch (error) {
      console.error('[InventoryService] inbound 失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '入库失败'
      };
    }
  }

  /**
   * 获取库存详情（含流水）
   */
  async getDetail(instanceId) {
    const stock = await inventoryStockRepository.findByInstanceId(instanceId);
    const transactions = await inventoryTransactionRepository.findByInstanceId(instanceId);
    return { stock, transactions };
  }

  /**
   * 获取库存列表（V3.0 新库存表）
   */
  async getList(query) {
    return inventoryStockRepository.findAll(query);
  }
}

export const inventoryService = new InventoryService();
