/**
 * 数据字典与系统配置服务
 * V5.0 系统设置重构
 * 提供统一的数据字典、仓库、基地、温室管理接口
 */

import { enhancedApiClient as apiClient } from '../lib/apiClient';

// ============================================
// 数据字典模块配置
// ============================================

export const DICTIONARY_MODULES = [
  {
    code: 'labor',
    name: '人工管理',
    icon: 'Users',
    categories: [
      'approval_status', 'attendance_status', 'contract_type', 'contract_status',
      'employee_status', 'gender', 'insurance_type', 'leave_type',
      'onboarding_status', 'overtime_type', 'position_level', 'position_type',
      'recruitment_source', 'resignation_reason', 'resignation_type', 'return_status',
      'salary_status', 'skill_status', 'temp_worker_source', 'temp_worker_status',
      'worker_status', 'worker_type', 'responsible_person'
    ]
  },
  {
    code: 'supply',
    name: '供应链管理',
    icon: 'Truck',
    categories: [
      'material_status', 'material_type', 'purchase_type', 'material_cost_type',
      'supplier_attribute', 'supplier_status', 'supplier_type', 'supplier_is_internal'
    ]
  },
  {
    code: 'production',
    name: '生产种植',
    icon: 'Sprout',
    categories: [
      'crop_category', 'operator', 'planting_area', 'planting_mode',
      'planting_status', 'process_type', 'propagation_multiple',
      'seedling_plan_type', 'seedling_site', 'seedling_type', 'survival_rate_target',
      'planting_source_type', 'production_plan_type', 'calculate_mode',
      // 生产汇总表配置（V8.0新增）
      'problem_config', 'yield_config', 'cost_config', 'labor_config',
      'batch_summary_config', 'alert_threshold', 'report_display_config',
      'farm_activity_type'
    ]
  },
  {
    code: 'seed',
    name: '种源管理',
    icon: 'Flower2',
    categories: ['source_origin', 'source_type', 'stock_form']
  },
  {
    code: 'inventory',
    name: '库存管理',
    icon: 'Warehouse',
    categories: [
      'harvest_status', 'harvest_type', 'inbound_type',
      'target_inventory', 'warehouse_location', 'warehouse', 'yes_no', 'is_supplementary'
    ]
  },
  {
    code: 'facility',
    name: '设备设施',
    icon: 'Building',
    categories: ['greenhouse_status', 'greenhouse_type', 'work_zone', 'harvest_greenhouse', 'energy_type']
  },
  {
    code: 'quality',
    name: '质量管理',
    icon: 'CheckCircle',
    categories: ['quality_grade', 'quality_level']
  },
  {
    code: 'task',
    name: '任务通用',
    icon: 'ClipboardList',
    categories: ['announcement_category', 'cost_category', 'performance_status', 'task_priority', 'task_status', 'unit']
  },
  {
    code: 'approval',
    name: '审批配置',
    icon: 'Shield',
    categories: [
      'approval_level',        // 审批级别
      'approval_level_config', // 级别配置
      'amount_threshold',       // 金额阈值
      'approval_rule',          // 审批规则
      'timeout_config',          // 超时配置
      'delegation_rule',        // 委托规则
      'approval_flow',          // 审批流程配置
      'leave_config',            // 请假配置
      'overtime_config',        // 加班配置
      'order_config',           // 订单配置
      'budget_config',          // 预算配置
      'batch_config',           // 批次配置
      'recruitment_config',     // 招聘配置
      'notification_config',     // 系统通知配置
    ]
  }
];

// 获取分类所属的模块
export function getCategoryModule(category) {
  for (const mod of DICTIONARY_MODULES) {
    if (mod.categories.includes(category)) {
      return mod.code;
    }
  }
  return null;
}

// 按模块分组获取分类
export function getCategoriesByModule() {
  const result = {};
  for (const mod of DICTIONARY_MODULES) {
    result[mod.code] = mod.categories;
  }
  return result;
}

// ============================================
// 分类中文翻译映射
// ============================================

