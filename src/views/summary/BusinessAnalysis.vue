<template>
  <!-- 经营分析页面 - 产量分析/成本分析/人工分析/多维度对比 四合一 TAB页 -->
  <div class="space-y-4">
    <PageHeader
      title="经营分析"
      description="产量·成本·人工·多维度对比，四位一体把控种植经营"
    >
      <template #icon>
        <el-icon :size="24" color="white"><DataAnalysis /></el-icon>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane name="yield">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><TrendCharts /></el-icon>
              产量分析
            </span>
          </template>
          <YieldAnalysis v-if="activeTab === 'yield'" :hide-header="true" />
        </el-tab-pane>

        <el-tab-pane name="cost">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><Money /></el-icon>
              成本分析
            </span>
          </template>
          <CostAnalysis v-if="activeTab === 'cost'" :hide-header="true" />
        </el-tab-pane>

        <el-tab-pane name="labor">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><User /></el-icon>
              人工分析
            </span>
          </template>
          <LaborAnalysis v-if="activeTab === 'labor'" :hide-header="true" />
        </el-tab-pane>

        <el-tab-pane name="comparison">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><Connection /></el-icon>
              多维度对比
            </span>
          </template>
          <!-- 多维度对比内容 -->
          <div v-if="activeTab === 'comparison'" class="mt-4 space-y-4">
            <!-- 对比维度选择 -->
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">对比维度：</span>
                  <el-checkbox-group v-model="selectedDimensions">
                    <el-checkbox label="crop">按作物</el-checkbox>
                    <el-checkbox label="greenhouse">按温室</el-checkbox>
                    <el-checkbox label="time">按时段</el-checkbox>
                    <el-checkbox label="labor">按人工</el-checkbox>
                  </el-checkbox-group>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">时间范围：</span>
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    size="small"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">采样粒度：</span>
                  <el-radio-group v-model="sampling" size="small">
                    <el-radio-button label="day">日</el-radio-button>
                    <el-radio-button label="month">月</el-radio-button>
                    <el-radio-button label="year">年</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">图表模式：</span>
                  <el-radio-group v-model="chartMode" size="small">
                    <el-radio-button label="bar">
                      <el-icon :size="14"><DataAnalysis /></el-icon> 柱状图
                    </el-radio-button>
                    <el-radio-button label="line">
                      <el-icon :size="14"><TrendCharts /></el-icon> 折线图
                    </el-radio-button>
                    <el-radio-button label="pie">
                      <el-icon :size="14"><PieChart /></el-icon> 饼图
                    </el-radio-button>
                    <el-radio-button label="table">
                      <el-icon :size="14"><Grid /></el-icon> 表格
                    </el-radio-button>
                  </el-radio-group>
                </div>
                <el-button type="primary" size="small" @click="loadComparisonData">加载数据</el-button>
              </div>
            </div>

            <!-- 对比指标选择 -->
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">对比指标</h4>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.yield" />产量(kg)
                </div>
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.amount" />产值(元)
                </div>
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.cost" />成本(元)
                </div>
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.profit" />利润(元)
                </div>
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.yieldRate" />亩产量(kg/亩)
                </div>
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.laborHours" />工时(h)
                </div>
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.laborCost" />人工成本(元)
                </div>
                <div class="flex items-center gap-2">
                  <el-checkbox v-model="comparisonMetrics.unitPrice" />单价(元/kg)
                </div>
              </div>
            </div>

            <!-- 对比结果表格 -->
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">对比结果</h4>
              <el-table :data="tableData" stripe style="width: 100%">
                <el-table-column v-if="selectedDimensions.includes('crop')" prop="cropName" label="作物" width="100" />
                <el-table-column v-if="selectedDimensions.includes('greenhouse')" prop="greenhouse" label="温室" width="100" />
                <el-table-column v-if="selectedDimensions.includes('time')" prop="period" label="时段" width="120" />
                <el-table-column v-if="selectedDimensions.includes('labor')" prop="worker" label="人工" width="100" />
                <el-table-column v-if="comparisonMetrics.yield" prop="yield" label="产量(kg)" width="120">
                  <template #default="{ row }">
                    {{ row.yield?.toLocaleString() || '--' }}
                  </template>
                </el-table-column>
                <el-table-column v-if="comparisonMetrics.amount" prop="amount" label="产值(元)" width="120">
                  <template #default="{ row }">
                    {{ row.amount ? '¥' + row.amount.toLocaleString() : '--' }}
                  </template>
                </el-table-column>
                <el-table-column v-if="comparisonMetrics.cost" prop="cost" label="成本(元)" width="120">
                  <template #default="{ row }">
                    {{ row.cost ? '¥' + row.cost.toLocaleString() : '--' }}
                  </template>
                </el-table-column>
                <el-table-column v-if="comparisonMetrics.profit" prop="profit" label="利润(元)" width="120">
                  <template #default="{ row }">
                    <span :class="row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'">
                      {{ row.profit ? '¥' + row.profit.toLocaleString() : '--' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column v-if="comparisonMetrics.yieldRate" prop="yieldRate" label="亩产量" width="100">
                  <template #default="{ row }">
                    {{ row.yieldRate ? row.yieldRate + 'kg/亩' : '--' }}
                  </template>
                </el-table-column>
                <el-table-column v-if="comparisonMetrics.laborHours" prop="laborHours" label="工时(h)" width="100">
                  <template #default="{ row }">
                    {{ row.laborHours || '--' }}
                  </template>
                </el-table-column>
                <el-table-column v-if="comparisonMetrics.laborCost" prop="laborCost" label="人工成本" width="120">
                  <template #default="{ row }">
                    {{ row.laborCost ? '¥' + row.laborCost.toLocaleString() : '--' }}
                  </template>
                </el-table-column>
                <el-table-column v-if="comparisonMetrics.unitPrice" prop="unitPrice" label="单价" width="100">
                  <template #default="{ row }">
                    {{ row.unitPrice ? '¥' + row.unitPrice + '/kg' : '--' }}
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 对比图表 -->
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">可视化对比</h4>
              <div v-if="isLoadingComparison" class="flex items-center justify-center h-64">
                <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
              </div>
              <div v-else-if="processedChartData.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
                <el-icon :size="48"><Histogram /></el-icon>
                <span class="text-sm mt-2">暂无对比数据</span>
              </div>
              <!-- 柱状图/折线图模式 -->
              <div v-else-if="chartMode === 'bar' || chartMode === 'line'" class="grid grid-cols-2 gap-4">
                <!-- 产量对比 -->
                <div v-if="comparisonMetrics.yield" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">产量对比 (kg)</p>
                  <div ref="yieldChartRef" class="h-48"></div>
                </div>

                <!-- 产值对比 -->
                <div v-if="comparisonMetrics.amount" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">产值对比 (元)</p>
                  <div ref="amountChartRef" class="h-48"></div>
                </div>

                <!-- 成本对比 -->
                <div v-if="comparisonMetrics.cost" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">成本对比 (元)</p>
                  <div ref="costChartRef" class="h-48"></div>
                </div>

                <!-- 利润对比 -->
                <div v-if="comparisonMetrics.profit" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">利润对比 (元)</p>
                  <div ref="profitChartRef" class="h-48"></div>
                </div>

                <!-- 亩产量对比 -->
                <div v-if="comparisonMetrics.yieldRate" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">亩产量对比 (kg/亩)</p>
                  <div ref="yieldRateChartRef" class="h-48"></div>
                </div>

                <!-- 工时对比 -->
                <div v-if="comparisonMetrics.laborHours" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">工时对比 (h)</p>
                  <div ref="laborHoursChartRef" class="h-48"></div>
                </div>

                <!-- 人工成本对比 -->
                <div v-if="comparisonMetrics.laborCost" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">人工成本对比 (元)</p>
                  <div ref="laborCostChartRef" class="h-48"></div>
                </div>

                <!-- 单价对比 -->
                <div v-if="comparisonMetrics.unitPrice" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">单价对比 (元/kg)</p>
                  <div ref="unitPriceChartRef" class="h-48"></div>
                </div>
              </div>

              <!-- 饼图模式 -->
              <div v-else-if="chartMode === 'pie'" class="grid grid-cols-4 gap-4">
                <div v-if="comparisonMetrics.yield" class="h-64">
                  <p class="text-xs text-gray-500 mb-2 text-center">产量分布</p>
                  <div ref="yieldPieChartRef" class="h-48"></div>
                </div>
                <div v-if="comparisonMetrics.amount" class="h-64">
                  <p class="text-xs text-gray-500 mb-2 text-center">产值分布</p>
                  <div ref="amountPieChartRef" class="h-48"></div>
                </div>
                <div v-if="comparisonMetrics.cost" class="h-64">
                  <p class="text-xs text-gray-500 mb-2 text-center">成本分布</p>
                  <div ref="costPieChartRef" class="h-48"></div>
                </div>
                <div v-if="comparisonMetrics.profit" class="h-64">
                  <p class="text-xs text-gray-500 mb-2 text-center">利润分布</p>
                  <div ref="profitPieChartRef" class="h-48"></div>
                </div>
              </div>

              <!-- 表格模式 -->
              <div v-else-if="chartMode === 'table'" class="overflow-x-auto">
                <el-table :data="processedChartData" stripe style="width: 100%">
                  <el-table-column prop="cropName" label="作物" width="100" />
                  <el-table-column prop="greenhouse" label="温室" width="120" />
                  <el-table-column prop="period" label="时段" width="120" />
                  <el-table-column prop="worker" label="人工" width="100" />
                  <el-table-column v-if="comparisonMetrics.yield" prop="yield" label="产量(kg)" width="120">
                    <template #default="{ row }">{{ row.yield?.toLocaleString() || '--' }}</template>
                  </el-table-column>
                  <el-table-column v-if="comparisonMetrics.amount" prop="amount" label="产值(元)" width="120">
                    <template #default="{ row }">{{ row.amount ? '¥' + row.amount.toLocaleString() : '--' }}</template>
                  </el-table-column>
                  <el-table-column v-if="comparisonMetrics.cost" prop="cost" label="成本(元)" width="120">
                    <template #default="{ row }">{{ row.cost ? '¥' + row.cost.toLocaleString() : '--' }}</template>
                  </el-table-column>
                  <el-table-column v-if="comparisonMetrics.profit" prop="profit" label="利润(元)" width="120">
                    <template #default="{ row }">
                      <span :class="row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'">
                        {{ row.profit ? '¥' + row.profit.toLocaleString() : '--' }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 导出按钮 -->
            <div class="flex justify-end gap-2">
              <el-button @click="handleExport">导出对比报告</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { DataAnalysis, TrendCharts, Money, User, Connection, Loading, Histogram, PieChart as PieChartIcon, Grid } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useSummaryStore } from '@/stores/modules/summary'

// 子组件
import YieldAnalysis from './sub/YieldAnalysis.vue'
import CostAnalysis from './sub/CostAnalysis.vue'
import LaborAnalysis from './sub/LaborAnalysis.vue'

// 共享组件
import { PageHeader } from '@/components/summary'

const summaryStore = useSummaryStore()
const activeTab = ref('yield')

// Tab切换处理
const handleTabChange = (tab) => {
  // 切换到多维度对比Tab时自动加载数据
  if (tab === 'comparison' && rawComparisonData.value.length === 0) {
    loadComparisonData()
  }
}

// 监听 Tab 切换（用于handleTabChange未触发的场景）
watch(activeTab, (newTab) => {
  if (newTab === 'comparison' && rawComparisonData.value.length === 0) {
    loadComparisonData()
  }
})

// 多维度对比相关状态
const selectedDimensions = ref(['crop'])
const dateRange = ref([])
const sampling = ref('month')
const chartMode = ref('bar')

// 图表 Refs
const yieldChartRef = ref()
const amountChartRef = ref()
const costChartRef = ref()
const profitChartRef = ref()
const yieldRateChartRef = ref()
const laborHoursChartRef = ref()
const laborCostChartRef = ref()
const unitPriceChartRef = ref()
const yieldPieChartRef = ref()
const amountPieChartRef = ref()
const costPieChartRef = ref()
const profitPieChartRef = ref()

// 图表实例
const chartInstances = {}
const comparisonMetrics = ref({
  yield: true,
  amount: true,
  cost: true,
  profit: true,
  yieldRate: false,
  laborHours: false,
  laborCost: false,
  unitPrice: false
})
const isLoadingComparison = computed(() => summaryStore.comparisonLoading)

// 对比数据 - 从 Store 获取（与V1.1逻辑完全一致）
const rawComparisonData = computed(() => {
  const data = summaryStore.comparisonData
  if (!data || !Array.isArray(data)) return []
  // 规范化数据（snake_case → camelCase）
  return data.map(item => ({
    cropName: item.cropName || item.crop_name || '',
    greenhouse: item.greenhouse || item.greenhouse_name || '',
    period: item.period || item.month || '',
    worker: item.worker || item.worker_name || '',
    yield: Number(item.yield || item.total_yield || 0),
    amount: Number(item.amount || item.total_amount || 0),
    cost: Number(item.cost || item.total_cost || 0),
    profit: Number(item.profit || 0),
    yieldRate: Number(item.yieldRate || item.yield_rate || 0),
    laborHours: Number(item.laborHours || item.labor_hours || 0),
    laborCost: Number(item.laborCost || item.labor_cost || 0),
    unitPrice: Number(item.unitPrice || item.unit_price || 0)
  }))
})

// 图表数据计算 - 根据选中维度动态汇总
const chartData = computed(() => {
  if (!rawComparisonData.value.length) return []

  // 根据选中的维度进行汇总
  const dimension = selectedDimensions.value[0] || 'crop'
  const aggregated = {}

  rawComparisonData.value.forEach(item => {
    let key = ''
    if (dimension === 'crop') key = item.cropName || '未知作物'
    else if (dimension === 'greenhouse') key = item.greenhouse || '未知温室'
    else if (dimension === 'time') key = item.period || item.month || '未知时段'
    else if (dimension === 'labor') key = item.worker || '未知人工'

    if (!aggregated[key]) {
      aggregated[key] = {
        cropName: item.cropName,
        greenhouse: item.greenhouse,
        period: item.period || item.month,
        worker: item.worker,
        yield: 0,
        amount: 0,
        cost: 0,
        profit: 0,
        yieldRate: 0,
        laborHours: 0,
        laborCost: 0,
        unitPrice: 0,
        count: 0
      }
    }

    // 累加各项指标
    aggregated[key].yield += Number(item.yield) || 0
    aggregated[key].amount += Number(item.amount) || 0
    aggregated[key].cost += Number(item.cost) || 0
    aggregated[key].profit += Number(item.profit) || 0
    aggregated[key].yieldRate += Number(item.yieldRate) || 0
    aggregated[key].laborHours += Number(item.laborHours) || 0
    aggregated[key].laborCost += Number(item.laborCost) || 0
    aggregated[key].unitPrice += Number(item.unitPrice) || 0
    aggregated[key].count++
  })

  // 计算平均值
  return Object.values(aggregated).map(item => ({
    ...item,
    yieldRate: item.count > 0 ? Math.round(item.yieldRate / item.count) : 0,
    unitPrice: item.count > 0 ? Math.round((item.unitPrice / item.count) * 100) / 100 : 0
  }))
})

// 图表数据最终处理（直接使用chartData的值，不做重复平均）
const processedChartData = computed(() => {
  return chartData.value.map(item => ({
    ...item,
    // yieldRate和unitPrice在chartData中已经是平均值，直接使用
    yieldRate: item.yieldRate,
    unitPrice: item.unitPrice
  }))
})

// 计算最大值
const maxYieldValue = computed(() => Math.max(...processedChartData.value.map(d => d.yield || 0), 1))
const maxCostValue = computed(() => Math.max(...processedChartData.value.map(d => d.cost || 0), 1))
const maxProfitValue = computed(() => Math.max(...processedChartData.value.map(d => Math.abs(d.profit || 0)), 1))
const maxYieldRateValue = computed(() => Math.max(...processedChartData.value.map(d => d.yieldRate || 0), 1))
const maxAmountValue = computed(() => Math.max(...processedChartData.value.map(d => d.amount || 0), 1))
const maxLaborHoursValue = computed(() => Math.max(...processedChartData.value.map(d => d.laborHours || 0), 1))
const maxLaborCostValue = computed(() => Math.max(...processedChartData.value.map(d => d.laborCost || 0), 1))

// 获取图表标签
const getChartLabel = (item) => {
  if (selectedDimensions.value.includes('crop')) return item.cropName || ''
  if (selectedDimensions.value.includes('greenhouse')) return item.greenhouse || ''
  if (selectedDimensions.value.includes('time')) return item.period || item.month || ''
  if (selectedDimensions.value.includes('labor')) return item.worker || ''
  return ''
}

// 表格列计算
const tableColumns = computed(() => {
  const cols = []
  if (selectedDimensions.value.includes('crop')) cols.push({ prop: 'cropName', label: '作物' })
  if (selectedDimensions.value.includes('greenhouse')) cols.push({ prop: 'greenhouse', label: '温室' })
  if (selectedDimensions.value.includes('time')) cols.push({ prop: 'period', label: '时段' })
  if (selectedDimensions.value.includes('labor')) cols.push({ prop: 'worker', label: '人工' })
  return cols
})

// 指标列配置
const metricColumns = computed(() => {
  const cols = []
  if (comparisonMetrics.value.yield) cols.push({ prop: 'yield', label: '产量(kg)', format: v => v?.toLocaleString() || '--' })
  if (comparisonMetrics.value.amount) cols.push({ prop: 'amount', label: '产值(元)', format: v => v != null ? '¥' + v.toLocaleString() : '--' })
  if (comparisonMetrics.value.cost) cols.push({ prop: 'cost', label: '成本(元)', format: v => v != null ? '¥' + v.toLocaleString() : '--' })
  if (comparisonMetrics.value.profit) cols.push({ prop: 'profit', label: '利润(元)', format: v => v != null ? '¥' + v.toLocaleString() : '--', class: v => v >= 0 ? 'text-emerald-600' : 'text-red-600' })
  if (comparisonMetrics.value.yieldRate) cols.push({ prop: 'yieldRate', label: '亩产量', format: v => v ? v + 'kg/亩' : '--' })
  if (comparisonMetrics.value.laborHours) cols.push({ prop: 'laborHours', label: '工时(h)', format: v => v != null ? v + 'h' : '--' })
  if (comparisonMetrics.value.laborCost) cols.push({ prop: 'laborCost', label: '人工成本', format: v => v != null ? '¥' + v.toLocaleString() : '--' })
  if (comparisonMetrics.value.unitPrice) cols.push({ prop: 'unitPrice', label: '单价', format: v => v ? '¥' + v + '/kg' : '--' })
  return cols
})

// 获取表格数据
const tableData = computed(() => {
  return processedChartData.value.map(item => {
    const row = { ...item }
    // 确保数值格式化
    row.yield = item.yield
    row.amount = item.amount
    row.cost = item.cost
    row.profit = item.profit
    row.yieldRate = item.yieldRate
    row.laborHours = item.laborHours
    row.laborCost = item.laborCost
    row.unitPrice = item.unitPrice
    return row
  })
})

// 加载对比数据（通过Store，与V1.1逻辑完全一致）
const loadComparisonData = async () => {
  await summaryStore.fetchComparisonStats({
    mainParam: selectedDimensions.value[0] || 'crop',
    startDate: dateRange.value?.[0] || undefined,
    endDate: dateRange.value?.[1] || undefined,
    sampling: sampling.value,
    dimensions: selectedDimensions.value.join(',')
  })
  nextTick(() => {
    initCharts()
  })
}

// 图表颜色配置
const CHART_COLORS = {
  yield: '#10b981',
  amount: '#f59e0b',
  cost: '#ef4444',
  profit: '#3b82f6',
  yieldRate: '#8b5cf6',
  laborHours: '#06b6d4',
  laborCost: '#f97316',
  unitPrice: '#ec4899'
}

// 获取图表配置
const getBarLineOption = (data, label, color, maxValue) => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    formatter: (params) => {
      const p = params[0]
      return `${p.name}<br/><strong>${label}:</strong> ${p.value?.toLocaleString() || '--'}`
    }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: data.map(d => getChartLabel(d)),
    axisLabel: { fontSize: 10, color: '#9ca3af', rotate: 30 },
    axisLine: { lineStyle: { color: '#e5e7eb' } }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { fontSize: 10, color: '#9ca3af' },
    splitLine: { lineStyle: { color: '#f3f4f6' } }
  },
  series: [{
    type: chartMode.value,
    data: data.map(d => {
      const keyMap = { '产量': 'yield', '产值': 'amount', '成本': 'cost', '利润': 'profit', '亩产量': 'yieldRate', '工时': 'laborHours', '人工成本': 'laborCost', '单价': 'unitPrice' }
      const key = keyMap[label] || 'yield'
      return d[key] || 0
    }),
    itemStyle: {
      color: chartMode.value === 'line' ? color : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: color },
        { offset: 1, color: color + '80' }
      ]),
      borderRadius: chartMode.value === 'bar' ? [4, 4, 0, 0] : 0
    },
    lineStyle: { width: 2 },
    areaStyle: chartMode.value === 'line' ? {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: color + '40' },
        { offset: 1, color: color + '05' }
      ])
    } : undefined,
    symbol: 'circle',
    symbolSize: 4
  }]
})

