<template>
  <!-- 人工分析子页面 - 完整功能版 -->
  <div class="space-y-4">
    <!-- 筛选栏：日期筛选 + 分组切换 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 日期筛选器 -->
        <SummaryDateFilter
          v-model:mode="filterMode"
          v-model:startDate="startDate"
          v-model:endDate="endDate"
          @change="handleDateChange"
        />

        <!-- 分隔线 -->
        <div class="w-px h-6 bg-gray-200 hidden sm:block" />

        <!-- 分组维度切换 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 mr-1">分组：</span>
          <div class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
            <el-button
              v-for="opt in GROUP_BY_OPTIONS"
              :key="opt.value"
              :type="groupBy === opt.value ? 'primary' : ''"
              :class="[
                '!border-none !rounded-md transition-colors',
                groupBy === opt.value ? '' : '!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100'
              ]"
              size="small"
              @click="handleGroupByChange(opt.value)"
            >
              <el-icon :size="14" class="mr-1">
                <component :is="opt.icon" />
              </el-icon>
              {{ opt.label }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center gap-2 text-sm text-gray-400">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
      <el-icon :size="20"><Warning /></el-icon>
      <span class="text-sm">数据加载失败：{{ error }}</span>
    </div>

    <!-- KPI 指标卡片 (4个) -->
    <KpiCardGrid :columns="4" compact>
      <KpiCard
        :icon="Clock"
        label="总工时"
        :value="formatHours(totalHours)"
        colorScheme="blue"
        compact
      />
      <KpiCard
        :icon="TrendCharts"
        label="日均工时"
        :value="`${avgDailyHours.toFixed(1)}h`"
        colorScheme="blue"
        compact
      />
      <KpiCard
        :icon="User"
        label="人均工时"
        :value="avgHoursPerWorker > 0 ? `${avgHoursPerWorker.toFixed(1)}h` : '--'"
        colorScheme="blue"
        compact
      />
      <KpiCard
        :icon="Money"
        label="平均时薪"
        :value="avgHourlyRate > 0 ? `${formatMoney(avgHourlyRate)}/h` : '--'"
        colorScheme="amber"
        compact
      />
    </KpiCardGrid>

    <!-- 图表区域：工时趋势 + 分组对比 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 工时趋势折线图 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-semibold text-gray-900">工时趋势</h3>
          <span class="text-xs text-gray-400">工时(左轴) + 金额(右轴)</span>
        </div>
        <p class="text-xs text-gray-400 mb-4">按时序展示工时变化与金额趋势</p>
        <div class="h-[280px]">
          <div v-if="trendChartData.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
            <el-icon :size="40"><DataAnalysis /></el-icon>
            <span class="text-sm mt-2">暂无工时数据</span>
          </div>
          <div v-else ref="trendChartRef" class="w-full h-full"></div>
        </div>
      </div>

      <!-- 分组对比柱状图 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-semibold text-gray-900">分组对比</h3>
          <span class="text-xs text-gray-400">按{{ groupByLabel }}维度对比（前15条）</span>
        </div>
        <p class="text-xs text-gray-400 mb-4">工时排名前15的{{ groupByLabel }}分布</p>
        <div class="h-[280px]">
          <div v-if="barChartData.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
            <el-icon :size="40"><DataAnalysis /></el-icon>
            <span class="text-sm mt-2">暂无分组数据</span>
          </div>
          <div v-else ref="barChartRef" class="w-full h-full"></div>
        </div>
      </div>
    </div>

    <!-- 用工明细表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 表头 -->
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">用工明细表</h3>
        <p class="text-xs text-gray-400 mt-1">
          共 {{ sortedItems.length }} 条记录，总工时 {{ formatHours(totalHours) }}，总金额 {{ formatMoney(totalAmount) }}
        </p>
      </div>

      <!-- 表格 -->
      <div class="overflow-x-auto">
        <el-table :data="sortedItems" stripe style="width: 100%" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: '600' }">
          <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="font-medium text-gray-800">{{ row.name || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="hours" label="工时(h)" width="100" align="right">
            <template #default="{ row }">
              <span class="text-gray-900 tabular-nums">{{ Number(row.hours || 0).toFixed(1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">
              <span class="text-gray-900 tabular-nums">{{ formatMoney(Number(row.amount) || 0) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="workerCount" label="工人数" width="80" align="right">
            <template #default="{ row }">
              <span class="text-gray-500">{{ row.workerCount ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="workCount" label="出勤次数" width="100" align="right">
            <template #default="{ row }">
              <span class="text-gray-500">{{ row.workCount ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="taskCount" label="任务数" width="80" align="right">
            <template #default="{ row }">
              <span class="text-gray-500">{{ row.taskCount ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="avgDailyHours" label="日均工时" width="100" align="right">
            <template #default="{ row }">
              <span class="text-gray-500">{{ row.avgDailyHours != null ? `${Number(row.avgDailyHours).toFixed(1)}h` : '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 汇总行 -->
      <div class="px-6 py-3 bg-blue-50/50 border-t border-blue-100 flex flex-wrap items-center gap-x-6 gap-y-1">
        <span class="text-sm text-gray-600">
          总工时：<span class="font-bold text-blue-700">{{ formatHours(totalHours) }}</span>
        </span>
        <span class="text-sm text-gray-600">
          总金额：<span class="font-bold text-blue-700">{{ formatMoney(totalAmount) }}</span>
        </span>
        <span class="text-xs text-gray-400">
          总工人 {{ totalWorkers }} / 总出勤 {{ totalWorkCounts }} / 总任务 {{ totalTasks }}
        </span>
        <span class="text-xs text-gray-400">
          均时薪 {{ totalHours > 0 ? formatMoney(totalAmount / totalHours) : '--' }}/h
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Loading, Warning, Clock, TrendCharts, User, Money, DataAnalysis, Calendar, Key } from '@element-plus/icons-vue'
import { KpiCard, KpiCardGrid, SummaryDateFilter } from '@/components/summary'
import { useSummaryStore } from '@/stores/modules/summary'

// ========== Props ==========
defineProps({
  hideHeader: {
    type: Boolean,
    default: false
  }
})

// ========== 常量 ==========

/** 分组维度选项 */
const GROUP_BY_OPTIONS = [
  { value: 'month', label: '月', icon: Calendar },
  { value: 'worker', label: '工人', icon: User },
  { value: 'greenhouse', label: '温室', icon: Key },
  { value: 'task', label: '任务', icon: DataAnalysis },
]

/** 蓝色渐变色阶（用于柱状图） */
const BLUE_GRADIENT = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']

// ========== Store ==========
const summaryStore = useSummaryStore()

// Store 数据
const laborItems = computed(() => summaryStore.laborItems)
const laborGroupBy = computed(() => summaryStore.laborGroupBy)
const isLoading = computed(() => summaryStore.isLoading)
const error = computed(() => summaryStore.error)

// ========== 筛选状态 ==========
const filterMode = ref('year')
const startDate = ref('')
const endDate = ref('')
const groupBy = ref(laborGroupBy.value || 'month')

// ========== 工具函数 ==========

/** 格式化金额 */
function formatMoney(v) {
  return `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** 格式化工时 */
function formatHours(v) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万h`
  return `${v.toFixed(1)}h`
}

// ========== KPI 派生指标 ==========

// 总工时
const totalHours = computed(() => {
  return laborItems.value.reduce((s, item) => s + (Number(item.hours) || 0), 0)
})

// 总金额
const totalAmount = computed(() => {
  return laborItems.value.reduce((s, item) => s + (Number(item.amount) || 0), 0)
})

// 总工人数
const totalWorkers = computed(() => {
  return laborItems.value.reduce((s, item) => s + (Number(item.workerCount) || 0), 0)
})

// 总出勤次数
const totalWorkCounts = computed(() => {
  return laborItems.value.reduce((s, item) => s + (Number(item.workCount) || 0), 0)
})

// 总任务数
const totalTasks = computed(() => {
  return laborItems.value.reduce((s, item) => s + (Number(item.taskCount) || 0), 0)
})

// 日均工时 = 总工时 / 分组数量
const avgDailyHours = computed(() => {
  const distinctNames = new Set(laborItems.value.map((item) => item.name)).size
  if (distinctNames === 0) return 0
  return totalHours.value / distinctNames
})

// 人均工时
const avgHoursPerWorker = computed(() => {
  return totalWorkers.value > 0 ? totalHours.value / totalWorkers.value : 0
})

// 平均时薪 = 总额 / 总工时
const avgHourlyRate = computed(() => {
  return totalHours.value > 0 ? totalAmount.value / totalHours.value : 0
})

// 分组维度标签
const groupByLabel = computed(() => {
  return GROUP_BY_OPTIONS.find((o) => o.value === groupBy.value)?.label || groupBy.value
})

// ========== 排序后的明细数据 ==========
const sortedItems = computed(() => {
  return [...laborItems.value].sort((a, b) => (Number(b.hours) || 0) - (Number(a.hours) || 0))
})

// ========== 图表数据 ==========

// 工时趋势折线图数据
const trendChartData = computed(() => {
  return [...laborItems.value]
    .filter((item) => item.hours > 0)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map((item) => ({
      name: item.name,
      hours: Number(item.hours) || 0,
      amount: Number(item.amount) || 0,
    }))
})

// 分组对比柱状图数据
const barChartData = computed(() => {
  return [...laborItems.value]
    .filter((item) => item.hours > 0)
    .sort((a, b) => (Number(b.hours) || 0) - (Number(a.hours) || 0))
    .slice(0, 15) // 最多显示前15条
    .map((item) => ({
      name: item.name,
      hours: Number(item.hours) || 0,
      amount: Number(item.amount) || 0,
      workerCount: item.workerCount || 0,
    }))
})

// ========== ECharts 实例 ==========
const trendChartRef = ref()
const barChartRef = ref()
let trendChartInstance = null
let barChartInstance = null

// ========== 图表初始化 ==========

/**
 * 初始化工时趋势折线图
 * 双Y轴：工时(左) + 金额(右)
 */
const initTrendChart = () => {
  if (!trendChartRef.value || trendChartData.value.length === 0) return

  if (trendChartInstance) {
    trendChartInstance.dispose()
  }

  trendChartInstance = echarts.init(trendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      formatter: (params) => {
        let result = `${params[0].name}<br/>`
        params.forEach((p) => {
          if (p.seriesName === '工时') {
            result += `<span style="color:${p.color};">●</span> ${p.seriesName}: <strong>${formatHours(p.value)}</strong><br/>`
          } else if (p.seriesName === '金额') {
            result += `<span style="color:${p.color};">●</span> ${p.seriesName}: <strong>${formatMoney(p.value)}</strong>`
          }
        })
        return result
      },
    },
    legend: {
      data: ['工时', '金额'],
      top: 0,
      right: 10,
      textStyle: { fontSize: 11 },
    },
    grid: {
      top: 35,
      right: 50,
      left: 0,
      bottom: 30,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: trendChartData.value.map((d) => d.name),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#9ca3af', angle: -20, textAnchor: 'end', height: 50 },
    },
    yAxis: [
      {
        type: 'value',
        name: '工时',
        yAxisId: 'left',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: '#9ca3af', formatter: (v) => `${(v / 1000).toFixed(0)}k` },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: '金额',
        yAxisId: 'right',
        orientation: 'right',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: '#9ca3af', formatter: (v) => `¥${(v / 1000).toFixed(0)}k` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '工时',
        type: 'line',
        yAxisId: 'left',
        data: trendChartData.value.map((d) => d.hours),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' },
        emphasis: { scale: true, scaleSize: 10 },
      },
      {
        name: '金额',
        type: 'line',
        yAxisId: 'right',
        data: trendChartData.value.map((d) => d.amount),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        emphasis: { scale: true, scaleSize: 10 },
      },
    ],
  }

  trendChartInstance.setOption(option)
}

/**
 * 初始化分组对比柱状图
 * 横向柱状图，按工时排序
 */
const initBarChart = () => {
  if (!barChartRef.value || barChartData.value.length === 0) return

  if (barChartInstance) {
    barChartInstance.dispose()
  }

  barChartInstance = echarts.init(barChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/><strong>${formatHours(p.value)}</strong>`
      },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['工时'],
      top: 0,
      right: 10,
      textStyle: { fontSize: 11 },
    },
    grid: {
      top: 35,
      right: 20,
      left: 10,
      bottom: 30,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#9ca3af', formatter: (v) => `${v.toFixed(0)}h` },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'category',
      data: barChartData.value.map((d) => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#9ca3af', width: 80, overflow: 'truncate' },
    },
    series: [
      {
        name: '工时',
        type: 'bar',
        data: barChartData.value.map((d) => d.hours).reverse(),
        barWidth: 20,
        itemStyle: {
          color: (params) => BLUE_GRADIENT[params.dataIndex % BLUE_GRADIENT.length],
          borderRadius: [0, 4, 4, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(59, 130, 246, 0.3)',
          },
        },
      },
    ],
  }

  barChartInstance.setOption(option)
}

// ========== 事件处理 ==========

// 分组维度切换
const handleGroupByChange = (newGroupBy) => {
  groupBy.value = newGroupBy
  fetchData()
}

// 日期变化
const handleDateChange = (mode, start, end) => {
  // 同步状态，确保数据获取使用正确的日期参数
  if (mode !== undefined) filterMode.value = mode
  if (start !== undefined) startDate.value = start
  if (end !== undefined) endDate.value = end
  fetchData()
}

// 获取数据
const fetchData = () => {
  summaryStore.fetchLaborStats({
    group_by: groupBy.value,
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined
  })
}

// ========== 监听 & 生命周期 ==========

// 监听数据变化更新图表
watch([trendChartData, barChartData], () => {
  nextTick(() => {
    if (trendChartData.value.length > 0) {
      initTrendChart()
    }
    if (barChartData.value.length > 0) {
      initBarChart()
    }
  })
}, { deep: true })

// 窗口大小变化时重绘图表
const handleResize = () => {
  trendChartInstance?.resize()
  barChartInstance?.resize()
}

// 初始化
onMounted(() => {
  // 设置默认日期范围（年度）
  const now = new Date()
  const year = now.getFullYear()
  startDate.value = `${year}-01-01`
  endDate.value = `${year}-12-31`

  // 获取数据
  fetchData()

  // 延迟初始化图表
  nextTick(() => {
    if (trendChartData.value.length > 0) {
      initTrendChart()
    }
    if (barChartData.value.length > 0) {
      initBarChart()
    }
  })

  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  trendChartInstance?.dispose()
  barChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  padding: 10px 0;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-table__row:hover > td) {
  background-color: rgba(59, 130, 246, 0.05) !important;
}
</style>
