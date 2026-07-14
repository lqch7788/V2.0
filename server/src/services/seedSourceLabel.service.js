/**
 * 种源标签 service
 * 标签管理（V1.1 操作列标签管理按钮）：
 *   - 列出标签 (labelCode, status, printCount, createTime, lastPrintTime, useTime)
 *   - 批量生成标签 (count, areaName, startDate)
 *   - 列出标签履历 (action, operator, remark, time)
 *   - 追加标签履历
 */

import { getDatabase, saveDatabase } from '../db/index.js';

/**
 * 列出种源的所有标签
 */
export function listLabels(seedSourceId) {
  const db = getDatabase();
  const stmt = db.prepare(
    `SELECT id, seed_source_id, label_code, status, print_count,
            area_name, start_date, use_time, last_print_time,
            create_time, update_time
     FROM seed_source_labels
     WHERE seed_source_id = ?
     ORDER BY create_time DESC`
  );
  stmt.bind([seedSourceId]);
  const rows = [];
  while (stmt.step()) {
    const r = stmt.getAsObject();
    rows.push({
      id: String(r.id || ''),
      seedSourceId: String(r.seed_source_id || ''),
      labelCode: String(r.label_code || ''),
      status: String(r.status || 'unused'),
      printCount: Number(r.print_count || 0),
      areaName: r.area_name ? String(r.area_name) : null,
      startDate: r.start_date ? String(r.start_date) : null,
      useTime: r.use_time ? String(r.use_time) : null,
      lastPrintTime: r.last_print_time ? String(r.last_print_time) : null,
      createTime: r.create_time ? String(r.create_time) : null,
      updateTime: r.update_time ? String(r.update_time) : null,
    });
  }
  stmt.free();
  return rows;
}

/**
 * 批量生成标签
 */
export function batchGenerateLabels(seedSourceId, count, areaName, startDate) {
  if (!seedSourceId) throw new Error('种源 ID 不能为空');
  const n = Math.max(1, Math.min(1000, Number(count) || 1));
  const db = getDatabase();
  const now = new Date().toISOString();
  const generatedIds = [];

  // 查询现有最大序号
  const countStmt = db.prepare(
    `SELECT COUNT(*) AS cnt FROM seed_source_labels WHERE seed_source_id = ?`
  );
  countStmt.bind([seedSourceId]);
  countStmt.step();
  const cnt = Number(countStmt.getAsObject().cnt || 0);
  countStmt.free();

  for (let i = 0; i < n; i++) {
    const seq = cnt + i + 1;
    const id = `SSL-${seedSourceId}-${String(seq).padStart(4, '0')}`;
    const labelCode = `${seedSourceId}-L${String(seq).padStart(4, '0')}`;
    db.run(
      `INSERT INTO seed_source_labels (
        id, seed_source_id, label_code, status, print_count,
        area_name, start_date, create_time, update_time
      ) VALUES (?, ?, ?, 'unused', 0, ?, ?, ?, ?)`,
      [id, seedSourceId, labelCode, areaName || '', startDate || '', now, now]
    );
    // 写履历
    const resumeId = `RES-${id}-${Date.now().toString(36)}-${i}`;
    db.run(
      `INSERT INTO seed_source_label_resumes (
        id, label_id, action, operator, remark, action_time, create_time
      ) VALUES (?, ?, 'generate', 'system', ?, ?, ?)`,
      [resumeId, id, `批量生成标签 ${labelCode}`, now, now]
    );
    generatedIds.push(id);
  }

  saveDatabase();
  return { generatedCount: n, ids: generatedIds };
}

/**
 * 列出标签履历
 */
export function listLabelResumes(labelId) {
  const db = getDatabase();
  const stmt = db.prepare(
    `SELECT id, label_id, action, operator, remark, action_time, create_time
     FROM seed_source_label_resumes
     WHERE label_id = ?
     ORDER BY action_time DESC, create_time DESC`
  );
  stmt.bind([labelId]);
  const rows = [];
  while (stmt.step()) {
    const r = stmt.getAsObject();
    rows.push({
      id: String(r.id || ''),
      labelId: String(r.label_id || ''),
      action: String(r.action || ''),
      operator: r.operator ? String(r.operator) : '',
      remark: r.remark ? String(r.remark) : '',
      time: r.action_time ? String(r.action_time) : (r.create_time ? String(r.create_time) : ''),
    });
  }
  stmt.free();
  return rows;
}

/**
 * 追加标签履历（用户操作：使用 / 销毁 / 打印等）
 */
export function appendLabelResume(labelId, action, operator, remark) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = `RES-${labelId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  db.run(
    `INSERT INTO seed_source_label_resumes (
      id, label_id, action, operator, remark, action_time, create_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, labelId, action || 'unknown', operator || '', remark || '', now, now]
  );
  // 如果 action = use，更新标签的 use_time
  if (action === 'use') {
    db.run(
      `UPDATE seed_source_labels SET use_time = ?, status = 'used', update_time = ? WHERE id = ?`,
      [now, now, labelId]
    );
  }
  saveDatabase();
  return { id };
}