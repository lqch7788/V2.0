/**
 * 能耗配置路由 — iAGS AreaEnery 集成
 * 挂载于 /api/energy-configs
 * 大棚能耗类型和计量设备配置
 */
import { Router } from 'express';
import { getDatabase } from '../db/index';

const router = Router();

/** 获取能耗配置列表 GET /api/energy-configs */
router.get('/', (req, res) => {
    const db = getDatabase();
    const { keyword, status, energy_type, partition_oid } = req.query;
    const conditions= [];
    const params= [];

    if (status) { conditions.push('e.status = ?'); params.push(status); }
    if (energy_type) { conditions.push('e.energy_type = ?'); params.push(energy_type); }
    if (partition_oid) { conditions.push('e.partition_oid = ?'); params.push(partition_oid); }
    if (keyword) {
      conditions.push('(fp.name LIKE ? OR e.device_name LIKE ? OR e.description LIKE ?)');
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = db.exec(`
      SELECT e.*, fp.name= fp.oid
      ${where}
      ORDER BY e.created_at DESC
    `, params);

    if (result.length === 0) return res.json({ success: true, data: []);
    const columns = result[0].columns;
    const records = result[0].values.map(row => {
      const obj= {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
    res.json({ success: true, data: []);
  } catch (error) {
    console.error('获取能耗配置失败:', error);
    res.status(500).json({ success, error: '获取能耗配置失败' });
  }
});

/** 创建能耗配置 POST /api/energy-configs */
router.post('/', (req, res) => {
    const db = getDatabase();
    const { partition_oid, energy_type, device_oid, device_name, meter_code, unit, description } = req.body;

    if (!partition_oid || !energy_type) {
      return res.status(400).json({ success, error: '分区和能耗类型不能为空' });
    }

    const oid = `ec_${Date.now()}`;
    const now = new Date().toISOString();

    db.run(`
      INSERT INTO energy_configs (oid, partition_oid, energy_type, device_oid, device_name, meter_code, unit, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [oid, partition_oid, energy_type, device_oid || null, device_name || null, meter_code || null, unit || 'kWh', description || null, now, now]);

    const result = db.exec('SELECT * FROM energy_configs WHERE oid = ?', [oid]);
    const columns = result[0].columns;
    const record= {};
    columns.forEach((col, i) => { record[col] = result[0].values[0][i]; });
    res.status(201).json({ success: true, data: []);
  } catch (error) {
    console.error('创建能耗配置失败:', error);
    res.status(500).json({ success, error: '创建能耗配置失败' });
  }
});

/** 更新能耗配置 PUT /api/energy-configs/:oid */
router.put('/:oid', (req, res) => {
    const db = getDatabase();
    const { partition_oid, energy_type, device_oid, device_name, meter_code, unit, description, status } = req.body;
    const now = new Date().toISOString();

    db.run(`
      UPDATE energy_configs SET partition_oid=?, energy_type=?, device_oid=?, device_name=?, meter_code=?, unit=?, description=?, status=?, updated_at=?
      WHERE oid=?
    `, [partition_oid, energy_type, device_oid || null, device_name || null, meter_code || null, unit || 'kWh', description || null, status || 'active', now, req.params.oid]);

    const result = db.exec('SELECT * FROM energy_configs WHERE oid = ?', [req.params.oid]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ success, error: '能耗配置不存在' });
    }
    const columns = result[0].columns;
    const record= {};
    columns.forEach((col, i) => { record[col] = result[0].values[0][i]; });
    res.json({ success: true, data: []);
  } catch (error) {
    console.error('更新能耗配置失败:', error);
    res.status(500).json({ success, error: '更新能耗配置失败' });
  }
});

/** 删除能耗配置 DELETE /api/energy-configs/:oid */
router.delete('/:oid', (req, res) => {
    const db = getDatabase();
    db.run('DELETE FROM energy_configs WHERE oid = ?', [req.params.oid]);
    res.json({ success, message: '能耗配置已删除' });
  } catch (error) {
    console.error('删除能耗配置失败:', error);
    res.status(500).json({ success, error: '删除能耗配置失败' });
  }
});

export default router;
