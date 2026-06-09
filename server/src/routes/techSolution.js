/**
 * 技术方案管理路由
 * 提供技术方案的 CRUD 操作和API接口
 */
import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects } from '../utils/queryHelper.js';
const router = Router();
// ============================================
// 工具函数
// ============================================
/**
 * 生成唯一ID
 */
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * 生成技术方案编码
 * 格式：T + 年月 + 3位流水号
 */
function generateSolutionCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `T${year}${month}${seq}`;
}
/**
 * 字段映射：将数据库字段映射到前端期望的字段名
 */
function mapFieldsToFrontend(item) {
    // queryToObjects 返回 camelCase，同时兼容 snake_case 回退
    const sc = (k) => item[k] ?? ''; // snake_case 访问
    const cc = (k) => item[k] ?? ''; // camelCase 访问
    const getVal = (camel, snake) => (item[camel] ?? item[snake] ?? '');
    const batchStatus = getVal('batchStatus', 'batch_status');
    const result = {
        id: item.id,
        code: getVal('solutionCode', 'solution_code'),
        title: getVal('solutionTitle', 'solution_title'),
        crop: getVal('cropName', 'crop_name'),
        cropCode: getVal('cropCode', 'crop_code'),
        plantingMode: getVal('plantingMode', 'planting_mode'),
        stage: item.stage,
        version: item.version || 'V1.0',
        content: item.content,
        author: item.author,
        authorId: getVal('authorId', 'author_id'),
        createDate: getVal('createTime', 'create_time') ? String(getVal('createTime', 'create_time')).split('T')[0] : '',
        updateTime: getVal('updateTime', 'update_time'),
        status: batchStatus === 'published' ? '已发布' :
            batchStatus === 'pending' ? '待审批' :
                batchStatus === 'draft' ? '草稿' :
                    batchStatus === 'approved' ? '已审批' :
                        batchStatus === 'rejected' ? '已拒绝' :
                            batchStatus === 'cancelled' ? '已作废' : '草稿',
        batchStatus: batchStatus,
        statusClass: batchStatus === 'published' ? 'normal' :
            batchStatus === 'pending' ? 'pending' : 'draft',
        approveStatus: batchStatus === 'published' || batchStatus === 'approved' ? '已审批' : '待审批',
        approvalCode: getVal('approvalCode', 'approval_code'),
        approvalDate: getVal('approvedAt', 'approved_at'),
        approver: item.approver,
        relatedBatchCode: getVal('relatedBatchCode', 'related_batch_code'),
        planDetailFileName: getVal('planDetailFileName', 'plan_detail_file_name'),
        priority: item.priority || 'normal',
        remarks: item.remarks,
        lastSubmitTime: getVal('lastSubmitTime', 'last_submit_time') || '',
        isValid: getVal('isValid', 'is_valid') || '有效',
        // V9.0: 适用范围（逗号分隔存储）
        scopeNames: getVal('scopeNames', 'scope_names') || '',
    };
    return result;
}
function mapArrayToFrontend(items) {
    return items.map(item => mapFieldsToFrontend(item));
}
// ============================================
// API 路由
// ============================================
/**
 * 获取所有技术方案
 * GET /api/tech-solutions
 */