// 获取饼图配置
const getPieOption = (data, label, color) => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    formatter: (params) => `${params.name}<br/><strong>${params.value?.toLocaleString() || '--'}</strong> (${params.percent}%)`
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '50%'],
    label: { show: true, fontSize: 10, formatter: '{b}: {d}%' },
    data: data.map(d => ({
      name: getChartLabel(d),
      value: d[label] || 0
    })),
    itemStyle: { color: color }
  }]
})

// 初始化所有图表
const initCharts = () => {
  if (chartMode.value === 'table') return
  const data = processedChartData.value
  if (!data.length) return

  // 先清理所有旧图表实例，防止内存泄漏
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].dispose()
      delete chartInstances[key]
    }
  })

  // 柱状图/折线图
  if (chartMode.value === 'bar' || chartMode.value === 'line') {
    const chartConfigs = [
      { ref: yieldChartRef, key: 'yield', label: '产量', color: CHART_COLORS.yield },
      { ref: amountChartRef, key: 'amount', label: '产值', color: CHART_COLORS.amount },
      { ref: costChartRef, key: 'cost', label: '成本', color: CHART_COLORS.cost },
      { ref: profitChartRef, key: 'profit', label: '利润', color: CHART_COLORS.profit },
      { ref: yieldRateChartRef, key: 'yieldRate', label: '亩产量', color: CHART_COLORS.yieldRate },
      { ref: laborHoursChartRef, key: 'laborHours', label: '工时', color: CHART_COLORS.laborHours },
      { ref: laborCostChartRef, key: 'laborCost', label: '人工成本', color: CHART_COLORS.laborCost },
      { ref: unitPriceChartRef, key: 'unitPrice', label: '单价', color: CHART_COLORS.unitPrice }
    ]

    chartConfigs.forEach(cfg => {
      if (!cfg.ref.value) return
      if (!comparisonMetrics.value[cfg.key]) {
        cfg.ref.value.innerHTML = ''
        return
      }
      if (chartInstances[cfg.key]) {
        chartInstances[cfg.key].dispose()
      }
      const chart = echarts.init(cfg.ref.value)
      chartInstances[cfg.key] = chart
      const maxVal = Math.max(...data.map(d => Math.abs(d[cfg.key] || 0)), 1)
      chart.setOption(getBarLineOption(data, cfg.label, cfg.color, maxVal))
    })
  }

  // 饼图
  if (chartMode.value === 'pie') {
    const pieConfigs = [
      { ref: yieldPieChartRef, key: 'yield', color: CHART_COLORS.yield },
      { ref: amountPieChartRef, key: 'amount', color: CHART_COLORS.amount },
      { ref: costPieChartRef, key: 'cost', color: CHART_COLORS.cost },
      { ref: profitPieChartRef, key: 'profit', color: CHART_COLORS.profit }
    ]

    pieConfigs.forEach(cfg => {
      if (!cfg.ref.value) return
      if (!comparisonMetrics.value[cfg.key]) {
        cfg.ref.value.innerHTML = ''
        return
      }
      if (chartInstances[cfg.key + 'Pie']) {
        chartInstances[cfg.key + 'Pie'].dispose()
      }
      const chart = echarts.init(cfg.ref.value)
      chartInstances[cfg.key + 'Pie'] = chart
      chart.setOption(getPieOption(data, cfg.key, cfg.color))
    })
  }
}

