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

    <!-- 统计卡片（与V1.1完全一致） -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Package class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ statsData.total }}</p>
            <p class="text-xs text-gray-500">订单总数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <TrendingUp class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ statsData.inProgress }}</p>
            <p class="text-xs text-gray-500">进行中</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <CheckCircle class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ statsData.completed }}</p>
            <p class="text-xs text-gray-500">已完成</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Calendar class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ statsData.thisMonth }}</p>
            <p class="text-xs text-gray-500">本月新增</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏（与V1.1 OrderPage L48-56 + OrderFilter.tsx L31-141 一致 - 7 字段 state + 5 字段 UI） -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-end gap-4 flex-wrap">
        <!-- 订单编号 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
          <el-input v-model="filters.orderCode" placeholder="请输入订单编号" clearable />
        </div>
        <!-- 订单名称 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">订单名称</label>
          <el-input v-model="filters.orderName" placeholder="请输入订单名称" clearable />
        </div>
        <!-- 作物品种 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">作物品种</label>
          <el-select v-model="filters.cropName" placeholder="请选择" clearable class="w-full">
            <el-option v-for="item in cropNameOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <!-- 订单状态 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
          <el-select v-model="filters.status" placeholder="请选择" clearable class="w-full">
            <el-option v-for="opt in orderStatusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <!-- 订单日期 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">订单日期</label>
          <el-date-picker
            v-model="filters.orderDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <!-- 按钮 -->
        <div class="flex gap-2">
          <el-button size="small" class="whitespace-nowrap" @click="handleReset">
            <RotateCcw class="w-4 h-4 mr-1" />
            重置
          </el-button>
          <el-button type="primary" size="small" class="whitespace-nowrap" @click="handleSearch">
            <Search class="w-4 h-4 mr-1" />
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮行（与V1.1 OrderPage L354-381 ActionToolbar noCard=true 模式一致：无背景卡片） -->
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-gray-900 text-base">订单列表</h2>
      <div class="flex items-center gap-2">
          <!-- 批量编辑模式 -->
          <template v-if="batchEditMode">
            <el-button type="primary" size="small" @click="handleBatchEditConfirm">
              确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
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
            <el-button size="small" @click="handleExportConfirm">
              <Download class="w-4 h-4" />
              确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
            <el-button size="small" @click="handleExportCancel">取消选择</el-button>
          </template>
          <!-- 正常模式（与V1.1 OrderPage.tsx L354-381 ActionToolbar 调用配置一致：canCreate=true, canExport=true, showCustomerButton=true, canEdit=false, canDelete=false, showLowStockButton=false） -->
          <template v-else>
            <el-button type="primary" size="small" @click="handleAdd">
              <Plus class="w-4 h-4" />
              新增
            </el-button>
            <el-button size="small" @click="handleExportClick">
              <Download class="w-4 h-4" />
              导出
            </el-button>
            <el-button type="primary" size="small" @click="handleCustomer">
              客户管理
            </el-button>
          </template>
        </div>
      </div>

    <!-- 数据表格（与V1.1完全一致：max-h + sticky thead） -->
    <div v-loading="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-auto max-h-[calc(100vh-280px)]">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th v-if="exportMode || batchEditMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                <el-checkbox
                  :model-value="selectedRows.length === filteredData.length && filteredData.length > 0"
                  class="border-white rounded"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单编号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单类型</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物信息</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">计划数量</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">完成数量</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">完成进度</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">客户</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">预计完成时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">创建人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedData.length === 0">
              <td :colspan="exportMode || batchEditMode ? 15 : 14" class="px-4 py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
            <tr
              v-for="record in paginatedData"
              :key="record.id"
              class="hover:bg-emerald-50 transition-colors"
            >
              <td v-if="exportMode || batchEditMode" class="px-4 py-3">
                <el-checkbox
                  :model-value="selectedRows.includes(record.id)"
                  class="rounded"
                  @change="() => handleToggleSelect(record.id)"
                />
              </td>
              <td class="px-4 py-3 text-sm">
                <el-button link type="primary" @click="handleDetail(record)" title="点击查看详情">
                  {{ record.orderCode }}
                </el-button>
              </td>
              <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                {{ record.orderName }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getOrderTypeBadgeClass(record.orderType)">
                  {{ getOrderTypeLabel(record.orderType) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900 truncate max-w-xs">{{ record.cropVariety }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs" :title="record.cropCategory">{{ record.cropCategory }}</div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ record.plannedQuantity }} {{ record.unit }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ record.completedQuantity || 0 }} {{ record.unit }}
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                {{ record.plannedQuantity > 0 ? Math.round(((record.completedQuantity || 0) / record.plannedQuantity) * 100) + '%' : '0%' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate max-w-xs">
                {{ record.customerName || '-' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ record.orderDate }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ record.expectedCompletionDate || '-' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getStatusBadgeClass(record.status)">
                  {{ getStatusLabel(record) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate max-w-xs">
                {{ record.createBy || '-' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 truncate max-w-xs" :title="record.remarks || '-'">
                {{ record.remarks || '-' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <template v-if="record.status !== CropOrderStatus.COMPLETED">
                    <el-button link @click="handleEdit(record)" title="编辑">
                      <Pencil class="w-4 h-4" />
                    </el-button>
                    <el-button link @click="handleDelete(record)" title="删除">
                      <Trash2 class="w-4 h-4" />
                    </el-button>
                  </template>
                  <template v-else>
                    <span class="text-xs text-gray-400">已归档</span>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页（与V1.1完全一致） -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            共 <span class="text-blue-600 font-medium">{{ filteredData.length }}</span> 条记录
          </span>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">每页</span>
            <el-select
              :model-value="pagination.pageSize"
              @change="handlePageSizeChange"
              style="width: 80px"
            >
              <el-option v-for="opt in pageSizeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <span class="text-sm text-gray-600">条</span>
          </div>
        </div>

        <!-- 分页按钮组 -->
        <div class="flex items-center gap-2">
          <el-button variant="text" size="small" @click="handlePageChange(1)" :disabled="pagination.current === 1" class="text-gray-600">
            <ChevronsLeft class="w-4 h-4" />
          </el-button>
          <el-button variant="text" size="small" @click="handlePageChange(pagination.current - 1)" :disabled="pagination.current === 1" class="text-gray-600">
            <ChevronLeft class="w-4 h-4" />
          </el-button>
          <template v-for="page in visiblePages" :key="page">
            <el-button
              size="small"
              :class="[
                page === pagination.current
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none'
                  : 'text-gray-700 hover:bg-blue-50 border-gray-300'
              ]"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </el-button>
          </template>
          <el-button variant="text" size="small" @click="handlePageChange(pagination.current + 1)" :disabled="pagination.current === totalPages" class="text-gray-600">
            <ChevronRight class="w-4 h-4" />
          </el-button>
          <el-button variant="text" size="small" @click="handlePageChange(totalPages)" :disabled="pagination.current === totalPages" class="text-gray-600">
            <ChevronsRight class="w-4 h-4" />
          </el-button>
          <span class="text-sm text-gray-600 ml-2">
            第 <span class="text-blue-600 font-medium">{{ pagination.current }}</span> / {{ totalPages }} 页
          </span>
        </div>
      </div>
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
      @change="exportFormat = $event"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Package,
  TrendingUp,
  CheckCircle,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Download,
  Search,
  RotateCcw,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { CropOrderStatus } from '@/types/crop'
import { showAlert, showConfirm } from '@/lib/dialogService'
import AddModal from '@/views/crop/modals/AddModal.vue'
import DetailModal from '@/views/crop/modals/DetailModal.vue'
import EditModal from '@/views/crop/modals/EditModal.vue'
import ExportModal from '@/views/crop/modals/ExportModal.vue'

// Store
const orderDataStore = useOrderDataStore()

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

// 作物品种选项（从订单数据动态提取唯一品种，与V1.1一致）
const cropNameOptions = computed(() => {
  const uniqueCropVarieties = [...new Set(orderDataStore.orders.map(order => order.cropVariety).filter(Boolean))]
  return uniqueCropVarieties
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({ value: name, label: name }))
})

// 筛选条件（与 V1.1 OrderPage.tsx L48-56 CropOrderFilters 完全一致 - 7 字段 + 1 订单日期字段）
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

// 分页选项（与 V1.1 OrderTable.tsx L244 完全一致）
const pageSizeOptions = [10, 20, 50]

// 选中行
const selectedRows = ref([])

// 刷新触发器（与 V1.1 OrderPage.tsx L59 refreshKey 完全一致）
const refreshKey = ref(0)

// 权限控制（与 V1.1 OrderPage.tsx L29-32 完全一致 - 全部 true）
const canCreate = true
const canEdit = false
const canDelete = false
const canExport = true

// 导出模式
const exportMode = ref(false)
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportFormat = ref('xlsx')
const showExportModal = ref(false)

// 弹窗状态（与V1.1 OrderPage L84-87 一致：4个弹窗）
const addModalVisible = ref(false)
const detailModalVisible = ref(false)
const editModalVisible = ref(false)

// 当前记录
const currentRecord = ref(null)

// 加载状态
const loading = computed(() => orderDataStore.isLoading)

// 统计数据（优先使用后端API统计数据，否则回退到本地计算，与V1.1一致）
const statsData = computed(() => {
  if (orderDataStore.stats) {
    return orderDataStore.stats
  }
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

// 筛选后的数据（与 V1.1 OrderPage.tsx L99-116 完全一致 - 7 字段过滤）
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
    // 按创建时间倒序排列（新建的排在前面），与V1.1一致
    return timeB.localeCompare(timeA)
  })
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredData.value.length / pagination.value.pageSize) || 1)

// 当前页数据
const paginatedData = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredData.value.slice(start, end)
})

// 计算可见的页码（最多显示5页，与V1.1一致）
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, pagination.value.current - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages.value, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

// 获取状态标签（与V1.1一致：根据completedQuantity动态判断）
const getStatusLabel = (record) => {
  if (record.status === CropOrderStatus.COMPLETED) return '已完成'
  if (record.status === CropOrderStatus.CANCELLED) return '已取消'
  if ((record.completedQuantity || 0) > 0) return '进行中'
  return '已计划'
}

// 获取状态样式
const getStatusBadgeClass = (status) => {
  switch (status) {
    case CropOrderStatus.PLANNED:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
    case CropOrderStatus.IN_PROGRESS:
      return 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'
    case CropOrderStatus.COMPLETED:
      return 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full'
    case CropOrderStatus.CANCELLED:
      return 'px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}

// 获取订单类型标签
const getOrderTypeLabel = (type) => {
  switch (type) {
    case 'breeding': return '育种订单'
    case 'seedling': return '育苗订单'
    case 'production': return '生产订单'
    case 'research': return '研发订单'
    case 'other': return '其他'
    default: return type
  }
}

// 获取订单类型样式
const getOrderTypeBadgeClass = (type) => {
  switch (type) {
    case 'breeding':
      return 'px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full'
    case 'seedling':
      return 'px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full'
    case 'production':
      return 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full'
    case 'research':
      return 'px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full'
    case 'other':
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
}

// 重置（与 V1.1 OrderPage.tsx L168-178 完全一致 - 7 字段）
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

// 客户管理跳转（与V1.1 OrderPage L378-379 navigate('/crop/customer') 一致 - 用 Vue Router 保持 SPA 状态）
const router = useRouter()
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

// 详情（与 V1.1 OrderPage L137-142 一致：从 store 找最新数据）
const handleDetail = (record) => {
  // 从 store 中获取最新数据，确保显示最新的客户和预计完成日期
  const latestRecord = orderDataStore.orders.find(o => o.id === record.id) || record
  currentRecord.value = latestRecord
  detailModalVisible.value = true
}

// 编辑（与 V1.1 OrderPage L144-149 一致：从 store 找最新数据）
const handleEdit = (record) => {
  const latestRecord = orderDataStore.orders.find(o => o.id === record.id) || record
  currentRecord.value = latestRecord
  editModalVisible.value = true
}

// 编辑成功（与 V1.1 OrderPage.tsx L434-436 一致：Store updateOrder 已同步更新本地状态，无需重新 fetch）
const handleEditSuccess = () => {
  // Store 的 updateOrder 已同步更新本地状态，无需重新 fetch
}

// 删除（与 V1.1 OrderPage.tsx L151-161 完全一致）
const handleDelete = async (record) => {
  if (await showConfirm(`确定要删除订单 ${record.orderCode} 吗？`)) {
    try {
      await orderDataStore.deleteOrder(record.id)
    } catch (error) {
      console.error('删除订单失败:', error)
      await showAlert('删除失败，请稍后重试')
    }
  }
}

// 批量删除确认（与 V1.1 OrderPage.tsx L151-161 + deleteOrders 行为一致）
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
    } catch (error) {
      console.error('批量删除订单失败:', error)
      await showAlert('删除失败，请稍后重试')
    }
  }
}

// 批量编辑确认（与 V1.1 OrderPage.tsx L366 onConfirmBatchEdit 空函数一致 - 批量编辑功能暂未实现）
const handleBatchEditConfirm = () => {
  // 与 V1.1 ActionToolbar L366 一致：空实现（无操作），按钮仍可点击但不报错
}

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

const handleToggleSelect = (id) => {
  const index = selectedRows.value.indexOf(id)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(id)
  }
}

const handleExportConfirm = async () => {
  if (selectedRows.value.length === 0) {
    await showAlert('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 执行导出（与V1.1完全一致，V2.0 第6轮 P0 修复：包裹 try/catch，捕获错误）
const handleDoExport = () => {
  try {
  const dataToExport = selectedRows.value.length > 0
    ? filteredData.value.filter(o => selectedRows.value.includes(o.id))
    : filteredData.value

  // 导出表头
  const headers = ['订单编号', '订单名称', '订单类型', '品种路径', '作物品种', '计划数量', '完成数量', '单位', '订单日期', '预计完成时间', '状态', '创建人', '创建时间', '备注']

  // 生成导出数据
  const exportData = dataToExport.map(record => ({
    '订单编号': record.orderCode,
    '订单名称': record.orderName,
    '订单类型': getOrderTypeLabel(record.orderType),
    '品种路径': record.cropCategory,
    '作物品种': record.cropVariety,
    '计划数量': record.plannedQuantity,
    '完成数量': record.completedQuantity,
    '单位': record.unit,
    '订单日期': record.orderDate,
    '预计完成日期': record.expectedCompletionDate || '',
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

// 分页
const handlePageChange = (page) => {
  pagination.value.current = page
}

const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
}

// 初始化（V2.0 第6轮 P0 修复：包裹 try/catch，捕获错误时弹窗提示用户）
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
/* V1.1样式保持 */
:deep(.bg-gradient-to-r.from-blue-500.to-blue-600) {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
}
</style>
