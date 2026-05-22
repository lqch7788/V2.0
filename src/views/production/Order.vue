<template>
  <div class="space-y-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <List />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">订单管理</h1>
          <p class="text-gray-500">管理作物订单、跟踪订单执行状态和交付进度</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <OrderStats :data="statsData" />

    <!-- 筛选工具栏 -->
    <OrderFilter
      :filters="filters"
      :order-status-options="orderStatusOptions"
      :crop-names="cropNames"
      @change="handleFilterChange"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 操作按钮 -->
    <ActionToolbar
      :batch-edit-mode="batchEditMode"
      :delete-mode="deleteMode"
      :export-mode="exportMode"
      :selected-rows="selectedRows"
      :filters="{ showLowStock: false }"
      :can-create="canCreate"
      :can-edit="false"
      :can-delete="false"
      :can-export="true"
      :show-low-stock-button="false"
      :no-card="true"
      @add="handleOpenAddModal"
      @export="handleExportClick"
      @confirm-export="handleExportClickConfirm"
      @cancel-export="handleExportCancel"
    />

    <!-- 数据表格 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>

    <OrderTable
      v-else
      :data="filteredData"
      :pagination="pagination"
      :selected-rows="selectedRows"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :can-create="canCreate"
      :can-delete="canDelete"
      :can-export="canExport"
      @selection-change="handleSelectionChange"
      @detail="handleDetail"
      @edit="handleEdit"
      @delete="handleDelete"
      @add="handleOpenAddModal"
      @export-select-all="handleExportSelectAll"
      @export-cancel="handleExportCancel"
      @confirm-export="handleExportClickConfirm"
      @page-change="handlePageChange"
    />

    <!-- 弹窗 -->
    <AddModal
      v-model:visible="addModalOpen"
      :order-type-options="orderTypeOptions"
      @success="handleAddSuccess"
    />

    <DetailModal
      v-if="currentRecord"
      v-model:visible="detailModalOpen"
      :record="currentRecord"
    />

    <EditModal
      v-if="currentRecord"
      v-model:visible="editModalOpen"
      :record="currentRecord"
      :order-type-options="orderTypeOptions"
      @success="handleEditSuccess"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      v-model:visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @change="setExportFormat"
      @confirm="handleConfirmExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List } from '@element-plus/icons-vue'
import OrderStats from './components/OrderStats.vue'
import OrderFilter from './components/OrderFilter.vue'
import OrderTable from './components/OrderTable.vue'
import ActionToolbar from '@/components/farm/agriculture/components/AgricultureRecordTableToolbar.vue'
import AddModal from './modals/AddModal.vue'
import DetailModal from './modals/DetailModal.vue'
import EditModal from './modals/EditModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { CropOrder, CropOrderFilters, CropOrderStatus } from '@/types/crop'
import * as apiCropVarietyService from '@/services/apiCropVarietyService'
import dayjs from 'dayjs'

// 权限检查 - 已取消，所有人可使用所有功能
const canCreate = ref(true)
const canDelete = ref(true)
const canExport = ref(true)

// 从 Store 获取订单数据和操作方法
const orderDataStore = useOrderDataStore()

// 筛选状态
const filters = ref({
  orderCode: '',
  orderName: '',
  cropName: '',
  status: '',
  startDate: '',
  endDate: '',
  createBy: ''
})

const pagination = ref({ current: 1, pageSize: 10 })
const selectedRows = ref([])
const loading = ref(false)

// 作物品种数据
const cropVarietyOptions = computed(() => {
  cropVarietyService.initVarieties()
  return cropVarietyService.getVarietyOptions()
})

// 将品种库选项转换为旧格式以兼容现有组件
const cropNames = computed(() =>
  cropVarietyOptions.value.map(v => ({ value: v.value, label: v.label }))
)
const cropVarieties = computed(() =>
  cropVarietyOptions.value.map(v => ({ value: v.varietyCode, label: v.label }))
)

