import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { title: '基地总览' }
  },
  {
    path: '/park',
    name: 'ParkArchive',
    component: () => import('@/views/park/ParkArchive.vue'),
    meta: { title: '园区导览' }
  },
  {
    path: '/farm',
    name: 'Farm',
    component: () => import('@/views/farm/FarmHub.vue'),
    meta: { title: '农事管理' }
  },
  {
    path: '/farm/task',
    name: 'FarmTask',
    component: () => import('@/views/farm/TaskCenter.vue'),
    meta: { title: '任务中心' }
  },
  {
    path: '/farm/schedule',
    name: 'FarmSchedule',
    component: () => import('@/views/farm/Schedule.vue'),
    meta: { title: '排班调度' }
  },
  {
    path: '/farm/team',
    name: 'FarmTeam',
    component: () => import('@/views/farm/Team.vue'),
    meta: { title: '班组分配' }
  },
  {
    path: '/farm/daily-summary',
    name: 'FarmDailySummary',
    component: () => import('@/views/farm/DailyWorkSummary.vue'),
    meta: { title: '每日工单汇总' }
  },
  {
    path: '/labor',
    name: 'Labor',
    component: () => import('@/views/labor/LaborIndex.vue'),
    meta: { title: '人工管理' }
  },
  {
    path: '/labor/attendance',
    name: 'LaborAttendance',
    component: () => import('@/views/labor/Attendance.vue'),
    meta: { title: '考勤管理' }
  },
  {
    path: '/labor/personnel',
    name: 'LaborPersonnel',
    component: () => import('@/views/labor/Personnel.vue'),
    meta: { title: '人事管理' }
  },
  {
    path: '/crop',
    name: 'Crop',
    component: () => import('@/views/crop/CropIndex.vue'),
    meta: { title: '作物管理' },
    children: [
      {
        path: 'seed-source',
        name: 'SeedSource',
        component: () => import('@/views/crop/SeedSource.vue'),
        meta: { title: '种源管理' }
      },
      {
        path: 'seedling',
        name: 'Seedling',
        component: () => import('@/views/crop/Seedling.vue'),
        meta: { title: '育苗管理' }
      },
      {
        path: 'planting',
        name: 'Planting',
        component: () => import('@/views/crop/Planting.vue'),
        meta: { title: '种植管理' }
      },
      {
        path: 'harvest',
        name: 'Harvest',
        component: () => import('@/views/crop/Harvest.vue'),
        meta: { title: '采收入库' }
      }
    ]
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/inventory/InventoryIndex.vue'),
    meta: { title: '库存管理' }
  },
  // 仓库物料模块
  {
    path: '/warehouse',
    name: 'Warehouse',
    redirect: '/warehouse/materials',
    meta: { title: '仓库管理' },
    children: [
      {
        path: 'materials',
        name: 'WarehouseMaterials',
        component: () => import('@/views/warehouse/Materials.vue'),
        meta: { title: '仓库物料' }
      },
      {
        path: 'inbound',
        name: 'WarehouseInbound',
        component: () => import('@/views/warehouse/WarehouseInbound.vue'),
        meta: { title: '物料入库' }
      }
    ]
  },
  // 供应商管理
  {
    path: '/supplier',
    name: 'Supplier',
    component: () => import('@/views/supplier/SupplierManagement.vue'),
    meta: { title: '供应商管理' }
  },
  // 物料模块
  {
    path: '/material',
    name: 'Material',
    redirect: '/material/return',
    meta: { title: '物料管理' },
    children: [
      {
        path: 'return',
        name: 'MaterialReturn',
        component: () => import('@/views/material/MaterialReturn.vue'),
        meta: { title: '生产退料' }
      }
    ]
  },
  {
    path: '/approval',
    name: 'Approval',
    component: () => import('@/views/approval/ApprovalIndex.vue'),
    meta: { title: '审批管理' }
  },
  {
    path: '/announcement',
    name: 'Announcement',
    component: () => import('@/views/announcement/index.vue'),
    meta: { title: '公告管理' }
  },
  {
    path: '/approval/farm',
    name: 'FarmApproval',
    component: () => import('@/views/approval/FarmApproval.vue'),
    meta: { title: '农事审批' }
  },
  {
    path: '/approval/work-order',
    name: 'WorkOrderApproval',
    component: () => import('@/views/approval/WorkOrderApproval.vue'),
    meta: { title: '工单审批' }
  },
  {
    path: '/approval/work-log',
    name: 'WorkLogApproval',
    component: () => import('@/views/approval/WorkLogApproval.vue'),
    meta: { title: '工作日志审批' }
  },
  {
    path: '/approvals',
    name: 'Approvals',
    component: () => import('@/views/approval/Approvals.vue'),
    meta: { title: '审批中心' }
  },
  {
    path: '/material-approval',
    name: 'MaterialApproval',
    component: () => import('@/views/approval/MaterialApproval.vue'),
    meta: { title: '物料审批' }
  },
  {
    path: '/production',
    name: 'Production',
    component: () => import('@/views/production/ProductionIndex.vue'),
    meta: { title: '生产管理' }
  },
  // 计划管理子路由
  {
    path: '/crop/order',
    name: 'CropOrder',
    component: () => import('@/views/production/Order.vue'),
    meta: { title: '订单管理' }
  },
  {
    path: '/crop/fertilizer',
    name: 'CropFertilizer',
    component: () => import('@/views/crop/Fertilizer.vue'),
    meta: { title: '施肥管理' }
  },
  {
    path: '/crop-inventory',
    name: 'CropInventory',
    component: () => import('@/views/crop/CropInventory.vue'),
    meta: { title: '作物库存' }
  },
  {
    path: '/crop/instance',
    name: 'CropInstance',
    component: () => import('@/views/crop/Instance.vue'),
    meta: { title: '作物实例' }
  },
  {
    path: '/tech-solution',
    name: 'TechSolution',
    component: () => import('@/views/production/TechSolution.vue'),
    meta: { title: '技术方案' }
  },
  {
    path: '/purchase-plan',
    name: 'PurchasePlan',
    component: () => import('@/views/production/PurchasePlan.vue'),
    meta: { title: '采购计划' }
  },
  {
    path: '/labor/compensation',
    name: 'LaborCompensation',
    component: () => import('@/views/labor/Compensation.vue'),
    meta: { title: '薪酬管理' }
  },
  {
    path: '/labor/analytics',
    name: 'LaborAnalytics',
    component: () => import('@/views/labor/Analytics.vue'),
    meta: { title: '人工分析' }
  },
  {
    path: '/task-center',
    name: 'TaskCenter',
    component: () => import('@/views/farm/TaskCenter.vue'),
    meta: { title: '任务中心' }
  },
  {
    path: '/farm-hub',
    name: 'FarmHub',
    component: () => import('@/views/farm/FarmHub.vue'),
    meta: { title: '农事中心' }
  },
  {
    path: '/problem-dispatch',
    name: 'ProblemDispatch',
    component: () => import('@/views/farm/FarmHub.vue'),
    meta: { title: '问题调度' }
  },
  {
    path: '/dispatch',
    name: 'Dispatch',
    component: () => import('@/views/dispatch/DispatchIndex.vue'),
    meta: { title: '智能调度' }
  },
  {
    path: '/indicators',
    name: 'Indicators',
    component: () => import('@/views/indicators/Indicators.vue'),
    meta: { title: '指标数据' }
  },
  // 生产汇总表模块
  {
    path: '/summary',
    name: 'Summary',
    redirect: '/summary/overview',
    meta: { title: '生产汇总' },
    children: [
      {
        path: 'overview',
        name: 'SummaryOverview',
        component: () => import('@/views/summary/Overview.vue'),
        meta: { title: '汇总看板' }
      },
      {
        path: 'business',
        name: 'BusinessAnalysis',
        component: () => import('@/views/summary/BusinessAnalysis.vue'),
        meta: { title: '经营分析' }
      },
      {
        path: 'batch-management',
        name: 'BatchManagement',
        component: () => import('@/views/summary/BatchManagement.vue'),
        meta: { title: '批次管理' }
      },
      {
        path: 'problems',
        name: 'ProblemSummary',
        component: () => import('@/views/summary/Problems.vue'),
        meta: { title: '问题汇总' }
      },
      {
        path: 'indicators',
        name: 'SummaryIndicators',
        component: () => import('@/views/summary/Indicators.vue'),
        meta: { title: '指标看板' }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    redirect: '/system/authority',
    meta: { title: '系统设置' },
    children: [
      {
        path: 'authority',
        name: 'Authority',
        component: () => import('@/views/system/authority/AuthorityConfiguration.vue'),
        meta: { title: '权限配置' }
      },
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/system/authority/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/system/authority/RoleManagement.vue'),
        meta: { title: '角色管理' }
      }
    ]
  },
  {
    path: '/worker-attendance',
    name: 'WorkerAttendance',
    component: () => import('@/views/labor/WorkerAttendance.vue'),
    meta: { title: '工人考勤' }
  },
  {
    path: '/work-log',
    name: 'WorkLog',
    component: () => import('@/views/farm/WorkLog.vue'),
    meta: { title: '工作日志' }
  },
  {
    path: '/monthly-report',
    name: 'MonthlyReport',
    component: () => import('@/views/summary/MonthlyReport.vue'),
    meta: { title: '月度报告' }
  },
  {
    path: '/material-category',
    name: 'MaterialCategory',
    component: () => import('@/views/material/MaterialCategory.vue'),
    meta: { title: '物料类别' }
  },
  {
    path: '/material-receiving',
    name: 'MaterialReceiving',
    component: () => import('@/views/material/MaterialReceiving.vue'),
    meta: { title: '物料接收' }
  },
  {
    path: '/warehouse-overview',
    name: 'WarehouseOverview',
    component: () => import('@/views/warehouse/WarehouseOverview.vue'),
    meta: { title: '仓库概览' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/farm/Tasks.vue'),
    meta: { title: '任务' }
  },
  {
    path: '/temp-task',
    name: 'TempTask',
    component: () => import('@/views/farm/TempTask.vue'),
    meta: { title: '临时任务' }
  },
  {
    path: '/personnel/staff',
    name: 'PersonnelStaff',
    component: () => import('@/views/labor/Staff.vue'),
    meta: { title: '人员管理' }
  },
  {
    path: '/leave',
    name: 'Leave',
    component: () => import('@/views/labor/Leave.vue'),
    meta: { title: '请假管理' }
  },
  {
    path: '/temp-worker',
    name: 'TempWorker',
    component: () => import('@/views/labor/TempWorker.vue'),
    meta: { title: '临时工管理' }
  },
  {
    path: '/salary',
    name: 'Salary',
    component: () => import('@/views/labor/Salary.vue'),
    meta: { title: '工资管理' }
  },
  {
    path: '/recruitment',
    name: 'Recruitment',
    component: () => import('@/views/labor/Recruitment.vue'),
    meta: { title: '招聘管理' }
  },
  {
    path: '/overtime',
    name: 'Overtime',
    component: () => import('@/views/labor/Overtime.vue'),
    meta: { title: '加班管理' }
  },
  {
    path: '/skill',
    name: 'Skill',
    component: () => import('@/views/labor/Skill.vue'),
    meta: { title: '技能管理' }
  },
  {
    path: '/performance',
    name: 'Performance',
    component: () => import('@/views/labor/Performance.vue'),
    meta: { title: '绩效管理' }
  },
  {
    path: '/efficiency',
    name: 'Efficiency',
    component: () => import('@/views/labor/Efficiency.vue'),
    meta: { title: '效率分析' }
  },
  {
    path: '/risk',
    name: 'Risk',
    component: () => import('@/views/labor/Risk.vue'),
    meta: { title: '风险管控' }
  },
  {
    path: '/smart-dispatch',
    name: 'SmartDispatch',
    component: () => import('@/views/farm/SmartDispatch.vue'),
    meta: { title: '智能调度' }
  },
  {
    path: '/daily-planning',
    name: 'DailyPlanning',
    component: () => import('@/views/production/DailyPlanning.vue'),
    meta: { title: '日计划' }
  },
  {
    path: '/monthly-planning',
    name: 'MonthlyPlanning',
    component: () => import('@/views/production/MonthlyPlanning.vue'),
    meta: { title: '月计划' }
  },
  {
    path: '/piecework',
    name: 'Piecework',
    component: () => import('@/views/labor/Piecework.vue'),
    meta: { title: '计件管理' }
  },
  {
    path: '/salary-budget',
    name: 'SalaryBudget',
    component: () => import('@/views/labor/SalaryBudget.vue'),
    meta: { title: '工资预算' }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/labor/Onboarding.vue'),
    meta: { title: '入职管理' }
  },
  {
    path: '/contract',
    name: 'Contract',
    component: () => import('@/views/labor/Contract.vue'),
    meta: { title: '合同管理' }
  },
  {
    path: '/inspection',
    name: 'Inspection',
    component: () => import('@/views/farm/Inspection.vue'),
    meta: { title: '巡检管理' }
  },
  {
    path: '/environment-monitor',
    name: 'EnvironmentMonitor',
    component: () => import('@/views/monitor/EnvironmentMonitor.vue'),
    meta: { title: '环境监控' }
  },
  {
    path: '/harvest',
    name: 'Harvest',
    component: () => import('@/views/crop/Harvest.vue'),
    meta: { title: '采收管理' }
  },
  {
    path: '/produce-code-rule',
    name: 'ProduceCodeRule',
    component: () => import('@/views/system/ProduceCodeRule.vue'),
    meta: { title: '产品编码规则' }
  },
  {
    path: '/iot-monitor',
    name: 'IoTMonitor',
    component: () => import('@/views/monitor/IoTMonitor.vue'),
    meta: { title: 'IoT监控' }
  },
  {
    path: '/env-control',
    name: 'EnvControl',
    component: () => import('@/views/monitor/EnvControl.vue'),
    meta: { title: '环境控制' }
  },
  {
    path: '/agriculture-record',
    name: 'AgricultureRecord',
    component: () => import('@/views/farm/AgricultureRecord.vue'),
    meta: { title: '农事记录' }
  },
  {
    path: '/device-monitor',
    name: 'DeviceMonitor',
    component: () => import('@/views/monitor/DeviceMonitor.vue'),
    meta: { title: '设备监控' }
  },
  {
    path: '/alert-info',
    name: 'AlertInfo',
    component: () => import('@/views/monitor/AlertInfo.vue'),
    meta: { title: '告警信息' }
  },
  {
    path: '/production-approval',
    name: 'ProductionApproval',
    component: () => import('@/views/approval/ProductionApproval.vue'),
    meta: { title: '生产审批' }
  },
  {
    path: '/indicator-budget-approval',
    name: 'IndicatorBudgetApproval',
    component: () => import('@/views/approval/IndicatorBudgetApproval.vue'),
    meta: { title: '指标预算审批' }
  },
  {
    path: '/my-applications',
    name: 'MyApplications',
    component: () => import('@/views/approval/MyApplications.vue'),
    meta: { title: '我的申请' }
  },
  {
    path: '/pending-approval',
    name: 'PendingApproval',
    component: () => import('@/views/approval/PendingApproval.vue'),
    meta: { title: '待审批' }
  },
  {
    path: '/approved',
    name: 'Approved',
    component: () => import('@/views/approval/Approved.vue'),
    meta: { title: '已审批' }
  },
  {
    path: '/my-approval',
    name: 'MyApproval',
    component: () => import('@/views/approval/MyApproval.vue'),
    meta: { title: '我的审批' }
  },
  {
    path: '/hr-approval',
    name: 'HrApproval',
    component: () => import('@/views/labor/HrApproval.vue'),
    meta: { title: 'HR审批' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/message/Messages.vue'),
    meta: { title: '消息中心' }
  },
  {
    path: '/code-rule',
    name: 'CodeRule',
    component: () => import('@/views/system/CodeRule.vue'),
    meta: { title: '编码规则' }
  },
  {
    path: '/supplier-code-rule',
    name: 'SupplierCodeRule',
    component: () => import('@/views/system/SupplierCodeRule.vue'),
    meta: { title: '供应商编码规则' }
  },
  {
    path: '/data-migration',
    name: 'DataMigration',
    component: () => import('@/views/tools/DataMigration.vue'),
    meta: { title: '数据迁移' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404', hidden: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '智慧种植系统'} - V2.0`

  // 这里可以添加权限验证逻辑
  // const token = localStorage.getItem('token')
  // if (to.path !== '/login' && !token) {
  //   next('/login')
  // } else {
  //   next()
  // }

  next()
})

export default router
