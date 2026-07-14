/**
 * 库存状态计算工具（V3.0 统一层）
 * 唯一权威的 status 计算入口。
 * 2026-07-14：方案 C — 状态基于数量/冻结量实时计算
 */

const LOW_STOCK_THRESHOLD = 10;

/**
 * 核心计算：当前数量 + 冻结量 + 原状态 → 库存状态
 * 优先级：transferred > frozen > empty > low_stock > in_stock
 */
export function computeInventoryStatus(currentQuantity, frozenQuantity, rawStatus) {
  if (rawStatus === 'transferred') return 'transferred';
  if (frozenQuantity > 0) {
    return frozenQuantity >= currentQuantity ? 'frozen_full' : 'frozen_partial';
  }
  if (currentQuantity <= 0) return 'empty';
  if (currentQuantity < LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

/**
 * 重算并更新单条库存的 status
 * @returns 更新后的 status
 */
export function recomputeAndUpdateStockStatus(db, instanceId) {
  const stmt = db.prepare(
    'SELECT current_quantity, frozen_quantity, status FROM inventory_stock WHERE instance_id = ?'
  );
  stmt.bind([instanceId]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();

  const newStatus = computeInventoryStatus(
    Number(row.current_quantity) || 0,
    Number(row.frozen_quantity) || 0,
    row.status
  );

  db.run(
    'UPDATE inventory_stock SET status = ?, update_time = ? WHERE instance_id = ?',
    [newStatus, new Date().toISOString(), instanceId]
  );

  return newStatus;
}