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
          <button :class="btnSecondary" @click="batchEditMode = false">取消</button>
        </template>
        <!-- 删除模式 -->
        <template v-else-if="deleteMode">
          <button :class="btnDestructive" @click="handleConfirmDelete">
            <Trash2 class="w-4 h-4" />
            确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <button :class="btnSecondary" @click="deleteMode = false">取消</button>
        </template>
        <!-- 导出模式 -->
        <template v-else-if="exportMode">
          <!-- V1.1 ActionToolbar.tsx L140-143 确认导出：默认 Button（绿底白字） -->
          <button :class="btnDefault" @click="handleExportConfirm">
            <Download class="w-4 h-4" />
            确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <!-- V1.1 ActionToolbar.tsx L144-146 取消选择：variant="secondary"（灰底） -->
          <button :class="btnSecondary" @click="handleExportCancel">取消选择</button>
        </template>
        <!-- 正常模式 -->
        <template v-else>
          <button :class="btnDefault" @click="handleAdd">
            <Plus class="w-4 h-4" />
            新增
          </button>
          <!-- 批量删除按钮 - 点击进入删除模式（与 V1.1 ActionToolbar.tsx 1:1 对齐） -->
          <button
            v-if="canDelete"
            :class="btnDestructive"
            :disabled="filteredData.length === 0"
            @click="handleBatchDeleteClick"
          >
            <Trash2 class="w-4 h-4" />
            删除
          </button>
          <!-- V1.1 ActionToolbar.tsx L102-107 导出按钮：默认 Button（绿底白字） -->
          <button :class="btnDefault" @click="handleExportClick">
            <Download class="w-4 h-4" />
            导出
          </button>
          <!-- V1.1 ActionToolbar.tsx L109 variant="blue" -->
          <button :class="btnBlue" @click="handleCustomer">
            客户管理
          </button>
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

    <!-- 修复 P0: 移除 v-if 包裹 -->
    <DetailModal
      :is-open="detailModalVisible"
      :record="currentRecord"
      @close="detailModalVisible = false"
    />

    <!-- 修复 P0: 移除 v-if 包裹（v-if 切换会让 ElModal teleport 内容被销毁重建，触发 z-index 闪烁）-->
    <EditModal
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

    <!-- 删除警告弹窗（统一规格 560×450，按钮固定底部） -->
    <DeleteWarningModal
      v-model:is-open="deleteWarningOpen"
      :selected-count="deleteTargetCount"
      :title="deleteTargetTitle"
      :description="deleteTargetDescription"
      @close="handleDeleteWarningClose"
      @confirm="handleDeleteWarningConfirm"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Download, ClipboardList, Trash2 } from 'lucide-vue-next'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { CropOrderStatus } from '@/types/crop'
import { showAlert, showSuccess } from '@/lib/dialogService'
// 修复 P0-A/P0-B：提取共享工具函数（与 OrderTable.vue 复用）
import { getOrderStatusLabel as getStatusLabel, getOrderTypeLabel as getOrderTypeLabelForExport } from '@/utils/orderHelpers'
// 与生产模块共享按钮样式常量
import { btnDefault, btnSecondary, btnDestructive, btnBlue } from '@/views/production/constants/buttonStyles'
import OrderStats from '@/views/crop/components/OrderStats.vue'
import OrderFilter from '@/views/crop/components/OrderFilter.vue'
import OrderTable from '@/views/crop/components/OrderTable.vue'
import AddModal from '@/views/crop/modals/AddModal.vue'
import DetailModal from '@/views/crop/modals/DetailModal.vue'
import EditModal from '@/views/crop/modals/EditModal.vue'
import ExportModal from '@/views/crop/modals/ExportModal.vue'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'

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

