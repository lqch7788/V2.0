<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <span v-if="!collapsed" class="sidebar-title">种植管理系统</span>
      <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? '展开菜单' : '收起菜单'">
        <el-icon :size="20">
          <CaretLeft v-if="!collapsed" />
          <CaretRight v-else />
        </el-icon>
      </button>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <ul class="menu-list">
        <!-- 园区导览 -->
        <li>
          <router-link
            to="/park-archive"
            class="menu-item"
            :class="{ active: isActive('/park-archive') }"
          >
            <el-icon :size="20"><MapLocation /></el-icon>
            <span v-if="!collapsed" class="menu-text">园区导览</span>
          </router-link>
        </li>

        <!-- 基地总览 -->
        <li>
          <router-link
            to="/dashboard"
            class="menu-item"
            :class="{ active: isActive('/dashboard') }"
          >
            <el-icon :size="20"><DataAnalysis /></el-icon>
            <span v-if="!collapsed" class="menu-text">基地总览</span>
          </router-link>
        </li>

        <!-- 指标数据 -->
        <li>
          <router-link
            to="/indicators"
            class="menu-item"
            :class="{ active: isActive('/indicators') }"
          >
            <el-icon :size="20"><Aim /></el-icon>
            <span v-if="!collapsed" class="menu-text">指标数据</span>
          </router-link>
        </li>

        <!-- 公告管理 -->
        <li>
          <router-link
            to="/announcement"
            class="menu-item"
            :class="{ active: isActive('/announcement') }"
          >
            <el-icon :size="20"><Bell /></el-icon>
            <span v-if="!collapsed" class="menu-text">公告管理</span>
          </router-link>
        </li>

        <!-- 计划管理 -->
        <li>
          <button
            class="menu-item menu-item-submenu"
            :class="{ active: isProductionActive }"
            @click="toggleProduction"
          >
            <el-icon :size="20"><Memo /></el-icon>
            <span v-if="!collapsed" class="menu-text">计划管理</span>
            <el-icon v-if="!collapsed" :size="16" class="submenu-arrow" :class="{ expanded: productionExpanded }">
              <CaretRight />
            </el-icon>
          </button>
          <transition name="submenu">
            <ul v-if="productionExpanded && !collapsed" class="submenu-list">
              <li>
                <router-link to="/crop/order" class="submenu-item" :class="{ active: isActive('/crop/order') }">
                  <el-icon :size="16"><Document /></el-icon>
                  <span>订单管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/production" class="submenu-item" :class="{ active: isActive('/production') }">
                  <el-icon :size="16"><Document /></el-icon>
                  <span>生产计划</span>
                </router-link>
              </li>
              <li>
                <router-link to="/tech-solution" class="submenu-item" :class="{ active: isActive('/tech-solution') }">
                  <el-icon :size="16"><DocumentChecked /></el-icon>
                  <span>技术方案</span>
                </router-link>
              </li>
              <li>
                <router-link to="/purchase-plan" class="submenu-item" :class="{ active: isActive('/purchase-plan') }">
                  <el-icon :size="16"><ShoppingCart /></el-icon>
                  <span>采购计划</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- 作物管理 -->
        <li>
          <button
            class="menu-item menu-item-submenu"
            :class="{ active: isCropActive }"
            @click="toggleCrop"
          >
            <el-icon :size="20"><Grape /></el-icon>
            <span v-if="!collapsed" class="menu-text">作物管理</span>
            <el-icon v-if="!collapsed" :size="16" class="submenu-arrow" :class="{ expanded: cropExpanded }">
              <CaretRight />
            </el-icon>
          </button>
          <transition name="submenu">
            <ul v-if="cropExpanded && !collapsed" class="submenu-list">
              <li>
                <router-link to="/crop/seed-source" class="submenu-item" :class="{ active: isActive('/crop/seed-source') }">
                  <el-icon :size="16"><Grape /></el-icon>
                  <span>内部种源</span>
                </router-link>
              </li>
              <li>
                <router-link to="/crop/seedling" class="submenu-item" :class="{ active: isActive('/crop/seedling') }">
                  <el-icon :size="16"><Cherry /></el-icon>
                  <span>育苗管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/crop/planting" class="submenu-item" :class="{ active: isActive('/crop/planting') }">
                  <el-icon :size="16"><Cherry /></el-icon>
                  <span>种植管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/crop-inventory" class="submenu-item" :class="{ active: isActive('/crop-inventory') }">
                  <el-icon :size="16"><Box /></el-icon>
                  <span>作物库存</span>
                </router-link>
              </li>
              <li>
                <router-link to="/crop/outbound-records" class="submenu-item" :class="{ active: isActive('/crop/outbound-records') }">
                  <el-icon :size="16"><Document /></el-icon>
                  <span>出库记录</span>
                </router-link>
              </li>
              <li>
                <router-link to="/crop/material-flow" class="submenu-item" :class="{ active: isActive('/crop/material-flow') }">
                  <el-icon :size="16"><TrendCharts /></el-icon>
                  <span>流转追溯</span>
                </router-link>
              </li>
              <li>
                <router-link to="/crop/fertilizer" class="submenu-item" :class="{ active: isActive('/crop/fertilizer') }">
                  <el-icon :size="16"><Grape /></el-icon>
                  <span>施肥管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/pest-control" class="submenu-item" :class="{ active: isActive('/pest-control') }">
                  <el-icon :size="16"><WarnTriangleFilled /></el-icon>
                  <span>病虫害管理</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- 农事管理 -->
        <li>
          <button
            class="menu-item menu-item-submenu"
            :class="{ active: isFarmActive }"
            @click="toggleFarm"
          >
            <el-icon :size="20"><List /></el-icon>
            <span v-if="!collapsed" class="menu-text">农事管理</span>
            <el-icon v-if="!collapsed" :size="16" class="submenu-arrow" :class="{ expanded: farmExpanded }">
              <CaretRight />
            </el-icon>
          </button>
          <transition name="submenu">
            <ul v-if="farmExpanded && !collapsed" class="submenu-list">
              <li>
                <router-link to="/farm-hub" class="submenu-item" :class="{ active: isActive('/farm-hub') }">
                  <el-icon :size="16"><DataLine /></el-icon>
                  <span>农事任务中心</span>
                </router-link>
              </li>
              <li>
                <router-link to="/task-center" class="submenu-item" :class="{ active: isActive('/task-center') }">
                  <el-icon :size="16"><List /></el-icon>
                  <span>智能任务中心</span>
                </router-link>
              </li>
              <li>
                <router-link to="/schedule" class="submenu-item" :class="{ active: isActive('/schedule') }">
                  <el-icon :size="16"><Calendar /></el-icon>
                  <span>排班调度</span>
                </router-link>
              </li>
              <li>
                <router-link to="/team" class="submenu-item" :class="{ active: isActive('/team') }">
                  <el-icon :size="16"><Folder /></el-icon>
                  <span>班组分配</span>
                </router-link>
              </li>
              <li>
                <router-link to="/daily-work-summary" class="submenu-item" :class="{ active: isActive('/daily-work-summary') }">
                  <el-icon :size="16"><Calendar /></el-icon>
                  <span>每日工单汇总</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- 物资管理 -->
        <li>
          <button
            class="menu-item menu-item-submenu"
            :class="{ active: isInventoryActive }"
            @click="toggleInventory"
          >
            <el-icon :size="20"><Box /></el-icon>
            <span v-if="!collapsed" class="menu-text">物资管理</span>
            <el-icon v-if="!collapsed" :size="16" class="submenu-arrow" :class="{ expanded: inventoryExpanded }">
              <CaretRight />
            </el-icon>
          </button>
          <transition name="submenu">
            <ul v-if="inventoryExpanded && !collapsed" class="submenu-list">
              <li>
                <router-link to="/warehouse-overview" class="submenu-item" :class="{ active: isActive('/warehouse-overview') }">
                  <el-icon :size="16"><TakeawayBox /></el-icon>
                  <span>物料库存</span>
                </router-link>
              </li>
              <li>
                <router-link to="/warehouse-inbound" class="submenu-item" :class="{ active: isActive('/warehouse-inbound') }">
                  <el-icon :size="16"><OfficeBuilding /></el-icon>
                  <span>物料入库</span>
                </router-link>
              </li>
              <li>
                <router-link to="/supplier-management" class="submenu-item" :class="{ active: isActive('/supplier-management') }">
                  <el-icon :size="16"><Van /></el-icon>
                  <span>供应商管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/material-receiving" class="submenu-item" :class="{ active: isActive('/material-receiving') }">
                  <el-icon :size="16"><List /></el-icon>
                  <span>生产领料</span>
                </router-link>
              </li>
              <li>
                <router-link to="/material-return" class="submenu-item" :class="{ active: isActive('/material-return') }">
                  <el-icon :size="16"><Switch /></el-icon>
                  <span>生产退料</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- 人工管理 -->
        <li>
          <button
            class="menu-item menu-item-submenu"
            :class="{ active: isLaborActive }"
            @click="toggleLabor"
          >
            <el-icon :size="20"><User /></el-icon>
            <span v-if="!collapsed" class="menu-text">人工管理</span>
            <el-icon v-if="!collapsed" :size="16" class="submenu-arrow" :class="{ expanded: laborExpanded }">
              <CaretRight />
            </el-icon>
          </button>
          <transition name="submenu">
            <ul v-if="laborExpanded && !collapsed" class="submenu-list">
              <li>
                <router-link to="/labor/attendance" class="submenu-item" :class="{ active: isActive('/labor/attendance') }">
                  <el-icon :size="16"><User /></el-icon>
                  <span>考勤管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/labor/personnel" class="submenu-item" :class="{ active: isActive('/labor/personnel') }">
                  <el-icon :size="16"><UserFilled /></el-icon>
                  <span>人事管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/labor/compensation" class="submenu-item" :class="{ active: isActive('/labor/compensation') }">
                  <el-icon :size="16"><Money /></el-icon>
                  <span>薪酬管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/labor/analytics" class="submenu-item" :class="{ active: isActive('/labor/analytics') }">
                  <el-icon :size="16"><TrendCharts /></el-icon>
                  <span>运营分析</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- 生产汇总表 -->
        <li>
          <button
            class="menu-item menu-item-submenu"
            :class="{ active: isSummaryActive }"
            @click="toggleSummary"
          >
            <el-icon :size="20"><DataLine /></el-icon>
            <span v-if="!collapsed" class="menu-text">生产汇总表</span>
            <el-icon v-if="!collapsed" :size="16" class="submenu-arrow" :class="{ expanded: summaryExpanded }">
              <CaretRight />
            </el-icon>
          </button>
          <transition name="submenu">
            <ul v-if="summaryExpanded && !collapsed" class="submenu-list">
              <li>
                <router-link to="/summary/overview" class="submenu-item" :class="{ active: isActive('/summary/overview') }">
                  <el-icon :size="16"><Histogram /></el-icon>
                  <span>汇总看板</span>
                </router-link>
              </li>
              <li>
                <router-link to="/summary/business-analysis" class="submenu-item" :class="{ active: isActive('/summary/business-analysis') }">
                  <el-icon :size="16"><TrendCharts /></el-icon>
                  <span>经营分析</span>
                </router-link>
              </li>
              <li>
                <router-link to="/summary/batch-management" class="submenu-item" :class="{ active: isActive('/summary/batch-management') }">
                  <el-icon :size="16"><Collection /></el-icon>
                  <span>批次管理</span>
                </router-link>
              </li>
              <li>
                <router-link to="/summary/problems" class="submenu-item" :class="{ active: isActive('/summary/problems') }">
                  <el-icon :size="16"><WarnTriangleFilled /></el-icon>
                  <span>问题汇总</span>
                </router-link>
              </li>
              <li>
                <router-link to="/summary/indicators" class="submenu-item" :class="{ active: isActive('/summary/indicators') }">
                  <el-icon :size="16"><Odometer /></el-icon>
                  <span>指标看板</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- 审批管理 -->
        <li>
          <button
            class="menu-item menu-item-submenu"
            :class="{ active: isApprovalActive }"
            @click="toggleApproval"
          >
            <el-icon :size="20"><CircleCheck /></el-icon>
            <span v-if="!collapsed" class="menu-text">审批管理</span>
            <el-icon v-if="!collapsed" :size="16" class="submenu-arrow" :class="{ expanded: approvalExpanded }">
              <CaretRight />
            </el-icon>
          </button>
          <transition name="submenu">
            <ul v-if="approvalExpanded && !collapsed" class="submenu-list">
              <li>
                <router-link to="/material-approval" class="submenu-item" :class="{ active: isActive('/material-approval') }">
                  <el-icon :size="16"><Box /></el-icon>
                  <span>物料审批</span>
                </router-link>
              </li>
              <li>
                <router-link to="/production-approval" class="submenu-item" :class="{ active: isActive('/production-approval') }">
                  <el-icon :size="16"><Grape /></el-icon>
                  <span>生产审批</span>
                </router-link>
              </li>
              <li>
                <router-link to="/farm-approval" class="submenu-item" :class="{ active: isActive('/farm-approval') }">
                  <el-icon :size="16"><CircleCheck /></el-icon>
                  <span>农事审批</span>
                </router-link>
              </li>
              <li>
                <router-link to="/indicator-budget-approval" class="submenu-item" :class="{ active: isActive('/indicator-budget-approval') }">
                  <el-icon :size="16"><DataLine /></el-icon>
                  <span>指标预算审批</span>
                </router-link>
              </li>
              <li>
                <router-link to="/hr-approval" class="submenu-item" :class="{ active: isActive('/hr-approval') }">
                  <el-icon :size="16"><User /></el-icon>
                  <span>人事审批</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  CaretLeft,
  CaretRight,
  MapLocation,
  DataAnalysis,
  Aim,
  Bell,
  Memo,
  Document,
  DocumentChecked,
  ShoppingCart,
  Grape,
  Cherry,
  CircleCheck,
  Box,
  List,
  Calendar,
  Folder,
  TakeawayBox,
  OfficeBuilding,
  Van,
  Switch,
  User,
  UserFilled,
  Money,
  TrendCharts,
  Histogram,
  Collection,
  WarnTriangleFilled,
  Odometer,
  Setting,
  Tools,
  Notebook,
  House,
  Grid,
  Lock,
  Guide,
  Goods,
  Coin,
  Monitor,
  VideoCamera,
  Connection,
  Download,
  Lightning,
  Warning
} from '@element-plus/icons-vue'

