/**
 * 生产计划 API 路由
 * 提供生产计划的 CRUD 操作
 */
import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects, execCount } from '../utils/queryHelper.js';
const router = Router();
// ============================================
// 辅助函数
// ============================================
/**
 * 生成唯一ID
 */
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * API字段映射：queryToObjects返回的camelCase字段 -> 前端期望的字段名
 * 注意：queryToObjects已经将数据库snake_case转为camelCase，所以这里直接映射camelCase字段
 */
function mapFieldsToFrontend(item) {
    // 1:1 翻译 V1.1 productionPlan.ts L27-86 mapFieldsToFrontend
    // 关键：queryToObjects 已经把 DB 的 snake_case 转为 camelCase
    // 所以 mapField 键必须是 camelCase（如 planCode），不是 snake_case（plan_code）
    // 之前 V2.0 用 snake_case 键导致映射失效，前端拿到的还是 planCode/cropVariety，批次号列空
    const fieldMap = {
        // id保持不变
        id: 'id',
        // planCode -> batchCode (前端期望)
        planCode: 'batchCode',
        planName: 'batchName',
        planType: 'planType',
        cropName: 'cropName',
        // 修复 P0-B6：cropCode 1:1 透传（V1.1 L114 handleRelatedBatchChange 读 batch.cropCode）
        cropCode: 'cropCode',
        // cropVariety -> variety (前端期望)
        cropVariety: 'variety',
        greenhouseName: 'greenhouseName',
        greenhouseId: 'greenhouseId',
        areaName: 'areaName',
        areaId: 'areaId',
        // plannedQuantity -> targetQuantity (前端期望)
        plannedQuantity: 'targetQuantity',
        actualQuantity: 'actualYield',
        // plantingDate -> startDate (前端期望)
        plantingDate: 'startDate',
        expectedHarvestDate: 'expectedHarvestDate',
        actualHarvestDate: 'actualHarvestDate',
        plantingArea: 'plantingArea',
        plantingAreaUnit: 'plantingAreaUnit',
        plantingMode: 'plantingMode',
        responsiblePerson: 'responsiblePerson',
        status: 'status',
        stage: 'stage',
        stageName: 'stageName',
        targetYield: 'targetYield',
        actualYield: 'actualYield',
        priority: 'priority',
        remarks: 'remarks',
        // createBy -> publisher (前端期望，与 V1.1 一致)
        createBy: 'publisher',
        createTime: 'createTime',
        // update_time -> 前端 CropBatch.lastModifyDate（与编辑/详情弹窗字段名对齐）
        updateTime: 'lastModifyDate',
        unit: 'unit',
        publishDate: 'publishDate',
        batchStatus: 'batchStatus',
        planDetail: 'planDetail',
        planDetailFileName: 'planDetailFileName',
        supplierName: 'supplierName',
        seedlingSiteName: 'seedlingSiteName',
        seedQuantity: 'seedQuantity',
        targetSeedlingCount: 'targetSeedlingCount',
        // 2026-06-14: 育苗目标语义字段 - 1:1 V1.1 L80-83
        targetInputCount: 'targetInputCount',
        targetOutputCount: 'targetOutputCount',
        endType: 'endType',
        // 关联订单字段
        orderId: 'orderId',
        orderCode: 'orderCode',
        // 执行状态字段
        executionStatus: 'executionStatus',
    };
    const result = {};
    for (const [key, value] of Object.entries(item)) {
        const mappedKey = fieldMap[key] || key;
        result[mappedKey] = value;
    }
    return result;
}
/**
 * 将数组中所有对象进行字段转换
 */
function mapArrayToFrontend(items) {
    return items.map(item => mapFieldsToFrontend(item));
}
/**
 * 计划类型编码前缀
 */
const PLAN_TYPE_PREFIX = {
    seed_breeding: 'JZ', // 育种 / Ji Zhong
    seedling: 'YM',      // 育苗 / Yang Mu
    planting: 'ZZ',      // 种植 / Zhong Zhi
};
/**
 * 获取今日（按 prefix+date）已生成的最大流水号
 * 1:1 翻译 V1.1 productionPlan.ts L115-135 getTodayMaxSerial
 */
