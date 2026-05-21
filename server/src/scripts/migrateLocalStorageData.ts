/**
 * 数据迁移脚本 - localStorage → 后端数据库
 *
 * 安全策略：
 * 1. 只读取 localStorage，不删除任何数据
 * 2. 迁移时只添加后端没有的记录（按 id 或 code 判断）
 * 3. 不覆盖后端已有数据
 * 4. 生成详细的迁移报告
 *
 * 使用方法：node dist/scripts/migrateLocalStorageData.js
 */

import { getDatabase } from '../db/index';

// localStorage key → 后端表名 → 唯一标识字段
const MIGRATION_MAP: Record<string, { table: string; idField: string; name: string }> = {
  // 作物管理
  'announcement_notices': { table: 'announcements', idField: 'id', name: '公告通知' },
  'indicators_data': { table: 'indicators', idField: 'id', name: '指标数据' },
  'crop_orders': { table: 'crop_orders', idField: 'id', name: '作物订单' },
  'crop_instances': { table: 'crop_instances', idField: 'id', name: '作物实例' },
  'crop_seed_sources': { table: 'seed_sources', idField: 'id', name: '种子来源' },
  'crop_seedlings': { table: 'seedlings', idField: 'id', name: '秧苗数据' },
  'crop_plantings': { table: 'plantings', idField: 'id', name: '种植记录' },
  'harvest_records': { table: 'harvest_records', idField: 'id', name: '采收记录' },
  'crop_batches': { table: 'crop_batches', idField: 'id', name: '作物批次' },
  'crop_varieties': { table: 'crop_varieties', idField: 'id', name: '作物品种' },

  // 人工管理
  'OVERTIME_RECORDS': { table: 'overtime_records', idField: 'id', name: '加班记录' },
  'SALARY_RECORDS': { table: 'salary_records', idField: 'id', name: '工资记录' },
  'LEAVE_QUOTAS': { table: 'leave_quotas', idField: 'id', name: '请假配额' },

  // 库存/采购
  'system_warehouses': { table: 'warehouses', idField: 'id', name: '仓库数据' },
  'system_greenhouses': { table: 'greenhouses', idField: 'id', name: '温室数据' },
  'system_departments': { table: 'departments', idField: 'id', name: '部门数据' },
  'suppliers': { table: 'suppliers', idField: 'id', name: '供应商' },
  'inventory_stock_v3': { table: 'inventory', idField: 'id', name: '库存数据' },
  'inventory_transaction_v3': { table: 'inventory', idField: 'id', name: '库存事务' },
  'inventory_freeze_v3': { table: 'inventory', idField: 'id', name: '库存冻结' },
  'production_plans': { table: 'production_plans', idField: 'id', name: '生产计划' },
  'purchase_plans': { table: 'purchase_plans', idField: 'id', name: '采购计划' },

  // 字典/配置
  'yuanxingtu_dictionaries': { table: 'dictionaries', idField: 'id', name: '字典数据' },
  'yuanxingtu_dictionary_categories': { table: 'dictionary_categories', idField: 'id', name: '字典分类' },
  'yuanxingtu_system_configs': { table: 'system_configs', idField: 'id', name: '系统配置' },

  // 技术方案
  'tech_solutions': { table: 'tech_solutions', idField: 'id', name: '技术方案' },

  // 成本数据
  'MATERIAL_COSTS_KEY': { table: 'material_costs', idField: 'id', name: '材料成本' },
  'ENERGY_COSTS_KEY': { table: 'energy_costs', idField: 'id', name: '能源成本' },

  // 临时任务相关
  'yuanxingtu_tempTasks': { table: 'temp_tasks', idField: 'id', name: '临时任务' },
  'yuanxingtu_tasks': { table: 'farm_tasks', idField: 'id', name: '农事任务' },

  // 巡查/问题
  'yuanxingtu_inspections': { table: 'inspections', idField: 'id', name: '巡检记录' },
  'yuanxingtu_daily_problems': { table: 'problems', idField: 'id', name: '日常问题' },

  // 考勤
  'yuanxingtu_attendance': { table: 'attendance_records', idField: 'id', name: '考勤数据' },

  // 工作日志
  'yuanxingtu_worklogs': { table: 'labor_records', idField: 'id', name: '工作日志' },

  // 操作记录
  'yuanxingtu_operationRecords': { table: 'task_operation_records', idField: 'id', name: '操作记录' },
};

interface MigrationResult {
  key: string;
  name: string;
  localCount: number;
  dbCount: number;
  addedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  success: boolean;
}

/**
 * 获取后端数据库中已存在的 ID 列表
 */
function getExistingIds(table: string, idField: string): Set<string> {
  const db = getDatabase();
  const ids = new Set<string>();

  try {
    const results = db.exec(`SELECT ${idField} FROM ${table}`);
    if (results.length > 0 && results[0].values) {
      for (const row of results[0].values) {
        if (row[0]) {
          ids.add(String(row[0]));
        }
      }
    }
  } catch (error) {
    console.log(`  ⚠️  表 ${table} 可能不存在或查询失败`);
  }

  return ids;
}

/**
 * 插入数据到后端数据库
 */
function insertToDatabase(table: string, data: Record<string, any>[]): { added: number; errors: string[] } {
  const db = getDatabase();
  let added = 0;
  const errors: string[] = [];

  if (!data || data.length === 0) {
    return { added, errors };
  }

  for (const record of data) {
    try {
      // 获取表的列名
      const columns = Object.keys(record);
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map(col => {
        const val = record[col];
        if (val === undefined || val === null) return null;
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });

      const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      db.run(sql, values);
      added++;
    } catch (error: any) {
      errors.push(`  ❌ ID ${record.id || record.code || 'unknown'}: ${error.message}`);
    }
  }

  return { added, errors };
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `migrated_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 执行迁移
 */
async function migrate() {
  console.log('='.repeat(60));
  console.log('🔄 数据迁移脚本 - localStorage → 后端数据库');
  console.log('='.repeat(60));
  console.log('');

  const results: MigrationResult[] = [];

  // 由于这是 Node.js 脚本，不能直接访问浏览器的 localStorage
  // 这个脚本需要在前端环境运行，或者通过 API 调用
  // 这里提供一个模板，实际迁移需要在前端执行

  console.log('⚠️  注意：此脚本需要在浏览器环境中执行');
  console.log('    建议通过以下方式之一执行：');
  console.log('    1. 在浏览器控制台运行迁移代码');
  console.log('    2. 创建前端页面执行迁移');
  console.log('    3. 通过 Puppeteer 等工具执行');
  console.log('');

  // 这里只是打印迁移计划
  console.log('📋 迁移计划：');
  console.log('-'.repeat(60));

  for (const [key, config] of Object.entries(MIGRATION_MAP)) {
    console.log(`  ${config.name}: ${key} → ${config.table}`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('📝 迁移模板已准备好');
  console.log('='.repeat(60));

  return results;
}

// 导出迁移配置供前端使用
export { MIGRATION_MAP };
export type { MigrationResult };

// 如果直接运行此脚本
if (require.main === module) {
  migrate().catch(console.error);
}
