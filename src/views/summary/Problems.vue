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
      <el-button type="primary" class="mt-4" @click="loadData">重新加载</el-button>
    </div>

    <!-- 内容区域 -->
    <template v-else>
      <!-- KPI 指标卡片（5列） -->
      <KpiCardGrid :columns="5" compact>
        <KpiCard
          :icon="'DataAnalysis'"
          label="总问题数"
          :value="kpiData.total"
          colorScheme="slate"
          compact
        />
        <KpiCard
          :icon="'WarnTriangleFilled'"
          label="待处理"
          :value="kpiData.pending"
          colorScheme="red"
          compact
        />
        <KpiCard
          :icon="'Clock'"
          label="处理中"
          :value="kpiData.inProgress"
          colorScheme="amber"
          compact
        />
        <KpiCard
          :icon="'CircleCheck'"
          label="已处理"
          :value="kpiData.resolved"
          colorScheme="emerald"
          :trend="overallResolutionRate"
          compact
        />
        <KpiCard
          :icon="'Warning'"
          label="高优先级"
          :value="kpiData.highPriority"
          colorScheme="red"
          compact
        />
      </KpiCardGrid>

      <!-- 图表行：趋势图 + 优先级饼图 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 问题趋势图 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">问题趋势图</h3>
          <div v-if="trendData.length === 0" class="h-80 flex items-center justify-center text-gray-400">
            暂无趋势数据
          </div>
          <div v-else class="h-80">
            <!-- 简化柱状图展示 -->
            <div class="flex items-end justify-around h-full gap-1">
              <div
                v-for="(item, index) in trendData"
                :key="index"
                class="flex flex-col items-center flex-1 max-w-[40px]"
              >
                <div class="w-full flex flex-col gap-0.5">
                  <div
                    class="w-full bg-red-500 rounded-t"
                    :style="{ height: `${(item.total / maxTrendValue) * 120}px`, minHeight: '4px' }"
                    :title="`问题总数: ${item.total}`"
                  />
                  <div
                    class="w-full bg-emerald-500 rounded-t"
                    :style="{ height: `${(item.resolved / maxTrendValue) * 120}px`, minHeight: '4px' }"
                    :title="`已处理: ${item.resolved}`"
                  />
                </div>
                <span class="text-xs text-gray-500 mt-1 truncate">{{ item.date }}</span>
              </div>
            </div>
          </div>
          <!-- 图例 -->
          <div class="flex items-center justify-center gap-6 mt-4">
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-full bg-red-500" />
              <span class="text-xs text-gray-500">问题总数</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-full bg-emerald-500" />
              <span class="text-xs text-gray-500">已处理</span>
            </div>
          </div>
        </div>

        <!-- 优先级分布饼图 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">优先级分布</h3>
          <div v-if="priorityPieData.length === 0" class="h-80 flex items-center justify-center text-gray-400">
            暂无分类数据
          </div>
          <div v-else class="h-80 flex items-center justify-center">
            <div class="flex items-center gap-8">
              <!-- 饼图占位 -->
              <div class="relative">
                <el-icon :size="140"><PieChart /></el-icon>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-lg font-bold text-gray-800">{{ kpiData.total }}</div>
                    <div class="text-xs text-gray-400">总计</div>
                  </div>
                </div>
              </div>
              <!-- 图例 -->
              <div class="flex flex-col gap-3">
                <div v-for="item in priorityPieData" :key="item.name" class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: item.color }" />
                  <span class="text-sm text-gray-600">{{ item.name }}</span>
                  <span class="text-sm font-medium text-gray-800">{{ item.value }}个</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部行：月度分布 + 高优先级预警 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 月度问题分布 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">月度问题分布</h3>
          <div v-if="monthlyData.length === 0" class="h-80 flex items-center justify-center text-gray-400">
            暂无月度数据
          </div>
          <div v-else class="space-y-3">
            <div v-for="item in monthlyData" :key="item.month" class="flex items-center gap-4">
              <span class="text-sm text-gray-600 w-16">{{ item.month }}</span>
              <div class="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-red-500 rounded-full"
                  :style="{ width: `${(item.total / maxMonthlyValue) * 100}%` }"
                />
              </div>
              <span class="text-sm text-gray-700 w-16 text-right">{{ item.total }}个</span>
            </div>
          </div>
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
          <div v-else class="space-y-3 max-h-80 overflow-y-auto">
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Warning, Clock, CircleCheck, WarnTriangleFilled, DataAnalysis, PieChart } from '@element-plus/icons-vue'
import { PageHeader, KpiCard, KpiCardGrid, AlertCard, SummaryDateFilter } from '@/components/summary'
import { useSummaryStore } from '@/stores/modules/summary'

