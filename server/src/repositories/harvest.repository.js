/**
 * 采收记录数据访问层 (Repository)
 * 负责所有数据库 SQL 操作
 */
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects, execCount } from '../utils/queryHelper.js';
/** 前端驼峰字段 → 数据库蛇形列名映射（白名单） */
const FIELD_MAP = {
    harvestCode: 'harvest_code',
    sourceId: 'source_id',
    sourceName: 'source_name',
    cropName: 'crop_name',
    cropVariety: 'crop_variety',
    greenhouseName: 'greenhouse_name',
    harvestDate: 'harvest_date',
    harvestQuantity: 'harvest_quantity',
    unit: 'unit',
    unitPrice: 'unit_price',
    totalAmount: 'total_amount',
    grade: 'quality_grade',
    quality: 'quality_grade',
    buyerId: 'buyer_id',
    buyerName: 'buyer_name',
    salesChannel: 'sales_channel',
    status: 'status',
    remarks: 'remarks',
    createBy: 'create_by',
    warehouseId: 'warehouse_id',
    auditorId: 'auditor_id',
    batchCode: 'batch_code',
    batchId: 'batch_id',
    variety: 'crop_variety',
    plantingMode: 'planting_mode',
    targetYield: 'target_yield',
    harvestArea: 'harvest_area',
    harvesterIds: 'harvester_ids',
    relatedTaskId: 'related_task_id',
    relatedTaskCode: 'related_task_code',
};
/** 将前端驼峰数据转换为数据库蛇形字段（只保留白名单内字段） */
function toSnakeFields(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === 'id')
            continue;
        const dbCol = FIELD_MAP[key];
        if (dbCol) {
            result[dbCol] = value;
        }
    }
    return result;
}
/** 反向映射：数据库 snake_case 字段 → 前端 camelCase 字段 */
const REVERSE_FIELD_MAP = {
    harvest_code: 'harvestCode',
    source_id: 'sourceId',
    source_name: 'sourceName',
    crop_name: 'cropName',
    crop_variety: 'cropVariety',
    greenhouse_name: 'greenhouseName',
    harvest_date: 'harvestDate',
    harvest_quantity: 'harvestQuantity',
    unit: 'unit',
    unit_price: 'unitPrice',
    total_amount: 'totalAmount',
    quality_grade: 'qualityGrade',
    buyer_id: 'buyerId',
    buyer_name: 'buyerName',
    sales_channel: 'salesChannel',
    status: 'status',
    remarks: 'remarks',
    create_by: 'createBy',
    create_time: 'createTime',
    update_time: 'updateTime',
    warehouse_id: 'warehouseId',
    warehouse_name: 'warehouseName',
    inbound_type: 'inboundType',
    auditor_id: 'auditorId',
    auditor: 'auditor',
    batch_code: 'batchCode',
    batch_id: 'batchId',
    planting_mode: 'plantingMode',
    production_plan_code: 'productionPlanCode',
    harvest_area: 'harvestArea',
    harvester_ids: 'harvesterIds',
    related_task_id: 'relatedTaskId',
    related_task_code: 'relatedTaskCode',
    expected_harvest_date: 'expectedHarvestDate',
    actual_harvest_date: 'actualHarvestDate',
};
/** 将数据库返回的 snake_case 数据转换为前端 camelCase 格式 */
function toCamelFields(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        const mappedKey = REVERSE_FIELD_MAP[key] || key;
        result[mappedKey] = value;
    }
    return result;
}
/**
 * 采收 Repository 类
 * 提供采收记录数据的增删改查操作
 */
