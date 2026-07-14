/**
 * 种源控制器层 (Controller)
 * 负责处理 HTTP 请求/响应，参数验证
 */
import { seedSourceService } from '../services/seedSource.service.js';
import { getDatabase, saveDatabase } from '../db/index.js';
import {
  executeReturnToInventory,
  listReturnableInboundRecords,
  SeedSourceReturnBusinessError,
} from '../services/seedSourceReturn.service.js';
import { executeAppendFromInventory } from '../services/seedSourceTransfer.service.js';
import {
  listLabels,
  batchGenerateLabels,
  listLabelResumes,
  appendLabelResume,
} from '../services/seedSourceLabel.service.js';
import { queryToObjects } from '../utils/queryHelper.js';
/**
 * 种源控制器类
 * 处理所有种源相关的 HTTP 请求
 */
export class SeedSourceController {
    service;
    constructor(svc) {
        this.service = svc || seedSourceService;
    }
    /**
     * GET /seed-sources
     * 获取种源列表
     */
    async getAll(req, res, next) {
        try {
            const { crop_name, status, page = 1, limit = 50 } = req.query;
            const result = await this.service.getAll({
                crop_name: crop_name,
                status: status,
                page: Number(page),
                limit: Number(limit)
            });
            res.json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /seed-sources/:id
     * 获取种源详情
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await this.service.getById(id);
            res.json({ success: true, data });
        }
        catch (error) {
            if (error.message === '种源记录不存在') {
                res.status(404).json({ success: false, error: '种源记录不存在' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * POST /seed-sources
     * 创建种源
     */
    async create(req, res, next) {
        try {
            const data = req.body;
            const result = await this.service.create(data);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            console.error('创建种源记录失败:', error);
            next(error);
        }
    }
    /**
     * PUT /seed-sources/:id
     * 更新种源
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.service.update(id, data);
            res.json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === '种源记录不存在') {
                res.status(404).json({ success: false, error: '更新种源记录失败' });
            }
            else if (error.message === '没有需要更新的字段') {
                res.status(400).json({ success: false, error: '没有需要更新的字段' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * DELETE /seed-sources/:id
     * 删除种源
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.service.delete(id);
            res.json({ success: true, data: { id } });
        }
        catch (error) {
            if (error.message === '种源记录不存在') {
                res.status(404).json({ success: false, error: '删除种源记录失败' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * DELETE /seed-sources/batch
     * 批量删除种源
     */
    async deleteBatch(req, res, next) {
        try {
            const { ids } = req.query;
            if (!ids) {
                res.status(400).json({ success: false, error: '缺少 ids 参数' });
                return;
            }
            const idArray = ids.split(',');
            console.log('[deleteBatch] 收到批量删除请求, ids:', idArray);
            const result = await this.service.deleteBatch(idArray);
            console.log('[deleteBatch] 删除结果:', result);
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('[deleteBatch] 批量删除种源记录失败:', error);
            next(error);
        }
    }
    /**
     * GET /seed-sources/generate-code
     * 生成种源编码
     */
    async generateCode(req, res, next) {
        try {
            const { date } = req.query;
            if (!date || typeof date !== 'string') {
                res.status(400).json({ success: false, error: '缺少 date 参数' });
                return;
            }
            const code = await this.service.generateCode(date);
            res.json({ success: true, data: code });
        }
        catch (error) {
            console.error('生成种源编码失败:', error);
            next(error);
        }
    }
    // ========== 繁殖过程记录控制器方法 ==========
    /**
     * POST /seed-sources/:id/propagation-records
     * 添加繁殖过程记录
     */
    async addPropagationRecord(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.service.addPropagationRecord(id, data);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === '种源记录不存在') {
                res.status(404).json({ success: false, error: '种源记录不存在' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * GET /seed-sources/:id/propagation-records
     * 获取繁殖过程记录列表
     */
    async getPropagationRecords(req, res, next) {
        try {
            const { id } = req.params;
            const data = await this.service.getPropagationRecords(id);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PUT /seed-sources/:id/propagation-stage
     * 推进繁殖阶段
     */
    async updatePropagationStage(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.service.updatePropagationStage(id, data);
            res.json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === '种源记录不存在') {
                res.status(404).json({ success: false, error: '种源记录不存在' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * POST /seed-sources/:id/complete-propagation
     * 完成繁殖入库
     */
    async completePropagation(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.service.completePropagation(id, data);
            res.json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === '种源记录不存在') {
                res.status(404).json({ success: false, error: '种源记录不存在' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * GET /plantings/available-for-seed-saving
     * 获取可用于留种的种植记录
     */
    async getPlantingsForSeedSaving(req, res, next) {
        try {
            const data = await this.service.getPlantingsForSeedSaving();
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    // ========== 2026-07-14: V3.4 调拨 / 退库 / 历史记录 ==========
    /**
     * POST /api/seed-sources/append-from-inventory
     * 库存调拨入种源（追加到现有种源）
     */
    async appendFromInventory(req, res, next) {
        try {
            const { targetSeedSourceId, items, operatorId, operatorName, remarks } = req.body || {};
            if (!targetSeedSourceId) {
                return res.status(400).json({ success: false, error: 'targetSeedSourceId 必填' });
            }
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, error: 'items 不能为空' });
            }
            const result = await executeAppendFromInventory(
                targetSeedSourceId,
                items,
                { id: operatorId, name: operatorName },
                remarks
            );
            res.json({
                success: true,
                appendedCount: result.appendedCount,
                newAvailableCount: result.newAvailableCount,
                newQuantity: result.newQuantity,
                targetSeedSource: result.targetSeedSource,
            });
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : '调拨失败';
            // 业务校验错误返回 400，资源不存在返回 404
            const code = msg.includes('不存在') ? 404 : 400;
            console.error('[seedSource.appendFromInventory] error:', msg);
            res.status(code).json({ success: false, error: msg });
        }
    }
    /**
     * POST /api/seed-sources/return-to-inventory
     * 种源退库（1:1 关联 inventory_inbound_records）
     */
    async returnToInventory(req, res, next) {
        try {
            const { targetSeedSourceId, items } = req.body || {};
            if (!targetSeedSourceId) {
                return res.status(400).json({ success: false, error: 'targetSeedSourceId 必填' });
            }
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, error: 'items 不能为空' });
            }
            const result = executeReturnToInventory(targetSeedSourceId, items);
            res.json({ success: true, data: result });
        }
        catch (error) {
            if (error instanceof SeedSourceReturnBusinessError) {
                return res.status(error.httpStatus).json({
                    success: false,
                    code: error.code,
                    error: error.message,
                });
            }
            console.error('[seedSource.returnToInventory] error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '退库失败',
            });
        }
    }
    /**
     * GET /api/seed-sources/:id/inbound-records
     * 列出该种源的可退库流水
     */
    async listInboundRecords(req, res, next) {
        try {
            const { id } = req.params;
            const data = listReturnableInboundRecords(id);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/seed-sources/:id/history-inbound
     * 种源历史入库流水（全部 inventory_inbound_records）
     */
    async listHistoryInbound(req, res, next) {
        try {
            const { id } = req.params;
            const db = getDatabase();
            const stmt = db.prepare(`
                SELECT * FROM inventory_inbound_records
                WHERE (source_id = ? AND source_module = 'seed_source')
                   OR (business_id = ?)
                ORDER BY create_time DESC LIMIT 200
            `);
            stmt.bind([id, id]);
            const rows = [];
            while (stmt.step()) rows.push(stmt.getAsObject());
            stmt.free();
            res.json({ success: true, data: rows });
        }
        catch (error) {
            console.error('[seedSource.listHistoryInbound] error:', error);
            res.status(500).json({ success: false, error: '查询失败' });
        }
    }
    /**
     * GET /api/seed-sources/:id/usage-records
     * 种源使用记录（种源详情"使用记录" Tab 数据源）
     */
    async listUsageRecords(req, res, next) {
        try {
            const { id } = req.params;
            const db = getDatabase();
            const sql = `
                SELECT id, operationDate, operationType, quantity,
                       sourceId, sourceCode,
                       plantingId, plantingCode,
                       toAreaId, toAreaName,
                       fromAreaId, fromAreaName,
                       operatorName, remarks,
                       createTime,
                       cropName, cropCode,
                       seedForm
                FROM (
                    SELECT pmr.id, pmr.operation_date AS operationDate,
                           pmr.operation_type AS operationType, pmr.quantity,
                           pmr.source_id AS sourceId, pmr.source_code AS sourceCode,
                           pmr.planting_id AS plantingId, pmr.planting_code AS plantingCode,
                           pmr.to_area_id AS toAreaId, pmr.to_area_name AS toAreaName,
                           pmr.from_area_id AS fromAreaId, pmr.from_area_name AS fromAreaName,
                           pmr.operator_name AS operatorName, pmr.remarks,
                           pmr.create_time AS createTime,
                           ss.crop_name AS cropName, ss.crop_code AS cropCode,
                           ss.seed_form AS seedForm
                    FROM planting_move_records pmr
                    LEFT JOIN seed_sources ss ON ss.id = pmr.source_id
                    WHERE pmr.source_id = ? AND pmr.source_type = 'seed'
                    UNION ALL
                    SELECT tx.id, tx.operate_date AS operationDate,
                           'move_out' AS operationType, tx.quantity AS quantity,
                           ss.id AS sourceId, ss.source_code AS sourceCode,
                           tx.business_id AS plantingId, tx.business_code AS plantingCode,
                           '' AS toAreaId, s.greenhouse_name AS toAreaName,
                           '' AS fromAreaId, '' AS fromAreaName,
                           tx.operator_name AS operatorName, tx.remarks,
                           tx.create_time AS createTime,
                           ss.crop_name AS cropName, ss.crop_code AS cropCode,
                           ss.seed_form AS seedForm
                    FROM inventory_transaction tx
                    LEFT JOIN seed_sources ss ON ss.id = substr(tx.instance_id, 13)
                    LEFT JOIN seedlings s ON s.id = tx.business_id
                    WHERE tx.instance_id = ?
                      AND tx.transaction_type = 'outbound'
                      AND tx.business_type = 'seedling'
                )
                ORDER BY operationDate DESC, createTime DESC
            `;
            const data = queryToObjects(db, sql, [id, `seed_source:${id}`]);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error('[seedSource.listUsageRecords] error:', error);
            res.status(500).json({ success: false, error: '查询失败' });
        }
    }
    /**
     * GET /api/seed-sources/:id/print-records
     * 获取种源打印记录
     */
    async listPrintRecords(req, res, next) {
        try {
            const { id } = req.params;
            const db = getDatabase();
            const stmt = db.prepare(
                `SELECT * FROM seed_source_print_records
                 WHERE seed_source_id = ?
                 ORDER BY print_time DESC`
            );
            stmt.bind([id]);
            const rows = [];
            while (stmt.step()) {
                const r = stmt.getAsObject();
                if (typeof r.label_numbers === 'string') {
                    try { r.label_numbers = JSON.parse(r.label_numbers); } catch (_) { r.label_numbers = []; }
                }
                rows.push(r);
            }
            stmt.free();
            res.json({ success: true, data: rows });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/seed-sources/:id/print
     * 创建种源打印记录 + 更新 print_count
     */
    async print(req, res, next) {
        try {
            const { id } = req.params;
            const { printType = 'new', printCount = 1, operator = '', labelNumbers = [] } = req.body || {};
            const db = getDatabase();
            const now = new Date().toISOString();
            const recordId = `SPR${Date.now()}`;
            db.run(
                `INSERT INTO seed_source_print_records (
                    id, seed_source_id, print_type, print_count, operator, label_numbers, print_time, create_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [recordId, id, printType, Number(printCount) || 1, operator, JSON.stringify(labelNumbers || []), now, now]
            );
            db.run(
                `UPDATE seed_sources SET print_count = COALESCE(print_count, 0) + ?, update_time = ? WHERE id = ?`,
                [Number(printCount) || 1, now, id]
            );
            saveDatabase();
            res.json({ success: true, data: { id: recordId, printCount: Number(printCount) || 1 } });
        }
        catch (error) {
            console.error('[seedSource.print] error:', error);
            res.status(500).json({ success: false, error: '打印失败' });
        }
    }
    // ========== 强结（normal / abnormal）==========
    /**
     * PUT /api/seed-sources/:id/end
     * 强结种源（更新 status=ended + end_time + end_type）
     */
    async end(req, res, next) {
        try {
            const { id } = req.params;
            const { endType = 'normal' } = req.body || {};
            const db = getDatabase();
            const now = new Date().toISOString();
            db.run(
                `UPDATE seed_sources SET status = 'ended', end_time = ?, end_type = ?, update_time = ? WHERE id = ?`,
                [now, endType, now, id]
            );
            saveDatabase();
            res.json({ success: true, data: { id, endType, endTime: now } });
        }
        catch (error) {
            console.error('[seedSource.end] error:', error);
            res.status(500).json({ success: false, error: '强结失败' });
        }
    }
    // ========== 标签管理 ==========
    /**
     * GET /api/seed-sources/:id/labels
     * 获取种源的所有标签
     */
    async listLabels(req, res, next) {
        try {
            const { id } = req.params;
            const data = listLabels(id);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/seed-sources/:id/labels/batch-generate
     * 批量生成标签
     */
    async batchGenerateLabels(req, res, next) {
        try {
            const { id } = req.params;
            const { count = 1, areaName = '', startDate = '' } = req.body || {};
            const result = batchGenerateLabels(id, Number(count) || 1, areaName, startDate);
            res.json({ success: true, data: { generatedCount: result.generatedCount } });
        }
        catch (error) {
            console.error('[seedSource.batchGenerateLabels] error:', error);
            res.status(500).json({ success: false, error: '生成标签失败' });
        }
    }
    /**
     * GET /api/seed-sources/:id/labels/:labelId/resumes
     */
    async listLabelResumes(req, res, next) {
        try {
            const { labelId } = req.params;
            const data = listLabelResumes(labelId);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/seed-sources/:id/labels/:labelId/resumes
     */
    async appendLabelResume(req, res, next) {
        try {
            const { labelId } = req.params;
            const { action = 'unknown', operator = '', remark = '' } = req.body || {};
            const result = appendLabelResume(labelId, action, operator, remark);
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('[seedSource.appendLabelResume] error:', error);
            res.status(500).json({ success: false, error: '操作失败' });
        }
    }
}
// 导出单例
export const seedSourceController = new SeedSourceController();
