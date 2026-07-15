/**
 * 手动同步脚本：从 V1.1 复制数据库到 V2.0
 *
 * 背景：
 *   - V1.1 是产品源头，用户持续录入业务数据
 *   - V2.0 是 Vue3 重构版，需要看到 V1.1 的最新数据用于测试/调试
 *   - 共享同一份数据库存在冲突风险（SQLite 单写者模型 + V1.1 持续更新）
 *   - 方案：定期把 V1.1 数据库**物理复制**到 V2.0，V2.0 用本地副本
 *
 * 工作流（开发者手动触发）：
 *   1. 关闭 V2.0 server（避免 SQLite 文件锁冲突）
 *   2. 运行本脚本：备份 V2.0 旧库 → 复制 V1.1 → V2.0 → 写 sync marker
 *   3. 重新启动 V2.0 server
 *   4. 验证作物管理页面看到最新数据
 *
 * ⚠️ 同步会覆盖 V2.0 本地数据库！任何 V2.0 测试数据会丢失（备份会自动保留）
 *
 * 使用方法：
 *   node server/src/db/syncFromV1.cjs           # 直接同步
 *   node server/src/db/syncFromV1.cjs --check  # 仅检查 V1.1 是否有变化
 *   node server/src/db/syncFromV1.cjs --force  # 强制同步（忽略 mtime 缓存）
 *   node server/src/db/syncFromV1.cjs --list   # 列出所有备份
 */

const fs = require('fs');
const path = require('path');

// V1.1 数据库源（持续更新的主库）
const V1_DB_PATH = 'D:/TMcrop/yuanxingtu/V1.1/server/data/yuanxingtu.db';

// V2.0 数据库目标（V2.0 本地副本，会被本脚本覆盖）
const V2_DATA_DIR = path.join(__dirname, '../../data');
const V2_DB_PATH = path.join(V2_DATA_DIR, 'yuanxingtu.db');
const SYNC_MARKER = path.join(V2_DATA_DIR, 'yuanxingtu.db.sync-marker');

// 备份保留策略：最多保留 5 个最近备份
const MAX_BACKUPS = 5;

function log(level, msg) {
  const icons = { info: 'ℹ️ ', ok: '✅', warn: '⚠️ ', err: '❌', step: '🔄' };
  console.log(`${icons[level] || ''} ${msg}`);
}

function getV1Mtime(dbPath) {
  const stat = fs.statSync(dbPath);
  return stat.mtimeMs;
}

function readSyncMarker() {
  if (!fs.existsSync(SYNC_MARKER)) return null;
  try {
    return JSON.parse(fs.readFileSync(SYNC_MARKER, 'utf-8'));
  } catch {
    return null;
  }
}

function writeSyncMarker(v1Mtime) {
  fs.writeFileSync(SYNC_MARKER, JSON.stringify({
    v1Mtime,
    syncedAt: new Date().toISOString(),
    scriptVersion: '1.0.0'
  }, null, 2));
}

function ensurePaths() {
  if (!fs.existsSync(V1_DB_PATH)) {
    log('err', `V1.1 数据库不存在: ${V1_DB_PATH}`);
    log('info', '请确认 V1.1 路径正确，或先在 V1.1 启动一次 server 让数据库初始化');
    process.exit(1);
  }
  if (!fs.existsSync(V2_DATA_DIR)) {
    fs.mkdirSync(V2_DATA_DIR, { recursive: true });
  }
}

function backupV2Db() {
  if (!fs.existsSync(V2_DB_PATH)) {
    log('info', 'V2.0 数据库不存在，跳过备份');
    return null;
  }
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const backupPath = path.join(V2_DATA_DIR, `yuanxingtu_pre_sync_${ts}.db.bak`);
  fs.copyFileSync(V2_DB_PATH, backupPath);
  log('ok', `已备份 V2.0 旧库 → ${path.basename(backupPath)}`);
  return backupPath;
}