function getTodayMaxSerial(prefix, dateStr) {
    const db = getDatabase();
    // LIKE 模式: 前缀(2) + 日期(8) + '-' + 3位序号占位 = 14 字符
    const pattern = `${prefix}${dateStr}-___`;
    const expectedLength = prefix.length + 8 + 1 + 3; // 14
    const stmt = db.prepare(`
        SELECT plan_code FROM production_plans
        WHERE plan_code LIKE ? AND LENGTH(plan_code) = ?
        ORDER BY plan_code DESC LIMIT 1
    `);
    stmt.bind([pattern, expectedLength]);
    let maxSerial = 0;
    if (stmt.step()) {
        const row = stmt.getAsObject();
        const serialStr = row.plan_code.slice(-3);
        maxSerial = parseInt(serialStr, 10) || 0;
    }
    stmt.free();
    return maxSerial;
}
/**
 * 生成生产计划编码
 * 格式: {前缀}{YYYYMMDD}-{3位流水号}
 * 例: ZZ20260607-001 / JZ20260607-001 / YM20260607-001
 * 1:1 翻译 V1.1 productionPlan.ts L142-154
 */
function generatePlanCode(type) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    // 未知类型 fallback 到 PP
    const prefix = PLAN_TYPE_PREFIX[type] || 'PP';
    const nextSerial = getTodayMaxSerial(prefix, dateStr) + 1;
    const seq = String(nextSerial).padStart(3, '0');
    return `${prefix}${dateStr}-${seq}`;
}
// ============================================
// 生产计划基础 API
// ============================================
/**
 * 获取所有生产计划
 * GET /api/production-plans
 * Query: crop_name, status, plan_type, keyword, page, limit
 */
router.get('/', (req, res) => {
    try {
        const db = getDatabase();
        const { crop_name, status, plan_type, keyword, page = 1, limit = 50 } = req.query;
        let sql = 'SELECT * FROM production_plans WHERE 1=1';
        const params = [];
        if (crop_name) {
            sql += ' AND crop_name LIKE ?';
            params.push(`%${crop_name}%`);
        }
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (plan_type) {
            sql += ' AND plan_type = ?';
            params.push(plan_type);
        }
        if (keyword) {
            sql += ' AND (plan_code LIKE ? OR crop_name LIKE ? OR plan_name LIKE ?)';
            const kw = `%${keyword}%`;
            params.push(kw, kw, kw);
        }
        const countSql = sql;
        sql += ' ORDER BY create_time DESC';
        // 获取总数
        const total = execCount(db, countSql, params);
        // 添加分页
        const offset = (Number(page) - 1) * Number(limit);
        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);
        // 获取数据列表
        const items = queryToObjects(db, sql, params);
        // 转换字段格式为camelCase
        const camelItems = mapArrayToFrontend(items);
        res.json({
            success: true,
            data: camelItems,
            meta: { total, page: Number(page), limit: Number(limit) }
        });
    }
    catch (error) {
        console.error('获取生产计划列表失败:', error);
        res.status(500).json({ success: false, error: '获取生产计划列表失败' });
    }
});
/**
 * 生成生产计划编码（必须在 /:id 路由前注册，否则会被 :id 匹配走 404）
 * GET /api/production-plans/generate-code?planType=xxx
 * 1:1 翻译 V1.1 productionPlan.ts L241-250
 */
router.get('/generate-code', (req, res) => {
    try {
        const planType = (req.query.planType) || '';
        const code = generatePlanCode(planType);
        res.json({ success: true, code });
    }
    catch (error) {
        console.error('生成生产计划编码失败:', error);
        res.status(500).json({ success: false, error: '生成生产计划编码失败' });
    }
});

/**
 * 获取单个生产计划
 * GET /api/production-plans/:id
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const items = queryToObjects(db, 'SELECT * FROM production_plans WHERE id = ?', [id]);
        if (!items || items.length === 0) {
            return res.status(404).json({ success: false, error: '生产计划不存在' });
        }
        // 转换字段格式为前端期望格式
        const camelItem = mapFieldsToFrontend(items[0]);
        res.json({ success: true, data: camelItem });
    }
    catch (error) {
        console.error('获取生产计划详情失败:', error);
        res.status(500).json({ success: false, error: '获取生产计划详情失败' });
    }
});
/**
 * 创建生产计划
 * POST /api/production-plans
 */
