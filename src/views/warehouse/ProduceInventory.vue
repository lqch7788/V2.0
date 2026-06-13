<template>
  <div class="space-y-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Package class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">作物库存</h1>
          <p class="text-gray-500">管理采收入库产品的库存状态和预警设置</p>
        </div>
      </div>
    </div>

    <!-- 预警信息面板 -->
    <div class="grid grid-cols-5 gap-3 mb-6">
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle class="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alertCounts.total }}</div>
            <div class="text-xs text-gray-500">预警总数</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Clock class="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alertCounts.storageTime }}</div>
            <div class="text-xs text-gray-500">存储时间预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingUp class="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alertCounts.lowStock }}</div>
            <div class="text-xs text-gray-500">库存不足预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <TrendingUp class="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alertCounts.highStock }}</div>
            <div class="text-xs text-gray-500">库存过多预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertTriangle class="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alertCounts.expiration }}</div>
            <div class="text-xs text-gray-500">保质期预警</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <!-- 搜索框 -->
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchText"
            placeholder="搜索产品编码、作物名称、批次号..."
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
            @input="handleSearch"
          />
        </div>

        <!-- 仓库筛选 -->
        <select v-model="filters.warehouseId" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" @change="handleFilterChange">
          <option value="">全部仓库</option>
          <option v-for="w in warehouseStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>

        <!-- 作物类型筛选 -->
        <select v-model="filters.cropName" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" @change="handleFilterChange">
          <option value="">全部作物</option>
          <option v-for="name in cropNames" :key="name" :value="name">{{ name }}</option>
        </select>

        <!-- 品质等级筛选 -->
        <select v-model="filters.grade" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" @change="handleFilterChange">
          <option value="">全部等级</option>
          <option value="A">A级</option>
          <option value="B">B级</option>
          <option value="C">C级</option>
        </select>

        <!-- 状态筛选 -->
        <select v-model="filters.status" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" @change="handleFilterChange">
          <option value="">全部状态</option>
          <option value="in_stock">正常</option>
          <option value="low_stock">库存不足</option>
          <option value="expired">已过期</option>
          <option value="out_of_stock">缺货</option>
        </select>

        <!-- 重置和搜索按钮 -->
        <div class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600" @click="handleReset">重置</button>
          <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleSearch">搜索</button>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <ProduceInventoryToolbar
      title="作物库存汇总表"
      :batch-edit-mode="batchEditMode"
      :delete-mode="deleteMode"
      :export-mode="exportMode"
      :selected-rows="selectedRows"
      :low-stock-count="lowStockCount"
      :filters="filters"
      @low-stock-toggle="handleLowStockToggle"
      @batch-edit="handleBatchEdit"
      @delete="handleDelete"
      @export="handleExport"
      @add="showAddModal = true"
      @confirm-batch-edit="handleConfirmBatchEdit"
      @cancel-batch-edit="handleCancelSelection"
      @confirm-delete="showDeleteModal = true"
      @cancel-delete="handleCancelSelection"
      @confirm-export="showExportModal = true"
      @cancel-export="handleCancelSelection"
    />

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 选择操作栏 -->
      <div v-if="exportMode || batchEditMode || deleteMode" class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center gap-4">
          <button class="text-sm text-blue-600 hover:text-blue-800" @click="handleSelectAll">
            {{ isAllSelected ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>

      <!-- 表格 -->
      <div class="overflow-auto" style="max-height: 600px">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                <input type="checkbox" :checked="isAllSelected" @change="handleSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 140px">作物编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">作物品种</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">品种路径</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 80px">等级</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">库存数量</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 120px">库存限值</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">仓库</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">存放位置</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">入库时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">保质期(天)</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">过期时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 80px">存储时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">预警状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">操作人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap" style="width: 100px">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="displayedData.length === 0">
              <td :colspan="exportMode || batchEditMode || deleteMode ? 16 : 15" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
            </tr>
            <tr v-for="row in displayedData" :key="row.id" class="hover:bg-blue-50 transition-colors even:bg-gray-50">
              <!-- 选择列 -->
              <td v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3">
                <input type="checkbox" :checked="selectedRows.includes(row.id)" @change="toggleRowSelection(row.id)" class="w-4 h-4 rounded border-gray-400" />
              </td>
              <!-- 作物编码 -->
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <button class="text-blue-600 cursor-pointer hover:text-blue-800 underline" @click="handleViewDetail(row)">
                  {{ generateCropCode(row.cropName, row.variety) || row.productCode }}
                </button>
              </td>
              <!-- 作物品种 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.variety }}</td>
              <!-- 品种路径 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.cropName }}</td>
              <!-- 等级 -->
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="gradeTagClass(row.grade)">{{ row.grade }}级</span>
              </td>
              <!-- 库存数量 -->
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span :class="row.status === 'low_stock' || row.status === 'out_of_stock' ? 'text-red-600 font-medium' : 'text-gray-900'">
                  {{ row.quantity }} {{ row.unit }}
                </span>
              </td>
              <!-- 库存限值 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ row.alertSettings?.minStock || 0 }} ~ {{ row.alertSettings?.maxStock || 0 }} {{ row.unit }}
              </td>
              <!-- 仓库 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseName }}</td>
              <!-- 存放位置 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.storageLocation }}</td>
              <!-- 入库时间 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.storageDate }}</td>
              <!-- 保质期(天) -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.alertSettings?.expirationDays || 0 }} 天</td>
              <!-- 过期时间 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.expirationDate }}</td>
              <!-- 存储时间 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ getStorageDays(row.storageDate) }} 天</td>
              <!-- 预警状态 -->
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="statusTagClass(row.status)">
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <!-- 操作人 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ row.inboundRecords?.length > 0 ? row.inboundRecords[row.inboundRecords.length - 1].operator : '-' }}
              </td>
              <!-- 备注 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">共 {{ filteredData.length }} 条</span>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage <= 1"
            class="h-8 px-3 rounded-md text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="currentPage = 1"
          >首页</button>
          <button
            :disabled="currentPage <= 1"
            class="h-8 px-3 rounded-md text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="currentPage--"
          >上一页</button>
          <span class="text-sm text-gray-700 px-2">{{ currentPage }} / {{ totalPages }}</span>
          <button
            :disabled="currentPage >= totalPages"
            class="h-8 px-3 rounded-md text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="currentPage++"
          >下一页</button>
          <button
            :disabled="currentPage >= totalPages"
            class="h-8 px-3 rounded-md text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="currentPage = totalPages"
          >末页</button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <select v-model="pageSize" class="h-8 px-2 border border-gray-300 rounded text-sm bg-white" @change="currentPage = 1">
            <option :value="10">10条</option>
            <option :value="20">20条</option>
            <option :value="50">50条</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 产品详情弹窗 -->
    <ProduceDetailModal
      :show="showDetailModal"
      :inventory="selectedInventory"
      @close="showDetailModal = false"
    />

    <!-- 批量编辑弹窗 -->
    <ProduceInventoryBatchEditModal
      :show="showBatchEditModal"
      :selected-rows="selectedRows"
      :inventory-data="inventoryData"
      :batch-edited-items="batchEditedItems"
      :current-edit-index="currentBatchEditIndex"
      @close="handleBatchEditModalClose"
      @item-select="handleBatchItemSelect"
      @field-change="handleBatchFieldChange"
      @save-all="handleBatchSaveAll"
      @next="handleBatchNext"
    />

    <!-- 导出格式弹窗 -->
    <ExportFormatModal
      :show="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @close="showExportModal = false"
      @update:export-file-type="exportFormat = $event"
      @confirm="handleConfirmExport"
    />

    <!-- 删除确认弹窗 -->
    <DeleteWarningModal
      :show="showDeleteModal"
      :selected-count="selectedRows.length"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
    />

    <!-- 新增库存弹窗 -->
    <ProduceInventoryAddModal
      :show="showAddModal"
      @close="showAddModal = false"
      @add="handleAddInventory"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Package, AlertTriangle, Clock, TrendingUp } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useWarehouseStore } from '@/stores/modules/inventory/useWarehouseStore'