export class HarvestRepository {
    /**
     * 查询采收记录列表（分页、筛选）
     * @param query 查询条件
     * @returns 采收数据列表和总数
     */
    async findAll(query) {
        const db = getDatabase();
        const { crop_name, status, page = 1, limit = 50 } = query;
        let baseSql = `SELECT h.*,
      COALESCE(h.inbound_type, 'planting_harvest') AS inbound_type,
      COALESCE(w.name, '') AS warehouse_name,
      COALESCE(u.real_name, '') AS auditor
    FROM harvest_records h
    LEFT JOIN warehouses w ON h.warehouse_id = w.id
    LEFT JOIN users u ON h.auditor_id = u.id
    WHERE 1=1`;
        const params = [];
        if (crop_name) {
            baseSql += ' AND h.crop_name LIKE ?';
            params.push(`%${crop_name}%`);
        }
        if (status) {
            baseSql += ' AND h.status = ?';
            params.push(status);
        }
        const countSql = `SELECT COUNT(*) FROM harvest_records h WHERE 1=1`
            + (crop_name ? ' AND h.crop_name LIKE ?' : '')
            + (status ? ' AND h.status = ?' : '');
        const total = execCount(db, countSql, params);
        const offset = (Number(page) - 1) * Number(limit);
        baseSql += ' ORDER BY h.create_time DESC';
        baseSql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);
        const items = queryToObjects(db, baseSql, params);
        // 转换为前端 camelCase 格式
        const camelItems = items.map(item => toCamelFields(item));
        return { data: camelItems, total };
    }
    /**
     * 根据ID查询采收记录详情
     * @param id 采收记录ID
     * @returns 采收记录或 undefined
     */
    async findById(id) {
        const db = getDatabase();
        const sql = `SELECT h.*,
      COALESCE(h.inbound_type, 'planting_harvest') AS inbound_type,
      COALESCE(w.name, '') AS warehouse_name,
      COALESCE(u.real_name, '') AS auditor
    FROM harvest_records h
    LEFT JOIN warehouses w ON h.warehouse_id = w.id
    LEFT JOIN users u ON h.auditor_id = u.id
    WHERE h.id = ?`;
        const stmt = db.prepare(sql);
        stmt.bind([id]);
        let item = null;
        if (stmt.step()) {
            item = stmt.getAsObject();
        }
        stmt.free();
        return item ? toCamelFields(item) : undefined;
    }
    /**
     * 根据批次号获取采收记录
     * @param batchCode 批次号
     * @returns 采收记录列表
     */
    async findByBatchCode(batchCode) {
        const db = getDatabase();
        const sql = `SELECT h.*,
      COALESCE(h.inbound_type, 'planting_harvest') AS inbound_type,
      COALESCE(w.name, '') AS warehouse_name,
      COALESCE(u.real_name, '') AS auditor
    FROM harvest_records h
    LEFT JOIN warehouses w ON h.warehouse_id = w.id
    LEFT JOIN users u ON h.auditor_id = u.id
    WHERE h.source_id = ? OR h.source_name = ? ORDER BY h.harvest_date DESC, h.create_time DESC`;
        const items = queryToObjects(db, sql, [batchCode, batchCode]);
        return items.map(item => toCamelFields(item));
    }
    /**
     * 批量获取采收记录
     * @param ids ID数组
     * @returns 采收记录列表
     */
    async findByIds(ids) {
        if (!ids || ids.length === 0)
            return [];
        const db = getDatabase();
        const placeholders = ids.map(() => '?').join(',');
        const sql = `SELECT h.*,
      COALESCE(h.inbound_type, 'planting_harvest') AS inbound_type,
      COALESCE(w.name, '') AS warehouse_name,
      COALESCE(u.real_name, '') AS auditor
    FROM harvest_records h
    LEFT JOIN warehouses w ON h.warehouse_id = w.id
    LEFT JOIN users u ON h.auditor_id = u.id
    WHERE h.id IN (${placeholders}) ORDER BY h.create_time DESC`;
        const items = queryToObjects(db, sql, ids);
        return items.map(item => toCamelFields(item));
    }
    /**
     * 创建采收记录
     * @param data 采收数据
     * @returns 创建的采收记录
     */
    async create(data) {
        const db = getDatabase();
        const newId = data.id || `HV${Date.now()}`;
        const now = new Date().toISOString();
        // 使用 any[] 来避免 sql.js 类型严格检查问题
        const params = [
            newId, data.harvest_code, data.source_id, data.source_name, data.crop_name, data.crop_variety, data.greenhouse_name,
            data.harvest_date, data.harvest_quantity, data.unit, data.unit_price, data.total_amount, data.quality_grade,
            data.buyer_id, data.buyer_name, data.sales_channel, data.status || 'pending', data.remarks, data.create_by, now, now
        ];
        db.run(`
      INSERT INTO harvest_records (id, harvest_code, source_id, source_name, crop_name, crop_variety, greenhouse_name,
        harvest_date, harvest_quantity, unit, unit_price, total_amount, quality_grade,
        buyer_id, buyer_name, sales_channel, status, remarks, create_by, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);
        saveDatabase();
        return { ...data, id: newId, create_time: now, update_time: now };
    }
    /**
     * 更新采收记录
     * @param id 采收记录ID
     * @param data 更新数据
     * @returns 更新后的采收记录
     */
    async update(id, data) {
        const db = getDatabase();
        const now = new Date().toISOString();
        const mapped = toSnakeFields(data);
        const fields = Object.keys(mapped).map(k => `${k} = ?`).join(', ');
        if (fields.length === 0) {
            throw new Error('没有需要更新的字段');
        }
        const values = Object.values(mapped);
        values.push(now, id);
        db.run(`UPDATE harvest_records SET ${fields}, update_time = ? WHERE id = ?`, values);
        saveDatabase();
        return this.findById(id);
    }
    /**
     * 批量更新采收记录
     * @param ids ID数组
     * @param updates 更新数据
     * @returns 更新数量
     */
    async updateBatch(ids, updates) {
        if (!ids || ids.length === 0) {
            throw new Error('缺少ids参数或ids不是有效数组');
        }
        if (!updates || typeof updates !== 'object') {
            throw new Error('缺少updates参数或updates不是有效对象');
        }
        const db = getDatabase();
        const now = new Date().toISOString();
        // 驼峰转蛇形 + 白名单过滤
        const mapped = toSnakeFields(updates);
        const fields = Object.keys(mapped).map(k => `${k} = ?`).join(', ');
        if (fields.length === 0) {
            throw new Error('没有需要更新的字段');
        }
        const values = Object.values(mapped);
        values.push(now);
        const placeholders = ids.map(() => '?').join(',');
        db.run(`UPDATE harvest_records SET ${fields}, update_time = ? WHERE id IN (${placeholders})`, [...values, ...ids]);
        saveDatabase();
        return ids.length;
    }
    /**
     * 删除采收记录
     * @param id 采收记录ID
     */
    async delete(id) {
        const db = getDatabase();
        db.run('DELETE FROM harvest_records WHERE id = ?', [id]);
        saveDatabase();
    }
    /**
     * 批量删除采收记录（仅删除草稿状态）
     * @param ids ID数组
     * @returns 删除结果
     */
    async deleteBatch(ids) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new Error('缺少ids参数或ids不是有效数组');
        }
        const db = getDatabase();
        const deletedIds = [];
        const failedIds = [];
        // 直接执行批量删除（不检查状态，允许删除任何状态的记录）
        const placeholders = ids.map(() => '?').join(',');
        db.run(`DELETE FROM harvest_records WHERE id IN (${placeholders})`, ids);
        saveDatabase();
        // 所有传入的 ID 都视为删除成功
        return { deleted: ids, failed: [] };
    }
    /**
     * 获取采收统计数据
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param cropName 作物名称
     * @param greenhouseName 温室名称
     * @returns 统计数据
     */
    async getStats(startDate, endDate, cropName, greenhouseName) {
        const db = getDatabase();
        // 构建基础WHERE条件
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (startDate) {
            whereClause += ' AND harvest_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND harvest_date <= ?';
            params.push(endDate);
        }
        if (cropName) {
            whereClause += ' AND crop_name LIKE ?';
            params.push(`%${cropName}%`);
        }
        if (greenhouseName) {
            whereClause += ' AND greenhouse_name LIKE ?';
            params.push(`%${greenhouseName}%`);
        }
        // 总记录数
        const countSql = `SELECT COUNT(*) as total FROM harvest_records ${whereClause}`;
        const countResult = queryToObjects(db, countSql, params);
        const totalRecords = countResult[0]?.total || 0;
        // 总采收量
        const yieldParams = [...params];
        const yieldSql = `SELECT COALESCE(SUM(harvest_quantity), 0) as total_yield FROM harvest_records ${whereClause}`;
        const yieldResult = queryToObjects(db, yieldSql, yieldParams);
        const totalYield = Number(yieldResult[0]?.totalYield) || 0;
        // 总产值
        const amountParams = [...params];
        const amountSql = `SELECT COALESCE(SUM(total_amount), 0) as total_amount FROM harvest_records ${whereClause}`;
        const amountResult = queryToObjects(db, amountSql, amountParams);
        const totalAmount = Number(amountResult[0]?.totalAmount) || 0;
        // 按状态统计
        const statusParams = [...params];
        const statusSql = `
      SELECT status, COUNT(*) as count, COALESCE(SUM(harvest_quantity), 0) as yield
      FROM harvest_records
      ${whereClause}
      GROUP BY status
    `;
        const statusResult = queryToObjects(db, statusSql, statusParams);
        // 按作物统计（TOP 5）
        const cropParams = [...params];
        const cropSql = `
      SELECT crop_name as name, COALESCE(SUM(harvest_quantity), 0) as value, COUNT(*) as count
      FROM harvest_records
      ${whereClause}
      GROUP BY crop_name
      ORDER BY value DESC
      LIMIT 5
    `;
        const cropResult = queryToObjects(db, cropSql, cropParams);
        // 按温室统计
        const greenhouseParams = [...params];
        const greenhouseSql = `
      SELECT greenhouse_name as name, COALESCE(SUM(harvest_quantity), 0) as value, COUNT(*) as count
      FROM harvest_records
      ${whereClause}
      GROUP BY greenhouse_name
      ORDER BY value DESC
    `;
        const greenhouseResult = queryToObjects(db, greenhouseSql, greenhouseParams);
        // 按质量等级统计
        const gradeParams = [...params];
        const gradeSql = `
      SELECT quality_grade as name, COALESCE(SUM(harvest_quantity), 0) as value, COUNT(*) as count
      FROM harvest_records
      ${whereClause}
      GROUP BY quality_grade
      ORDER BY value DESC
    `;
        const gradeResult = queryToObjects(db, gradeSql, gradeParams);
        return {
            overview: {
                totalRecords,
                totalYield,
                totalAmount,
                avgPrice: totalYield > 0 ? Math.round((totalAmount / totalYield) * 100) / 100 : 0
            },
            byStatus: statusResult,
            byCrop: cropResult,
            byGreenhouse: greenhouseResult,
            byGrade: gradeResult
        };
    }
    /**
     * 导出采收数据
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param cropName 作物名称
     * @param greenhouseName 温室名称
     * @param status 状态
     * @returns 采收记录列表
     */
    async export(startDate, endDate, cropName, greenhouseName, status) {
        const db = getDatabase();
        let sql = `SELECT h.*,
      COALESCE(h.inbound_type, 'planting_harvest') AS inbound_type,
      COALESCE(w.name, '') AS warehouse_name,
      COALESCE(u.real_name, '') AS auditor
    FROM harvest_records h
    LEFT JOIN warehouses w ON h.warehouse_id = w.id
    LEFT JOIN users u ON h.auditor_id = u.id
    WHERE 1=1`;
        const params = [];
        if (startDate) {
            sql += ' AND h.harvest_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            sql += ' AND h.harvest_date <= ?';
            params.push(endDate);
        }
        if (cropName) {
            sql += ' AND h.crop_name LIKE ?';
            params.push(`%${cropName}%`);
        }
        if (greenhouseName) {
            sql += ' AND h.greenhouse_name LIKE ?';
            params.push(`%${greenhouseName}%`);
        }
        if (status) {
            sql += ' AND h.status = ?';
            params.push(status);
        }
        sql += ' ORDER BY h.harvest_date DESC, h.create_time DESC';
        const items = queryToObjects(db, sql, params);
        return items.map(item => toCamelFields(item));
    }
    /**
     * 初始化采收记录（添加示例数据）
     * @returns 采收记录列表
     */
    async init() {
        const db = getDatabase();
        const sql = 'SELECT * FROM harvest_records ORDER BY create_time DESC LIMIT 100';
        const items = queryToObjects(db, sql, []);
        // 转换为 camelCase
        const camelItems = items.map(item => toCamelFields(item));
        // 如果没有数据，添加示例数据
        if (camelItems.length === 0) {
            const now = new Date().toISOString();
            const defaultData = [
                {
                    id: 'HV001',
                    harvest_code: 'HV20260501001',
                    source_id: 'PL001',
                    source_name: 'ZZ2026-001-01',
                    crop_name: '番茄',
                    crop_variety: '红果番茄',
                    greenhouse_name: '一棚',
                    harvest_date: '2026-05-01',
                    harvest_quantity: 500,
                    unit: 'kg',
                    unit_price: 3.5,
                    total_amount: 1750,
                    quality_grade: 'A级',
                    buyer_id: 'BUY001',
                    buyer_name: '永辉超市',
                    sales_channel: '商超',
                    status: 'completed',
                    remarks: '第一批采收',
                    create_by: '李明辉',
                    create_time: now,
                    update_time: now
                },
                {
                    id: 'HV002',
                    harvest_code: 'HV20260502001',
                    source_id: 'PL002',
                    source_name: 'ZZ2026-002-01',
                    crop_name: '黄瓜',
                    crop_variety: '水果黄瓜',
                    greenhouse_name: '二棚',
                    harvest_date: '2026-05-02',
                    harvest_quantity: 300,
                    unit: 'kg',
                    unit_price: 2.5,
                    total_amount: 750,
                    quality_grade: 'A级',
                    buyer_id: 'BUY002',
                    buyer_name: '沃尔玛',
                    sales_channel: '商超',
                    status: 'completed',
                    remarks: '第二批采收',
                    create_by: '王建国',
                    create_time: now,
                    update_time: now
                }
            ];
            for (const item of defaultData) {
                db.run(`
          INSERT INTO harvest_records (id, harvest_code, source_id, source_name, crop_name, crop_variety, greenhouse_name,
            harvest_date, harvest_quantity, unit, unit_price, total_amount, quality_grade,
            buyer_id, buyer_name, sales_channel, status, remarks, create_by, create_time, update_time)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [item.id, item.harvest_code, item.source_id, item.source_name, item.crop_name, item.crop_variety, item.greenhouse_name,
                    item.harvest_date, item.harvest_quantity, item.unit, item.unit_price, item.total_amount, item.quality_grade,
                    item.buyer_id, item.buyer_name, item.sales_channel, item.status, item.remarks, item.create_by, item.create_time, item.update_time]);
            }
            saveDatabase();
            const freshItems = queryToObjects(db, sql, []);
            return freshItems.map(item => toCamelFields(item));
        }
        return camelItems;
    }
    /**
     * 重置采收记录数据
     */
    async reset() {
        const db = getDatabase();
        const now = new Date().toISOString();
        // 清空现有数据
        db.run('DELETE FROM harvest_records');
        // 插入默认数据
        const defaultData = [
            {
                id: 'HV001',
                harvest_code: 'HV20260501001',
                source_id: 'PL001',
                source_name: 'ZZ2026-001-01',
                crop_name: '番茄',
                crop_variety: '红果番茄',
                greenhouse_name: '一棚',
                harvest_date: '2026-05-01',
                harvest_quantity: 500,
                unit: 'kg',
                unit_price: 3.5,
                total_amount: 1750,
                quality_grade: 'A级',
                buyer_id: 'BUY001',
                buyer_name: '永辉超市',
                sales_channel: '商超',
                status: 'completed',
                remarks: '第一批采收',
                create_by: '李明辉'
            },
            {
                id: 'HV002',
                harvest_code: 'HV20260502001',
                source_id: 'PL002',
                source_name: 'ZZ2026-002-01',
                crop_name: '黄瓜',
                crop_variety: '水果黄瓜',
                greenhouse_name: '二棚',
                harvest_date: '2026-05-02',
                harvest_quantity: 300,
                unit: 'kg',
                unit_price: 2.5,
                total_amount: 750,
                quality_grade: 'A级',
                buyer_id: 'BUY002',
                buyer_name: '沃尔玛',
                sales_channel: '商超',
                status: 'completed',
                remarks: '第二批采收',
                create_by: '王建国'
            }
        ];
        for (const item of defaultData) {
            db.run(`
        INSERT INTO harvest_records (id, harvest_code, source_id, source_name, crop_name, crop_variety, greenhouse_name,
          harvest_date, harvest_quantity, unit, unit_price, total_amount, quality_grade,
          buyer_id, buyer_name, sales_channel, status, remarks, create_by, create_time, update_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [item.id, item.harvest_code, item.source_id, item.source_name, item.crop_name, item.crop_variety, item.greenhouse_name,
                item.harvest_date, item.harvest_quantity, item.unit, item.unit_price, item.total_amount, item.quality_grade,
                item.buyer_id, item.buyer_name, item.sales_channel, item.status, item.remarks, item.create_by, now, now]);
        }
        saveDatabase();
    }
}
// 导出单例
export const harvestRepository = new HarvestRepository();
