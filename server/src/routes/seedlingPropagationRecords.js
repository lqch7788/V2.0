/**
 * 2026-07-18 P0-MISS-010 修复：V2.0 此前缺失 seedlingPropagationRecords 路由
 * 2026-06-25 v3: 育苗繁殖记录子表 CRUD（V1.1 seedlingPropagationRecords.ts 1:1 移植）
 * 复用现有 propagation_records 表（加 seedling_id 列）
 * 数据流：V2.1 铁律 — 无缓存降级
 *
 * V2.0 适配：
 * - ES Module 语法（与 V1.1 CommonJS 不同）
 * - sql.js 风格（与 V1.1 sql.js 一致）
 * - Zod schema 与 V1.1 1:1
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { getDatabase, saveDatabase } from '../db/index.js';
import { queryToObjects } from '../utils/queryHelper.js';

const router = Router();

// ============ Zod Schema (V1.1 PropagationRecordSchema 1:1) ============

const PropagationRecordSchema = z.object({
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式 YYYY-MM-DD'),
  temperature: z.number().optional().nullable(),
  humidity: z.number().optional().nullable(),
  motherPlantCount: z.number().int().min(0).optional().nullable(),
  seedlingOutput: z.number().int().min(0).optional().nullable(),
  seedlingStatus: z.enum(['healthy', 'weak', 'diseased']).optional().nullable(),
  transplantPosition: z.string().optional().nullable(),
  operator: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  // 2026-07-04 v2：无性繁殖完整字段
  operationType: z.string().optional().nullable(),
  reproductionMode: z.enum(['sexual', 'asexual']).optional().nullable(),
  motherPlantCode: z.string().optional().nullable(),
  propagationMethod: z.string().optional().nullable(),
  inoculationCount: z.number().int().min(0).optional().nullable(),
  survivalCountAsexual: z.number().int().min(0).optional().nullable(),
  targetTraits: z.array(z.string()).optional().nullable(),
  generation: z.string().optional().nullable(),
  parentMaleCode: z.string().optional().nullable(),
  parentFemaleCode: z.string().optional().nullable(),
});

const UpdatePropagationRecordSchema = PropagationRecordSchema.partial();

// ============ Helpers ============

function generateRecordId(dateStr) {
  // 2026-07-14：改用 crypto.randomUUID 替代 Math.random
  return `PR-${dateStr}-${randomUUID().slice(0, 8)}`;
}

// ============ 启动时加列 + 索引 ============

let schemaInitialized = false;

function ensureSchema() {
  if (schemaInitialized) return;
  try {
    const db = getDatabase();
    // 加 seedling_id 列（幂等 — 已存在则跳过）
    try {
      db.run(`ALTER TABLE propagation_records ADD COLUMN seedling_id TEXT`);
      console.log('[seedling-propagation] 已添加 seedling_id 列');
    } catch {
      // 列已存在，跳过
    }
    // 无性繁殖完整字段
    const newCols = [
      { col: 'operation_type', type: 'TEXT' },
      { col: 'reproduction_mode', type: 'TEXT' },
      { col: 'mother_plant_code', type: 'TEXT' },
      { col: 'propagation_method', type: 'TEXT' },
      { col: 'inoculation_count', type: 'INTEGER' },
      { col: 'survival_count_asexual', type: 'INTEGER' },
      { col: 'target_traits', type: 'TEXT' },
      { col: 'generation', type: 'TEXT' },
      { col: 'parent_male_code', type: 'TEXT' },
      { col: 'parent_female_code', type: 'TEXT' }
    ];
    for (const { col, type } of newCols) {
      try {
        db.run(`ALTER TABLE propagation_records ADD COLUMN ${col} ${type}`);
      } catch {
        // 列已存在，跳过
      }
    }
    try {
      db.run(`CREATE INDEX IF NOT EXISTS idx_propagation_seedling ON propagation_records(seedling_id)`);
    } catch (e) {
      console.warn('[seedlingPropagationRecords] idx_propagation_seedling 创建失败:', e);
    }
    saveDatabase();
    schemaInitialized = true;
  } catch (e) {
    console.warn('[seedlingPropagationRecords] ensureSchema 失败（可能 DB 未就绪）:', e);
  }
}

// ============ CRUD ============

/**
 * GET /api/seedlings/:id/propagation-records
 */
router.get('/:id/propagation-records', (req, res) => {
  ensureSchema();
  try {
    const { id } = req.params;
    const db = getDatabase();
    const rows = db.exec(
      `SELECT id, seedling_id, record_date, operation_type, reproduction_mode,
              mother_plant_code, propagation_method,
              inoculation_count, survival_count_asexual, target_traits, generation,
              parent_male_code, parent_female_code,
              temperature, humidity,
              mother_plant_count, seedling_output, seedling_status,
              transplant_position, operator, remarks, create_time
       FROM propagation_records
       WHERE seedling_id = ?
       ORDER BY record_date DESC, create_time DESC`,
      [id]
    );
    const data = queryToObjects(rows, [
      'id', 'seedling_id', 'record_date', 'operation_type', 'reproduction_mode',
      'mother_plant_code', 'propagation_method',
      'inoculation_count', 'survival_count_asexual', 'target_traits', 'generation',
      'parent_male_code', 'parent_female_code',
      'temperature', 'humidity',
      'mother_plant_count', 'seedling_output', 'seedling_status',
      'transplant_position', 'operator', 'remarks', 'create_time'
    ]);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[GET propagation-records] error:', err);
    return res.status(500).json({ success: false, error: '查询失败' });
  }
});

