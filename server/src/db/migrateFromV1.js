/**
 * 数据迁移脚本：从V1.1迁移数据到V2.0
 *
 * 功能：
 * 1. 读取V1.1数据库中的作物管理数据（种源、育苗、种植、采收等）
 * 2. 验证数据完整性
 * 3. 迁移到V2.0数据库
 *
 * 使用方法：node server/src/db/migrateFromV1.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// V1.1数据库路径
const V1_DB_PATH = path.join(__dirname, '../../../../V1.1/server/data/yuanxingtu.db');
// V2.0数据库路径
const V2_DB_PATH = path.join(__dirname, '../data/yuanxingtu.db');

// 要迁移的表列表
const TABLES_TO_MIGRATE = [
  'seed_sources',    // 种源表
  'seedlings',       // 育苗表
  'plantings',       // 种植表
  'harvest_records', // 采收记录表
  'crop_instances',  // 作物实例表
  'crop_varieties',  // 作物品种表
  'production_plans', // 生产计划表
  'crop_orders',     // 订单表
  'inventory',       // 库存表
  'suppliers',       // 供应商表
];

/**
 * 字段映射表：V1.1 → V2.0（snake_case统一）
 */
const FIELD_MAPS = {
  seed_sources: {
    // V1.1字段: V2.0字段
  },
  seedlings: {},
  plantings: {},
  harvest_records: {},
  crop_instances: {},
  crop_varieties: {},
  production_plans: {},
  crop_orders: {},
  inventory: {},
  suppliers: {},
};

/**
 * 生成新的UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 确保V2.0数据库存在
 */
function ensureV2Database() {
  if (!fs.existsSync(V2_DB_PATH)) {
    console.error(`❌ V2.0数据库不存在: ${V2_DB_PATH}`);
    console.error('请先启动V2.0服务器以初始化数据库');
    process.exit(1);
  }
}

/**
 * 确保V1.1数据库存在
 */
function ensureV1Database() {
  if (!fs.existsSync(V1_DB_PATH)) {
    console.error(`❌ V1.1数据库不存在: ${V1_DB_PATH}`);
    process.exit(1);
  }
}

/**
 * 连接数据库
 */
