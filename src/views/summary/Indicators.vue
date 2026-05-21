<template>
  <!-- 指标看板页面 - 种植关键指标仪表盘 -->
  <div class="space-y-6 bg-[#F2F6FA]">
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
      <div class="bg-white rounded-xl p-12 text-center">
        <el-icon :size="64" color="#d1d5db"><DataLine /></el-icon>
        <p class="text-gray-500 text-lg mt-4">暂无指标数据</p>
        <el-button type="primary" class="mt-4" @click="loadData">重新加载</el-button>
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
        <!-- 环形进度条 -->
        <div class="relative w-40 h-40 mx-auto mt-4">
          <el-icon :size="160"><PieChart /></el-icon>
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
          <div class="relative w-40 h-40">
            <el-icon :size="160" color="#10b981"><PieChart /></el-icon>
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
        <!-- 综合指标雷达图 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <el-icon :size="16" color="#64748b"><DataAnalysis /></el-icon>
            综合指标雷达图
          </h3>
          <div class="h-80 flex items-center justify-center text-gray-400">
            <div class="text-center">
              <el-icon :size="48"><DataLine /></el-icon>
              <p class="mt-2">雷达图组件开发中</p>
            </div>
          </div>
        </div>

        <!-- 指标明细表 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <el-icon :size="16" color="#64748b"><StarFilled /></el-icon>
            指标明细表
          </h3>
          <el-table :data="detailTableData" style="width: 100%">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  DataLine, Loading, StarFilled, PieChart, TrendCharts, CircleCheckFilled,
  Money, DataAnalysis
} from '@element-plus/icons-vue'
import { PageHeader, GaugeChart } from '@/components/summary'
import { useSummaryStore } from '@/stores/modules/summary'

// 信号灯组件
const TrafficLight = {
  name: 'TrafficLight',
  props: {
    status: String,
    label,
  },
  setup(props) {
    const lightConfig = {
      good: { color: '#10b981', bg: '#d1fae5', text: '正常', textColor: 'text-emerald-700' },
      warning: { color: '#f59e0b', bg: '#fef3c7', text: '注意', textColor: 'text-amber-700' },
      bad: { color: '#ef4444', bg: '#fee2e2', text: '超标', textColor: 'text-red-700' },
    }

    const lights = ['good', 'warning', 'bad']

    return { lightConfig, lights }
  },
  template: `
    <div class="flex flex-col items-center gap-2">
      <div class="flex gap-3">
        <div
          v-for="s in lights"
          :key="s"
          :class="['rounded-full transition-all duration-300', s === status ? 'animate-pulse' : '']"
          :style="{
            width === status ? '32px' : '20px',
            height === status ? '32px' : '20px',
            backgroundColor === status ? lightConfig[s].color : '#e5e7eb',
            boxShadow === status ? '0 0 12px ' + lightConfig[s].color + '80' : 'none'
          }"
        />
      </div>
      <span :class="['text-xs font-medium', lightConfig[status].textColor]">{{ lightConfig[status].text }}</span>
      <span class="text-sm text-gray-500">{{ label }}</span>
    </div>
  `,
}

// 周期选项
const PERIOD_OPTIONS = [
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年度' },
]

const summaryStore = useSummaryStore()
const periodMode = ref('year')

const indicators = computed(() => summaryStore.indicators)
const isLoading = computed(() => summaryStore.isLoading)

const indicator = computed(() => indicators.value[0] || null)

// 综合评分
const overallScore = computed(() => indicator.value?.overallScore ?? 0)

// 产量达成率
const yieldRate = computed(() => {
  if (!indicator.value) return 0
  const target = indicator.value.yield.avgYieldPerHarvest > 0
    ? indicator.value.yield.avgYieldPerHarvest * 1.2
    : 100
  return Math.round((indicator.value.yield.avgYieldPerHarvest / target) * 100)
})

// 任务完成率
const taskCompletionRate = computed(() => indicator.value?.task.completionRate ?? 0)

// 问题解决率
const problemResolutionRate = computed(() => indicator.value?.problem.resolutionRate ?? 0)

// 人工效率
const laborEfficiency = computed(() => indicator.value?.labor.efficiency ?? 0)

// 成本控制率
const costControlRate = computed(() => {
  if (!indicator.value) return 100
  const budget = indicator.value.labor.totalCost > 0
    ? indicator.value.labor.totalCost * 1.1
    : 100
  return Math.round((1 - (indicator.value.labor.totalCost / budget)) * 100 + 100)
})

// 成本信号灯状态
const costTrafficStatus = computed(() => {
  if (costControlRate.value >= 90) return 'good'
  if (costControlRate.value >= 70) return 'warning'
  return 'bad'
})

// 指标明细表数据
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
      rate: `${laborEfficiency.value}%`,
      score: laborEfficiency.value,
    },
  ]
})

// 评分颜色
const scoreColor = (score) => {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

// 评分背景色
const scoreBgColor = (score) => {
  if (score >= 80) return 'bg-emerald-100'
  if (score >= 60) return 'bg-amber-100'
  return 'bg-red-100'
}

// 仪表盘颜色
const gaugeColor = (score) => {
  if (score >= 80) return 'emerald'
  if (score >= 60) return 'amber'
  return 'red'
}

// 加载数据
const loadData = () => {
  summaryStore.fetchIndicators({ period: periodMode.value })
}

watch(periodMode, () => {
  loadData()
})

onMounted(() => {
  loadData()
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
