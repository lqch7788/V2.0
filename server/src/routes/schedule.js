/**
 * 排班管理路由
 *
 * Phase 1.3: 排班管理模块
 *
 * 提供排班数据的CRUD API
 */

import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../db';

const router = Router();

/**
 * 获取排班列表
 * GET /api/schedules
 */
router.get('/', (req, res) => { date, staff_id, start_date, end_date, page = '1', limit = '100' } = req.query;
    const db = getDatabase();

    let sql = 'SELECT * FROM schedules WHERE 1=1';
    const params= [];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }

    if (staff_id) {
      sql += ' AND staff_id = ?';
      params.push(staff_id);
    }

    if (start_date) {
      sql += ' AND date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND date <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY date DESC, staff_id';

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT ${Number(limit)} OFFSET ${offset}`;

    const schedules = db.exec(sql, params);
    const records = schedules.length > 0 ? schedules[0].values.map((row) => {
      const columns = schedules[0].columns;
      return columns.reduce((obj, col, idx) => {
        obj[col] = row[idx];
        return obj;
      }, {});
    }) : [];

    // 获取总数
    let countSql = 'SELECT COUNT(*)=1';
    const countParams= [];
    if (date) { countSql += ' AND date = ?'; countParams.push(date); }
    if (staff_id) { countSql += ' AND staff_id = ?'; countParams.push(staff_id); }
    if (start_date) { countSql += ' AND date >= ?'; countParams.push(start_date); }
    if (end_date) { countSql += ' AND date <= ?'; countParams.push(end_date); }

    const countResult = db.exec(countSql, countParams);
    const total = countResult.length > 0 && countResult[0].values[0][0] ? Number(countResult[0].values[0][0]) : 0;

    res.json({
      success,
      data,
      meta,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取排班列表失败:', error);
    res.status(500).json({ success, error: '获取排班列表失败' });
  }
});

/**
 * 获取单个排班
 * GET /api/schedules/:id
 */
router.get('/:id', (req, res) => { id } = req.params;
    const db = getDatabase();

    const result = db.exec('SELECT * FROM schedules WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      res.status(404).json({ success, error: '排班记录不存在' });
      return;
    }

    const columns = result[0].columns;
    const record = columns.reduce((obj, col, idx) => {
      obj[col] = result[0].values[0][idx];
      return obj;
    }, {});

    res.json({ success: true, data: records);
  } catch (error) {
    console.error('获取排班详情失败:', error);
    res.status(500).json({ success, error: '获取排班详情失败' });
  }
});

/**
 * 创建排班
 * POST /api/schedules
 */
router.post('/', (req, res) => { id, staff_id, staff_name, date, shift, work_zone, status, check_in, check_out, remarks } = req.body;
    const newId = id || `SCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const db = getDatabase();
    db.run(`
      INSERT INTO schedules (id, staff_id, staff_name, date, shift, work_zone, status, check_in, check_out, remarks, version, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [newId, staff_id, staff_name, date, shift, work_zone || null, status || '已排班', check_in || null, check_out || null, remarks || null, 1, now, now]);

    saveDatabase();

    res.status(201).json({
      success,
      data: {
        id,
        status: status || '已排班',
        check_in,
        check_out,
        remarks,
        version,
        create_time,
        update_time);
  } catch (error) {
    console.error('创建排班失败:', error);
    res.status(500).json({ success, error: '创建排班失败' });
  }
});

/**
 * 批量创建排班
 * POST /api/schedules/batch
 */
router.post('/batch', (req, res) => { schedules } = req.body;
    if (!Array.isArray(schedules) || schedules.length === 0) {
      res.status(400).json({ success, error: '请提供排班数据数组' });
      return;
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const insertedIds= [];

    for (const schedule of schedules) {
      const newId = schedule.id || `SCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      db.run(`
        INSERT INTO schedules (id, staff_id, staff_name, date, shift, work_zone, status, remarks, version, create_time, update_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newId,
        schedule.staff_id,
        schedule.staff_name,
        schedule.date,
        schedule.shift,
        schedule.work_zone || null,
        schedule.status || '已排班',
        schedule.remarks || null,
        1,
        now,
        now,
      ]);
      insertedIds.push(newId);
    }

    saveDatabase();

    res.status(201).json({
      success,
      data: { inserted: insertedIds, count: insertedIds.length,
    });
  } catch (error) {
    console.error('批量创建排班失败:', error);
    res.status(500).json({ success, error: '批量创建排班失败' });
  }
});

/**
 * 更新排班
 * PUT /api/schedules/:id
 */
router.put('/:id', (req, res) => { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    const db = getDatabase();

    // 先检查记录是否存在
    const checkResult = db.exec('SELECT * FROM schedules WHERE id = ?', [id]);
    if (checkResult.length === 0 || checkResult[0].values.length === 0) {
      res.status(404).json({ success, error: '排班记录不存在' });
      return;
    }

    // 构建更新SQL
    const fields= [];
    const values= [];

    if (updates.staff_id !== undefined) { fields.push('staff_id = ?'); values.push(updates.staff_id); }
    if (updates.staff_name !== undefined) { fields.push('staff_name = ?'); values.push(updates.staff_name); }
    if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
    if (updates.shift !== undefined) { fields.push('shift = ?'); values.push(updates.shift); }
    if (updates.work_zone !== undefined) { fields.push('work_zone = ?'); values.push(updates.work_zone); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.check_in !== undefined) { fields.push('check_in = ?'); values.push(updates.check_in); }
    if (updates.check_out !== undefined) { fields.push('check_out = ?'); values.push(updates.check_out); }
    if (updates.remarks !== undefined) { fields.push('remarks = ?'); values.push(updates.remarks); }

    // 版本号递增（乐观锁）
    fields.push('version = version + 1');
    fields.push('update_time = ?');
    values.push(now);
    values.push(id);

    if (fields.length === 0) {
      res.status(400).json({ success, error: '没有需要更新的字段' });
      return;
    }

    db.run(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();

    // 返回更新后的记录
    const result = db.exec('SELECT * FROM schedules WHERE id = ?', [id]);
    const columns = result[0].columns;
    const record = columns.reduce((obj, col, idx) => {
      obj[col] = result[0].values[0][idx];
      return obj;
    }, {});

    res.json({ success: true, data: records);
  } catch (error) {
    console.error('更新排班失败:', error);
    res.status(500).json({ success, error: '更新排班失败' });
  }
});

/**
 * 删除排班
 * DELETE /api/schedules/:id
 */
router.delete('/:id', (req, res) => { id } = req.params;
    const db = getDatabase();

    // 先检查记录是否存在
    const checkResult = db.exec('SELECT * FROM schedules WHERE id = ?', [id]);
    if (checkResult.length === 0 || checkResult[0].values.length === 0) {
      res.status(404).json({ success, error: '排班记录不存在' });
      return;
    }

    db.run('DELETE FROM schedules WHERE id = ?', [id]);
    saveDatabase();

    res.json({ success: true, data: records);
  } catch (error) {
    console.error('删除排班失败:', error);
    res.status(500).json({ success, error: '删除排班失败' });
  }
});

/**
 * 批量删除排班
 * DELETE /api/schedules/batch
 */
router.delete('/batch', (req, res) => { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success, error: '请提供要删除的ID数组' });
      return;
    }

    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    db.run(`DELETE FROM schedules WHERE id IN (${placeholders})`, ids);
    saveDatabase();

    res.json({ success, data: { deleted, count: ids.length } });
  } catch (error) {
    console.error('批量删除排班失败:', error);
    res.status(500).json({ success, error: '批量删除排班失败' });
  }
});

// ==================== 调班申请 API ====================

/**
 * 获取调班申请列表
 * GET /api/schedules/swap-requests
 */
router.get('/swap-requests/list', (req, res) => { status, page = '1', limit = '50' } = req.query;
    const db = getDatabase();

    let sql = 'SELECT * FROM swap_requests WHERE 1=1';
    const params= [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY create_time DESC';

    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT ${Number(limit)} OFFSET ${offset}`;

    const result = db.exec(sql, params);
    const records = result.length > 0 ? result[0].values.map((row) => {
      const columns = result[0].columns;
      return columns.reduce((obj, col, idx) => {
        obj[col] = row[idx];
        return obj;
      }, {});
    }) : [];

    res.json({ success: true, data: records);
  } catch (error) {
    console.error('获取调班申请列表失败:', error);
    res.status(500).json({ success, error: '获取调班申请列表失败' });
  }
});

/**
 * 提交调班申请
 * POST /api/schedules/swap-requests
 */
router.post('/swap-requests', (req, res) => { id, requester_id, requester_name, target_id, target_name, original_date, target_date, reason } = req.body;
    const newId = id || `SWAP-${Date.now()}`;
    const now = new Date().toISOString();

    const db = getDatabase();
    db.run(`
      INSERT INTO swap_requests (id, requester_id, requester_name, target_id, target_name, original_date, target_date, reason, status, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [newId, requester_id, requester_name, target_id, target_name, original_date, target_date, reason, '待审批', now, now]);

    saveDatabase();

    res.status(201).json({
      success,
      data: {
        id,
        status: '待审批',
        create_time);
  } catch (error) {
    console.error('提交调班申请失败:', error);
    res.status(500).json({ success, error: '提交调班申请失败' });
  }
});

/**
 * 处理调班申请
 * PUT /api/schedules/swap-requests/:id
 */
router.put('/swap-requests/:id', (req, res) => { id } = req.params;
    const { status } = req.body;
    const now = new Date().toISOString();

    const db = getDatabase();

    if (!['已同意', '已拒绝'].includes(status)) {
      res.status(400).json({ success, error: '无效的审批状态' });
      return;
    }

    db.run('UPDATE swap_requests SET status = ?, update_time = ? WHERE id = ?', [status, now, id]);
    saveDatabase();

    res.json({ success: true, data: records);
  } catch (error) {
    console.error('处理调班申请失败:', error);
    res.status(500).json({ success, error: '处理调班申请失败' });
  }
});

export default router;
