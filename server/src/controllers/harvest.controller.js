/**
 * 采收记录控制器层 (Controller)
 * 负责处理 HTTP 请求/响应，参数验证
 */
import { harvestService } from '../services/harvest.service.js';
/**
 * 采收记录控制器类
 * 处理所有采收记录相关的 HTTP 请求
 */
export class HarvestController {
    service;
    constructor(svc) {
        this.service = svc || harvestService;
    }
    /**
     * GET /harvest
     * 获取采收记录列表
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
     * GET /harvest/:id
     * 获取采收记录详情
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await this.service.getById(id);
            res.json({ success: true, data });
        }
        catch (error) {
            if (error.message === '采收记录不存在') {
                res.status(404).json({ success: false, error: '采收记录不存在' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * POST /harvest
     * 创建采收记录
     */
    async create(req, res, next) {
        try {
            const data = req.body;
            const result = await this.service.create(data);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            console.error('创建采收记录失败:', error);
            next(error);
        }
    }
    /**
     * PUT /harvest/:id
     * 更新采收记录
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.service.update(id, data);
            res.json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === '采收记录不存在') {
                res.status(404).json({ success: false, error: '更新采收记录失败' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * DELETE /harvest/:id
     * 删除采收记录
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.service.delete(id);
            res.json({ success: true, data: { id } });
        }
        catch (error) {
            if (error.message === '采收记录不存在') {
                res.status(404).json({ success: false, error: '删除采收记录失败' });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * PUT /harvest/batch
     * 批量更新采收记录
     */
    async updateBatch(req, res, next) {
        try {
            const { ids, updates } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({ success: false, error: '缺少ids参数或ids不是有效数组' });
                return;
            }
            if (!updates || typeof updates !== 'object') {
                res.status(400).json({ success: false, error: '缺少updates参数或updates不是有效对象' });
                return;
            }
            const result = await this.service.updateBatch(ids, updates);
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('批量更新采收记录失败:', error);
            next(error);
        }
    }
    /**
     * DELETE /harvest/batch
     * 批量删除采收记录
     */
    async deleteBatch(req, res, next) {
        try {
            const { ids } = req.query;
            if (!ids || typeof ids !== 'string') {
                res.status(400).json({ success: false, error: '缺少 ids 参数' });
                return;
            }
            const idArray = ids.split(',').filter(id => id.trim() !== '');
            if (idArray.length === 0) {
                res.json({ success: true, data: { deletedCount: 0 } });
                return;
            }
            console.log('[deleteBatch] 开始删除, ids:', idArray);
            const result = await this.service.deleteBatch(idArray);
            console.log('[deleteBatch] 删除结果:', result);
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('[deleteBatch] 批量删除采收记录失败:', error);
            next(error);
        }
    }
    /**
     * GET /harvest/batch
     * 批量获取采收记录
     */
    async getByIds(req, res, next) {
        try {
            const { ids } = req.query;
            if (!ids) {
                res.status(400).json({ success: false, error: '缺少ids参数' });
                return;
            }
            const idArray = ids.split(',').filter(Boolean);
            if (idArray.length === 0) {
                res.status(400).json({ success: false, error: 'ids参数格式无效' });
                return;
            }
            const items = await this.service.getByIds(idArray);
            res.json({ success: true, data: items, meta: { total: items.length } });
        }
        catch (error) {
            console.error('批量获取采收记录失败:', error);
            next(error);
        }
    }
    /**
     * GET /harvest/batch-code/:batchCode
     * 根据批次号获取采收记录
     */
    async getByBatchCode(req, res, next) {
        try {
            const { batchCode } = req.params;
            if (!batchCode) {
                res.status(400).json({ success: false, error: '缺少批次号参数' });
                return;
            }
            const items = await this.service.getByBatchCode(batchCode);
            res.json({ success: true, data: items, meta: { total: items.length } });
        }
        catch (error) {
            console.error('根据批次号获取采收记录失败:', error);
            next(error);
        }
    }
    /**
     * GET /harvest/stats
     * 获取采收统计数据
     */
    async getStats(req, res, next) {
        try {
            const { start_date, end_date, crop_name, greenhouse_name } = req.query;
            const stats = await this.service.getStats(start_date, end_date, crop_name, greenhouse_name);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            console.error('获取采收统计失败:', error);
            next(error);
        }
    }
    /**
     * GET /harvest/export
     * 导出采收数据
     */
    async export(req, res, next) {
        try {
            const { start_date, end_date, crop_name, greenhouse_name, status, format = 'json' } = req.query;
            const result = await this.service.export(start_date, end_date, crop_name, greenhouse_name, status, format);
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv;charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename=harvest_records_${new Date().toISOString().slice(0, 10)}.csv`);
                res.send(result);
            }
            else {
                res.json(result);
            }
        }
        catch (error) {
            console.error('导出采收数据失败:', error);
            next(error);
        }
    }
    /**
     * GET /harvest/init
     * 初始化采收记录数据
     */
    async init(req, res, next) {
        try {
            const result = await this.service.init();
            res.json({ success: true, ...result });
        }
        catch (error) {
            console.error('初始化采收记录失败:', error);
            next(error);
        }
    }
    /**
     * POST /harvest/reset
     * 重置采收记录数据
     */
    async reset(req, res, next) {
        try {
            await this.service.reset();
            res.json({ success: true, message: '采收记录已重置' });
        }
        catch (error) {
            console.error('重置采收记录失败:', error);
            next(error);
        }
    }
    /**
     * GET /harvest/generate-code
     * 生成采收单号
     */
    generateCode(req, res, next) {
        try {
            const code = this.service.generateCode();
            res.json({ success: true, data: { code } });
        }
        catch (error) {
            res.status(500).json({ success: false, error: '生成采收单号失败' });
        }
    }
}
// 导出单例
export const harvestController = new HarvestController();
