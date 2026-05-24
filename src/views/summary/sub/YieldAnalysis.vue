<template>
  <!-- 产量分析页面 - 产量趋势、同比环比、品种排名与批次对比 -->
  <div class="space-y-4">
    <!-- 页面头部（可隐藏） -->
    <PageHeader
      v-if="!hideHeader"
      title="产量分析"
      description="产量趋势、同比环比、品种排名与批次对比"
    >
      <template #icon>
        <el-icon :size="24" color="white"><TrendCharts /></el-icon>
      </template>
    </PageHeader>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 日期筛选器 -->
        <div class="flex items-center gap-2">
          <el-radio-group v-model="filterMode" size="small" @change="handleModeChange">
            <el-radio-button label="month">月份</el-radio-button>
            <el-radio-button label="quarter">季度</el-radio-button>
            <el-radio-button label="year">年度</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 自定义日期选择 -->
        <div v-if="filterMode === 'custom'" class="flex items-center gap-2">
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="开始日期"
            size="small"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 140px"
          />
          <span class="text-gray-400">至</span>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="结束日期"
            size="small"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 140px"
          />
          <el-button type="primary" size="small" @click="handleCustomDateConfirm">确定</el-button>
        </div>

        <div class="w-px h-6 bg-gray-200 hidden sm:block" />

        <!-- 分组维度切换按钮组 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 mr-1">分组：</span>
          <div class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
            <el-button
              v-for="opt in GROUP_BY_OPTIONS"
              :key="opt.value"
              :type="groupBy === opt.value ? 'primary' : ''"
              :class="[
                '!border-none !rounded-md transition-colors',
                groupBy === opt.value ? '' : '!text-gray-600 hover:!bg-gray-100'
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
        <el-icon class="is-loading" :size="16"><Loading /></el-icon>
        加载中...
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
      <el-icon :size="20"><CircleCloseFilled /></el-icon>
      <span class="text-sm">数据加载失败：{{ error }}</span>
    </div>

    <!-- KPI 卡片区域 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 总产量 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <el-icon :size="20" color="white"><Box /></el-icon>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 truncate">总产量</p>
            <p class="text-xl font-bold text-gray-800 mt-0.5">{{ formatWeight(totalYield) }}</p>
          </div>
        </div>
      </div>

      <!-- 采收次数 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <el-icon :size="20" color="white"><DataAnalysis /></el-icon>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 truncate">采收次数</p>
            <p class="text-xl font-bold text-gray-800 mt-0.5">{{ totalCount.toLocaleString() }} 次</p>
          </div>
        </div>
      </div>

      <!-- 平均单价 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <el-icon :size="20" color="white"><Money /></el-icon>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 truncate">平均单价</p>
            <p class="text-xl font-bold text-gray-800 mt-0.5">
              {{ avgPrice > 0 ? formatMoney(avgPrice) + '/kg' : '--' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 总产值 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <el-icon :size="20" color="white"><TrendCharts /></el-icon>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 truncate">总产值</p>
            <p class="text-xl font-bold text-gray-800 mt-0.5">{{ formatMoney(totalAmount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域：趋势图 + 排名图 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 产量与产值趋势图 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-900 mb-1">产量与产值趋势</h3>
        <p class="text-xs text-gray-400 mb-4">产量柱状图 + 产值折线，双轴展示</p>
        <div ref="trendChartRef" class="h-[300px]"></div>
      </div>

      <!-- 产量排名图 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-900 mb-1">产量排名（Top12）</h3>
        <p class="text-xs text-gray-400 mb-4">按{{ currentGroupLabel }}维度排序，展示产量排名</p>
        <div ref="rankingChartRef" class="h-[350px]"></div>
      </div>
    </div>

    <!-- 质量分布饼图 + 产量明细表（质量模式并排） -->
    <template v-if="groupBy === 'quality'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 质量分布饼图 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="font-semibold text-gray-900 mb-1">质量等级分布</h3>
          <p class="text-xs text-gray-400 mb-4">A/B/C/次品 占比</p>
          <div ref="qualityPieChartRef" class="h-[280px] relative">
            <!-- 中心文字 -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <p class="text-[11px] text-gray-400">总产量</p>
              <p class="text-base font-bold text-gray-800">{{ formatWeight(qualityTotal) }}</p>
            </div>
          </div>
        </div>

        <!-- 产量明细表 -->
        <YieldDetailTable :items="sortedYieldItems" />
      </div>
    </template>

    <!-- 产量明细表（非质量模式） -->
    <YieldDetailTable v-else :items="sortedYieldItems" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  TrendCharts, Box, DataAnalysis, Money, Loading,
  CircleCloseFilled, Calendar, Goods, Grid, CircleCheck
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { PageHeader } from '@/components/summary'
import { useSummaryStore } from '@/stores/modules/summary'
import YieldDetailTable from './YieldDetailTable.vue'

// ========== 常量 ==========

/** 分组维度选项 */
const GROUP_BY_OPTIONS = [
  { value: 'month', label: '月份', icon: Calendar },
  { value: 'crop', label: '作物', icon: Goods },
  { value: 'greenhouse', label: '温室', icon: Grid },
  { value: 'quality', label: '质量', icon: CircleCheck },
]

/** 翠绿渐变色阶 */
const EMERALD_GRADIENT = ['#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b']

/** 质量等级颜色 */
const QUALITY_COLORS = {
  'A': '#10b981',
  'B': '#3b82f6',
  'C': '#f59e0b',
  '次品': '#ef4444',
  'A级': '#10b981',
  'B级': '#3b82f6',
  'C级': '#f59e0b',
}

/** 质量颜色数组（用于饼图） */
const QUALITY_COLOR_LIST = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

// ========== Props ==========
defineProps({
  hideHeader: {
    type: Boolean,
    default: false
  }
})

// ========== Store ==========
const summaryStore = useSummaryStore()

const yieldItems = computed(() => summaryStore.yieldItems || [])
const isLoading = computed(() => summaryStore.isLoading)
const error = computed(() => summaryStore.error)

// ========== 状态 ==========
const filterMode = ref('year')
const startDate = ref('')
const endDate = ref('')
const groupBy = ref('month')

// ========== 图表 Refs ==========
const trendChartRef = ref()
const rankingChartRef = ref()
const qualityPieChartRef = ref()

// ========== 图表实例 ==========
let trendChartInstance = null
let rankingChartInstance = null
let qualityPieChartInstance = null

// ========== 计算属性 ==========

/** 当前分组维度标签 */
const currentGroupLabel = computed(() => {
  const opt = GROUP_BY_OPTIONS.find(o => o.value === groupBy.value)
  return opt ? opt.label : groupBy.value
})

/** 排序后的产量数据 */
const sortedYieldItems = computed(() => {
  return [...yieldItems.value].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
})

/** KPI: 总产量 */
const totalYield = computed(() => {
  return yieldItems.value.reduce((s, item) => s + (Number(item.value) || 0), 0)
})

/** KPI: 总产值 */
const totalAmount = computed(() => {
  return yieldItems.value.reduce((s, item) => s + (Number(item.totalAmount) || 0), 0)
})

/** KPI: 总采收次数 */
const totalCount = computed(() => {
  return yieldItems.value.reduce((s, item) => s + (Number(item.count) || 0), 0)
})

/** KPI: 平均单价 */
const avgPrice = computed(() => {
  return totalYield.value > 0 ? totalAmount.value / totalYield.value : 0
})

/** 质量分布饼图总产量 */
const qualityTotal = computed(() => {
  return yieldItems.value.reduce((s, item) => s + (Number(item.value) || 0), 0)
})

// ========== 工具函数 ==========

/**
 * 格式化重量
 * @param {number} v - 重量值
 * @returns {string} 格式化后的字符串
 */
function formatWeight(v) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万 kg`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k kg`
  return `${v.toFixed(0)} kg`
}

/**
 * 格式化金额
 * @param {number} v - 金额值
 * @returns {string} 格式化后的字符串
 */
function formatMoney(v) {
  return `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 获取渐变色
 * @param {number} index - 索引
 * @returns {string} 颜色值
 */
function getEmeraldColor(index) {
  return EMERALD_GRADIENT[index % EMERALD_GRADIENT.length]
}

// ========== 产量与产值趋势图 ==========
const initTrendChart = () => {
  if (!trendChartRef.value) return

  if (trendChartInstance) {
    trendChartInstance.dispose()
  }

  const chartData = [...yieldItems.value]
    .filter((item) => item.value > 0)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map((item) => ({
      name: item.name,
      产量: Number(item.value) || 0,
      产值: Number(item.totalAmount) || 0,
    }))

  if (chartData.length === 0) {
    // 显示空状态
    trendChartRef.value.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#9ca3af;">
        <span style="font-size:48px;opacity:0.3;">📊</span>
        <span style="margin-top:8px;font-size:14px;">暂无产量数据</span>
      </div>
    `
    return
  }

  trendChartInstance = echarts.init(trendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      formatter: function(params) {
        let result = `<div style="font-weight:600;margin-bottom:4px;">${params[0].name}</div>`
        params.forEach(param => {
          if (param.seriesName === '产量') {
            result += `<div style="color:#666;">${param.seriesName}: <strong>${formatWeight(param.value)}</strong></div>`
          } else if (param.seriesName === '产值') {
            result += `<div style="color:#666;">${param.seriesName}: <strong>${formatMoney(param.value)}</strong></div>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['产量', '产值'],
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 12 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.name),
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: [
      {
        type: 'value',
        name: '产量',
        position: 'left',
        axisLabel: {
          fontSize: 12,
          color: '#9ca3af',
          formatter: (v) => `${(v / 1000).toFixed(0)}k`
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      {
        type: 'value',
        name: '产值',
        position: 'right',
        axisLabel: {
          fontSize: 12,
          color: '#9ca3af',
          formatter: (v) => `¥${(v / 1000).toFixed(0)}k`
        },
        axisLine: { show: false },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '产量',
        type: 'bar',
        yAxisIndex: 0,
        data: chartData.map(d => d.产量),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: '#34d399' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barSize: 28
      },
      {
        name: '产值',
        type: 'bar',
        yAxisIndex: 1,
        data: chartData.map(d => d.产值),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: '#fbbf24' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barSize: 28
      }
    ]
  }

  trendChartInstance.setOption(option)
}

// ========== 产量排名图 ==========
const initRankingChart = () => {
  if (!rankingChartRef.value) return

  if (rankingChartInstance) {
    rankingChartInstance.dispose()
  }

  const chartData = [...yieldItems.value]
    .filter((item) => item.value > 0)
    .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
    .slice(0, 12)

  if (chartData.length === 0) {
    rankingChartRef.value.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#9ca3af;">
        <span style="font-size:48px;opacity:0.3;">📊</span>
        <span style="margin-top:8px;font-size:14px;">暂无排名数据</span>
      </div>
    `
    return
  }

  rankingChartInstance = echarts.init(rankingChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      formatter: (params) => {
        const item = params[0]
        return `<div style="font-weight:600;margin-bottom:4px;">${item.name}</div>
          <div style="color:#666;">产量: <strong>${formatWeight(item.value)}</strong></div>`
      }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        color: '#9ca3af',
        formatter: (v) => `${(v / 1000).toFixed(0)}k`
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    yAxis: {
      type: 'category',
      data: chartData.map(d => d.name).reverse(),
      axisLabel: {
        fontSize: 11,
        color: '#6b7280',
        width: 80,
        overflow: 'truncate'
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    series: [
      {
        name: '产量',
        type: 'bar',
        data: chartData.map((d, index) => ({
          value: Number(d.value) || 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: getEmeraldColor(index) },
              { offset: 1, color: getEmeraldColor(index + 1) || getEmeraldColor(0) }
            ])
          }
        })).reverse(),
        barMaxWidth: 24,
        barMinHeight: 4,
        itemStyle: { borderRadius: [0, 4, 4, 0] }
      }
    ]
  }

  rankingChartInstance.setOption(option)
}

// ========== 质量分布饼图 ==========
const initQualityPieChart = () => {
  if (!qualityPieChartRef.value || groupBy.value !== 'quality') return

  if (qualityPieChartInstance) {
    qualityPieChartInstance.dispose()
  }

  const pieData = [...yieldItems.value]
    .filter((item) => item.value > 0)
    .map((item, index) => ({
      name: item.name,
      value: Number(item.value) || 0,
      itemStyle: {
        color: QUALITY_COLOR_LIST[index % QUALITY_COLOR_LIST.length] || '#94a3b8'
      }
    }))

  if (pieData.length === 0) {
    qualityPieChartRef.value.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#9ca3af;">
        <span style="font-size:48px;opacity:0.3;">🎯</span>
        <span style="margin-top:8px;font-size:14px;">暂无质量数据</span>
      </div>
    `
    return
  }

  qualityPieChartInstance = echarts.init(qualityPieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      formatter: (params) => {
        return `<div style="font-weight:600;">${params.name}</div>
          <div style="color:#666;">${formatWeight(params.value)} (${params.percent.toFixed(1)}%)</div>`
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#6b7280', fontSize: 12 },
      formatter: (name) => {
        const item = pieData.find(d => d.name === name)
        return item ? `${name}: ${formatWeight(item.value)}` : name
      }
    },
    series: [
      {
        name: '质量分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}',
          fontSize: 12,
          color: '#334155'
        },
        labelLine: {
          show: true,
          lineStyle: { color: '#94a3b8', width: 1 }
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: pieData
      }
    ]
  }

  qualityPieChartInstance.setOption(option)
}

// ========== 数据加载 ==========
const loadData = () => {
  summaryStore.fetchYieldStats({
    group_by: groupBy.value,
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined
  })
}

// ========== 事件处理 ==========

/**
 * 处理分组维度切换
 * @param {string} newGroupBy - 新的分组维度
 */
const handleGroupByChange = (newGroupBy) => {
  groupBy.value = newGroupBy
  loadData()
}

/**
 * 处理筛选模式切换
 * @param {string} mode - 筛选模式
 */
const handleModeChange = (mode) => {
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
      loadData()
      break
    }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3)
      const qStart = `${year}-${String(q * 3 + 1).padStart(2, '0')}-01`
      // 季度结束月份：Q1=4月, Q2=7月, Q3=10月, Q4=下年1月
      const qEndMonth = q * 3 + 4
      const actualMonth = qEndMonth > 12 ? qEndMonth - 12 : qEndMonth
      const actualYear = qEndMonth > 12 ? year + 1 : year
      const qEnd = `${actualYear}-${String(actualMonth).padStart(2, '0')}-${new Date(actualYear, actualMonth, 0).getDate()}`
      startDate.value = qStart
      endDate.value = qEnd
      loadData()
      break
    }
    case 'year': {
      startDate.value = `${year}-01-01`
      endDate.value = `${year}-12-31`
      loadData()
      break
    }
    case 'custom':
      // 自定义模式不触发加载，等待用户选择日期
      break
  }
}

/**
 * 处理自定义日期确认
 */
const handleCustomDateConfirm = () => {
  if (startDate.value && endDate.value) {
    loadData()
  } else {
    ElMessage.warning('请选择开始和结束日期')
  }
}

// ========== 窗口调整 ==========
const handleResize = () => {
  if (trendChartInstance) trendChartInstance.resize()
  if (rankingChartInstance) rankingChartInstance.resize()
  if (qualityPieChartInstance) qualityPieChartInstance.resize()
}

// ========== 生命周期 ==========
onMounted(() => {
  // 默认按年度加载
  const now = new Date()
  const year = now.getFullYear()
  startDate.value = `${year}-01-01`
  endDate.value = `${year}-12-31`
  loadData()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChartInstance) trendChartInstance.dispose()
  if (rankingChartInstance) rankingChartInstance.dispose()
  if (qualityPieChartInstance) qualityPieChartInstance.dispose()
  if (chartUpdateTimer) clearTimeout(chartUpdateTimer)
  if (qualityChartTimer) clearTimeout(qualityChartTimer)
})

// ========== 监听数据变化重绘图表 ==========
// 保存定时器 ID，用于组件卸载时清除
let chartUpdateTimer = null
let qualityChartTimer = null

watch(yieldItems, () => {
  if (chartUpdateTimer) clearTimeout(chartUpdateTimer)
  chartUpdateTimer = setTimeout(() => {
    initTrendChart()
    initRankingChart()
    if (groupBy.value === 'quality') {
      initQualityPieChart()
    }
  }, 100)
}, { deep: true })

watch(groupBy, (newVal) => {
  if (newVal === 'quality') {
    if (qualityChartTimer) clearTimeout(qualityChartTimer)
    qualityChartTimer = setTimeout(() => {
      initQualityPieChart()
    }, 100)
  }
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
