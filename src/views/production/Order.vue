<template>
  <div class="space-y-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <ClipboardList class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">订单管理</h1>
            <p class="text-gray-500">管理作物订单、跟踪订单执行状态和交付进度</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <OrderStats :data="statsData" />

    <!-- 筛选工具栏 -->
    <OrderFilter
      v-model:filters="filters"
      :order-status-options="orderStatusOptions"
      :crop-names="cropNames"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 操作按钮 -->
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-gray-900 text-base">订单列表</h2>
      <div class="flex gap-2">
        <!-- 默认模式 -->
        <template v-if="!batchEditMode && !deleteMode && !exportMode">
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="addModalOpen = true">
            <Plus class="w-4 h-4" />
            新增
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700" @click="batchEditMode = true">
            批量编辑
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700" @click="deleteMode = true">
            删除
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleExportClick">
            <Download class="w-4 h-4" />
            导出
          </button>
        </template>
        <!-- 批量编辑模式 -->
        <template v-if="batchEditMode && !deleteMode && !exportMode">
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleConfirmBatchEdit">
            确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleCancelBatchEdit">
            取消
          </button>
        </template>
        <!-- 导出模式 -->
        <template v-if="exportMode && !batchEditMode && !deleteMode">
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleExportClickConfirm">
            <Download class="w-4 h-4" />
            确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleExportCancel">
            取消选择
          </button>
        </template>
        <!-- 删除模式 -->
        <template v-if="deleteMode && !batchEditMode && !exportMode">
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700" @click="handleConfirmDelete">
            确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleCancelDelete">
            取消
          </button>
        </template>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <OrderTable
      v-show="!loading"
      :data="filteredData"
      v-model:pagination="pagination"
      v-model:selected-rows="selectedRows"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :can-create="canCreate"
      :can-delete="canDelete"
      :can-export="canExport"
      @detail="handleDetail"
      @edit="handleEdit"
      @delete="handleDelete"
      @export-select-all="handleExportSelectAll"
    />

    <!-- 弹窗 -->
    <OrderAddModal
      v-model="addModalOpen"
      :order-type-options="orderTypeOptions"
      @success="fetchOrders"
    />

    <OrderDetailModal
      v-if="currentRecord"
      v-model="detailModalOpen"
      :record="currentRecord"
    />

    <OrderEditModal
      v-if="currentRecord"
      v-model="editModalOpen"
      :record="currentRecord"
      :order-type-options="orderTypeOptions"
      @success="() => {}"
    />

    <!-- 导出格式选择弹窗 -->
    <OrderExportModal
      v-model="showExportModal"
      v-model:export-format="exportFormat"
      :selected-count="selectedRows.length"
      @confirm="handleConfirmExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Download, ClipboardList } from 'lucide-vue-next'
import { useOrderDataStore } from '@/stores'
import { showAlert, showConfirm } from '@/lib/dialogService'
import OrderStats from './components/OrderStats.vue'
import OrderFilter from './components/OrderFilter.vue'
import OrderTable from './components/OrderTable.vue'
import OrderAddModal from './components/OrderAddModal.vue'
import OrderDetailModal from './components/OrderDetailModal.vue'
import OrderEditModal from './components/OrderEditModal.vue'
import OrderExportModal from './components/OrderExportModal.vue'
// 订单状态枚举常量（与V1.1 TypeScript枚举保持一致）
const CropOrderStatus = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// 权限检查 - 已取消，所有人可使用所有功能
const canCreate = true
const canDelete = true
const canEdit = true
const canExport = true

// 从 Pinia Store 获取订单数据和操作方法
const store = useOrderDataStore()

const loading = computed(() => store.isLoading)
const orders = computed(() => store.orders)
const apiStats = computed(() => store.stats)

// 筛选状态
const filters = ref({
  orderCode: '',
  orderName: '',
  cropName: '',
  status: '',
  startDate: '',
  endDate: '',
  createBy: '',
})

const pagination = ref({ current: 1, pageSize: 10 })
const selectedRows = ref<string[]>([])

// 作物品种数据（从订单数据中提取唯一品种，与V1.1保持一致）
const cropNames = computed(() => {
  const uniqueCropVarieties = [...new Set(orders.value.map((order: any) => order.cropVariety).filter(Boolean))]
  return uniqueCropVarieties
    .sort((a: string, b: string) => a.localeCompare(b))
    .map((name: string) => ({ value: name, label: name }))
})

// 组件挂载时加载数据
onMounted(async () => {
  const result = await store.syncPending()
  if (result.success > 0 || result.failed > 0) {
    console.log(`[OrderPage] 同步结果: 成功 ${result.success}, 失败 ${result.failed}`)
  }
  await store.fetchOrders()
  await store.fetchStats()
})

// 弹窗状态
const addModalOpen = ref(false)
const detailModalOpen = ref(false)
const editModalOpen = ref(false)
const currentRecord = ref<any>(null)

// 导出状态
const exportMode = ref(false)
const exportFormat = ref('excel')
const showExportModal = ref(false)

// 工具栏模式状态
const batchEditMode = ref(false)
const deleteMode = ref(false)

