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
            // 3. 生成 instanceId（P0修复: V1.1 generateInstanceId - DB自增+重试, 本地时区日期）
            const now = new Date();
            const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            const prefix = request.stockType === 'seed' ? 'INS'
                : request.stockType === 'seedling' ? 'ISE'
                    : 'IPR';
            // DB 自增序号 + 重试机制（最多5次，避免并发冲突）
            let instanceId;
            const db = getDatabase();
            for (let attempt = 0; attempt < 5; attempt++) {
                const rows = queryToObjects(db,
                    `SELECT instance_id FROM inventory_stock WHERE instance_id LIKE ? ORDER BY instance_id DESC LIMIT 1`,
                    [`${prefix}-${dateStr}-%`]
                );
                let seq = 1;
                if (rows.length > 0) {
                    const lastId = rows[0].instance_id || '';
                    const parts = lastId.split('-');
                    const lastSeq = parseInt(parts[parts.length - 1] || '0', 10);
                    if (!isNaN(lastSeq)) seq = lastSeq + 1;
                }
                instanceId = `${prefix}-${dateStr}-${String(seq).padStart(4, '0')}`;
                // 冲突检测：检查是否已存在
                const existing = queryToObjects(db,
                    `SELECT instance_id FROM inventory_stock WHERE instance_id = ?`, [instanceId]
                );
                if (existing.length === 0) break;
                if (attempt === 4) {
                    return { success: false, error: '生成库存实例ID失败：已达最大重试次数' };
                }
            }
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
                inbound_date: request.inboundDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
                source_type: request.sourceType || 'self_produced',
                production_plan_code: request.productionPlanCode,
                source_instance_id: request.sourceInstanceId,
                status: 'in_stock',
            });
            // 5. 创建入库流水（P0修复: V1.1 generateTransactionId - 格式 TRX-YYYYMMDD-NNNN, 非 Math.random()）
            const trxRows = queryToObjects(getDatabase(),
                `SELECT transaction_id FROM inventory_transactions WHERE transaction_id LIKE ? ORDER BY transaction_id DESC LIMIT 1`,
                [`TRX-${dateStr}-%`]
            );
            let trxSeq = 1;
            if (trxRows.length > 0) {
                const lastTrx = trxRows[0].transaction_id || '';
                const trxParts = lastTrx.split('-');
                const lastTrxSeq = parseInt(trxParts[trxParts.length - 1] || '0', 10);
                if (!isNaN(lastTrxSeq)) trxSeq = lastTrxSeq + 1;
            }
            const transactionId = `TRX-${dateStr}-${String(trxSeq).padStart(4, '0')}`;
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
                operate_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
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
        }
        catch (error) {
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
