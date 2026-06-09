/**
 * 种源控制器层 (Controller)
 * 负责处理 HTTP 请求/响应，参数验证
 */

import { seedSourceService, SeedSourceService } from '../services/seedSource.service.js';

/**
 * 种源控制器类
 * 处理所有种源相关的 HTTP 请求
 */
export class SeedSourceController {
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
    } catch (error) {
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
    } catch (error) {
      if (error.message === '种源记录不存在') {
        res.status(404).json({ success: false, error: '种源记录不存在' });
      } else {
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
    } catch (error) {
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
    } catch (error) {
      if (error.message === '种源记录不存在') {
        res.status(404).json({ success: false, error: '更新种源记录失败' });
      } else if (error.message === '没有需要更新的字段') {
        res.status(400).json({ success: false, error: '没有需要更新的字段' });
      } else {
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
    } catch (error) {
      if (error.message === '种源记录不存在') {
        res.status(404).json({ success: false, error: '删除种源记录失败' });
      } else {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      if (error.message === '种源记录不存在') {
        res.status(404).json({ success: false, error: '种源记录不存在' });
      } else {
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
    } catch (error) {
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
    } catch (error) {
      if (error.message === '种源记录不存在') {
        res.status(404).json({ success: false, error: '种源记录不存在' });
      } else {
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
    } catch (error) {
      if (error.message === '种源记录不存在') {
        res.status(404).json({ success: false, error: '种源记录不存在' });
      } else {
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
    } catch (error) {
      next(error);
    }
  }
}

// 导出单例
export const seedSourceController = new SeedSourceController();
