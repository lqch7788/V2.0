/**
 * API字段映射工具
 * 将后端返回的snake_case字段转换为前端camelCase格式
 */

/**
 * 将下划线命名字段转换为驼峰命名
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 将对象的所有下划线字段转换为驼峰命名
 * @template T
 * @param {unknown} obj
 * @returns {T}
 */
export function mapFieldsToCamelCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => mapFieldsToCamelCase(item));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      const camelKey = toCamelCase(key);
      const value = obj[key];

      // 递归处理嵌套对象和数组
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[camelKey] = mapFieldsToCamelCase(value);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map(item =>
          item && typeof item === 'object' && !(item instanceof Date)
            ? mapFieldsToCamelCase(item)
            : item
        );
      } else {
        result[camelKey] = value;
      }
    }
    return result;
  }

  return obj;
}

/**
 * 将驼峰命名字段转换为下划线命名
 * @param {string} str
 * @returns {string}
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 将对象的所有驼峰命名字段转换为下划线命名
 * @template T
 * @param {unknown} obj
 * @returns {T}
 */
export function mapFieldsToSnakeCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => mapFieldsToSnakeCase(item));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = toSnakeCase(key);
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[snakeKey] = mapFieldsToSnakeCase(value);
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map(item =>
          item && typeof item === 'object' && !(item instanceof Date)
            ? mapFieldsToSnakeCase(item)
            : item
        );
      } else {
        result[snakeKey] = value;
      }
    }
    return result;
  }

  return obj;
}
