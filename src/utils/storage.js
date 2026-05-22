/**
 * localStorage 工具函数
 * 提供 JSON 序列化/反序列化包装
 */

/**
 * 从 localStorage 读取 JSON 数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值（读取失败时返回）
 * @returns {any}
 */
export function storageGetJSON(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key)
    if (value === null || value === undefined) {
      return defaultValue
    }
    return JSON.parse(value)
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败:`, error)
    return defaultValue
  }
}

/**
 * 将 JSON 数据写入 localStorage
 * @param {string} key - 存储键名
 * @param {any} value - 要存储的值（会被 JSON 序列化）
 */
export function storageSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] 写入 ${key} 失败:`, error)
  }
}

/**
 * 从 localStorage 读取字符串
 * @param {string} key - 存储键名
 * @param {string|null} defaultValue - 默认值
 * @returns {string|null}
 */
export function storageGet(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key)
    return value !== null ? value : defaultValue
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败:`, error)
    return defaultValue
  }
}

/**
 * 将字符串写入 localStorage
 * @param {string} key - 存储键名
 * @param {string} value - 要存储的值
 */
export function storageSet(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch (error) {
    console.warn(`[storage] 写入 ${key} 失败:`, error)
  }
}

/**
 * 删除 localStorage 中的项
 * @param {string} key - 存储键名
 */
export function storageRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`[storage] 删除 ${key} 失败:`, error)
  }
}
