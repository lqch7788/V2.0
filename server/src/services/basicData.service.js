/**
 * 基础数据服务
 * 提供部门、仓库、温室等基础数据的统一访问
 */
import { getDatabase } from '../db/index.js';
export class BasicDataService {
    async getDepartments(params) {
        const db = getDatabase();
        const { parentOid, status } = params;
        const sql = 'SELECT * FROM departments WHERE 1=1';
        const conditions = [];
        const queryParams = [];
        if (parentOid !== undefined) {
            conditions.push('parent_oid = ?');
            queryParams.push(parentOid);
        }
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }
        const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
        const stmt = db.prepare(`${sql}${whereClause} ORDER BY sort_number, name`);
        if (queryParams.length > 0) {
            stmt.bind(queryParams);
        }
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
    async getWarehouses(params) {
        const db = getDatabase();
        const { type, status } = params;
        const sql = 'SELECT * FROM warehouses WHERE 1=1';
        const conditions = [];
        const queryParams = [];
        if (type) {
            conditions.push('type = ?');
            queryParams.push(type);
        }
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }
        const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
        const stmt = db.prepare(`${sql}${whereClause} ORDER BY code, name`);
        if (queryParams.length > 0) {
            stmt.bind(queryParams);
        }
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
    async getGreenhouses(params) {
        const db = getDatabase();
        const { baseOid, crop, status } = params;
        const sql = 'SELECT * FROM greenhouses WHERE 1=1';
        const conditions = [];
        const queryParams = [];
        if (baseOid) {
            conditions.push('base_oid = ?');
            queryParams.push(baseOid);
        }
        if (crop) {
            conditions.push('crop = ?');
            queryParams.push(crop);
        }
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }
        const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
        const stmt = db.prepare(`${sql}${whereClause} ORDER BY code, name`);
        if (queryParams.length > 0) {
            stmt.bind(queryParams);
        }
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
}
export const basicDataService = new BasicDataService();