// 颜色常量
const COLORS = {
  red: '#ef4444',
  amber: '#f59e0b',
  emerald: '#10b981',
  slate: '#64748b',
  blue: '#3b82f6',
}

const summaryStore = useSummaryStore()

// 日期筛选状态
const filterMode = ref('year')
const startDate = ref('')
const endDate = ref('')

const problemItems = computed(() => summaryStore.problemItems)
const isLoading = computed(() => summaryStore.isLoading)

// KPI 汇总指标
const kpiData = computed(() => {
  if (!problemItems.value.length) {
    return { total, pending, inProgress, resolved, highPriority: 0 }
  }
  return {
    total: problemItems.value.reduce((s, i) => s + i.total, 0),
    pending: problemItems.value.reduce((s, i) => s + i.pending, 0),
    inProgress: problemItems.value.reduce((s, i) => s + i.inProgress, 0),
    resolved: problemItems.value.reduce((s, i) => s + i.resolved, 0),
    highPriority: problemItems.value.reduce((s, i) => s + i.highPriority, 0),
  }
})

// 总体解决率
const overallResolutionRate = computed(() => {
  return kpiData.value.total > 0
    ? Math.round((kpiData.value.resolved / kpiData.value.total) * 100)
    : 0
})

// 趋势图数据
const trendData = computed(() => {
  return problemItems.value
    .slice(-14)
    .map((item) => ({
      date: item.date?.substring(5) || item.date,
      total: item.total,
      resolved: item.resolved,
    }))
})

const maxTrendValue = computed(() => {
  if (trendData.value.length === 0) return 1
  return Math.max(...trendData.value.map((d) => d.total), 1)
})

// 优先级分布
const priorityPieData = computed(() => {
  const highTotal = problemItems.value.reduce((s, i) => s + i.highPriority, 0)
  const mediumTotal = problemItems.value.reduce((s, i) => s + i.mediumPriority, 0)
  const lowTotal = problemItems.value.reduce((s, i) => s + i.lowPriority, 0)
  return [
    { name: '高优先级', value, color: COLORS.red },
    { name: '中优先级', value, color: COLORS.amber },
    { name: '低优先级', value, color: COLORS.slate },
  ].filter((d) => d.value > 0)
})

// 月度数据
const monthlyData = computed(() => {
  const groups = {}
  problemItems.value.forEach((item) => {
    const m = item.month || item.date?.substring(0, 7) || '未知'
    if (!groups[m]) {
      groups[m] = { month, total: 0 }
    }
    groups[m].total += item.total
  })
  return Object.values(groups)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
})

const maxMonthlyValue = computed(() => {
  if (monthlyData.value.length === 0) return 1
  return Math.max(...monthlyData.value.map((d) => d.total), 1)
})

// 高优先级预警
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

// 加载数据
const loadData = () => {
  summaryStore.fetchProblems({ startDate: startDate.value, endDate: endDate.value })
}

// 日期变更
const handleDateChange = (mode, start, end) => {
  startDate.value = start
  endDate.value = end
  loadData()
}

// 初始化
onMounted(() => {
  // 设置默认日期范围
  const now = new Date()
  const year = now.getFullYear()
  startDate.value = `${year}-01-01`
  endDate.value = `${year}-12-31`
  loadData()
})

watch(filterMode, (mode) => {
  if (mode !== 'custom') {
    const range = getDateRange(mode)
    startDate.value = range.start
    endDate.value = range.end
    loadData()
  }
})

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
</script>
