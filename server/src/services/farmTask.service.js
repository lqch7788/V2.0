/**
 * 农事任务服务
 */
import { getDatabase, saveDatabase } from '../db/index.js';
export class FarmTaskService {
    async getTasks(params) {
        const db = getDatabase();
        const { status, assigneeId, greenhouseId, startDate, endDate, keyword, page = 1, limit = 20 } = params;
        const sql = 'SELECT * FROM farm_tasks WHERE 1=1';
        const conditions = [];
        const queryParams = [];
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }
        if (assigneeId) {
            conditions.push('assignee_id = ?');
            queryParams.push(assigneeId);
        }
        if (greenhouseId) {
            conditions.push('greenhouse_id = ?');
            queryParams.push(greenhouseId);
        }
        if (startDate) {
            conditions.push('plan_date >= ?');
            queryParams.push(startDate);
        }
        if (endDate) {
            conditions.push('plan_date <= ?');
            queryParams.push(endDate);
        }
        if (keyword) {
            conditions.push('(title LIKE ? OR content LIKE ?)');
            const kw = `%${keyword}%`;
            queryParams.push(kw, kw);
        }
        const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;
        const finalSql = `${sql}${whereClause} ORDER BY plan_date DESC LIMIT ? OFFSET ?`;
        const stmt = db.prepare(finalSql);
        stmt.bind([...queryParams, limit, offset]);
        const tasks = [];
        while (stmt.step()) {
            tasks.push(stmt.getAsObject());
        }
        stmt.free();
        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM farm_tasks WHERE 1=1${whereClause}`;
        const countStmt = db.prepare(countSql);
        countStmt.bind(queryParams);
        countStmt.step();
        const countResult = countStmt.getAsObject();
        countStmt.free();
        return {
            data: tasks,
            total: countResult.total,
        };
    }
    async getById(id) {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM farm_tasks WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const result = stmt.getAsObject();
            stmt.free();
            return result;
        }
        stmt.free();
        return null;
    }
    async create(task) {
        const db = getDatabase();
        const now = new Date().toISOString();
        const id = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.run(`
      INSERT INTO farm_tasks (
        id, task_code, title, content, task_type, greenhouse_id, greenhouse_name,
        assignee_id, assignee_name, plan_date, status, priority, remarks,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            task.task_code || `FT${Date.now()}`,
            task.title || '',
            task.content || '',
            task.task_type || '',
            task.greenhouse_id || '',
            task.greenhouse_name || '',
            task.assignee_id || '',
            task.assignee_name || '',
            task.plan_date || now.split('T')[0],
            task.status || 'pending',
            task.priority || 'normal',
            task.remarks || '',
            now,
            now,
        ]);
        saveDatabase();
        return id;
    }
    async update(id, updates) {
        const db = getDatabase();
        const now = new Date().toISOString();
        const fields = [];
        const values = [];
        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'created_at') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });
        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);
        db.run(`UPDATE farm_tasks SET ${fields.join(', ')} WHERE id = ?`, values);
        saveDatabase();
        return true;
    }
    async delete(id) {
        const db = getDatabase();
        db.run('DELETE FROM farm_tasks WHERE id = ?', [id]);
        saveDatabase();
        return true;
    }
}
export const farmTaskService = new FarmTaskService();
