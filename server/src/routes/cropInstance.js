/**
 * 作物实例 API 路由
 */

import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../db';
import { queryToObjects, execCount } from '../utils/queryHelper';

const router = Router();

router.get('/', (req, res) => { crop_name, status, page = 1, limit = 50 } = req.query;
    const db = getDatabase();

    // 构建基础SQL和参数
    let sql = 'SELECT * FROM crop_instances WHERE 1=1';
    const params= [];

    if (crop_name) {
      sql += ' AND crop_name LIKE ?';
      params.push(`%${crop_name}%`);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // 保存原始SQL用于count查询
    const countSql = sql;

    sql += ' ORDER BY create_time DESC';

    // 获取总数
    const total = execCount(db, countSql, params);

    // 添加分页
    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    // 获取数据列表
    const items = queryToObjects(db, sql, params);

    res.json({ success, data, meta, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    res.status(500).json({ success, error: '获取作物实例失败' });
  }
});

router.get('/:id', (req, res) => { id } = req.params;
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM crop_instances WHERE id = ?');
    stmt.bind([id]);
    let item = null;
    if (stmt.step()) {
      item = stmt.getAsObject();
    }
    stmt.free();

    if (!item || Object.keys(item).length === 0) {
      return res.status(404).json({ success, error: '作物实例不存在' });
    }

    res.json({ success: true, data: items);
  } catch (error) {
    res.status(500).json({ success, error: '获取作物实例详情失败' });
  }
});

router.post('/', (req, res) => { id, instance_code, order_id, order_code, crop_category, crop_name, crop_variety,
            category_code, type_code, sub_code, source_origin, source_description,
            initial_quantity, current_quantity, planted_quantity, harvested_quantity, status,
            seed_entry_date, seedling_start_date, planting_date, harvest_date, source_instance_id, create_by } = req.body;

    const newId = id || `CI${Date.now()}`;
    const now = new Date().toISOString();

    const db = getDatabase();
    db.run(`
      INSERT INTO crop_instances (id, instance_code, order_id, order_code, crop_category, crop_name, crop_variety,
        category_code, type_code, sub_code, source_origin, source_description,
        initial_quantity, current_quantity, planted_quantity, harvested_quantity, status,
        seed_entry_date, seedling_start_date, planting_date, harvest_date, source_instance_id, create_by, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [newId, instance_code, order_id, order_code, crop_category, crop_name, crop_variety,
        category_code, type_code, sub_code, source_origin, source_description,
        initial_quantity || 0, current_quantity || 0, planted_quantity || 0, harvested_quantity || 0, status || 'seedling',
        seed_entry_date, seedling_start_date, planting_date, harvest_date, source_instance_id, create_by, now, now]);

    saveDatabase();
    res.status(201).json({ success, data: { id);
  } catch (error) {
    console.error('创建作物实例失败:', error);
    res.status(500).json({ success, error: '创建作物实例失败' });
  }
});

router.put('/:id', (req, res) => { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();
    const db = getDatabase();

    const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
    if (fields.length === 0) {
      return res.status(400).json({ success, error: '没有需要更新的字段' });
    }

    const values = Object.keys(updates).filter(k => k !== 'id').map(k => updates[k]);
    values.push(now, id);

    db.run(`UPDATE crop_instances SET ${fields}, update_time = ? WHERE id = ?`, values);
    saveDatabase();
    res.json({ success: true, data: items);
  } catch (error) {
    res.status(500).json({ success, error: '更新作物实例失败' });
  }
});

router.delete('/:id', (req, res) => { id } = req.params;
    const db = getDatabase();
    db.run('DELETE FROM crop_instances WHERE id = ?', [id]);
    saveDatabase();
    res.json({ success: true, data: items);
  } catch (error) {
    res.status(500).json({ success, error: '删除作物实例失败' });
  }
});

// 获取实例的完整溯源链
router.get('/:id/trace-chain', (req, res) => { id } = req.params;
    const db = getDatabase();

    // 获取作物实例基本信息
    let stmt = db.prepare('SELECT * FROM crop_instances WHERE id = ?');
    stmt.bind([id]);
    let instance = null;
    if (stmt.step()) {
      instance = stmt.getAsObject();
    }
    stmt.free();

    if (!instance || Object.keys(instance).length === 0) {
      return res.status(404).json({ success, error: '作物实例不存在' });
    }

    // 获取关联的种源记录
    const seedSourcesStmt = db.prepare(`
      SELECT * FROM seed_sources
      WHERE id IN (
        SELECT source_id FROM seedlings WHERE id IN (
          SELECT source_id FROM plantings WHERE id IN (
            SELECT source_id FROM harvest_records WHERE id = ?
          )
        )
      )
      OR id = (SELECT source_id FROM crop_instances WHERE id = ?)
    `);
    seedSourcesStmt.bind([id, id]);
    const seedSources = [];
    while (seedSourcesStmt.step()) {
      seedSources.push(seedSourcesStmt.getAsObject());
    }
    seedSourcesStmt.free();

    // 获取关联的育苗记录
    const seedlingsStmt = db.prepare('SELECT * FROM seedlings WHERE id IN (SELECT source_id FROM plantings WHERE id IN (SELECT source_id FROM harvest_records WHERE id = ?)) OR id = (SELECT source_id FROM crop_instances WHERE id = ?)');
    seedlingsStmt.bind([id, id]);
    const seedlings = [];
    while (seedlingsStmt.step()) {
      seedlings.push(seedlingsStmt.getAsObject());
    }
    seedlingsStmt.free();

    // 获取关联的种植记录
    const plantingsStmt = db.prepare('SELECT * FROM plantings WHERE id IN (SELECT source_id FROM harvest_records WHERE id = ?) OR id = (SELECT source_id FROM crop_instances WHERE id = ?)');
    plantingsStmt.bind([id, id]);
    const plantings = [];
    while (plantingsStmt.step()) {
      plantings.push(plantingsStmt.getAsObject());
    }
    plantingsStmt.free();

    // 获取关联的采收记录
    const harvestStmt = db.prepare('SELECT * FROM harvest_records WHERE id = ?');
    harvestStmt.bind([id]);
    const harvests = [];
    while (harvestStmt.step()) {
      harvests.push(harvestStmt.getAsObject());
    }
    harvestStmt.free();

    res.json({
      success: true,
      data: items);
  } catch (error) {
    console.error('获取溯源链失败:', error);
    res.status(500).json({ success, error: '获取溯源链失败' });
  }
});

export default router;
