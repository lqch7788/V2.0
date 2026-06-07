<template>
  <!-- 订单管理主页面 - 与 V1.1 OrderPage.tsx L323-452 完全对齐 -->
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

    <!-- 统计卡片 - 委托给 OrderStats 组件（与 V1.1 OrderStats.tsx 一致） -->
    <OrderStats :data="statsData" />

    <!-- 筛选工具栏 - 委托给 OrderFilter 组件（与 V1.1 OrderFilter.tsx 一致） -->
    <OrderFilter
      :filters="filters"
      :order-status-options="orderStatusOptions"
      :crop-names="cropNameOptions"
      :on-change="(val) => (filters = val)"
      :on-search="handleSearch"
      :on-reset="handleReset"
    />

    <!-- 操作按钮行（与 V1.1 OrderPage.tsx L354-381 ActionToolbar 配置一致：canCreate=true, canExport=true, showCustomerButton=true, canEdit=false, canDelete=false） -->
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-gray-900 text-base">订单列表</h2>
      <div class="flex items-center gap-2">
        <!-- 批量编辑模式：仅显示取消按钮（修复 handleBatchEditConfirm 空函数被删除） -->
        <template v-if="batchEditMode">
          <el-button size="small" @click="batchEditMode = false">取消</el-button>
        </template>
        <!-- 删除模式 -->
        <template v-else-if="deleteMode">
          <el-button type="danger" size="small" @click="handleConfirmDelete">
            确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <el-button size="small" @click="deleteMode = false">取消</el-button>
        </template>
        <!-- 导出模式 -->
        <template v-else-if="exportMode">
          <!-- V1.1 ActionToolbar.tsx L140-143 确认导出：默认 Button（绿底白字）— V2.0 用 type="primary" 1:1 对齐 -->
          <el-button type="primary" size="small" @click="handleExportConfirm">
            <Download class="w-4 h-4" />
            确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <!-- V1.1 ActionToolbar.tsx L144-146 取消选择：variant="secondary"（灰底）— V2.0 默认白底等效 -->
          <el-button size="small" @click="handleExportCancel">取消选择</el-button>
        </template>
        <!-- 正常模式 -->
        <template v-else>
          <el-button type="primary" size="small" @click="handleAdd">
            <Plus class="w-4 h-4" />
            新增
          </el-button>
          <!-- 批量删除按钮 - 点击进入删除模式（与 V1.1 ActionToolbar.tsx 1:1 对齐） -->
          <el-button
            v-if="canDelete"
            type="danger"
            size="small"
            :disabled="filteredData.length === 0"
            @click="handleBatchDeleteClick"
          >
            <Delete class="w-4 h-4" />
            删除
          </el-button>
          <!-- V1.1 ActionToolbar.tsx L102-107 导出按钮：默认 Button（绿底白字）— V2.0 用 type="primary" 1:1 对齐 -->
          <el-button type="primary" size="small" @click="handleExportClick">
            <Download class="w-4 h-4" />
            导出
          </el-button>
          <el-button size="small" class="order-customer-btn" @click="handleCustomer">
            客户管理
          </el-button>
        </template>
      </div>
    </div>

    <!-- 数据表格 - 委托给 OrderTable 组件（与 V1.1 OrderTable.tsx 一致） -->
    <div v-loading="loading" class="rounded-xl">
      <OrderTable
        :data="filteredData"
        :pagination="pagination"
        :selected-rows="selectedRows"
        :export-mode="exportMode"
        :batch-edit-mode="batchEditMode"
        :batch-delete-mode="deleteMode"
        :can-create="canCreate"
        :can-delete="canDelete"
        :can-export="canExport"
        :on-change="(val) => (pagination = val)"
        :on-selection-change="(val) => (selectedRows = val)"
        :on-detail="handleDetail"
        :on-edit="handleEdit"
        :on-delete="handleDeleteRow"
        :on-add="handleAdd"
        :on-export-select-all="handleSelectAll"
        :on-export-cancel="handleExportCancel"
        :on-confirm-export="handleExportConfirm"
      />
    </div>

    <!-- 弹窗组件 - 与 V1.1 OrderPage.tsx L413-450 弹窗挂载完全一致 -->
    <AddModal
      :is-open="addModalVisible"
      :order-type-options="orderTypeOptions"
      @close="addModalVisible = false"
      @success="handleAddSuccess"
    />

    <DetailModal
      v-if="currentRecord"
      :is-open="detailModalVisible"
      :record="currentRecord"
      @close="detailModalVisible = false"
    />

    <EditModal
      v-if="currentRecord"
      :is-open="editModalVisible"
      :record="currentRecord"
      :order-type-options="orderTypeOptions"
      @close="editModalVisible = false"
      @success="handleEditSuccess"
    />

    <!-- 导出格式选择弹窗 - 与 V1.1 ExportFormatModal 字段对齐 -->
    <ExportModal
      :is-open="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @close="showExportModal = false"
      @change="(val) => (exportFormat = val)"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
