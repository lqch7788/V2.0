/**
 * 通知服务
 */
import { getDatabase, saveDatabase } from '../db/index.js';
export class NotificationService {
    async getNotifications(params) {
        const db = getDatabase();
        const { receiverId, isRead, type, page = 1, limit = 20 } = params;
        const sql = 'SELECT * FROM notifications WHERE receiver_id = ?';
        const conditions = ['receiver_id = ?'];
        const queryParams = [receiverId];
        if (isRead !== undefined) {
            conditions.push('is_read = ?');
            queryParams.push(isRead);
        }
        if (type) {
            conditions.push('type = ?');
            queryParams.push(type);
        }
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        const offset = (page - 1) * limit;
        const finalSql = `SELECT * FROM notifications${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const stmt = db.prepare(finalSql);
        stmt.bind([...queryParams, limit, offset]);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM notifications${whereClause}`;
        const countStmt = db.prepare(countSql);
        countStmt.bind(queryParams);
        countStmt.step();
        const countResult = countStmt.getAsObject();
        countStmt.free();
        // 获取未读数
        const unreadStmt = db.prepare('SELECT COUNT(*) as unread FROM notifications WHERE receiver_id = ? AND is_read = 0');
        unreadStmt.bind([receiverId]);
        unreadStmt.step();
        const unreadResult = unreadStmt.getAsObject();
        unreadStmt.free();
        return {
            data: items,
            total: countResult.total,
            unread: unreadResult.unread,
        };
    }
    async create(notification) {
        const db = getDatabase();
        const now = new Date().toISOString();
        const id = notification.id || `notif_${Date.now()}`;
        db.run(`
      INSERT INTO notifications (
        id, receiver_id, receiver_name, title, content, type,
        related_id, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            notification.receiver_id || '',
            notification.receiver_name || '',
            notification.title || '',
            notification.content || '',
            notification.type || 'system',
            notification.related_id || null,
            0,
            now,
        ]);
        saveDatabase();
        return id;
    }
    async markAsRead(id) {
        const db = getDatabase();
        const now = new Date().toISOString();
        db.run('UPDATE notifications SET is_read = 1, read_time = ? WHERE id = ?', [now, id]);
        saveDatabase();
        return true;
    }
    async markAllAsRead(receiverId) {
        const db = getDatabase();
        const now = new Date().toISOString();
        db.run('UPDATE notifications SET is_read = 1, read_time = ? WHERE receiver_id = ? AND is_read = 0', [now, receiverId]);
        saveDatabase();
        return true;
    }
    async delete(id) {
        const db = getDatabase();
        db.run('DELETE FROM notifications WHERE id = ?', [id]);
        saveDatabase();
        return true;
    }
}
export const notificationService = new NotificationService();
