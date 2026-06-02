/**
 * V1.1 → V2.0 数据库同步脚本（逐步执行 + 幂等）
 *
 * 用法:
 *   node scripts/diff/sync-v1.1-data.js --module=pesticide --step=1  # 同步药剂库主表
 *   node scripts/diff/sync-v1.1-data.js --module=pesticide --step=2  # 同步药剂库规格表
 *   node scripts/diff/sync-v1.1-data.js --module=fertilizer --step=1 # 同步肥料库主表
 *   ...
 *   node scripts/diff/sync-v1.1-data.js --module=verify            # 验证 V2.0 端 API 可读
 *
 * 原则:
 *   - 不覆盖 V2.0 db 文件
 *   - 不删除 V2.0 任何记录
 *   - INSERT OR IGNORE（基于 UNIQUE 键）
 *   - 跨步骤独立、可中断
 *
 * 数据流: V1.1 db (只读) → 转换 → V2.0 db (读写)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 加载 better-sqlite3
let Database
try {
  Database = (await import('better-sqlite3')).default
} catch (e) {
  console.error('❌ better-sqlite3 未安装。运行: cd server && npm install')
  process.exit(1)
}

const V1_1_DB = 'D:/TMcrop/yuanxingtu/V1.1/server/data/yuanxingtu.db'
const V2_0_DB = 'D:/TMcrop/yuanxingtu/V2.0/server/data/yuanxingtu.db'

const args = process.argv.slice(2)
const moduleArg = args.find(a => a.startsWith('--module='))?.split('=')[1]
const stepArg = args.find(a => a.startsWith('--step='))?.split('=')[1]
const verifyOnly = args.includes('--module=verify')

if (!moduleArg && !verifyOnly) {
  console.error('用法: node sync-v1.1-data.js --module=<name> --step=<n>')
  console.error('模块: pesticide, fertilizer, crop-variety, departments, audit, extra-tables, verify')
  process.exit(1)
}

function openV1() { return new Database(V1_1_DB, { readonly: true }) }
function openV2() { return new Database(V2_0_DB ) }

/**
 * 通用同步函数：基于 UNIQUE 键的列做 INSERT OR IGNORE
 */
function syncTable(v1, v2, tableName, uniqueCol, v1Query, v2Columns) {
  console.log(`\n→ 同步 ${tableName} (UNIQUE: ${uniqueCol})`)
  const v1Rows = v1.prepare(v1Query).all()
  console.log(`  V1.1 ${tableName} 记录数: ${v1Rows.length}`)

  const existingCount = v2.prepare(`SELECT COUNT(*) AS c FROM ${tableName}`).get().c
  console.log(`  V2.0 ${tableName} 当前记录数: ${existingCount}`)

  if (existingCount > 0) {
    const v2Ids = v2.prepare(`SELECT ${uniqueCol} AS k FROM ${tableName}`).all().map(r => String(r.k))
    const v1Ids = new Set(v1Rows.map(r => String(r[uniqueCol])))
    const newIds = v1Rows.filter(r => !v2Ids.includes(String(r[uniqueCol])))
    const willConflict = v1Ids.size - newIds.length
    console.log(`  V1.1 中有 ${v1Ids.size} 条独立 key，V2.0 已含 ${willConflict} 条，新增 ${newIds.length} 条`)
  }

  // 构建 INSERT OR IGNORE 语句（V2.0 schema 列集合）
  const cols = v2Columns.join(', ')
  const placeholders = v2Columns.map(() => '?').join(', ')
  const insertStmt = v2.prepare(`INSERT OR IGNORE INTO ${tableName} (${cols}) VALUES (${placeholders})`)

  let inserted = 0, skipped = 0
  const insertMany = v2.transaction((rows) => {
    for (const row of rows) {
      const values = v2Columns.map(col => {
        const v = row[col]
        return v === undefined ? null : v
      })
      const info = insertStmt.run(...values)
      if (info.changes > 0) inserted++; else skipped++
    }
  })
  insertMany(v1Rows)

  console.log(`  ✅ 新增 ${inserted} 条，跳过（已存在）${skipped} 条`)
  console.log(`  📊 V2.0 ${tableName} 现在: ${v2.prepare(`SELECT COUNT(*) AS c FROM ${tableName}`).get().c} 条`)
  return { inserted, skipped }
}

// ========== 各模块同步函数 ==========

