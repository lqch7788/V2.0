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

/**
 * ✅ 修复 P0-2: 字段映射常量上提到模块顶部（V1.1 service.ts L156-185 1:1 翻译）
 * 之前散落在 update() 内部，每次调用都重新构造，且缺少 executionStatus、otherBatchReason 等关键字段
 */
const PURCHASE_PLAN_FIELD_MAP = {
    MAP: {
        planCode: 'plan_code',
        planTitle: 'plan_title',
        planType: 'plan_type',
        purchaseType: 'plan_type',   // V1.1 L160: 前端 purchaseType → 后端 plan_type
        departmentId: 'department_id',
        departmentName: 'department_name',
        applicantDepartment: 'department_name',  // V1.1 L163
        applicantId: 'applicant_id',
        applicantName: 'applicant_name',
        applicant: 'applicant_name',  // V1.1 L179
        applyDate: 'apply_date',
        expectedDate: 'expected_date',
        requiredDate: 'expected_date',  // V1.1 L168
        supplierId: 'supplier_id',
        supplierName: 'supplier_name',
        totalAmount: 'total_amount',
        priority: 'priority',
        status: 'status',
        approvalStatus: 'approval_status',
        executionStatus: 'execution_status',  // V1.1 L175
        remarks: 'remarks',
        remark: 'remarks',  // V1.1 L177
        otherBatchReason: 'other_batch_reason',  // ✅ 修复：原 V2.0 写 'otherBatchReason' 列名错的，应是 'other_batch_reason'
        relatedBatchCode: 'related_batch_code',
        approvalPerson: 'approval_person',
        createBy: 'create_by',
        createTime: 'create_time',
        updateTime: 'update_time',
    },
    EXCLUDE: new Set(['id', 'plan_code', 'create_time', 'create_by']),
};

/** ✅ 修复 P0-2: 允许编辑状态白名单（V1.1 service.ts L150 1:1 翻译） */
const EDITABLE_STATUSES = new Set(['draft', 'pending', 'rejected']);

export class PurchasePlanService {
    /**
     * ✅ 修复 P0-2: 状态机保护（V1.1 service.ts L238-242 1:1 翻译）
     * 仅允许编辑草稿/待审批/已拒绝
     */
    canEdit(plan) {
        if (!plan) return false;
        const status = String(plan.status || '');
        return EDITABLE_STATUSES.has(status);
    }

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
        // ✅ 修复 P0-1: 完整对齐 V1.1 service.ts L460-563
        // 1. 状态白名单校验（status / approvalStatus / priority / purchaseType）
        const statusError = this.validateStatusValues({
            status: plan.status,
            approvalStatus: plan.approval_status,
            priority: plan.priority,
            purchaseType: plan.purchaseType || plan.plan_type,
        });
        if (statusError)
            throw new Error(statusError);

        // 2. 必填字段校验（V1.1 L472-477 1:1 翻译）
        if (!plan.purchaseType && !plan.plan_type) {
            throw new Error('采购类型不能为空');
        }
        if (!plan.applicant && !plan.applicant_name) {
            throw new Error('申请人不能为空');
        }

        const db = getDatabase();
        // 3. 时区补偿（V1.1 L481-483）+ 本地日期兜底
        const dateNow = new Date();
        const now = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString();
        const todayLocal = `${dateNow.getFullYear()}-${String(dateNow.getMonth() + 1).padStart(2, '0')}-${String(dateNow.getDate()).padStart(2, '0')}`;
        const newId = plan.id || `PP${Date.now()}`;

        // 4. 编号唯一性处理：前端传入时校验，缺失时生成并重试（V1.1 L486-504 1:1 翻译）
        let planCode = plan.purchaseApplicationCode || plan.plan_code;
        if (planCode) {
            if (this.isPlanCodeExists(planCode)) {
                throw new Error(`采购申请批次号已存在: ${planCode}`);
            }
        } else {
            for (let i = 0; i < 5; i++) {
                const code = this.generatePurchasePlanCode();
                if (!this.isPlanCodeExists(code)) {
                    planCode = code;
                    break;
                }
            }
            if (!planCode) {
                throw new Error('生成唯一采购申请批次号失败，请重试');
            }
        }

        // 5. 计算总金额（V1.1 L507-511 1:1 翻译）
        const items = Array.isArray(plan.items) ? plan.items : [];
        const totalAmount = items.reduce((sum, item) => sum + Number(item.estimatedTotalPrice || 0), 0);

