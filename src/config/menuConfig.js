/**
 * 侧边栏菜单配置（数据驱动，与V1.1保持一致）
 * V1.1 源文件: src/components/layout/Sidebar.tsx
 *
 * 所有菜单项、图标映射、路由路径集中管理
 * 便于后续权限过滤和动态菜单扩展
 */

// ============================================================
// Element Plus 图标名称 → 组件映射关系
// 在 Sidebar.vue 的 <script> 中按需导入对应图标组件
// ============================================================

/**
 * 顶级独立菜单（无子菜单）
 * 显示在侧边栏最顶部，不可折叠
 */
export const topMenuItems = [
  { icon: 'MapLocation', label: '园区导览', path: '/park-archive' },
  { icon: 'DataAnalysis', label: '基地总览', path: '/dashboard' },
  { icon: 'Aim', label: '指标数据', path: '/indicators' },
  { icon: 'Bell', label: '公告管理', path: '/announcement' },
]

/**
 * 可展开菜单分组
 * 每个分组包含一组子菜单项
 * key: 唯一标识（用于展开/折叠状态管理）
 * activePrefix: 路由前缀（用于高亮判断，匹配V1.1的category逻辑）
 */
export const menuGroups = [
  {
    key: 'production',
    icon: 'Memo',
    label: '计划管理',
    activePrefix: '/production',
    children: [
      { icon: 'Document', label: '订单管理', path: '/crop/order' },
      { icon: 'Document', label: '生产计划', path: '/production' },
      { icon: 'DocumentChecked', label: '技术方案', path: '/tech-solution' },
      { icon: 'ShoppingCart', label: '采购计划', path: '/purchase-plan' },
    ],
  },
  {
    key: 'crop',
    icon: 'Grape',
    label: '作物管理',
    activePrefix: '/crop',
    children: [
      { icon: 'Grape', label: '种源管理', path: '/crop/seed-source' },
      { icon: 'Cherry', label: '育苗管理', path: '/crop/seedling' },
      { icon: 'Cherry', label: '种植管理', path: '/crop/planting' },
      { icon: 'CircleCheck', label: '采收入库', path: '/crop/harvest' },
      { icon: 'Grape', label: '施肥管理', path: '/crop/fertilizer' },
      { icon: 'Box', label: '作物库存', path: '/crop-inventory' },
      { icon: 'View', label: '实例追溯', path: '/crop/instance' },
    ],
  },
  {
    key: 'farm',
    icon: 'List',
    label: '农事管理',
    activePrefix: '/farm',
    children: [
      { icon: 'DataLine', label: '农事任务中心', path: '/farm-hub' },
      { icon: 'List', label: '智能任务中心', path: '/task-center' },
      { icon: 'Calendar', label: '排班调度', path: '/schedule' },
      { icon: 'Folder', label: '班组分配', path: '/team' },
      { icon: 'Calendar', label: '每日工单汇总', path: '/daily-work-summary' },
    ],
  },
  {
    key: 'inventory',
    icon: 'Box',
    label: '库存管理',
    activePrefix: '/warehouse-overview',
    children: [
      { icon: 'TakeawayBox', label: '库存总览', path: '/warehouse-overview' },
      { icon: 'OfficeBuilding', label: '物料入库', path: '/warehouse-inbound' },
      { icon: 'Van', label: '供应商管理', path: '/supplier-management' },
      { icon: 'List', label: '生产领料', path: '/material-receiving' },
      { icon: 'Switch', label: '生产退料', path: '/material-return' },
    ],
  },
  {
    key: 'labor',
    icon: 'User',
    label: '人工管理',
    activePrefix: '/labor',
    children: [
      { icon: 'User', label: '考勤管理', path: '/labor/attendance' },
      { icon: 'UserFilled', label: '人事管理', path: '/labor/personnel' },
      { icon: 'Money', label: '薪酬管理', path: '/labor/compensation' },
      { icon: 'TrendCharts', label: '运营分析', path: '/labor/analytics' },
    ],
  },
  {
    key: 'summary',
    icon: 'DataLine',
    label: '生产汇总表',
    activePrefix: '/summary',
    children: [
      { icon: 'Histogram', label: '汇总看板', path: '/summary/overview' },
      { icon: 'TrendCharts', label: '经营分析', path: '/summary/business-analysis' },
      { icon: 'Collection', label: '批次管理', path: '/summary/batch-management' },
      { icon: 'WarnTriangleFilled', label: '问题汇总', path: '/summary/problems' },
      { icon: 'Odometer', label: '指标看板', path: '/summary/indicators' },
    ],
  },
  {
    key: 'approval',
    icon: 'CircleCheck',
    label: '审批管理',
    activePrefix: '/approval',
    children: [
      { icon: 'Box', label: '物料审批', path: '/material-approval' },
      { icon: 'Grape', label: '生产审批', path: '/production-approval' },
      { icon: 'CircleCheck', label: '农事审批', path: '/farm-approval' },
      { icon: 'DataLine', label: '指标预算审批', path: '/indicator-budget-approval' },
      { icon: 'User', label: '人事审批', path: '/hr-approval' },
    ],
  },
]

/**
 * 用户下拉菜单配置（与V1.1 Header.tsx 一致）
 */
export const userMenuItems = [
  { command: 'profile', label: '个人中心', path: '/profile' },
  { command: 'my-tasks', label: '我的任务', path: '/my-tasks' },
  { command: 'messages', label: '消息中心', path: '/messages' },
  { command: 'my-applications', label: '我的申请', path: '/my-applications' },
  { command: 'settings', label: '系统设置', path: '/settings' },
]

/**
 * 根据路由路径判断菜单是否高亮
 * 与V1.1 Sidebar.tsx 的 isActive 逻辑一致
 */
export function isMenuActive(currentPath, targetPath) {
  if (targetPath === '/') return currentPath === '/'
  return currentPath.startsWith(targetPath)
}
