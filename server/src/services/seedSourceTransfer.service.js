/**
 * 种源调拨 service（2026-06-25 v3: 库存调拨入现有种源 — append_existing 模式）
 * 业务：种源管理操作列「调拨」按钮 → 选作物库存批次 → 提交
 *   1. 扣减 inventory_stock
 *   2. 写 inventory_transaction (outbound)
 *   3. UPDATE seed_sources（追加到目标种源）
 *   4. 写 inventory_inbound_records
 */

import { getDatabase, saveDatabase } from '../db/index.js';
import { formatLocalDateISO } from '../utils/dateUtil.js';
import { recomputeAndUpdateStockStatus } from '../lib/inventoryStockStatus.js';
import { generateTransactionId } from './inventory.service.js';

/**
 * 追加库存到种源
 * @param {string} targetSeedSourceId
 * @param {Array<{sourceStockId:string, transferQuantity:number, unit:string}>} items
 * @param {{id?:string, name?:string}} operator
 * @param {string} [remarks]
 * @returns {Promise<{appendedCount:number, newAvailableCount:number, newQuantity:number}>}
 */
export async function executeAppendFromInventory(targetSeedSourceId, items, operator, remarks) {
  if (!targetSeedSourceId) {
    throw new Error('目标种源 ID 不能为空');
  }
  if (!items || items.length === 0) {
    throw new Error('至少选择 1 条调拨明细');
  }

  const db = getDatabase();
  const now = new Date().toISOString();
  const dateStr = formatLocalDateISO();

  // 校验目标种源
  const targetStmt = db.prepare(
    `SELECT id, source_code, remaining_quantity, quantity, unit, crop_code, crop_name
     FROM seed_sources WHERE id = ? AND deleted_at IS NULL`
  );
  targetStmt.bind([targetSeedSourceId]);
  const targetRow = targetStmt.step() ? targetStmt.getAsObject() : null;
  targetStmt.free();
  if (!targetRow) {
    throw new Error(`目标种源不存在: id=${targetSeedSourceId}`);
  }
  const targetUnit = String(targetRow.unit || '');
  const targetCropCode = String(targetRow.crop_code || '');
  const targetCropName = String(targetRow.crop_name || '');
  const targetCode = String(targetRow.source_code || '');

  let totalAppended = 0;

  for (const item of items) {
    // 读源库存
    const sourceStmt = db.prepare(`SELECT * FROM inventory_stock WHERE id = ?`);
    sourceStmt.bind([item.sourceStockId]);
    const sourceObj = sourceStmt.step() ? sourceStmt.getAsObject() : null;
    sourceStmt.free();
    if (!sourceObj) {
      throw new Error(`源库存不存在: id=${item.sourceStockId}`);
    }
    const sourceCurrent = Number(sourceObj.current_quantity || 0);
    const sourceAvailable = Number(sourceObj.available_quantity || 0);
    const sourceUnit = String(sourceObj.unit || '');
    const sourceStatus = String(sourceObj.status || '');
    const sourceCropCode = String(sourceObj.crop_code || '');
    const sourceInstanceId = String(sourceObj.instance_id || '');

    if (sourceStatus === 'depleted' || sourceCurrent <= 0) {
      throw new Error(`源库存已耗尽: ${sourceInstanceId}`);
    }
    if (sourceCurrent < item.transferQuantity) {
      throw new Error(
        `源库存 ${sourceInstanceId} 可用 ${sourceCurrent}${sourceUnit}，需调拨 ${item.transferQuantity}${item.unit}`
      );
    }
    if (sourceUnit !== item.unit) {
      throw new Error(`源库存单位 ${sourceUnit} ≠ 调拨单位 ${item.unit}`);
    }
    if (sourceUnit !== targetUnit) {
      throw new Error(`源库存单位 ${sourceUnit} ≠ 目标种源单位 ${targetUnit}`);
    }
    if (sourceCropCode && targetCropCode && sourceCropCode !== targetCropCode) {
      throw new Error(`源库存作物 ${sourceCropCode} ≠ 目标种源作物 ${targetCropCode}`);
    }

    // 1. 扣减源库存
    const newSourceCurrent = sourceCurrent - item.transferQuantity;
    const newSourceAvailable = Math.max(0, sourceAvailable - item.transferQuantity);
    db.run(
      `UPDATE inventory_stock
       SET current_quantity = ?, available_quantity = ?, update_time = ?
       WHERE id = ?`,
      [newSourceCurrent, newSourceAvailable, now, item.sourceStockId]
    );
    recomputeAndUpdateStockStatus(db, item.sourceStockId);

    // 2. 写 inventory_transaction (outbound)
    const outTxId = await generateTransactionId(dateStr);
    db.run(
      `INSERT INTO inventory_transaction (
        id, transaction_id, instance_id, stock_type, transaction_type, quantity,
        balance_before, balance_after, business_id, business_type, business_code,
        operator_id, operator_name, operate_date, remarks, create_time
      ) VALUES (?, ?, ?, ?, 'outbound', ?, ?, ?, ?, 'transfer', ?, ?, ?, ?, ?, ?)`,
      [
        outTxId,
        outTxId,
        sourceInstanceId,
        String(sourceObj.stock_type || 'seed'),
        item.transferQuantity,
        sourceCurrent,
        newSourceCurrent,
        targetSeedSourceId,
        targetCode,
        operator?.id || '',
        operator?.name || 'system',
        dateStr,
        `调拨入种源 ${targetCode}（追加模式）`,
        now,
      ]
    );

    // 3. UPDATE 目标种源
    const sourceForm = String(sourceObj.product_form || sourceObj.stock_type || '');
    db.run(
      `UPDATE seed_sources
       SET remaining_quantity = remaining_quantity + ?, quantity = quantity + ?,
           seed_form = COALESCE(NULLIF(seed_form, ''), ?),
           update_time = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [item.transferQuantity, item.transferQuantity, sourceForm, now, targetSeedSourceId]
    );

    // 4. 写 inventory_inbound_records
    const inRecId = `IRA-${dateStr}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    db.run(
      `INSERT INTO inventory_inbound_records (
        id, record_type, record_date, source_module, source_id, source_code,
        stock_type, source_type,
        crop_code, crop_name,
        quantity, unit,
        business_id, notes, operator_name, create_time
      ) VALUES (?, 'inbound', ?, 'inventory', ?, ?, ?, 'transfer_inbound', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inRecId,
        dateStr,
        item.sourceStockId,
        sourceInstanceId,
        String(sourceObj.stock_type || 'seed'),
        targetCropCode,
        targetCropName,
        item.transferQuantity,
        item.unit,
        targetSeedSourceId,
        remarks || `追加入库（从 ${sourceInstanceId} 入种源 ${targetCode}）`,
        operator?.name || 'system',
        now,
      ]
    );

    totalAppended += item.transferQuantity;
  }

  // 读最新值
  const newStateStmt = db.prepare(
    `SELECT remaining_quantity, quantity FROM seed_sources WHERE id = ?`
  );
  newStateStmt.bind([targetSeedSourceId]);
  const newState = newStateStmt.step() ? newStateStmt.getAsObject() : null;
  newStateStmt.free();
  const newAvailable = Number(newState?.remaining_quantity || 0);
  const newQuantity = Number(newState?.quantity || 0);

  saveDatabase();

  return {
    appendedCount: totalAppended,
    newAvailableCount: newAvailable,
    newQuantity,
    targetSeedSource: { id: targetSeedSourceId, code: targetCode, cropName: targetCropName },
  };
}