// 分类名称中文翻译
export const CATEGORY_CHINESE_NAMES = {
  // 审批相关
  approval_status: '审批状态',
  // 考勤相关
  attendance_status: '考勤状态',
  leave_type: '请假类型',
  // 合同相关
  contract_status: '合同状态',
  contract_type: '合同类型',
  // 成本相关
  cost_category: '成本分类',
  // 作物相关
  crop_category: '作物类别',
  // 人事相关
  employee_status: '员工状态',
  gender: '性别',
  recruitment_source: '招聘来源',
  onboarding_status: '入职状态',
  resignation_reason: '离职原因',
  resignation_type: '离职类型',
  return_status: '归还状态',
  // 温室相关
  greenhouse_status: '温室状态',
  greenhouse_type: '温室类型',
  // 采收相关
  harvest_status: '采收状态',
  harvest_greenhouse: '采收区域',
  // 保险相关
  insurance_type: '保险类型',
  // 物料相关
  material_status: '物料状态',
  material_type: '物料类型',
  material_cost_type: '物料成本类型',
  // 操作相关
  operator: '操作人员',
  // 加班相关
  overtime_type: '加班类型',
  // 绩效相关
  performance_status: '考核状态',
  // 种植相关
  planting_area: '种植区域',
  planting_mode: '种植模式',
  planting_status: '种植状态',
  planting_source_type: '种植来源类型',
  // 岗位相关
  position_level: '岗位职级',
  position_type: '岗位类型',
  // 扩繁相关
  propagation_multiple: '扩繁倍数',
  // 采购相关
  purchase_type: '采购类型',
  // 临时工相关
  temp_worker_source: '临时工来源',
  temp_worker_status: '临时工状态',
  // 技能相关
  skill_status: '技能状态',
  // 种源相关
  source_origin: '来源途径',
  source_type: '种源类型',
  stock_form: '库存形态',
  // 供应商相关
  supplier_attribute: '供应商属性',
  supplier_status: '供应商状态',
  supplier_type: '供应商类型',
  supplier_is_internal: '供应商是否内部',
  // 成活率相关
  survival_rate_target: '目标成活率',
  // 任务相关
  task_status: '任务状态',
  task_priority: '任务优先级',
  announcement_category: '公告分类',
  // 仓库相关
  warehouse_location: '仓库位置',
  warehouse: '仓库',
  // 作业区域
  work_zone: '作业区域',
  // 工人相关
  worker_status: '工人状态',
  worker_type: '工人类型',
  // 薪资相关
  salary_status: '薪资状态',
  // 育苗相关
  seedling_plan_type: '育苗计划类型',
  seedling_site: '育苗场地',
  seedling_type: '育苗方式',
  // 审批配置相关
  approval_level: '审批级别',
  approval_level_config: '级别配置',
  amount_threshold: '金额阈值',
  approval_rule: '审批规则',
  timeout_config: '超时配置',
  delegation_rule: '委托规则',
  approval_flow: '审批流程配置',
  leave_config: '请假配置',
  overtime_config: '加班配置',
  order_config: '订单配置',
  budget_config: '预算配置',
  batch_config: '批次配置',
  recruitment_config: '招聘配置',
  notification_config: '系统通知配置',
  // 生产汇总表配置（V8.0新增）
  problem_config: '问题统计配置',
  yield_config: '产量统计配置',
  cost_config: '成本统计配置',
  labor_config: '人工统计配置',
  batch_summary_config: '批次汇总配置',
  alert_threshold: '预警阈值配置',
  report_display_config: '报表显示配置',
  farm_activity_type: '农事任务类型',
  // 新增分类
  calculate_mode: '计算模式',
  energy_type: '能源类型',
  is_supplementary: '是否补录',
  production_plan_type: '生产计划类型',
  quality_level: '品质等级',
  quality_grade: '品质等级',
  responsible_person: '负责人',
  unit: '单位',
  yes_no: '是否',
  // 库存管理相关
  inbound_type: '入库类型',
  target_inventory: '目标库存',
  harvest_type: '采收类型',
};

// 获取分类的中文名称
export function getCategoryChineseName(category) {
  return CATEGORY_CHINESE_NAMES[category] || category;
}

// 系统默认用户配置键名
export const DEFAULT_USERNAME_KEY = 'default_username';
export const DEFAULT_USERNAME_VALUE = '陆启闯';

// ============================================
// 数据字典 localStorage 配置
// ============================================

const DICTIONARY_STORAGE_KEY = 'yuanxingtu_dictionaries';
const DICTIONARY_CATEGORIES_STORAGE_KEY = 'yuanxingtu_dictionary_categories';

// 默认数据字典（API不可用时的回退）
const DEFAULT_DICTIONARIES = [];

// ============================================
// 数据字典 API
// ============================================

/**
 * 获取字典列表
 * 优先从后端API获取，失败时降级到 localStorage
 * 后端返回字段: category_code, dict_code, dict_label, dict_value, sort_order, status, created_at, updated_at
 * 前端期望字段: category, code, name, sortNumber, status, createdAt, updatedAt
 *
 * P1-5: 改用 enhancedApiClient 统一处理 401 token 过期重试逻辑
 */