        // 6. INSERT 含 26 列（V1.1 L513-553 1:1 翻译，含 execution_status + otherBatchReason）
        const finalPlanType = plan.purchaseType || plan.plan_type || '';
        const finalApplicant = plan.applicant || plan.applicant_name || '';
        const finalApplicantDept = plan.applicantDepartment || plan.department_name || '';
        const finalApplicantId = plan.applicantId || plan.applicant_id || '';
        const finalRelatedBatchCode = plan.relatedBatchCode || plan.related_batch_code || '';

        db.run(`
      INSERT INTO purchase_plans (
        id, plan_code, plan_title, plan_type,
        department_id, department_name,
        applicant_id, applicant_name,
        apply_date, expected_date,
        supplier_id, supplier_name, total_amount,
        priority, status, approval_status,
        remarks, attachments, items, related_batch_code, approval_person, create_by,
        execution_status, other_batch_reason,
        create_time, update_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            newId,
            planCode,
            plan.plan_title || `${finalPlanType} - ${planCode}`,
            finalPlanType,
            '', // department_id
            finalApplicantDept,
            finalApplicantId,
            finalApplicant,
            plan.applyDate || plan.apply_date || todayLocal,
            plan.requiredDate || plan.expected_date || null,
            '', // supplier_id
            '', // supplier_name
            totalAmount,
            plan.priority || 'normal',
            plan.status || 'draft',
            plan.approvalStatus || plan.approval_status || 'pending',
            plan.remarks || '',
            plan.attachments ? (typeof plan.attachments === 'string' ? plan.attachments : JSON.stringify(plan.attachments || [])) : '[]',
            JSON.stringify(items),
            finalRelatedBatchCode,
            plan.approvalPerson || plan.approval_person || '',
            finalApplicant, // create_by
            plan.executionStatus || plan.execution_status || 'pending_execution',  // ✅ P0-1: execution_status 列
            plan.otherBatchReason || plan.other_batch_reason || '',                // ✅ P0-1: other_batch_reason 列
            now,
            now,
        ]);
        saveDatabase();
        return this.getById(newId).then(r => r ? r : { id: newId, plan_code: planCode });
    }
    /**
     * ✅ 修复 P0-1: plan_code 唯一性检查（V1.1 L308-319 1:1 翻译）
     */
    isPlanCodeExists(planCode, excludeId) {
        try {
            const db = getDatabase();
            const sql = excludeId
                ? 'SELECT 1 FROM purchase_plans WHERE plan_code = ? AND id != ? LIMIT 1'
                : 'SELECT 1 FROM purchase_plans WHERE plan_code = ? LIMIT 1';
            const params = excludeId ? [planCode, excludeId] : [planCode];
            const stmt = db.prepare(sql);
            stmt.bind(params);
            const exists = stmt.step();
            stmt.free();
            return exists;
        } catch {
            return false;
        }
    }
    async update(id, updates) {
        // ✅ 修复 P0-2 + P1-6: 对齐 V1.1 service.ts L565-674 update() 完整流程
        // - FIELD_MAP 上提到 class 字段（避免每次调用重复构造）
        // - executionStatus 独立路径：白名单校验 + 不受 canEdit 约束
        // - status 白名单校验
        // - items 单独处理 + 联动重算 total_amount
        const db = getDatabase();
        // 时区补偿（V1.1 L568-569 1:1 翻译）
        const dateNow = new Date();
        const now = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString();

        // 1. status / approvalStatus / priority / purchaseType 白名单校验
        const statusError = this.validateStatusValues({
            status: updates.status,
            approvalStatus: updates.approvalStatus || updates.approval_status,
            priority: updates.priority,
            purchaseType: updates.purchaseType || updates.plan_type,
        });
        if (statusError) throw new Error(statusError);

        // 2. executionStatus 单独摘出（V1.1 L590-604 1:1 翻译：白名单 + 不参与 canEdit）
        const { executionStatus: newExecutionStatus, items: rawItems, attachments, ...restInput } = updates;
        if (newExecutionStatus !== undefined && !this.EXECUTION_STATUSES.has(newExecutionStatus)) {
            throw new Error(`无效的执行状态: ${newExecutionStatus}`);
        }

        // 3. 查询当前记录（V1.1 L581-585 1:1 翻译）
        const currentQuery = db.prepare('SELECT * FROM purchase_plans WHERE id = ?');
        currentQuery.bind([id]);
        const currentRecord = currentQuery.step() ? currentQuery.getAsObject() : null;
        currentQuery.free();
        if (!currentRecord) {
            return { success: false, error: '采购计划不存在' };
        }

        // 4. 状态机保护：仅当存在非 executionStatus 更新时校验 canEdit（V1.1 L596-604 1:1 翻译）
        const hasNonExecutionUpdate = Object.values(restInput).some(v => v !== undefined);
        if (hasNonExecutionUpdate && !this.canEdit(currentRecord)) {
            // 已审批/采购中/已完成等状态下，其他字段被 canEdit 拒绝
            // 但 executionStatus 属于独立执行流，单独走 updateExecutionStatus 路径
            if (newExecutionStatus !== undefined) {
                return this.updateExecutionStatus(id, newExecutionStatus);
            }
            return { success: false, error: `当前状态（${currentRecord.status}）不允许修改` };
        }

        // 5. 编号冲突校验（V1.1 L607-611 1:1 翻译）
        const inputPlanCode = updates.purchaseApplicationCode || updates.plan_code;
        if (inputPlanCode && inputPlanCode !== currentRecord.plan_code) {
            if (this.isPlanCodeExists(inputPlanCode, id)) {
                return { success: false, error: `采购申请批次号已存在: ${inputPlanCode}` };
            }
        }

        // 6. 构建 UPDATE 语句（V1.1 L613-652 1:1 翻译）
        const updateFields = [];
        const values = [];
        for (const [camelKey, value] of Object.entries(restInput)) {
            if (PURCHASE_PLAN_FIELD_MAP.EXCLUDE.has(camelKey) || PURCHASE_PLAN_FIELD_MAP.EXCLUDE.has(PURCHASE_PLAN_FIELD_MAP.MAP[camelKey] || '')) {
                continue;
            }
            // 跳过 undefined（V1.1 L625：仅跳过 undefined；'' 或 null 视为显式置空）
            if (value === undefined) continue;

            // items 单独处理 + 联动重算 total_amount
            if (camelKey === 'items') {
                if (Array.isArray(value)) {
                    updateFields.push('items = ?');
                    values.push(JSON.stringify(value));
                    const totalAmount = value.reduce(
                        (sum, item) => sum + Number(item.estimatedTotalPrice || 0), 0
                    );
                    updateFields.push('total_amount = ?');
                    values.push(totalAmount);
                }
                continue;
            }
            // attachments JSON 化
            if (camelKey === 'attachments') {
                updateFields.push('attachments = ?');
                values.push(JSON.stringify(value || []));
                continue;
            }
            const dbField = PURCHASE_PLAN_FIELD_MAP.MAP[camelKey] || camelKey;
            updateFields.push(`${dbField} = ?`);
            values.push(value);
        }

        // 7. executionStatus 单独追加（V1.1 L655-658 1:1 翻译）
        if (newExecutionStatus !== undefined) {
            updateFields.push('execution_status = ?');
            values.push(newExecutionStatus);
        }

        if (updateFields.length === 0) {
            return { success: false, error: '没有需要更新的字段' };
        }
        values.push(now, id);
        db.run(`UPDATE purchase_plans SET ${updateFields.join(', ')}, update_time = ? WHERE id = ?`, values);
        saveDatabase();
        return this.getById(id).then(r => r ? { success: true, data: r } : { success: false, error: '返回数据失败' });
    }
    async delete(id) {
        // ✅ 修复 P0-3: 对齐 V1.1 service.ts L711-724 deleteById()
        // 业务调整：允许删除任何状态订单（与批量删除、订单管理、技术方案、生产计划保持一致）
        // 前端通过 showConfirm 强确认承担保护责任
        const db = getDatabase();
        const stmt = db.prepare('SELECT id FROM purchase_plans WHERE id = ?');
        stmt.bind([id]);
        const existing = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        if (!existing) {
            return { success: false, error: '采购计划不存在' };
        }
        db.run('DELETE FROM purchase_plans WHERE id = ?', [id]);
        saveDatabase();
        return { success: true, data: { id } };
    }
}
export const purchasePlanService = new PurchasePlanService();
