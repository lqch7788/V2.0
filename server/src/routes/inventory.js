/**
 * 库存 API 路由
 */
import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects } from '../utils/queryHelper.js';
import { recomputeAndUpdateStockStatus } from '../lib/inventoryStockStatus.js';
import { generateTransactionId } from '../services/inventory.service.js';
import { formatLocalDateYYYYMMDD, formatLocalDateISO } from '../utils/dateUtil.js';
const router = Router();
// snake_case → camelCase 字段映射（库存表）
function mapInventoryToCamel(item) {
    const fieldMap = {
        id: 'id',
        harvest_record_id: 'harvestRecordId',
        product_code: 'productCode',
        crop_name: 'cropName',
        variety: 'variety',
        stock_type: 'stockType',
        quantity: 'quantity',
        unit: 'unit',
        grade: 'grade',
        warehouse_id: 'warehouseId',
        warehouse_name: 'warehouseName',
        storage_location: 'storageLocation',
        harvest_date: 'harvestDate',
        storage_date: 'storageDate',
        expiration_date: 'expirationDate',
        batch_code: 'batchCode',
        greenhouse_name: 'greenhouseName',
        planting_mode: 'plantingMode',
        production_plan_code: 'productionPlanCode',
        status: 'status',
        alert_settings: 'alertSettings',
        inbound_records: 'inboundRecords',
        outbound_records: 'outboundRecords',
        create_time: 'createTime',
        update_time: 'updateTime',
        create_by_id: 'createById',
    };
    const result = {};
    for (const [key, value] of Object.entries(item)) {
        result[fieldMap[key] || key] = value;
    }
    return result;
}
/**
 * 获取所有库存记录
 */
router.get('/', (req, res) => {
    try {
        const { crop_name, stock_type, status, page = 1, limit = 50 } = req.query;
        const db = getDatabase();
        let sql = 'SELECT * FROM inventory WHERE 1=1';
        const params = [];
        if (crop_name) {
            sql += ' AND crop_name LIKE ?';
            params.push(`%${crop_name}%`);
        }
        if (stock_type) {
            sql += ' AND stock_type = ?';
            params.push(stock_type);
        }
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        sql += ' ORDER BY create_time DESC';
        // 获取总数 - 使用 db.exec() 获取结果
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const countResult = db.exec(countSql, params);
        const total = countResult.length > 0 && countResult[0].values.length > 0
            ? Number(countResult[0].values[0][0]) || 0
            : 0;
        // 分页 - 使用参数化查询防止SQL注入
        const offset = (Number(page) - 1) * Number(limit);
        const limitValue = Number(limit);
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limitValue, offset);
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        // 转换为 camelCase
        const camelItems = items.map(item => mapInventoryToCamel(item));
        res.json({
            success: true,
            data: camelItems,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('获取库存记录失败:', error);
        res.status(500).json({
            success: false,
            error: '获取库存记录失败'
        });
    }
});
/**
 * 按作物名称聚合查询库存（多形态搜索）
 */
router.get('/aggregate/by-crop', (req, res) => {
    try {
        const { crop_name } = req.query;
        const db = getDatabase();
        let sql = 'SELECT * FROM inventory WHERE 1=1';
        const params = [];
        if (crop_name) {
            sql += ' AND crop_name LIKE ?';
            params.push(`%${crop_name}%`);
        }
        const results = db.exec(sql);
        let items = [];
        if (results.length > 0) {
            const { columns, values } = results[0];
            items = values.map((row) => {
                const obj = {};
                columns.forEach((col, i) => {
                    obj[col] = row[i];
                });
                return obj;
            });
        }
        // 转换为 camelCase
        const camelItems = items.map(item => mapInventoryToCamel(item));
        // 按 stock_type 分组
        const grouped = {
            seed: camelItems.filter((item) => item.stockType === 'seed'),
            seedling: camelItems.filter((item) => item.stockType === 'seedling'),
            product: camelItems.filter((item) => item.stockType === 'product')
        };
        // 计算各形态总数量
        const totalQuantity = {
            seed: grouped.seed.reduce((sum, item) => sum + (item.quantity || 0), 0),
            seedling: grouped.seedling.reduce((sum, item) => sum + (item.quantity || 0), 0),
            product: grouped.product.reduce((sum, item) => sum + (item.quantity || 0), 0)
        };
        res.json({
            success: true,
            data: {
                cropName: crop_name || '',
                seed: grouped.seed,
                seedling: grouped.seedling,
                product: grouped.product,
                total: camelItems.length,
                totalQuantity
            }
        });
    }
    catch (error) {
        console.error('聚合查询失败:', error);
        res.status(500).json({
            success: false,
            error: '聚合查询失败'
        });
    }
});
// 批量操作路由必须在 /:id 之前定义，否则 /batch 会被当作 :id 参数
/**
 * 批量获取库存记录
 * GET /api/inventory/batch?ids=id1,id2,id3
 */
router.get('/batch', (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids || typeof ids !== 'string') {
            return res.status(400).json({ success: false, error: '缺少 ids 参数' });
        }
        const idArray = ids.split(',').filter(id => id.trim() !== '');
        if (idArray.length === 0) {
            return res.json({ success: true, data: [] });
        }
        const db = getDatabase();
        const placeholders = idArray.map(() => '?').join(',');
        const sql = `SELECT * FROM inventory WHERE id IN (${placeholders})`;
        const results = db.exec(sql);
        let items = [];
        if (results.length > 0) {
            const { columns, values } = results[0];
            items = values.map((row) => {
                const obj = {};
                columns.forEach((col, i) => {
                    obj[col] = row[i];
                });
                return obj;
            });
        }
        const camelItems = items.map(item => mapInventoryToCamel(item));
        res.json({ success: true, data: camelItems });
    }
    catch (error) {
        res.status(500).json({ success: false, error: '批量获取库存记录失败' });
    }
});
/**
 * 批量更新库存记录
 * PUT /api/inventory/batch
 */
