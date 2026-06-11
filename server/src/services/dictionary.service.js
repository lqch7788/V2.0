/**
 * 数据字典服务
 * 提供字典、系统配置、仓库、基地、温室等基础数据的统一访问
 */
import { getDatabase, saveDatabase } from '../db/index.js';
export class DictionaryService {
    // ============================================
    // 数据字典管理
    // ============================================
    async getDictionaries(params) {
        const db = getDatabase();
        const { category, status = 'active' } = params;
        let sql = 'SELECT * FROM dictionaries WHERE status = ?';
        const bindings = [status];
        if (category) {
            sql += ' AND category_code = ?';
            bindings.push(category);
        }
        sql += ' ORDER BY category_code, sort_order ASC';
        const stmt = db.prepare(sql);
        stmt.bind(bindings);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
    async getDictionaryCategories() {
        const db = getDatabase();
        const sql = 'SELECT DISTINCT category_code FROM dictionaries WHERE status = ? ORDER BY category_code';
        const stmt = db.prepare(sql);
        stmt.bind(['active']);
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row.category_code);
        }
        stmt.free();
        return results;
    }
    async saveDictionaries(data) {
        const db = getDatabase();
        const { inserted = [], updated = [], deleted = [] } = data;
        const now = new Date().toISOString();
        const result = {
            inserted: [],
            updated: [],
            deleted: [],
        };
        // 处理新增
        for (const dict of inserted) {
            const id = dict.id || `DICT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            db.run(`INSERT INTO dictionaries (id, category_code, dict_code, dict_label, dict_value, display_name, sort_order, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                dict.category_code || '',
                dict.dict_code || '',
                dict.dict_label || '',
                dict.dict_value || dict.dict_label || '',
                dict.display_name || dict.dict_label || '',
                dict.sort_order || 0,
                'active',
                now,
                now,
            ]);
            result.inserted.push({ ...dict, id });
        }
        // 处理更新
        for (const dict of updated) {
            db.run(`UPDATE dictionaries SET category_code = ?, dict_code = ?, dict_label = ?, dict_value = ?, display_name = ?, sort_order = ?, updated_at = ?
         WHERE id = ?`, [
                dict.category_code || '',
                dict.dict_code || '',
                dict.dict_label || '',
                dict.dict_value || dict.dict_label || '',
                dict.display_name || dict.dict_label || '',
                dict.sort_order || 0,
                now,
                dict.id || '',
            ]);
            result.updated.push(dict);
        }
        // 处理删除
        for (const id of deleted) {
            db.run('UPDATE dictionaries SET status = ? WHERE id = ?', ['inactive', id]);
            result.deleted.push(id);
        }
        saveDatabase();
        return result;
    }
    // ============================================
    // 系统配置管理
    // ============================================
    async getSystemConfigs(params) {
        const db = getDatabase();
        const { configKey, status = 'active' } = params;
        let sql = 'SELECT * FROM system_configs WHERE status = ?';
        const bindings = [status];
        if (configKey) {
            sql += ' AND config_key = ?';
            bindings.push(configKey);
        }
        sql += ' ORDER BY config_key ASC';
        const stmt = db.prepare(sql);
        stmt.bind(bindings);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
    async saveSystemConfigs(data) {
        const db = getDatabase();
        const { inserted = [], updated = [], deleted = [] } = data;
        const now = new Date().toISOString();
        const result = {
            inserted: [],
            updated: [],
            deleted: [],
        };
        // 处理新增
        for (const config of inserted) {
            const id = config.id || `CFG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            db.run(`INSERT INTO system_configs (id, config_key, config_value, config_type, description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                config.config_key || '',
                config.config_value || '',
                config.config_type || 'string',
                config.description || null,
                'active',
                now,
                now,
            ]);
            result.inserted.push({ ...config, id });
        }
        // 处理更新
        for (const config of updated) {
            db.run(`UPDATE system_configs SET config_key = ?, config_value = ?, config_type = ?, description = ?, updated_at = ?
         WHERE id = ?`, [
                config.config_key || '',
                config.config_value || '',
                config.config_type || 'string',
                config.description || null,
                now,
                config.id || '',
            ]);
            result.updated.push(config);
        }
        // 处理删除
        for (const id of deleted) {
            db.run('UPDATE system_configs SET status = ? WHERE id = ?', ['inactive', id]);
            result.deleted.push(id);
        }
        saveDatabase();
        return result;
    }
    // ============================================
    // 仓库管理
    // ============================================
    async getWarehouses(params) {
        const db = getDatabase();
        const { status = 'active' } = params;
        const sql = 'SELECT * FROM warehouses WHERE status = ? ORDER BY warehouse_code ASC';
        const stmt = db.prepare(sql);
        stmt.bind([status]);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
    async saveWarehouses(data) {
        const db = getDatabase();
        const { inserted = [], updated = [], deleted = [] } = data;
        const now = new Date().toISOString();
        const result = {
            inserted: [],
            updated: [],
            deleted: [],
        };
        // 处理新增
        for (const warehouse of inserted) {
            const oid = warehouse.oid || `WH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const id = warehouse.id || `WH_ID_${Date.now()}`;
            db.run(`INSERT INTO warehouses (id, oid, warehouse_code, warehouse_name, warehouse_type, location, capacity, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                oid,
                warehouse.warehouse_code || '',
                warehouse.warehouse_name || '',
                warehouse.warehouse_type || null,
                warehouse.location || null,
                warehouse.capacity || null,
                'active',
                now,
                now,
            ]);
            result.inserted.push({ ...warehouse, id, oid });
        }
        // 处理更新
        for (const warehouse of updated) {
            db.run(`UPDATE warehouses SET warehouse_code = ?, warehouse_name = ?, warehouse_type = ?,
         location = ?, capacity = ?, updated_at = ?
         WHERE oid = ?`, [
                warehouse.warehouse_code || '',
                warehouse.warehouse_name || '',
                warehouse.warehouse_type || null,
                warehouse.location || null,
                warehouse.capacity || null,
                now,
                warehouse.oid || '',
            ]);
            result.updated.push(warehouse);
        }
        // 处理删除
        for (const oid of deleted) {
            db.run('UPDATE warehouses SET status = ? WHERE oid = ?', ['inactive', oid]);
            result.deleted.push(oid);
        }
        saveDatabase();
        return result;
    }
    // ============================================
    // 基地管理
    // ============================================
    async getBases(params) {
        const db = getDatabase();
        const { status = 'active', orgOid } = params;
        let sql = 'SELECT * FROM bases WHERE status = ?';
        const bindings = [status];
        if (orgOid) {
            sql += ' AND org_oid = ?';
            bindings.push(orgOid);
        }
        sql += ' ORDER BY base_code ASC';
        const stmt = db.prepare(sql);
        stmt.bind(bindings);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
    async saveBases(data) {
        const db = getDatabase();
        const { inserted = [], updated = [], deleted = [] } = data;
        const now = new Date().toISOString();
        const result = {
            inserted: [],
            updated: [],
            deleted: [],
        };
        // 处理新增
        for (const base of inserted) {
            const oid = base.oid || `BASE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const id = base.id || `BASE_ID_${Date.now()}`;
            db.run(`INSERT INTO bases (id, oid, base_code, base_name, org_oid, location, area, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                oid,
                base.base_code || '',
                base.base_name || '',
                base.org_oid || null,
                base.location || null,
                base.area || null,
                'active',
                now,
                now,
            ]);
            result.inserted.push({ ...base, id, oid });
        }
        // 处理更新
        for (const base of updated) {
            db.run(`UPDATE bases SET base_code = ?, base_name = ?, org_oid = ?, location = ?, area = ?, updated_at = ?
         WHERE oid = ?`, [
                base.base_code || '',
                base.base_name || '',
                base.org_oid || null,
                base.location || null,
                base.area || null,
                now,
                base.oid || '',
            ]);
            result.updated.push(base);
        }
        // 处理删除
        for (const oid of deleted) {
            db.run('UPDATE bases SET status = ? WHERE oid = ?', ['inactive', oid]);
            result.deleted.push(oid);
        }
        saveDatabase();
        return result;
    }
    // ============================================
    // 温室管理
    // ============================================
    async getGreenhouses(params) {
        const db = getDatabase();
        const { status = 'active', baseOid } = params;
        let sql = 'SELECT * FROM greenhouses WHERE status = ?';
        const bindings = [status];
        if (baseOid) {
            sql += ' AND base_oid = ?';
            bindings.push(baseOid);
        }
        sql += ' ORDER BY greenhouse_code ASC';
        const stmt = db.prepare(sql);
        stmt.bind(bindings);
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }
    async saveGreenhouses(data) {
        const db = getDatabase();
        const { inserted = [], updated = [], deleted = [] } = data;
        const now = new Date().toISOString();
        const result = {
            inserted: [],
            updated: [],
            deleted: [],
        };
        // 处理新增
        for (const greenhouse of inserted) {
            const oid = greenhouse.oid || `GH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const id = greenhouse.id || `GH_ID_${Date.now()}`;
            db.run(`INSERT INTO greenhouses (id, oid, greenhouse_code, greenhouse_name, base_oid, greenhouse_type, area, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                oid,
                greenhouse.greenhouse_code || '',
                greenhouse.greenhouse_name || '',
                greenhouse.base_oid || '',
                greenhouse.greenhouse_type || null,
                greenhouse.area || null,
                'active',
                now,
                now,
            ]);
            result.inserted.push({ ...greenhouse, id, oid });
        }
        // 处理更新
        for (const greenhouse of updated) {
            db.run(`UPDATE greenhouses SET greenhouse_code = ?, greenhouse_name = ?, base_oid = ?,
         greenhouse_type = ?, area = ?, updated_at = ?
         WHERE oid = ?`, [
                greenhouse.greenhouse_code || '',
                greenhouse.greenhouse_name || '',
                greenhouse.base_oid || '',
                greenhouse.greenhouse_type || null,
                greenhouse.area || null,
                now,
                greenhouse.oid || '',
            ]);
            result.updated.push(greenhouse);
        }
        // 处理删除
        for (const oid of deleted) {
            db.run('UPDATE greenhouses SET status = ? WHERE oid = ?', ['inactive', oid]);
            result.deleted.push(oid);
        }
        saveDatabase();
        return result;
    }
}
export const dictionaryService = new DictionaryService();
