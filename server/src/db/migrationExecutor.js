/**
 * 数据迁移执行器
 * Phase 1: 将 localStorage 数据迁移到后端 SQLite 数据库
 *
 * 使用方式:
 *   npx tsx src/db/migrationExecutor.ts
 */

import fs from 'fs';
import path from 'path';
import { getDatabase } from './index.js';

// 使用 process.cwd() 代替 __dirname (tsx 支持 ES 模块语法)
const WORK_DIR = process.cwd();

/**
 * 迁移配置
 */

const DEFAULT_CONFIG= {
  batchSize,
  dryRun,
  forceOverwrite,
};

/**
 * 迁移结果统计
 */

/**
 * localStorage 数据备份加载器
 */
function loadLocalStorageBackup(){
  // 相对于项目根目录
  const backupPath = path.join(WORK_DIR, 'server/src/data/localStorageBackup.json');

  if (!fs.existsSync(backupPath)) {
    console.error('❌ 备份文件不存在:', backupPath);
    console.log('请先在前端执行 backupLocalStorage.backup() 下载备份文件');
    process.exit(1);
  }

  const content = fs.readFileSync(backupPath, 'utf-8');
  const backup = JSON.parse(content);

  return backup.data || backup;
}

/**
 * 迁移执行器类
 */
class MigrationExecutor {db: ReturnType<typeof getDatabase>;config: MigrationConfig;results= [];