const props = defineProps({ collapsed: false })

const emit = defineEmits(['update:collapsed', 'menu-select'])

const route = useRoute()

// 各分组高亮判断（与V1.1逻辑一致：检查任意子菜单项是否激活）
const isProductionActive = computed(() => {
  return ['/crop/order', '/production', '/tech-solution', '/purchase-plan'].some(p => route.path.startsWith(p))
})

const isCropActive = computed(() => {
  return ['/crop/seed-source', '/crop/seedling', '/crop/planting', '/crop/harvest', '/crop/fertilizer', '/crop-inventory', '/crop/instance'].some(p => route.path.startsWith(p))
})

const isFarmActive = computed(() => {
  return ['/farm-hub', '/task-center', '/schedule', '/team', '/daily-work-summary'].some(p => route.path.startsWith(p))
})

const isInventoryActive = computed(() => {
  return ['/warehouse-overview', '/warehouse-inbound', '/supplier-management', '/material-receiving', '/material-return'].some(p => route.path.startsWith(p))
})

const isLaborActive = computed(() => {
  return ['/labor/attendance', '/labor/personnel', '/labor/compensation', '/labor/analytics'].some(p => route.path.startsWith(p))
})

const isSummaryActive = computed(() => {
  return ['/summary/overview', '/summary/business-analysis', '/summary/batch-management', '/summary/problems', '/summary/indicators'].some(p => route.path.startsWith(p))
})

