<template>
  <!-- 问题汇总页面 - 种植过程异常与问题统计 -->
  <div class="space-y-6 bg-[#F2F6FA] p-6">
    <!-- 页面标题 -->
    <PageHeader
      title="问题汇总"
      description="种植过程异常记录、分类统计与处理跟踪"
    >
      <template #icon>
        <el-icon :size="24" color="white"><Warning /></el-icon>
      </template>
    </PageHeader>

    <!-- 日期筛选 + 统计概览 -->
    <div class="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <SummaryDateFilter
        v-model:mode="filterMode"
        v-model:startDate="startDate"
        v-model:endDate="endDate"
        @change="handleDateChange"
      />
      <div class="text-sm text-gray-500">
        共 <span class="font-semibold text-gray-700">{{ problemItems.length }}</span> 条日汇总记录
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading && problemItems.length === 0" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span class="text-gray-500">加载问题数据中...</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!isLoading && problemItems.length === 0" class="bg-white rounded-xl p-12 text-center">
      <el-icon :size="64" color="#d1d5db"><Warning /></el-icon>
      <p class="text-gray-500 text-lg mt-4">暂无问题数据</p>
      <el-button class="mt-4 !bg-red-500 !text-white hover:!bg-red-600" @click="loadData">重新加载</el-button>
    </div>

    <!-- 内容区域 -->
    <template v-else>
      <!-- KPI 指标卡片（5列） -->
      <KpiCardGrid :columns="5" compact>
        <KpiCard
          :icon="TrendCharts"
          label="总问题数"
          :value="kpiData.total"
          colorScheme="slate"
          compact
        />
        <KpiCard
          :icon="WarningFilled"
          label="待处理"
          :value="kpiData.pending"
          colorScheme="red"
          compact
        />
        <KpiCard
          :icon="Clock"
          label="处理中"
          :value="kpiData.inProgress"
          colorScheme="amber"
          compact
        />
        <KpiCard
          :icon="CircleCheckFilled"
          label="已处理"
          :value="kpiData.resolved"
          colorScheme="emerald"
          :trend="overallResolutionRate"
          compact
        />
        <KpiCard
          :icon="Warning"
          label="高优先级"
          :value="kpiData.highPriority"
          colorScheme="red"
          compact
        />
      </KpiCardGrid>

      <!-- 图表行：趋势图 + 优先级饼图 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 问题趋势图（柱状+折线组合图） -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">问题趋势图</h3>
          <div v-if="trendData.length === 0" class="h-80 flex items-center justify-center text-gray-400">
            暂无趋势数据
          </div>
          <div v-else ref="trendChartRef" class="h-80"></div>
        </div>

        <!-- 优先级分布饼图 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">优先级分布</h3>
          <div v-if="priorityPieData.length === 0" class="h-80 flex items-center justify-center text-gray-400">
            暂无分类数据
          </div>
          <div v-else ref="priorityChartRef" class="h-80"></div>
        </div>
      </div>

      <!-- 底部行：月度分布 + 高优先级预警 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 月度问题分布（横向柱状图） -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">月度问题分布</h3>
          <div v-if="monthlyData.length === 0" class="h-80 flex items-center justify-center text-gray-400">
            暂无月度数据
          </div>
          <div v-else ref="monthlyChartRef" class="h-80"></div>
        </div>

        <!-- 高优先级问题预警 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">
            高优先级问题预警
            <span v-if="highPriorityAlerts.length > 0" class="ml-2 text-sm font-normal text-gray-400">
              ({{ highPriorityAlerts.length }})
            </span>
          </h3>
          <div v-if="highPriorityAlerts.length === 0" class="h-80 flex items-center justify-center text-gray-400">
            暂无高优先级问题预警
          </div>
          <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <AlertCard
              v-for="(alert, index) in highPriorityAlerts"
              :key="index"
              :title="alert.title"
              :description="alert.description"
              :severity="alert.severity"
            />
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        数据加载异常：{{ error }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { Warning, DataAnalysis, Clock, CircleCheckFilled, TrendCharts, WarningFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { PageHeader, KpiCard, KpiCardGrid, AlertCard, SummaryDateFilter } from '@/components/summary'
import { useSummaryStore } from '@/stores/modules/summary'

// ========== 颜色常量 ==========
const COLORS = {
  red: '#ef4444',
  amber: '#f59e0b',
  emerald: '#10b981',
  slate: '#64748b',
  blue: '#3b82f6',
}

const summaryStore = useSummaryStore()

// ========== Refs ==========
const trendChartRef = ref(null)
const priorityChartRef = ref(null)
const monthlyChartRef = ref(null)
let trendChart = null
let priorityChart = null
let monthlyChart = null

// ========== 日期筛选状态 ==========
const filterMode = ref('year')
const startDate = ref('')
const endDate = ref('')

const problemItems = computed(() => summaryStore.problemItems)
const isLoading = computed(() => summaryStore.isLoading)
const error = computed(() => summaryStore.error)

// ========== KPI 汇总指标 ==========
const kpiData = computed(() => {
  if (!problemItems.value.length) {
    return { total: 0, pending: 0, inProgress: 0, resolved: 0, highPriority: 0 }
  }
  return {
    total: problemItems.value.reduce((s, i) => s + i.total, 0),
    pending: problemItems.value.reduce((s, i) => s + i.pending, 0),
    inProgress: problemItems.value.reduce((s, i) => s + i.inProgress, 0),
    resolved: problemItems.value.reduce((s, i) => s + i.resolved, 0),
    highPriority: problemItems.value.reduce((s, i) => s + i.highPriority, 0),
  }
})

// ========== 总体解决率 ==========
const overallResolutionRate = computed(() => {
  return kpiData.value.total > 0
    ? Math.round((kpiData.value.resolved / kpiData.value.total) * 100)
    : 0
})

// ========== 趋势图数据 ==========
const trendData = computed(() => {
  return problemItems.value
    .map((item) => ({
      date: item.date?.substring(5) || item.date,
      fullDate: item.date,
      total: item.total,
      resolved: item.resolved,
      resolutionRate: item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0,
    }))
    .sort((a, b) => (a.fullDate || '').localeCompare(b.fullDate || ''))
})

// ========== 优先级分布饼图数据 ==========
const priorityPieData = computed(() => {
  const highTotal = problemItems.value.reduce((s, i) => s + i.highPriority, 0)
  const mediumTotal = problemItems.value.reduce((s, i) => s + i.mediumPriority, 0)
  const lowTotal = problemItems.value.reduce((s, i) => s + i.lowPriority, 0)
  return [
    { name: '高优先级', value: highTotal, color: COLORS.red },
    { name: '中优先级', value: mediumTotal, color: COLORS.amber },
    { name: '低优先级', value: lowTotal, color: COLORS.slate },
  ].filter((d) => d.value > 0)
})

// ========== 月度问题分布数据 ==========
const monthlyData = computed(() => {
  const groups = {}
  problemItems.value.forEach((item) => {
    const m = item.month || item.date?.substring(0, 7) || '未知'
    if (!groups[m]) {
      groups[m] = { month: m, '问题总数': 0, '已处理': 0 }
    }
    groups[m]['问题总数'] += item.total
    groups[m]['已处理'] += item.resolved
  })
  return Object.values(groups)
    .sort((a, b) => a.month.localeCompare(b.month))
})

// ========== 高优先级预警 ==========
const highPriorityAlerts = computed(() => {
  return problemItems.value
    .filter((item) => item.highPriority > 0)
    .sort((a, b) => b.highPriority - a.highPriority)
    .slice(0, 8)
    .map((item) => ({
      title: `${item.date} - ${item.highPriority}个高优先级问题`,
      description: `共${item.total}个问题，待处理${item.pending}，处理中${item.inProgress}，已处理${item.resolved}`,
      severity: item.highPriority >= 3 ? 'critical' : 'warning',
    }))
})

// ========== 计算日期范围 ==========
function getDateRange(mode) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  switch (mode) {
    case 'month': {
      const lastDay = new Date(year, month, 0).getDate()
      return {
        start: `${year}-${String(month).padStart(2, '0')}-01`,
        end: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
      }
    }
    case 'quarter': {
      const q = Math.floor((month - 1) / 3)
      const qStartMonth = q * 3 + 1
      const qEndMonth = q * 3 + 3
      const lastDay = new Date(year, qEndMonth, 0).getDate()
      return {
        start: `${year}-${String(qStartMonth).padStart(2, '0')}-01`,
        end: `${year}-${String(qEndMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
      }
    }
    case 'year':
    default:
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      }
  }
}

// ========== 加载数据 ==========
const loadData = () => {
  summaryStore.fetchProblems({ start_date: startDate.value, end_date: endDate.value })
}

// ========== 日期变更处理 ==========
const handleDateChange = (mode, start, end) => {
  // 同步所有状态，确保不会因 watch 重复获取数据
  if (mode !== undefined) filterMode.value = mode
  if (start !== undefined) startDate.value = start
  if (end !== undefined) endDate.value = end
  loadData()
}

// ========== 初始化 ==========
onMounted(() => {
  const range = getDateRange('year')
  startDate.value = range.start
  endDate.value = range.end
  loadData()
})

// ========== 初始化图表 ==========
const initTrendChart = () => {
  if (!trendChartRef.value || trendData.value.length === 0) return

  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      textStyle: { fontSize: 12 },
    },
    legend: {
      data: ['问题总数', '已处理', '解决率(%)'],
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map((d) => d.date),
      axisLabel: { fontSize: 11, color: '#9ca3af', interval: 0 },
      axisLine: { lineStyle: { color: '#9ca3af' } },
    },
    yAxis: [
      {
        type: 'value',
        name: '问题数',
        axisLabel: { fontSize: 11, color: '#9ca3af', allowDecimals: false },
        axisLine: { lineStyle: { color: '#9ca3af' } },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed', width: 1 } },
        splitNumber: 5,
      },
      {
        type: 'value',
        name: '解决率(%)',
        min: 0,
        max: 100,
        axisLabel: { fontSize: 11, color: '#9ca3af', formatter: '{value}%' },
        axisLine: { lineStyle: { color: '#9ca3af' } },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '问题总数',
        type: 'bar',
        yAxisIndex: 0,
        data: trendData.value.map((d) => d.total),
        itemStyle: { color: COLORS.red, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '已处理',
        type: 'bar',
        yAxisIndex: 0,
        data: trendData.value.map((d) => d.resolved),
        itemStyle: { color: COLORS.emerald, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '解决率(%)',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.value.map((d) => d.resolutionRate),
        itemStyle: { color: COLORS.blue },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  }

  trendChart.setOption(option)
}

const initPriorityChart = () => {
  if (!priorityChartRef.value || priorityPieData.value.length === 0) return

  if (priorityChart) {
    priorityChart.dispose()
  }

  priorityChart = echarts.init(priorityChartRef.value)

  const total = priorityPieData.value.reduce((s, d) => s + d.value, 0)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      textStyle: { fontSize: 12 },
      formatter: '{b}: {c}个 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { fontSize: 12 },
    },
    graphic: [
      {
        type: 'text',
        left: '30%',
        top: 'middle',
        style: {
          text: String(total),
          textAlign: 'center',
          fill: '#374151',
          fontSize: 24,
          fontWeight: 'bold',
        },
      },
      {
        type: 'text',
        left: '30%',
        top: 'middle',
        top: 30,
        style: {
          text: '总计',
          textAlign: 'center',
          fill: '#9ca3af',
          fontSize: 12,
        },
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['55', '95'],
        center: ['35%', '50%'],
        paddingAngle: 3,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c}个 ({d}%)',
          color: '#374151',
          fontSize: 11,
        },
        labelLine: {
          lineStyle: { color: '#9ca3af', width: 1 },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: priorityPieData.value,
      },
    ],
  }

  // 为每个扇区设置颜色
  option.series[0].data = priorityPieData.value.map((d) => ({
    ...d,
    itemStyle: { color: d.color },
  }))

  priorityChart.setOption(option)
}

const initMonthlyChart = () => {
  if (!monthlyChartRef.value || monthlyData.value.length === 0) return

  if (monthlyChart) {
    monthlyChart.dispose()
  }

  monthlyChart = echarts.init(monthlyChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      textStyle: { fontSize: 12 },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['问题总数', '已处理'],
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      allowDecimals: false,
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#9ca3af' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: monthlyData.value.map((d) => d.month),
      axisLabel: { fontSize: 11, color: '#9ca3af', width: 60 },
      axisLine: { lineStyle: { color: '#9ca3af' } },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed', width: 1 } },
    },
    series: [
      {
        name: '问题总数',
        type: 'bar',
        data: monthlyData.value.map((d) => d['问题总数']),
        itemStyle: { color: COLORS.red, borderRadius: [0, 4, 4, 0] },
        barSize: 20,
      },
      {
        name: '已处理',
        type: 'bar',
        data: monthlyData.value.map((d) => d['已处理']),
        itemStyle: { color: COLORS.emerald, borderRadius: [0, 4, 4, 0] },
        barSize: 20,
      },
    ],
  }

  monthlyChart.setOption(option)
}

// 监听数据变化更新图表
watch(
  [trendData, priorityPieData, monthlyData],
  () => {
    setTimeout(() => {
      initTrendChart()
      initPriorityChart()
      initMonthlyChart()
    }, 100)
  },
  { deep: true }
)

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  trendChart?.resize()
  priorityChart?.resize()
  monthlyChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  priorityChart?.dispose()
  monthlyChart?.dispose()
})
</script>