function cleanupOldBackups() {
  const backups = fs.readdirSync(V2_DATA_DIR)
    .filter(f => f.startsWith('yuanxingtu_pre_sync_') && f.endsWith('.db.bak'))
    .sort()
    .reverse();
  if (backups.length > MAX_BACKUPS) {
    const toRemove = backups.slice(MAX_BACKUPS);
    toRemove.forEach(f => {
      fs.unlinkSync(path.join(V2_DATA_DIR, f));
      log('info', `清理过期备份: ${f}`);
    });
  }
}

function listBackups() {
  const backups = fs.readdirSync(V2_DATA_DIR)
    .filter(f => f.startsWith('yuanxingtu_pre_sync_') && f.endsWith('.db.bak'))
    .sort()
    .reverse();
  if (backups.length === 0) {
    log('info', '暂无同步备份');
    return;
  }
  console.log('\n最近同步备份（按时间倒序）：');
  backups.forEach((f, i) => {
    const stat = fs.statSync(path.join(V2_DATA_DIR, f));
    const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
    console.log(`  ${(i + 1).toString().padStart(2)}. ${f}  (${sizeMB} MB, ${stat.mtime.toLocaleString('zh-CN')})`);
  });
}

function checkChange() {
  const v1Mtime = getV1Mtime(V1_DB_PATH);
  const marker = readSyncMarker();
  if (!marker) {
    log('warn', '无 sync marker，建议执行首次同步');
    log('info', `V1.1 数据库 mtime: ${new Date(v1Mtime).toLocaleString('zh-CN')}`);
    return true;
  }
  if (v1Mtime === marker.v1Mtime) {
    log('ok', 'V1.1 数据库无变化，无需同步');
    log('info', `上次同步: ${new Date(marker.syncedAt).toLocaleString('zh-CN')}`);
    return false;
  }
  log('info', `V1.1 数据库有变化 (mtime ${marker.v1Mtime} → ${v1Mtime})`);
  log('info', `上次同步: ${new Date(marker.syncedAt).toLocaleString('zh-CN')}`);
  return true;
}

function copyV1ToV2() {
  log('step', `开始复制: V1.1 → V2.0`);
  fs.copyFileSync(V1_DB_PATH, V2_DB_PATH);
  const stat = fs.statSync(V2_DB_PATH);
  const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
  log('ok', `复制完成: ${sizeMB} MB`);
}

function printSummary() {
  console.log('\n========================================');
  console.log('  同步完成');
  console.log('========================================');
  console.log(`V1.1 数据库: ${V1_DB_PATH}`);
  console.log(`V2.0 数据库: ${V2_DB_PATH}`);
  console.log(`同步时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('\n下一步：');
  console.log('  1. 启动 V2.0 server: cd V2.0/server && npm run dev');
  console.log('  2. 访问作物管理页面，种源/育苗/采收等页面应显示 V1.1 最新数据');
  console.log('  3. 如需再次同步：先停 V2.0 server，再运行本脚本');
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const isCheck = args.includes('--check');
  const isList = args.includes('--list');

  console.log('========================================');
  console.log('  V1.1 → V2.0 数据库手动同步');
  console.log('========================================\n');

  ensurePaths();

  if (isList) {
    listBackups();
    return;
  }

  if (isCheck && !force) {
    const changed = checkChange();
    process.exit(changed ? 0 : 0);
  }

  // 是否需要同步？
  if (!force) {
    const changed = checkChange();
    if (!changed) {
      console.log('\n无需同步。使用 --force 强制执行。');
      process.exit(0);
    }
  }

  // 1. 备份 V2.0 旧库
  backupV2Db();

  // 2. 复制 V1.1 → V2.0
  copyV1ToV2();

  // 3. 写 sync marker
  const v1Mtime = getV1Mtime(V1_DB_PATH);
  writeSyncMarker(v1Mtime);

  // 4. 清理过期备份
  cleanupOldBackups();

  // 5. 打印汇总
  printSummary();
}

main();