router.get('/', (req, res) => {
    try {
        const db = getDatabase();
        const { crop, status, keyword, page = 1, limit = 50 } = req.query;
        let sql = 'SELECT * FROM tech_solutions WHERE 1=1';
        const params = [];
        if (crop) {
            sql += ' AND crop_name LIKE ?';
            params.push(`%${crop}%`);
        }
        if (status) {
            sql += ' AND batch_status = ?';
            params.push(status);
        }
        if (keyword) {
            sql += ' AND (solution_code LIKE ? OR solution_title LIKE ? OR crop_name LIKE ?)';
            const kw = `%${keyword}%`;
            params.push(kw, kw, kw);
        }
        sql += ' ORDER BY create_time DESC';
        // 添加分页
        const offset = (Number(page) - 1) * Number(limit);
        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);
        // 使用 queryToObjects 自动转换 snake_case → camelCase
        const rawItems = queryToObjects(db, sql, params);
        // 转换字段格式为前端期望格式
        const camelItems = mapArrayToFrontend(rawItems);
        // 获取总数
        let countSql = 'SELECT COUNT(*) as total FROM tech_solutions WHERE 1=1';
        const countParams = [];
        if (crop) {
            countSql += ' AND crop_name LIKE ?';
            countParams.push(`%${crop}%`);
        }
        if (status) {
            countSql += ' AND batch_status = ?';
            countParams.push(status);
        }
        if (keyword) {
            countSql += ' AND (solution_code LIKE ? OR solution_title LIKE ? OR crop_name LIKE ?)';
            const kw = `%${keyword}%`;
            countParams.push(kw, kw, kw);
        }
        const countResult = queryToObjects(db, countSql, countParams);
        const total = countResult.length > 0 ? countResult[0].total : 0;
        res.json({
            success: true,
            data: camelItems,
            meta: { total, page: Number(page), limit: Number(limit) }
        });
    }
    catch (error) {
        console.error('获取技术方案列表失败:', error);
        res.status(500).json({ success: false, error: '获取技术方案列表失败' });
    }
});
/**
 * 获取单个技术方案
 * GET /api/tech-solutions/:id
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const items = queryToObjects(db, 'SELECT * FROM tech_solutions WHERE id = ?', [id]);
        if (items && items.length > 0) {
            res.json({
                success: true,
                data: mapFieldsToFrontend(items[0]),
            });
        }
        else {
            res.status(404).json({ success: false, error: '技术方案不存在' });
        }
    }
    catch (error) {
        console.error('获取技术方案详情失败:', error);
        res.status(500).json({ success: false, error: '获取技术方案详情失败' });
    }
});
/**
 * 创建技术方案
 * POST /api/tech-solutions
 */
