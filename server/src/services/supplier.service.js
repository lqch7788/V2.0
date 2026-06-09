/**
 * 供应商服务
 */
import { getDatabase, saveDatabase } from '../db/index.js';
export class SupplierService {
    async getSuppliers(params) {
        const db = getDatabase();
        const { keyword, supplierType, status, page = 1, limit = 20 } = params;
        const sql = 'SELECT * FROM suppliers WHERE 1=1';
        const conditions = [];
        const queryParams = [];
        if (keyword) {
            conditions.push('(supplier_name LIKE ? OR contact_person LIKE ? OR contact_phone LIKE ?)');
            const kw = `%${keyword}%`;
            queryParams.push(kw, kw, kw);
        }
        if (supplierType) {
            conditions.push('supplier_type = ?');
            queryParams.push(supplierType);
        }
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
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
        const countSql = `SELECT COUNT(*) as total FROM suppliers WHERE 1=1${whereClause}`;
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
        const stmt = db.prepare('SELECT * FROM suppliers WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const result = stmt.getAsObject();
            stmt.free();
            return result;
        }
        stmt.free();
        return null;
    }
    async create(supplier) {
        const db = getDatabase();
        const now = new Date().toISOString();
        const id = supplier.id || `sup_${Date.now()}`;
        db.run(`
      INSERT INTO suppliers (
        id, supplier_code, supplier_name, contact_person, contact_phone,
        address, supplier_type, status, remarks, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            supplier.supplier_code || `SUP${Date.now()}`,
            supplier.supplier_name || '',
            supplier.contact_person || '',
            supplier.contact_phone || '',
            supplier.address || '',
            supplier.supplier_type || '',
            supplier.status || 'active',
            supplier.remarks || '',
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
        db.run(`UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`, values);
        saveDatabase();
        return true;
    }
    async delete(id) {
        const db = getDatabase();
        db.run('DELETE FROM suppliers WHERE id = ?', [id]);
        saveDatabase();
        return true;
    }
}
export const supplierService = new SupplierService();
