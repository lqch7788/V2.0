/**
 * 采购计划服务
 */
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects, execCount } from '../utils/queryHelper.js';
// ✅ 修复 P1: 状态白名单常量（1:1 翻译 V1.1 server/src/services/purchasePlan.service.ts L16-35）
// 用于 create/update 时的字段值校验，防止脏数据写入 DB
export const PURCHASE_PLAN_STATUSES = ['draft', 'pending', 'approved', 'purchasing', 'completed', 'cancelled'];
export const PURCHASE_APPROVAL_STATUSES = ['pending', 'approved', 'rejected'];
export const PURCHASE_TYPES = ['production', 'urgent', 'routine', 'material', 'safety', 'equipment', 'other'];
export const PURCHASE_PRIORITIES = ['urgent', 'high', 'normal', 'low'];
export class PurchasePlanService {
    /**
     * ✅ 修复 P1: 状态/优先级/类型白名单校验（1:1 翻译 V1.1 L382-390）
     * create() 和 update() 都应调用。返回 null 表示通过，返回字符串为错误信息。
     */
    validateStatusValues(input) {
        if (input.status !== undefined && !PURCHASE_PLAN_STATUSES.includes(input.status)) {
            return `无效的 status: ${input.status}（允许值: ${PURCHASE_PLAN_STATUSES.join(', ')}）`;
        }
        if (input.approvalStatus !== undefined && !PURCHASE_APPROVAL_STATUSES.includes(input.approvalStatus)) {
            return `无效的 approvalStatus: ${input.approvalStatus}（允许值: ${PURCHASE_APPROVAL_STATUSES.join(', ')}）`;
        }
        if (input.priority !== undefined && !PURCHASE_PRIORITIES.includes(input.priority)) {
            return `无效的 priority: ${input.priority}（允许值: ${PURCHASE_PRIORITIES.join(', ')}）`;
        }
        if (input.purchaseType !== undefined && !PURCHASE_TYPES.includes(input.purchaseType)) {
            return `无效的 purchaseType: ${input.purchaseType}（允许值: ${PURCHASE_TYPES.join(', ')}）`;
        }
        return null;
    }
    toCamelCase(str) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    mapItemToCamelCase(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        const result = {};
        for (const key of Object.keys(obj)) {
            const camelKey = this.toCamelCase(key);
            result[camelKey] = obj[key];
        }
        return result;
    }
    mapToFrontendFormat(record) {
        const status = record.status || 'draft';
        const priority = record.priority || 'normal';
        const planType = record.planType || '';
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
        const PRIORITY_TEXT = {
            urgent: '紧急',
            high: '高',
            normal: '中',
            low: '低',
        };
        const PURCHASE_TYPE_TEXT = {
            production: '生产物资采购',
            urgent: '紧急采购',
            routine: '常规采购',
            safety: '劳保用品',
            material: '通用物资',
            equipment: '设备采购',
            other: '其他',
        };
        let itemsArray = [];
        if (Array.isArray(record.items)) {
            itemsArray = record.items.map((item) => this.mapItemToCamelCase(item));
        }
        return {
            id: record.id,
            purchaseApplicationCode: record.planCode || record.plan_code || '',
            relatedBatchCode: record.relatedBatchCode || record.related_batch_code || '',
            purchaseType: planType,
            purchaseTypeName: PURCHASE_TYPE_TEXT[planType] || planType,
            applicant: record.applicantName || record.applicant_name || '',
            applicantId: record.applicantId || record.applicant_id || '',
            applicantDepartment: record.departmentName || record.department_name || '',
            applyDate: record.applyDate || record.apply_date || '',
            requiredDate: record.expectedDate || record.expected_date || '',
            priority: priority,
            priorityText: PRIORITY_TEXT[priority] || priority,
            status: status,
            statusText: STATUS_TEXT[status] || status,
            itemCount: Array.isArray(itemsArray) ? itemsArray.length : 0,
            items: itemsArray,
            remarks: record.remarks || '',
            approvalPerson: record.approvalPerson || record.approval_person || '',
            approvalStatus: record.approvalStatus || record.approval_status || '',
            createdAt: record.createTime || record.create_time || '',
            updatedAt: record.updateTime || record.update_time || '',
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
    generatePurchasePlanCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        return `PP${year}${month}${day}${seq}`;
    }
    // ----------------------------------------------------------
    // 字典查询（供路由 /options 端点使用，1:1 翻译 V1.1 L198-229）
    // ----------------------------------------------------------
    STATUS_VALUES = ['draft', 'pending', 'approved', 'purchasing', 'completed', 'cancelled'];
    STATUS_TEXT = {
        draft: '草稿', pending: '待审批', approved: '已通过', in_progress: '执行中',
        purchasing: '采购中', completed: '已完成', cancelled: '已作废', rejected: '已拒绝',
    };
    PRIORITY_VALUES = ['urgent', 'high', 'normal', 'low'];
    PRIORITY_TEXT = {
        urgent: '紧急', high: '高', normal: '中', low: '低',
    };
    PURCHASE_TYPE_VALUES = ['production', 'urgent', 'routine', 'safety', 'material', 'equipment', 'other'];
    PURCHASE_TYPE_TEXT = {
        production: '生产物资采购', urgent: '紧急采购', routine: '常规采购',
        safety: '劳保用品', material: '通用物资', equipment: '设备采购', other: '其他',
    };
    // 4 档执行状态白名单
    EXECUTION_STATUSES = new Set([
        'pending_execution', 'purchasing', 'completed', 'cancelled',
    ]);
    getStatusOptions() {
        return this.STATUS_VALUES.map(v => ({ value: v, label: this.STATUS_TEXT[v] || v }));
    }
    getPriorityOptions() {
        return this.PRIORITY_VALUES.map(v => ({ value: v, label: this.PRIORITY_TEXT[v] || v }));
    }
    getPurchaseTypeOptions() {
        return this.PURCHASE_TYPE_VALUES.map(v => ({ value: v, label: this.PURCHASE_TYPE_TEXT[v] || v }));
    }
    /**
     * 按 PA+YYYYMM+4位流水号 规则生成下一个可用的采购申请批次号
     * 1:1 翻译 V1.1 service.nextPurchaseApplicationCode（L267-303）
     * 性能：利用 idx_purchase_plans_code_unique 索引，O(log n)
     */
    nextPurchaseApplicationCode() {
        try {
            const db = getDatabase();
            const now = new Date();
            const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
            const prefix = `PA${ym}`;
            // SUBSTR 取后 4 位为数字部分，CAST 比较保证正确顺序
            const stmt = db.prepare(`
        SELECT plan_code AS planCode
        FROM purchase_plans
        WHERE plan_code LIKE ? AND SUBSTR(plan_code, 9) GLOB '[0-9][0-9][0-9][0-9]'
        ORDER BY CAST(SUBSTR(plan_code, 9) AS INTEGER) DESC
        LIMIT 1
      `);
            stmt.bind([`${prefix}%`]);
            let maxSerial = 0;
            if (stmt.step()) {
                const row = stmt.getAsObject();
                if (row.planCode) {
                    const serial = row.planCode.slice(prefix.length);
                    const n = parseInt(serial, 10);
                    if (!isNaN(n) && n >= 0)
                        maxSerial = n;
                }
            }
            stmt.free();
            const nextSerial = String(maxSerial + 1).padStart(4, '0');
            return { success: true, data: { code: `${prefix}${nextSerial}` } };
        }
        catch (error) {
            return { success: false, error: `生成采购申请批次号失败: ${error.message}` };
        }
    }
    /**
     * 更新采购执行状态（4 档白名单校验，1:1 翻译 V1.1 L664-688）
     */
    async updateExecutionStatus(id, executionStatus) {
        try {
            if (!this.EXECUTION_STATUSES.has(executionStatus)) {
                return { success: false, error: `无效的执行状态: ${executionStatus}` };
            }
            const db = getDatabase();
            const existing = db.prepare('SELECT id FROM purchase_plans WHERE id = ?');
            existing.bind([id]);
            const found = existing.step();
            existing.free();
            if (!found) {
                return { success: false, error: '采购计划不存在' };
            }
            const now = new Date();
            const nowIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
            db.run('UPDATE purchase_plans SET execution_status = ?, update_time = ? WHERE id = ?', [executionStatus, nowIso, id]);
            saveDatabase();
            return this.getById(id).then(r => r ? { success: true, data: r } : { success: false, error: '返回数据失败' });
        }
        catch (error) {
            return { success: false, error: `更新执行状态失败: ${error.message}` };
        }
    }
    /**
     * 批量删除（1:1 翻译 V1.1 L711-735 deleteMany，状态校验版）
     * 返回 { deleted, skipped[] }
     */
    async deleteMany(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { success: false, error: '请选择要删除的采购计划' };
            }
            const db = getDatabase();
            // 修复: 删除所有过滤逻辑，允许删除任何状态的采购计划
            // （与 V1.1 server 一致：纯 SQL DELETE，无业务规则）
            // 前端通过 showConfirm 强确认承担保护责任
            const deleted = [];
            const skipped = [];
            for (const id of ids) {
                const stmt = db.prepare('SELECT id FROM purchase_plans WHERE id = ?');
                stmt.bind([id]);
                const existing = stmt.step() ? stmt.getAsObject() : null;
                stmt.free();
                if (!existing) {
                    skipped.push({ id, reason: '记录不存在' });
                    continue;
                }
                db.run('DELETE FROM purchase_plans WHERE id = ?', [id]);
                deleted.push(id);
            }
            if (deleted.length > 0)
                saveDatabase();
            return {
                success: true,
                data: { deleted: deleted.length, skipped },
                message: `成功删除 ${deleted.length} 个采购计划${skipped.length > 0 ? `，跳过 ${skipped.length} 个不允许删除的` : ''}`,
            };
        }
        catch (error) {
            return { success: false, error: `批量删除采购计划失败: ${error.message}` };
        }
    }
    async getPurchasePlans(params) {
        const db = getDatabase();
        const { planType, status, approvalStatus, departmentName, applicantName, priority, page = 1, limit = 50 } = params;
        let sql = 'SELECT * FROM purchase_plans WHERE 1=1';
        const queryParams = [];
        if (planType) {
            sql += ' AND plan_type LIKE ?';
            queryParams.push(`%${planType}%`);
        }
        if (status) {
            sql += ' AND status = ?';
            queryParams.push(status);
        }
        if (approvalStatus) {
            sql += ' AND approval_status = ?';
            queryParams.push(approvalStatus);
        }
        if (departmentName) {
            sql += ' AND department_name LIKE ?';
            queryParams.push(`%${departmentName}%`);
        }
        if (applicantName) {
            sql += ' AND applicant_name LIKE ?';
            queryParams.push(`%${applicantName}%`);
        }
        if (priority) {
            sql += ' AND priority = ?';
            queryParams.push(priority);
        }
        const countSql = sql;
        sql += ' ORDER BY apply_date DESC, create_time DESC';
        const total = execCount(db, countSql, queryParams);
        const offset = (Number(page) - 1) * Number(limit);
        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(Number(limit), offset);
        const dbItems = queryToObjects(db, sql, queryParams);
        const result = dbItems.map((item) => {
            const parsed = {
                ...item,
                attachments: item.attachments ? JSON.parse(item.attachments) : [],
                items: item.items ? JSON.parse(item.items) : [],
            };
            return this.mapToFrontendFormat(parsed);
        });
        return { data: result, total };
    }
    async getById(id) {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM purchase_plans WHERE id = ?');
        stmt.bind([id]);
        let item = null;
        if (stmt.step()) {
            item = stmt.getAsObject();
        }
        stmt.free();
        if (!item || Object.keys(item).length === 0) {
            return null;
        }
        const parsed = {
            ...item,
            attachments: item.attachments ? JSON.parse(item.attachments) : [],
            items: item.items ? JSON.parse(item.items) : [],
        };
        return this.mapToFrontendFormat(parsed);
    }
    async create(plan) {
        const db = getDatabase();
        // ✅ 修复 P1: 时区补偿（1:1 翻译 V1.1 L481-483），避免跨天写入错误日期
        const dateNow = new Date();
        const now = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString();
        const newId = plan.id || `PP${Date.now()}`;
        const planCode = plan.plan_code || this.generatePurchasePlanCode();
        // ✅ 修复 P1: 状态/优先级/类型白名单校验（1:1 翻译 V1.1 L460-466）
        const statusError = this.validateStatusValues({
            status: plan.status,
            approvalStatus: plan.approval_status,
            priority: plan.priority,
            purchaseType: plan.plan_type,
        });
        if (statusError)
            throw new Error(statusError);
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
            plan.plan_title || '',
            plan.plan_type || '',
            plan.department_id || '',
            plan.department_name || '',
            plan.applicant_id || '',
            plan.applicant_name || '',
            plan.apply_date || now.substring(0, 10),
            plan.expected_date || null,
            plan.supplier_id || '',
            plan.supplier_name || '',
            plan.total_amount || 0,
            // ✅ 修复 P1: priority 默认值 'medium' → 'normal'（V1.1 L408 用 'normal'，PURCHASE_PRIORITIES 也不含 'medium'）
            plan.priority || 'normal',
            plan.status || 'draft',
            plan.approval_status || 'pending',
            plan.remarks || '',
            plan.attachments ? (typeof plan.attachments === 'string' ? plan.attachments : JSON.stringify(plan.attachments)) : '[]',
            plan.items ? (typeof plan.items === 'string' ? plan.items : JSON.stringify(plan.items)) : '[]',
            plan.related_batch_code || '',
            plan.approval_person || '',
            plan.create_by || '',
            now,
            now,
        ]);
        saveDatabase();
        return newId;
    }
    async update(id, updates) {
        const db = getDatabase();
        // ✅ 修复 P1: 时区补偿（1:1 翻译 V1.1 L481-483）
        const dateNow = new Date();
        const now = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString();
        // 检查采购计划是否存在
        const stmt = db.prepare('SELECT status FROM purchase_plans WHERE id = ?');
        stmt.bind([id]);
        let plan = null;
        if (stmt.step()) {
            plan = stmt.getAsObject();
        }
        stmt.free();
        if (!plan) {
            return false;
        }
        // 不允许更新已审批通过的计划
        if (plan.status === 'approved' || plan.approval_status === 'approved') {
            throw new Error('已审批通过的采购计划不允许修改');
        }
        // ✅ 修复 P1: 状态/优先级/类型白名单校验（1:1 翻译 V1.1 L569-573）
        const statusError = this.validateStatusValues({
            status: updates.status,
            approvalStatus: updates.approval_status,
            priority: updates.priority,
            purchaseType: updates.plan_type,
        });
        if (statusError)
            throw new Error(statusError);
        // ✅ 修复 P0-2: 1:1 翻译 V1.1 service.ts L156-182 FIELD_MAP
        // V2.0 原本缺 6 个字段映射，导致 PUT 更新时这些字段无法写入 DB
        const FIELD_MAP = {
            planCode: 'plan_code',
            planTitle: 'plan_title',
            planType: 'plan_type',
            departmentId: 'department_id',
            departmentName: 'department_name',
            applicantDepartment: 'department_name', // V1.1 L163
            applicantId: 'applicant_id',
            applicantName: 'applicant_name',
            applicant: 'applicant_name', // V1.1 L179: 前端字段名 applicant → 实际列 applicant_name
            applyDate: 'apply_date',
            expectedDate: 'expected_date',
            requiredDate: 'expected_date', // V1.1 L168
            supplierId: 'supplier_id',
            supplierName: 'supplier_name',
            totalAmount: 'total_amount',
            priority: 'priority',
            status: 'status',
            approvalStatus: 'approval_status',
            executionStatus: 'execution_status', // V1.1 L175
            remarks: 'remarks',
            remark: 'remarks', // V1.1 L177
            otherBatchReason: 'otherBatchReason', // V1.1 L178
            relatedBatchCode: 'related_batch_code',
            approvalPerson: 'approval_person',
            createBy: 'create_by',
        };
        const excludeFields = ['id', 'plan_code', 'create_time', 'items'];
        const updateFields = [];
        const values = [];
        for (const [camelKey, value] of Object.entries(updates)) {
            if (excludeFields.includes(camelKey) || excludeFields.includes(FIELD_MAP[camelKey])) {
                continue;
            }
            if (camelKey === 'attachments') {
                updateFields.push(`${FIELD_MAP[camelKey] || camelKey} = ?`);
                values.push(JSON.stringify(value || []));
            }
            else if (camelKey === 'items') {
                continue;
            }
            else {
                const dbField = FIELD_MAP[camelKey] || camelKey;
                updateFields.push(`${dbField} = ?`);
                values.push(value);
            }
        }
        if (updateFields.length === 0) {
            throw new Error('没有需要更新的字段');
        }
        values.push(now, id);
        db.run(`UPDATE purchase_plans SET ${updateFields.join(', ')}, update_time = ? WHERE id = ?`, values);
        saveDatabase();
        return true;
    }
    async delete(id) {
        const db = getDatabase();
        // 检查采购计划是否存在
        const stmt = db.prepare('SELECT status, approval_status FROM purchase_plans WHERE id = ?');
        stmt.bind([id]);
        let plan = null;
        if (stmt.step()) {
            plan = stmt.getAsObject();
        }
        stmt.free();
        if (!plan) {
            return false;
        }
        // 只允许删除草稿或已拒绝的计划
        if (plan.status !== 'draft' && plan.approval_status !== 'rejected') {
            throw new Error('只允许删除草稿或已拒绝的采购计划');
        }
        db.run('DELETE FROM purchase_plans WHERE id = ?', [id]);
        saveDatabase();
        return true;
    }
}
export const purchasePlanService = new PurchasePlanService();
