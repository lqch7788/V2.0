<template>
  <!-- 汇总看板页面 - 生产汇总表总览 -->
  <div class="space-y-6 p-6 rounded-xl">
    <!-- 页面头部 + 日期筛选 -->
    <PageHeader
      title="汇总看板"
      description="生产汇总表总览，展示所有核心 KPI 指标和趋势"
    >
      <template #icon>
        <el-icon :size="24" color="white"><DataAnalysis /></el-icon>
      </template>
    </PageHeader>

    <!-- 日期筛选 -->
    <div class="flex justify-start">
      <SummaryDateFilter
        v-model:mode="filterMode"
        v-model:startDate="startDate"
        v-model:endDate="endDate"
        @change="handleDateChange"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading && !overview" class="flex items-center justify-center h-64">
      <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
    </div>

    <!-- 内容区域 -->
    <template v-else>
      <!-- 6 个核心 KPI 卡片 -->
      <KpiCardGrid :columns="6" compact>
        <KpiCard
          :icon="Sprout"
          label="活跃批次"
          :value="activeBatches"
          colorScheme="purple"
          compact
          @click="navigateTo('/summary/batch')"
        />
        <KpiCard
          :icon="TrendingUp"
          label="月产量 (kg)"
          :value="monthYield.toLocaleString()"
          colorScheme="emerald"
          compact
          @click="navigateTo('/summary/yield')"
        />
        <KpiCard
          :icon="DollarSign"
          label="月产值 (元)"
          :value="`¥${monthAmount.toLocaleString()}`"
          colorScheme="emerald"
          compact
          @click="navigateTo('/summary/yield')"
        />
        <KpiCard
          :icon="CheckCircle2"
          label="任务完成率"
          :value="`${completionRate}%`"
          :trend="completionRate >= 50 ? completionRate - 50 : completionRate - 50"
          colorScheme="blue"
          compact
          @click="navigateTo('/summary/indicators')"
        />
        <KpiCard
          :icon="Clock"
          label="总工时 (h)"
          :value="totalHours.toLocaleString()"
          colorScheme="blue"
          compact
          @click="navigateTo('/summary/labor')"
        />
        <KpiCard
          :icon="DollarSign"
          label="总成本 (元)"
          :value="`¥${totalCost.toLocaleString()}`"
          colorScheme="amber"
          compact
          @click="navigateTo('/summary/cost')"
        />
      </KpiCardGrid>

      <!-- 中间双列布局：温室快照 + 产量趋势 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 温室快照 -->
        <CardWrapper title="温室快照" icon="LocationInformation">
          <template #icon>
            <el-icon :size="14" color="#059669"><LocationInformation /></el-icon>
          </template>
          <div v-if="batchItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <el-icon :size="40" class="opacity-30"><Box /></el-icon>
            <span class="text-sm mt-2">暂无温室数据</span>
          </div>
          <div v-else class="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
            <div
              v-for="batch in batchItems.slice(0, 10)"
              :key="batch.id"
              class="flex-shrink-0 w-56 bg-white rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-shadow cursor-pointer"
              @click="navigateTo('/summary/batch')"
            >
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center">
                  <el-icon :size="14" color="#059669"><Location /></el-icon>
                </div>
                <span class="text-sm font-semibold text-gray-800 truncate" :title="batch.greenhouse || batch.batchName">
                  {{ batch.greenhouse || batch.batchName || batch.batchCode }}
                </span>
              </div>
              <div class="text-xs text-gray-500 mb-3">
                <span>{{ batch.cropName }}</span>
                <span v-if="batch.variety" class="text-gray-300 ml-1">·{{ batch.variety }}</span>
              </div>
              <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  :class="[
                    'h-full rounded-full',
                    batch.completionRate >= 100 ? 'bg-emerald-500' :
                    batch.completionRate >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                  ]"
                  :style="{ width: `${Math.min(batch.completionRate, 100)}%` }"
                />
              </div>
              <div class="flex items-center justify-between text-xs">
                <span :class="STATUS_COLOR[batch.status] || 'text-gray-400'">
                  {{ STATUS_LABEL[batch.status] || batch.status || '-' }}
                </span>
                <span class="text-gray-400">{{ batch.completionRate }}%</span>
              </div>
            </div>
          </div>
        </CardWrapper>

        <!-- 产量趋势柱状图 -->
        <CardWrapper title="产量趋势" icon="DataAnalysis">
          <template #icon>
            <el-icon :size="14" color="#3b82f6"><DataAnalysis /></el-icon>
          </template>
          <div class="h-56">
            <div v-if="yieldChartData.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
              <el-icon :size="40" class="opacity-30"><Histogram /></el-icon>
              <span class="text-sm mt-2">暂无图表数据</span>
            </div>
            <div v-else ref="yieldChartRef" class="w-full h-full"></div>
          </div>
        </CardWrapper>
      </div>

      <!-- 下半部分双列：成本构成 + 批次进度 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 成本构成饼图 -->
        <CardWrapper title="成本构成" icon="PieChart">
          <template #icon>
            <el-icon :size="14" color="#f59e0b"><PieChart /></el-icon>
          </template>
          <div class="h-56">
            <div v-if="costPieData.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
              <el-icon :size="40" class="opacity-30"><PieChart /></el-icon>
              <span class="text-sm mt-2">暂无图表数据</span>
            </div>
            <div v-else ref="costChartRef" class="w-full h-full"></div>
          </div>
          <!-- 图例 -->
          <div v-if="costPieData.length > 0" class="flex items-center justify-center gap-6 mt-3">
            <div v-for="item in costPieData" :key="item.name" class="flex items-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.fill }" />
              <span class="text-xs text-gray-500">{{ item.name }}</span>
            </div>
          </div>
        </CardWrapper>

        <!-- 批次进度 Top5 -->
        <CardWrapper title="批次进度" icon="Grid">
          <template #icon>
            <el-icon :size="14" color="#8b5cf6"><Grid /></el-icon>
          </template>
          <div v-if="topBatches.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <el-icon :size="40" class="opacity-30"><Box /></el-icon>
            <span class="text-sm mt-2">暂无批次数据</span>
          </div>
          <div v-else class="space-y-3">
            <div v-for="batch in topBatches" :key="batch.id" class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-xs font-medium text-gray-600 truncate max-w-[120px]" :title="batch.batchName || batch.batchCode">
                    {{ batch.batchName || batch.batchCode }}
                  </span>
                  <span class="text-xs text-gray-400">|</span>
                  <span class="text-xs text-gray-500 truncate">{{ batch.cropName }}</span>
                </div>
                <span class="text-xs font-semibold text-gray-700 flex-shrink-0 ml-2">
                  {{ batch.completionRate }}%
                </span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    batch.completionRate >= 100 ? 'bg-emerald-500' :
                    batch.completionRate >= 60 ? 'bg-blue-500' :
                    batch.completionRate >= 30 ? 'bg-amber-500' : 'bg-red-400'
                  ]"
                  :style="{ width: `${Math.min(batch.completionRate, 100)}%` }"
                />
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span>{{ batch.greenhouse || '-' }}</span>
                <span>|</span>
                <span :class="STATUS_COLOR[batch.status] || 'text-gray-400'">
                  {{ STATUS_LABEL[batch.status] || batch.status || '-' }}
                </span>
              </div>
            </div>
          </div>
        </CardWrapper>
      </div>

      <!-- 生产预警 + 最近批次状态 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 生产预警列表 -->
        <CardWrapper title="生产预警" icon="Warning">
          <template #icon>
            <el-icon :size="14" color="#dc2626"><Warning /></el-icon>
          </template>
          <div v-if="alerts.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <el-icon :size="40" class="opacity-30"><Box /></el-icon>
            <span class="text-sm mt-2">暂无预警信息</span>
          </div>
          <div v-else class="space-y-3">
            <AlertCard
              v-for="(alert, index) in alerts"
              :key="index"
              :title="alert.title"
              :description="alert.description"
              :severity="alert.severity"
            />
          </div>
        </CardWrapper>

        <!-- 最近批次 -->
        <CardWrapper title="最近批次" icon="Box">
          <template #icon>
            <el-icon :size="14" color="#64748b"><Box /></el-icon>
          </template>
          <div v-if="batchItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <el-icon :size="40" class="opacity-30"><Box /></el-icon>
            <span class="text-sm mt-2">暂无批次数据</span>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="batch in batchItems.slice(0, 6)"
              :key="batch.id"
              class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              @click="navigateTo('/summary/batch')"
            >
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-700 truncate">
                  {{ batch.batchName || batch.batchCode }}
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span>{{ batch.cropName }}</span>
                  <span>|</span>
                  <span>{{ batch.greenhouse }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0 ml-3">
                <span
                  :class="['text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[batch.status] || 'bg-gray-100 text-gray-500']"
                >
                  {{ STATUS_LABEL[batch.status] || batch.status || '-' }}
                </span>
                <el-icon :size="16" color="#d1d5db"><DArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </CardWrapper>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  DataAnalysis, Loading, Box, TrendCharts, Money, CircleCheckFilled, Clock,
  LocationInformation, Histogram, PieChart, Grid, Warning, CircleCheck, DArrowRight, Location
} from '@element-plus/icons-vue'
import { Sprout, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-vue-next'
import * as echarts from 'echarts'
import { PageHeader, KpiCard, KpiCardGrid, AlertCard, SummaryDateFilter } from '@/components/summary'
import { useSummaryStore } from '@/stores/modules/summary'

// ========== 卡片包装组件 ==========
const CardWrapper = defineComponent({
  name: 'CardWrapper',
  props: {
    title: String,
    icon: [String, Object],
  },
  setup(props, { slots }) {
    return () => h('div', { class: 'bg-white rounded-xl shadow-sm border border-gray-100 p-5' }, [
      h('div', { class: 'flex items-center gap-2 mb-4' }, [
        h('div', { class: 'w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center' }, [
          slots.icon ? slots.icon() : props.icon ? h(props.icon, { size: 14 }) : null
        ]),
        h('h3', { class: 'text-sm font-semibold text-gray-800' }, props.title)
      ]),
      slots.default?.()
    ])
  }
})

// ========== 批次状态中文映射 ==========
const STATUS_LABEL = {
  draft: '草稿',
  planning: '规划中',
  published: '已发布',
  in_progress: '进行中',
  completed: '已完成',
  overdue: '已逾期',
}

const STATUS_COLOR = {
  draft: 'text-gray-400',
  planning: 'text-gray-500',
  published: 'text-blue-400',
  in_progress: 'text-blue-500',
  completed: 'text-emerald-500',
  overdue: 'text-red-500',
}

const STATUS_BADGE = {
  draft: 'bg-gray-100 text-gray-500',
  planning: 'bg-gray-100 text-gray-600',
  published: 'bg-blue-50 text-blue-500',
  in_progress: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  overdue: 'bg-red-50 text-red-600',
}

// ========== 页面组件 ==========
const router = useRouter()
const summaryStore = useSummaryStore()

// Store 数据
const overview = computed(() => summaryStore.overview)
const yieldItems = computed(() => summaryStore.yieldItems)
const costSummary = computed(() => summaryStore.costSummary)
const batchItems = computed(() => summaryStore.batchItems)
const isLoading = computed(() => summaryStore.isLoading)

// 日期筛选状态
const filterMode = ref('month')
const startDate = ref('')
const endDate = ref('')

// KPI 值计算
const activeBatches = computed(() => overview.value?.batch?.activeCount ?? 0)
const monthYield = computed(() => overview.value?.yield?.monthTotalYield ?? 0)
const monthAmount = computed(() => overview.value?.yield?.monthTotalAmount ?? 0)
const completionRate = computed(() => overview.value?.task?.completionRate ?? 0)
const totalHours = computed(() => overview.value?.labor?.totalHours ?? 0)
const totalCost = computed(() => overview.value?.totalCost ?? 0)

// Top5 批次（按完成率排序）
const topBatches = computed(() => {
  return [...batchItems.value]
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5)
})

