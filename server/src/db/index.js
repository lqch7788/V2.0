/**
 * SQLite 数据库连接
 * 使用 sql.js（纯 JavaScript 实现，无需编译）
 */
import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname as __pathDirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = __pathDirname(__filename);
// 数据库文件路径
const DB_PATH = path.join(__dirname, '../../data/yuanxingtu.db');
// 数据库实例 — 存到 globalThis 避免 ES Module 多实例状态隔离
// （tsx/esbuild 解析 './db' vs './db/index' 可能产生不同模块实例，
//   导致不同文件 import 的 `db` 不是同一个变量）
const DB_KEY = Symbol.for('yuanxingtu.db.instance');
if (!globalThis[DB_KEY]) {
    globalThis[DB_KEY] = { db: null };
}
const dbState = globalThis[DB_KEY];
/**
 * 初始化数据库
 */
export async function initDatabase() {
    if (dbState.db)
        return dbState.db;
    const SQL = await initSqlJs();
    // 确保 data 目录存在
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    // 加载已有数据库或创建新数据库
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        dbState.db = new SQL.Database(buffer);
    }
    else {
        dbState.db = new SQL.Database();
    }
    // 修补 db.run() 和 stmt.bind() 自动将 undefined 绑定值转为 null（sql.js 不接受 undefined）
    const originalRun = dbState.db.run.bind(dbState.db);
    dbState.db.run = function (sql, params) {
        if (params && params.length > 0) {
            params = params.map(v => v === undefined ? null : v);
        }
        return originalRun(sql, params);
    };
    const originalPrepare = dbState.db.prepare.bind(dbState.db);
    dbState.db.prepare = function (sql) {
        const stmt = originalPrepare(sql);
        const originalBind = stmt.bind.bind(stmt);
        stmt.bind = function (params) {
            if (params && params.length > 0) {
                params = params.map(v => v === undefined ? null : v);
            }
            return originalBind(params);
        };
        return stmt;
    };
    return dbState.db;
}
/**
 * 获取数据库实例
 */
export function getDatabase() {
    if (!dbState.db) {
        throw new Error('数据库未初始化，请先调用 initDatabase() [dbState.db is null]');
    }
    return dbState.db;
}
/**
 * 保存数据库到文件
 */
export function saveDatabase() {
    if (dbState.db) {
        const data = dbState.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}
/**
 * 关闭数据库连接
 */
export function closeDatabase() {
    if (dbState.db) {
        saveDatabase();
        dbState.db.close();
        dbState.db = null;
    }
}
export default { initDatabase, getDatabase, saveDatabase, closeDatabase };