/**
 * POST /api/seedlings/:id/propagation-records
 */
router.post('/:id/propagation-records', (req, res) => {
  ensureSchema();
  try {
    const { id } = req.params;
    const parsed = PropagationRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues || [];
      return res.status(400).json({ success: false, error: issues[0]?.message || '参数错误' });
    }
    const data = parsed.data;
    const db = getDatabase();
    // 校验育苗存在
    const checkRes = db.exec(`SELECT id FROM seedlings WHERE id = ?`, [id]);
    if (!checkRes[0]?.values?.length) {
      return res.status(404).json({ success: false, error: '育苗记录不存在' });
    }
    const recordId = generateRecordId(data.recordDate);
    db.run(
      `INSERT INTO propagation_records (
        id, seedling_id, record_date,
        seed_source_id, stage,
        operation_type, reproduction_mode, mother_plant_code, propagation_method,
        inoculation_count, survival_count_asexual, target_traits, generation,
        parent_male_code, parent_female_code,
        temperature, humidity,
        mother_plant_count, seedling_output, seedling_status,
        transplant_position, operator, remarks, create_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
      [
        recordId, id, data.recordDate,
        id, 'seedling',
        data.operationType ?? null, data.reproductionMode ?? null,
        data.motherPlantCode ?? null, data.propagationMethod ?? null,
        data.inoculationCount ?? null, data.survivalCountAsexual ?? null,
        data.targetTraits ? JSON.stringify(data.targetTraits) : null,
        data.generation ?? null,
        data.parentMaleCode ?? null, data.parentFemaleCode ?? null,
        data.temperature ?? null, data.humidity ?? null,
        data.motherPlantCount ?? null, data.seedlingOutput ?? null,
        data.seedlingStatus ?? null, data.transplantPosition ?? null,
        data.operator ?? null, data.remarks ?? null
      ]
    );
    saveDatabase();
    return res.json({ success: true, data: { id: recordId } });
  } catch (err) {
    console.error('[POST propagation-records] error:', err);
    return res.status(500).json({ success: false, error: '创建失败' });
  }
});

/**
 * PUT /api/seedlings/:id/propagation-records/:recordId
 */
router.put('/:id/propagation-records/:recordId', (req, res) => {
  ensureSchema();
  try {
    const { id, recordId } = req.params;
    const parsed = UpdatePropagationRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: '参数错误' });
    }
    const data = parsed.data;
    const db = getDatabase();
    const checkRes = db.exec(
      `SELECT id FROM propagation_records WHERE id = ? AND seedling_id = ?`,
      [recordId, id]
    );
    if (!checkRes[0]?.values?.length) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }
    const fields = [];
    const params = [];
    const fieldMap = {
      recordDate: 'record_date',
      temperature: 'temperature',
      humidity: 'humidity',
      motherPlantCount: 'mother_plant_count',
      seedlingOutput: 'seedling_output',
      seedlingStatus: 'seedling_status',
      transplantPosition: 'transplant_position',
      operator: 'operator',
      remarks: 'remarks',
      operationType: 'operation_type',
      reproductionMode: 'reproduction_mode',
      motherPlantCode: 'mother_plant_code',
      propagationMethod: 'propagation_method',
      inoculationCount: 'inoculation_count',
      survivalCountAsexual: 'survival_count_asexual',
      generation: 'generation',
      parentMaleCode: 'parent_male_code',
      parentFemaleCode: 'parent_female_code'
    };
    for (const [camelKey, snakeCol] of Object.entries(fieldMap)) {
      if (data[camelKey] !== undefined) {
        fields.push(`${snakeCol} = ?`);
        if (camelKey === 'targetTraits') {
          params.push(JSON.stringify(data[camelKey]));
        } else {
          params.push(data[camelKey]);
        }
      }
    }
    if (data.targetTraits !== undefined && !fieldMap.targetTraits) {
      fields.push('target_traits = ?');
      params.push(JSON.stringify(data.targetTraits));
    }
    if (fields.length === 0) {
      return res.json({ success: true, data: { id: recordId, message: '无字段更新' } });
    }
    params.push(recordId, id);
    db.run(
      `UPDATE propagation_records SET ${fields.join(', ')} WHERE id = ? AND seedling_id = ?`,
      params
    );
    saveDatabase();
    return res.json({ success: true, data: { id: recordId } });
  } catch (err) {
    console.error('[PUT propagation-records] error:', err);
    return res.status(500).json({ success: false, error: '更新失败' });
  }
});

/**
 * DELETE /api/seedlings/:id/propagation-records/:recordId
 */
router.delete('/:id/propagation-records/:recordId', (req, res) => {
  ensureSchema();
  try {
    const { id, recordId } = req.params;
    const db = getDatabase();
    db.run(`DELETE FROM propagation_records WHERE id = ? AND seedling_id = ?`, [recordId, id]);
    saveDatabase();
    return res.json({ success: true });
  } catch (err) {
    console.error('[DELETE propagation-records] error:', err);
    return res.status(500).json({ success: false, error: '删除失败' });
  }
});

export default router;
