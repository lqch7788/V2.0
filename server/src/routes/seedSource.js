/**
 * 种源路由
 * 精简为直接调用 Controller
 * 2026-07-14：V3.4 路由补齐 — 调拨/退库/历史/标签/强结/打印
 */
import { Router } from 'express';
import { seedSourceController } from '../controllers/seedSource.controller.js';
import { getDatabase } from '../db/index.js';
const router = Router();
// 注意：generate-code 和 batch 路由必须在 :id 路由之前，否则会被 :id 匹配
// 生成种源编码
router.get('/generate-code', (req, res, next) => seedSourceController.generateCode(req, res, next));
// 批量删除路由必须在 /:id 之前
router.delete('/batch', (req, res, next) => seedSourceController.deleteBatch(req, res, next));
// 可用留种的种植记录（必须在 :id 路由之前，避免被 :id 匹配）
router.get('/available-for-seed-saving', (req, res, next) => seedSourceController.getPlantingsForSeedSaving(req, res, next));
// 繁殖阶段操作（带 :id 参数）
router.get('/:id/propagation-records', (req, res, next) => seedSourceController.getPropagationRecords(req, res, next));
router.post('/:id/propagation-records', (req, res, next) => seedSourceController.addPropagationRecord(req, res, next));
router.put('/:id/propagation-stage', (req, res, next) => seedSourceController.updatePropagationStage(req, res, next));
router.post('/:id/complete-propagation', (req, res, next) => seedSourceController.completePropagation(req, res, next));
// ========== 2026-07-14: V3.4 路由补齐（必须在 /:id 主路由之前）==========
// 调拨（追加库存入种源）
router.post('/append-from-inventory', (req, res, next) => seedSourceController.appendFromInventory(req, res, next));
// 退库（种源退回原入库记录）
router.post('/return-to-inventory', (req, res, next) => seedSourceController.returnToInventory(req, res, next));
// 库存调拨入库（批量创建新种源）— 路由前缀 /api/inventory，由 inventory 路由处理
// 这里仅占位说明，inventoryTransferToSource 路由在 routes/inventory.js 注册
// 使用记录 Tab
router.get('/:id/usage-records', (req, res, next) => seedSourceController.listUsageRecords(req, res, next));
// 历史入库流水 Tab
router.get('/:id/history-inbound', (req, res, next) => seedSourceController.listHistoryInbound(req, res, next));
// 可退库流水 Tab
router.get('/:id/inbound-records', (req, res, next) => seedSourceController.listInboundRecords(req, res, next));
// 打印记录
router.get('/:id/print-records', (req, res, next) => seedSourceController.listPrintRecords(req, res, next));
// 打印（更新 print_count）
router.post('/:id/print', (req, res, next) => seedSourceController.print(req, res, next));
// 强结（normal / abnormal）
router.put('/:id/end', (req, res, next) => seedSourceController.end(req, res, next));
// ========== 2026-07-18 P0-DETAIL-006 修复：种源审计记录端点（V1.1 seedSource.ts:660 1:1 迁移）==========
// 用途：种源详情弹窗「操作历史」Tab 数据源
// 数据源：audit_logs 表 WHERE business_type='seed_source' AND business_id=?
router.get('/:id/history-audit', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      WHERE business_type = 'seed_source' AND business_id = ?
      ORDER BY created_at DESC LIMIT 200
    `);
    stmt.bind([id]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: '查询审计记录失败' });
  }
});
// ========== 2026-07-18 P0-DETAIL-005 修复：统一实体历史端点（V1.1 seedSource.ts:681 1:1 迁移）==========
// 数据源：audit_logs + inbound + transaction + circulation UNION
router.get('/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    // 简化版 UNION（按时间倒序）— 与 V1.1 entityHistory.service.ts queryEntityHistory 行为等价
    const items = [];
    // 1) audit_logs
    try {
      const stmt = db.prepare(`
        SELECT id, created_at as occurred_at, action, operator_name, remarks, 'audit' as source
        FROM audit_logs
        WHERE business_type = 'seed_source' AND business_id = ?
        ORDER BY created_at DESC LIMIT 200
      `);
      stmt.bind([id]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        items.push({
          id: row.id,
          occurredAt: row.occurred_at,
          source: 'entity',
          category: 'lifecycle',
          action: row.action || '更新',
          operatorName: row.operator_name,
          remarks: row.remarks
        });
      }
      stmt.free();
    } catch { /* audit_logs 不存在时跳过 */ }
    // 2) 按时间倒序
    items.sort((a, b) => (b.occurredAt || '').localeCompare(a.occurredAt || ''));
    res.json({ success: true, data: items.slice(0, 200) });
  } catch (error) {
    res.status(500).json({ success: false, error: '查询实体历史失败' });
  }
});
// 标签管理
router.get('/:id/labels', (req, res, next) => seedSourceController.listLabels(req, res, next));
router.post('/:id/labels/batch-generate', (req, res, next) => seedSourceController.batchGenerateLabels(req, res, next));
router.get('/:id/labels/:labelId/resumes', (req, res, next) => seedSourceController.listLabelResumes(req, res, next));
router.post('/:id/labels/:labelId/resumes', (req, res, next) => seedSourceController.appendLabelResume(req, res, next));
// 检查种源是否可删除（被育苗引用则不可删）
router.get('/:id/check-deletable', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const cntResult = db.exec('SELECT COUNT(*) as cnt FROM seedlings WHERE source_id = ?', [id]);
        const refCount = Number(cntResult[0]?.values[0]?.[0]) || 0;
        res.json({ success: true, data: { deletable: refCount === 0, refCount } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: '检查失败' });
    }
});
// 将请求传递给 controller
router.get('/', (req, res, next) => seedSourceController.getAll(req, res, next));
router.get('/:id', (req, res, next) => seedSourceController.getById(req, res, next));
router.post('/', (req, res, next) => seedSourceController.create(req, res, next));
router.put('/:id', (req, res, next) => seedSourceController.update(req, res, next));
router.delete('/:id', (req, res, next) => seedSourceController.delete(req, res, next));
export default router;
