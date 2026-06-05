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
  // V1.1 App.tsx:294 - 数据分析系统旧路由重定向（与 V1.1 1:1 对齐）
  {
    path: '/reports',
    redirect: '/summary/overview'
  },
  // V1.1兼容路由 - /settings 指向系统设置首页
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/system/SystemIndex.vue'),
    meta: { title: '系统设置' }
  },
  {
    path: '/settings/system-config',
    name: 'SystemConfig',
    component: () => import('@/views/system/SystemConfig.vue'),
    meta: { title: '系统配置' }
  },
  {
    path: '/settings/dictionary',
    name: 'Dictionary',
    component: () => import('@/views/system/DictionaryManagement.vue'),
    meta: { title: '数据字典' }
  },
  {
    path: '/settings/departments',
    name: 'DepartmentSettings',
    component: () => import('@/views/system/DepartmentSettings.vue'),
    meta: { title: '部门设置' }
  },
  {
    path: '/settings/notification',
    name: 'NotificationSettings',
    component: () => import('@/views/system/NotificationSettings.vue'),
    meta: { title: '通知设置' }
  },
  {
    path: '/settings/audit-log',
    name: 'AuditLog',
    component: () => import('@/views/system/AuditLog.vue'),
    meta: { title: '操作日志' }
  },
  {
    path: '/settings/bases',
    name: 'FarmStructure',
    component: () => import('@/views/system/FarmStructureManagement.vue'),
    meta: { title: '基地架构' }
  },
  {
    path: '/settings/user-permission',
    name: 'UserPermission',
    component: () => import('@/views/system/authority/UserPermissionHub.vue'),
    meta: { title: '用户权限管理' }
  },
  {
    path: '/settings/organizations',
    name: 'Organizations',
    component: () => import('@/views/system/authority/OrganizationManagement.vue'),
    meta: { title: '组织管理' }
  },
  {
    path: '/settings/roles',
    name: 'Roles',
    component: () => import('@/views/system/authority/RoleManagement.vue'),
    meta: { title: '角色管理' }
  },
  {
    path: '/settings/authority-config',
    name: 'AuthorityConfig',
    component: () => import('@/views/system/authority/AuthorityConfiguration.vue'),
    meta: { title: '权限配置' }
  },
  {
    path: '/settings/users',
    name: 'Users',
    component: () => import('@/views/system/authority/UserManagement.vue'),
    meta: { title: '用户管理' }
  },
  {
    path: '/settings/user-authority',
    name: 'UserAuthority',
    component: () => import('@/views/system/authority/UserAuthorityConfig.vue'),
    meta: { title: '用户权限' }
  },
  {
    path: '/settings/approval-workflow',
    name: 'ApprovalWorkflow',
    component: () => import('@/views/system/ApprovalWorkflowConfig.vue'),
    meta: { title: '审批流程' }
  },
  {
    path: '/settings/approval-level-config',
    name: 'ApprovalLevelConfig',
    component: () => import('@/views/system/ApprovalLevelConfig.vue'),
    meta: { title: '分级审批' }
  },
  {
    path: '/settings/crop-variety',
    name: 'CropVariety',
    component: () => import('@/views/system/CropVarietyManagement.vue'),
    meta: { title: '作物品种' },
  },
  {
    path: '/settings/pest-disease-dict',
    name: 'PestDiseaseDict',
    component: () => import('@/views/system/pest-disease-dict/index.vue'),
    meta: { title: '病虫害字典' }
  },
  {
    path: '/settings/pesticide-library',
    name: 'PesticideLibrary',
    component: () => import('@/views/system/pesticide-library/index.vue'),
    meta: { title: '药剂库' }
  },
  {
    path: '/settings/warehouse',
    name: 'WarehouseManagement',
    component: () => import('@/views/system/WarehouseManagement.vue'),
    meta: { title: '仓库管理' }
  },
  {
    path: '/settings/team',
    name: 'TeamManagement',
    component: () => import('@/views/system/TeamManagement.vue'),
    meta: { title: '小组管理' }
  },
  {
    path: '/settings/fertilizer-library',
    name: 'FertilizerLibrary',
    component: () => import('@/views/system/fertilizer-library/index.vue'),
    meta: { title: '肥料库' }
  },
  {
    path: '/settings/base-operations',
    name: 'BaseOperations',
    component: () => import('@/views/system/BaseOperations.vue'),
    meta: { title: '基地运营中心' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { title: '基地总览' }
  },
  {
    path: '/park-archive',
    name: 'ParkArchive',
    component: () => import('@/views/park/ParkArchive.vue'),
    meta: { title: '分区浏览' }
  },
  {
    path: '/park',
    redirect: '/park-archive'
  },
  // 农事管理 - 子路由（路径与V1.1完全对齐：/schedule、/team、/daily-work-summary）
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/farm/Schedule.vue'),
    meta: { title: '排班调度' }
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('@/views/farm/Team.vue'),
    meta: { title: '班组分配' }
  },
  {
    path: '/daily-work-summary',
    name: 'DailyWorkSummary',
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
    path: '/crop/seed-source',
    name: 'SeedSource',
    component: () => import('@/views/crop/SeedSource.vue'),
    meta: { title: '种源管理' }
  },
  {
    path: '/crop/seedling',
    name: 'Seedling',
    component: () => import('@/views/crop/Seedling.vue'),
    meta: { title: '品牌管理' }
  },
  {
    path: '/crop/planting',
    name: 'Planting',
    component: () => import('@/views/crop/Planting.vue'),
    meta: { title: '种植管理' }
  },
  {
    path: '/crop/harvest',
    name: 'Harvest',
    component: () => import('@/views/crop/Harvest.vue'),
    meta: { title: '收获入库' }
  },
  // 仓库物料模块（路径与V1.1对齐：/warehouse-overview、/warehouse-inbound）
  {
    path: '/warehouse-inbound',
    name: 'WarehouseInboundDirect',
    component: () => import('@/views/warehouse/WarehouseInbound.vue'),
    meta: { title: '物料入库' }
  },
  {
    path: '/warehouse-overview',
    name: 'WarehouseOverview',
    component: () => import('@/views/warehouse/WarehouseOverview.vue'),
    meta: { title: '物料库存' }
  },
  // 物资管理主页（V1.1 路径 /materials，对应 V2.0 仓库物料页面）
  {
    path: '/materials',
    name: 'Materials',
    component: () => import('@/views/warehouse/Materials.vue'),
    meta: { title: '物资管理' }
  },
  // 供应商管理（V1.1 路径 /supplier-management）
  {
    path: '/supplier-management',
    name: 'SupplierManagementDirect',
    component: () => import('@/views/supplier/SupplierManagement.vue'),
    meta: { title: '供应商管理' }
  },
  // 物料模块（V1.1 路径 /material-return、/material-receiving）
  {
    path: '/material-return',
    name: 'MaterialReturnDirect',
    component: () => import('@/views/material/MaterialReturn.vue'),
    meta: { title: '生产退料' }
  },
  {
    path: '/material-receiving',
    name: 'MaterialReceiving',
    component: () => import('@/views/material/MaterialReceiving.vue'),
    meta: { title: '生产领料' }
  },
  // TODO [P0-EX-001 fix 2026-06-03]: ApprovalIndex.vue 是 V2.0 自我创造（V1.1 不存在）
  // 该路由指向的 src/views/approval/ApprovalIndex.vue 已备份为 .disabled，原文件已移到回收站
  // 暂时注释路由，4 个核心入口（/my-applications、/pending-approval、/approved、/my-approval）已覆盖 V1.1 行为
  // 待产品确认：是否完全删除（推荐 A） / 保留为扩展 / 折叠到其他页面
  // {
  //   path: '/approval',
  //   name: 'Approval',
  //   component: () => import('@/views/approval/ApprovalIndex.vue'),
  //   meta: { title: '审批管理' }
  // },
  {
    path: '/announcement',
    name: 'Announcement',
    component: () => import('@/views/announcement/index.vue'),
    meta: { title: '公告管理' }
  },
  {
    path: '/farm-approval',
    name: 'FarmApproval',
    component: () => import('@/views/approval/FarmApproval.vue'),
    meta: { title: '农业审批' }
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
    component: () => import('@/views/production/Production.vue'),
    meta: { title: '生产计划' }
  },
  // 计划管理子路由（/production/list 重定向到 /production，与V1.1对齐）
  {
    path: '/production/list',
    redirect: '/production'
  },
  // 病虫害管理（V1.1 路径 /pest-control，对应作物管理子菜单）
  {
    path: '/pest-control',
    name: 'PestControl',
    component: () => import('@/views/farm/pest-control/PestControlPage.vue'),
    meta: { title: '病虫害管理' }
  },
  {
    path: '/crop/order',
    name: 'CropOrder',
    component: () => import('@/views/crop/Order.vue'),
    meta: { title: '订单管理' }
  },
  {
    path: '/crop/customer',
    name: 'CropCustomer',
    component: () => import('@/views/crop/Customer.vue'),
    meta: { title: '客户管理' }
  },
  {
    path: '/crop/fertilizer',
    name: 'CropFertilizer',
    component: () => import('@/views/crop/Fertilizer.vue'),
    meta: { title: '新闻管理' }
  },
  {
    path: '/crop-inventory',
    name: 'CropInventory',
    component: () => import('@/views/crop/CropInventory.vue'),
    meta: { title: '物料库存' }
  },
  // 作物出库记录（V1.1 路径 /crop/outbound-records）
  {
    path: '/crop/outbound-records',
    name: 'CropOutboundRecords',
    component: () => import('@/views/crop/OutboundRecords.vue'),
    meta: { title: '出库记录' }
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
    path: '/plan-summary',
    name: 'PlanSummary',
    component: () => import('@/views/production/PlanSummary.vue'),
    meta: { title: '计划汇总' }
  },
  {
    path: '/labor/compensation',
    name: 'LaborCompensation',
    component: () => import('@/views/labor/Compensation.vue'),
    meta: { title: '薪资管理' }
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
    meta: { title: '农业中心' }
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
  // 生产汇总表单模块
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
        path: 'business-analysis',
        name: 'BusinessAnalysis',
        component: () => import('@/views/summary/BusinessAnalysis.vue'),
        meta: { title: '经营分析' }
      },
      {
        path: 'business',
        redirect: '/summary/business-analysis'
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
    redirect: '/settings'
  },
  {
    path: '/worker-attendance',
    name: 'WorkerAttendance',
    component: () => import('@/views/labor/WorkerAttendance.vue'),
    meta: { title: '人工考勤' }
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
    meta: { title: '应聘管理' }
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
    meta: { title: '薪资管理' }
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
    meta: { title: '薪资预算' }
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
    name: 'HarvestOld',
    component: () => import('@/views/crop/Harvest.vue'),
    meta: { title: '收获管理' }
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
    meta: { title: '农业记录' }
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
    meta: { title: '预警信息' }
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
    component: () => import('@/views/approval/HrApproval.vue'),
    meta: { title: '人事审批' }
  },
  // P0-EX: HrApprovalDocuments.vue 已被备份为 .disabled（V1.1 端无对应页面，V2.0 端是新增扩展）
  // TODO: 等用户决策（删除/保留为 V2.0 扩展）后再恢复路由
  // {
  //   path: '/settings/personnel/hr-documents',
  //   name: 'HrApprovalDocuments',
  //   component: () => import('@/views/approval/HrApprovalDocuments.vue'),
  //   meta: { title: '考勤数据' }
  // },
  // P0-EX: WorkOrderApproval.vue 已被备份为 .disabled（V1.1 端无独立工单审批页面，V2.0 端是新增）
  // TODO: 等用户决策（删除/保留为 V2.0 扩展）后再添加路由 /work-order-approval
  // P0-EX: WorkLogApproval.vue 已被备份为 .disabled（V1.1 端无独立工时审批页面，V2.0 端是新增）
  // TODO: 等用户决策（删除/保留为 V2.0 扩展）后再添加路由 /work-log-approval
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
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/my-tasks',
    name: 'MyTasks',
    component: () => import('@/views/farm/MyTasks.vue'),
    meta: { title: '我的任务' }
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
  document.title = `${to.meta.title || '智慧种植管理系统'} - V2.0`

  // 权限验证逻辑
  // const token = localStorage.getItem('token')
  // if (to.path !== '/login' && !token) {
  //   next('/login')
  // } else {
  //   next()
  // }

  next()
})

export default router