function openDatabase(dbPath) {
  try {
    const db = new Database(dbPath, { readonly: true });
    console.log(`✅ 连接数据库成功: ${dbPath}`);
    return db;
  } catch (error) {
    console.error(`❌ 连接数据库失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 获取表中的数据量
 */
function getTableCount(db, tableName) {
  try {
    const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    return result.count;
  } catch (error) {
    return 0;
  }
}

/**
 * 检查表是否存在
 */
function tableExists(db, tableName) {
  try {
    const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    return !!result;
  } catch (error) {
    return false;
  }
}

/**
 * 获取表的所有列
 */
function getTableColumns(db, tableName) {
  try {
    const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return result.map(col => col.name);
  } catch (error) {
    return [];
  }
}

/**
 * 迁移单个表的数据
 */
function migrateTable(v1Db, v2Db, tableName, options = {}) {
  const { skipIfExists = false, idField = 'id' } = options;

  console.log(`\n📦 开始迁移表: ${tableName}`);

  // 检查V1.1表是否存在
  if (!tableExists(v1Db, tableName)) {
    console.log(`⚠️  V1.1中表 ${tableName} 不存在，跳过`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  // 检查V2.0表是否存在
  if (!tableExists(v2Db, tableName)) {
    console.log(`⚠️  V2.0中表 ${tableName} 不存在，跳过`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  // 获取V1.1数据
  let v1Data = [];
  try {
    v1Data = v1Db.prepare(`SELECT * FROM ${tableName}`).all();
  } catch (error) {
    console.error(`❌ 查询V1.1数据失败: ${error.message}`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  if (v1Data.length === 0) {
    console.log(`ℹ️  V1.1表 ${tableName} 无数据可迁移`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  console.log(`   V1.1数据量: ${v1Data.length} 条`);

  // 获取V2.0表的列
  const v2Columns = getTableColumns(v2Db, tableName);
  console.log(`   V2.0表列: ${v2Columns.join(', ')}`);

  // 获取V1.1表的列
  const v1Columns = getTableColumns(v1Db, tableName);
  console.log(`   V1.1表列: ${v1Columns.join(', ')}`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  // 准备插入语句
  const insertStmt = v2Db.prepare(`
    INSERT INTO ${tableName} (${v2Columns.join(', ')})
    VALUES (${v2Columns.map(() => '?').join(', ')})
  `);

  // 事务插入
  const insertMany = v2Db.transaction((records) => {
    for (const record of records) {
      try {
        // 构建插入数据，只包含V2.0表有的列
        const insertData = {};
        for (const col of v2Columns) {
          // 尝试从V1.1数据中获取对应值（支持字段映射）
          const v1Col = FIELD_MAPS[tableName]?.[col] || col;
          insertData[col] = record[v1Col] !== undefined ? record[v1Col] : null;
        }

        // 如果ID为空，生成新UUID
        if (!insertData[idField] && v1Columns.includes(idField)) {
          insertData[idField] = generateUUID();
        }

        const values = v2Columns.map(col => insertData[col]);
        insertStmt.run(...values);
        migrated++;
      } catch (error) {
        // 如果是唯一约束冲突，跳过
        if (error.message.includes('UNIQUE constraint failed') || error.message.includes('duplicate key')) {
          skipped++;
        } else {
          console.error(`   ❌ 插入失败: ${error.message}`);
          errors++;
        }
      }
    }
  });

  try {
    insertMany(v1Data);
    console.log(`✅ 迁移完成: 成功 ${migrated}, 跳过 ${skipped}, 错误 ${errors}`);
  } catch (error) {
    console.error(`❌ 迁移失败: ${error.message}`);
    return { migrated: 0, skipped: 0, errors: v1Data.length };
  }

  return { migrated, skipped, errors };
}

/**
 * 显示迁移前预览
 */
function previewMigration(v1Db, tableName) {
  if (!tableExists(v1Db, tableName)) {
    return null;
  }

  const count = getTableCount(v1Db, tableName);
  if (count === 0) {
    return null;
  }

  // 获取一条样本数据
  const sample = v1Db.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get();

  return {
    tableName,
    recordCount: count,
    columns: sample ? Object.keys(sample) : [],
    sample
  };
}

/**
 * 主迁移函数
 */
async function main() {
  console.log('========================================');
  console.log('   V1.1 → V2.0 数据迁移脚本');
  console.log('========================================\n');

  // 确保数据库存在
  ensureV1Database();
  ensureV2Database();

  // 连接数据库
  console.log('🔌 连接数据库...\n');
  const v1Db = openDatabase(V1_DB_PATH);

  // V2.0需要写入权限
  const v2Db = new Database(V2_DB_PATH);
  console.log(`✅ 连接数据库成功: ${V2_DB_PATH}`);

  // 预览要迁移的数据
  console.log('\n📋 迁移预览:');
  console.log('-'.repeat(50));

  for (const tableName of TABLES_TO_MIGRATE) {
    const preview = previewMigration(v1Db, tableName);
    if (preview) {
      console.log(`  ${tableName}: ${preview.recordCount} 条记录`);
    }
  }

  // 确认迁移
  console.log('\n');
  console.log('-'.repeat(50));
  console.log('⚠️  即将开始迁移数据到V2.0数据库');
  console.log(`   V1.1: ${V1_DB_PATH}`);
  console.log(`   V2.0: ${V2_DB_PATH}`);
  console.log('-'.repeat(50));

  // 开始迁移
  console.log('\n🚀 开始迁移...\n');

  const results = {};
  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const tableName of TABLES_TO_MIGRATE) {
    const result = migrateTable(v1Db, v2Db, tableName);
    results[tableName] = result;
    totalMigrated += result.migrated;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }

  // 关闭数据库连接
  v1Db.close();
  v2Db.close();

  // 打印汇总
  console.log('\n========================================');
  console.log('   迁移完成汇总');
  console.log('========================================');
  console.log(`总计: 成功 ${totalMigrated}, 跳过 ${totalSkipped}, 错误 ${totalErrors}`);
  console.log('\n详细结果:');
  for (const [tableName, result] of Object.entries(results)) {
    if (result.migrated > 0 || result.skipped > 0 || result.errors > 0) {
      console.log(`  ${tableName}: 成功 ${result.migrated}, 跳过 ${result.skipped}, 错误 ${result.errors}`);
    }
  }
  console.log('========================================\n');

  if (totalErrors > 0) {
    console.log('⚠️  存在错误，请检查日志');
    process.exit(1);
  } else {
    console.log('✅ 迁移完成！');
  }
}

// 运行迁移
main().catch(error => {
  console.error('迁移过程出错:', error);
  process.exit(1);
});
