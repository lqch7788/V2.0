/**
 * 请假记录服务
 */

import { getDatabase, saveDatabase } from '../db/index.js';

export class LeaveService {
  async getLeaveRecords(params) {
    const db = getDatabase();
    const { workerId, department, status, leaveType, startDate, endDate, page = 1, limit = 20 } = params;

    const sql = 'SELECT * FROM leave_records WHERE 1=1';
    const conditions = [];
    const queryParams = [];

    if (workerId) {
      conditions.push('worker_id = ?');
      queryParams.push(workerId);
    }
    if (department) {
      conditions.push('department = ?');
      queryParams.push(department);
    }
    if (status) {
      conditions.push('status = ?');
      queryParams.push(status);
    }
    if (leaveType) {
      conditions.push('leave_type = ?');
      queryParams.push(leaveType);
    }
    if (startDate) {
      conditions.push('start_date >= ?');
      queryParams.push(startDate);
    }
    if (endDate) {
      conditions.push('end_date <= ?');
      queryParams.push(endDate);
    }

    const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const finalSql = `${sql}${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const stmt = db.prepare(finalSql);
    stmt.bind([...queryParams, limit, offset]);

    const items = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();

    const countSql = `SELECT COUNT(*) as total FROM leave_records WHERE 1=1${whereClause}`;
    const countStmt = db.prepare(countSql);
    countStmt.bind(queryParams);
    countStmt.step();
    const countResult = countStmt.getAsObject();
    countStmt.free();

    return {
      data: items,
      total: countResult.total,
    };
  }

  async getById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM leave_records WHERE id = ?');
    stmt.bind([id]);

    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return null;
  }

  async create(record) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = record.id || `leave_${Date.now()}`;

    db.run(`
      INSERT INTO leave_records (
        id, worker_id, worker_name, department, leave_type,
        start_date, end_date, total_days, reason, substitute_id, substitute_name,
        contact_phone, status, approved_by, approved_time, remarks, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      record.worker_id || '',
      record.worker_name || '',
      record.department || '',
      record.leave_type || 'personal',
      record.start_date || now.split('T')[0],
      record.end_date || now.split('T')[0],
      record.total_days || 1,
      record.reason || '',
      record.substitute_id || null,
      record.substitute_name || null,
      record.contact_phone || null,
      record.status || 'pending',
      record.approved_by || null,
      record.approved_time || null,
      record.remarks || '',
      now,
      now,
    ]);

    saveDatabase();
    return id;
  }

  async approve(id, approvedBy) {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.run(
      'UPDATE leave_records SET status = ?, approved_by = ?, approved_time = ?, updated_at = ? WHERE id = ?',
      ['approved', approvedBy, now, now, id]
    );
    saveDatabase();
    return true;
  }

  async delete(id) {
    const db = getDatabase();
    db.run('DELETE FROM leave_records WHERE id = ?', [id]);
    saveDatabase();
    return true;
  }
}

export const leaveService = new LeaveService();