// 监听图表模式变化
watch(chartMode, () => {
  nextTick(() => {
    initCharts()
  })
})

// 监听数据变化
watch(processedChartData, () => {
  nextTick(() => {
    initCharts()
  })
}, { deep: true })

// 导出对比报告
const handleExport = () => {
  if (!processedChartData.value.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  try {
    // 构建 CSV 内容
    const headers = ['作物', '温室', '时段', '人工', '产量(kg)', '产值(元)', '成本(元)', '利润(元)', '亩产量(kg/亩)', '工时(h)', '人工成本(元)', '单价(元/kg)']
    const rows = processedChartData.value.map(item => [
      item.cropName || '',
      item.greenhouse || '',
      item.period || '',
      item.worker || '',
      item.yield || 0,
      item.amount || 0,
      item.cost || 0,
      item.profit || 0,
      item.yieldRate || 0,
      item.laborHours || 0,
      item.laborCost || 0,
      item.unitPrice || 0
    ])

    // 添加表头
    rows.unshift(headers)

    // 转换为 CSV 字符串
    const csvContent = rows.map(row =>
      row.map(cell => {
        // 如果包含逗号、引号或换行符，需要用引号包裹
        const cellStr = String(cell)
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"'
        }
        return cellStr
      }).join(',')
    ).join('\n')

    // 添加 BOM 以支持 Excel 打开中文
    const bom = '﻿'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = `多维度对比报告_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (err) {
    console.error('导出失败:', err)
    ElMessage.error('导出失败')
  }
}

// 初始化加载
onMounted(() => {
  // 默认加载一次数据
  if (activeTab.value === 'comparison') {
    loadComparisonData()
  }
  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  Object.values(chartInstances).forEach(chart => chart?.dispose())
})

// 图表resize处理
const handleResize = () => {
  Object.values(chartInstances).forEach(chart => chart?.resize())
}
</script>

<style scoped>
/* 加载动画 */
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
