/**
 * 临时任务服务
 */
import { getDatabase, saveDatabase } from '../db/index.js';
export class TempTaskService {
    async getTempTasks(params) {
        const db = getDatabase();
        const { executorId, status, priority, startDate, endDate, page = 1, limit = 20 } = params;
        const sql = 'SELECT * FROM temp_tasks WHERE 1=1';
        const conditions = [];
        const queryParams = [];
        if (executorId) {
            conditions.push('executor_id = ?');
            queryParams.push(executorId);
        }
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }
        if (priority) {
            conditions.push('priority = ?');
            queryParams.push(priority);
        }
        if (startDate) {
            conditions.push('created_at >= ?');
            queryParams.push(startDate);
        }
        if (endDate) {
            conditions.push('created_at <= ?');
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
        const countSql = `SELECT COUNT(*) as total FROM temp_tasks WHERE 1=1${whereClause}`;
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
        const stmt = db.prepare('SELECT * FROM temp_tasks WHERE id = ?');
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
        const id = task.id || `temp_${Date.now()}`;
        db.run(`
      INSERT INTO temp_tasks (
        id, task_code, title, content, task_type, executor_id, executor_name,
        greenhouse_id, greenhouse_name, deadline, priority, status, feedback,
        feedback_time, remarks, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            task.task_code || `TT${Date.now()}`,
            task.title || '',
            task.content || '',
            task.task_type || '',
            task.executor_id || '',
            task.executor_name || '',
            task.greenhouse_id || null,
            task.greenhouse_name || null,
            task.deadline || null,
            task.priority || 'normal',
            task.status || 'pending',
            task.feedback || null,
            task.feedback_time || null,
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
        db.run(`UPDATE temp_tasks SET ${fields.join(', ')} WHERE id = ?`, values);
        saveDatabase();
        return true;
    }
    async submitFeedback(id, feedback) {
        const db = getDatabase();
        const now = new Date().toISOString();
        db.run('UPDATE temp_tasks SET feedback = ?, feedback_time = ?, status = ?, updated_at = ? WHERE id = ?', [feedback, now, 'completed', now, id]);
        saveDatabase();
        return true;
    }
    async delete(id) {
        const db = getDatabase();
        db.run('DELETE FROM temp_tasks WHERE id = ?', [id]);
        saveDatabase();
        return true;
    }
}
export const tempTaskService = new TempTaskService();
