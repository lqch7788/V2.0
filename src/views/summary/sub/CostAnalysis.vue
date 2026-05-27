<template>
  <!-- 成本分析子页面-->
  <div class="space-y-6">
    <!-- 页面标题 -->
    <PageHeader
      title="成本分析"
      description="种植成本明细、分类占比与亩均成本趋势"
    >
      <template #icon>
        <el-icon :size="24" color="white"><Money /></el-icon>
      </template>
    </PageHeader>

    <!-- 日期筛选器 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <SummaryDateFilter
        :mode="filterMode"
        @update:mode="handleModeChange"
        :start-date="startDate"
        :end-date="endDate"
        @date-change="handleDateChange"
      />
      <div v-if="isLoading" class="flex items-center gap-2 text-sm text-gray-400 mt-2">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
    </div>

    <!-- 错误状态-->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
      <el-icon :size="20"><WarningFilled /></el-icon>
      <span class="text-sm">数据加载失败：{{ error }}</span>
    </div>

    <!-- KPI 指标卡片 -->
    <KpiCardGrid :columns="4" compact>
      <KpiCard
        :icon="DollarSignIcon"
        label="总成本"
        :value="costSummary ? formatMoney(costSummary.totalCost) : '--'"
        colorScheme="amber"
        compact
      />
      <KpiCard
        :icon="UsersIcon"
        label="人工成本"
        :value="costSummary ? formatMoney(costSummary.totalLaborCost) : '--'"
        colorScheme="blue"
        compact
      />
      <KpiCard
        :icon="BoxIcon"
        label="物料成本"
        :value="costSummary ? formatMoney(costSummary.totalMaterialCost) : '--'"
        colorScheme="amber"
        compact
      />
      <KpiCard
        :icon="TrendUpIcon"
        label="总工时"
        :value="costSummary ? `${costSummary.totalWorkHours.toFixed(1)}h` : '--'"
        colorScheme="amber"
        compact
      />
    </KpiCardGrid>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 成本结构饼图 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-900 mb-1">成本结构分布</h3>
        <p class="text-xs text-gray-400 mb-4">人工 / 物料 / 能源占比</p>
        <div v-if="pieData.length === 0" class="h-[300px] flex items-center justify-center text-gray-400">
          <div class="text-center">
            <el-icon :size="32"><Histogram /></el-icon>
            <p class="text-sm mt-2">暂无成本数据</p>
          </div>
        </div>
        <div v-else class="h-[300px] relative">
          <div ref="pieChartRef" class="w-full h-full"></div>
          <!-- 中心文字 -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-xs text-gray-400">总成本</p>
            <p class="text-xl font-bold text-gray-800">{{ formatMoney(totalCost) }}</p>
          </div>
        </div>
        <!-- 图例 -->
        <div v-if="pieData.length > 0" class="flex justify-center gap-6 mt-2">
          <div v-for="item in pieData" :key="item.category" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: COST_COLORS[item.category] }" />
            <span class="text-xs text-gray-600">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 成本趋势面积图-->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-900 mb-1">成本趋势变化</h3>
        <p class="text-xs text-gray-400 mb-4">按月统计，三类成本堆叠展示</p>
        <div v-if="stackedData.length === 0" class="h-[300px] flex items-center justify-center text-gray-400">
          <div class="text-center">
            <el-icon :size="32"><Histogram /></el-icon>
            <p class="text-sm mt-2">暂无趋势数据</p>
          </div>
        </div>
        <div v-else class="h-[300px]">
          <div ref="trendChartRef" class="w-full h-full"></div>
        </div>
      </div>
    </div>

    <!-- 成本明细表-->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 表头 -->
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">成本明细表</h3>
        <p class="text-xs text-gray-400 mt-1">按成本类型分组展示，点击展开/收起</p>
      </div>

      <div class="divide-y divide-gray-100">
        <div v-for="meta in categoryMeta" :key="meta.key">
          <!-- 分组标题-->
          <button
            @click="toggleExpand(meta.key)"
            class="w-full flex items-center justify-between px-6 py-3 hover:opacity-90 transition-opacity"
            :class="meta.bgClass"
          >
            <div class="flex items-center gap-3">
              <span :class="{ 'rotate-90': expanded[meta.key] }" class="transition-transform">
                <el-icon :size="16" color="#6b7280"><DArrowRight /></el-icon>
              </span>
              <span class="font-medium text-sm" :class="meta.textClass">{{ meta.label }}</span>
              <span class="text-xs opacity-60" :class="meta.textClass">
                ({{ getGroupedItems(meta.key).length }} 条记录)
              </span>
            </div>
            <span class="font-semibold text-sm" :class="meta.textClass">
              {{ formatMoney(getCategoryTotal(meta.key)) }}
            </span>
          </button>

          <!-- 明细行-->
          <div v-if="expanded[meta.key]" class="overflow-x-auto">
            <el-table :data="getGroupedItems(meta.key)" style="width: 100%">
              <el-table-column prop="costName" label="成本类型" min-width="120" />
              <el-table-column prop="month" label="月份" min-width="100" />
              <el-table-column label="金额" min-width="120" align="right">
                <template #default="{ row }">
                  <span class="font-medium">{{ formatMoney(Number(row.totalAmount) || 0) }}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="meta.key === 'labor'" label="工时(h)" min-width="100" align="right">
                <template #default="{ row }">
                  {{ row.workHours != null ? Number(row.workHours).toFixed(1) : '-' }}
                </template>
              </el-table-column>
              <el-table-column v-if="meta.key === 'labor'" label="人数" min-width="80" align="right">
                <template #default="{ row }">
                  {{ row.workerCount ?? '-' }}
                </template>
              </el-table-column>
              <el-table-column label="记录数" min-width="80" align="right">
                <template #default="{ row }">
                  {{ row.recordCount ?? '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 汇总行 -->
      <div v-if="costSummary" class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-x-8 gap-y-1">
        <span class="text-sm text-gray-500">
          合计: <span class="font-bold text-gray-900">{{ formatMoney(costSummary.totalCost) }}</span>
        </span>
        <span class="text-xs text-gray-400">
          人工{{ formatMoney(costSummary.totalLaborCost) }} / 物料{{ formatMoney(costSummary.totalMaterialCost) }} / 能源{{ formatMoney(costSummary.totalEnergyCost) }}
        </span>
        <span class="text-xs text-gray-400">
          总工时{{ costSummary.totalWorkHours.toFixed(1) }}h / 均时{{ formatMoney(costSummary.avgHourlyRate) }}/h
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue'
import * as echarts from 'echarts'
import { Money, User, Box, TrendCharts, Loading, WarningFilled, Histogram, DArrowRight } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'
import { PageHeader, KpiCard, KpiCardGrid, SummaryDateFilter } from '@/components/summary'

/** 表格表头蓝色渐变样式（与V1.1一致） */

// ========== Props ==========
const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false
  }
})

