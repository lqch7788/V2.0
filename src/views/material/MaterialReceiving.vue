<template>
  <div class="space-y-6">
    <!-- 页面头部 + Tab切换 -->
    <MaterialReceivingHeader :activeTab="activeTab" @tab-change="onTabChange" />

    <!-- Tab 1: 申请领料 - 已拆分为子组件 -->
    <ApplicationTab v-show="activeTab == 'application'" />

    <!-- Tab 2: 领料出库 - 已拆分为子组件 -->
    <ExecuteTab v-show="activeTab == 'execute'" />

    <!-- Tab 3: 领料统计（严格对齐 V1.1 StatisticsTab.tsx） -->
    <div v-show="activeTab === 'statistics'" class="space-y-4">
      <!-- 统计卡片 - 4 张对齐 V1.1 StatCards.tsx -->
      <div class="grid grid-cols-4 gap-3 mb-3">
        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <ClipboardList class="w-4 h-4 text-white" />
            </div>
            <div>
              <div class="text-xs text-emerald-600/70">领料单数</div>
              <div class="text-xl font-bold text-emerald-700">{{ statSummary.requisitionCount }}</div>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Package class="w-4 h-4 text-white" />
            </div>
            <div>
              <div class="text-xs text-blue-600/70">领料总量</div>
              <div class="text-xl font-bold text-blue-700">{{ formatNumber(statSummary.totalQuantity) }}</div>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-3 border border-amber-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span class="text-sm font-bold text-white">¥</span>
            </div>
            <div>
              <div class="text-xs text-amber-600/70">总金额</div>
              <div class="text-xl font-bold text-amber-700">¥{{ formatNumber(statSummary.totalAmount) }}</div>
            </div>
          </div>
        </div>
        <div :class="['rounded-lg p-3 border', statSummary.avgDifferenceRate < 0 ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50' : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50']">
          <div class="flex items-center gap-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', statSummary.avgDifferenceRate < 0 ? 'bg-green-500' : 'bg-red-500']">
              <TrendingDown :class="['w-4 h-4 text-white', statSummary.avgDifferenceRate >= 0 ? 'transform rotate-180' : '']" />
            </div>
            <div>
              <div :class="['text-xs', statSummary.avgDifferenceRate < 0 ? 'text-green-600/70' : 'text-red-600/70']">差异率</div>
              <div :class="['text-xl font-bold', statSummary.avgDifferenceRate < 0 ? 'text-green-700' : 'text-red-700']">{{ statSummary.avgDifferenceRate.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 子 Tab：月度汇总 / 分类汇总（V1.1 实际仅 2 个 Tab） -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 pt-4 pb-0 border-b border-gray-200">
          <div class="flex gap-6">
            <button class="relative pb-3 text-sm font-semibold transition-colors" :class="statActiveTab === 'monthly' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'" @click="statActiveTab = 'monthly'; statCurrentPage = 1">
              <span class="inline-flex items-center gap-1"><Calendar class="w-4 h-4" />月度汇总</span>
              <span v-if="statActiveTab === 'monthly'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></span>
            </button>
            <button class="relative pb-3 text-sm font-semibold transition-colors" :class="statActiveTab === 'material' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'" @click="statActiveTab = 'material'; statCurrentPage = 1">
              <span class="inline-flex items-center gap-1"><BarChart2 class="w-4 h-4" />分类汇总</span>
              <span v-if="statActiveTab === 'material'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></span>
            </button>
          </div>
        </div>

        <!-- ========== 月度汇总 Tab ========== -->
        <div v-show="statActiveTab === 'monthly'" class="p-4 space-y-4">
          <!-- 月度筛选 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-end gap-4 flex-wrap">
              <div>
                <label class="block text-xs text-gray-500 mb-1">年度</label>
                <select v-model="statYearFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[120px]">
                  <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">月份</label>
                <select v-model="statMonthFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[120px]" @change="statCurrentPage = 1">
                  <option value="all">全部</option>
                  <option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">{{ m }}月</option>
                </select>
              </div>
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="handleStatReset">
                <RotateCcw class="w-4 h-4" />重置
              </button>
            </div>
          </div>

          <!-- 月度仪表盘：左环形图 + 右堆叠柱状图（简化实现，保留卡片版） -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 环形图：年度分类占比 -->
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">年度分类占比</h4>
              <div class="space-y-2">
                <div v-for="cat in sanitizedCategorySummary" :key="cat.key" class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: cat.solid || cat.color }"></span>
                  <span class="text-xs text-gray-700 flex-1 truncate">{{ cat.name }}</span>
                  <span class="text-xs font-medium text-gray-900 w-16 text-right">{{ cat.percentage }}%</span>
                  <span class="text-xs text-gray-500 w-20 text-right">¥{{ (cat.amount || 0).toFixed(1) }}万</span>
                </div>
              </div>
            </div>
            <!-- 堆叠柱状图：月度趋势（CSS 实现） -->
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">月度领料趋势</h4>
              <div class="space-y-2">
                <div v-for="d in monthData" :key="d.month" class="flex items-center gap-2">
                  <span class="text-xs text-gray-500 w-14 shrink-0">{{ d.monthName }}</span>
                  <div class="flex-1 h-5 bg-gray-100 rounded overflow-hidden flex">
                    <div v-for="cat in sanitizedCategorySummary" :key="cat.key"
                      :style="{ width: ((d[cat.key] || 0) / (d.total || 1) * 100) + '%', backgroundColor: cat.solid || cat.color }"
                      :title="`${cat.name}: ${d[cat.key] || 0}`"
                      class="h-full"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-700 w-12 text-right shrink-0">{{ d.total }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类汇总卡片（grid-cols-8: 7 分类 + 年度合计） -->
          <div class="grid grid-cols-4 lg:grid-cols-8 gap-2">
            <div v-for="cat in sanitizedCategorySummary" :key="cat.key" class="bg-white border border-gray-200 rounded-lg p-3">
              <div class="flex items-center gap-1 mb-1">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cat.solid || cat.color }"></span>
                <span class="text-xs text-gray-600 truncate">{{ cat.name }}</span>
              </div>
              <div class="text-sm font-bold text-gray-900">{{ formatNumber(cat.amount) }}</div>
              <div class="text-xs text-gray-500">万元 / {{ cat.percentage }}%</div>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-lg p-3">
              <div class="flex items-center gap-1 mb-1">
                <span class="w-2 h-2 rounded-full shrink-0 bg-emerald-500"></span>
                <span class="text-xs text-emerald-700 font-semibold">年度合计</span>
              </div>
              <div class="text-sm font-bold text-emerald-700">¥{{ formatNumber(totalCategoryAmount) }}万</div>
              <div class="text-xs text-emerald-600/70">100%</div>
            </div>
          </div>

          <!-- 月度汇总表（可展开 7 分类明细） -->
          <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <tr>
                    <th class="px-3 py-3 text-left text-sm font-semibold w-12"></th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">月份</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">领料数量</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">领料金额</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">排名</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">占比</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">环比</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">同比</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="filteredMonthData.length === 0">
                    <td colspan="9" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                  </tr>
                  <template v-for="row in filteredMonthData" :key="row.month">
                    <tr class="hover:bg-emerald-50/40 transition-colors">
                      <td class="px-3 py-2">
                        <button class="text-gray-500 hover:text-emerald-600" @click="toggleMonthExpand(row.month)">
                          <ChevronDown v-if="expandedMonths.includes(row.month)" class="w-4 h-4" />
                          <ChevronRight v-else class="w-4 h-4" />
                        </button>
                      </td>
                      <td class="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{{ row.monthName }}</td>
                      <td class="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">{{ formatNumber(row.totalQuantity) }}</td>
                      <td class="px-3 py-2 text-sm text-right font-medium text-emerald-600 whitespace-nowrap">¥{{ formatNumber(row.totalAmount) }}</td>
                      <td class="px-3 py-2 text-sm text-center text-blue-600 font-medium whitespace-nowrap">{{ getMonthStats(row.month).rank }}</td>
                      <td class="px-3 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{{ getMonthStats(row.month).percent }}</td>
                      <td class="px-3 py-2 text-sm text-center whitespace-nowrap">{{ getMonthStats(row.month).qoq }}</td>
                      <td class="px-3 py-2 text-sm text-center whitespace-nowrap">{{ getMonthStats(row.month).yoy }}</td>
                      <td class="px-3 py-2 text-center">
                        <button class="text-emerald-600 hover:text-emerald-700 text-sm" @click="toggleMonthExpand(row.month)">{{ expandedMonths.includes(row.month) ? '收起' : '展开' }}</button>
                      </td>
                    </tr>
                    <tr v-if="expandedMonths.includes(row.month)" class="bg-gray-50">
                      <td colspan="9" class="p-3">
                        <table class="w-full text-xs border border-gray-200 rounded">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-3 py-2 text-left font-semibold">物料分类</th>
                              <th class="px-3 py-2 text-right font-semibold">数量</th>
                              <th class="px-3 py-2 text-right font-semibold">金额(元)</th>
                              <th class="px-3 py-2 text-center font-semibold">占比</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="d in getMonthDetails(row.month)" :key="d.categoryName">
                              <td class="px-3 py-2 text-gray-700">{{ d.categoryName }}</td>
                              <td class="px-3 py-2 text-right text-gray-700">{{ formatNumber(d.quantity) }}</td>
                              <td class="px-3 py-2 text-right text-emerald-600 font-medium">¥{{ formatNumber(d.amount) }}</td>
                              <td class="px-3 py-2 text-center text-gray-700">{{ getCategoryStats(d.quantity, row.totalQuantity) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <div class="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              共 {{ filteredMonthData.length }} 条
            </div>
          </div>
        </div>

        <!-- ========== 分类汇总 Tab（物料汇总表 - 21 列对齐 V1.1） ========== -->
        <div v-show="statActiveTab === 'material'" class="p-4 space-y-4">
          <!-- 物料筛选（3 字段，保留 V2.0 现有简化版） -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-end gap-4 flex-wrap">
              <div>
                <label class="block text-xs text-gray-500 mb-1">物料搜索</label>
                <input v-model="statMaterialSearch" placeholder="编码/名称" class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-[180px] focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">领料部门</label>
                <select v-model="statDepartmentFilter" multiple class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[150px]">
                  <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">物料分类</label>
                <select v-model="statCategoryFilter" multiple class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[160px]">
                  <option v-for="c in statCategoryOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="statMaterialSearch = ''; statDepartmentFilter = []; statCategoryFilter = []"><RotateCcw class="w-4 h-4" />重置</button>
              <div class="ml-auto">
                <button v-if="!statExportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="statExportMode = true">
                  <Download class="w-4 h-4" />导出
                </button>
                <button v-if="statExportMode && statSelectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleStatExportConfirm">确认导出 ({{ statSelectedRows.length }}条)</button>
                <button v-if="statExportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="statExportMode = false; statSelectedRows = []">取消</button>
              </div>
            </div>
          </div>

          <!-- 物料汇总表 21 列 - 已拆分为子组件 -->
          <MaterialSummaryTable
            :filtered-material-stat-data="filteredMaterialStatData"
            :paginated-material-stat-data="paginatedMaterialStatData"
            :stat-selected-rows="statSelectedRows"
            :stat-export-mode="statExportMode"
            :stat-current-page="statCurrentPage"
            :stat-page-size="statPageSize"
            :is-loading-stat="isLoadingStat"
            :format-number="formatNumber"
            @select-all="handleMaterialStatSelectAll"
            @toggle-row="toggleStatRow"
            @view-detail="handleStatViewDetail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Download, ChevronRight, ChevronDown, RefreshCw, Package, Search, Eye, RotateCcw, Calendar, BarChart2, ClipboardList, TrendingDown, TrendingUp, BarChart3, FileX, X } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import ApplicationDetailModal from './components/ApplicationDetailModal.vue'
import MaterialReceivingHeader from '@/components/materialReceiving/MaterialReceivingHeader.vue'
import CostTab from './components/CostTab.vue'
import ApplicationTab from './components/ApplicationTab.vue'
import ExecuteTab from './components/ExecuteTab.vue'
import MaterialSummaryTable from './components/MaterialSummaryTable.vue'
import StatDetailModal from '@/components/materialReceiving/modals/StatDetailModal.vue'
import { getMaterialStatistics } from '@/api/material/apiMaterialStatisticsService'
// 领料统计-部门/区域 Mock 数据（V1.1 1:1 对齐）
import {
  departmentStatisticsData,
  greenhouseStatisticsData,
  fieldStatisticsData,
  batchStatisticsData,
  STAT_DEPARTMENT_OPTIONS,
  GREENHOUSE_TYPE_OPTIONS,
  GREENHOUSE_OPTIONS,
  FIELD_OPTIONS,
  BATCH_FILTER_OPTIONS,
  COMPARISON_PERIOD_OPTIONS
} from '@/data/materialReceivingStatData'
// 成本核算计算函数（V1.1 1:1 对齐）
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

// 配置常量与工具函数 已拆分到 ./utils/materialReceivingConfig.js
import {
  CATEGORY_KEY_WHITELIST,
  departments,
  warehouses,
  PRODUCTION_BATCH_CODES,
  userListData,
  exportFormats,
  materialBaseDB,
  findMaterialByCode,
  mapAppStatus,
  mapAppStatusClass,
  STATUS_STYLE_MAP_APP,
  STATUS_STYLE_MAP_EX,
  getAppStatusClass,
  getExStatusClass,
  mapAppRecord,
  COST_CATEGORY_COLOR_MAP,
  getCategoryColor,
  costQuickPeriods,
  getInitialCostFilters
} from './utils/materialReceivingConfig'

// V1.1 仅 7 个物料分类 key（白名单，防止混入领料单字段）已迁至 utils

// ==================== 通用数据 ====================
const activeTab = ref('application')
const onTabChange = (tab) => { activeTab.value = tab }

const userList = ref(userListData)

const currentOperatorName = computed(() => userList.value[0]?.name || '当前用户')
const onProductionBatchChange = (val) => { if (val !== '其他') { addForm.batchRemark = '' } }

// ==================== 展开行辅助 ====================
const appExpandedRows = ref([])
const exExpandedRowsId = ref([])
const expandedMonths = ref([])

const toggleAppExpandRow = (id) => {
  const idx = appExpandedRows.value.indexOf(id)
  if (idx > -1) appExpandedRows.value.splice(idx, 1)
  else appExpandedRows.value.push(id)
}

const toggleExExpandRow = (id) => {
  const idx = exExpandedRowsId.value.indexOf(id)
  if (idx > -1) exExpandedRowsId.value.splice(idx, 1)
  else exExpandedRowsId.value.push(id)
}

const toggleMonthExpand = (month) => {
  const idx = expandedMonths.value.indexOf(month)
  if (idx > -1) expandedMonths.value.splice(idx, 1)
  else expandedMonths.value.push(month)
}

// ==================== Tab 3: 领料统计（严格对齐 V1.1 StatisticsTab.tsx） ====================
// 主 Tab：月度汇总 / 物料汇总 / 部门汇总 / 区域统计 (V1.1 共 4 个主Tab)
const statActiveTab = ref('monthly')
// 区域统计子Tab: greenhouse(大棚) / field(大田) / batch(种植批次)
const statActiveAreaTab = ref('greenhouse')
const statYearFilter = ref(String(new Date().getFullYear()))
const statMonthFilter = ref('all')
const statMaterialSearch = ref('')
const statDepartmentFilter = ref([])
const statCategoryFilter = ref([])
// 月度仪表盘 月份切换
const statSelectedMonth = ref('all')
// 部门/区域 Tab 共享筛选
const statDateRange = reactive({ start: '', end: '' })
const statQuickPeriod = ref('currentMonth')
// 区域统计专属筛选
const statGreenhouseTypeFilter = ref('all')
const statGreenhouseFilter = ref('all')
const statFieldFilter = ref('all')
const statBatchFilter = ref('all')
const statComparisonPeriod = ref('none')
const statCurrentPage = ref(1)
const statPageSize = ref(10)
const statExportMode = ref(false)
const statSelectedRows = ref([])
const statShowExportTypeModal = ref(false)
const statExportFileType = ref('xlsx')
const statShowDetailModal = ref(false)
const statSelectedRecord = ref(null)
// 批次明细展开
const expandedBatchCodes = ref([])
const isLoadingStat = ref(false)

const years = ['2025', '2026']
const statCategoryOptions = ['肥料与土壤改良剂', '农药与植保产品', '种质资源', '农业机械', '劳保与防护用品', '监测设备', '采收容器']

// 7 个物料分类 + 颜色（对齐 V1.1 CategorySummaryCards）
// 注：categorySummaryData/categoryTrendData 已在下方 loadMaterialStatistics 中用 ref([]) 声明，删除此写死版本

const totalCategoryAmount = computed(() => categorySummaryData.value.reduce((s, c) => s + (Number(c.amount) || 0), 0))

// 仅取 7 个分类白名单字段，避免后端混入领料单字段(code/applicant/...)污染月度汇总
const sanitizedCategorySummary = computed(() => {
  return (categorySummaryData.value || []).filter(c => c && CATEGORY_KEY_WHITELIST.includes(c.key))
})

const monthData = computed(() => {
  const trend = categoryTrendData.value || []
  const cats = sanitizedCategorySummary.value
  return trend
    .filter(d => d && typeof d.month === 'string' && d.month.startsWith(statYearFilter.value))
    .map(d => {
      // 仅累计白名单分类字段，禁止 spread 整行（防止 code/applicant 等领料字段混入）
      const totalQty = cats.reduce((sum, cat) => sum + (Number(d[cat.key]) || 0), 0)
      const yearTotal = trend
        .filter(d2 => d2 && typeof d2.month === 'string' && d2.month.startsWith(statYearFilter.value))
        .reduce((sum, d2) => sum + cats.reduce((s, cat) => s + (Number(d2[cat.key]) || 0), 0), 0)
      // 严格只暴露分类字段 + 元信息，禁止任何其他字段进入展示数据
      const row = {
        month: d.month,
        monthName: `${parseInt(d.month.split('-')[1])}月`,
        totalQuantity: totalQty,
        totalAmount: totalQty * 30,
        percentage: yearTotal > 0 ? (totalQty / yearTotal) * 100 : 0,
        total: Number(d.total) || totalQty
      }
      cats.forEach(cat => { row[cat.key] = Number(d[cat.key]) || 0 })
      return row
    })
})
const filteredMonthData = computed(() => {
  if (statMonthFilter.value === 'all') return monthData.value
  return monthData.value.filter(d => d.month.endsWith('-' + statMonthFilter.value))
})
const getMonthDetails = (month) => {
  const md = (categoryTrendData.value || []).find(d => d && d.month === month)
  if (!md) return []
  const cats = sanitizedCategorySummary.value
  const totalQty = cats.reduce((sum, cat) => sum + (Number(md[cat.key]) || 0), 0)
  return cats.map(cat => {
    const qty = Number(md[cat.key]) || 0
    return { categoryName: cat.name, quantity: qty, amount: qty * 30, percentage: totalQty > 0 ? (qty / totalQty) * 100 : 0 }
  })
}
const getMonthStats = (month) => {
  const all = filteredMonthData.value
  const yearTotalQty = monthData.value.reduce((s, m) => s + m.totalQuantity, 0)
  const sortedByQty = [...all].sort((a, b) => b.totalQuantity - a.totalQuantity)
  const rank = sortedByQty.findIndex(m => m.month === month) + 1
  const currentData = all.find(m => m.month === month)
  const percent = yearTotalQty > 0 ? ((currentData?.totalQuantity || 0) / yearTotalQty * 100).toFixed(1) + '%' : '0.0%'

  const [year, m] = month.split('-')
  const monthNum = parseInt(m)
  let qoq = '-'
  if (monthNum > 1) {
    const prevMonth = `${year}-${String(monthNum - 1).padStart(2, '0')}`
    const prevData = all.find(am => am.month === prevMonth)
    if (prevData && prevData.totalQuantity > 0) {
      const change = ((currentData?.totalQuantity || 0) - prevData.totalQuantity) / prevData.totalQuantity * 100
      qoq = change >= 0 ? `↑${change.toFixed(1)}%` : `↓${Math.abs(change).toFixed(1)}%`
    }
  }
  let yoy = '-'
  const lastYearMonth = `${parseInt(year) - 1}-${m}`
  const lastYearData = all.find(am => am.month === lastYearMonth)
  if (lastYearData && lastYearData.totalQuantity > 0) {
    const change = ((currentData?.totalQuantity || 0) - lastYearData.totalQuantity) / lastYearData.totalQuantity * 100
    yoy = change >= 0 ? `↑${change.toFixed(1)}%` : `↓${Math.abs(change).toFixed(1)}%`
  }
  return { rank, percent, qoq, yoy }
}
const getCategoryStats = (detailQty, monthQty) => {
  const percent = monthQty > 0 ? ((detailQty / monthQty) * 100).toFixed(1) + '%' : '0.0%'
  return percent
}

// ==================== 物料汇总数据（来自后端 API /api/material-statistics/） ====================
const materialStatData = ref([])
const monthlyStatData = ref([])
const categorySummaryData = ref([])
const categoryTrendData = ref([])
const loadMaterialStatistics = async () => {
  isLoadingStat.value = true
  try {
    const result = await getMaterialStatistics()
    materialStatData.value = result.materialStatistics || []
    monthlyStatData.value = result.monthlyStatistics || []
    categorySummaryData.value = result.categorySummary || []
    categoryTrendData.value = result.categoryTrend || []
    console.log('[领料统计] material:', materialStatData.value.length, 'monthly:', monthlyStatData.value.length, 'category:', categorySummaryData.value.length, 'trend:', categoryTrendData.value.length)
  } catch (err) {
    console.warn('[领料统计] 加载失败:', err)
    materialStatData.value = []
    monthlyStatData.value = []
  } finally {
    isLoadingStat.value = false
  }
}
const filteredMaterialStatData = computed(() => {
  return materialStatData.value.filter(item => {
    if (statMaterialSearch.value) {
      const s = statMaterialSearch.value.toLowerCase()
      const code = (item.materialCode || '').toLowerCase()
      const name = (item.materialName || '').toLowerCase()
      if (!code.includes(s) && !name.includes(s)) return false
    }
    if (statDepartmentFilter.value.length > 0 && !statDepartmentFilter.value.includes(item.requisitionDepartment)) return false
    if (statCategoryFilter.value.length > 0 && !statCategoryFilter.value.includes(item.category)) return false
    return true
  })
})
const paginatedMaterialStatData = computed(() => {
  const start = (statCurrentPage.value - 1) * statPageSize.value
  return filteredMaterialStatData.value.slice(start, start + statPageSize.value)
})

// 5 张统计卡片（聚合全部物料数据，不论当前 Tab）
const statSummary = computed(() => {
  const data = materialStatData.value
  const requisitionCount = data.reduce((s, r) => s + (Number(r.requisitionCount) || 0), 0)
  const totalQuantity = data.reduce((s, r) => s + (Number(r.totalQuantity) || 0), 0)
  const totalAmount = data.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0)
  // 差异率 = (实际 - 总数) / 总数，平均
  const rates = data.map(r => {
    const t = Number(r.totalQuantity) || 0
    if (t === 0) return 0
    return ((Number(r.actualQuantity) || 0) - t) / t * 100
  }).filter(v => v !== 0)
  const avgDifferenceRate = rates.length > 0 ? rates.reduce((s, v) => s + v, 0) / rates.length : 0
  // 同比变化（V1.1 默认 +12.5%，可由后端数据覆盖）
  const yearOnYearChange = 12.5
  return { requisitionCount, totalQuantity, totalAmount, avgDifferenceRate, yearOnYearChange }
})

// ==================== 物料表辅助：选择/导出 ====================
const toggleStatRow = (idx) => {
  const i = statSelectedRows.value.indexOf(idx)
  if (i > -1) statSelectedRows.value.splice(i, 1)
  else statSelectedRows.value.push(idx)
}
const handleMaterialStatSelectAll = () => {
  if (statSelectedRows.value.length === filteredMaterialStatData.value.length) {
    statSelectedRows.value = []
  } else {
    statSelectedRows.value = filteredMaterialStatData.value.map((_, i) => i)
  }
}
const handleStatExportConfirm = () => {
  if (statSelectedRows.value.length === 0) { ElMessage.warning('请选择要导出的数据'); return }
  statShowExportTypeModal.value = true
}
const handleStatViewDetail = (row) => {
  statSelectedRecord.value = row
  statShowDetailModal.value = true
}

// ==================== 物料表导出（3 格式：xlsx/csv/word） ====================
const escapeCSV = (str) => {
  if (str === null || str === undefined) return ''
  const v = String(str)
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return '"' + v.replace(/"/g, '""') + '"'
  return v
}
const buildMaterialStatContent = () => {
  const selectedData = statSelectedRows.value.length > 0
    ? statSelectedRows.value.map(i => filteredMaterialStatData.value[i]).filter(Boolean)
    : filteredMaterialStatData.value
  const headers = ['物料编号', '物料名称', '分类', '规格型号', '条形码', '单位', '供应商', '批次号', '生产日期', '有效期至', '生产计划批次', '领料部门', '用途/区域', '领料人', '领料时间', '领料次数', '总数量', '实际数量', '总金额(元)', '主要仓库']
  let content; let mimeType; let extension;
  if (statExportFileType.value === 'csv') {
    let csv = '﻿领料统计表\n'
    csv += headers.map(escapeCSV).join(',') + '\n'
    selectedData.forEach(r => {
      csv += [r.materialCode, r.materialName, r.category, r.spec, r.barcode, r.unit, r.supplier, r.batchCode, r.productionDate, r.expiryDate, r.productionPlanBatchCode, r.requisitionDepartment, r.usageArea, r.requisitioner, r.requisitionTime, r.requisitionCount, r.totalQuantity, r.actualQuantity, r.totalAmount, r.mainWarehouse].map(escapeCSV).join(',') + '\n'
    })
    content = csv; mimeType = 'text/csv;charset=utf-8'; extension = 'csv'
  } else if (statExportFileType.value === 'xlsx') {
    let html = `<html><head><meta charset="utf-8"></head><body><div style="margin-bottom:20px;font-size:16px;"><b>领料统计表</b></div><table border="1" style="border-collapse:collapse;width:100%;">`
    html += `<tr style="background-color:#e5e7eb;font-weight:bold;">${headers.map(h => `<th style="padding:8px;border:1px solid #ccc;">${h}</th>`).join('')}</tr>`
    selectedData.forEach(r => {
      html += `<tr><td style="padding:6px;border:1px solid #ccc;">${r.materialCode || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.materialName || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.category || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.spec || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.barcode || ''}</td><td style="padding:6px;border:1px solid #ccc;text-align:center;">${r.unit || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.supplier || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.batchCode || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.productionDate || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.expiryDate || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.productionPlanBatchCode || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.requisitionDepartment || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.usageArea || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.requisitioner || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.requisitionTime || ''}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">${r.requisitionCount || 0}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">${(r.totalQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">${(r.actualQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">¥${(r.totalAmount || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #ccc;">${r.mainWarehouse || ''}</td></tr>`
    })
    html += '</table></body></html>'
    content = html; mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xls'
  } else {
    // word
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><div style="margin-bottom:20px;font-size:16px;"><b>领料统计表</b></div><table border="1" style="border-collapse:collapse;width:100%;">`
    html += `<tr style="background-color:#e5e7eb;font-weight:bold;">${headers.map(h => `<th style="padding:8px;border:1px solid #000;">${h}</th>`).join('')}</tr>`
    selectedData.forEach(r => {
      html += `<tr><td style="padding:6px;border:1px solid #000;">${r.materialCode || ''}</td><td style="padding:6px;border:1px solid #000;">${r.materialName || ''}</td><td style="padding:6px;border:1px solid #000;">${r.category || ''}</td><td style="padding:6px;border:1px solid #000;">${r.spec || ''}</td><td style="padding:6px;border:1px solid #000;">${r.barcode || ''}</td><td style="padding:6px;border:1px solid #000;text-align:center;">${r.unit || ''}</td><td style="padding:6px;border:1px solid #000;">${r.supplier || ''}</td><td style="padding:6px;border:1px solid #000;">${r.batchCode || ''}</td><td style="padding:6px;border:1px solid #000;">${r.productionDate || ''}</td><td style="padding:6px;border:1px solid #000;">${r.expiryDate || ''}</td><td style="padding:6px;border:1px solid #000;">${r.productionPlanBatchCode || ''}</td><td style="padding:6px;border:1px solid #000;">${r.requisitionDepartment || ''}</td><td style="padding:6px;border:1px solid #000;">${r.usageArea || ''}</td><td style="padding:6px;border:1px solid #000;">${r.requisitioner || ''}</td><td style="padding:6px;border:1px solid #000;">${r.requisitionTime || ''}</td><td style="padding:6px;border:1px solid #000;text-align:right;">${r.requisitionCount || 0}</td><td style="padding:6px;border:1px solid #000;text-align:right;">${(r.totalQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #000;text-align:right;">${(r.actualQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #000;text-align:right;">¥${(r.totalAmount || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #000;">${r.mainWarehouse || ''}</td></tr>`
    })
    html += '</table></body></html>'
    content = html; mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'doc'
  }
  return { content, mimeType, extension }
}
const confirmMaterialStatExport = () => {
  try {
    const { content, mimeType, extension } = buildMaterialStatContent()
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `领料统计表_${new Date().toISOString().slice(0, 10)}.${extension}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (err) {
    console.error('[领料统计] 导出失败:', err)
    ElMessage.error('导出失败，请重试')
  }
  statShowExportTypeModal.value = false
  statExportMode.value = false
  statSelectedRows.value = []
}

// 重置
const handleStatReset = () => {
  statMaterialSearch.value = ''
  statDepartmentFilter.value = []
  statCategoryFilter.value = []
  statYearFilter.value = String(new Date().getFullYear())
  statMonthFilter.value = 'all'
  statCurrentPage.value = 1
}

// ==================== 部门 / 区域 Tab 公共筛选 ====================
const statSingleDepartmentFilter = ref('all')

// 计算日期是否在 [start, end] 内（end 为空则只判断 start，反之亦然）
const inDateRange = (dateStr) => {
  if (!dateStr) return true
  if (statDateRange.start && dateStr < statDateRange.start) return false
  if (statDateRange.end && dateStr > statDateRange.end) return false
  return true
}

// 快捷筛选 - 设置日期区间
const onQuickFilter = (period) => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (period === 'currentWeek') {
    const day = today.getDay() === 0 ? 7 : today.getDay()
    const start = new Date(today); start.setDate(today.getDate() - (day - 1))
    statDateRange.start = fmt(start); statDateRange.end = fmt(today)
  } else if (period === 'currentMonth') {
    statDateRange.start = `${yyyy}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
    statDateRange.end = fmt(today)
  } else if (period === 'currentQuarter') {
    const q = Math.floor(today.getMonth() / 3)
    statDateRange.start = `${yyyy}-${String(q * 3 + 1).padStart(2, '0')}-01`
    statDateRange.end = fmt(today)
  } else if (period === 'currentYear') {
    statDateRange.start = `${yyyy}-01-01`
    statDateRange.end = fmt(today)
  }
  statQuickPeriod.value = period
  statCurrentPage.value = 1
}

// 重置共享筛选
const resetSharedFilter = () => {
  statSingleDepartmentFilter.value = 'all'
  statDateRange.start = ''
  statDateRange.end = ''
  statQuickPeriod.value = ''
  statGreenhouseTypeFilter.value = 'all'
  statGreenhouseFilter.value = 'all'
  statFieldFilter.value = 'all'
  statBatchFilter.value = 'all'
  statComparisonPeriod.value = 'none'
  statCurrentPage.value = 1
}

// 部门统计过滤
const filteredDepartmentData = computed(() => {
  return departmentStatisticsData.filter(item => {
    if (statSingleDepartmentFilter.value !== 'all' && item.department !== statSingleDepartmentFilter.value) return false
    return true
  })
})
const paginatedDepartmentData = computed(() => {
  const start = (statCurrentPage.value - 1) * statPageSize.value
  return filteredDepartmentData.value.slice(start, start + statPageSize.value)
})

// 通用格式化
const formatNumber = (n) => {
  const v = Number(n) || 0
  return v.toLocaleString()
}

// ==================== Tab 4: 成本核算 - 已拆分到 ./components/CostTab.vue ====================

onMounted(() => { loadMaterialStatistics() })
</script>