const isApprovalActive = computed(() => {
  return ['/material-approval', '/production-approval', '/farm-approval', '/indicator-budget-approval', '/hr-approval'].some(p => route.path.startsWith(p))
})

// 子菜单展开状态
const productionExpanded = ref(true)
const cropExpanded = ref(true)
const farmExpanded = ref(true)
const inventoryExpanded = ref(true)
const laborExpanded = ref(true)
const summaryExpanded = ref(true)
const approvalExpanded = ref(true)
const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
}

const toggleProduction = () => {
  productionExpanded.value = !productionExpanded.value
}

const toggleCrop = () => {
  cropExpanded.value = !cropExpanded.value
}

const toggleFarm = () => {
  farmExpanded.value = !farmExpanded.value
}

const toggleInventory = () => {
  inventoryExpanded.value = !inventoryExpanded.value
}

const toggleLabor = () => {
  laborExpanded.value = !laborExpanded.value
}

const toggleSummary = () => {
  summaryExpanded.value = !summaryExpanded.value
}

const toggleApproval = () => {
  approvalExpanded.value = !approvalExpanded.value
}

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 48px;
  left: 0;
  z-index: 40;
  width: 208px;
  height: calc(100vh - 48px);
  background: var(--sidebar-bg);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-collapsed {
  width: 64px;
}