import { getInventoryList, deleteInventoryBatch } from '@/services/apiInventoryService'
import { getAllVarieties } from '@/services/cropVarietyService'
import { ProduceInventoryToolbar, ProduceDetailModal, ProduceInventoryAddModal, ProduceInventoryBatchEditModal } from '@/components/inventory'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'

// 仓库store
const warehouseStore = useWarehouseStore()

// 状态
const inventoryData = ref([])
const searchText = ref('')
const filters = ref({
  warehouseId: '',
  cropName: '',
  grade: '',
  status: '',
  showLowStock: false
})
const selectedInventory = ref(null)
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showBatchEditModal = ref(false)
const showExportModal = ref(false)
const showDeleteModal = ref(false)
const exportFormat = ref('excel')

// 工具栏模式状态
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])

// 批量编辑状态
const batchEditedItems = ref({})
const currentBatchEditIndex = ref(0)

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 数据加载状态
const isLoading = ref(true)

// 加载库存数据
const loadInventoryData = async () => {
  isLoading.value = true
  try {
    const stocks = await getInventoryList({ stockType: 'product' })

    inventoryData.value = stocks.map((stock, index) => ({
      id: stock.id || `PI${String(index + 1).padStart(3, '0')}`,
      productCode: stock.product_code || stock.productCode || '',
      cropName: stock.crop_name || stock.cropName || '',
      variety: stock.variety || '',
      grade: (stock.grade || 'A'),
      quantity: stock.quantity || 0,
      unit: stock.unit || 'kg',
      warehouseId: stock.warehouse_id || stock.warehouseId || '',
      warehouseName: stock.warehouse_name || stock.warehouseName || '',
      storageLocation: stock.storage_location || stock.storageLocation || '',
      harvestDate: stock.harvest_date || stock.harvestDate || '',
      storageDate: stock.storage_date || stock.storageDate || new Date().toISOString().split('T')[0],
      expirationDate: stock.expiration_date || stock.expirationDate || '',
      batchCode: stock.batch_code || stock.batchCode || '',
      greenhouseName: stock.greenhouse_name || stock.greenhouseName || '',
      plantingMode: stock.planting_mode || stock.plantingMode || '',
      alertSettings: (() => {
        const raw = stock.alert_settings || stock.alertSettings
        if (typeof raw === 'string') {
          try { return JSON.parse(raw) } catch { /* ignore */ }
        }
        if (typeof raw === 'object' && raw !== null) return raw
        return {
          enableStorageTimeAlert: false, storageTimeThreshold: 0,
          enableQuantityAlert: false, minQuantityThreshold: 0, maxQuantityThreshold: 0,
          minStock: 0, maxStock: 0, expirationDays: 0
        }
      })(),
      inboundRecords: stock.inboundRecords || [],
      outboundRecords: stock.outboundRecords || [],
      status: stock.status === 'active' ? 'in_stock' : stock.status === 'low_stock' ? 'low_stock' : 'in_stock'
    }))
  } catch (error) {
    console.error('加载库存数据失败:', error)
    inventoryData.value = []
  } finally {
    isLoading.value = false
  }
}

