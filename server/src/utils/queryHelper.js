/**
 * SQL.js 查询辅助函数
 */

import { Database } from 'sql.js';

/**
 * 将下划线命名字段转换为驼峰命名
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 将对象的所有下划线字段转换为驼峰命名
 */
function mapToCamelCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    const camelKey = toCamelCase(key);
    result[camelKey] = obj[key];
  }
  return result;
}

/**
 * 将 sql.js prepare + step 结果转换为对象数组（字段名自动转为驼峰命名）
 */
export function queryToObjects(db, sql, params = []) {
  const stmt = db.prepare(sql);

  if (params.length > 0) {
    stmt.bind(params);
  }

  const results = [];
  while (stmt.step()) {
    const obj = stmt.getAsObject();
    results.push(mapToCamelCase(obj));
  }
  stmt.free();

  return results;
}

/**
 * 执行计数查询
 */
export function execCount(db, sql, params = []) {
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const stmt = db.prepare(countSql);

  if (params.length > 0) {
    stmt.bind(params);
  }

  let total = 0;
  if (stmt.step()) {
    const result = stmt.getAsObject();
    total = result.total || 0;
  }
  stmt.free();

  return total;
}
