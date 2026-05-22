/**
 * 作物品种库扩展服务
 * 存储用户新增的类型、品种、子品种扩展数据
 * 使用内存缓存 + localStorage
 */

// 内存缓存
let categoryExtensionsCache = [];
let typeExtensionsCache = [];
let varietyExtensionsCache = [];
let subVariety1ExtensionsCache = [];
let isCacheInitialized = false;

// localStorage 存储键
const EXTENSION_STORAGE_KEY = 'crop_variety_extensions';

/**
 * 初始化扩展缓存
 */
export async function initExtensionCache() {
  if (isCacheInitialized) return;

  try {
    // 从 localStorage 加载扩展数据
    const stored = localStorage.getItem(EXTENSION_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      categoryExtensionsCache = data.categories || [];
      typeExtensionsCache = data.types || [];
      varietyExtensionsCache = data.varieties || [];
      subVariety1ExtensionsCache = data.subVariety1s || [];
    }
    isCacheInitialized = true;
  } catch (error) {
    console.error('初始化扩展缓存失败:', error);
  }
}

/**
 * 保存扩展数据到 localStorage
 */
function saveExtensions() {
  const data = {
    categories: categoryExtensionsCache,
    types: typeExtensionsCache,
    varieties: varietyExtensionsCache,
    subVariety1s: subVariety1ExtensionsCache
  };
  localStorage.setItem(EXTENSION_STORAGE_KEY, JSON.stringify(data));
}

/**
 * 获取所有扩展类别
 */
export function getCategoryExtensions() {
  return categoryExtensionsCache.filter(c => c.status !== 'inactive');
}

/**
 * 添加类别扩展
 */
export async function addCategoryExtension(categoryCode, categoryName) {
  const exists = categoryExtensionsCache.some(c => c.category_code === categoryCode);
  if (exists) {
    throw new Error('该类别编码已存在');
  }

  const newExtension = {
    id: `CE${Date.now()}`,
    category_code: categoryCode,
    category_name: categoryName,
    status: 'active',
    createTime: new Date().toLocaleString('zh-CN')
  };

  categoryExtensionsCache.push(newExtension);
  saveExtensions();
  return newExtension;
}

/**
 * 获取指定类别的所有扩展类型
 */
export function getTypeExtensions(categoryCode) {
  return typeExtensionsCache.filter(t => t.category_code === categoryCode);
}

/**
 * 添加类型扩展
 */
export async function addTypeExtension(categoryCode, typeCode, typeName) {
  const exists = typeExtensionsCache.some(
    t => t.category_code === categoryCode && t.type_code === typeCode
  );
  if (exists) {
    throw new Error('该类型编码已存在');
  }

  const newExtension = {
    id: `TE${Date.now()}`,
    category_code: categoryCode,
    type_code: typeCode,
    type_name: typeName,
    status: 'active',
    createTime: new Date().toLocaleString('zh-CN')
  };

  typeExtensionsCache.push(newExtension);
  saveExtensions();
  return newExtension;
}

/**
 * 更新类型扩展
 */
export async function updateTypeExtension(id, typeName) {
  const index = typeExtensionsCache.findIndex(t => t.id === id);
  if (index === -1) throw new Error('类型不存在');

  typeExtensionsCache[index] = {
    ...typeExtensionsCache[index],
    type_name: typeName
  };
  saveExtensions();
}

/**
 * 删除类型扩展
 */
export async function deleteTypeExtension(id) {
  typeExtensionsCache = typeExtensionsCache.filter(t => t.id !== id);
  saveExtensions();
}

/**
 * 获取指定类型的所有扩展品种
 */
export function getVarietyExtensions(categoryCode, typeCode) {
  return varietyExtensionsCache.filter(
    v => v.category_code === categoryCode && v.type_code === typeCode
  );
}

/**
 * 添加品种扩展
 */
export async function addVarietyExtension(categoryCode, typeCode, varietyCode, varietyName) {
  const exists = varietyExtensionsCache.some(
    v => v.category_code === categoryCode && v.type_code === typeCode && v.variety_code === varietyCode
  );
  if (exists) {
    throw new Error('该品种编码已存在');
  }

  const newExtension = {
    id: `VE${Date.now()}`,
    category_code: categoryCode,
    type_code: typeCode,
    variety_code: varietyCode,
    variety_name: varietyName,
    status: 'active',
    createTime: new Date().toLocaleString('zh-CN')
  };

  varietyExtensionsCache.push(newExtension);
  saveExtensions();
  return newExtension;
}

/**
 * 更新品种扩展
 */
export async function updateVarietyExtension(id, varietyName) {
  const index = varietyExtensionsCache.findIndex(v => v.id === id);
  if (index === -1) throw new Error('品种不存在');

  varietyExtensionsCache[index] = {
    ...varietyExtensionsCache[index],
    variety_name: varietyName
  };
  saveExtensions();
}

