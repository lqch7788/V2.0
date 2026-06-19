<!--
  CostTab 成本核算 Tab 4 子组件
  从 MaterialReceiving.vue 拆分（保持 1:1 模板和样式）
  Props:
    - applicationData: 申请领料数据（用于成本核算源）
    - formatNumber: 父组件提供的数字格式化函数
-->
<template>
  <div class="space-y-4">
    <!-- 子 Tab 切换 (V1.1 CostTabSwitcher) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="border-b border-gray-200">
        <div class="flex gap-1">
          <button v-for="ct in costSubTabs" :key="ct.key" @click="costActiveTab = ct.key"
            class="relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors"
            :class="costActiveTab === ct.key ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <component :is="ct.icon" class="w-4 h-4" />
            {{ ct.label }}
            <span v-if="costActiveTab === ct.key" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选表单 (V1.1 CostFiltersForm)：时间快捷+日期+部门下拉+分类下拉+重置 -->
    <div class="bg-white/50 rounded-xl p-4 border border-gray-100">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-gray-500" />
          <span class="text-sm text-gray-600">时间：</span>
        </div>
        <div class="flex gap-1">
          <button v-for="p in costQuickPeriods" :key="p.value"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="costFilters.quickPeriod === p.value ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="onCostQuickPeriod(p.value)"
          >{{ p.label }}</button>
        </div>
        <div class="flex items-center gap-2">
          <input type="date" v-model="costFilters.dateRange.start" @change="costFilters.quickPeriod = 'custom'" class="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500" />
          <span class="text-gray-400">至</span>
          <input type="date" v-model="costFilters.dateRange.end" @change="costFilters.quickPeriod = 'custom'" class="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500" />
        </div>
        <select v-model="costSelectedDept" @change="onCostDeptChange" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-emerald-500">
          <option value="all">部门：全部</option>
          <option v-for="d in COST_DEPARTMENTS" :key="d" :value="d">{{ d }}</option>
        </select>
        <select v-model="costSelectedCategory" @change="onCostCategoryChange" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500">
          <option value="all">分类：全部</option>
          <option v-for="c in COST_CATEGORIES" :key="c" :value="c">{{ c }}</option>
        </select>
        <button class="ml-auto h-8 px-3 rounded-md text-xs font-medium bg-gray-400 text-white hover:bg-gray-500 inline-flex items-center gap-1" @click="resetCostFilters">
          <X class="w-4 h-4" />重置
        </button>
      </div>
    </div>

    <!-- ============ 子 Tab：成本概览 ============ -->
    <div v-if="costActiveTab === 'overview'" class="space-y-4">
      <!-- KPI 4 卡 (V1.1 CostKPICards) -->
      <div class="grid grid-cols-4 gap-3">
        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><span class="text-sm font-bold text-white">¥</span></div>
            <div>
              <div class="text-xs text-emerald-600/70">累计总成本</div>
              <div class="text-xl font-bold text-emerald-700">¥{{ formatNumber(costKPI.totalCost) }}</div>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center"><Calendar class="w-4 h-4 text-white" /></div>
            <div>
              <div class="text-xs text-blue-600/70">本月成本</div>
              <div class="text-xl font-bold text-blue-700">¥{{ formatNumber(costKPI.monthlyCost) }}</div>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-3 border border-amber-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center"><BarChart2 class="w-4 h-4 text-white" /></div>
            <div>
              <div class="text-xs text-amber-600/70">平均批次成本</div>
              <div class="text-xl font-bold text-amber-700">¥{{ formatNumber(Math.round(costKPI.avgBatchCost)) }}</div>
            </div>
          </div>
        </div>
        <div :class="['rounded-lg p-3 border', costKPI.costDiffRate < 0 ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50' : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50']">
          <div class="flex items-center gap-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', costKPI.costDiffRate < 0 ? 'bg-green-500' : 'bg-red-500']">
              <TrendingDown :class="['w-4 h-4 text-white', costKPI.costDiffRate >= 0 ? 'transform rotate-180' : '']" />
            </div>
            <div>
              <div :class="['text-xs', costKPI.costDiffRate < 0 ? 'text-green-600/70' : 'text-red-600/70']">成本差异率</div>
              <div :class="['text-xl font-bold', costKPI.costDiffRate < 0 ? 'text-green-700' : 'text-red-700']">{{ costKPI.costDiffRate > 0 ? '+' : '' }}{{ costKPI.costDiffRate.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 双图：饼图(1/3) + 趋势图(2/3) -->
      <div class="grid grid-cols-3 gap-4">
        <!-- 饼图：成本构成（按分类） -->
        <div class="col-span-1 bg-white/50 rounded-xl p-4 border border-gray-100">
          <h5 class="font-semibold text-gray-700 mb-4 text-center">成本构成（按分类）</h5>
          <div class="space-y-2">
            <div v-for="cat in costCategoryAgg" :key="cat.category" class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(cat.category) }"></span>
              <span class="text-xs text-gray-700 flex-1 truncate">{{ cat.category }}</span>
              <span class="text-xs font-medium text-gray-900 w-12 text-right">{{ cat.percentage.toFixed(1) }}%</span>
              <span class="text-xs text-emerald-600 font-medium w-20 text-right">¥{{ formatNumber(cat.totalAmount) }}</span>
            </div>
            <div class="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between">
              <span class="text-xs text-gray-600 font-bold">总成本</span>
              <span class="text-sm text-emerald-700 font-bold">¥{{ formatNumber(costKPI.totalCost) }}</span>
            </div>
          </div>
        </div>
        <!-- 趋势图：12 月柱状图(CSS) -->
        <div class="col-span-2 bg-white/50 rounded-xl p-4 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-semibold text-gray-700">成本趋势（{{ costMonthlyAgg.length }} 个月）</h5>
          </div>
          <div class="space-y-1.5">
            <div v-for="m in costMonthlyAgg" :key="m.month" class="flex items-center gap-2">
              <span class="text-xs text-gray-500 w-16 shrink-0">{{ m.month.replace('2025-', '').replace('2026-', '') }}月</span>
              <div class="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                <div class="h-full bg-emerald-500" :style="{ width: ((m.totalAmount || 0) / costMaxMonth * 100) + '%' }"></div>
              </div>
              <span class="text-xs text-gray-700 w-24 text-right shrink-0">¥{{ formatNumber(m.totalAmount) }}</span>
            </div>
            <div v-if="costMonthlyAgg.length === 0" class="text-center text-gray-500 text-sm py-8">暂无数据</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 子 Tab：分类对比 ============ -->
    <div v-if="costActiveTab === 'comparison'" class="space-y-4">
      <!-- 维度切换：按物料分类 / 按部门 / 按批次 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">对比维度：</span>
        <div class="flex gap-1">
          <button class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="costDimension === 'category' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="costDimension = 'category'; costExpandedBatch = []"
          >按物料分类</button>
          <button class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="costDimension === 'department' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="costDimension = 'department'; costExpandedBatch = []"
          >按部门</button>
          <button class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="costDimension === 'batch' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="costDimension = 'batch'; costExpandedBatch = []"
          >按批次</button>
        </div>
      </div>

      <!-- 按物料分类表 -->
      <div v-if="costDimension === 'category'" class="bg-white/50 rounded-xl border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">物料分类</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">领料次数</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">总数量</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">总金额</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">占比</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="costCategoryAgg.length === 0"><td colspan="6" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
            <tr v-for="row in costCategoryAgg" :key="row.category" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ row.category }}</td>
              <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.requisitionCount }}</td>
              <td class="px-4 py-3 text-sm text-center text-gray-600">{{ formatNumber(row.totalQuantity) }}</td>
              <td class="px-4 py-3 text-sm text-right font-semibold text-emerald-600">¥{{ formatNumber(row.totalAmount) }}</td>
              <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.percentage.toFixed(1) }}%</td>
              <td class="px-4 py-3 text-center">
                <button class="text-emerald-600 hover:text-emerald-700 text-sm inline-flex items-center gap-1" @click="onViewCostDetail('category', row.category)">
                  <Eye class="w-4 h-4" /> 查看明细
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 按部门表 -->
      <div v-if="costDimension === 'department'" class="bg-white/50 rounded-xl border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">部门</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">领料次数</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">物料种类</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">总金额</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">占比</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="costDepartmentAgg.length === 0"><td colspan="6" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
            <tr v-for="row in costDepartmentAgg" :key="row.department" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ row.department }}</td>
              <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.requisitionCount }}</td>
              <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.materialTypes }}</td>
              <td class="px-4 py-3 text-sm text-right font-semibold text-emerald-600">¥{{ formatNumber(row.totalAmount) }}</td>
              <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.percentage.toFixed(1) }}%</td>
              <td class="px-4 py-3 text-center">
                <button class="text-emerald-600 hover:text-emerald-700 text-sm inline-flex items-center gap-1" @click="onViewCostDetail('department', row.department)">
                  <Eye class="w-4 h-4" /> 查看明细
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 按批次表（含展开行） -->
      <div v-if="costDimension === 'batch'" class="bg-white/50 rounded-xl border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-10"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">批次号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">作物</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">领料次数</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">物料种类</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">总成本</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">单位成本</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="costBatchAgg.length === 0"><td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
            <template v-for="row in costBatchAgg" :key="row.batchCode">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <button class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-emerald-600" @click="toggleCostBatchExpand(row.batchCode)">
                    <ChevronDown v-if="costExpandedBatch.includes(row.batchCode)" class="w-4 h-4" />
                    <ChevronRight v-else class="w-4 h-4" />
                  </button>
                </td>
                <td class="px-4 py-3 text-sm font-mono text-emerald-600">{{ row.batchCode }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ row.cropName }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.requisitionCount }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.materialTypes }}种</td>
                <td class="px-4 py-3 text-sm text-right font-semibold text-emerald-600">¥{{ formatNumber(row.totalAmount) }}</td>
                <td class="px-4 py-3 text-sm text-right text-amber-600">¥{{ row.unitCost.toFixed(2) }}/m²</td>
              </tr>
              <tr v-if="costExpandedBatch.includes(row.batchCode)">
                <td colspan="7" class="px-4 py-3 bg-gray-50">
                  <div class="text-xs text-gray-500 mb-2">该批次物料领用明细：</div>
                  <div class="grid grid-cols-4 gap-2">
                    <div v-for="mat in (costBatchMaterialDetails[row.batchCode] || [])" :key="mat.materialCode" class="bg-white rounded p-2 border border-gray-200">
                      <div class="text-xs text-gray-500">{{ mat.materialName }}</div>
                      <div class="text-sm font-medium text-emerald-600">¥{{ formatNumber(mat.totalAmount) }}</div>
                    </div>
                    <div v-if="!(costBatchMaterialDetails[row.batchCode]?.length)" class="col-span-4 text-sm text-gray-500">暂无物料明细</div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 成本明细弹窗（V1.1 CostDetailModal） -->
    <ApplicationDetailModal :is-open="costDetailModalOpen" @close="costDetailModalOpen = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Calendar, BarChart2, TrendingDown, ChevronDown, ChevronRight, Eye, X, TrendingUp } from 'lucide-vue-next'
