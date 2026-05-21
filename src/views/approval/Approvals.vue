<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">审批中心</h1>
          <p class="text-gray-500 mt-1">审批管理统一入口</p>
        </div>
        <el-button type="primary" @click="router.push('/my-applications')">
          <el-icon><Document /></el-icon>
          我的申请
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <el-icon :size="20" class="text-yellow-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">待审批</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">已通过</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" class="text-red-600"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">已拒绝</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <el-icon :size="20" class="text-purple-600"><Grid /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">全部</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="space-y-4">
      <div v-for="group in quickEntries" :key="group.group" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
          <div :class="`w-8 h-8 rounded-lg ${colorMap[group.color].bg} flex items-center justify-center`">
            <el-icon :size="16" :class="colorMap[group.color].icon">
              <component :is="group.icon" />
            </el-icon>
          </div>
          <h2 class="font-semibold text-gray-900">{{ group.group }}</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          <div
            v-for="entry in group.entries"
            :key="entry.path + entry.label"
            @click="router.push(entry.path)"
            :class="`flex flex-col gap-1 p-3 rounded-lg border ${colorMap[group.color].border} ${colorMap[group.color].bg} ${colorMap[group.color].hover} transition-colors cursor-pointer group`"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900 text-sm">{{ entry.label }}</span>
              <el-icon :size="16" class="text-gray-400 group-hover:text-gray-600"><Right /></el-icon>
            </div>
            <p class="text-xs text-gray-500">{{ entry.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  Clock,
  CircleCheck,
  Warning,
  Grid,
  Right,
  DocumentCopy,
  ShoppingCart,
  RefreshRight,
  OfficeBuilding,
  User,
  Crop,
  TrendCharts,
  Refresh,
  Plus,
  Coin,
  Files,
  Tools,
  CircleCheckFilled,
  Bell,
  Aim,
} from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 统计数据
const stats = reactive({
  pending,
  approved,
  rejected,
  total,
})

// 快捷入口配置
const quickEntries = [
  {
    group: '业务审批',
    icon,
    color: 'blue',
    entries: [
      { label: '领料审批', path: '/material-approval', desc: '物资/领料申请审批' },
      { label: '退料审批', path: '/material-approval?tab=return', desc: '退料单审批' },
      { label: '采购审批', path: '/material-approval?tab=purchase', desc: '采购申请审批' },
      { label: '物料入库', path: '/business-approval?type=material_inbound', desc: '物料入库审批' },
      { label: '库存调拨', path: '/business-approval?type=material_transfer', desc: '库存调拨审批' },
      { label: '订单创建', path: '/business-approval?type=order_create', desc: '订单创建审批' },
      { label: '订单变更', path: '/business-approval?type=order_change', desc: '订单变更审批' },
    ],
  },
  {
    group: '生产审批',
    icon,
    color: 'emerald',
    entries: [
      { label: '技术方案', path: '/production-approval?tab=tech', desc: '技术方案审批' },
      { label: '生产计划', path: '/production-approval?tab=plan', desc: '生产计划审批' },
      { label: '采收申请', path: '/production-approval?tab=harvest', desc: '采收申请审批' },
    ],
  },
  {
    group: '农事审批',
    icon,
    color: 'green',
    entries: [
      { label: '任务派发', path: '/farm-approval?tab=task_dispatch', desc: '农事任务派发审批' },
      { label: '任务变更', path: '/farm-approval?tab=task_change', desc: '任务变更审批' },
      { label: '巡查问题', path: '/farm-approval?tab=inspection', desc: '巡查问题审批' },
      { label: '问题整改', path: '/farm-approval?tab=resolve', desc: '问题整改审批' },
    ],
  },
  {
    group: '指标/预算审批',
    icon,
    color: 'purple',
    entries: [
      { label: '指标发布', path: '/indicator-budget-approval?tab=indicator', desc: '指标发布审批' },
      { label: '指标调整', path: '/indicator-budget-approval?tab=indicator_adjust', desc: '指标调整审批' },
      { label: '预算编制', path: '/indicator-budget-approval?tab=budget_create', desc: '预算编制审批' },
      { label: '预算调整', path: '/indicator-budget-approval?tab=budget_adjust', desc: '预算调整审批' },
    ],
  },
  {
    group: 'HR审批',
    icon,
    color: 'orange',
    entries: [
      { label: 'HR审批中心', path: '/hr-approval', desc: '请假/加班/离职等HR审批' },
    ],
  },
]

// 颜色映射
const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', hover: 'hover:bg-blue-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', hover: 'hover:bg-emerald-100' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', hover: 'hover:bg-green-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', hover: 'hover:bg-purple-100' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', hover: 'hover:bg-orange-100' },
}
</script>