/**
 * 删除品种扩展
 */
export async function deleteVarietyExtension(id) {
  varietyExtensionsCache = varietyExtensionsCache.filter(v => v.id !== id);
  saveExtensions();
}

/**
 * 获取指定品种的所有扩展子品种1
 */
export function getSubVariety1Extensions(categoryCode, typeCode, varietyCode) {
  return subVariety1ExtensionsCache.filter(
    s => s.category_code === categoryCode && s.type_code === typeCode && s.variety_code === varietyCode
  );
}

/**
 * 添加子品种1扩展
 */
export async function addSubVariety1Extension(categoryCode, typeCode, varietyCode, subVariety1Code, subVariety1Name) {
  const exists = subVariety1ExtensionsCache.some(
    s => s.category_code === categoryCode &&
         s.type_code === typeCode &&
         s.variety_code === varietyCode &&
         s.sub_variety1_code === subVariety1Code
  );
  if (exists) {
    throw new Error('该子品种编码已存在');
  }

  const newExtension = {
    id: `S1E${Date.now()}`,
    category_code: categoryCode,
    type_code: typeCode,
    variety_code: varietyCode,
    sub_variety1_code: subVariety1Code,
    sub_variety1_name: subVariety1Name,
    status: 'active',
    createTime: new Date().toLocaleString('zh-CN')
  };

  subVariety1ExtensionsCache.push(newExtension);
  saveExtensions();
  return newExtension;
}

/**
 * 更新子品种1扩展
 */
export async function updateSubVariety1Extension(id, subVariety1Name) {
  const index = subVariety1ExtensionsCache.findIndex(s => s.id === id);
  if (index === -1) throw new Error('子品种不存在');

  subVariety1ExtensionsCache[index] = {
    ...subVariety1ExtensionsCache[index],
    sub_variety1_name: subVariety1Name
  };
  saveExtensions();
}

/**
 * 删除子品种1扩展
 */
export async function deleteSubVariety1Extension(id) {
  subVariety1ExtensionsCache = subVariety1ExtensionsCache.filter(s => s.id !== id);
  saveExtensions();
}

/**
 * 获取指定类别的类型选项（合并预配置和扩展数据）
 */
export function getTypeOptionsByCategory(categoryCode) {
  // 从预配置数据获取类型选项
  const { getTypeOptionsByCategory: getConfigTypeOptions } = require('./cropVarietyService.js');
  const configOptions = getConfigTypeOptions(categoryCode);

  // 从扩展缓存获取用户新增的类型
  const extensions = typeExtensionsCache.filter(
    t => t.category_code === categoryCode
  );

  const extensionOptions = extensions.map(e => ({
    value: e.type_code,
    label: e.type_name
  }));

  // 合并选项（扩展选项在前，预配置选项在后去重）
  const allOptions = [...extensionOptions];
  configOptions.forEach(opt => {
    if (!allOptions.some(o => o.value === opt.value)) {
      allOptions.push(opt);
    }
  });

  return allOptions;
}

/**
 * 获取指定类型下的品种选项（合并预配置和扩展数据）
 */
export function getVarietyOptionsByType(categoryCode, typeCode) {
  // 从预配置数据获取品种选项
  const { getVarietyOptionsByType: getConfigVarietyOptions } = require('./cropVarietyService.js');
  const configOptions = getConfigVarietyOptions(categoryCode, typeCode);

  // 从扩展缓存获取用户新增的品种
  const extensions = varietyExtensionsCache.filter(
    v => v.category_code === categoryCode && v.type_code === typeCode
  );

  const extensionOptions = extensions.map(e => ({
    value: e.variety_code,
    label: e.variety_name
  }));

  // 合并选项
  const allOptions = [...extensionOptions];
  configOptions.forEach(opt => {
    if (!allOptions.some(o => o.value === opt.value)) {
      allOptions.push(opt);
    }
  });

  return allOptions;
}

/**
 * 获取指定品种的子品种选项（合并预配置和扩展数据）
 */
export function getSubVariety1Options(categoryCode, typeCode, varietyCode) {
  // 从预配置数据获取子品种选项
  const { getSubVariety1Options: getConfigSubVariety1Options } = require('./cropVarietyService.js');
  const configOptions = getConfigSubVariety1Options(categoryCode, typeCode, varietyCode);

  // 从扩展缓存获取用户新增的子品种
  const extensions = subVariety1ExtensionsCache.filter(
    s => s.category_code === categoryCode && s.type_code === typeCode && s.variety_code === varietyCode
  );

  const extensionOptions = extensions.map(e => ({
    value: e.sub_variety1_code,
    label: e.sub_variety1_name
  }));

  // 合并选项
  const allOptions = [...extensionOptions];
  configOptions.forEach(opt => {
    if (!allOptions.some(o => o.value === opt.value)) {
      allOptions.push(opt);
    }
  });

  return allOptions;
}