.sidebar-header {
  height: 48px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #059669;
  font-weight: bold;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #f3f4f6;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: #1f2937;
  text-decoration: none;
  border-radius: 8px;
  margin: 0 8px;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  background: transparent;
  width: calc(100% - 16px);
  text-align: left;
  font-size: 14px;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
}

.menu-item-submenu {
  justify-content: flex-start;
}

.menu-text {
  flex: 1;
  white-space: nowrap;
}

.submenu-arrow {
  transition: transform 0.2s;
  color: #9ca3af;
}

.submenu-arrow.expanded {
  transform: rotate(90deg);
}

.submenu-list {
  list-style: none;
  margin: 4px 0 0 0;
  padding: 0 0 0 20px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #1f2937;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.submenu-item:hover {
  background: #f3f4f6;
}

.submenu-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
}

.submenu-item .el-icon {
  color: #9ca3af;
}

.submenu-item.active .el-icon {
  color: var(--sidebar-active-text);
}

/* 子菜单组标题 */
.submenu-group-title {
  padding: 12px 12px 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.submenu-group-title span {
  display: block;
}

/* 子菜单动画 */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* 折叠状态下的样式 */
.sidebar-collapsed .menu-item {
  justify-content: center;
  padding: 10px;
  width: 48px;
  margin: 0 auto;
}

.sidebar-collapsed .collapse-btn {
  position: absolute;
  right: 8px;
}
</style>