/**
 * 订单管理主页面（协调组件）
 * 对应 V1.1 src/components/farm/order/OrderPage.tsx
 * 业务逻辑保留在本组件，UI 委托给：
 * - OrderStats（统计卡片）
 * - OrderFilter（筛选工具栏）
 * - OrderTable（数据表格 + 分页）
 * - AddModal / DetailModal / EditModal / ExportModal（4 个弹窗）
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Download, ClipboardList, Delete } from 'lucide-vue-next'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { CropOrderStatus } from '@/types/crop'
import { showAlert, showConfirm } from '@/lib/dialogService'
// 修复 P0-A/P0-B：提取共享工具函数（与 OrderTable.vue 复用）
import { getOrderStatusLabel as getStatusLabel, getOrderTypeLabel as getOrderTypeLabelForExport } from '@/utils/orderHelpers'
import OrderStats from '@/views/crop/components/OrderStats.vue'
import OrderFilter from '@/views/crop/components/OrderFilter.vue'
import OrderTable from '@/views/crop/components/OrderTable.vue'
import AddModal from '@/views/crop/modals/AddModal.vue'
import DetailModal from '@/views/crop/modals/DetailModal.vue'
import EditModal from '@/views/crop/modals/EditModal.vue'
import ExportModal from '@/views/crop/modals/ExportModal.vue'

// Store
const orderDataStore = useOrderDataStore()
const router = useRouter()

// 订单状态选项
const orderStatusOptions = [
  { value: CropOrderStatus.PLANNED, label: '已计划' },
  { value: CropOrderStatus.IN_PROGRESS, label: '进行中' },
  { value: CropOrderStatus.COMPLETED, label: '已完成' },
  { value: CropOrderStatus.CANCELLED, label: '已取消' }
]

// 订单类型选项
const orderTypeOptions = [
  { value: 'breeding', label: '育种订单' },
  { value: 'seedling', label: '育苗订单' },
  { value: 'production', label: '生产订单' },
  { value: 'research', label: '研发订单' },
  { value: 'other', label: '其他' }
]

// 作物品种选项（从订单数据动态提取唯一品种，与 V1.1 一致）
const cropNameOptions = computed(() => {
  const uniqueCropVarieties = [...new Set(orderDataStore.orders.map(order => order.cropVariety).filter(Boolean))]
  return uniqueCropVarieties
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({ value: name, label: name }))
})

// 筛选条件（与 V1.1 OrderPage.tsx L48-56 一致 - 7 字段 + 1 orderDate）
const filters = ref({
  orderCode: '',
  orderName: '',
  cropName: '',
  status: '',
  startDate: '',
  endDate: '',
  createBy: '',
  orderDate: ''
})

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10
})

// 选中行
const selectedRows = ref([])

// 权限控制（与 V1.1 OrderPage.tsx L29-32 一致）
// 修复: canDelete 改为 true（启用批量删除功能）
const canCreate = true
const canEdit = false
const canDelete = true
const canExport = true

// 模式状态
const exportMode = ref(false)
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportFormat = ref('xlsx')
const showExportModal = ref(false)

// 弹窗状态
const addModalVisible = ref(false)
const detailModalVisible = ref(false)
const editModalVisible = ref(false)
const currentRecord = ref(null)

// 加载状态
const loading = computed(() => orderDataStore.isLoading)

// 统计数据（优先使用后端 API，否则本地计算）
const statsData = computed(() => {
  if (orderDataStore.stats) return orderDataStore.stats
  const orders = orderDataStore.orders
  return {
    total: orders.length,
    inProgress: orders.filter(o => o.status === CropOrderStatus.IN_PROGRESS).length,
    completed: orders.filter(o => o.status === CropOrderStatus.COMPLETED).length,
    thisMonth: orders.filter(o => {
      const date = new Date(o.createTime || '')
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length
  }
})

// 筛选后的数据（与 V1.1 OrderPage.tsx L99-116 一致 - 7 字段过滤 + 倒序）
const filteredData = computed(() => {
  return orderDataStore.orders.filter(item => {
    if (filters.value.orderCode && !item.orderCode?.includes(filters.value.orderCode)) return false
    if (filters.value.orderName && !item.orderName?.includes(filters.value.orderName)) return false
    if (filters.value.cropName && !item.cropVariety?.includes(filters.value.cropName)) return false
    if (filters.value.status && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.orderDate < filters.value.startDate) return false
    if (filters.value.endDate && item.orderDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy?.includes(filters.value.createBy)) return false
    return true
  }).sort((a, b) => {
    const timeA = a.createTime || ''
    const timeB = b.createTime || ''
    return timeB.localeCompare(timeA)
  })
})

// 状态标签和订单类型标签已抽到 @/utils/orderHelpers（修复 P0-A/P0-B 与 OrderTable.vue 复用）

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
}

// 重置
const handleReset = () => {
  filters.value = {
    orderCode: '',
    orderName: '',
    cropName: '',
    status: '',
    startDate: '',
    endDate: '',
    createBy: '',
    orderDate: ''
  }
  pagination.value.current = 1
}

// 客户管理跳转
const handleCustomer = () => {
  router.push('/crop/customer')
}

// 新增
const handleAdd = () => {
  currentRecord.value = null
  addModalVisible.value = true
}

// 新增成功
const handleAddSuccess = () => {
  orderDataStore.fetchOrders()
  orderDataStore.fetchStats()
}

// 详情
const handleDetail = (record) => {
  const latestRecord = orderDataStore.orders.find(o => o.id === record.id) || record
  currentRecord.value = latestRecord
  detailModalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  const latestRecord = orderDataStore.orders.find(o => o.id === record.id) || record
  currentRecord.value = latestRecord
  editModalVisible.value = true
}

// 编辑成功
const handleEditSuccess = () => {
  // Store 的 updateOrder 已同步更新本地状态，无需重新 fetch
}

// 单行删除（带确认弹窗）
const handleDeleteRow = async (ids) => {
  if (!ids || ids.length === 0) return
  const record = orderDataStore.orders.find(o => o.id === ids[0])
  if (!record) return
  if (await showConfirm(`确定要删除订单 ${record.orderCode} 吗？`)) {
    try {
      await orderDataStore.deleteOrder(record.id)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除订单失败:', error)
      // enhancedApiClient 直接 throw new Error(message)，message 即后端 error 字段
      const msg = error?.message || '删除失败，请稍后重试'
      await showAlert(msg)
    }
  }
}

// 批量删除确认
const handleConfirmDelete = async () => {
  if (selectedRows.value.length === 0) {
    await showAlert('请先选择要删除的数据')
    return
  }
  if (await showConfirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`)) {
    try {
      await orderDataStore.deleteOrders(selectedRows.value)
      selectedRows.value = []
      deleteMode.value = false
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('批量删除订单失败:', error)
      // enhancedApiClient 直接 throw new Error(message)，message 即后端 error 字段
      const msg = error?.message || '删除失败，请稍后重试'
      await showAlert(msg)
    }
  }
}

// 点击"删除"按钮：进入删除模式（与 V1.1 ActionToolbar.tsx L120-138 1:1 对齐）
const handleBatchDeleteClick = () => {
  // 退出其他模式，确保互斥
  batchEditMode.value = false
  exportMode.value = false
  showExportModal.value = false
  // 进入删除模式
  deleteMode.value = true
  // 初始化选中：默认全选当前页（用户可手动取消）
  selectedRows.value = filteredData.value.map(item => item.id)
}

// 批量编辑确认已删除（原本是空函数，修复代码问题）
// 模板中"批量编辑模式"只保留"取消"按钮，行为不变

// 导出
const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

const handleExportConfirm = async () => {
  if (selectedRows.value.length === 0) {
    await showAlert('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 执行导出
const handleDoExport = () => {
  try {
    const dataToExport = selectedRows.value.length > 0
      ? filteredData.value.filter(o => selectedRows.value.includes(o.id))
      : filteredData.value

    const headers = ['订单编号', '订单名称', '订单类型', '品种路径', '作物品种', '计划数量', '完成数量', '单位', '订单日期', '预计完成时间', '状态', '创建人', '创建时间', '备注']

    const exportData = dataToExport.map(record => ({
      '订单编号': record.orderCode,
      '订单名称': record.orderName,
      '订单类型': getOrderTypeLabelForExport(record.orderType),
      '品种路径': record.cropCategory,
      '作物品种': record.cropVariety,
      '计划数量': record.plannedQuantity,
      '完成数量': record.completedQuantity,
      '单位': record.unit,
      '订单日期': record.orderDate,
      // 修复 P0-C：键名与 headers 一致（headers 用"预计完成时间"），避免该列导出空白
      '预计完成时间': record.expectedCompletionDate || '',
      '状态': getStatusLabel(record),
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

    const fileName = `订单管理_${new Date().toISOString().slice(0, 10)}.${extension}`

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

    exportMode.value = false
    selectedRows.value = []
    showExportModal.value = false
  } catch (error) {
    console.error('导出失败:', error)
    showAlert('导出失败，请重试').catch(() => {})
  }
}

// 订单类型标签（导出用）已抽到 @/utils/orderHelpers

// 初始化
onMounted(async () => {
  try {
    await orderDataStore.syncPending()
    await orderDataStore.fetchOrders()
    await orderDataStore.fetchStats()
  } catch (error) {
    console.error('订单数据加载失败:', error)
    await showAlert('数据加载失败，请刷新重试')
  }
})
</script>

<style scoped>
/* 客户管理按钮 — V1.1 ActionToolbar.tsx L109 variant="blue" = bg-blue-600 #2563eb */
.order-customer-btn {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #fff !important;
}
.order-customer-btn:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}
/* 批量编辑确认按钮 — V1.1 ActionToolbar.tsx L118 variant="blue" = bg-blue-600 #2563eb */
.order-batch-confirm-btn {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #fff !important;
}
.order-batch-confirm-btn:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}
</style>
