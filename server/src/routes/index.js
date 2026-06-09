/**
 * 路由汇总
 */
import { Router } from 'express';
import cropVarietyRouter from './cropVariety.js';
import inventoryRouter from './inventory.js';
import seedlingRouter from './seedling.js';
import seedSourceRouter from './seedSource.js';
import plantingRouter from './planting.js';
import harvestRouter from './harvest.js';
import supplierRouter from './supplier.js';
import cropInstanceRouter from './cropInstance.js';
import farmTaskRouter from './farmTask.js';
import inspectionRouter from './inspection.js';
import problemRouter from './problem.js';
import laborRouter from './labor.js';
import overtimeRouter from './overtime.js';
import leaveRouter from './leave.js';
import tempTaskRouter from './tempTask.js';
import purchasePlanRouter from './purchasePlan.js';
import materialRequestRouter from './materialRequest.js';
import basicDataRouter from './basicData.js';
import dictionaryRouter from './dictionary.js';
import authorityRouter from './authority.js';
import notificationRouter from './notification.js';
import approvalWorkflowRouter from './approvalWorkflow.js';
import approvalRouter from './approval.js';
import approvalLinkageRouter from './approvalLinkage.js';
import operationLogRouter from './operationLog.js';
import cropOrderRouter from './cropOrder.js';
import customerRouter from './customer.js';
import productionPlanRouter from './productionPlan.js';
import techSolutionRouter from './techSolution.js';
import summaryRouter from './summary.js';
import materialCostRouter from './materialCost.js';
import materialReturnRouter from './materialReturn.js';
import materialExecuteRouter from './materialExecute.js';
import materialStatisticsRouter from './materialStatistics.js';
import monitoringRouter from './monitoring.js';
import syncRouter from './sync.js';
import announcementRouter from './announcement.js';
import indicatorsRouter from './indicators.js';
import indicatorEvaluationsRouter from './indicatorEvaluations.js';
import scheduleRouter from './schedule.js';
import attendanceRouter from './attendance.js';
import personnelRouter from './personnel.js';
import onboardingRouter from './onboarding.js';
import iotMonitorRouter from './iotMonitor.js';
import alertRouter from './alert.js';
import materialsRouter from './materials.js';
import resignationRouter from './resignation.js';
import recruitmentRouter from './recruitment.js';
import contractRenewalRouter from './contractRenewal.js';
import salaryBudgetRouter from './salaryBudget.js';
import fertilizerRouter from './fertilizer.js';
import fertilizerLibraryRouter from './fertilizerLibrary.js';
import pesticideLibraryRouter from './pesticideLibrary.js';
import pestDiseaseDictRouter from './pestDiseaseDict.js';
import dailyPlansRouter from './dailyPlans.js';
import monthlyPlansRouter from './monthlyPlans.js';
import regionRouter from './region.js';
import plantLabelRouter from './plantLabel.js';
import materialCodeCategoriesRouter from './materialCodeCategories.js';
import backupRouter from './backup.js';
import plantingRecordRouter from './plantingRecord.js';
import farmPartitionsRouter from './farmPartitions.js';
import areaSystemsRouter from './areaSystems.js';
import deviceSystemsRouter from './deviceSystems.js';
import camerasRouter from './cameras.js';
import energyConfigsRouter from './energyConfigs.js';
import alarmConfigsRouter from './alarmConfigs.js';
import waterFertilizerRouter from './waterFertilizer.js';
import plantSettingsRouter from './plantSettings.js';
import projectDebugRouter from './projectDebug.js';
import deviceDistributionRouter from './deviceDistribution.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { apiLimiter, loginLimiter } from '../middleware/rateLimit.js';
// JWT 认证中间件 - 要求已登录才能访问
const requireAuth = (req, res, next) => {
    authenticate(req, res, next);
};
// 可选认证中间件 - 有token就验证，没有也能访问
const optionalAuth = (req, res, next) => {
    optionalAuthenticate(req, res, next);
};
const router = Router();
// 登录路由限流（更严格：5次/15分钟）
// 注意：由于 router 挂载在 /api 下，这里路径是相对于 /api 的
router.use('/authority/auth/login', loginLimiter);
// 其他 API 通用限流（100次/15分钟）
// 挂载在 / 下，匹配所有路由（因为 routes 在 index.ts 中挂载于 /api）
router.use('/', apiLimiter);
// 作物品种路由 - 需要认证
router.use('/crop-varieties', requireAuth, cropVarietyRouter);
// 库存路由 - 需要认证
router.use('/inventory', requireAuth, inventoryRouter);
// 育苗管理路由 - 需要认证
router.use('/seedlings', requireAuth, seedlingRouter);
// 种源管理路由 - 需要认证
router.use('/seed-sources', requireAuth, seedSourceRouter);
// 种植管理路由 - 需要认证
router.use('/plantings', requireAuth, plantingRouter);
// 采收管理路由 - 需要认证
router.use('/harvest', requireAuth, harvestRouter);
// 供应商路由 - 需要认证
router.use('/suppliers', requireAuth, supplierRouter);
// 作物实例路由 - 需要认证
router.use('/crop-instances', requireAuth, cropInstanceRouter);
// 农事任务路由 - 需要认证
router.use('/farm-tasks', requireAuth, farmTaskRouter);
// 巡查记录路由 - 需要认证
router.use('/inspections', requireAuth, inspectionRouter);
// 问题记录路由 - 需要认证
router.use('/problems', requireAuth, problemRouter);
// 人工记录路由 - 需要认证
router.use('/labor', requireAuth, laborRouter);
// 加班记录路由 - 需要认证
router.use('/overtime', requireAuth, overtimeRouter);
// 请假记录路由 - 需要认证
router.use('/leave', requireAuth, leaveRouter);
// 临时任务路由 - 需要认证
router.use('/temp-tasks', requireAuth, tempTaskRouter);
// 采购计划路由 - 需要认证
router.use('/purchase-plans', requireAuth, purchasePlanRouter);
// 物料申请路由 - 需要认证
router.use('/material-requests', requireAuth, materialRequestRouter);
// 基础数据路由（部门/仓库/温室/职位/区域/地块/编码规则/通知渠道/通知规则等）- 可选认证（公开数据）
router.use('/basic-data', optionalAuth, basicDataRouter);
// 数据字典路由 - 可选认证（公开数据，系统配置可匿名访问）
router.use('/dictionary', optionalAuth, dictionaryRouter);
// 组织与权限路由 - 公开（登录/验证接口）
router.use('/authority', authorityRouter);
// 通知设置路由 - 可选认证（公开数据）
router.use('/notifications', optionalAuth, notificationRouter);
// 审批工作流路由 - 需要认证
router.use('/approval-workflows', requireAuth, approvalWorkflowRouter);
// 审批单路由 - 需要认证
router.use('/approvals', requireAuth, approvalRouter);
// 审批联动路由 - 需要认证
router.use('/approval-linkage', requireAuth, approvalLinkageRouter);
// 操作日志路由 - 免认证（系统设置基础数据，登录前后都可读）
router.use('/operation-logs', operationLogRouter);
// 订单路由 - 需要认证
router.use('/crop-orders', requireAuth, cropOrderRouter);
// 客户路由 - 需要认证
router.use('/customers', requireAuth, customerRouter);
// 生产计划路由 - 需要认证
router.use('/production-plans', requireAuth, productionPlanRouter);
// 生产计划路由别名（兼容前端 /production/plans 调用）- 需要认证
router.use('/production/plans', requireAuth, productionPlanRouter);
// 技术方案路由 - 需要认证
router.use('/tech-solutions', requireAuth, techSolutionRouter);
// 生产汇总统计路由 - 需要认证
router.use('/summary', requireAuth, summaryRouter);
// 成本管理路由（物料成本 + 能源成本）- 需要认证
router.use('/material-costs', requireAuth, materialCostRouter);
router.use('/material-returns', requireAuth, materialReturnRouter);
router.use('/material-executes', requireAuth, materialExecuteRouter);
router.use('/material-statistics', requireAuth, materialStatisticsRouter);
// 性能监控路由 - 需要认证
router.use('/monitoring', requireAuth, monitoringRouter);
// 数据同步路由 - 需要认证
router.use('/sync', requireAuth, syncRouter);
// 公告路由 - 需要认证
router.use('/announcements', requireAuth, announcementRouter);
// 指标路由 - 需要认证
router.use('/indicators', requireAuth, indicatorsRouter);
// 指标评估路由 - 需要认证
router.use('/indicator-evaluations', requireAuth, indicatorEvaluationsRouter);
// 排班管理路由 - 需要认证
router.use('/schedules', requireAuth, scheduleRouter);
// 考勤管理路由 - 需要认证
router.use('/attendance', requireAuth, attendanceRouter);
// 人事管理路由 - 需要认证
router.use('/personnel', requireAuth, personnelRouter);
// 入职管理路由 - 需要认证
router.use('/onboarding', requireAuth, onboardingRouter);
// IoT设备监控路由 - 需要认证
router.use('/iot', requireAuth, iotMonitorRouter);
// 告警管理路由 - 需要认证
router.use('/alerts', requireAuth, alertRouter);
// 物料管理路由 - 需要认证
router.use('/materials', requireAuth, materialsRouter);
// 物料编码分类路由 - V12.0
router.use('/material-code-categories', requireAuth, materialCodeCategoriesRouter);
// 种植季记录路由 - 基地空间架构 V1.0
router.use('/planting-records', requireAuth, plantingRecordRouter);
// 离职管理路由 - 需要认证
router.use('/resignation', requireAuth, resignationRouter);
// 招聘管理路由 - 需要认证
router.use('/recruitment', requireAuth, recruitmentRouter);
// 合同续签路由 - 需要认证
router.use('/contract-renewal', requireAuth, contractRenewalRouter);
// 工资预算路由 - 需要认证
router.use('/salary-budget', requireAuth, salaryBudgetRouter);
// 施肥管理路由 - V10.0
router.use('/fertilizer', requireAuth, fertilizerRouter);
// 肥料知识库路由 - V12.0（免认证：系统设置基础数据）
router.use('/fertilizer-library', fertilizerLibraryRouter);
// 药剂知识库路由 - V2.0（免认证：系统设置基础数据）
router.use('/pesticide-library', pesticideLibraryRouter);
// 病虫害字典路由 - V12.0（免认证：系统设置基础数据）
router.use('/pest-disease-dict', pestDiseaseDictRouter);
// 每日计划路由 - 需要认证
router.use('/daily-plans', requireAuth, dailyPlansRouter);
// 月度计划路由 - 需要认证
router.use('/monthly-plans', requireAuth, monthlyPlansRouter);
// 行政区划路由 - V10.0
router.use('/region', requireAuth, regionRouter);
// 种植标签管理路由 - V10.0 (plant_labels + plant_marks)
router.use('/plant-labels', requireAuth, plantLabelRouter);
// 数据备份恢复路由 - 需要认证
router.use('/backup', requireAuth, backupRouter);
// 分区管理路由 — iAGS GreenHouseArea 集成
router.use('/farm-partitions', requireAuth, farmPartitionsRouter);
// 区域系统路由 — iAGS AreaSystem 集成
router.use('/area-systems', requireAuth, areaSystemsRouter);
// 设备系统路由 — iAGS deviceSystem 集成
router.use('/device-systems', requireAuth, deviceSystemsRouter);
// 摄像头路由 — iAGS Camera 集成
router.use('/cameras', requireAuth, camerasRouter);
// 能耗配置路由 — iAGS AreaEnery 集成
router.use('/energy-configs', requireAuth, energyConfigsRouter);
// 警报配置路由 — iAGS Warning 集成
router.use('/alarm-configs', requireAuth, alarmConfigsRouter);
// 水肥一体机路由 — iAGS WaterFertilizer 集成
router.use('/water-fertilizer', requireAuth, waterFertilizerRouter);
// 种植设置路由 — iAGS Plantset 集成
router.use('/plant-settings', requireAuth, plantSettingsRouter);
// 工程调试路由 — iAGS ProjectDebug 集成
router.use('/debug', requireAuth, projectDebugRouter);
// 设备分配路由 — iAGS DeviceDistribution 集成
router.use('/device-distributions', requireAuth, deviceDistributionRouter);
// 健康检查 - 增强版
router.get('/health', (req, res) => {
    const memUsage = process.memoryUsage();
    const healthData = {
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        memory: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024),
            unit: 'MB',
        },
        nodeVersion: process.version,
        platform: process.platform,
    };
    res.json(healthData);
});
export default router;