  constructor(config= {}) {
    this.db = getDatabase();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 执行所有迁移
   */
  async execute(){
    console.log('='.repeat(60));
    console.log('🚀 数据迁移执行器 v1.0');
    console.log('='.repeat(60));
    console.log(`模式: ${this.config.dryRun ? '🔍 试运行' : '✅ 正式执行'}`);
    console.log(`批次大小: ${this.config.batchSize}`);
    console.log(`强制覆盖: ${this.config.forceOverwrite ? '是' : '否'}`);
    console.log('');

    // 加载备份数据
    console.log('📂 加载 localStorage 备份...');
    const backupData = loadLocalStorageBackup();
    const keys = Object.keys(backupData);
    console.log(`找到 ${keys.length} 个数据项\n`);

    // 按优先级执行迁移
    const migrationOrder = [
      // 1. 基础数据（无依赖）
      { key: 'departments', table: 'departments', transform,
      { key: 'positions', table: 'positions', transform,
      { key: 'teams', table: 'teams', transform,
      { key: 'warehouses', table: 'warehouses', transform,
      { key: 'greenhouses', table: 'greenhouses', transform,
      { key: 'zones', table: 'zones', transform,
      { key: 'blocks', table: 'blocks', transform,

      // 2. 字典数据
      { key: 'dictionary_categories', table: 'dictionary_categories', transform,
      { key: 'dictionaries', table: 'dictionaries', transform,

      // 3. 权限数据
      { key: 'roles', table: 'roles', transform,
      { key: 'permissions', table: 'permissions', transform,
      { key: 'users', table: 'users', transform,
      { key: 'processes', table: 'processes', transform,
      { key: 'actions', table: 'actions', transform,

      // 4. 作物数据（有依赖关系）
      { key: 'crop_instances', table: 'crop_instances', transform,
      { key: 'seed_sources', table: 'seed_sources', transform,
      { key: 'seedlings', table: 'seedlings', transform,
      { key: 'plantings', table: 'plantings', transform,
      { key: 'harvest_records', table: 'harvest_records', transform,
      { key: 'crop_orders', table: 'crop_orders', transform,
      { key: 'crop_batches', table: 'crop_batches', transform,

      // 5. 业务数据
      { key: 'farm_tasks', table: 'farm_tasks', transform,
      { key: 'inspections', table: 'inspections', transform,
      { key: 'problems', table: 'problems', transform,
      { key: 'suppliers', table: 'suppliers', transform,

      // 6. 库存与采购
      { key: 'inventory', table: 'inventory', transform,
      { key: 'production_plans', table: 'production_plans', transform,
      { key: 'purchase_plans', table: 'purchase_plans', transform,

      // 7. 审批数据
      { key: 'approvals', table: 'approvals', transform,
      { key: 'approval_workflows', table: 'approval_workflows', transform,
    ];

    // 执行迁移
    for (const item of migrationOrder) {
      if (backupData[item.key]) {
        await this.migrateTable(item.key, item.table, item.transform.bind(this));
      } else {
        console.log(`⏭️  跳过 ${item.key}（无数据）`);
      }
    }

    // 打印结果
    this.printResults();

    return this.results;
  }

  /**
   * 迁移单个表
   */async migrateTable(
    storageKey,
    tableName,
    transform: (record) => any
  ){
    const startTime = Date.now();
    console.log(`\n📤 迁移 ${storageKey} → ${tableName}...`);

    const backupData = loadLocalStorageBackup();
    const records = backupData[storageKey] || [];
    const result= {
      tableName,
      success: true,
      totalRecords: records.length,
      migratedRecords: 0,
      failedRecords: 0,
      errors: [],
      duration: 0,
    };

    if (records.length === 0) {
      console.log(`  ⏭️  无数据，跳过`);
      this.results.push(result);
      return;
    }

    try {
      // 批量处理
      for (let i = 0; i < records.length; i += this.config.batchSize) {
        const batch = records.slice(i, i + this.config.batchSize);

        for (const record of batch) {
          try {
            const transformed = transform(record);

            if (this.config.dryRun) {
              console.log(`  🔍 [试运行] 会插入:`, JSON.stringify(transformed).slice(0, 100));
              result.migratedRecords++;
            } else {
              // 检查是否已存在
              const existing = this.db.prepare(
                `SELECT id FROM ${tableName} WHERE id = ?`
              ).get(transformed.id);

              if (existing && !this.config.forceOverwrite) {
                console.log(`  ⚠️  跳过已存在: ${transformed.id}`);
                continue;
              }

              // 构建 INSERT 语句
              const columns = Object.keys(transformed);
              const placeholders = columns.map(() => '?').join(', ');
              const values = columns.map(col => {
                const val = transformed[col];
                return typeof val === 'object' ? JSON.stringify(val) : val;
              });

              if (this.config.forceOverwrite && existing) {
                const setClause = columns.map(col => `${col} = ?`).join(', ');
                this.db.prepare(
                  `UPDATE ${tableName} SET ${setClause} WHERE id = ?`
                ).run(...values, transformed.id);
              } else {
                this.db.prepare(
                  `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`
                ).run(...values);
              }
              result.migratedRecords++;
            }
          } catch (err) {
            result.failedRecords++;
            result.errors.push(`${record.id || 'unknown'}: ${err.message}`);
          }
        }

        console.log(`  进度: ${Math.min(i + this.config.batchSize, records.length)}/${records.length}`);
      }

      result.duration = Date.now() - startTime;
      console.log(`  ✅ 成功: ${result.migratedRecords}, 失败: ${result.failedRecords}`);

    } catch (err) {
      result.success = false;
      result.errors.push(`表级错误: ${err.message}`);
      console.log(`  ❌ 迁移失败: ${err.message}`);
    }

    this.results.push(result);
  }

  // ==================== 数据转换函数 ====================transformDepartment(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      name: record.name || '',
      code: record.code || '',
      manager_id: record.manager_id || '',
      manager_name: record.manager_name || '',
      parent_oid: record.parent_oid || '',
      sort_number,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformPosition(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      code: record.code || '',
      name: record.name || '',
      department_oid: record.department_oid || '',
      department_name: record.department_name || '',
      level,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformTeam(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      team_code: record.team_code || '',
      team_name: record.team_name || '',
      department_oid: record.department_oid || '',
      department_name: record.department_name || '',
      leader_id: record.leader_id || '',
      leader_name: record.leader_name || '',
      shift_type: record.shift_type || '',
      member_count,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformWarehouse(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      code: record.code || '',
      name: record.name || '',
      warehouse_type: record.warehouse_type || '',
      location: record.location || '',
      capacity,
      current_stock,
      manager_id: record.manager_id || '',
      manager_name: record.manager_name || '',
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformGreenhouse(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      code: record.code || '',
      name: record.name || '',
      greenhouse_type: record.greenhouse_type || '',
      area,
      location: record.location || '',
      base_oid: record.base_oid || '',
      base_name: record.base_name || '',
      company_id: record.company_id || '',
      company_name: record.company_name || '',
      lng,
      lat,
      crop: record.crop || '',
      growth_day,
      manager: record.manager || '',
      phone: record.phone || '',
      soil_type: record.soil_type || '',
      ph,
      intro: record.intro || '',
      greenhouse_count,
      field_area,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformZone(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      zone_code: record.zone_code || '',
      zone_name: record.zone_name || '',
      greenhouse_oid: record.greenhouse_oid || '',
      greenhouse_name: record.greenhouse_name || '',
      zone_type: record.zone_type || '',
      area,
      sort_order,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformBlock(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      block_code: record.block_code || '',
      block_name: record.block_name || '',
      zone_oid: record.zone_oid || '',
      zone_name: record.zone_name || '',
      block_type: record.block_type || '',
      area,
      sort_order,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformDictionaryCategory(record) {
    return {
      id: record.id || this.generateId(),
      code: record.code || '',
      name: record.name || '',
      module: record.module || '',
      description: record.description || '',
      sort_order,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformDictionary(record) {
    return {
      id: record.id || this.generateId(),
      category_code: record.category_code || '',
      dict_code: record.dict_code || '',
      dict_label: record.dict_label || '',
      dict_value: record.dict_value || '',
      color: record.color || '',
      sort_order,
      is_default: record.is_default ? 1,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformRole(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      role_code: record.role_code || '',
      role_name: record.role_name || '',
      description: record.description || '',
      is_system: record.is_system ? 1,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformPermission(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      permission_code: record.permission_code || '',
      permission_name: record.permission_name || '',
      category: record.category || '',
      description: record.description || '',
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformUser(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      username: record.username || '',
      password_hash: record.password_hash || '',
      real_name: record.real_name || '',
      org_oid: record.org_oid || '',
      org_name: record.org_name || '',
      department_oid: record.department_oid || '',
      department_name: record.department_name || '',
      position: record.position || '',
      email: record.email || '',
      phone: record.phone || '',
      avatar: record.avatar || '',
      status: record.status || 'active',
      last_login: record.last_login || '',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformProcess(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      process_code: record.process_code || '',
      process_name: record.process_name || '',
      category: record.category || '',
      app_type,
      description: record.description || '',
      sort_order,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformAction(record) {
    return {
      id: record.id || this.generateId(),
      oid,
      action_code: record.action_code || '',
      action_name: record.action_name || '',
      category: record.category || '',
      description: record.description || '',
      sort_order,
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformCropInstance(record) {
    return {
      id: record.id || this.generateId(),
      instance_code: record.instance_code || '',
      order_id: record.order_id || '',
      order_code: record.order_code || '',
      crop_category: record.crop_category || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      category_code: record.category_code || '',
      type_code: record.type_code || '',
      sub_code: record.sub_code || '',
      source_origin: record.source_origin || '',
      source_description: record.source_description || '',
      initial_quantity,
      current_quantity,
      planted_quantity,
      harvested_quantity,
      status: record.status || 'seedling',
      seed_entry_date: record.seed_entry_date || '',
      seedling_start_date: record.seedling_start_date || '',
      planting_date: record.planting_date || '',
      harvest_date: record.harvest_date || '',
      source_instance_id: record.source_instance_id || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformSeedSource(record) {
    return {
      id: record.id || this.generateId(),
      source_code: record.source_code || '',
      source_name: record.source_name || '',
      source_type: record.source_type || '',
      source_origin: record.source_origin || '',
      crop_category: record.crop_category || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      type_name: record.type_name || '',
      variety_name: record.variety_name || '',
      crop_code: record.crop_code || '',
      supplier_id: record.supplier_id || '',
      supplier_name: record.supplier_name || '',
      production_plan_code: record.production_plan_code || '',
      quantity,
      unit: record.unit || '',
      purchase_date: record.purchase_date || '',
      purchase_price,
      total_amount,
      used_quantity,
      remaining_quantity,
      status: record.status || 'active',
      remarks: record.remarks || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformSeedling(record) {
    return {
      id: record.id || this.generateId(),
      seedling_code: record.seedling_code || '',
      source_id: record.source_id || '',
      source_name: record.source_name || '',
      production_plan_code: record.production_plan_code || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      seedling_type: record.seedling_type || '',
      greenhouse_name: record.greenhouse_name || '',
      area_name: record.area_name || '',
      seedling_date: record.seedling_date || '',
      expected_finish_date: record.expected_finish_date || '',
      actual_finish_date: record.actual_finish_date || '',
      seedling_quantity,
      survival_quantity,
      survival_rate,
      status: record.status || 'in_progress',
      seedling_status: record.seedling_status || '',
      remarks: record.remarks || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformPlanting(record) {
    return {
      id: record.id || this.generateId(),
      planting_code: record.planting_code || '',
      source_type: record.source_type || '',
      source_id: record.source_id || '',
      source_name: record.source_name || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      greenhouse_name: record.greenhouse_name || '',
      area_name: record.area_name || '',
      planting_date: record.planting_date || '',
      planting_quantity,
      planted_quantity,
      survival_quantity,
      survival_rate,
      growth_status: record.growth_status || '',
      expected_harvest_date: record.expected_harvest_date || '',
      actual_harvest_date: record.actual_harvest_date || '',
      harvest_quantity,
      status: record.status || 'planted',
      remarks: record.remarks || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformHarvest(record) {
    return {
      id: record.id || this.generateId(),
      harvest_code: record.harvest_code || '',
      source_id: record.source_id || '',
      source_name: record.source_name || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      greenhouse_name: record.greenhouse_name || '',
      harvest_date: record.harvest_date || '',
      harvest_quantity,
      unit: record.unit || '',
      unit_price,
      total_amount,
      quality_grade: record.quality_grade || '',
      buyer_id: record.buyer_id || '',
      buyer_name: record.buyer_name || '',
      sales_channel: record.sales_channel || '',
      status: record.status || 'pending',
      remarks: record.remarks || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformCropOrder(record) {
    return {
      id: record.id || this.generateId(),
      order_code: record.order_code || '',
      order_type: record.order_type || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      quantity,
      unit: record.unit || '',
      unit_price,
      total_amount,
      customer_name: record.customer_name || '',
      customer_contact: record.customer_contact || '',
      delivery_address: record.delivery_address || '',
      order_date: record.order_date || '',
      expected_delivery_date: record.expected_delivery_date || '',
      actual_delivery_date: record.actual_delivery_date || '',
      status: record.status || 'pending',
      remarks: record.remarks || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformCropBatch(record) {
    return {
      id: record.id || this.generateId(),
      batch_code: record.batch_code || '',
      batch_name: record.batch_name || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      planting_date: record.planting_date || '',
      expected_harvest_date: record.expected_harvest_date || '',
      status: record.status || 'active',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformFarmTask(record) {
    return {
      id: record.id || this.generateId(),
      task_code: record.task_code || '',
      task_title: record.task_title || '',
      task_type: record.task_type || '',
      task_content: record.task_content || '',
      assignee_id: record.assignee_id || '',
      assignee_name: record.assignee_name || '',
      greenhouse_id: record.greenhouse_id || '',
      greenhouse_name: record.greenhouse_name || '',
      area_name: record.area_name || '',
      plan_date: record.plan_date || '',
      plan_time: record.plan_time || '',
      priority: record.priority || 'medium',
      status: record.status || 'pending',
      completion_date: record.completion_date || '',
      completion_note: record.completion_note || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformInspection(record) {
    return {
      id: record.id || this.generateId(),
      record_code: record.record_code || '',
      inspection_type: record.inspection_type || '',
      inspector_id: record.inspector_id || '',
      inspector_name: record.inspector_name || '',
      greenhouse_name: record.greenhouse_name || '',
      check_date: record.check_date || '',
      check_time: record.check_time || '',
      check_result: record.check_result || '',
      issue_severity: record.issue_severity || '',
      issue_text: record.issue_text || '',
      images: typeof record.images === 'object' ? JSON.stringify(record.images) : record.images || '',
      status: record.status || 'pending',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformProblem(record) {
    return {
      id: record.id || this.generateId(),
      problem_code: record.problem_code || '',
      problem_type: record.problem_type || '',
      title: record.title || '',
      description: record.description || '',
      greenhouse_name: record.greenhouse_name || '',
      reporter_id: record.reporter_id || '',
      reporter_name: record.reporter_name || '',
      assignee_id: record.assignee_id || '',
      assignee_name: record.assignee_name || '',
      priority: record.priority || 'medium',
      status: record.status || 'pending',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformSupplier(record) {
    return {
      id: record.id || this.generateId(),
      supplier_code: record.supplier_code || '',
      supplier_name: record.supplier_name || '',
      contact_person: record.contact_person || '',
      contact_phone: record.contact_phone || '',
      address: record.address || '',
      supplier_type: record.supplier_type || '',
      status: record.status || 'active',
      remarks: record.remarks || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformInventory(record) {
    return {
      id: record.id || this.generateId(),
      harvest_record_id: record.harvest_record_id || '',
      product_code: record.product_code || '',
      crop_name: record.crop_name || '',
      variety: record.variety || '',
      stock_type: record.stock_type || 'product',
      quantity,
      unit: record.unit || '',
      grade: record.grade || '',
      warehouse_id: record.warehouse_id || '',
      warehouse_name: record.warehouse_name || '',
      storage_location: record.storage_location || '',
      harvest_date: record.harvest_date || '',
      storage_date: record.storage_date || '',
      expiration_date: record.expiration_date || '',
      batch_code: record.batch_code || '',
      greenhouse_name: record.greenhouse_name || '',
      planting_mode: record.planting_mode || '',
      production_plan_code: record.production_plan_code || '',
      status: record.status || 'active',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformProductionPlan(record) {
    return {
      id: record.id || this.generateId(),
      plan_code: record.plan_code || '',
      plan_name: record.plan_name || '',
      plan_type: record.plan_type || '',
      crop_name: record.crop_name || '',
      crop_variety: record.crop_variety || '',
      greenhouse_name: record.greenhouse_name || '',
      area_name: record.area_name || '',
      planned_quantity,
      actual_quantity,
      planting_date: record.planting_date || '',
      expected_harvest_date: record.expected_harvest_date || '',
      actual_harvest_date: record.actual_harvest_date || '',
      status: record.status || 'planning',
      priority: record.priority || 'normal',
      remarks: record.remarks || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformPurchasePlan(record) {
    return {
      id: record.id || this.generateId(),
      plan_code: record.plan_code || '',
      plan_title: record.plan_title || '',
      plan_type: record.plan_type || '',
      department_id: record.department_id || '',
      department_name: record.department_name || '',
      applicant_id: record.applicant_id || '',
      applicant_name: record.applicant_name || '',
      apply_date: record.apply_date || '',
      expected_date: record.expected_date || '',
      supplier_id: record.supplier_id || '',
      supplier_name: record.supplier_name || '',
      total_amount,
      priority: record.priority || 'medium',
      status: record.status || 'draft',
      approval_status: record.approval_status || 'pending',
      remarks: record.remarks || '',
      attachments: typeof record.attachments === 'object' ? JSON.stringify(record.attachments) : record.attachments || '',
      create_by: record.create_by || '',
      create_time: record.create_time || new Date().toISOString(),
      update_time: record.update_time || new Date().toISOString(),
    };
  }transformApproval(record) {
    return {
      id: record.id || this.generateId(),
      code: record.code || '',
      type: record.type || '',
      type_name: record.type_name || '',
      category: record.category || '',
      title: record.title || '',
      description: record.description || '',
      applicant_id: record.applicant_id || '',
      applicant_name: record.applicant_name || '',
      applicant_department: record.applicant_department || '',
      apply_date: record.apply_date || '',
      apply_time: record.apply_time || '',
      current_step,
      total_steps,
      approvers: typeof record.approvers === 'object' ? JSON.stringify(record.approvers) : record.approvers || '',
      records: typeof record.records === 'object' ? JSON.stringify(record.records) : record.records || '',
      status: record.status || 'pending',
      business_link: record.business_link || '',
      attachments: typeof record.attachments === 'object' ? JSON.stringify(record.attachments) : record.attachments || '',
      priority: record.priority || 'normal',
      due_date: record.due_date || '',
      reminder_count,
      related_batch_code: record.related_batch_code || '',
      related_task_ids: record.related_task_ids || '',
      notification_sent: record.notification_sent ? 1,
      amount: record.amount || '',
      materials: typeof record.materials === 'object' ? JSON.stringify(record.materials) : record.materials || '',
      workflow_id: record.workflow_id || '',
      workflow_name: record.workflow_name || '',
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }transformApprovalWorkflow(record) {
    return {
      id: record.id || this.generateId(),
      name: record.name || '',
      code: record.code || '',
      description: record.description || '',
      module: record.module || '',
      business_type: record.business_type || '',
      trigger_condition: record.trigger_condition || '',
      nodes: typeof record.nodes === 'object' ? JSON.stringify(record.nodes) : record.nodes || '',
      status: record.status || 'active',
      version,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
  }generateId(){
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 打印迁移结果
   */printResults(){
    console.log('\n' + '='.repeat(60));
    console.log('📊 迁移结果汇总');
    console.log('='.repeat(60));

    const totalRecords = this.results.reduce((sum, r) => sum + r.totalRecords, 0);
    const totalMigrated = this.results.reduce((sum, r) => sum + r.migratedRecords, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failedRecords, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`总记录数: ${totalRecords}`);
    console.log(`成功迁移: ${totalMigrated}`);
    console.log(`失败记录: ${totalFailed}`);
    console.log(`总耗时: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('-'.repeat(60));

    this.results.forEach(r => {
      const icon = r.success ? '✅' : '❌';
      const status = r.failedRecords > 0 ? `(${r.failedRecords}失败)` : '';
      console.log(`${icon} ${r.tableName}: ${r.migratedRecords}/${r.totalRecords} ${status} (${(r.duration / 1000).toFixed(2)}s)`);
    });

    console.log('='.repeat(60));
  }
}

// 主执行
const args = process.argv.slice(2);
const config= {
  dryRun: args.includes('--dry-run'),
  forceOverwrite: args.includes('--force'),
  batchSize: parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '100'),
};

const executor = new MigrationExecutor(config);
executor.execute().catch(console.error);