// 筛选条件（与 V1.1 OrderPage.tsx L48-56 一致 - 7 字段：orderCode/orderName/cropName/status/startDate/endDate/createBy）
const filters = ref({
  orderCode: '',
  orderName: '',
  cropName: '',
  status: '',
  startDate: '',
  endDate: '',
  createBy: ''
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

// 统一删除警告弹窗状态（4 模块共享 DeleteWarningModal）
const deleteWarningOpen = ref(false)
const deleteTargetIds = ref([])
const deleteTargetCount = ref(0)
const deleteTargetTitle = ref('删除订单警告')
const deleteTargetDescription = ref('')

// 加载状态
const loading = computed(() => orderDataStore.isLoading)

// 统计数据（优先使用后端 API，否则本地计算 - 与 V1.1 OrderPage.tsx L131-150 一致 - 6 字段）
const statsData = computed(() => {
  if (orderDataStore.stats) return orderDataStore.stats
  const orders = orderDataStore.orders
  const total = orders.length
  const planned = orders.filter(o => o.status === CropOrderStatus.PLANNED).length
  const inProgress = orders.filter(o => o.status === CropOrderStatus.IN_PROGRESS).length
  const completed = orders.filter(o => o.status === CropOrderStatus.COMPLETED).length
  const cancelled = orders.filter(o => o.status === CropOrderStatus.CANCELLED).length
  const thisMonth = orders.filter(o => {
    const date = new Date(o.createTime || '')
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return { total, planned, inProgress, completed, cancelled, thisMonth }
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
    createBy: ''
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

// 单行删除 - 改为显示统一删除警告弹窗
const handleDeleteRow = (ids) => {
  if (!ids || ids.length === 0) return
  const record = orderDataStore.orders.find(o => o.id === ids[0])
  if (!record) return
  deleteTargetIds.value = [record.id]
  deleteTargetCount.value = 1
  deleteTargetTitle.value = '删除订单警告'
  deleteTargetDescription.value = `确定要删除订单 <strong>${record.orderCode}</strong> 吗？此操作 <span style="color:#dc2626">无法恢复</span>，删除后数据将永久丢失。`
  deleteWarningOpen.value = true
}

// 批量删除 - 改为显示统一删除警告弹窗
const handleConfirmDelete = () => {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要删除的数据')
    return
  }
  deleteTargetIds.value = [...selectedRows.value]
  deleteTargetCount.value = selectedRows.value.length
  deleteTargetTitle.value = '批量删除订单警告'
  deleteTargetDescription.value = `确定要删除选中的 <strong>${selectedRows.value.length}</strong> 条订单记录吗？此操作 <span style="color:#dc2626">无法恢复</span>，删除后数据将永久丢失。`
  deleteWarningOpen.value = true
}

// 删除警告弹窗 - 关闭
const handleDeleteWarningClose = () => {
  deleteWarningOpen.value = false
  deleteTargetIds.value = []
}

// 删除警告弹窗 - 确认（执行实际删除）
const handleDeleteWarningConfirm = async () => {
  const ids = [...deleteTargetIds.value]
  const isBatch = ids.length > 1
  deleteWarningOpen.value = false
  deleteTargetIds.value = []
  try {
    if (isBatch) {
      await orderDataStore.deleteOrders(ids)
      showSuccess(`已删除 ${ids.length} 条订单`)
    } else {
      await orderDataStore.deleteOrder(ids[0])
      showSuccess('删除成功')
    }
  } catch (error) {
    console.error('删除订单失败:', error)
    const msg = error?.message || '删除失败，请稍后重试'
    await showAlert(msg)
  } finally {
    if (isBatch) {
      // 批量删除：退出删除模式 + 清空选择
      selectedRows.value = []
      deleteMode.value = false
    }
    // 删除后重新拉取列表 + 统计，确保与后端一致（V1.1 OrderPage.tsx L184 同步调用 fetchStats）
    await orderDataStore.fetchOrders()
    await orderDataStore.fetchStats()
  }
}

// 点击"删除"按钮：进入删除模式（与 V1.1 ActionToolbar.tsx L120-138 1:1 对齐）
const handleBatchDeleteClick = () => {
  // 退出其他模式，确保互斥
  batchEditMode.value = false
  exportMode.value = false
  showExportModal.value = false
  // 进入删除模式（不默认勾选，让用户主动选择要删除的订单）
  deleteMode.value = true
  selectedRows.value = []
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
    // 修复 P0-XXX: 后端没有 /api/crop-orders/sync-pending 端点（404 噪音），移除调用
    await orderDataStore.fetchOrders()
    await orderDataStore.fetchStats()
  } catch (error) {
    console.error('订单数据加载失败:', error)
    await showAlert('数据加载失败，请刷新重试')
  }
})

// 监听 store.error 自动弹 toast（与 V1.1 OrderPage.tsx L88-94 useEffect 1:1）
const lastShownError = ref(null)
watch(
  () => orderDataStore.error,
  (newError) => {
    if (newError && newError !== lastShownError.value) {
      lastShownError.value = newError
      ElMessage.error(`加载订单数据失败：${newError}`)
      // 清掉 store 错误，避免重复弹
      if (typeof orderDataStore.$patch === 'function') {
        orderDataStore.$patch({ error: null })
      }
    }
  }
)
</script>

<style scoped>
/* 客户管理按钮 / 批量编辑确认按钮样式已统一使用 btnBlue 常量（src/views/production/constants/buttonStyles.js） */
</style>
