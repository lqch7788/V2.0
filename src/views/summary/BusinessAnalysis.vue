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
          <YieldAnalysis v-if="activeTab === 'yield'" />
        </el-tab-pane>

        <el-tab-pane name="cost">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><Money /></el-icon>
              成本分析
            </span>
          </template>
          <CostAnalysis v-if="activeTab === 'cost'" />
        </el-tab-pane>

        <el-tab-pane name="labor">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><User /></el-icon>
              人工分析
            </span>
          </template>
          <LaborAnalysis v-if="activeTab === 'labor'" />
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
                <el-button type="primary" size="small" @click="loadComparisonData">加载数据</el-button>
              </div>
            </div>

            <!-- 对比指标选择 -->
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">对比指标</h4>
              <div class="grid grid-cols-4 gap-4">
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
              <el-table :data="comparisonData" stripe style="width: 100%">
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
              <div class="grid grid-cols-2 gap-4">
                <!-- 产量对比 -->
                <div v-if="comparisonMetrics.yield && chartData.length > 0" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">产量对比 (kg)</p>
                  <div class="h-48 flex items-end justify-around gap-2">
                    <div v-for="(item, index) in chartData" :key="index" class="flex flex-col items-center flex-1">
                      <div
                        class="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                        :style="{ height: `${(item.yield / maxYieldValue) * 150}px`, minHeight: '4px' }"
                      />
                      <span class="text-xs text-gray-500 mt-1 truncate">{{ getChartLabel(item) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 成本对比 -->
                <div v-if="comparisonMetrics.cost && chartData.length > 0" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">成本对比 (元)</p>
                  <div class="h-48 flex items-end justify-around gap-2">
                    <div v-for="(item, index) in chartData" :key="index" class="flex flex-col items-center flex-1">
                      <div
                        class="w-full bg-red-500 rounded-t transition-all hover:bg-red-600"
                        :style="{ height: `${(item.cost / maxCostValue) * 150}px`, minHeight: '4px' }"
                      />
                      <span class="text-xs text-gray-500 mt-1 truncate">{{ getChartLabel(item) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 利润对比 -->
                <div v-if="comparisonMetrics.profit && chartData.length > 0" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">利润对比 (元)</p>
                  <div class="h-48 flex items-end justify-around gap-2">
                    <div v-for="(item, index) in chartData" :key="index" class="flex flex-col items-center flex-1">
                      <div
                        class="w-full rounded-t transition-all"
                        :class="item.profit >= 0 ? 'bg-blue-500' : 'bg-gray-400'"
                        :style="{ height: `${Math.abs(item.profit) / maxProfitValue * 150}px`, minHeight: '4px' }"
                      />
                      <span class="text-xs text-gray-500 mt-1 truncate">{{ getChartLabel(item) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 亩产量对比 -->
                <div v-if="comparisonMetrics.yieldRate && chartData.length > 0" class="h-64">
                  <p class="text-xs text-gray-500 mb-2">亩产量对比 (kg/亩)</p>
                  <div class="h-48 flex items-end justify-around gap-2">
                    <div v-for="(item, index) in chartData" :key="index" class="flex flex-col items-center flex-1">
                      <div
                        class="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                        :style="{ height: `${(item.yieldRate / maxYieldRateValue) * 150}px`, minHeight: '4px' }"
                      />
                      <span class="text-xs text-gray-500 mt-1 truncate">{{ getChartLabel(item) }}</span>
                    </div>
                  </div>
                </div>
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
import { ref, computed } from 'vue'
import { DataAnalysis, TrendCharts, Money, User, Connection } from '@element-plus/icons-vue'
import { PageHeader } from '@/components/summary'

// 子组件占位
import YieldAnalysis from './sub/YieldAnalysis.vue'
import CostAnalysis from './sub/CostAnalysis.vue'
import LaborAnalysis from './sub/LaborAnalysis.vue'

const activeTab = ref('yield')

const handleTabChange = (tab) => {
  console.log('Tab changed to:', tab)
}

// 多维度对比相关
const selectedDimensions = ref(['crop'])
const dateRange = ref([])
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

// 对比数据
const comparisonData = ref([
  { cropName: '番茄', greenhouse: '1号棚', period: '2026年5月', worker: '张伟民', yield: 5200, amount: 33800, cost: 18500, profit: 15300, yieldRate: 5200, laborHours: 120, laborCost: 3600, unitPrice: 6.5 },
  { cropName: '番茄', greenhouse: '2号棚', period: '2026年5月', worker: '李明轩', yield: 4800, amount: 31200, cost: 17200, profit: 14000, yieldRate: 4800, laborHours: 115, laborCost: 3450, unitPrice: 6.5 },
  { cropName: '黄瓜', greenhouse: '2号棚', period: '2026年5月', worker: '李明轩', yield: 3800, amount: 19000, cost: 12800, profit: 6200, yieldRate: 4750, laborHours: 95, laborCost: 2850, unitPrice: 5.0 },
  { cropName: '黄瓜', greenhouse: '3号棚', period: '2026年5月', worker: '王建国', yield: 3500, amount: 17500, cost: 13500, profit: 4000, yieldRate: 4375, laborHours: 100, laborCost: 3000, unitPrice: 5.0 },
  { cropName: '辣椒', greenhouse: '3号棚', period: '2026年5月', worker: '王建国', yield: 2100, amount: 16800, cost: 9800, profit: 7000, yieldRate: 3500, laborHours: 80, laborCost: 2400, unitPrice: 8.0 },
  { cropName: '茄子', greenhouse: '1号棚-B区', period: '2026年5月', worker: '赵俊杰', yield: 1480, amount: 10360, cost: 7200, profit: 3160, yieldRate: 2960, laborHours: 60, laborCost: 1800, unitPrice: 7.0 },
])

// 图表数据
const chartData = computed(() => {
  if (selectedDimensions.value.includes('crop')) {
    // 按作物汇总
    const cropMap = {}
    comparisonData.value.forEach(item => {
      if (!cropMap[item.cropName]) {
        cropMap[item.cropName] = { cropName: item.cropName, yield: 0, cost: 0, profit: 0, yieldRate: 0, count: 0 }
      }
      cropMap[item.cropName].yield += item.yield
      cropMap[item.cropName].cost += item.cost
      cropMap[item.cropName].profit += item.profit
      cropMap[item.cropName].yieldRate += item.yieldRate
      cropMap[item.cropName].count++
    })
    Object.keys(cropMap).forEach(key => {
      cropMap[key].yieldRate = Math.round(cropMap[key].yieldRate / cropMap[key].count)
    })
    return Object.values(cropMap)
  }
  return comparisonData.value
})

// 计算最大值
const maxYieldValue = computed(() => Math.max(...chartData.value.map(d => d.yield || 0), 1))
const maxCostValue = computed(() => Math.max(...chartData.value.map(d => d.cost || 0), 1))
const maxProfitValue = computed(() => Math.max(...chartData.value.map(d => Math.abs(d.profit || 0)), 1))
const maxYieldRateValue = computed(() => Math.max(...chartData.value.map(d => d.yieldRate || 0), 1))

// 获取图表标签
const getChartLabel = (item) => {
  if (selectedDimensions.value.includes('crop')) return item.cropName
  if (selectedDimensions.value.includes('greenhouse')) return item.greenhouse
  if (selectedDimensions.value.includes('time')) return item.period
  if (selectedDimensions.value.includes('labor')) return item.worker
  return ''
}

// 加载对比数据
const loadComparisonData = () => {
  console.log('加载对比数据:', {
    dimensions: selectedDimensions.value,
    dateRange: dateRange.value,
    metrics: comparisonMetrics.value
  })
}

// 导出
const handleExport = () => {
  console.log('导出对比报告')
}
</script>
