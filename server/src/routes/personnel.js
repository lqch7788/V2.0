/**
 * 人事管理路由
 *
 * Phase 5: 人事管理模块
 *
 * 提供人员数据的CRUD API
 */
import { Router } from 'express';
import { getDatabase } from '../db/index.js';
const router = Router();
/**
 * 获取人员列表
 * GET /api/personnel
 */
router.get('/', (req, res) => {
    try {
        const { name, department, position, page = '1', limit = '100' } = req.query;
        const db = getDatabase();
        let sql = 'SELECT * FROM users WHERE 1=1';
        const params = [];
        if (name) {
            sql += ' AND name LIKE ?';
            params.push(`%${name}%`);
        }
        if (department) {
            sql += ' AND department = ?';
            params.push(department);
        }
        if (position) {
            sql += ' AND position = ?';
            params.push(position);
        }
        sql += ' ORDER BY create_time DESC';
        const offset = (Number(page) - 1) * Number(limit);
        sql += ` LIMIT ${Number(limit)} OFFSET ${offset}`;
        const result = db.exec(sql, params);
        const records = result.length > 0 ? result[0].values.map((row) => {
            const columns = result[0].columns;
            return columns.reduce((obj, col, idx) => {
                obj[col] = row[idx];
                return obj;
            }, {});
        }) : [];
        res.json({ success: true, data: records });
    }
    catch (error) {
        console.error('获取人员列表失败:', error);
        res.status(500).json({ success: false, error: '获取人员列表失败' });
    }
});
/**
 * 获取单个人员
 * GET /api/personnel/:id
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
        if (result.length === 0 || result[0].values.length === 0) {
            res.status(404).json({ success: false, error: '人员不存在' });
            return;
        }
        const columns = result[0].columns;
        const record = columns.reduce((obj, col, idx) => {
            obj[col] = result[0].values[0][idx];
            return obj;
        }, {});
        res.json({ success: true, data: record });
    }
    catch (error) {
        console.error('获取人员详情失败:', error);
        res.status(500).json({ success: false, error: '获取人员详情失败' });
    }
});
export default router;