router.put('/batch', (req, res) => {
    try {
        const { ids, updates } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: '缺少 ids 参数或 ids 不是有效数组' });
        }
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ success: false, error: '缺少 updates 参数或 updates 不是有效对象' });
        }
        const now = new Date().toISOString();
        const db = getDatabase();
        const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
        if (fields.length === 0) {
            return res.status(400).json({ success: false, error: '没有需要更新的字段' });
        }
        const values = Object.keys(updates).filter(k => k !== 'id').map(k => updates[k]);
        values.push(now);
        const placeholders = ids.map(() => '?').join(',');
        db.run(`UPDATE inventory SET ${fields}, update_time = ? WHERE id IN (${placeholders})`, [...values, ...ids]);
        saveDatabase();
        res.json({ success: true, data: { ids, updated: ids.length } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: '批量更新库存记录失败' });
    }
});
/**
 * 批量删除库存记录
 * DELETE /api/inventory/batch
 */
router.delete('/batch', (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids || typeof ids !== 'string') {
            return res.status(400).json({ success: false, error: '缺少 ids 参数' });
        }
        const idArray = ids.split(',').filter(id => id.trim() !== '');
        if (idArray.length === 0) {
            return res.json({ success: true, data: { deletedCount: 0 } });
        }
        const db = getDatabase();
        const placeholders = idArray.map(() => '?').join(',');
        db.run(`DELETE FROM inventory WHERE id IN (${placeholders})`, idArray);
        saveDatabase();
        res.json({ success: true, data: { deletedCount: idArray.length } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: '批量删除库存记录失败' });
    }
});
/**
 * 根据ID获取库存详情
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM inventory WHERE id = ?');
        stmt.bind([id]);
        const item = stmt.getAsObject();
        if (!item || Object.keys(item).length === 0) {
            return res.status(404).json({
                success: false,
                error: '库存记录不存在'
            });
        }
        res.json({
            success: true,
            data: mapInventoryToCamel(item)
        });
    }
    catch (error) {
        console.error('获取库存详情失败:', error);
        res.status(500).json({
            success: false,
            error: '获取库存详情失败'
        });
    }
});
/**
 * 创建库存记录
 */
