/**
 * 种植服务
 */
import { getDatabase, saveDatabase } from '../db/index.js';
export class PlantingService {
    async getPlantings(params) {
        const db = getDatabase();
        const { cropName, greenhouseId, status, startDate, endDate, page = 1, limit = 20 } = params;
        const sql = 'SELECT * FROM plantings WHERE 1=1';
        const conditions = [];
        const queryParams = [];
        if (cropName) {
            conditions.push('crop_name LIKE ?');
            queryParams.push(`%${cropName}%`);
        }
        if (greenhouseId) {
            conditions.push('greenhouse_id = ?');
            queryParams.push(greenhouseId);
        }
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }
        if (startDate) {
            conditions.push('planting_date >= ?');
            queryParams.push(startDate);
        }
        if (endDate) {
            conditions.push('planting_date <= ?');
            queryParams.push(endDate);
        }
        const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;
        const finalSql = `${sql}${whereClause} ORDER BY planting_date DESC LIMIT ? OFFSET ?`;
        const stmt = db.prepare(finalSql);
        stmt.bind([...queryParams, limit, offset]);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        const countSql = `SELECT COUNT(*) as total FROM plantings WHERE 1=1${whereClause}`;
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
        const stmt = db.prepare('SELECT * FROM plantings WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const result = stmt.getAsObject();
            stmt.free();
            return result;
        }
        stmt.free();
        return null;
    }
    async create(planting) {
        const db = getDatabase();
        const now = new Date().toISOString();
        const id = planting.id || `plant_${Date.now()}`;
        db.run(`
      INSERT INTO plantings (
        id, planting_code, crop_name, crop_variety, greenhouse_id, greenhouse_name,
        source_id, planting_date, expected_harvest_date, status, remarks,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            planting.planting_code || `PL${Date.now()}`,
            planting.crop_name || '',
            planting.crop_variety || '',
            planting.greenhouse_id || '',
            planting.greenhouse_name || '',
            planting.source_id || '',
            planting.planting_date || now.split('T')[0],
            planting.expected_harvest_date || null,
            planting.status || 'active',
            planting.remarks || '',
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
        db.run(`UPDATE plantings SET ${fields.join(', ')} WHERE id = ?`, values);
        saveDatabase();
        return true;
    }
    async delete(id) {
        const db = getDatabase();
        db.run('DELETE FROM plantings WHERE id = ?', [id]);
        saveDatabase();
        return true;
    }
}
export const plantingService = new PlantingService();
