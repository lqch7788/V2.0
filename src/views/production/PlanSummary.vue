<!--
  @file 生产计划汇总页面 - 1:1 翻译自 V1.1 src/pages/PlanSummary.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\pages\PlanSummary.tsx
  @description V1.1 使用 useBatchSummary / useBatchFilterOptions / useExport hooks + summary 组件
           V2.0 复刻：复用 L3 summary 组件（PageHeader/StatCards/Filters/SummaryTable/ExportModal）
-->
<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <PageHeader
      title="生产计划汇总"
      description="查看所有生产批次的进度、产量和成本汇总"
    >
      <template #icon>
        <el-icon :size="24" style="color: white;"><Document /></el-icon>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <StatCards :cards="statCards" />

    <!-- 筛选工具栏 -->
    <Filters
      :filters="{ selects: filterSelects }"
      :show-export-mode="exportModeActive"
      :selected-count="selectedRowIds.length"
      @export-click="handleExportClick"
      @confirm-export="handleConfirmExport"
      @cancel-export="handleCancelExport"
    />

    <!-- 数据表格 -->
    <SummaryTable
      title="生产计划汇总表"
      :columns="columns"
      :data="paginatedData"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :export-mode="exportModeActive"
      :selected-rows="selectedRowIds"
      @page-change="setCurrentPage"
      @select-all="() => handleSelectAll(summaries.map(s => s.id))"
      @select-row="(id) => handleSelectRow(id)"
    />

    <!-- 导出弹窗 -->
    <ExportModal
      :is-open="exportModalOpen"
      :selected-count="selectedRowIds.length"
      :export-format="exportFormatValue"
      @update:export-format="setExportFormat"
      @close="() => (showExportModal.value = false)"
      @confirm="rawHandleDoExport"
    />
  </div>
</template>

<script setup>
/**
 * @description 生产计划汇总页面
 * 1:1 翻译 V1.1 src/pages/PlanSummary.tsx
 * - V1.1 用 useBatchSummary/useBatchFilterOptions hooks → V2.0 用 mock 数据 + 计算属性
 * - V1.1 用 useExport → V2.0 用本地简化实现（与 V1.1 行为一致）
 */
import { ref, computed, onMounted } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { PageHeader, StatCards, Filters, SummaryTable, ExportModal, useExport } from '@/components/summary'
import { List, TrendCharts, Money, ShoppingCart } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'

// ============================================
// 筛选选项 Hook（从真实 Store 动态获取）
// ============================================
const summaryStore = useSummaryStore()
const productionPlanStore = useProductionPlanStore()

// 初始化时加载数据
onMounted(async () => {
  await productionPlanStore.fetchPlans()
  await summaryStore.fetchBatchStats({ limit: 200 })
})

/** 动态获取筛选选项 */
const batchFilterOptions = computed(() => {
  const plans = productionPlanStore.plans || []
  // 从真实数据提取去重的作物、状态、温室选项
  const cropNames = [...new Set(plans.map(p => p.cropName).filter(Boolean))].map(v => ({ value: v, label: v }))
  const statuses = [...new Set(plans.map(p => p.batchStatus).filter(Boolean))].map(v => ({ value: v, label: getStatusLabel(v) }))
  const greenhouses = [...new Set(plans.map(p => p.greenhouseName).filter(Boolean))].map(v => ({ value: v, label: v }))
  return { cropNames, statuses, greenhouses }
})

/** 批次汇总数据（按筛选条件过滤） */
const summaries = computed(() => {
  let items = summaryStore.batchItems || []
  if (cropFilter.value) items = items.filter(s => s.cropName === cropFilter.value)
  if (statusFilter.value) items = items.filter(s => s.batchStatus === statusFilter.value)
  if (greenhouseFilter.value) items = items.filter(s => s.greenhouse === greenhouseFilter.value)
  // 映射字段以匹配 V1.1 结构
  return items.map(s => ({
    id: s.id,
    batchCode: s.batchCode,
    cropName: s.cropName,
    variety: s.variety,
    greenhouse: s.greenhouse,
    plantingArea: s.plantingArea ? `${s.plantingArea} 亩` : '-',
    targetYield: s.targetYield || 0,
    actualYield: s.actualQuantity || 0,
    completionRate: s.completionRate ? `${s.completionRate}%` : '0%',
    status: s.status,
    scheduleStatus: s.status === 'completed' ? 'completed' : s.status === 'in_progress' ? 'confirmed' : 'scheduled',
  }))
})

/** 统计卡片 */
const statCards = computed(() => {
  const all = summaries.value
  return [
    { id: 'total', label: '总批次数', value: all.length, icon: List, iconBgColor: 'from-blue-500 to-blue-600' },
    { id: 'inProgress', label: '进行中', value: all.filter(s => s.status === 'in_progress').length, icon: TrendCharts, iconBgColor: 'from-amber-500 to-amber-600' },
    { id: 'completed', label: '已完成', value: all.filter(s => s.status === 'completed').length, icon: Money, iconBgColor: 'from-emerald-500 to-emerald-600' },
    { id: 'planning', label: '规划中', value: all.filter(s => s.status === 'planning' || s.status === 'draft').length, icon: ShoppingCart, iconBgColor: 'from-purple-500 to-purple-600' },
  ]
})