// ========== Store ==========
const summaryStore = useSummaryStore()

// ========== 图标组件（用于KpiCard）=========
const DollarSignIcon = { render: () => h(Money, { size: 16, color: 'white' }) }
const UsersIcon = { render: () => h(User, { size: 16, color: 'white' }) }
const BoxIcon = { render: () => h(Box, { size: 16, color: 'white' }) }
const TrendUpIcon = { render: () => h(TrendCharts, { size: 16, color: 'white' }) }

// ========== 图表颜色常量 ==========
const COST_COLORS = {
  labor: '#3b82f6',    // 蓝色 - 人工
  material: '#f59e0b',  // 琥珀色 - 物料
  energy: '#64748b',    // 石板色 - 能源
}

const COST_LABELS = {
  labor: '人工成本',
  material: '物料成本',
  energy: '能源成本',
}

// ========== 计算属性==========
const costDetailItems = computed(() => summaryStore.costDetailItems || [])
const costSummary = computed(() => summaryStore.costSummary)
const isLoading = computed(() => summaryStore.isLoading)
const error = computed(() => summaryStore.error)

// ========== 图表 Refs ==========
const pieChartRef = ref()
const trendChartRef = ref()
let pieChart = null
let trendChart = null

// ========== 筛选状态==========
const filterMode = ref('year')
const startDate = ref('')
const endDate = ref('')

// ========== 展开/收起状态==========
const expanded = ref({
  labor: true,
  material: true,
  energy: true,
})

