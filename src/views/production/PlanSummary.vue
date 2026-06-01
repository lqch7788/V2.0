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
      :show-export-mode="exportHook.showExportMode"
      :selected-count="exportHook.selectedRows.length"
      @export-click="exportHook.handleExportClick"
      @confirm-export="exportHook.handleConfirmExport"
      @cancel-export="exportHook.handleCancelExport"
    />

    <!-- 数据表格 -->
    <SummaryTable
      title="生产计划汇总表"
      :columns="columns"
      :data="paginatedData"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :export-mode="exportHook.showExportMode"
      :selected-rows="exportHook.selectedRows"
      @page-change="setCurrentPage"
      @select-all="() => exportHook.handleSelectAll(summaries.map(s => s.id))"
      @select-row="(id) => exportHook.handleSelectRow(id)"
    />

    <!-- 导出弹窗 -->
    <ExportModal
      :is-open="exportHook.showExportModal"
      :selected-count="exportHook.selectedRows.length"
      :export-format="exportHook.exportFormat"
      :update:export-format="(val) => (exportHook.exportFormat = val)"
      @close="() => (exportHook.showExportModal = false)"
      @confirm="exportHook.handleDoExport"
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { PageHeader, StatCards, Filters, SummaryTable, ExportModal } from '@/components/summary'
import { List, TrendCharts, Money, ShoppingCart } from '@element-plus/icons-vue'

// ============================================
// 模拟 useBatchFilterOptions（V1.1 hook 在 V2.0 不可用，本地化实现）
// ============================================
/** @returns {{ cropNames: Array<{value:string,label:string}>, statuses: Array<{value:string,label:string}>, greenhouses: Array<{value:string,label:string}> }} */
function useBatchFilterOptions() {
  const cropNames = [
    { value: '番茄', label: '番茄' },
    { value: '黄瓜', label: '黄瓜' },
    { value: '辣椒', label: '辣椒' },
    { value: '茄子', label: '茄子' },
  ]
  const statuses = [
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'planning', label: '规划中' },
  ]
  const greenhouses = [
    { value: '1号温室', label: '1号温室' },
    { value: '2号温室', label: '2号温室' },
    { value: '3号温室', label: '3号温室' },
  ]
  return { cropNames, statuses, greenhouses }
}

// ============================================
// 模拟 useBatchSummary（V1.1 hook 在 V2.0 不可用，本地化实现）
// ============================================
/**
 * @param {{ cropName?: string, status?: string, greenhouse?: string }} filters
 * @returns {{ summaries: Array, statCards: Array, loading: import('vue').Ref<boolean> }}
 */
function useBatchSummary(filters) {
  /** @type {Array<any>} */
  const mockData = [
    { id: '1', batchCode: 'PC20260501', cropName: '番茄', variety: '金棚一号', greenhouse: '1号温室', plantingArea: '2.5 亩', targetYield: 5000, actualYield: 3200, completionRate: '64%', status: 'in_progress', scheduleStatus: 'in_progress' },
    { id: '2', batchCode: 'PC20260502', cropName: '黄瓜', variety: '津优35号', greenhouse: '2号温室', plantingArea: '1.8 亩', targetYield: 3600, actualYield: 3600, completionRate: '100%', status: 'completed', scheduleStatus: 'completed' },
    { id: '3', batchCode: 'PC20260503', cropName: '辣椒', variety: '湘研15号', greenhouse: '3号温室', plantingArea: '3.0 亩', targetYield: 4500, actualYield: 1800, completionRate: '40%', status: 'in_progress', scheduleStatus: 'in_progress' },
    { id: '4', batchCode: 'PC20260504', cropName: '茄子', variety: '紫长茄1号', greenhouse: '4号温室', plantingArea: '1.5 亩', targetYield: 3000, actualYield: 2400, completionRate: '80%', status: 'in_progress', scheduleStatus: 'confirmed' },
    { id: '5', batchCode: 'PC20260505', cropName: '西瓜', variety: '京欣1号', greenhouse: '5号温室', plantingArea: '4.0 亩', targetYield: 12000, actualYield: 0, completionRate: '0%', status: 'planning', scheduleStatus: 'scheduled' },
  ]

  const summaries = computed(() => {
    return mockData.filter(s => {
      if (filters.cropName && s.cropName !== filters.cropName) return false
      if (filters.status && s.status !== filters.status) return false
      if (filters.greenhouse && s.greenhouse !== filters.greenhouse) return false
      return true
    })
  })

  const statCards = computed(() => [
    { id: 'total', label: '总批次数', value: summaries.value.length, icon: List, iconBgColor: 'from-blue-500 to-blue-600' },
    { id: 'inProgress', label: '进行中', value: summaries.value.filter(s => s.status === 'in_progress').length, icon: TrendCharts, iconBgColor: 'from-amber-500 to-amber-600' },
    { id: 'completed', label: '已完成', value: summaries.value.filter(s => s.status === 'completed').length, icon: Money, iconBgColor: 'from-emerald-500 to-emerald-600' },
    { id: 'planning', label: '规划中', value: summaries.value.filter(s => s.status === 'planning').length, icon: ShoppingCart, iconBgColor: 'from-purple-500 to-purple-600' },
  ])

  const loading = ref(false)
  return { summaries, statCards, loading }
}