// ============================================
// 状态定义（1:1 对应 V1.1 useState）
// ============================================
const cropFilter = ref('')
const statusFilter = ref('')
const greenhouseFilter = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(summaries.value.length / pageSize) || 1)
const paginatedData = computed(() =>
  summaries.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)

function setCurrentPage(page) {
  currentPage.value = page
}

// ============================================
// 导出 Hook（复用 L3 useExport，行为对齐 V1.1 useExport.ts）
// ============================================
const exportHeaders = ['批次编号', '作物', '品种', '温室', '面积(亩)', '目标产量', '实际产量', '完成率', '状态']
const exportSourceData = computed(() =>
  summaries.value.map(s => ({
    批次编号: s.batchCode,
    作物: s.cropName,
    品种: s.variety,
    温室: s.greenhouse,
    '面积(亩)': s.plantingArea,
    目标产量: s.targetYield,
    实际产量: s.actualYield,
    完成率: s.completionRate,
    状态: getStatusLabel(s.status),
  }))
)

const {
  exportMode: showExportMode,
  selectedRows,
  exportFormat,
  showExportModal,
  setExportFormat,
  handleExportClick,
  handleConfirmExport,
  handleCancelExport,
  handleSelectAll,
  handleSelectRow,
  handleDoExport: rawHandleDoExport,
} = useExport({
  data: exportSourceData,
  headers: exportHeaders,
  filenamePrefix: '生产计划汇总',
})

// 模板访问兼容：直接暴露 useExport 返回的 ref/computed，
// Vue 3 <script setup> 模板会自动解包顶层 ref。
const exportModeActive = computed(() => showExportMode.value)
const exportModalOpen = computed(() => showExportModal.value)
const exportFormatValue = computed(() => exportFormat.value)
const selectedRowIds = computed(() => selectedRows.value)

// ============================================
// 筛选配置（1:1 对应 V1.1 filterSelects）
// ============================================
const filterSelects = computed(() => [
  {
    key: 'crop',
    label: '作物',
    options: batchFilterOptions.value.cropNames,
    value: cropFilter.value,
    onChange: (value) => {
      cropFilter.value = value
      currentPage.value = 1
    },
  },
  {
    key: 'status',
    label: '状态',
    options: batchFilterOptions.value.statuses,
    value: statusFilter.value,
    onChange: (value) => {
      statusFilter.value = value
      currentPage.value = 1
    },
  },
  {
    key: 'greenhouse',
    label: '温室',
    options: batchFilterOptions.value.greenhouses,
    value: greenhouseFilter.value,
    onChange: (value) => {
      greenhouseFilter.value = value
      currentPage.value = 1
    },
  },
])

// ============================================
// 状态样式工具函数（1:1 对应 V1.1 getStatusConfig / getStatusLabel）
// ============================================
const STATUS_LABELS = {
  draft: '草稿', planning: '规划中', planned: '计划中', published: '已发布',
  in_progress: '进行中', planted: '已种植', growing: '生长中',
  harvesting: '采收中', completed: '已完成', cancelled: '已取消', suspended: '已暂停',
}
/** @param {string} status */
function getStatusLabel(status) {
  return STATUS_LABELS[status] || status
}

const STATUS_CLASS_MAP = {
  draft: 'bg-gray-100 text-gray-700',
  planning: 'bg-gray-100 text-gray-600',
  planned: 'bg-blue-50 text-blue-700',
  published: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  planted: 'bg-green-50 text-green-700',
  growing: 'bg-green-100 text-green-700',
  harvesting: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  suspended: 'bg-amber-100 text-amber-700',
}
/** @param {string} status */
function getStatusConfig(status) {
  return { label: STATUS_LABELS[status] || status, className: STATUS_CLASS_MAP[status] || 'bg-gray-100 text-gray-700' }
}

// ============================================
// 表格列配置（1:1 对应 V1.1 columns）
// render 返回字符串（SummaryTable 用 {{ col.render() }} 渲染，
// 返回对象会变成 [object Object]）。L3 组件暂不支持 slot 注入，
// 因此用纯字符串 + 颜色前缀简化展示（保留信息可见性）。
// ============================================
const columns = [
  { key: 'batchCode', label: '计划编号', width: '120px' },
  { key: 'cropName', label: '作物', width: '100px' },
  { key: 'variety', label: '品种', width: '120px' },
  { key: 'greenhouse', label: '温室', width: '100px' },
  { key: 'plantingArea', label: '面积(亩)', width: '80px' },
  { key: 'targetYield', label: '目标产量', width: '100px' },
  { key: 'actualYield', label: '实际产量', width: '100px' },
  {
    key: 'completionRate',
    label: '完成率',
    width: '140px',
    render: (value) => String(value ?? ''),
  },
  {
    key: 'scheduleStatus',
    label: '排班状态',
    width: '100px',
    render: (value) => {
      const config = {
        scheduled: '已排班',
        confirmed: '已确认',
        in_progress: '进行中',
        completed: '已完成',
      }
      return config[value] || '未排班'
    },
  },
  {
    key: 'status',
    label: '状态',
    width: '100px',
    render: (value) => getStatusConfig(value).label,
  },
]
</script>