export async function getDictionaries(category) {
  // 使用相对路径，与V1.1保持一致
  let url = '/dictionary/dictionaries';
  if (category) {
    url += `?category=${encodeURIComponent(category)}`;
  }

  try {
    // enhancedApiClient 内部已实现 401 → 清 token → 不带 token 重试
    const data = await apiClient.get(url, { retryCount: 1 });

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('API 返回空数据');
    }

    // 字段映射：将后端字段转换为前端字段
    const mappedData = data.map((item) => ({
      id: item.id,
      category: item.category_code,
      code: item.dict_code,
      name: item.dict_label,
      displayName: item.display_name || item.dict_label,
      sortNumber: item.sort_order,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    // API成功时同步到 localStorage
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(mappedData));
    return mappedData;
  } catch (error) {
    console.warn('[DictionaryService] API获取失败，降级到localStorage:', error);

    // API失败时尝试从 localStorage 读取
    const stored = localStorage.getItem(DICTIONARY_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // 如果有分类过滤
        if (category) {
          return parsed.filter(d => d.category === category);
        }
        return parsed;
      } catch {
        return DEFAULT_DICTIONARIES;
      }
    }
    return DEFAULT_DICTIONARIES;
  }
}

/**
 * 获取字典分类列表
 * 优先从后端API获取，失败时降级到 localStorage
 *
 * P1-5: 改用 enhancedApiClient 统一处理 401 token 过期重试
 */