// 产量图表数据
const yieldChartData = computed(() => {
  return yieldItems.value.map((item) => ({
    name: item.name,
    产量: item.value,
  }))
})

// 成本饼图数据
const costPieData = computed(() => {
  if (!costSummary.value) return []
  return [
    { name: '人工成本', value: costSummary.value.totalLaborCost, fill: '#10b981' },
    { name: '物料成本', value: costSummary.value.totalMaterialCost, fill: '#3b82f6' },
    { name: '能源成本', value: costSummary.value.totalEnergyCost, fill: '#f59e0b' },
  ].filter((d) => d.value > 0)
})

// 预警列表
const alerts = computed(() => {
  const result = []
  if (!overview.value) return result

  // 任务完成率预警
  const taskStatus = summaryStore.getTaskStatus(overview.value.task.completionRate)
  if (taskStatus === 'critical') {
    result.push({
      title: '任务完成率严重偏低',
      description: `当前完成率 ${overview.value.task.completionRate}%，未完成任务 ${overview.value.task.totalTasks - overview.value.task.completedTasks} 个`,
      severity: 'critical',
    })
  } else if (taskStatus === 'warning') {
    result.push({
      title: '任务完成率偏低',
      description: `当前完成率 ${overview.value.task.completionRate}%，建议加快任务执行进度`,
      severity: 'warning',
    })
  }

  // 问题解决率预警
  if (overview.value.problem.totalProblems > 0 && overview.value.problem.resolutionRate < 60) {
    result.push({
      title: '问题堆积：解决率不足',
      description: `当前解决率 ${overview.value.problem.resolutionRate}%，仍有 ${overview.value.problem.totalProblems - overview.value.problem.resolvedProblems} 个问题待解决`,
      severity: 'critical',
    })
  } else if (overview.value.problem.totalProblems > 0 && overview.value.problem.resolutionRate < 80) {
    result.push({
      title: '问题解决进度偏慢',
      description: `当前解决率 ${overview.value.problem.resolutionRate}%，建议加强问题跟踪处理`,
      severity: 'warning',
    })
  }

  return result
})

