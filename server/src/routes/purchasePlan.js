/**
 * 采购计划 API 路由
 * 提供采购计划的 CRUD 操作
 */
import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects, execCount } from '../utils/queryHelper.js';
import { purchasePlanService } from '../services/purchasePlan.service.js';
const router = Router();
// 状态文本映射
const STATUS_TEXT = {
    draft: '草稿',
    pending: '待审批',
    approved: '已通过',
    in_progress: '执行中',
    purchasing: '采购中',
    completed: '已完成',
    cancelled: '已作废',
    rejected: '已拒绝',
};
// 优先级文本映射
const PRIORITY_TEXT = {
    urgent: '紧急',
    high: '高',
    normal: '中',
    low: '低',
};
// 采购类型显示名称映射
const PURCHASE_TYPE_TEXT = {
    production: '生产物资采购',
    urgent: '紧急采购',
    routine: '常规采购',
    safety: '劳保用品',
    material: '通用物资',
    equipment: '设备采购',
    other: '其他',
};
/**
 * 将下划线命名字段转换为驼峰命名
 */
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * 将对象的所有下划线字段转换为驼峰命名
 */
function mapItemToCamelCase(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    const result = {};
    for (const key of Object.keys(obj)) {
        const camelKey = toCamelCase(key);
        result[camelKey] = obj[key];
    }
    return result;
}
/**
 * 将数据库记录映射为前端期望的字段格式
 * 注意：queryToObjects 已通过 mapToCamelCase 转换字段名，所以这里是 camelCase
 */
function mapToFrontendFormat(record) {
    const status = record.status || 'draft';
    const priority = record.priority || 'normal';
    const planType = String(record.planType || record.plan_type || '');
    // 处理 items 数组中的字段转换
    let itemsArray = [];
    if (Array.isArray(record.items)) {
        itemsArray = record.items.map((item) => mapItemToCamelCase(item));
    }
    return {
        // 前端期望的字段名
        id: record.id,
        purchaseApplicationCode: record.planCode || record.plan_code || '', // 采购申请批次号
        relatedBatchCode: record.relatedBatchCode || record.related_batch_code || '', // 关联生产批次
        purchaseType: planType, // 采购类型
        purchaseTypeName: PURCHASE_TYPE_TEXT[planType] || planType, // 类型显示名称
        applicant: record.applicantName || record.applicant_name || '', // 申请人
        applicantId: record.applicantId || record.applicant_id || '', // 申请人ID
        applicantDepartment: record.departmentName || record.department_name || '', // 申请部门
        applyDate: record.applyDate || record.apply_date || '', // 申请日期
        requiredDate: record.expectedDate || record.expected_date || '', // 需求日期
        priority: priority, // 优先级
        priorityText: PRIORITY_TEXT[priority] || priority, // 优先级显示文本
        status: status, // 状态
        statusText: STATUS_TEXT[status] || status, // 状态显示文本
        itemCount: Array.isArray(itemsArray) ? itemsArray.length : 0,
        items: itemsArray,
        remarks: record.remarks || '',
        approvalPerson: record.approvalPerson || record.approval_person || '',
        approvalStatus: record.approvalStatus || record.approval_status || '',
        // 时间戳
        createdAt: record.createTime || record.create_time || '',
        updatedAt: record.updateTime || record.update_time || '',
        // 保留原始字段（兼容）
        planCode: record.planCode || record.plan_code || '',
        planTitle: record.planTitle || record.plan_title || '',
        planType: planType,
        departmentName: record.departmentName || record.department_name || '',
        applicantName: record.applicantName || record.applicant_name || '',
        applyDate2: record.applyDate || record.apply_date || '',
        expectedDate: record.expectedDate || record.expected_date || '',
        supplierId: record.supplierId || record.supplier_id || '',
        supplierName: record.supplierName || record.supplier_name || '',
        totalAmount: record.totalAmount || record.total_amount || 0,
        attachments: record.attachments || [],
    };
}
/**
 * 生成采购计划编码
 */
function generatePurchasePlanCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `PP${year}${month}${day}${seq}`;
}
/**
 * 获取采购计划列表
 * GET /api/purchase-plans
 */