// 筛选后的数据
const filteredData = computed(() => {
  const filtered = orders.value.filter((item: any) => {
    if (filters.value.orderCode && !item.orderCode?.includes(filters.value.orderCode)) return false
    if (filters.value.orderName && !item.orderName?.includes(filters.value.orderName)) return false
    if (filters.value.cropName && !item.cropVariety?.includes(filters.value.cropName)) return false
    if (filters.value.status && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.orderDate < filters.value.startDate) return false
    if (filters.value.endDate && item.orderDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy?.includes(filters.value.createBy)) return false
    return true
  })
  return filtered.sort((a: any, b: any) => {
    const timeA = a.createTime || ''
    const timeB = b.createTime || ''
    return timeB.localeCompare(timeA)
  })
})

// 统计卡片数据
const statsData = computed(() => {
  if (apiStats.value) {
    return apiStats.value
  }
  const total = orders.value.length
  const inProgress = orders.value.filter((o: any) => o.status === CropOrderStatus.IN_PROGRESS).length
  const completed = orders.value.filter((o: any) => o.status === CropOrderStatus.COMPLETED).length
  const thisMonth = orders.value.filter((o: any) => {
    const date = new Date(o.createTime)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return { total, inProgress, completed, thisMonth }
})

// 处理操作
function handleDetail(record: any) {
  currentRecord.value = record
  detailModalOpen.value = true
}

function handleEdit(record: any) {
  currentRecord.value = record
  editModalOpen.value = true
}

async function handleDelete(ids: string[]) {
  if (await showConfirm(`确定要删除选中的 ${ids.length} 条记录吗？`)) {
    try {
      await store.deleteOrders(ids)
      selectedRows.value = []
    } catch (error) {
      console.error('删除订单失败:', error)
      showAlert('删除失败，请稍后重试')
    }
  }
}

function handleSearch() {
  pagination.value = { ...pagination.value, current: 1 }
}

function handleReset() {
  filters.value = {
    orderCode: '',
    orderName: '',
    cropName: '',
    status: '',
    startDate: '',
    endDate: '',
    createBy: '',
  }
  pagination.value = { ...pagination.value, current: 1 }
}

// 导出相关处理
function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

function handleExportSelectAll() {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map((item: any) => item.id)
  }
}

function handleExportCancel() {
  exportMode.value = false
  selectedRows.value = []
}

function handleExportClickConfirm() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

async function handleConfirmExport() {
  const selectedData = filteredData.value.filter((item: any) => selectedRows.value.includes(item.id))

  const headers = ['订单编号', '订单名称', '订单类型', '品种路径', '作物品种', '计划数量', '实际数量', '单位', '订单日期', '预计采收日期', '状态', '创建人', '创建时间', '备注']

  const exportData = selectedData.map((record: any) => ({
    '订单编号': record.orderCode,
    '订单名称': record.orderName,
    '订单类型': record.orderType === 'breeding' ? '育种订单' : record.orderType === 'seedling' ? '育苗订单' : record.orderType === 'production' ? '生产订单' : record.orderType === 'research' ? '研发订单' : '其他',
    '品种路径': record.cropCategory,
    '作物品种': record.cropVariety,
    '计划数量': record.plannedQuantity,
    '实际数量': record.actualQuantity,
    '单位': record.unit,
    '订单日期': record.orderDate,
    '预计采收日期': record.expectedHarvestDate || '',
    '状态': record.status === CropOrderStatus.PLANNED ? '已计划' : record.status === CropOrderStatus.IN_PROGRESS ? '进行中' : record.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消',
    '创建人': record.createBy,
    '创建时间': record.createTime,
    '备注': record.remarks || ''
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map((row: any) =>
      headers.map((h: string) => `"${row[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'word') {
    content = `<html><head><meta charset="utf-8"><style>
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #4a90d9; color: white; }
    </style></head><body>
      <table border="1">
        <tr>${headers.map((h: string) => `<th style="background-color: #4a90d9; color: white;">${h}</th>`).join('')}</tr>
        ${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}
      </table>
    </body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'docx'
  } else {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h: string) => `<th>${h}</th>`).join('')}</tr>${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  }

  const fileName = `订单管理_${new Date().toISOString().slice(0, 10)}.${extension}`

  try {
    if (window.showSaveFilePicker) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: exportFormat.value.toUpperCase() + ' Files',
          accept: { [mimeType]: ['.' + extension] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
    } else {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('Export failed:', err)
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

async function handleConfirmDelete() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要删除的数据')
    return
  }
  await handleDelete(selectedRows.value)
  deleteMode.value = false
}

function handleCancelDelete() {
  deleteMode.value = false
  selectedRows.value = []
}

function handleConfirmBatchEdit() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要编辑的数据')
    return
  }
  showAlert('批量编辑功能开发中')
  batchEditMode.value = false
  selectedRows.value = []
}

function handleCancelBatchEdit() {
  batchEditMode.value = false
  selectedRows.value = []
}

// 订单状态选项
const orderStatusOptions = [
  { value: CropOrderStatus.PLANNED, label: '已计划' },
  { value: CropOrderStatus.IN_PROGRESS, label: '进行中' },
  { value: CropOrderStatus.COMPLETED, label: '已完成' },
  { value: CropOrderStatus.CANCELLED, label: '已取消' },
]

const orderTypeOptions = [
  { value: 'breeding', label: '育种订单' },
  { value: 'seedling', label: '育苗订单' },
  { value: 'production', label: '生产订单' },
  { value: 'research', label: '研发订单' },
  { value: 'other', label: '其他' },
]
</script>
