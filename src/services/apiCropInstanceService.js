/**
 * 作物实例服务
 * 提供作物实例数据的查询和管理功能
 */

const STORAGE_KEY = 'crop_instances';

/**
 * 从localStorage获取作物实例数据
 */
function getStoredInstances() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('作物实例数据解析失败:', error);
      return [];
    }
  }
  return [];
}

/**
 * 初始化作物实例数据
 */
export function initInstances() {
  const data = getStoredInstances();
  if (data.length === 0 && localStorage.getItem(STORAGE_KEY) === null) {
    // 设置默认空数据
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
  return data;
}

/**
 * 获取所有作物实例
 */
export function getInstances() {
  return getStoredInstances();
}

/**
 * 根据ID获取单个作物实例
 */
export function getInstanceById(id) {
  const instances = getStoredInstances();
  return instances.find(inst => inst.id === id);
}

/**
 * 获取实例的完整溯源链
 */
export function getTraceChain(id) {
  const instance = getInstanceById(id);
  if (!instance) return null;

  // 从其他存储键获取关联数据
  const seedSources = JSON.parse(localStorage.getItem('crop_seed_sources') || '[]')
    .filter(s => s.instanceId === id);

  const seedlings = JSON.parse(localStorage.getItem('crop_seedlings') || '[]')
    .filter(s => s.instanceId === id);

  const plantings = JSON.parse(localStorage.getItem('crop_plantings') || '[]')
    .filter(p => p.instanceId === id);

  const harvests = JSON.parse(localStorage.getItem('crop_harvests') || '[]')
    .filter(h => h.instanceId === id);

  return {
    instance,
    seedSources: seedSources.length > 0 ? seedSources : undefined,
    seedlings: seedlings.length > 0 ? seedlings : undefined,
    plantings: plantings.length > 0 ? plantings : undefined,
    harvests: harvests.length > 0 ? harvests : undefined,
  };
}