router.get('/', (req, res) => {
    try {
        const { plan_type, status, approval_status, department_name, applicant_name, priority, page = 1, limit = 50 } = req.query;
        const db = getDatabase();
        let sql = 'SELECT * FROM purchase_plans WHERE 1=1';
        const params = [];
        if (plan_type) {
            sql += ' AND plan_type LIKE ?';
            params.push(`%${plan_type}%`);
        }
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (approval_status) {
            sql += ' AND approval_status = ?';
            params.push(approval_status);
        }
        if (department_name) {
            sql += ' AND department_name LIKE ?';
            params.push(`%${department_name}%`);
        }
        if (applicant_name) {
            sql += ' AND applicant_name LIKE ?';
            params.push(`%${applicant_name}%`);
        }
        if (priority) {
            sql += ' AND priority = ?';
            params.push(priority);
        }
        const countSql = sql;
        sql += ' ORDER BY apply_date DESC, create_time DESC';
        const total = execCount(db, countSql, params);
        const offset = (Number(page) - 1) * Number(limit);
        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);
        const dbItems = queryToObjects(db, sql, params);
        // 解析 attachments 和 items JSON 字段，并映射为前端期望的格式
        const result = dbItems.map((item) => {
            const parsed = {
                ...item,
                attachments: item.attachments ? JSON.parse(item.attachments) : [],
                items: item.items ? JSON.parse(item.items) : [],
            };
            return mapToFrontendFormat(parsed);
        });
        res.json({ success: true, data: result, meta: { total, page: Number(page), limit: Number(limit) } });
    }
    catch (error) {
        console.error('获取采购计划列表失败:', error);
        res.status(500).json({ success: false, error: '获取采购计划列表失败' });
    }
});
/**
 * 获取下拉选项（状态/优先级/采购类型）
 * GET /api/purchase-plans/options
 * 1:1 翻译 V1.1 L26-35
 * 必须放在 /:id 之前，否则会被 :id 捕获
 */
router.get('/options', (_req, res) => {
    res.json({
        success: true,
        data: {
            statuses: purchasePlanService.getStatusOptions(),
            priorities: purchasePlanService.getPriorityOptions(),
            purchaseTypes: purchasePlanService.getPurchaseTypeOptions(),
        },
    });
});
/**
 * 按 PA+YYYYMM+4位流水号 规则获取下一个可用的采购申请批次号
 * GET /api/purchase-plans/next-code
 * 1:1 翻译 V1.1 L42-48 service.nextPurchaseApplicationCode
 * 必须放在 /:id 之前
 */
router.get('/next-code', (_req, res) => {
    const result = purchasePlanService.nextPurchaseApplicationCode();
    if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
    }
    res.json(result);
});
/**
 * 获取单个采购计划详情
 * GET /api/purchase-plans/:id
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const items = queryToObjects(db, 'SELECT * FROM purchase_plans WHERE id = ?', [id]);
        if (!items || items.length === 0) {
            return res.status(404).json({ success: false, error: '采购计划不存在' });
        }
        // 解析 attachments 和 items JSON 字段，并映射为前端期望的格式
        const parsed = {
            ...items[0],
            attachments: items[0].attachments ? JSON.parse(items[0].attachments) : [],
            items: items[0].items ? JSON.parse(items[0].items) : [],
        };
        const result = mapToFrontendFormat(parsed);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('获取采购计划详情失败:', error);
        res.status(500).json({ success: false, error: '获取采购计划详情失败' });
    }
});
/**
 * 创建采购计划
 * POST /api/purchase-plans
 */