router.post('/', (req, res) => {
    try {
        const db = getDatabase();
        const { id, batchCode, batchName, planType, cropName, variety, greenhouseName, greenhouseId, areaName, areaId, targetQuantity, targetYield, actualYield, startDate, expectedHarvestDate, actualHarvestDate, status, priority, remarks, publisher, createBy, responsiblePerson, unit, publishDate, batchStatus, planDetail, planDetailFileName, plantingArea, plantingAreaUnit, plantingMode, supplierName, seedlingSiteName, seedQuantity, targetSeedlingCount, targetInputCount, targetOutputCount, orderId, orderCode, executionStatus } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, error: '生产计划ID不能为空' });
        }
        const now = new Date().toISOString();
        const code = batchCode || generatePlanCode(planType);
        db.run(`
      INSERT INTO production_plans (
        id, plan_code, plan_name, plan_type, crop_name, crop_variety,
        greenhouse_name, area_name, planned_quantity, actual_quantity,
        planting_date, expected_harvest_date, actual_harvest_date,
        status, priority, remarks, create_by, create_time, update_time,
        responsible_person, unit, publish_date, batch_status,
        plan_detail, plan_detail_file_name, planting_area, planting_area_unit, planting_mode,
        supplier_name, seedling_site_name, seed_quantity, target_seedling_count,
        target_input_count, target_output_count,
        order_id, order_code, execution_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            code,
            batchName || '',
            planType || '',
            cropName || '',
            variety || '',
            greenhouseName || '',
            areaName || '',
            targetQuantity || targetYield || 0,
            0,
            startDate || '',
            expectedHarvestDate || '',
            '',
            status || 'planning',
            priority || 'normal',
            remarks || '',
            publisher || createBy || '',
            now,
            now,
            responsiblePerson || '',
            unit || '',
            publishDate || '',
            batchStatus || 'draft',
            planDetail || '',
            planDetailFileName || '',
            plantingArea || 0,
            plantingAreaUnit || 'm²',
            plantingMode || '',
            supplierName || '',
            seedlingSiteName || '',
            seedQuantity || 0,
            targetSeedlingCount || 0,
            // 2026-06-14: 育苗目标语义字段
            targetInputCount || 0,
            targetOutputCount || 0,
            orderId || '',
            orderCode || '',
            executionStatus || 'pending_execution'
        ]);
        saveDatabase();
        // 返回完整数据（与 V1.1 GET /:id 保持一致）- 1:1 翻译 V1.1 L314-322
        const createdPlans = queryToObjects(db, 'SELECT * FROM production_plans WHERE id = ?', [id]);
        const createdData = createdPlans.length > 0 ? mapFieldsToFrontend(createdPlans[0]) : null;
        res.status(201).json({ success: true, message: '生产计划创建成功', data: createdData });
    }
    catch (error) {
        console.error('创建生产计划失败:', error);
        res.status(500).json({ success: false, error: '创建生产计划失败' });
    }
});
/**
 * 更新生产计划
 * PUT /api/production-plans/:id
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const now = new Date().toISOString();
        const db = getDatabase();
        // 先查询当前数据
        const stmt = db.prepare('SELECT * FROM production_plans WHERE id = ?');
        stmt.bind([id]);
        let plan = null;
        if (stmt.step()) {
            plan = stmt.getAsObject();
        }
        stmt.free();
        if (!plan) {
            return res.status(404).json({ success: false, error: '生产计划不存在' });
        }
        // 构建更新字段映射 (camelCase -> snake_case)
        const fieldMap = {
            // V1.1/V2.0 前端使用的字段名 → 数据库 snake_case
            batchCode: 'plan_code',
            batchName: 'plan_name',
            planCode: 'plan_code',
            planName: 'plan_name',
            planType: 'plan_type',
            cropName: 'crop_name',
            variety: 'crop_variety',
            cropVariety: 'crop_variety',
            greenhouseName: 'greenhouse_name',
            greenhouseId: 'greenhouse_id',
            areaName: 'area_name',
            plannedQuantity: 'planned_quantity',
            targetQuantity: 'planned_quantity',
            targetYield: 'planned_quantity',
            actualQuantity: 'actual_quantity',
            actualYield: 'actual_quantity',
            startDate: 'planting_date',
            plantingDate: 'planting_date',
            expectedHarvestDate: 'expected_harvest_date',
            actualHarvestDate: 'actual_harvest_date',
            status: 'status',
            priority: 'priority',
            remarks: 'remarks',
            description: 'remarks',
            publisher: 'create_by',
            createBy: 'create_by',
            responsiblePerson: 'responsible_person',
            unit: 'unit',
            publishDate: 'publish_date',
            batchStatus: 'batch_status',
            planDetail: 'plan_detail',
            planDetailFileName: 'plan_detail_file_name',
            plantingArea: 'planting_area',
            plantingAreaUnit: 'planting_area_unit',
            plantingMode: 'planting_mode',
            supplierName: 'supplier_name',
            seedlingSiteName: 'seedling_site_name',
            seedQuantity: 'seed_quantity',
            targetSeedlingCount: 'target_seedling_count',
            orderId: 'order_id',
            orderCode: 'order_code',
            // 修复 P0: PUT fieldMap 缺 executionStatus 映射，导致 UPDATE 报
            // "no such column: executionStatus"，保存时 500
            executionStatus: 'execution_status',
            // 2026-06-14: 补育苗目标语义字段映射 - 1:1 V1.1
            targetInputCount: 'target_input_count',
            targetOutputCount: 'target_output_count',
        };
        const updateFields = [];
        const values = [];
        // 2026-06-15 修复: 加 allowedKeys 白名单（1:1 V1.1 productionPlan.ts:489-498）
        // 根因: 之前 fieldMap[key] || key 兜底会让前端传任意未声明字段名原样写入 SQL
        //       如果前端 typo 或带乱码,会报"no such column: XXX"导致整个 PUT 失败
        //       表现为用户编辑后保存报"更新生产计划失败"
        // V1.1 修复: allowedKeys 白名单 + 直接丢弃未声明字段（防 SQL 注入 + 脏数据）
        const allowedKeys = new Set(Object.keys(fieldMap));
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'id') continue;
            if (!allowedKeys.has(key)) {
                console.warn(`[PUT] 丢弃未声明字段: ${key}=${value}`);
                continue;
            }
            const dbField = fieldMap[key];
            updateFields.push(`${dbField} = ?`);
            values.push(value);
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, error: '没有需要更新的字段' });
        }
        updateFields.push('update_time = ?');
        values.push(now);
        values.push(id);
        db.run(`UPDATE production_plans SET ${updateFields.join(', ')} WHERE id = ?`, values);
        saveDatabase();
        // 查询更新后的完整数据并返回（自动 camelCase 转换）
        const updatedPlans = queryToObjects(db, 'SELECT * FROM production_plans WHERE id = ?', [id]);
        const updatedData = updatedPlans.length > 0 ? mapFieldsToFrontend(updatedPlans[0]) : null;
        res.json({ success: true, message: '生产计划更新成功', data: updatedData });
    }
    catch (error) {
        console.error('更新生产计划失败:', error.message);
        res.status(500).json({ success: false, error: '更新生产计划失败: ' + error.message });
    }
});
/**
 * 批量删除生产计划
 * DELETE /api/production-plans/batch?ids=id1,id2,id3
 * 注意：此路由必须放在 /:id 路由之前，否则 /batch 会被当作 :id 参数
 */
router.delete('/batch', (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids || typeof ids !== 'string') {
            return res.status(400).json({ success: false, error: '缺少ids参数' });
        }
        const idArray = ids.split(',').map(id => id.trim()).filter(Boolean);
        if (idArray.length === 0) {
            return res.status(400).json({ success: false, error: 'ids参数格式错误' });
        }
        const db = getDatabase();
        // 批量删除（不再检查状态）
        const stmt = db.prepare(`DELETE FROM production_plans WHERE id = ?`);
        for (const id of idArray) {
            stmt.bind([id]);
            stmt.step();
            stmt.reset();
        }
        stmt.free();
        saveDatabase();
        res.json({ success: true, message: `成功删除${idArray.length}条生产计划` });
    }
    catch (error) {
        console.error('批量删除生产计划失败:', error);
        res.status(500).json({ success: false, error: '批量删除生产计划失败' });
    }
});
/**
 * 删除生产计划
 * DELETE /api/production-plans/:id
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        // 检查生产计划是否存在
        const stmt = db.prepare('SELECT * FROM production_plans WHERE id = ?');
        stmt.bind([id]);
        let plan = null;
        if (stmt.step()) {
            plan = stmt.getAsObject();
        }
        stmt.free();
        if (!plan) {
            return res.status(404).json({ success: false, error: '生产计划不存在' });
        }
        // V1.1逻辑：不再检查状态，所有状态都可以删除
        db.run('DELETE FROM production_plans WHERE id = ?', [id]);
        saveDatabase();
        res.json({ success: true, message: '生产计划删除成功' });
    }
    catch (error) {
        console.error('删除生产计划失败:', error);
        res.status(500).json({ success: false, error: '删除生产计划失败' });
    }
});
// ============================================
// 生产计划统计 API
// ============================================
/**
 * 获取生产计划统计数据
 * GET /api/production-plans/stats/summary
 */
router.get('/stats/summary', (req, res) => {
    try {
        const db = getDatabase();
        const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(planned_quantity) as total_planned,
        SUM(actual_quantity) as total_actual
      FROM production_plans
    `;
        const stmt = db.prepare(sql);
        stmt.step();
        const stats = stmt.getAsObject();
        stmt.free();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        console.error('获取生产计划统计失败:', error);
        res.status(500).json({ success: false, error: '获取生产计划统计失败' });
    }
});
export default router;