// 预警信息计算
const alerts = computed(() => {
  const result = []
  const today = new Date()

  inventoryData.value.forEach((item) => {
    const storageDays = Math.floor((today.getTime() - new Date(item.storageDate).getTime()) / (1000 * 60 * 60 * 24))
    const remainingDays = Math.floor((new Date(item.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // 存储时间预警
    if (item.alertSettings?.enableStorageTimeAlert && storageDays > item.alertSettings.storageTimeThreshold) {
      result.push({
        type: 'storage_time',
        level: storageDays > item.alertSettings.storageTimeThreshold + 7 ? 'critical' : 'warning',
        message: `${item.cropName}存储时间超过${storageDays}天`,
        threshold: item.alertSettings.storageTimeThreshold,
        currentValue: storageDays
      })
    }

    // 库存不足预警
    if (item.alertSettings?.enableQuantityAlert && item.quantity < item.alertSettings.minQuantityThreshold) {
      result.push({
        type: 'low_stock',
        level: 'warning',
        message: `${item.cropName}库存不足（${item.quantity}${item.unit}）`,
        threshold: item.alertSettings.minQuantityThreshold,
        currentValue: item.quantity
      })
    }

    // 库存过多预警
    if (item.alertSettings?.enableQuantityAlert && item.quantity > item.alertSettings.maxQuantityThreshold) {
      result.push({
        type: 'high_stock',
        level: 'info',
        message: `${item.cropName}库存过多（${item.quantity}${item.unit}）`,
        threshold: item.alertSettings.maxQuantityThreshold,
        currentValue: item.quantity
      })
    }

    // 保质期预警
    if (remainingDays < 0) {
      result.push({
        type: 'expiration',
        level: 'critical',
        message: `${item.cropName}已过期${Math.abs(remainingDays)}天`,
        threshold: 0,
        currentValue: remainingDays
      })
    } else if (remainingDays < 7) {
      result.push({
        type: 'expiration',
        level: 'warning',
        message: `${item.cropName}即将过期（剩余${remainingDays}天）`,
        threshold: 7,
        currentValue: remainingDays
      })
    }
  })

  return result
})

// 预警统计
const alertCounts = computed(() => ({
  total: alerts.value.length,
  storageTime: alerts.value.filter(a => a.type === 'storage_time').length,
  lowStock: alerts.value.filter(a => a.type === 'low_stock').length,
  highStock: alerts.value.filter(a => a.type === 'high_stock').length,
  expiration: alerts.value.filter(a => a.type === 'expiration').length
}))

// 库存不足数量
const lowStockCount = computed(() => {
  return inventoryData.value.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length
})

// 筛选后的数据
const filteredData = computed(() => {
  return inventoryData.value.filter((item) => {
    // 搜索过滤
    if (searchText.value) {
      const search = searchText.value.toLowerCase()
      const cropCode = generateCropCode(item.cropName, item.variety) || ''
      if (
        !cropCode.toLowerCase().includes(search) &&
        !(item.productCode || '').toLowerCase().includes(search) &&
        !item.cropName.toLowerCase().includes(search) &&
        !item.batchCode.toLowerCase().includes(search)
      ) {
        return false
      }
    }

    // 仓库过滤
    if (filters.value.warehouseId && item.warehouseId !== filters.value.warehouseId) {
      return false
    }

    // 作物名称过滤
    if (filters.value.cropName && item.cropName !== filters.value.cropName) {
      return false
    }

    // 品质等级过滤
    if (filters.value.grade && item.grade !== filters.value.grade) {
      return false
    }

    // 状态过滤
    if (filters.value.status && item.status !== filters.value.status) {
      return false
    }

    // 库存不足过滤
    if (filters.value.showLowStock && item.status !== 'low_stock' && item.status !== 'out_of_stock') {
      return false
    }

    return true
  })
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value) || 1)

// 分页数据
const displayedData = computed(() => {
  const startIdx = (currentPage.value - 1) * pageSize.value
  const endIdx = Math.min(startIdx + pageSize.value, filteredData.value.length)
  return filteredData.value.slice(startIdx, endIdx)
})

// 获取唯一的作物名称列表
const cropNames = computed(() => {
  const names = [...new Set(inventoryData.value.map((item) => item.cropName))]
  return names
})

// 全选状态（基于筛选后的全部数据，不是当前页）
const isAllSelected = computed(() => {
  return filteredData.value.length > 0 && selectedRows.value.length === filteredData.value.length
})

// 生成作物编码
const generateCropCode = (cropName, variety) => {
  const allVarieties = getAllVarieties()

  const exactMatch = allVarieties.find(v => {
    const varietyMatch = v.subVariety1Name === variety || v.varietyName === variety
    const cropMatch = v.varietyName === cropName || v.typeName === cropName || v.categoryName === cropName
    return varietyMatch && cropMatch
  })
  if (exactMatch?.cropCode?.length >= 9) {
    return exactMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  const subMatch = allVarieties.find(v => v.subVariety1Name === variety)
  if (subMatch?.cropCode?.length >= 9) {
    return subMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  const varietyMatch = allVarieties.find(v => v.varietyName === variety)
  if (varietyMatch?.cropCode?.length >= 9) {
    return varietyMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  const cropMatch = allVarieties.find(v => v.varietyName === cropName)
  if (cropMatch?.cropCode?.length >= 9) {
    return cropMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  const typeMatch = allVarieties.find(v => v.typeName === cropName)
  if (typeMatch?.cropCode?.length >= 9) {
    return typeMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  return 'OT0000000000'
}

// 计算存储天数
const getStorageDays = (storageDate) => {
  if (!storageDate) return 0
  return Math.floor((new Date().getTime() - new Date(storageDate).getTime()) / (1000 * 60 * 60 * 24))
}

// 品质等级标签样式
const gradeTagClass = (grade) => {
  const classes = { 'A': 'bg-green-100 text-green-700', 'B': 'bg-blue-100 text-blue-700', 'C': 'bg-amber-100 text-amber-700' }
  return classes[grade] || 'bg-gray-100 text-gray-700'
}

// 状态标签样式
const statusTagClass = (status) => {
  const classes = {
    'in_stock': 'bg-green-100 text-green-700',
    'low_stock': 'bg-amber-100 text-amber-700',
    'expired': 'bg-red-100 text-red-700',
    'out_of_stock': 'bg-gray-100 text-gray-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

// 状态标签文本
const statusLabel = (status) => {
  const labels = {
    'in_stock': '正常',
    'low_stock': '库存不足',
    'expired': '已过期',
    'out_of_stock': '缺货'
  }
  return labels[status] || '正常'
}

// 单行选中切换
const toggleRowSelection = (id) => {
  const idx = selectedRows.value.indexOf(id)
  if (idx >= 0) {
    selectedRows.value = selectedRows.value.filter(rid => rid !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchText.value = ''
  filters.value = {
    warehouseId: '',
    cropName: '',
    grade: '',
    status: '',
    showLowStock: false
  }
  currentPage.value = 1
}

const handleViewDetail = (inventory) => {
  selectedInventory.value = inventory
  showDetailModal.value = true
}

const handleLowStockToggle = () => {
  filters.value.showLowStock = !filters.value.showLowStock
  currentPage.value = 1
}

const handleBatchEdit = () => {
  selectedRows.value = []
  batchEditMode.value = true
}

const handleDelete = () => {
  deleteMode.value = true
  selectedRows.value = []
}

const handleExport = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleCancelSelection = () => {
  batchEditMode.value = false
  deleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
  showBatchEditModal.value = false
  batchEditedItems.value = {}
  currentBatchEditIndex.value = 0
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

const handleConfirmBatchEdit = () => {
  if (selectedRows.value.length > 0) {
    showBatchEditModal.value = true
    currentBatchEditIndex.value = 0
    batchEditedItems.value = {}
  }
  batchEditMode.value = false
}

const handleBatchEditModalClose = () => {
  showBatchEditModal.value = false
  batchEditedItems.value = {}
  currentBatchEditIndex.value = 0
  selectedRows.value = []
}

const handleBatchItemSelect = (index) => {
  currentBatchEditIndex.value = index
}

const handleBatchFieldChange = (id, field, value) => {
  batchEditedItems.value = {
    ...batchEditedItems.value,
    [id]: { ...batchEditedItems.value[id], [field]: value }
  }
}

const handleBatchSaveAll = async () => {
  // 更新本地状态
  const updatedItems = inventoryData.value.map(item => {
    if (batchEditedItems.value[item.id]) {
      return { ...item, ...batchEditedItems.value[item.id] }
    }
    return item
  })
  inventoryData.value = updatedItems

  // 同步到后端API
  const savePromises = Object.keys(batchEditedItems.value).map(async (itemId) => {
    const item = updatedItems.find(i => i.id === itemId)
    const edits = batchEditedItems.value[itemId]
    if (!item) return

    const merged = { ...item, ...edits }
    const body = {}
    if (edits.productCode !== undefined) body.product_code = merged.productCode
    if (edits.quantity !== undefined) body.quantity = merged.quantity
    if (edits.storageLocation !== undefined) body.storage_location = merged.storageLocation
    if (edits.alertSettings !== undefined) body.alert_settings = JSON.stringify(merged.alertSettings)

    if (Object.keys(body).length === 0) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (error) {
      console.error(`保存库存 ${itemId} 失败:`, error)
      ElMessage.error(`保存库存失败`)
    }
  })

  await Promise.all(savePromises)

  showBatchEditModal.value = false
  batchEditedItems.value = {}
  currentBatchEditIndex.value = 0
  batchEditMode.value = false
  selectedRows.value = []
  ElMessage.success('保存成功')
}

const handleBatchNext = () => {
  if (currentBatchEditIndex.value < selectedRows.value.length - 1) {
    currentBatchEditIndex.value++
  }
}

const handleConfirmDelete = async () => {
  inventoryData.value = inventoryData.value.filter(item => !selectedRows.value.includes(item.id))
  showDeleteModal.value = false
  deleteMode.value = false

  try {
    await deleteInventoryBatch(selectedRows.value)
    ElMessage.success(`删除 ${selectedRows.value.length} 条库存记录成功`)
  } catch (error) {
    console.error('删除库存记录失败:', error)
    ElMessage.error('删除失败')
  }
  selectedRows.value = []
}

const handleConfirmExport = () => {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))
  const exportData = selectedData.length > 0 ? selectedData : filteredData.value

  // 生成Excel HTML内容
  const headers = ['作物编码', '作物品种', '品种路径', '等级', '库存数量', '单位', '库存限值', '仓库', '存放位置', '入库时间', '保质期(天)', '过期时间', '存储时间', '预警状态', '备注']
  const rows = exportData.map(item => [
    generateCropCode(item.cropName, item.variety) || item.productCode,
    item.variety,
    item.cropName,
    item.grade,
    item.quantity,
    item.unit,
    `${item.alertSettings?.minStock || 0}~${item.alertSettings?.maxStock || 0}`,
    item.warehouseName,
    item.storageLocation,
    item.storageDate,
    item.alertSettings?.expirationDays || 0,
    item.expirationDate,
    `${getStorageDays(item.storageDate)}天`,
    statusLabel(item.status),
    '-'
  ])

  let content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
  rows.forEach(row => {
    content += `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`
  })
  content += '</table></body></html>'

  const mimeType = 'application/vnd.ms-excel;charset=utf-8'
  const extension = 'xls'
  const fileName = `作物库存汇总表_${new Date().toISOString().slice(0, 10)}.${extension}`

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

const handleAddInventory = (newData) => {
  const newRecord = {
    ...newData,
    id: `PI${String(inventoryData.value.length + 1).padStart(3, '0')}`
  }
  inventoryData.value.unshift(newRecord)
  showAddModal.value = false
  ElMessage.success('新增成功')
}

// 初始化
onMounted(() => {
  loadInventoryData()
  if (warehouseStore.warehouses.length === 0) {
    warehouseStore.loadWarehouses()
  }
})
</script>
