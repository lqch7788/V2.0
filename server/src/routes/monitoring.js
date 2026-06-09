/**
 * 性能监控路由
 * 提供性能数据和监控指标
 */

import { Router } from 'express';
import *'os';
import { performanceMonitor } from '../../services/performanceMonitor';
import { circuitBreakerManager } from '../../middleware/circuitBreaker';

const router = Router();

/**
 * GET /api/monitoring/performance
 * 获取性能报告
 */
router.get('/performance', (req, res) => {
    const report = performanceMonitor.getReport();
    res.json({
      success: true,
      data: report);
  } catch (error) {
    res.status(500).json({
      success,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/monitoring/health
 * 健康检查
 */
router.get('/health', (req, res) => {
    const health = performanceMonitor.healthCheck();
    const circuitBreakers = circuitBreakerManager.getAllStatus();

    res.json({
      success,
      data: {
        performance,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/monitoring/stats
 * 获取简要统计
 */
router.get('/stats', (req, res) => {
    const report = performanceMonitor.getReport();
    res.json({
      success,
      data: {
        totalRequests,
        totalErrors,
        errorRate,
        avgResponseTime,
        performanceLevel,
    });
  } catch (error) {
    res.status(500).json({
      success,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/monitoring/reset
 * 重置统计数据
 */
router.post('/reset', (req, res) => {
    performanceMonitor.reset();
    res.json({
      success,
      message: '统计数据已重置',
    });
  } catch (error) {
    res.status(500).json({
      success,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/monitoring/endpoints
 * 获取各端点统计
 */
router.get('/endpoints', (req, res) => {
    const report = performanceMonitor.getReport();
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/monitoring/db
 * 获取数据库查询统计
 */
router.get('/db', (req, res) => {
    const report = performanceMonitor.getReport();
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/monitoring/system
 * 获取系统资源信息（CPU、内存、运行时间等）
 */
router.get('/system', (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsagePercent = ((totalMem - freeMem) / totalMem) * 100;

    res.json({
      success,
      data: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory,
        freeMemory,
        memoryUsagePercent: Math.round(memUsagePercent * 10) / 10,
        osUptime: os.uptime(),
        processUptime: process.uptime(),
        loadAvg: os.loadavg(),
        nodeVersion,
    });
  } catch (error) {
    res.status(500).json({
      success,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