router.post('/', (req, res) => {
    try {
        const db = getDatabase();
        const { code, // 前端传入的方案编号
        solutionTitle, cropName, cropCode, plantingMode, stage, version, content, author, authorId, relatedBatchCode, planDetailFileName, priority, remarks, scopeNames, // V9.0: 适用范围数组
         } = req.body;
        // 默认草稿状态
        const batchStatus = req.body.batchStatus || 'draft';
        const id = generateId('TS');
        // 优先使用前端传入的编号，否则按规则生成
        const solutionCode = code || generateSolutionCode();
        const now = new Date().toISOString();
        // V9.0: 适用范围数组转逗号分隔字符串
        const scopeNamesStr = Array.isArray(scopeNames) ? scopeNames.join(',') : (scopeNames || '');
        db.run(`
      INSERT INTO tech_solutions (
        id, solution_code, solution_title, crop_name, crop_code, planting_mode, stage,
        version, content, author, author_id, create_time, update_time,
        status, batch_status, related_batch_code, plan_detail_file_name,
        priority, remarks, last_submit_time, is_valid, scope_names
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            solutionCode,
            solutionTitle,
            cropName,
            cropCode || '',
            plantingMode,
            stage,
            version || 'V1.0',
            content,
            author || '',
            authorId || '',
            now,
            now,
            'draft',
            batchStatus,
            relatedBatchCode || '',
            planDetailFileName || '',
            priority || 'normal',
            remarks || '',
            now, // last_submit_time
            req.body.isValid || '有效', // is_valid
            scopeNamesStr,
        ]);
        saveDatabase();
        const newItems = queryToObjects(db, 'SELECT * FROM tech_solutions WHERE id = ?', [id]);
        const resultData = newItems.length > 0 ? mapFieldsToFrontend(newItems[0]) : {};
        res.json({
            success: true,
            message: '技术方案创建成功',
            data: resultData,
        });
    }
    catch (error) {
        console.error('创建技术方案失败:', error);
        res.status(500).json({ success: false, error: '创建技术方案失败' });
    }
});
/**
 * 更新技术方案
 * PUT /api/tech-solutions/:id
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const { solutionTitle = '', cropName = '', cropCode = '', // 修复 P0-CV：补 cropCode，编辑保存后 crop_code 列才更新
        plantingMode = '', stage = '', author = '', // 修复 P0-CU：补 author，编制人编辑才落地
        version = 'V1.0', content = '', relatedBatchCode = '', planDetailFileName = '', priority = 'normal', remarks = '', isValid = '有效', lastSubmitTime = '', scopeNames, // V9.0
         } = req.body;
        const now = new Date().toISOString();
        // 修复 P0-CW：与 V1.1 L362-366 一致，保持原状态不变，只有显式设置时（isValid==='作废'）才改变
        // V2.0 原版强制覆盖为 'pending' 会丢失 approved/published 等状态
        const batchStatus = isValid === '作废' ? 'cancelled' : undefined;
        // V9.0: 适用范围数组转字符串
        const scopeNamesStr = Array.isArray(scopeNames) ? scopeNames.join(',') : (scopeNames || '');
        // 修复 P0-CU/P0-CV：动态构建更新字段（与 V1.1 L365-380 一致）
        const fields = [
            'solution_title = ?', 'crop_name = ?', 'crop_code = ?', 'planting_mode = ?', 'stage = ?',
            'author = ?', 'version = ?', 'content = ?', 'related_batch_code = ?', 'plan_detail_file_name = ?',
            'priority = ?', 'remarks = ?', 'update_time = ?', 'is_valid = ?', 'last_submit_time = ?',
            'scope_names = ?'
        ];
        const values = [
            solutionTitle, cropName, cropCode, plantingMode, stage,
            author, version, content, relatedBatchCode, planDetailFileName,
            priority, remarks, now, isValid, lastSubmitTime || now,
            scopeNamesStr
        ];
        // 只有显式设置状态时才更新 batch_status
        if (batchStatus !== undefined) {
            fields.push('batch_status = ?');
            values.push(batchStatus);
        }
        const sql = `UPDATE tech_solutions SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        db.run(sql, values);
        saveDatabase();
        const updatedItems = queryToObjects(db, 'SELECT * FROM tech_solutions WHERE id = ?', [id]);
        const updatedData = updatedItems.length > 0 ? mapFieldsToFrontend(updatedItems[0]) : null;
        res.json({ success: true, message: '技术方案更新成功', data: updatedData });
    }
    catch (error) {
        console.error('更新技术方案失败:', error);
        res.status(500).json({ success: false, error: '更新技术方案失败' });
    }
});
/**
 * 删除技术方案
 * DELETE /api/tech-solutions/:id
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        db.run('DELETE FROM tech_solutions WHERE id = ?', [id]);
        saveDatabase();
        res.json({
            success: true,
            message: '技术方案删除成功',
        });
    }
    catch (error) {
        console.error('删除技术方案失败:', error);
        res.status(500).json({ success: false, error: '删除技术方案失败' });
    }
});
/**
 * 批量删除技术方案
 * POST /api/tech-solutions/batch-delete
 */
router.post('/batch-delete', (req, res) => {
    try {
        const { ids } = req.body;
        const db = getDatabase();
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: '请选择要删除的技术方案' });
        }
        const placeholders = ids.map(() => '?').join(',');
        db.run(`DELETE FROM tech_solutions WHERE id IN (${placeholders})`, ids);
        saveDatabase();
        res.json({
            success: true,
            message: `成功删除 ${ids.length} 个技术方案`,
        });
    }
    catch (error) {
        console.error('批量删除技术方案失败:', error);
        res.status(500).json({ success: false, error: '批量删除技术方案失败' });
    }
});
/**
 * 获取技术方案统计
 * GET /api/tech-solutions/stats
 */
router.get('/stats/summary', (req, res) => {
    try {
        const db = getDatabase();
        const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN batch_status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN batch_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN batch_status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN batch_status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN batch_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN batch_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM tech_solutions
    `;
        const stmt = db.prepare(sql);
        stmt.step();
        const stats = stmt.getAsObject();
        stmt.free();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        console.error('获取技术方案统计失败:', error);
        res.status(500).json({ success: false, error: '获取技术方案统计失败' });
    }
});
export default router;