function syncPesticideStep(v1, v2, step) {
  if (step === 1) {
    return syncTable(v1, v2, 'pesticide_library', 'pesticide_code',
      'SELECT * FROM pesticide_library',
      ['id', 'pesticide_code', 'pesticide_name', 'control_type', 'function_desc', 'taboo_desc',
       'target_pests', 'ingredient', 'mechanism', 'status', 'create_time', 'update_time'])
  } else if (step === 2) {
    return syncTable(v1, v2, 'pesticide_specs', 'id',
      'SELECT * FROM pesticide_specs',
      ['id', 'pesticide_id', 'spec_content', 'formulation', 'manufacturer', 'suggested_dosage',
       'suggested_ratio', 'dosage_unit', 'mechanism', 'brand_name', 'remark', 'status', 'create_time'])
  } else if (step === 3) {
    return syncTable(v1, v2, 'pesticide_pest_relation', 'id',
      'SELECT * FROM pesticide_pest_relation',
      ['id', 'pesticide_id', 'pest_id', 'create_time'])
  }
}

function syncFertilizerStep(v1, v2, step) {
  if (step === 1) {
    return syncTable(v1, v2, 'fertilizer_library', 'fertilizer_code',
      'SELECT * FROM fertilizer_library',
      ['id', 'fertilizer_code', 'fertilizer_name', 'fertilizer_type', 'application_timing',
       'function_desc', 'taboo_desc', 'shelf_life', 'storage_condition', 'supplier_info',
       'status', 'create_time', 'update_time'])
  } else if (step === 2) {
    return syncTable(v1, v2, 'fertilizer_specs', 'id',
      'SELECT * FROM fertilizer_specs',
      ['id', 'fertilizer_id', 'brand_name', 'spec_content', 'manufacturer', 'suggested_dosage',
       'suggested_ratio', 'dosage_unit', 'remark', 'status', 'create_time'])
  }
}

function syncCropVarietyStep(v1, v2, step) {
  if (step === 1) {
    return syncTable(v1, v2, 'crop_varieties', 'id',
      'SELECT * FROM crop_varieties',
      ['id', 'crop_code', 'category_code', 'category_name', 'type_code', 'type_name',
       'variety_code', 'variety_name', 'sub_variety1_code', 'sub_variety1_name',
       'detail_variety_code', 'detail_variety_name', 'status', 'create_time', 'update_time',
       'alias', 'image', 'description',
       'germination_period', 'seedling_period', 'flowering_period', 'fruiting_period', 'harvest_period',
       'air_temperature', 'air_humidity', 'co2_content', 'light_intensity',
       'soil_temperature', 'soil_humidity', 'soil_ph', 'soil_ec', 'remarks'])
  } else if (step === 2) {
    return syncTable(v1, v2, 'crop_variety_categor_extensions', 'id',
      'SELECT * FROM crop_variety_categor_extensions',
      ['id', 'category_code', 'category_name', 'create_time', 'update_time'])
  }
}

function syncDepartmentsStep(v1, v2, step) {
  if (step === 1) {
    return syncTable(v1, v2, 'departments', 'id',
      'SELECT * FROM departments',
      ['id', 'code', 'name', 'parent_oid', 'manager_id', 'manager_name', 'sort_number', 'status', 'create_time', 'update_time'])
  }
}

function syncAuditStep(v1, v2) {
  return syncTable(v1, v2, 'operation_logs', 'id',
    'SELECT * FROM operation_logs',
    ['id', 'user_id', 'username', 'action', 'module', 'description', 'ip', 'status',
     'level', 'request_data', 'response_data', 'created_at', 'updated_at'])
}

