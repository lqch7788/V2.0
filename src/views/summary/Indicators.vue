<template>
  <!-- 指标看板页面 - 种植关键指标仪表盘 -->
  <div class="space-y-6 bg-[#F2F6FA] p-6">
    <!-- 页面标题 -->
    <PageHeader
      title="指标看板"
      description="种植关键指标仪表盘、阈值告警与实时监控"
    >
      <template #icon>
        <el-icon :size="24" color="white"><DataLine /></el-icon>
      </template>
    </PageHeader>

    <!-- 加载状态 -->
    <div v-if="isLoading && !indicator" class="flex items-center justify-center h-96 bg-[#F2F6FA]">
      <div class="flex flex-col items-center gap-4">
        <el-icon class="is-loading" :size="40" color="#64748b"><Loading /></el-icon>
        <span class="text-gray-500">加载指标数据中...</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!isLoading && !indicator" class="space-y-6 bg-[#F2F6FA] p-6">
      <PageHeader
        title="指标看板"
        description="种植关键指标仪表盘、阈值告警与实时监控"
      >
        <template #icon>
          <el-icon :size="24" color="white"><DataLine /></el-icon>
        </template>
      </PageHeader>
      <div class="bg-white rounded-xl p-12 text-center">
        <el-icon :size="64" color="#d1d5db"><DataLine /></el-icon>
        <p class="text-gray-500 text-lg mt-4">暂无指标数据</p>
        <el-button class="mt-4 !bg-slate-600 hover:!bg-slate-700" @click="loadData">重新加载</el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <template v-else>
      <!-- 周期切换 -->
      <div class="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          <el-button
            v-for="opt in PERIOD_OPTIONS"
            :key="opt.value"
            :type="periodMode === opt.value ? 'primary' : ''"
            :class="[
              '!border-none !rounded-md transition-colors',
              periodMode === opt.value ? 'bg-slate-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            ]"
            size="small"
            @click="periodMode = opt.value"
          >
            {{ opt.label }}
          </el-button>
        </div>
        <div v-if="indicator?.period" class="text-sm text-gray-500">
          统计周期：
          <span class="font-medium text-gray-700 ml-1">
            {{ indicator.period.start }} ~ {{ indicator.period.end }}
          </span>
        </div>
      </div>

      <!-- 综合评分大卡片 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="flex items-center justify-center gap-2 mb-2">
          <el-icon :size="20" color="#facc15"><StarFilled /></el-icon>
          <span class="text-sm text-gray-500 uppercase tracking-wide">综合评分</span>
        </div>
        <div :class="['text-6xl font-bold', scoreColor(overallScore)]">
          {{ Math.round(overallScore) }}
        </div>
        <div class="text-sm text-gray-400 mt-1">/ 100 分</div>
        <!-- 环形进度条 - SVG实现 -->
        <div class="relative w-40 h-40 mx-auto mt-4">
          <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
            <!-- 背景圆环 -->
            <circle
              cx="50"
              cy="50"
              :r="ringRadius"
              fill="none"
              stroke="#e5e7eb"
              :stroke-width="ringStrokeWidth"
            />
            <!-- 进度圆环 -->
            <circle
              cx="50"
              cy="50"
              :r="ringRadius"
              fill="none"
              :stroke="overallScoreColor"
              :stroke-width="ringStrokeWidth"
              :stroke-dasharray="ringCircumference"
              :stroke-dashoffset="overallScoreDashOffset"
              stroke-linecap="round"
              class="transition-all duration-500"
            />
          </svg>
          <!-- 中心文字 -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span :class="['text-lg font-bold', scoreColor(overallScore)]">
              {{ overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '待改善' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 仪表盘行：产量达成 + 任务完成 + 成本控制 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 产量达成率 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <el-icon :size="16" color="#10b981"><TrendCharts /></el-icon>
            产量达成率
          </h3>
          <GaugeChart
            :percentage="yieldRate"
            label="产量指标达成"
            :colorScheme="gaugeColor(yieldRate)"
          />
        </div>

        <!-- 任务完成率 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <el-icon :size="16" color="#3b82f6"><CircleCheckFilled /></el-icon>
            任务完成率
          </h3>
          <!-- 环形进度图 - SVG实现 -->
          <div class="relative w-40 h-40">
            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
              <!-- 背景圆环 -->
              <circle
                cx="50"
                cy="50"
                :r="ringRadius"
                fill="none"
                stroke="#e5e7eb"
                :stroke-width="ringStrokeWidth"
              />
              <!-- 进度圆环 -->
              <circle
                cx="50"
                cy="50"
                :r="ringRadius"
                fill="none"
                :stroke="taskCompletionRate >= 80 ? '#10b981' : taskCompletionRate >= 60 ? '#f59e0b' : '#ef4444'"
                :stroke-width="ringStrokeWidth"
                :stroke-dasharray="ringCircumference"
                :stroke-dashoffset="taskCompletionDashOffset"
                stroke-linecap="round"
                class="transition-all duration-500"
              />
            </svg>
            <!-- 中心数字 -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span :class="['text-2xl font-bold', scoreColor(taskCompletionRate)]">
                {{ Math.round(taskCompletionRate) }}%
              </span>
              <span class="text-xs text-gray-400 mt-1">完成率</span>
            </div>
          </div>
          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500">
              已完成 <span class="font-medium text-gray-700">{{ indicator?.task.completed ?? 0 }}</span>
              {' / '}
              总计 <span class="font-medium text-gray-700">{{ indicator?.task.total ?? 0 }}</span> 项
            </p>
          </div>
        </div>

        <!-- 成本控制率 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <el-icon :size="16" color="#f59e0b"><Money /></el-icon>
            成本控制率
          </h3>
          <div class="flex-1 flex flex-col items-center justify-center">
            <TrafficLight :status="costTrafficStatus" label="成本控制" />
          </div>
          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500">
              人工成本：<span class="font-medium text-gray-700">
                {{ (indicator?.labor.totalCost ?? 0).toLocaleString() }} 元
              </span>
            </p>
            <p class="text-xs text-gray-400 mt-1">
              工人：{{ indicator?.labor.workerCount ?? 0 }}名 | 工时：{{ indicator?.labor.totalHours ?? 0 }}h
            </p>
          </div>
        </div>
      </div>

      <!-- 雷达图 + 明细表 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 综合指标雷达图 - ECharts实现 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <el-icon :size="16" color="#64748b"><DataAnalysis /></el-icon>
            综合指标雷达图
          </h3>
          <div ref="radarChartRef" class="h-80"></div>
        </div>

        <!-- 指标明细表 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <el-icon :size="16" color="#64748b"><StarFilled /></el-icon>
            指标明细表
          </h3>
          <el-table :data="detailTableData" style="width: 100%" :header-cell-style="headerCellStyle">
            <el-table-column prop="name" label="指标名称" min-width="100" />
            <el-table-column prop="target" label="目标值" min-width="100" />
            <el-table-column prop="actual" label="实际值" min-width="100" />
            <el-table-column prop="rate" label="达成率" min-width="80" align="center">
              <template #default="{ row }">
                <span :class="['font-medium', scoreColor(Number(row.rate.replace('%', '')))]">
                  {{ row.rate }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="评分" min-width="80" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'inline-flex items-center justify-center w-10 h-8 rounded-md text-xs font-bold',
                    scoreBgColor(row.score),
                    scoreColor(row.score)
                  ]"
                >
                  {{ row.score }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
      数据加载异常：{{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import {
  DataLine, Loading, StarFilled, TrendCharts, CircleCheckFilled,
  Money, DataAnalysis
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { PageHeader, GaugeChart } from '@/components/summary'
import { useSummaryStore } from '@/stores/modules/summary'

// ========== 信号灯组件 ==========
const TrafficLight = {
  name: 'TrafficLight',
  props: {
    status: String,
    label: String,
  },
  setup(props) {
    const lightConfig = {
      good: { color: '#10b981', bg: '#d1fae5', text: '正常', textColor: 'text-emerald-700' },
      warning: { color: '#f59e0b', bg: '#fef3c7', text: '注意', textColor: 'text-amber-700' },
      bad: { color: '#ef4444', bg: '#fee2e2', text: '超标', textColor: 'text-red-700' },
    }

    const lights = ['good', 'warning', 'bad']

    // 修复：使用 s === props.status 而不是 width === status
    const getLightStyle = (s) => {
      const isActive = s === props.status
      return {
        width: isActive ? '32px' : '20px',
        height: isActive ? '32px' : '20px',
        backgroundColor: isActive ? lightConfig[s].color : '#e5e7eb',
        boxShadow: isActive ? `0 0 12px ${lightConfig[s].color}80` : 'none'
      }
    }

    return { lightConfig, lights, getLightStyle }
  },
  template: `
    <div class="flex flex-col items-center gap-2">
      <div class="flex gap-3">
        <div
          v-for="s in lights"
          :key="s"
          class="rounded-full transition-all duration-300"
          :style="getLightStyle(s)"
        />
      </div>
      <span :class="['text-xs font-medium', lightConfig[status].textColor]">{{ lightConfig[status].text }}</span>
      <span class="text-sm text-gray-500">{{ label }}</span>
    </div>
  `,
}

// ========== 周期选项 ==========
const PERIOD_OPTIONS = [
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年度' },
]

// ========== Store ==========
const summaryStore = useSummaryStore()
const periodMode = ref('year')

const indicators = computed(() => summaryStore.indicators)
const isLoading = computed(() => summaryStore.isLoading)
const error = computed(() => summaryStore.error)

const indicator = computed(() => indicators.value[0] || null)

// ========== 环形图参数 ==========
const ringRadius = 45
const ringStrokeWidth = 8
const ringCircumference = 2 * Math.PI * ringRadius

// ========== 派生数据 ==========

/** 综合评分百分比（0-100） */
const overallScore = computed(() => indicator.value?.overallScore ?? 0)

/** 综合评分颜色 */
const overallScoreColor = computed(() => {
  if (overallScore.value >= 80) return '#10b981'
  if (overallScore.value >= 60) return '#f59e0b'
  return '#ef4444'
})

/** 综合评分环形图偏移量 */
const overallScoreDashOffset = computed(() => {
  const progress = Math.min(Math.max(overallScore.value, 0), 100)
  return ringCircumference * (1 - progress / 100)
})

/** 产量达成率 */
const yieldRate = computed(() => {
  if (!indicator.value) return 0
  const target = indicator.value.yield.avgYieldPerHarvest > 0
    ? indicator.value.yield.avgYieldPerHarvest * 1.2
    : 100
  return Math.round((indicator.value.yield.avgYieldPerHarvest / target) * 100)
})

/** 任务完成率 */
const taskCompletionRate = computed(() => indicator.value?.task.completionRate ?? 0)

/** 任务完成率环形图偏移量 */
const taskCompletionDashOffset = computed(() => {
  const progress = Math.min(Math.max(taskCompletionRate.value, 0), 100)
  return ringCircumference * (1 - progress / 100)
})

/** 问题解决率 */
const problemResolutionRate = computed(() => indicator.value?.problem.resolutionRate ?? 0)

/** 人工效率 (产量/工时, kg/h) */
const laborEfficiency = computed(() => indicator.value?.labor.efficiency ?? 0)

/** 人工效率百分比（与V1.1完全一致，直接使用原始值） */
const laborEfficiencyPercent = computed(() => laborEfficiency.value)

/** 成本控制率 - 基于预算的成本控制百分比（与V1.1完全一致） */
const costControlRate = computed(() => {
  if (!indicator.value) return 100
  // 当 totalCost <= 0 时，与V1.1保持一致返回100
  if (indicator.value.labor.totalCost <= 0) return 100
  // 设定成本预算为目标成本的 110%
  const budget = indicator.value.labor.totalCost * 1.1
  // 成本控制率 = (1 - 实际成本/预算成本) * 100 + 100（基础分）
  // 与V1.1保持一致
  const rate = Math.round((1 - (indicator.value.labor.totalCost / budget)) * 100 + 100)
  return Math.min(Math.max(rate, 0), 200)
})

/** 成本信号灯状态 */
const costTrafficStatus = computed(() => {
  if (costControlRate.value >= 90) return 'good'
  if (costControlRate.value >= 70) return 'warning'
  return 'bad'
})

/** 雷达图数据（与V1.1一致） */
const radarData = computed(() => {
  if (!indicator.value) return []
  return [
    { subject: '产量', 指标得分: yieldRate.value, fullMark: 100 },
    { subject: '任务', 指标得分: taskCompletionRate.value, fullMark: 100 },
    { subject: '问题', 指标得分: problemResolutionRate.value, fullMark: 100 },
    { subject: '人工', 指标得分: laborEfficiencyPercent.value, fullMark: 100 },
  ]
})

/** 指标明细表数据 */
const detailTableData = computed(() => {
  if (!indicator.value) return []
  return [
    {
      name: '产量指标',
      target: `${indicator.value.yield.harvestCount}次采收`,
      actual: `${(indicator.value.yield.totalYield ?? 0).toLocaleString()} kg`,
      rate: `${yieldRate.value}%`,
      score: yieldRate.value,
    },
    {
      name: '任务指标',
      target: `${indicator.value.task.total}项`,
      actual: `完成${indicator.value.task.completed}项`,
      rate: `${taskCompletionRate.value}%`,
      score: taskCompletionRate.value,
    },
    {
      name: '问题指标',
      target: `${indicator.value.problem.total}项`,
      actual: `解决${indicator.value.problem.resolved}项`,
      rate: `${problemResolutionRate.value}%`,
      score: problemResolutionRate.value,
    },
    {
      name: '人工指标',
      target: `${indicator.value.labor.workerCount}名工人`,
      actual: `${indicator.value.labor.totalHours.toLocaleString()}工时`,
      rate: `${laborEfficiencyPercent.value}%`,
      score: laborEfficiencyPercent.value,
    },
  ]
})

// ========== 辅助函数 ==========

/** 评分颜色 */
const scoreColor = (score) => {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

/** 评分背景色 */
const scoreBgColor = (score) => {
  if (score >= 80) return 'bg-emerald-100'
  if (score >= 60) return 'bg-amber-100'
  return 'bg-red-100'
}

/** 仪表盘颜色 */
const gaugeColor = (score) => {
  if (score >= 80) return 'emerald'
  if (score >= 60) return 'amber'
  return 'red'
}

/** 表格表头单元格样式（与V1.1一致：蓝色渐变背景） */
const headerCellStyle = () => ({
  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
  color: 'white',
  'font-weight': '600',
  'font-size': '14px',
  'text-align': 'left',
  padding: '12px 16px'
})

// ========== 雷达图 ==========
const radarChartRef = ref()
let radarChartInstance = null

const initRadarChart = () => {
  if (!radarChartRef.value || radarData.value.length === 0) return

  if (radarChartInstance) {
    radarChartInstance.dispose()
  }

  radarChartInstance = echarts.init(radarChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const data = params.data || {}
        return `${params.name}: ${Math.round(data.value)}%`
      }
    },
    radar: {
      indicator: radarData.value.map(item => ({
        name: item.subject,
        max: 100
      })),
      radius: '70%',
      axisName: {
        color: '#374151',
        fontSize: 13
      },
      splitNumber: 4,
      splitLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    series: [
      {
        name: '指标得分',
        type: 'radar',
        data: [
          {
            value: radarData.value.map(item => item.指标得分),
            name: '指标得分',
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#10b981',
              width: 2
            },
            areaStyle: {
              color: '#10b981',
              opacity: 0.2  // 与V1.1一致：fillOpacity: 0.2
            },
            itemStyle: {
              color: '#10b981',
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        ]
      }
    ]
  }

  radarChartInstance.setOption(option)
}

// 响应窗口大小变化
const handleResize = () => {
  if (radarChartInstance) {
    radarChartInstance.resize()
  }
}

// ========== 生命周期 ==========

/**
 * 根据周期模式计算日期范围
 * @param mode 周期模式：month(本月)、quarter(本季度)、year(本年度)
 * @returns 包含 start_date 和 end_date 的对象
 */
const getDateRangeByPeriod = (mode) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const quarter = Math.floor(month / 3)

  let startDate, endDate

  switch (mode) {
    case 'month':
      // 本月第一天
      startDate = new Date(year, month, 1)
      endDate = today
      break
    case 'quarter':
      // 本季度第一天
      startDate = new Date(year, quarter * 3, 1)
      endDate = today
      break
    case 'year':
    default:
      // 本年度第一天
      startDate = new Date(year, 0, 1)
      endDate = today
      break
  }

  // 格式化为 YYYY-MM-DD
  const formatDate = (d) => d.toISOString().split('T')[0]
  return {
    start_date: formatDate(startDate),
    end_date: formatDate(endDate)
  }
}

// 加载数据
const loadData = () => {
  const dateRange = getDateRangeByPeriod(periodMode.value)
  summaryStore.fetchIndicators(dateRange)
}

watch(periodMode, () => {
  loadData()
})

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
  // 延迟初始化雷达图确保DOM已渲染
  setTimeout(() => {
    initRadarChart()
  }, 100)
})

// 监听雷达图数据变化
watch(radarData, () => {
  if (radarChartInstance) {
    initRadarChart()
  }
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (radarChartInstance) {
    radarChartInstance.dispose()
    radarChartInstance = null
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