// 弹窗状态
const addModalOpen = ref(false)
const detailModalOpen = ref(false)
const editModalOpen = ref(false)
const currentRecord = ref(null)

// 导出状态
const exportMode = ref(false)
const exportFormat = ref('xlsx')
const showExportModal = ref(false)

// 工具栏模式状态
const batchEditMode = ref(false)
const deleteMode = ref(false)

// 统计数据
const statsData = computed(() => {
  const orders = orderDataStore.orders
  const total = orders.length
  const inProgress = orders.filter(o => o.status === CropOrderStatus.IN_PROGRESS).length
  const completed = orders.filter(o => o.status === CropOrderStatus.COMPLETED).length
  const thisMonth = orders.filter(o => {
    const date = new Date(o.createTime || '')
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return { total, inProgress, completed, thisMonth }
})

// 筛选后的数据 - 按创建时间倒序排列，确保新建订单排在第一位
const filteredData = computed(() => {
  const orders = orderDataStore.orders
  const filtered = orders.filter(item => {
    if (filters.value.orderCode && !item.orderCode.includes(filters.value.orderCode)) return false
    if (filters.value.orderName && !item.orderName.includes(filters.value.orderName)) return false
    if (filters.value.cropName && !item.cropName.includes(filters.value.cropName)) return false
    if (filters.value.status && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.orderDate < filters.value.startDate) return false
    if (filters.value.endDate && item.orderDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy.includes(filters.value.createBy)) return false
    return true
  })
  // 按创建时间倒序排列（新建的排在前面）
  return filtered.sort((a, b) => {
    const timeA = a.createTime || ''
    const timeB = b.createTime || ''
    return timeB.localeCompare(timeA)
  })
})

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

// 组件挂载时加载数据
onMounted(async () => {
  loading.value = true
  try {
    await orderDataStore.fetchOrders()
    await orderDataStore.fetchStats()
  } finally {
    loading.value = false
  }
})

// 处理操作
const handleDetail = (record) => {
  currentRecord.value = record
  detailModalOpen.value = true
}

const handleEdit = (record) => {
  currentRecord.value = record
  editModalOpen.value = true
}

const handleDelete = async (ids) => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await orderDataStore.deleteOrders(ids)
    selectedRows.value = []
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const handleSearch = () => {
  pagination.value.current = 1
}

const handleReset = () => {
  filters.value = {
    orderCode: '',
    orderName: '',
    cropName: '',
    status: '',
    startDate: '',
    endDate: '',
    createBy: ''
  }
  pagination.value.current = 1
}

const handleFilterChange = (newFilters) => {
  filters.value = newFilters
}

// 导出相关处理
const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleExportSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleExportClickConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const setExportFormat = (format) => {
  exportFormat.value = format
}

const handleConfirmExport = async () => {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))

  // 导出表头
  const headers = ['订单编号', '订单名称', '订单类型', '品种路径', '作物品种', '计划数量', '实际数量', '单位', '订单日期', '预计采收日期', '状态', '创建人', '创建时间', '备注']

  // 生成导出数据
  const exportData = selectedData.map(record => ({
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
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${row[h] || ''}"`).join(',')
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
        <tr>${headers.map(h => `<th style="background-color: #4a90d9; color: white;">${h}</th>`).join('')}</tr>
        ${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}
      </table>
    </body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'docx'
  } else {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  }

  const fileName = `订单管理_${dayjs().format('YYYY-MM-DD')}.${extension}`

  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
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

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handlePageChange = (page) => {
  pagination.value = page
}

const handleOpenAddModal = () => {
  addModalOpen.value = true
}

const handleAddSuccess = () => {
  orderDataStore.fetchOrders()
  addModalOpen.value = false
}

const handleCloseDetailModal = () => {
  detailModalOpen.value = false
  currentRecord.value = null
}

const handleCloseEditModal = () => {
  editModalOpen.value = false
  currentRecord.value = null
}

const handleEditSuccess = () => {
  orderDataStore.fetchOrders()
}
</script>
