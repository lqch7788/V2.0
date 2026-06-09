/**
 * 客户档案 API 路由
 * 提供客户的 CRUD 操作
 * 数据流：客户管理页面 → /api/customers → SQLite customers 表
 */
import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects } from '../utils/queryHelper.js';
const router = Router();
/**
 * 生成唯一ID
 */
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * 生成客户编码：KH + 年月日(8位) + 4位流水号
 */
function generateCustomerCode(existingCodes = []) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    let maxSeq = 0;
    const prefix = `KH${dateStr}`;
    existingCodes.forEach(code => {
        if (code && code.startsWith(prefix)) {
            const seqStr = code.slice(-4);
            const seq = parseInt(seqStr, 10);
            if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq;
            }
        }
    });
    const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
    return `KH${dateStr}${nextSeq}`;
}
/**
 * 获取所有客户
 * GET /api/customers
 * Query: search, page, limit
 */
router.get('/', (req, res) => {
    try {
        const db = getDatabase();
        const { search, page = 1, limit = 50 } = req.query;
        let sql = 'SELECT * FROM customers WHERE 1=1';
        const params = [];
        if (search) {
            sql += ' AND (customer_name LIKE ? OR customer_code LIKE ? OR contact_person LIKE ? OR contact_phone LIKE ?)';
            const kw = `%${search}%`;
            params.push(kw, kw, kw, kw);
        }
        sql += ' ORDER BY create_time DESC';
        const offset = (Number(page) - 1) * Number(limit);
        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);
        // queryToObjects 自动转换 snake_case → camelCase
        const items = queryToObjects(db, sql, params);
        res.json({
            success: true,
            data: items,
            meta: { total: items.length, page: Number(page), limit: Number(limit) }
        });
    }
    catch (error) {
        console.error('获取客户列表失败:', error);
        res.status(500).json({ success: false, error: '获取客户列表失败' });
    }
});
/**
 * 获取单个客户
 * GET /api/customers/:id
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const items = queryToObjects(db, 'SELECT * FROM customers WHERE id = ?', [id]);
        if (!items || items.length === 0) {
            return res.status(404).json({ success: false, error: '客户不存在' });
        }
        res.json({ success: true, data: items[0] });
    }
    catch (error) {
        console.error('获取客户详情失败:', error);
        res.status(500).json({ success: false, error: '获取客户详情失败' });
    }
});
/**
 * 创建客户
 * POST /api/customers
 * 同时支持 camelCase（前端默认）和 snake_case 字段名（V2.0 前端 store 调 addCustomer(form.value) 直接发）
 */
router.post('/', (req, res) => {
    try {
        const db = getDatabase();
        const body = req.body || {};
        // 字段名映射（同时支持 camelCase 和 snake_case）
        const fieldMap = {
            customerCode: 'customer_code',
            customerName: 'customer_name',
            contactPerson: 'contact_person',
            contactPhone: 'contact_phone',
            deliveryAddress: 'delivery_address',
            remarks: 'remarks',
            createBy: 'create_by',
        };
        const pick = (camel, snake) => body[camel] ?? body[snake] ?? '';
        const customer_code = pick('customerCode', 'customer_code') || undefined;
        const customer_name = pick('customerName', 'customer_name');
        const contact_person = pick('contactPerson', 'contact_person');
        const contact_phone = pick('contactPhone', 'contact_phone');
        const delivery_address = pick('deliveryAddress', 'delivery_address');
        const remarks = pick('remarks', 'remarks');
        const create_by = pick('createBy', 'create_by');
        let id = body.id;
        if (!id) {
            id = generateId('CUST');
        }
        // 如果没有提供编码，自动生成
        let finalCustomerCode = customer_code;
        if (!finalCustomerCode) {
            const existingCodes = queryToObjects(db, 'SELECT customer_code AS customerCode FROM customers', []).map(c => c.customerCode);
            finalCustomerCode = generateCustomerCode(existingCodes);
        }
        const now = new Date().toISOString();
        db.run(`INSERT INTO customers (
        id, customer_code, customer_name, contact_person, contact_phone,
        delivery_address, remarks, create_by, create_time, update_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            finalCustomerCode,
            customer_name,
            contact_person,
            contact_phone,
            delivery_address,
            remarks,
            create_by,
            now,
            now
        ]);
        saveDatabase();
        const newCustomers = queryToObjects(db, 'SELECT * FROM customers WHERE id = ?', [id]);
        res.status(201).json({
            success: true,
            data: newCustomers[0] || {}
        });
    }
    catch (error) {
        console.error('创建客户失败:', error);
        res.status(500).json({ success: false, error: '创建客户失败' });
    }
});
/**
 * 更新客户
 * PUT /api/customers/:id
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const db = getDatabase();
        // 检查客户是否存在
        const existing = queryToObjects(db, 'SELECT * FROM customers WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, error: '客户不存在' });
        }
        // 构建更新字段映射 (camelCase -> snake_case)
        const fieldMap = {
            customerCode: 'customer_code',
            customerName: 'customer_name',
            contactPerson: 'contact_person',
            contactPhone: 'contact_phone',
            deliveryAddress: 'delivery_address',
            remarks: 'remarks',
        };
        const updateFields = [];
        const values = [];
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'id')
                continue;
            const dbField = fieldMap[key] || key;
            updateFields.push(`${dbField} = ?`);
            values.push(value);
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, error: '没有需要更新的字段' });
        }
        updateFields.push('update_time = ?');
        values.push(new Date().toISOString());
        values.push(id);
        db.run(`UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`, values);
        saveDatabase();
        const updated = queryToObjects(db, 'SELECT * FROM customers WHERE id = ?', [id]);
        res.json({
            success: true,
            message: '客户更新成功',
            data: updated.length > 0 ? updated[0] : null
        });
    }
    catch (error) {
        console.error('更新客户失败:', error);
        res.status(500).json({ success: false, error: '更新客户失败' });
    }
});
/**
 * 删除客户
 * DELETE /api/customers/:id
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const existing = queryToObjects(db, 'SELECT * FROM customers WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, error: '客户不存在' });
        }
        db.run('DELETE FROM customers WHERE id = ?', [id]);
        saveDatabase();
        res.json({ success: true, message: '客户删除成功' });
    }
    catch (error) {
        console.error('删除客户失败:', error);
        res.status(500).json({ success: false, error: '删除客户失败' });
    }
});
export default router;