// ============================================
// 状态定义（1:1 对应 V1.1 useState）
// ============================================
const cropFilter = ref('')
const statusFilter = ref('')
const greenhouseFilter = ref('')

const { cropNames, statuses, greenhouses } = useBatchFilterOptions()

const { summaries, statCards } = useBatchSummary({
  cropName: cropFilter.value || undefined,
  status: statusFilter.value || undefined,
  greenhouse: greenhouseFilter.value || undefined,
})

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
// 导出 Hook（本地简化实现，行为对齐 V1.1 useExport）
// ============================================
const showExportMode = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const selectedRows = ref([])

/**
 * @returns {{ summaries: Array }}
 */
function getExportData() {
  return summaries.value.map(s => ({
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
}

function handleExportClick() {
  showExportMode.value = true
  selectedRows.value = []
}

function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

function handleCancelExport() {
  showExportMode.value = false
  selectedRows.value = []
}

function handleSelectAll(ids) {
  if (selectedRows.value.length === ids.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = [...ids]
  }
}

function handleSelectRow(id) {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rid => rid !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

function handleDoExport() {
  const headers = ['批次编号', '作物', '品种', '温室', '面积(亩)', '目标产量', '实际产量', '完成率', '状态']
  const data = getExportData().filter(d => selectedRows.value.length === 0 || selectedRows.value.includes(data.findIndex(s => s.批次编号 === d.批次编号) + 1))
  const fileName = `生产计划汇总_${new Date().toISOString().slice(0, 10)}.csv`
  const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`成功导出 ${data.length} 条记录`)
  showExportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

const exportHook = {
  get showExportMode() { return showExportMode.value },
  get showExportModal() { return showExportModal.value },
  get exportFormat() { return exportFormat.value },
  get selectedRows() { return selectedRows.value },
  set exportFormat(val) { exportFormat.value = val },
  set showExportModal(val) { showExportModal.value = val },
  handleExportClick,
  handleConfirmExport,
  handleCancelExport,
  handleSelectAll,
  handleSelectRow,
  handleDoExport,
}

// ============================================
// 筛选配置（1:1 对应 V1.1 filterSelects）
// ============================================
const filterSelects = computed(() => [
  {
    key: 'crop',
    label: '作物',
    options: cropNames,
    value: cropFilter.value,
    onChange: (/** @type {string} */ value) => {
      cropFilter.value = value
      currentPage.value = 1
    },
  },
  {
    key: 'status',
    label: '状态',
    options: statuses,
    value: statusFilter.value,
    onChange: (/** @type {string} */ value) => {
      statusFilter.value = value
      currentPage.value = 1
    },
  },
  {
    key: 'greenhouse',
    label: '温室',
    options: greenhouses,
    value: greenhouseFilter.value,
    onChange: (/** @type {string} */ value) => {
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
    render: (value) => {
      // 返回 Vue 渲染函数（V2.0 模板驱动 - 实际数据为字符串）
      return { __render: 'completionRate', value }
    },
  },
  {
    key: 'scheduleStatus',
    label: '排班状态',
    width: '100px',
    render: (value) => {
      const config = {
        scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: '已排班' },
        confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: '已确认' },
        in_progress: { bg: 'bg-amber-100', text: 'text-amber-700', label: '进行中' },
        completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: '已完成' },
      }
      const style = config[value] || { bg: 'bg-gray-100', text: 'text-gray-500', label: '未排班' }
      return { __render: 'scheduleStatus', className: `${style.bg} ${style.text}`, label: style.label }
    },
  },
  {
    key: 'status',
    label: '状态',
    width: '100px',
    render: (value) => {
      const config = getStatusConfig(value)
      return { __render: 'status', className: config.className, label: config.label }
    },
  },
]
</script>