function syncExtraTablesStep(v1, v2) {
  // V1.1 独有但 V2.0 缺失的表
  const tables = [
    { name: 'user_base_permissions', cols: ['id', 'user_id', 'base_id', 'created_at', 'updated_at'] },
    { name: 'team_members', cols: ['id', 'team_id', 'user_id', 'joined_at'] },
    { name: 'work_logs', cols: ['id', 'user_id', 'work_date', 'hours', 'description', 'created_at', 'updated_at'] },
    { name: 'farm_task_schedules', cols: ['id', 'task_id', 'scheduled_at', 'status', 'created_at'] },
    { name: 'acceptance_records', cols: ['id', 'task_id', 'accepted_at', 'accepted_by', 'created_at'] },
    { name: 'delivery_records', cols: ['id', 'order_id', 'delivered_at', 'created_at'] },
    { name: 'inventory_stock', cols: ['id', 'warehouse_id', 'material_id', 'quantity', 'updated_at'] },
    { name: 'inventory_freeze', cols: ['id', 'material_id', 'quantity', 'freeze_reason', 'created_at'] },
    { name: 'inventory_transaction', cols: ['id', 'material_id', 'type', 'quantity', 'created_at'] },
    { name: 'iot_sensors', cols: ['id', 'name', 'type', 'location', 'status', 'created_at'] },
    { name: 'order_change_logs', cols: ['id', 'order_id', 'change_type', 'created_at'] },
    { name: 'pesticide_records', cols: ['id', 'pesticide_id', 'used_at', 'quantity', 'created_at'] },
    { name: 'production_batch_orders', cols: ['id', 'batch_code', 'product_id', 'quantity', 'created_at'] },
    { name: 'quality_check_records', cols: ['id', 'product_id', 'checked_at', 'result', 'created_at'] },
    { name: 'seed_source_print_records', cols: ['id', 'seed_id', 'printed_at', 'created_at'] },
    { name: 'tech_solution_scopes', cols: ['id', 'solution_id', 'scope', 'created_at'] }
  ]

  for (const t of tables) {
    try {
      const v1c = v1.prepare(`SELECT COUNT(*) AS c FROM ${t.name}`).get().c
      let v2c = -1
      try { v2c = v2.prepare(`SELECT COUNT(*) AS c FROM ${t.name}`).get().c } catch(e) {}
      if (v2c === -1) {
        console.log(`⚠️  V2.0 缺失表 ${t.name}，需先创建（请在 V2.0 启动时由 schema.ts 创建）`)
        continue
      }
      if (v1c > 0) {
        syncTable(v1, v2, t.name, t.cols[0],
          `SELECT * FROM ${t.name}`,
          t.cols)
      }
    } catch (e) {
      console.log(`⚠️  ${t.name}: ${e.message}`)
    }
  }
}

// ========== 验证 ==========

function verifyReadability(v2) {
  console.log('\n========================================')
  console.log('📊 V2.0 数据库可读性验证')
  console.log('========================================')

  const checks = [
    { name: 'pesticide_library', sample: 'pesticide_code, pesticide_name' },
    { name: 'pesticide_specs', sample: 'pesticide_id, spec_content' },
    { name: 'fertilizer_library', sample: 'fertilizer_code, fertilizer_name' },
    { name: 'fertilizer_specs', sample: 'fertilizer_id, brand_name' },
    { name: 'crop_varieties', sample: 'crop_code, category_name, variety_name' },
    { name: 'departments', sample: 'code, name' },
    { name: 'operation_logs', sample: 'username, action' }
  ]

  for (const c of checks) {
    try {
      const c1 = v2.prepare(`SELECT COUNT(*) AS c FROM ${c.name}`).get().c
      const samples = v2.prepare(`SELECT ${c.sample} FROM ${c.name} LIMIT 3`).all()
      console.log(`\n  ${c.name}: ${c1} 条`)
      samples.forEach(s => console.log(`    ${JSON.stringify(s).slice(0, 100)}`))
    } catch (e) {
      console.log(`  ❌ ${c.name}: ${e.message}`)
    }
  }
}

// ========== 主入口 ==========

console.log('========================================')
console.log('V1.1 → V2.0 数据同步脚本')
console.log('========================================')
console.log(`模块: ${moduleArg || 'verify'}, 步骤: ${stepArg || 'all'}`)
console.log('⚠️  本脚本只 INSERT OR IGNORE，不覆盖 V2.0 现有数据')
console.log('========================================')

const v1 = openV1()
const v2 = openV2()

if (verifyOnly || moduleArg === 'verify') {
  verifyReadability(v2)
} else {
  try {
    if (moduleArg === 'pesticide') {
      syncPesticideStep(v1, v2, parseInt(stepArg || '1'))
    } else if (moduleArg === 'fertilizer') {
      syncFertilizerStep(v1, v2, parseInt(stepArg || '1'))
    } else if (moduleArg === 'crop-variety') {
      syncCropVarietyStep(v1, v2, parseInt(stepArg || '1'))
    } else if (moduleArg === 'departments') {
      syncDepartmentsStep(v1, v2, parseInt(stepArg || '1'))
    } else if (moduleArg === 'audit') {
      syncAuditStep(v1, v2)
    } else if (moduleArg === 'extra-tables') {
      syncExtraTablesStep(v1, v2)
    } else {
      console.error(`未知模块: ${moduleArg}`)
    }
    console.log('\n========================================')
    console.log('下一步:')
    console.log('  1. 启动 V2.0 后端: cd server && npm run dev')
    console.log('  2. 验证前端可读取: node scripts/diff/sync-v1.1-data.js --module=verify')
    console.log('  3. 启动 V2.0 前端: npm run dev')
    console.log('  4. 访问 http://localhost:5000/settings → 校验页面数据')
    console.log('========================================')
  } catch (e) {
    console.error('❌ 同步失败:', e.message)
  }
}

v1.close()
v2.close()