router.post('/', (req, res) => {
    try {
        const { id, product_code, crop_name, variety, stock_type = 'product', quantity = 0, unit, grade, warehouse_id, warehouse_name, storage_location, harvest_date, batch_code, greenhouse_name, planting_mode, production_plan_code, expiration_date, status = 'active' } = req.body;
        const newId = id || `INV${Date.now()}`;
        const now = new Date().toISOString();
        const db = getDatabase();
        db.run(`
      INSERT INTO inventory
      (id, product_code, crop_name, variety, stock_type, quantity, unit, grade,
       warehouse_id, warehouse_name, storage_location, harvest_date, storage_date,
       batch_code, greenhouse_name, planting_mode, production_plan_code, expiration_date,
       status, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            newId, product_code, crop_name, variety, stock_type, quantity, unit, grade,
            warehouse_id, warehouse_name, storage_location, harvest_date, now,
            batch_code, greenhouse_name, planting_mode, production_plan_code, expiration_date,
            status, now, now
        ]);
        saveDatabase();
        res.status(201).json({
            success: true,
            data: { id: newId }
        });
    }
    catch (error) {
        console.error('创建库存记录失败:', error);
        res.status(500).json({
            success: false,
            error: '创建库存记录失败'
        });
    }
});
/**
 * 更新库存记录
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const now = new Date().toISOString();
        // 允许更新的字段白名单
        const allowedFields = [
            'product_code', 'crop_name', 'variety', 'stock_type', 'quantity', 'unit', 'grade',
            'warehouse_id', 'warehouse_name', 'storage_location', 'harvest_date', 'storage_date',
            'batch_code', 'greenhouse_name', 'planting_mode', 'production_plan_code',
            'expiration_date', 'status', 'alert_settings', 'inbound_records', 'outbound_records'
        ];
        const fields = [];
        const values = [];
        for (const key of Object.keys(updates)) {
            if (key !== 'id' && allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        }
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                error: '没有需要更新的字段'
            });
        }
        fields.push('update_time = ?');
        values.push(now);
        values.push(id);
        const db = getDatabase();
        db.run(`UPDATE inventory SET ${fields.join(', ')} WHERE id = ?`, values);
        saveDatabase();
        res.json({
            success: true,
            data: { id }
        });
    }
    catch (error) {
        console.error('更新库存记录失败:', error);
        res.status(500).json({
            success: false,
            error: '更新库存记录失败'
        });
    }
});
/**
 * 删除库存记录
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        db.run('DELETE FROM inventory WHERE id = ?', [id]);
        saveDatabase();
        res.json({
            success: true,
            data: { id }
        });
    }
    catch (error) {
        console.error('删除库存记录失败:', error);
        res.status(500).json({
            success: false,
            error: '删除库存记录失败'
        });
    }
});
// ========== 2026-07-14: V3.4 库存调拨入种源（创建新种源）==========
// POST /api/inventory/transfer-to-source
// Body: { items: [{sourceStockId, transferQuantity, unit, cropName, cropCode, supplierName}], operatorId, operatorName }
router.post('/transfer-to-source', async (req, res) => {
    try {
        const { items, operatorId, operatorName } = req.body || {};
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, error: 'items 不能为空' });
        }
        const db = getDatabase();
        const now = new Date().toISOString();
        const dateStr = formatLocalDateISO();
        const dateCompact = formatLocalDateYYYYMMDD();
        const operator = { id: operatorId || '', name: operatorName || 'system' };

        // 1. 查询最大种源编码序号（ZZ + 日期 + - + 3位序号）
        const codePattern = `ZZ${dateCompact}-%`;
        const codeRows = queryToObjects(db,
            `SELECT source_code FROM seed_sources WHERE source_code LIKE ? AND LENGTH(source_code) = 16 ORDER BY source_code DESC LIMIT 1`,
            [codePattern]
        );
        let nextSeq = 1;
        if (codeRows.length > 0) {
            const lastCode = String(codeRows[0].source_code || '');
            const seqStr = lastCode.slice(-3);
            const lastSeq = parseInt(seqStr, 10);
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const results = [];
        for (const item of items) {
            if (!item.sourceStockId || !item.transferQuantity || !item.unit) {
                return res.status(400).json({ success: false, error: '每条 item 必须包含 sourceStockId/transferQuantity/unit' });
            }
            // 读源库存
            const stockStmt = db.prepare(`SELECT * FROM inventory_stock WHERE id = ?`);
            stockStmt.bind([item.sourceStockId]);
            const stock = stockStmt.step() ? stockStmt.getAsObject() : null;
            stockStmt.free();
            if (!stock) {
                return res.status(404).json({ success: false, error: `源库存不存在: ${item.sourceStockId}` });
            }
            const sourceCurrent = Number(stock.current_quantity || 0);
            const sourceAvailable = Number(stock.available_quantity || 0);
            const sourceUnit = String(stock.unit || '');
            const sourceInstanceId = String(stock.instance_id || '');
            const sourceStockType = String(stock.stock_type || 'seed');

            if (sourceCurrent < item.transferQuantity) {
                return res.status(400).json({
                    success: false,
                    error: `源库存 ${sourceInstanceId} 可用 ${sourceCurrent}${sourceUnit}，需调拨 ${item.transferQuantity}${item.unit}`
                });
            }
            if (sourceUnit !== item.unit) {
                return res.status(400).json({ success: false, error: `单位不匹配: 源库存 ${sourceUnit} ≠ 调拨 ${item.unit}` });
            }

            // 1. 扣减源库存
            const newSourceCurrent = sourceCurrent - item.transferQuantity;
            const newSourceAvailable = Math.max(0, sourceAvailable - item.transferQuantity);
            db.run(
                `UPDATE inventory_stock
                 SET current_quantity = ?, available_quantity = ?, update_time = ?
                 WHERE id = ?`,
                [newSourceCurrent, newSourceAvailable, now, item.sourceStockId]
            );
            recomputeAndUpdateStockStatus(db, item.sourceStockId);

            // 2. 写 inventory_transaction (outbound)
            const outTxId = await generateTransactionId(dateStr);
            db.run(
                `INSERT INTO inventory_transaction (
                    id, transaction_id, instance_id, stock_type, transaction_type, quantity,
                    balance_before, balance_after, business_id, business_type, business_code,
                    operator_id, operator_name, operate_date, remarks, create_time
                ) VALUES (?, ?, ?, ?, 'outbound', ?, ?, ?, ?, 'transfer', ?, ?, ?, ?, ?, ?)`,
                [
                    outTxId, outTxId, sourceInstanceId, sourceStockType,
                    item.transferQuantity, sourceCurrent, newSourceCurrent,
                    '', '', operator.id, operator.name, dateStr,
                    `调拨入种源（新建模式）`, now,
                ]
            );

            // 3. 创建新种源
            const seq = String(nextSeq).padStart(3, '0');
            const newSourceCode = `ZZ${dateCompact}-${seq}`;
            const newSeedSourceId = `SS${Date.now()}-${seq}`;
            const cropName = String(item.cropName || stock.crop_name || '');
            const cropCode = String(item.cropCode || stock.crop_code || '');
            const supplierName = String(item.supplierName || '');
            const seedForm = String(stock.product_form || sourceStockType || '');
            db.run(
                `INSERT INTO seed_sources (
                    id, source_code, source_name, source_type, source_origin,
                    crop_name, crop_variety, crop_code,
                    supplier_name, quantity, unit, remaining_quantity, used_quantity,
                    status, seed_form, transferred_from_stock_id, create_time, update_time
                ) VALUES (?, ?, ?, 'inventory_transfer', 'inventory_transfer', ?, ?, ?, ?, ?, ?, ?, 0, 'active', ?, ?, ?, ?)`,
                [
                    newSeedSourceId, newSourceCode, `调拨入库 ${newSourceCode}`, 'inventory_transfer',
                    cropName, '', cropCode, supplierName,
                    item.transferQuantity, item.unit, item.transferQuantity,
                    seedForm, item.sourceStockId, now, now
                ]
            );
            nextSeq += 1;

            // 4. 写 inventory_inbound_records（让退库链路可追溯）
            const inRecId = `IRA-${dateStr}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
            db.run(
                `INSERT INTO inventory_inbound_records (
                    id, record_type, record_date, source_module, source_id, source_code,
                    stock_type, source_type,
                    crop_code, crop_name,
                    quantity, unit,
                    business_id, notes, operator_name, create_time
                ) VALUES (?, 'inbound', ?, 'inventory', ?, ?, ?, 'transfer_inbound', ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    inRecId, dateStr, item.sourceStockId, sourceInstanceId, sourceStockType,
                    cropCode, cropName,
                    item.transferQuantity, item.unit,
                    newSeedSourceId,
                    `调拨入种源 ${newSourceCode}（新建）`,
                    operator.name, now
                ]
            );

            results.push({
                newSeedSourceId,
                newSeedSourceCode: newSourceCode,
                newInventoryStockId: item.sourceStockId,
                transferredQuantity: item.transferQuantity,
                unit: item.unit,
            });
        }

        saveDatabase();
        res.json({ success: true, data: results });
    }
    catch (error) {
        console.error('[inventory.transfer-to-source] error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '调拨失败',
        });
    }
});
export default router;