import ApplicationDetailModal from './ApplicationDetailModal.vue'
import {
  filterCostRecords,
  calcCostTotal,
  calcMonthlyCost,
  aggregateByCategory,
  aggregateByDepartment,
  aggregateByBatch,
  aggregateByMonth,
  getFilteredMaterialDetails,
  getBatchMaterialDetails,
  COST_CATEGORIES,
  COST_DEPARTMENTS
} from '@/data/costData'
import { materialReceivingDetails } from '@/data/materialReceivingMockData'
import {
  getCategoryColor,
  costQuickPeriods,
  getInitialCostFilters
} from '../utils/materialReceivingConfig'

const props = defineProps({
  applicationData: { type: Array, default: () => [] },
  formatNumber: { type: Function, required: true }
})

// 子 Tab 切换
const costSubTabs = [
  { key: 'overview', label: '成本概览', icon: TrendingUp },
  { key: 'comparison', label: '分类对比', icon: BarChart2 }
]
const costActiveTab = ref('overview')

const costFilters = reactive(getInitialCostFilters())
const costSelectedDept = ref('all')
const costSelectedCategory = ref('all')

const onCostQuickPeriod = (period) => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  let start = '', end = fmt(now)
  if (period === 'week') {
    const ws = new Date(now); ws.setDate(now.getDate() - now.getDay()); start = fmt(ws)
  } else if (period === 'month') {
    start = `${yyyy}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  } else if (period === 'quarter') {
    const qm = Math.floor(now.getMonth() / 3) * 3
    start = `${yyyy}-${String(qm + 1).padStart(2, '0')}-01`
  } else if (period === 'year') {
    start = `${yyyy}-01-01`
  }
  costFilters.quickPeriod = period
  costFilters.dateRange.start = start
  costFilters.dateRange.end = end
}

const onCostDeptChange = () => {
  costFilters.departments = costSelectedDept.value === 'all' ? [] : [costSelectedDept.value]
}
const onCostCategoryChange = () => {
  costFilters.categories = costSelectedCategory.value === 'all' ? [] : [costSelectedCategory.value]
}
const resetCostFilters = () => {
  Object.assign(costFilters, getInitialCostFilters())
  costSelectedDept.value = 'all'
  costSelectedCategory.value = 'all'
}

// 数据源：优先用真实领料数据，兜底 V1.1 12 条 mock
const costRecordsSource = computed(() => {
  if (props.applicationData && props.applicationData.length > 0) return props.applicationData
  return materialReceivingDetails
})
const costFilteredRecords = computed(() => filterCostRecords(costRecordsSource.value, costFilters))

const costKPI = computed(() => {
  const records = costFilteredRecords.value
  const totalCost = calcCostTotal(records)
  const monthlyCost = calcMonthlyCost(records)
  const batchData = aggregateByBatch(records)
  const avgBatchCost = batchData.length > 0 ? totalCost / batchData.length : 0
  const costDiffRate = -2.3 // V1.1 简化默认值
  return { totalCost, monthlyCost, avgBatchCost, costDiffRate }
})

const costCategoryAgg = computed(() => aggregateByCategory(costFilteredRecords.value))
const costDepartmentAgg = computed(() => aggregateByDepartment(costFilteredRecords.value))
const costBatchAgg = computed(() => aggregateByBatch(costFilteredRecords.value))
const costMonthlyAgg = computed(() => aggregateByMonth(costFilteredRecords.value))
const costMaxMonth = computed(() => Math.max(...costMonthlyAgg.value.map(m => m.totalAmount), 1))
const costBatchMaterialDetails = computed(() => getBatchMaterialDetails(costFilteredRecords.value))

const costDimension = ref('category')
const costExpandedBatch = ref([])
const toggleCostBatchExpand = (batchCode) => {
  const idx = costExpandedBatch.value.indexOf(batchCode)
  if (idx > -1) costExpandedBatch.value.splice(idx, 1)
  else costExpandedBatch.value.push(batchCode)
}

const costDetailModalOpen = ref(false)
const costDetailTitle = ref('')
const costDetailData = ref([])
const onViewCostDetail = (dimension, value) => {
  costDetailData.value = getFilteredMaterialDetails(costFilteredRecords.value, dimension, value)
  costDetailTitle.value = `${value} 明细`
  costDetailModalOpen.value = true
}
</script>