export async function getDictionaryCategories() {
  try {
    const data = await apiClient.get('/dictionary/dictionaries/categories', { retryCount: 1 });

    if (Array.isArray(data) && data.length > 0) {
      // API成功时同步到 localStorage
      localStorage.setItem(DICTIONARY_CATEGORIES_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.warn('[DictionaryService] 获取分类失败，降级到localStorage:', error);

    // API失败时尝试从 localStorage 读取
    const stored = localStorage.getItem(DICTIONARY_CATEGORIES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }
}

/**
 * 保存字典（新增或更新）
 * 前端字段: category, code, name, sortNumber -> 后端字段: category_code, dict_code, dict_label, sort_order
 *
 * P1-5: 改用 enhancedApiClient 统一处理 401 token 过期重试
 */
export async function saveDictionaries(data) {
  // 转换字段格式：前端 -> 后端
  const convertToBackend = (dict) => ({
    id: dict.id,
    category_code: dict.category,
    dict_code: dict.code,
    dict_label: dict.name,
    dict_value: dict.name,
    display_name: dict.displayName || dict.name,
    sort_order: dict.sortNumber || 0,
  });

  const backendData = {
    inserted: data.inserted.map(convertToBackend),
    updated: data.updated.map(convertToBackend),
    deleted: data.deleted,
  };

  try {
    const result = await apiClient.post(
      '/dictionary/dictionaries',
      backendData,
      { retryCount: 1 }
    );

    // 保存成功后，同步更新 localStorage
    const stored = localStorage.getItem(DICTIONARY_STORAGE_KEY);
    if (stored) {
      try {
        let currentData = JSON.parse(stored);

        // 处理新增
        if (data.inserted.length > 0) {
          const insertedWithIds = data.inserted.map(dict => ({
            ...dict,
            id: dict.id || `DICT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }));
          currentData = [...currentData, ...insertedWithIds];
        }

        // 处理更新
        if (data.updated.length > 0) {
          currentData = currentData.map(dict => {
            const updated = data.updated.find(u => u.id === dict.id);
            return updated ? { ...dict, ...updated } : dict;
          });
        }

        // 处理删除
        if (data.deleted.length > 0) {
          currentData = currentData.filter(dict => !data.deleted.includes(dict.id || ''));
        }

        localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(currentData));
      } catch (e) {
        console.warn('[DictionaryService] 同步localStorage失败:', e);
      }
    }

    return result;
  } catch (error) {
    console.error('[DictionaryService] 保存字典失败:', error);
    throw error;
  }
}

// ============================================
// 系统配置 API
// ============================================

/**
 * 获取系统配置列表
 * 优先从API获取，失败时使用本地存储
 */
export async function getSystemConfigs(configKey) {
  // 本地存储的回退数据
  const LOCAL_STORAGE_KEY = 'yuanxingtu_system_configs';
  const DEFAULT_CONFIGS = [
    { id: '1', configKey: 'system_name', configValue: '智慧种植生产管理系统', configType: 'string', description: '系统显示名称' },
    { id: '2', configKey: 'system_version', configValue: 'V3.0.0', configType: 'string', description: '当前系统版本' },
    { id: '3', configKey: 'demo_mode', configValue: 'true', configType: 'boolean', description: '是否启用演示模式' },
    { id: '4', configKey: 'theme_color', configValue: 'emerald', configType: 'string', description: '系统主题色' },
    { id: '5', configKey: 'page_size', configValue: '10', configType: 'number', description: '列表默认分页大小' },
    { id: '6', configKey: 'enable_notifications', configValue: 'true', configType: 'boolean', description: '是否启用系统通知' },
    { id: '7', configKey: DEFAULT_USERNAME_KEY, configValue: DEFAULT_USERNAME_VALUE, configType: 'string', description: '系统默认用户名' },
  ];

  let url = '/dictionary/system-configs';
  if (configKey) {
    url += `?configKey=${encodeURIComponent(configKey)}`;
  }

  try {
    const data = await apiClient.get(url);
    // API成功时保存到本地存储
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    // API失败时尝试从本地存储读取
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_CONFIGS;
      }
    }
    return DEFAULT_CONFIGS;
  }
}

/**
 * 保存系统配置（新增或更新）
 */
export async function saveSystemConfigs(data) {
  return apiClient.post('/dictionary/system-configs', data);
}

// ============================================
// 仓库 API
// ============================================

const WAREHOUSE_STORAGE_KEY = 'yuanxingtu_warehouses';
const DEFAULT_WAREHOUSES = [
  { id: '1', warehouseCode: 'WH001', warehouseName: '主仓库', warehouseType: 'main', location: '园区A区', capacity: 1000 },
  { id: '2', warehouseCode: 'WH002', warehouseName: '冷藏仓库', warehouseType: 'cold', location: '园区B区', capacity: 500 },
];

export async function getWarehouses(status) {
  let url = '/dictionary/warehouses';
  if (status) {
    url += `?status=${encodeURIComponent(status)}`;
  }

  try {
    const data = await apiClient.get(url);
    localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    const stored = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return status ? parsed.filter((w) => w.status === status) : parsed;
      } catch {
        return DEFAULT_WAREHOUSES;
      }
    }
    return DEFAULT_WAREHOUSES;
  }
}

/**
 * 保存仓库（新增或更新）
 */
export async function saveWarehouses(data) {
  return apiClient.post('/dictionary/warehouses', data);
}

// ============================================
// 基地 API
// ============================================

const BASE_STORAGE_KEY = 'yuanxingtu_bases';
const DEFAULT_BASES = [
  { id: '1', baseCode: 'BASE001', baseName: '宁波基地', location: '宁波市', area: 100 },
  { id: '2', baseCode: 'BASE002', baseName: '杭州基地', location: '杭州市', area: 80 },
];

/**
 * 获取基地列表
 */
export async function getBases(status, orgOid) {
  const queryParts = [];
  if (status) {
    queryParts.push(`status=${encodeURIComponent(status)}`);
  }
  if (orgOid) {
    queryParts.push(`orgOid=${encodeURIComponent(orgOid)}`);
  }
  const url = '/dictionary/bases' + (queryParts.length > 0 ? `?${queryParts.join('&')}` : '');

  try {
    const data = await apiClient.get(url);
    localStorage.setItem(BASE_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    const stored = localStorage.getItem(BASE_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_BASES;
      }
    }
    return DEFAULT_BASES;
  }
}

/**
 * 保存基地（新增或更新）
 */
export async function saveBases(data) {
  return apiClient.post('/dictionary/bases', data);
}

// ============================================
// 温室 API
// ============================================

const GREENHOUSE_STORAGE_KEY = 'yuanxingtu_greenhouses';
const DEFAULT_GREENHOUSES = [
  { id: '1', greenhouseCode: 'GH001', greenhouseName: '1号温室', baseOid: '1', greenhouseType: 'standard', area: 500 },
  { id: '2', greenhouseCode: 'GH002', greenhouseName: '2号温室', baseOid: '1', greenhouseType: 'standard', area: 500 },
];

export async function getGreenhouses(status, baseOid) {
  const queryParts = [];
  if (status) {
    queryParts.push(`status=${encodeURIComponent(status)}`);
  }
  if (baseOid) {
    queryParts.push(`baseOid=${encodeURIComponent(baseOid)}`);
  }
  const url = '/dictionary/greenhouses' + (queryParts.length > 0 ? `?${queryParts.join('&')}` : '');

  try {
    const data = await apiClient.get(url);
    localStorage.setItem(GREENHOUSE_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    const stored = localStorage.getItem(GREENHOUSE_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_GREENHOUSES;
      }
    }
    return DEFAULT_GREENHOUSES;
  }
}

/**
 * 保存温室（新增或更新）
 */
export async function saveGreenhouses(data) {
  return apiClient.post('/dictionary/greenhouses', data);
}