// 导航
const navigateTo = (path) => {
  router.push(path)
}

// 日期变更处理 - 同步状态，数据获取由 watch 监听触发（避免重复获取）
// SummaryDateFilter emit顺序: ('change', mode, startDate, endDate)
const handleDateChange = (mode, start, end) => {
  // 只在值确实变化时才更新，避免 watch 重复触发
  if (mode !== undefined && mode !== filterMode.value) {
    filterMode.value = mode
  }
  if (start !== undefined && start !== startDate.value) {
    startDate.value = start || ''
  }
  if (end !== undefined && end !== endDate.value) {
    endDate.value = end || ''
  }
}

// 监听日期状态变化，当日期变化时重新获取数据（与 V1.1 useEffect 逻辑一致）
watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    summaryStore.fetchYieldStats({ start_date: newStart, end_date: newEnd })
    summaryStore.fetchCostStats({ start_date: newStart, end_date: newEnd })
    summaryStore.fetchBatchStats({})
  }
}, { immediate: false })

// ========== ECharts 图表 ==========
const yieldChartRef = ref()
const costChartRef = ref()
let yieldChartInstance = null
let costChartInstance = null

// 初始化产量趋势柱状图
const initYieldChart = () => {
  if (!yieldChartRef.value || yieldChartData.value.length === 0) return

  if (yieldChartInstance) {
    yieldChartInstance.dispose()
  }

  yieldChartInstance = echarts.init(yieldChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      formatter: (params) => {
        const item = params[0]
        return `${item.name}<br/><strong>${item.value} kg</strong>`
      }
    },
    grid: {
      top: 10,
      right: 10,
      left: 0,
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: yieldChartData.value.map(d => d.name),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#9ca3af' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      type: 'bar',
      data: yieldChartData.value.map(d => d.产量),
      barSize: 28,
      itemStyle: {
        color: '#10b981',
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }

  yieldChartInstance.setOption(option)
}

// 初始化成本构成饼图
const initCostChart = () => {
  if (!costChartRef.value || costPieData.value.length === 0) return

  if (costChartInstance) {
    costChartInstance.dispose()
  }

  costChartInstance = echarts.init(costChartRef.value)

  const total = costPieData.value.reduce((sum, d) => sum + d.value, 0)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      formatter: (params) => {
        const percent = ((params.value / total) * 100).toFixed(1)
        return `${params.name}<br/>${percent}% (¥${params.value.toLocaleString()})`
      }
    },
    series: [{
      type: 'pie',
      radius: ['52px', '80px'],
      center: ['50%', '50%'],
      padding: 3,
      data: costPieData.value.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: d.fill }
      }))
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: 'center',
      style: {
        text: `¥${(total / 10000).toFixed(1)}万`,
        textAlign: 'center',
        fill: '#374151',
        fontSize: 18,
        fontWeight: 'bold'
      }
    }, {
      type: 'text',
      left: 'center',
      top: 26,
      style: {
        text: '总成本',
        textAlign: 'center',
        fill: '#9ca3af',
        fontSize: 12
      }
    }]
  }

  costChartInstance.setOption(option)
}

// 监听数据变化更新图表
watch([yieldChartData, costPieData], () => {
  nextTick(() => {
    if (yieldChartData.value.length > 0) {
      initYieldChart()
    }
    if (costPieData.value.length > 0) {
      initCostChart()
    }
  })
}, { deep: true })

// 窗口大小变化时重绘图表
const handleResize = () => {
  yieldChartInstance?.resize()
  costChartInstance?.resize()
}

// 初始化
onMounted(() => {
  if (summaryStore.isCacheStale('overview', 5 * 60 * 1000)) {
    summaryStore.fetchAll()
  }

  nextTick(() => {
    if (yieldChartData.value.length > 0) {
      initYieldChart()
    }
    if (costPieData.value.length > 0) {
      initCostChart()
    }
  })

  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  yieldChartInstance?.dispose()
  costChartInstance?.dispose()
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
</style>