router.post('/', (req, res) => {
    try {
        // 接受 camelCase 前端字段
        const { id, purchaseApplicationCode = '', purchaseType = '', applicant = '', applicantId = '', applicantDepartment = '', applyDate = '', requiredDate = '', priority = 'normal', status = 'draft', approvalStatus = 'pending', remarks = '', approvalPerson = '', relatedBatchCode = '', attachments = [], items = [], } = req.body;
        const newId = id || `PP${Date.now()}`;
        const now = new Date().toISOString();
        const planCode = purchaseApplicationCode || generatePurchasePlanCode();
        const db = getDatabase();
        db.run(`
      INSERT INTO purchase_plans (
        id, plan_code, plan_title, plan_type,
        department_id, department_name,
        applicant_id, applicant_name,
        apply_date, expected_date,
        supplier_id, supplier_name, total_amount,
        priority, status, approval_status,
        remarks, attachments, items, related_batch_code, approval_person, create_by,
        create_time, update_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            newId,
            planCode,
            `${purchaseType} - ${planCode}`, // plan_title
            purchaseType, // plan_type
            '', // department_id
            applicantDepartment, // department_name
            applicantId, // applicant_id
            applicant, // applicant_name
            applyDate || now.substring(0, 10), // apply_date
            requiredDate || null, // expected_date
            '', // supplier_id
            '', // supplier_name
            0, // total_amount (从 items 计算)
            priority,
            status,
            approvalStatus,
            remarks,
            JSON.stringify(attachments),
            JSON.stringify(items),
            relatedBatchCode, // related_batch_code
            approvalPerson, // approval_person
            applicant, // create_by
            now,
            now,
        ]);
        saveDatabase();
        // 返回完整数据给前端
        const newItems = queryToObjects(db, 'SELECT * FROM purchase_plans WHERE id = ?', [newId]);
        const fullData = newItems.length > 0 ? mapToFrontendFormat({
            ...newItems[0],
            attachments: newItems[0].attachments ? JSON.parse(newItems[0].attachments) : [],
            items: newItems[0].items ? JSON.parse(newItems[0].items) : [],
        }) : { id: newId, plan_code: planCode };
        res.status(201).json({ success: true, data: fullData });
    }
    catch (error) {
        console.error('创建采购计划失败:', error);
        res.status(500).json({ success: false, error: '创建采购计划失败' });
    }
});
/**
 * 字段映射已下沉到 purchasePlanService.FIELD_MAP（V1.1 service.ts L156-185 1:1 翻译）
 * 路由层不再重复定义
 */

/**
 * 更新采购计划
 * PUT /api/purchase-plans/:id
 * ✅ 修复 P0-2: 删除 6 处 console.log 噪音 + 删除重复的 PURCHASE_PLAN_FIELD_MAP
 *               改调 purchasePlanService.update()，字段映射与 V1.1 service.ts FIELD_MAP 统一
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await purchasePlanService.update(id, req.body || {});
        if (!result.success) {
            // V1.1 routes L110-114: 业务校验失败 → 400；不存在 → 404
            let status = 500;
            if (result.error === '采购计划不存在') status = 404;
            else if (result.error?.includes('不允许') || result.error?.includes('没有需要')) status = 400;
            return res.status(status).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result.data });
    }
    catch (error) {
        console.error('更新采购计划失败:', error);
        res.status(500).json({ success: false, error: `更新采购计划失败: ${error.message}` });
    }
});
/**
 * 删除采购计划
 * DELETE /api/purchase-plans/:id
 * ✅ 修复 P0-2: 改调 service.delete()，状态校验由 service.delete() 内部处理（V1.1 service.ts L711-724 业务规则）
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await purchasePlanService.delete(id);
        if (!result.success) {
            const status = result.error === '采购计划不存在' ? 404 : 500;
            return res.status(status).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result.data });
    }
    catch (error) {
        console.error('删除采购计划失败:', error);
        res.status(500).json({ success: false, error: `删除采购计划失败: ${error.message}` });
    }
});
/**
 * 批量删除采购计划
 * POST /api/purchase-plans/batch-delete
 * ✅ 修复 P0-4: 顶层暴露 deleted/skipped（V1.1 前端 store 适配过的格式，V2.0 前端 L837-839 读 result.deleted）
 * 1:1 翻译 V1.1 service.deleteMany
 */
router.post('/batch-delete', async (req, res) => {
    const { ids } = req.body || {};
    const result = await purchasePlanService.deleteMany(ids);
    if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
    }
    // 顶层放 deleted/skipped + message 兼容 V1.1 格式
    res.json({
        success: true,
        deleted: result.data?.deleted || 0,
        skipped: result.data?.skipped || [],
        message: result.message,
    });
});
/**
 * 更新采购执行状态（4 档：pending_execution / purchasing / completed / cancelled）
 * PATCH /api/purchase-plans/:id/execution-status
 * 1:1 翻译 V1.1 service.updateExecutionStatus
 */
router.patch('/:id/execution-status', async (req, res) => {
    const { executionStatus } = req.body || {};
    if (!executionStatus || typeof executionStatus !== 'string') {
        return res.status(400).json({ success: false, error: '执行状态不能为空' });
    }
    const result = await purchasePlanService.updateExecutionStatus(req.params.id, executionStatus);
    if (!result.success) {
        const status = result.error?.includes('不存在') ? 404
            : result.error?.includes('无效') ? 400
                : 500;
        return res.status(status).json(result);
    }
    res.json(result);
});
export default router;