// ========== 工具函数 ==========
function formatMoney(v) {
  if (v == null) return '--'
  return `¥${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function toggleExpand(key) {
  expanded.value[key] = !expanded.value[key]
}

// ========== 饼图数据构建 ==========
const pieData = computed(() => {
  const map = { labor: 0, material: 0, energy: 0 }
  for (const item of costDetailItems.value) {
    map[item.costCategory] = (map[item.costCategory] || 0) + (Number(item.totalAmount) || 0)
  }
  return [
    { name: '人工成本', value: Math.round(map.labor * 100) / 100, category: 'labor' },
    { name: '物料成本', value: Math.round(map.material * 100) / 100, category: 'material' },
    { name: '能源成本', value: Math.round(map.energy * 100) / 100, category: 'energy' },
  ].filter(d => d.value > 0)
})

const totalCost = computed(() => pieData.value.reduce((s, d) => s + d.value, 0))

// ========== 堆叠面积图数据构建==========
const stackedData = computed(() => {
  const monthMap = {}
  for (const item of costDetailItems.value) {
    const m = item.month || '未知'
    if (!monthMap[m]) {
      monthMap[m] = { month: m, labor: 0, material: 0, energy: 0 }
    }
    monthMap[m][item.costCategory] += Number(item.totalAmount) || 0
  }
  return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month))
})

// ========== 分组数据 ==========
const categoryMeta = [
  { key: 'labor', label: '人工成本', bgClass: 'bg-blue-50', textClass: 'text-blue-700' },
  { key: 'material', label: '物料成本', bgClass: 'bg-amber-50', textClass: 'text-amber-700' },
  { key: 'energy', label: '能源成本', bgClass: 'bg-slate-50', textClass: 'text-slate-700' },
]

function getGroupedItems(category) {
  return costDetailItems.value.filter(item => item.costCategory === category)
}

function getCategoryTotal(category) {
  return getGroupedItems(category).reduce((s, item) => s + (Number(item.totalAmount) || 0), 0)
}

// ========== 饼图配置 ==========
function getPieOption() {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.08)',
      formatter: (params) => `${params.name}<br/><strong>${formatMoney(params.value)}</strong> (${params.percent}%)`
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      paddingAngle: 3,
      data: pieData.value.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: COST_COLORS[d.category] }
      })),
      label: { show: false },
    }]
  }
}

// ========== 趋势图配置 ==========
function getTrendOption() {
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.08)',
      formatter: (params) => {
        let result = `${params[0].name}<br/>`
        params.forEach(p => {
          result += `<strong>${COST_LABELS[p.seriesName] || p.seriesName}:</strong> ${formatMoney(p.value)}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['labor', 'material', 'energy'],
      formatter: (name) => COST_LABELS[name] || name,
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: stackedData.value.map(d => d.month),
      axisLabel: { fontSize: 12, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 12, color: '#9ca3af', formatter: (v) => `¥${(v / 1000).toFixed(0)}k` },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        name: 'labor',
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: COST_COLORS.labor + '50' },
            { offset: 1, color: COST_COLORS.labor + '10' }
          ])
        },
        lineStyle: { width: 2, color: COST_COLORS.labor },
        data: stackedData.value.map(d => d.labor),
        smooth: true,
      },
      {
        name: 'material',
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: COST_COLORS.material + '50' },
            { offset: 1, color: COST_COLORS.material + '10' }
          ])
        },
        lineStyle: { width: 2, color: COST_COLORS.material },
        data: stackedData.value.map(d => d.material),
        smooth: true,
      },
      {
        name: 'energy',
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: COST_COLORS.energy + '30' },
            { offset: 1, color: COST_COLORS.energy + '05' }
          ])
        },
        lineStyle: { width: 2, color: COST_COLORS.energy },
        data: stackedData.value.map(d => d.energy),
        smooth: true,
      },
    ]
  }
}

// ========== 初始化图表==========
function initCharts() {
  // 饼图
  if (pieChartRef.value) {
    if (pieChart) pieChart.dispose()
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption(getPieOption())
  }

  // 趋势图初始化
  if (trendChartRef.value) {
    if (trendChart) trendChart.dispose()
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption(getTrendOption())
  }
}

// ========== 日期筛选处理 ==========
function handleModeChange(mode) {
  filterMode.value = mode
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  switch (mode) {
    case 'month': {
      const firstDay = `${year}-${month}-01`
      const lastDay = `${year}-${month}-${new Date(year, now.getMonth() + 1, 0).getDate()}`
      startDate.value = firstDay
      endDate.value = lastDay
      summaryStore.fetchCostStats({ start_date: firstDay, end_date: lastDay })
      break
    }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3)
      const qStart = `${year}-${String(q * 3 + 1).padStart(2, '0')}-01`
      const qEndMonth = q * 3 + 3
      const qEnd = `${year}-${String(qEndMonth).padStart(2, '0')}-${new Date(year, qEndMonth, 0).getDate()}`
      startDate.value = qStart
      endDate.value = qEnd
      summaryStore.fetchCostStats({ start_date: qStart, end_date: qEnd })
      break
    }
    case 'year': {
      startDate.value = `${year}-01-01`
      endDate.value = `${year}-12-31`
      summaryStore.fetchCostStats({})
      break
    }
    case 'custom':
      // 不自动请求，等用户选完日期
      break
  }
}

function handleDateChange(start, end) {
  startDate.value = start
  endDate.value = end
  summaryStore.fetchCostStats({ start_date: start || undefined, end_date: end || undefined })
}

// ========== 监听数据变化重绘图表 ==========
watch([pieData, stackedData], () => {
  nextTick(() => initCharts())
}, { deep: true })

// ========== 生命周期 ==========
onMounted(() => {
  // 初始化为年度数据
  handleModeChange('year')
})

onUnmounted(() => {
  if (pieChart) pieChart.dispose()
  if (trendChart) trendChart.dispose()
})

// ========== 窗口resize处理 ==========
const handleResize = () => {
  if (pieChart) pieChart.resize()
  if (trendChart) trendChart.resize()
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>