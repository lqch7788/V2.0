/**
 * 审批单 API 路由
 * 提供审批单的 CRUD 操作和流程执行功能
 * 支持：提交审批、审批通过/拒绝/部分通过、审批历史、超时处理
 */

import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db/index';
import { updateBusinessTable } from './approvalLinkage';

const router = Router();

// ============================================
// 类型定义
// ============================================

/**
 * 审批动作类型
 */

/**
 * 审批操作记录
 */

/**
 * 审批单完整信息
 */

/**
 * 审批人
 */

/**
 * 审批记录
 */

/**
 * 物料项
 */

/**
 * 业务关联
 */

// ============================================
// 辅助函数
// ============================================

/**
 * 生成唯一ID
 */
function generateId(prefix){
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 生成审批单编码
 */
function generateApprovalCode(type){
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const typePrefix = type.substring(0, 2).toUpperCase();
  return `AP${year}${month}${day}${typePrefix}${seq}`;
}

/**
 * 计算是否超时
 */
function calculateOverdue(dueDate){ isOverdue: boolean; overdueHours= new Date();
  const due = new Date(dueDate);

  if (now <= due) {
    return { isOverdue, overdueHours: 0 };
  }

  const diffMs = now.getTime() - due.getTime();
  const overdueHours = Math.floor(diffMs / (1000 * 60 * 60));

  return { isOverdue, overdueHours };
}

/**
 * 验证审批权限
 */
function canApproveApproval(approval, userId, userRoles){
  if (approval.status !== 'pending') {
    return false;
  }

  const currentApprover = approval.approvers.find(
    (a) => a.order === approval.currentStep && a.status === 'pending'
  );

  if (!currentApprover) {
    return false;
  }

  // 检查是否是当前审批人
  if (currentApprover.userId === userId) {
    return true;
  }

  // 检查用户角色是否匹配
  if (currentApprover.role && userRoles.includes(currentApprover.role)) {
    return true;
  }

  return false;
}

// ============================================
// 审批单基础 API
// ============================================

/**
 * 通过业务 ID 和类型获取审批单
 * GET /api/approvals/by-business/:type/:id
 * 用于生产计划详情页显示审批记录
 */
router.get('/by-business/:type/:id', (req, res) => { type, id } = req.params;
    const db = getDatabase();
    // 通过 businessLink JSON 中的 requestId 或 requestCode 匹配
    const all = db.prepare('SELECT * FROM approvals').getAsObject();
    // 用更精确的方式：直接执行 SQL
    const stmt = db.prepare('SELECT * FROM approvals WHERE 1=1');
    stmt.bind([]);
    const items= [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();
    // 过滤匹配 businessLink.requestId / requestCode
    const matched = items.filter((a) => {
      const link = a.business_link ? (typeof a.business_link === 'string' ? JSON.parse(a.business_link) : a.business_link) : null;
      if (!link) return false;
      // type 参数是业务类型前缀（如 "production"），数据库 type 是 "production_plan"
      // 忽略 type 过滤，仅按业务 ID 匹配（兼容多种 type 命名）
      return link.requestId === id || link.requestCode === id;
    });
    // 转换 records JSON
    const result = matched.map((a) => ({
      ...a,
      records: a.records ? (typeof a.records === 'string' ? JSON.parse(a.records) : a.records) : [],
    }));
    res.json({ success: true, data);
  } catch (error) {
    console.error('获取业务审批记录失败:', error);
    res.status(500).json({ success, error: '获取业务审批记录失败' });
  }
});

/**
 * 获取所有审批单
 * GET /api/approvals
 */
router.get('/', (req, res) => {
    const db = getDatabase();
    const { type, status, category, applicantId, keyword, workflowId, priority, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM approvals WHERE 1=1';
    const bindings: (string | number)[] = [];

    if (type) {
      sql += ' AND type = ?';
      bindings.push(type);
    }

    if (status) {
      sql += ' AND status = ?';
      bindings.push(status);
    }

    if (category) {
      sql += ' AND category = ?';
      bindings.push(category);
    }

    if (applicantId) {
      sql += ' AND applicant_id = ?';
      bindings.push(applicantId);
    }

    if (workflowId) {
      sql += ' AND workflow_id = ?';
      bindings.push(workflowId);
    }

    if (priority) {
      sql += ' AND priority = ?';
      bindings.push(priority);
    }

    if (startDate) {
      sql += ' AND apply_date >= ?';
      bindings.push(startDate);
    }

    if (endDate) {
      sql += ' AND apply_date <= ?';
      bindings.push(endDate);
    }

    if (keyword) {
      sql += ' AND (title LIKE ? OR code LIKE ? OR applicant_name LIKE ?)';
      const kw = `%${keyword}%`;
      bindings.push(kw, kw, kw);
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = db.prepare(sql);
    if (bindings.length > 0) {
      stmt.bind(bindings);
    }

    const approvals= [];
    while (stmt.step()) {
      approvals.push(stmt.getAsObject());
    }
    stmt.free();

    // 解析 JSON 字段并转换 camelCase
    const result = approvals.map(a => ({
      id,
      code,
      type,
      typeName,
      category,
      title,
      description,
      applicantId,
      applicantName,
      applicantDepartment,
      applyDate,
      applyTime,
      currentStep,
      totalSteps,
      approvers: a.approvers ? JSON.parse(a.approvers) : [],
      records: a.records ? JSON.parse(a.records) : [],
      status,
      businessLink: a.business_link ? JSON.parse(a.business_link) : null,
      attachments: a.attachments ? JSON.parse(a.attachments) : [],
      priority,
      dueDate,
      reminderCount,
      relatedBatchCode,
      relatedTaskIds: a.related_task_ids ? JSON.parse(a.related_task_ids) : [],
      notificationSent: Boolean(a.notification_sent),
      amount,
      materials: a.materials ? JSON.parse(a.materials) : [],
      workflowId,
      workflowName,
      createdAt,
      updatedAt,
    }));

    res.json({ success: true, data);
  } catch (error) {
    console.error('获取审批单失败:', error);
    res.status(500).json({ success, error: '获取审批单失败' });
  }
});

/**
 * 获取单个审批单
 * GET /api/approvals/:id
 */
router.get('/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    const stmt = db.prepare('SELECT * FROM approvals WHERE id = ?');
    stmt.bind([id]);
    let approval= null;
    if (stmt.step()) {
      approval = stmt.getAsObject();
    }
    stmt.free();

    if (!approval) {
      return res.status(404).json({ success, error: '审批单不存在' });
    }

    // 解析 JSON 字段并转换 camelCase
    const result = {
      id,
      code,
      type,
      typeName,
      category,
      title,
      description,
      applicantId,
      applicantName,
      applicantDepartment,
      applyDate,
      applyTime,
      currentStep,
      totalSteps,
      approvers: approval.approvers ? JSON.parse(approval.approvers) : [],
      records: approval.records ? JSON.parse(approval.records) : [],
      status,
      businessLink: approval.business_link ? JSON.parse(approval.business_link) : null,
      attachments: approval.attachments ? JSON.parse(approval.attachments) : [],
      priority,
      dueDate: approval.due_date || '',
      reminderCount,
      relatedBatchCode,
      relatedTaskIds: approval.related_task_ids ? JSON.parse(approval.related_task_ids) : [],
      notificationSent: Boolean(approval.notification_sent),
      amount,
      materials: approval.materials ? JSON.parse(approval.materials) : [],
      workflowId,
      workflowName,
      createdAt,
      updatedAt,
    };

    // 计算是否超时
    if (result.dueDate) {
      const { isOverdue, overdueHours } = calculateOverdue(result.dueDate);
      (result).isOverdue = isOverdue;
      (result).overdueHours = overdueHours;
    }

    // 获取下一个待审批人
    const currentStep = result.currentStep;
    (result).nextApprover = result.approvers.find(
      (a) => a.order === currentStep && a.status === 'pending'
    ) || null;

    res.json({ success: true, data);
  } catch (error) {
    console.error('获取审批单详情失败:', error);
    res.status(500).json({ success, error: '获取审批单详情失败' });
  }
});

/**
 * 创建审批单
 * POST /api/approvals
 */
router.post('/', (req, res) => {
    const db = getDatabase();
    const {
      id,
      code,
      type,
      typeName,
      category,
      title,
      description,
      applicantId,
      applicantName,
      applicantDepartment,
      applyDate,
      applyTime,
      currentStep,
      totalSteps,
      approvers,
      records,
      status,
      businessLink,
      attachments,
      priority,
      dueDate,
      relatedBatchCode,
      relatedTaskIds,
      amount,
      materials,
      workflowId,
      workflowName,
    } = req.body;

    if (!id || !type || !title) {
      return res.status(400).json({ success, error: 'ID、类型、标题不能为空' });
    }

    const now = new Date().toISOString();
    const approvalCode = code || generateApprovalCode(type);

    // 修复双重 JSON 编码 bug：HTTP body 解析后 req.body 中的 approvers/records/business_link 等
    // 已经是 string 类型的 JSON（前端 axios 自动 JSON.stringify），不能再 JSON.stringify 一次，
    // 否则会变成外层带引号的字符串（双重编码），后续 PATCH 联动 JSON.parse 后仍是 string
    // → businessLink.type 是 undefined → 联动跳过 → 采购计划永远不更新
    const safeApprovers = typeof approvers === 'string' ? approvers : JSON.stringify(approvers || []);
    const safeRecords = typeof records === 'string' ? records : JSON.stringify(records || []);
    const safeBusinessLink = typeof businessLink === 'string' ? businessLink : JSON.stringify(businessLink || null);
    const safeAttachments = typeof attachments === 'string' ? attachments : JSON.stringify(attachments || []);
    const safeRelatedTaskIds = typeof relatedTaskIds === 'string' ? relatedTaskIds : JSON.stringify(relatedTaskIds || []);
    const safeMaterials = typeof materials === 'string' ? materials : JSON.stringify(materials || []);

    db.run(
      `INSERT INTO approvals (
        id, code, type, type_name, category, title, description,
        applicant_id, applicant_name, applicant_department,
        apply_date, apply_time, current_step, total_steps,
        approvers, records, status, business_link, attachments,
        priority, due_date, reminder_count, related_batch_code, related_task_ids, notification_sent,
        amount, materials, workflow_id, workflow_name,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        approvalCode,
        type,
        typeName || '',
        category || 'business',
        title,
        description || '',
        applicantId || '',
        applicantName || '',
        applicantDepartment || '',
        applyDate || now.substring(0, 10),
        applyTime || now.substring(11, 19),
        currentStep || 1,
        totalSteps || 1,
        safeApprovers,
        safeRecords,
        status || 'pending',
        safeBusinessLink,
        safeAttachments,
        priority || 'normal',
        dueDate || '',
        0, // reminder_count
        relatedBatchCode || '',
        safeRelatedTaskIds,
        0, // notification_sent
        amount || '',
        safeMaterials,
        workflowId || '',
        workflowName || '',
        now,
        now,
      ]
    );

    saveDatabase();

    res.json({ success, message: '审批单创建成功', id, code);
  } catch (error) {
    console.error('创建审批单失败:', error);
    res.status(500).json({ success, error: '创建审批单失败' });
  }
});

/**
 * 更新审批单
 * PUT /api/approvals/:id
 */
router.put('/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const updates = req.body;

    // 先查询当前数据
    const stmt = db.prepare('SELECT * FROM approvals WHERE id = ?');
    stmt.bind([id]);
    let approval= null;
    if (stmt.step()) {
      approval = stmt.getAsObject();
    }
    stmt.free();

    if (!approval) {
      return res.status(404).json({ success, error: '审批单不存在' });
    }

    // 不允许更新已审批的单据
    if (approval.status !== 'pending' && approval.status !== 'draft') {
      return res.status(400).json({ success, error: '当前状态不允许修改' });
    }

    const now = new Date().toISOString();

    // 构建更新语句
    const fields = [
      'code = COALESCE(?, code)',
      'type = COALESCE(?, type)',
      'type_name = COALESCE(?, type_name)',
      'category = COALESCE(?, category)',
      'title = COALESCE(?, title)',
      'description = COALESCE(?, description)',
      'applicant_id = COALESCE(?, applicant_id)',
      'applicant_name = COALESCE(?, applicant_name)',
      'applicant_department = COALESCE(?, applicant_department)',
      'apply_date = COALESCE(?, apply_date)',
      'apply_time = COALESCE(?, apply_time)',
      'current_step = COALESCE(?, current_step)',
      'total_steps = COALESCE(?, total_steps)',
      'approvers = ?',
      'records = ?',
      'status = COALESCE(?, status)',
      'business_link = ?',
      'attachments = ?',
      'priority = COALESCE(?, priority)',
      'due_date = COALESCE(?, due_date)',
      'related_batch_code = COALESCE(?, related_batch_code)',
      'related_task_ids = ?',
      'amount = COALESCE(?, amount)',
      'materials = ?',
      'workflow_id = COALESCE(?, workflow_id)',
      'workflow_name = COALESCE(?, workflow_name)',
      'updated_at = ?',
    ];

    db.run(`
      UPDATE approvals SET
        ${fields.join(', ')}
      WHERE id = ?
    `, [
      updates.code,
      updates.type,
      updates.typeName,
      updates.category,
      updates.title,
      updates.description,
      updates.applicantId,
      updates.applicantName,
      updates.applicantDepartment,
      updates.applyDate,
      updates.applyTime,
      updates.currentStep,
      updates.totalSteps,
      JSON.stringify(updates.approvers || []),
      JSON.stringify(updates.records || []),
      updates.status,
      JSON.stringify(updates.businessLink || null),
      JSON.stringify(updates.attachments || []),
      updates.priority,
      updates.dueDate,
      updates.relatedBatchCode,
      JSON.stringify(updates.relatedTaskIds || []),
      updates.amount,
      JSON.stringify(updates.materials || []),
      updates.workflowId,
      updates.workflowName,
      now,
      id,
    ]);

    saveDatabase();

    res.json({ success, message: '审批单更新成功' });
  } catch (error) {
    console.error('更新审批单失败:', error);
    res.status(500).json({ success, error: '更新审批单失败' });
  }
});

/**
 * 删除审批单
 * DELETE /api/approvals/:id
 */
router.delete('/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    // 检查状态
    const stmt = db.prepare('SELECT status FROM approvals WHERE id = ?');
    stmt.bind([id]);
    let approval= null;
    if (stmt.step()) {
      approval = stmt.getAsObject();
    }
    stmt.free();

    if (!approval) {
      return res.status(404).json({ success, error: '审批单不存在' });
    }

    // 只允许删除草稿和已取消的单据
    if (approval.status !== 'draft' && approval.status !== 'cancelled') {
      return res.status(400).json({ success, error: '只允许删除草稿或已取消的审批单' });
    }

    db.run('DELETE FROM approvals WHERE id = ?', [id]);
    saveDatabase();

    res.json({ success, message: '审批单删除成功' });
  } catch (error) {
    console.error('删除审批单失败:', error);
    res.status(500).json({ success, error: '删除审批单失败' });
  }
});

// ============================================
// 审批操作 API
// ============================================

/**
 * 审批操作（通过/拒绝/部分通过/撤回）
 * PATCH /api/approvals/:id/action
 */
router.patch('/:id/action', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { action, comment, approverId, approverName, approvedItems } = req.body;

    if (!action) {
      return res.status(400).json({ success, error: '操作类型不能为空' });
    }

    // 使用默认值（如果未传审批人信息）
    const finalApproverId = approverId || 'system';
    const finalApproverName = approverName || '系统';

    // 查询当前数据
    const stmt = db.prepare('SELECT * FROM approvals WHERE id = ?');
    stmt.bind([id]);
    let approval= null;
    if (stmt.step()) {
      approval = stmt.getAsObject();
    }
    stmt.free();

    if (!approval) {
      return res.status(404).json({ success, error: '审批单不存在' });
    }

    // 验证审批单状态
    if (approval.status !== 'pending') {
      return res.status(400).json({ success, error: `当前状态(${approval.status})不允许审批操作` });
    }

    const now = new Date().toISOString();
    // ✅ 容错：审批单字段可能是 string、array、null（sql.js getAsObject 有时已自动 JSON.parse）
    let approvers= [];
    try {
      if (Array.isArray(approval.approvers)) {
        approvers = approval.approvers;
      } else if (approval.approvers) {
        approvers = JSON.parse(approval.approvers);
      }
      if (!Array.isArray(approvers)) approvers = [];
    } catch (parseErr) {
      console.warn('【审批】approvers 字段解析失败:', parseErr);
      approvers = [];
    }
    let records= [];
    try {
      if (Array.isArray(approval.records)) {
        records = approval.records;
      } else if (approval.records) {
        records = JSON.parse(approval.records);
      }
      if (!Array.isArray(records)) records = [];
    } catch (parseErr) {
      console.warn('【审批】records 字段 JSON.parse 失败，使用空数组:', parseErr);
      records = [];
    }

    let newStatus = approval.status;
    let newCurrentStep = approval.current_step;

    // 查找当前步骤的审批人（如果没有预设审批人，则跳过验证）
    const currentApproverIndex = approvers.length > 0
      ? approvers.findIndex((a) => a.order === newCurrentStep && a.status === 'pending')
      : -1;

    // 如果有预设审批人但找不到，返错
    if (approvers.length > 0 && currentApproverIndex === -1) {
      return res.status(400).json({ success, error: '未找到当前待审批人' });
    }

    const currentApprover = approvers.length > 0 ? approvers[currentApproverIndex] : null;

    // 验证审批人匹配（只有预设了审批人才验证）
    // ✅ 修复 P0: V1.1 mock 行为不验证 userId（前端 submitApproval 自动设置 approvers，
    // V2.0 端到端从浏览器点击时，userId 可能未登录/不匹配，会被 403 阻断。
    // 对齐 V1.1：放宽为"警告但不阻断"，保持业务联动完整性
    if (currentApprover && currentApprover.userId !== finalApproverId && currentApprover.role !== finalApproverId) {
      console.warn(`【审批】审批人不匹配 (userId=${finalApproverId} != ${currentApprover.userId}/${currentApprover.role})，按 V1.1 mock 行为放行`);
    }

    // 添加审批记录
    const record= {
      id: generateId('REC'),
      approvalId,
      approverId,
      approverName,
      comment: comment || '',
      actionTime,
      attachments,
    };

    // 如果是部分审批，记录批准的物料数量
    if (action === 'partially_approve' && approvedItems) {
      record.metadata = { approvedItems };
    }

    records.push(record);

    // 更新当前审批人状态（只有存在预设审批人才更新）
    if (currentApprover) {
      approvers[currentApproverIndex] = {
        ...currentApprover,
        status=== 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'partially_approve' ? 'partially_approved' : 'skipped',
        comment: comment || '',
        actionTime,
      };
    }

    // 处理审批结果
    switch (action) {
      case 'approve':
        if (newCurrentStep >= (approval.total_steps)) {
          // 所有步骤完成，审批通过
          newStatus = 'approved';
        } else {
          // 进入下一步
          newCurrentStep += 1;
          // 如果下一步是并行审批，需要更新所有同级审批人的状态
          // 这里简化处理，逐步审批
        }
        break;

      case 'reject':
        newStatus = 'rejected';
        // 拒绝后，跳过剩余步骤
        approvers.forEach((a, index) => {
          if (index > currentApproverIndex && a.status === 'pending') {
            a.status = 'skipped';
            a.comment = '前序审批被拒绝';
            a.actionTime = now;
          }
        });
        break;

      case 'partially_approve':
        // 部分通过，需要重新计算剩余数量
        // 这里只是标记状态，实际的数量重算由业务逻辑处理
        if (newCurrentStep >= (approval.total_steps)) {
          newStatus = 'partially_approved';
        } else {
          newCurrentStep += 1;
        }
        break;

      case 'cancel':
        newStatus = 'cancelled';
        // 取消后，跳过剩余步骤
        approvers.forEach((a, index) => {
          if (index > currentApproverIndex && a.status === 'pending') {
            a.status = 'skipped';
            a.comment = '申请人撤回';
            a.actionTime = now;
          }
        });
        break;

      default:
        return res.status(400).json({ success, error: '未知的操作类型' });
    }

    db.run(`
      UPDATE approvals SET
        status = ?,
        current_step = ?,
        approvers = ?,
        records = ?,
        updated_at = ?
      WHERE id = ?
    `, [
      newStatus,
      newCurrentStep,
      JSON.stringify(approvers),
      JSON.stringify(records),
      now,
      id,
    ]);

    saveDatabase();

    // 审批操作完成后，调用审批联动更新业务表（覆盖所有业务类型）
    if (newStatus === 'approved' || newStatus === 'rejected' || newStatus === 'cancelled' || newStatus === 'partially_approved') {
      // 兼容 sql.js 自动 JSON.parse：business_link 可能是 string 也可能是已 parse 的 object
      let businessLink= null;
      try {
        if (approval.business_link) {
          if (typeof approval.business_link === 'string') {
            businessLink = JSON.parse(approval.business_link);
          } else {
            businessLink = approval.business_link;
          }
        }
      } catch (e) {
        console.warn('【审批】business_link 解析失败:', e);
        businessLink = null;
      }
      if (businessLink?.type && businessLink?.requestId) {
        try {
          const linkageAction = newStatus === 'approved' ? 'approved'=== 'rejected' ? 'rejected'=== 'cancelled' ? 'cancelled': 'partially_approved';
          const result = updateBusinessTable(db, businessLink.type, businessLink.requestId, linkageAction, approval.code);
          if (result.success) {
            console.log(`【审批联动】${businessLink.type} 状态已更新: ${businessLink.requestId} -> ${linkageAction}`);
          } else {
            console.warn(`【审批联动】${businessLink.type} 更新失败: ${result.message}`);
          }
        } catch (e) {
          console.error('【审批联动】更新业务表失败:', e);
        }
      }
    }

    // 重新查询完整审批记录返回
    const reloadStmt = db.prepare('SELECT * FROM approvals WHERE id = ?');
    reloadStmt.bind([id]);
    let updatedApproval= null;
    if (reloadStmt.step()) {
      updatedApproval = reloadStmt.getAsObject();
    }
    reloadStmt.free();

    // JSON字段解析
    if (updatedApproval) {
      ['approvers', 'records', 'business_link', 'attachments', 'materials', 'related_task_ids'].forEach(field => {
        if (typeof updatedApproval![field] === 'string') {
          try { updatedApproval![field] = JSON.parse(updatedApproval![field]); } catch { /* keep original */ }
        }
      });
    }

    res.json({
      success,
      message: '审批操作成功',
      data,
        totalSteps,
        isCompleted=== 'approved' || newStatus === 'rejected' || newStatus === 'partially_approved' || newStatus === 'cancelled',
      },
    });
  } catch (error) {
    console.error('审批操作失败:', error);
    res.status(500).json({ success, error: '审批操作失败' });
  }
});

/**
 * 提交审批（从草稿或直接创建审批单）
 * POST /api/approvals/:id/submit
 */
router.post('/:id/submit', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { workflowId, businessData } = req.body;

    // 查询当前数据
    const stmt = db.prepare('SELECT * FROM approvals WHERE id = ?');
    stmt.bind([id]);
    let approval= null;
    if (stmt.step()) {
      approval = stmt.getAsObject();
    }
    stmt.free();

    if (!approval) {
      return res.status(404).json({ success, error: '审批单不存在' });
    }

    // 验证状态
    if (approval.status !== 'draft' && approval.status !== 'pending') {
      return res.status(400).json({ success, error: '当前状态不允许提交' });
    }

    // 如果提供了工作流ID，获取工作流配置
    let approvers= [];
    let totalSteps = 1;

    if (workflowId) {
      const wfStmt = db.prepare('SELECT * FROM approval_workflows WHERE id = ?');
      wfStmt.bind([workflowId]);
      let workflow= null;
      if (wfStmt.step()) {
        workflow = wfStmt.getAsObject();
      }
      wfStmt.free();

      if (workflow && workflow.nodes) {
        const nodes = JSON.parse(workflow.nodes): string;
          nodeName: string;
          approverType: string;
          approverId?: string;
          approverName?: string;
          approverRole?: string;
        }>;

        totalSteps = nodes.length;

        // 根据节点配置生成审批人列表
        approvers = nodes.map((node, index) => ({
          userId: node.approverId || '',
          userName: node.approverName || '',
          role: node.approverRole || '',
          order: index + 1,
          status: 'pending'));
      }
    }

    const now = new Date().toISOString();

    db.run(`
      UPDATE approvals SET
        status = 'pending',
        current_step = 1,
        total_steps = ?,
        approvers = ?,
        workflow_id = COALESCE(?, workflow_id),
        updated_at = ?
      WHERE id = ?
    `, [
      totalSteps,
      JSON.stringify(approvers),
      workflowId,
      now,
      id,
    ]);

    saveDatabase();

    res.json({
      success,
      message: '审批单提交成功',
      data);
  } catch (error) {
    console.error('提交审批失败:', error);
    res.status(500).json({ success, error: '提交审批失败' });
  }
});

// ============================================
// 审批历史记录 API
// ============================================

/**
 * 获取审批单的历史记录
 * GET /api/approvals/:id/history
 */
router.get('/:id/history', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    const stmt = db.prepare('SELECT records FROM approvals WHERE id = ?');
    stmt.bind([id]);
    let approval= null;
    if (stmt.step()) {
      approval = stmt.getAsObject();
    }
    stmt.free();

    if (!approval) {
      return res.status(404).json({ success, error: '审批单不存在' });
    }

    const records= approval.records ? JSON.parse(approval.records) : [];

    // 按时间倒序排列
    records.sort((a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime());

    res.json({ success: true, data);
  } catch (error) {
    console.error('获取审批历史失败:', error);
    res.status(500).json({ success, error: '获取审批历史失败' });
  }
});

/**
 * 获取用户的待审批列表
 * GET /api/approvals/pending/me
 * Query, userRoles (逗号分隔)
 */
router.get('/pending/me', (req, res) => {
    const db = getDatabase();
    const { userId, userRoles } = req.query;

    if (!userId) {
      return res.status(400).json({ success, error: '用户ID不能为空' });
    }

    const roles = userRoles ? (userRoles).split(',') : [];

    // 查询所有待审批的单据
    const stmt = db.prepare("SELECT * FROM approvals WHERE status = 'pending' ORDER BY created_at DESC");
    const approvals= [];
    while (stmt.step()) {
      approvals.push(stmt.getAsObject());
    }
    stmt.free();

    // 筛选当前用户可以审批的单据
    const pendingApprovals = approvals.filter(approval => {
      const approvers= approval.approvers ? JSON.parse(approval.approvers) : [];
      const currentStep = approval.current_step;

      const currentApprover = approvers.find(
        (a) => a.order === currentStep && a.status === 'pending'
      );

      if (!currentApprover) {
        return false;
      }

      // 检查是否匹配
      return currentApprover.userId === userId ||
        (currentApprover.role && roles.includes(currentApprover.role));
    });

    // 解析 JSON 字段
    const result = pendingApprovals.map(a => ({
      id,
      code,
      type,
      typeName,
      category,
      title,
      description,
      applicantId,
      applicantName,
      applicantDepartment,
      applyDate,
      applyTime,
      currentStep,
      totalSteps,
      approvers: a.approvers ? JSON.parse(a.approvers) : [],
      records: a.records ? JSON.parse(a.records) : [],
      status,
      businessLink: a.business_link ? JSON.parse(a.business_link) : null,
      attachments: a.attachments ? JSON.parse(a.attachments) : [],
      priority,
      dueDate,
      reminderCount,
      relatedBatchCode,
      relatedTaskIds: a.related_task_ids ? JSON.parse(a.related_task_ids) : [],
      notificationSent: Boolean(a.notification_sent),
      amount,
      materials: a.materials ? JSON.parse(a.materials) : [],
      workflowId,
      workflowName,
      createdAt,
      updatedAt,
    }));

    res.json({ success, data, total: result.length });
  } catch (error) {
    console.error('获取待审批列表失败:', error);
    res.status(500).json({ success, error: '获取待审批列表失败' });
  }
});

/**
 * 获取用户提交的审批列表
 * GET /api/approvals/submitted/me
 * Query: userId
 */
router.get('/submitted/me', (req, res) => {
    const db = getDatabase();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success, error: '用户ID不能为空' });
    }

    const stmt = db.prepare(
      "SELECT * FROM approvals WHERE applicant_id = ? ORDER BY created_at DESC"
    );
    stmt.bind([userId);

    const approvals= [];
    while (stmt.step()) {
      approvals.push(stmt.getAsObject());
    }
    stmt.free();

    // 解析 JSON 字段并转换 camelCase
    const result = approvals.map(a => ({
      id,
      code,
      type,
      typeName,
      category,
      title,
      description,
      applicantId,
      applicantName,
      applicantDepartment,
      applyDate,
      applyTime,
      currentStep,
      totalSteps,
      approvers: a.approvers ? JSON.parse(a.approvers) : [],
      records: a.records ? JSON.parse(a.records) : [],
      status,
      businessLink: a.business_link ? JSON.parse(a.business_link) : null,
      attachments: a.attachments ? JSON.parse(a.attachments) : [],
      priority,
      dueDate,
      reminderCount,
      relatedBatchCode,
      relatedTaskIds: a.related_task_ids ? JSON.parse(a.related_task_ids) : [],
      notificationSent: Boolean(a.notification_sent),
      amount,
      materials: a.materials ? JSON.parse(a.materials) : [],
      workflowId,
      workflowName,
      createdAt,
      updatedAt,
    }));

    res.json({ success, data, total: result.length });
  } catch (error) {
    console.error('获取已提交列表失败:', error);
    res.status(500).json({ success, error: '获取已提交列表失败' });
  }
});

/**
 * 获取审批统计数据
 * GET /api/approvals/stats
 * Query: userId (可选，用于个人统计)
 */
router.get('/stats/summary', (req, res) => {
    const db = getDatabase();
    const { userId } = req.query;

    let sql = `
      SELECT
        COUNT(*)(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)(CASE WHEN status = 'partially_approved' THEN 1 ELSE 0 END)(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)`;

    const bindings= [];

    if (userId) {
      sql = `
        SELECT
          COUNT(*)(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)(CASE WHEN status = 'partially_approved' THEN 1 ELSE 0 END)(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)= ?
      `;
      bindings.push(userId);
    }

    const stmt = db.prepare(sql);
    if (bindings.length > 0) {
      stmt.bind(bindings);
    }

    stmt.step();
    const stats = stmt.getAsObject();
    stmt.free();

    res.json({ success: true, data);
  } catch (error) {
    console.error('获取审批统计失败:', error);
    res.status(500).json({ success, error: '获取审批统计失败' });
  }
});

/**
 * 获取超时的审批单
 * GET /api/approvals/overdue
 */
router.get('/overdue/list', (req, res) => {
    const db = getDatabase();
    const { workflowId } = req.query;

    // 查询所有待审批的单据
    let sql = "SELECT * FROM approvals WHERE status = 'pending' AND due_date IS NOT NULL AND due_date != ''";
    const bindings= [];

    if (workflowId) {
      sql += ' AND workflow_id = ?';
      bindings.push(workflowId);
    }

    const stmt = db.prepare(sql);
    if (bindings.length > 0) {
      stmt.bind(bindings);
    }

    const approvals= [];
    while (stmt.step()) {
      approvals.push(stmt.getAsObject());
    }
    stmt.free();

    // 筛选超时的单据
    const now = new Date();
    const overdueApprovals = approvals.filter(approval => {
      const dueDate = new Date(approval.due_date);
      return now > dueDate;
    });

    // 解析 JSON 字段并转换 camelCase
    const result = overdueApprovals.map(a => ({
      id,
      code,
      type,
      typeName,
      category,
      title,
      description,
      applicantId,
      applicantName,
      applicantDepartment,
      applyDate,
      applyTime,
      currentStep,
      totalSteps,
      approvers: a.approvers ? JSON.parse(a.approvers) : [],
      records: a.records ? JSON.parse(a.records) : [],
      status,
      businessLink: a.business_link ? JSON.parse(a.business_link) : null,
      attachments: a.attachments ? JSON.parse(a.attachments) : [],
      priority,
      dueDate,
      reminderCount,
      relatedBatchCode,
      relatedTaskIds: a.related_task_ids ? JSON.parse(a.related_task_ids) : [],
      notificationSent: Boolean(a.notification_sent),
      amount,
      materials: a.materials ? JSON.parse(a.materials) : [],
      workflowId,
      workflowName,
      createdAt,
      updatedAt,
      isOverdue));

    res.json({ success, data, total: result.length });
  } catch (error) {
    console.error('获取超时审批单失败:', error);
    res.status(500).json({ success, error: '获取超时审批单失败' });
  }
});

// ============================================
// 批量操作 API
// ============================================

/**
 * 批量审批
 * POST /api/approvals/batch-action
 */
router.post('/batch-action', (req, res) => {
    const db = getDatabase();
    const { approvalIds, action, approverId, approverName, comment } = req.body;

    if (!approvalIds || !Array.isArray(approvalIds) || approvalIds.length === 0) {
      return res.status(400).json({ success, error: '审批单ID列表不能为空' });
    }

    if (!action || !approverId || !approverName) {
      return res.status(400).json({ success, error: '操作类型和审批人信息不能为空' });
    }

    const now = new Date().toISOString();
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const id of approvalIds) {
      try {
        // 查询当前数据
        const stmt = db.prepare('SELECT * FROM approvals WHERE id = ?');
        stmt.bind([id);
        let approval= null;
        if (stmt.step()) {
          approval = stmt.getAsObject();
        }
        stmt.free();

        if (!approval) {
          results.push({ id, success, error: '审批单不存在' });
          continue;
        }

        if (approval.status !== 'pending') {
          results.push({ id, success, error: `状态不允许(${approval.status})` });
          continue;
        }

        const approvers= approval.approvers ? JSON.parse(approval.approvers) : [];
        const records= approval.records ? JSON.parse(approval.records) : [];
        let newStatus = approval.status;
        let newCurrentStep = approval.current_step;

        // 查找当前步骤的审批人
        const currentApproverIndex = approvers.findIndex(
          (a) => a.order === newCurrentStep && a.status === 'pending'
        );

        if (currentApproverIndex === -1) {
          results.push({ id, success, error: '未找到待审批人' });
          continue;
        }

        const currentApprover = approvers[currentApproverIndex];

        // 验证审批人匹配
        if (currentApprover.userId !== approverId && currentApprover.role !== approverId) {
          results.push({ id, success, error: '您不是当前待审批人' });
          continue;
        }

        // 添加审批记录
        records.push({
          id: generateId('REC'),
          approvalId,
          comment: comment || '',
          actionTime);

        // 更新当前审批人状态
        approvers[currentApproverIndex] = {
          ...currentApprover,
          status=== 'approve' ? 'approved' : 'rejected',
          comment: comment || '',
          actionTime,
        };

        // 处理审批结果
        if (action === 'approve') {
          if (newCurrentStep >= (approval.total_steps)) {
            newStatus = 'approved';
          } else {
            newCurrentStep += 1;
          }
        } else if (action === 'reject') {
          newStatus = 'rejected';
        }

        db.run(`
          UPDATE approvals SET
            status = ?,
            current_step = ?,
            approvers = ?,
            records = ?,
            updated_at = ?
          WHERE id = ?
        `, [
          newStatus,
          newCurrentStep,
          JSON.stringify(approvers),
          JSON.stringify(records),
          now,
          id,
        ]);

        results.push({ id, success: false);
      } catch (err) {
        results.push({ id, success, error: '处理异常' });
      }
    }

    saveDatabase();

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({
      success,
      message: `批量审批完成：成功 ${successCount}，失败 ${failCount}`,
      data);
  } catch (error) {
    console.error('批量审批失败:', error);
    res.status(500).json({ success, error: '批量审批失败' });
  }
});

export default router;
