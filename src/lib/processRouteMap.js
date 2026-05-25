/**
 * 工序路由 → 工序OID 映射表 (V2.0)
 *
 * 与 server/src/db/seedData.ts 中的 seedAuthorityData() 工序定义一一对应
 * 用于前端权限检查：将菜单路由路径转换为工序OID，再匹配角色权限
 *
 * 基于 V1.1 src/lib/processRouteMap.ts 迁移
 * V2.0 路由与 V1.1 大部分兼容，但部分路径有调整
 */

/**
 * 路由路径 → 工序OID 映射
 * @type {Record<string, string>}
 */
const processRouteMap = {
  // ========== 一级菜单 ==========
  '/park-archive': 'PROC_PARK',
  '/park': 'PROC_PARK',
  '/dashboard': 'PROC_DASHBOARD',
  '/indicators': 'PROC_INDICATORS',
  '/announcement': 'PROC_ANNOUNCE',
  '/production': 'PROC_PRODUCTION',
  '/crop/seed-source': 'PROC_CROP',
  '/agriculture-record': 'PROC_FARM',
  '/farm-hub': 'PROC_FARM',
  '/farm': 'PROC_FARM',
  '/materials': 'PROC_MATERIALS',
  '/warehouse': 'PROC_MATERIALS',
  '/warehouse-overview': 'PROC_MATERIALS',
  '/labor': 'PROC_LABOR',
  '/labor/task-center': 'PROC_LABOR',
  '/labor/attendance': 'PROC_LABOR',
  '/reports': 'PROC_SUMMARY',
  '/summary': 'PROC_SUMMARY',
  '/summary/overview': 'PROC_SUMMARY',
  '/approvals': 'PROC_WORKFLOW',
  '/approval': 'PROC_WORKFLOW',
  '/settings': 'PROC_SETTINGS',

  // ========== 计划管理子菜单 ==========
  '/crop/order': 'PROC_ORDER',
  '/production': 'PROC_PRODUCTION',
  '/tech-solution': 'PROC_TECH',
  '/purchase-plan': 'PROC_PURCHASE',

  // ========== 作物管理子菜单 ==========
  '/crop/seedling': 'PROC_SEEDLING',
  '/crop/planting': 'PROC_PLANTING',
  '/crop/harvest': 'PROC_CROP_HARVEST',
  '/crop-inventory': 'PROC_CROP_INVENTORY',
  '/crop/instance': 'PROC_CROP_INSTANCE',

  // ========== 农事管理子菜单 ==========
  '/farm/task': 'PROC_TASK_CENTER',
  '/task-center': 'PROC_TASK_CENTER',
  '/farm/schedule': 'PROC_SCHEDULE',
  '/farm/team': 'PROC_TEAM',
  '/farm/daily-summary': 'PROC_DAILY_SUMMARY',
  '/daily-planning': 'PROC_DAILY_SUMMARY',
  '/monthly-planning': 'PROC_DAILY_SUMMARY',

  // ========== 库存管理子菜单 ==========
  '/warehouse/inbound': 'PROC_WH_INBOUND',
  '/warehouse/materials': 'PROC_MATERIALS',
  '/supplier': 'PROC_SUPPLIER',
  '/supplier-management': 'PROC_SUPPLIER',
  '/material-receiving': 'PROC_MAT_RECEIVING',
  '/material/return': 'PROC_MAT_RETURN',

  // ========== 人工管理子菜单 ==========
  '/labor/personnel': 'PROC_LABOR_PERSONNEL',
  '/labor/compensation': 'PROC_LABOR_COMP',
  '/labor/analytics': 'PROC_LABOR_ANALYTICS',
  '/personnel/staff': 'PROC_LABOR_PERSONNEL',

  // ========== 生产汇总表子菜单 ==========
  '/summary/business-analysis': 'PROC_SUM_YIELD',
  '/summary/business': 'PROC_SUM_YIELD',
  '/summary/batch-management': 'PROC_SUM_BATCH',
  '/summary/problems': 'PROC_SUM_PROBLEMS',
  '/summary/indicators': 'PROC_SUM_INDICATORS',

  // ========== 审批中心子菜单 ==========
  '/material-approval': 'PROC_APPROVAL_MAT',
  '/production-approval': 'PROC_APPROVAL_PROD',
  '/farm-approval': 'PROC_APPROVAL_FARM',
  '/indicator-budget-approval': 'PROC_APPROVAL_IND',
  '/my-applications': 'PROC_MY_APPLICATIONS',
  '/hr-approval': 'PROC_HR_APPROVAL',

  // ========== V2.0 特有路由 ==========
  '/crop/fertilizer': 'PROC_CROP',        // 施肥管理
  '/material-category': 'PROC_MATERIALS', // 物料类别
  '/dispatch': 'PROC_TASK_CENTER',        // 智能调度
  '/smart-dispatch': 'PROC_TASK_CENTER',  // 智能调度
  '/temp-task': 'PROC_TASK_CENTER',       // 临时任务
  '/tasks': 'PROC_TASK_CENTER',           // 任务
  '/work-log': 'PROC_FARM',               // 工作日志
  '/inspection': 'PROC_FARM',             // 巡检管理
  '/problem-dispatch': 'PROC_FARM',       // 问题调度
  '/daily-planning': 'PROC_PRODUCTION',   // 日计划
  '/monthly-planning': 'PROC_PRODUCTION', // 月计划

  // ========== 个人中心/用户菜单路由 ==========
  '/profile': 'PROC_SETTINGS',
  '/my-tasks': 'PROC_TASK_CENTER',
  '/messages': 'PROC_ANNOUNCE',
}

/**
 * 根据路由路径获取工序OID
 * 支持精确匹配和前缀匹配
 *
 * @param {string} route - 路由路径（如 /dashboard）
 * @returns {string|null} - 对应的工序OID，未找到返回 null
 */
export function getProcessOidByRoute(route) {
  // 精确匹配
  if (processRouteMap[route]) {
    return processRouteMap[route]
  }

  // 前缀匹配（最长匹配优先）
  const routes = Object.keys(processRouteMap).sort((a, b) => b.length - a.length)
  for (const key of routes) {
    if (route.startsWith(key + '/') || route === key) {
      return processRouteMap[key]
    }
  }

  return null
}

// 导出映射表供审计使用
export { processRouteMap }

export default processRouteMap
