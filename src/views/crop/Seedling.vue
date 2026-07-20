<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" style="color: white;">
            <Sugar />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">育苗管理</h1>
          <p class="text-gray-500">管理种苗培育、生长记录和移栽操作</p>
        </div>
      </div>
    </div>

    <!-- 筛选组件 -->
    <SeedlingFilter
      :filters="filters"
      :crop-names="cropNames"
      :seedling-types="seedlingTypes"
      :sites="sites"
      :status-options="seedlingStatusOptions"
      @update:filters="handleFiltersChange"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <div v-loading="loading">
      <SeedlingTable
        :data="filteredData"
        :pagination="pagination"
        :selected-rows="selectedRows"
        :loading="loading"
        :operation-mode="operationMode"
        :export-mode="exportMode"
        :print-mode="printMode"
        :can-create="canCreate"
        :can-edit="canEdit"
        :can-delete="canDelete"
        :can-export="canExport"
        :can-print="canPrint"
        @add="handleAdd"
        @detail="handleDetail"
        @edit="handleEdit"
        @daily-record="handleDailyRecord"
        @print="handlePrint"
        @delete="handleDelete"
        @export="handleExportClick"
        @confirm-export="handleExportClickConfirm"
        @cancel-export="handleExportCancel"
        @operation-mode-change="handleOperationModeChange"
        @print-mode-change="handlePrintModeChange"
        @export-select-all="handleExportSelectAll"
        @confirm-print="handleConfirmPrint"
        @update:pagination="(p) => pagination = p"
        @update:selected-rows="(rows) => selectedRows = rows"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @label-manage="handleLabelManage"
        @image-click="handleImageClick"
        @end="handleEnd"
        @inbound="handleInbound"
        @propagation="handlePropagation"
      />
    </div>

    <!-- 新增弹窗 -->
    <AddModal v-model:visible="addModalVisible" @success="loadItems" />

    <!-- 编辑弹窗 -->
    <EditModal
      v-if="currentRecord"
      v-model:visible="editModalVisible"
      :record="currentRecord"
      @success="loadItems"
    />

    <!-- 详情弹窗 -->
    <DetailModal
      v-if="currentRecord"
      v-model:visible="detailModalVisible"
      :record="currentRecord"
    />

    <!-- 每日记录弹窗 -->
    <DailyRecordModal
      v-if="currentRecord"
      v-model:visible="dailyRecordModalVisible"
      :record="currentRecord"
      :read-only="Boolean(currentRecord.status === 'completed' || currentRecord.status === 'abnormal' || currentRecord.status === 'cancelled' || currentRecord.endType === 'normal' || currentRecord.endType === 'abnormal')"
      @success="handleDailyRecordSuccess"
    />
    <!-- 2026-07-18 P0-DIFF：补 V1.1 无性繁殖记录弹窗（独立入口，only 1:多）-->
    <SeedlingPropagationModal
      v-if="currentRecord"
      v-model:visible="propagationModalVisible"
      :record="currentRecord"
      :read-only="Boolean(currentRecord.status === 'completed' || currentRecord.status === 'abnormal' || currentRecord.endType === 'normal' || currentRecord.endType === 'abnormal')"
      @success="loadItems"
    />

    <!-- 打印标签弹窗 -->
    <PrintLabelModal
      v-if="currentRecord"
      v-model:visible="printModalVisible"
      :record="currentRecord"
    />

    <!-- 图片预览弹窗 -->
    <ImageLightboxModal v-model:visible="lightboxVisible" :images="currentImages" />

    <!-- 标签管理弹窗 -->
    <SeedlingLabelManageModal
      v-if="labelManageRecord"
      v-model:visible="labelManageModalVisible"
      :seedling-id="labelManageRecord.id"
      :seedling-code="labelManageRecord.seedlingCode"
      :auto-select-label-number="autoSelectLabelNumber"
      :read-only="Boolean(labelManageRecord.status === 'completed' || labelManageRecord.status === 'abnormal' || labelManageRecord.endType === 'normal' || labelManageRecord.endType === 'abnormal')"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      v-model:visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @confirm="handleConfirmExport"
      @update:export-file-type="exportFormat = $event"
    />
    <!-- 删除确认弹窗（对齐 V1.1 DeleteConfirmModal UI 库组件） -->
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :selected-count="pendingDeleteIds.length"
      :on-close="() => { showDeleteModal = false; pendingDeleteIds = [] }"
      :on-confirm="handleDeleteConfirm"
      title="删除警告"
    />

    <!-- 出圃入库弹窗（对齐 V1.1 UnifiedRowHarvestInboundModal 共享组件） -->
    <UnifiedRowHarvestInboundModal
      v-if="inboundModal.record"
      :is-open="inboundModal.open"
      :on-close="() => { inboundModal = { open: false, record: null } }"
      :on-success="handleInboundSuccess"
      stock-type="seedling"
      source-module="seedling"
      :source-record="{
        id: inboundModal.record.id,
        code: inboundModal.record.seedlingCode,
        cropName: inboundModal.record.cropName || '',
        cropVariety: inboundModal.record.cropVariety || '',
        cropCode: inboundModal.record.cropCode || '',
        unit: '株',
        endTime: inboundModal.record.endTime,
        status: inboundModal.record.status,
      }"
    />
    <!-- 结束育苗确认弹窗（对齐 V1.1 L782-818 inline div + AlertTriangle） -->
    <div v-if="endConfirm.record" class="fixed inset-0 z-[70] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="endConfirm = { record: null }"></div>
      <div class="relative bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl">
          <h3 class="text-base font-semibold text-white flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><WarningFilled /></el-icon> 确认结束育苗记录
          </h3>
          <el-button link size="small" class="!text-white hover:!bg-red-700" @click="endConfirm = { record: null }">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="p-4 space-y-3">
          <div class="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <div class="text-sm font-semibold text-red-800">⚠️ 结束育苗记录</div>
            <div class="text-xs text-red-700 mt-1">
              结束后将锁定日常运维操作（移栽、出圃、修改等）。<br />
              <span class="font-semibold">仍可补录遗漏的库存</span>（通过"出圃入库"按钮，必填补录原因）。<br />
              <span class="font-semibold">此操作不可撤销！</span>
            </div>
          </div>
        </div>
        <div class="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
          <el-button size="small" @click="endConfirm = { record: null }">取消</el-button>
          <el-button size="small" type="danger" @click="executeEnd">确认结束</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 育苗管理主页面
 */
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Sugar } from '@element-plus/icons-vue'
import SeedlingStats from '@/components/farm/seedling/components/SeedlingStats.vue'
import SeedlingFilter from '@/components/farm/seedling/components/SeedlingFilter.vue'
import SeedlingTable from '@/components/farm/seedling/components/SeedlingTable.vue'
import AddModal from '@/components/farm/seedling/modals/AddModal.vue'
import EditModal from '@/components/farm/seedling/modals/EditModal.vue'
import DetailModal from '@/components/farm/seedling/modals/DetailModal.vue'
import DailyRecordModal from '@/components/farm/seedling/modals/DailyRecordModal.vue'
import PrintLabelModal from '@/components/farm/seedling/modals/PrintLabelModal.vue'
import SeedlingLabelManageModal from '@/components/farm/seedling/modals/SeedlingLabelManageModal.vue'
// 2026-07-20：补缺失的 import（修复浏览器报错 "Failed to resolve component: SeedlingPropagationModal"）
import SeedlingPropagationModal from '@/components/farm/seedling/modals/SeedlingPropagationModal.vue'
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal.vue'
import UnifiedRowHarvestInboundModal from '@/components/farm/inventory/UnifiedRowHarvestInboundModal.vue'
import { useSeedlingStore } from '@/stores/modules/seedling'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import * as cropBatchService from '@/services/apiCropBatchService'
import * as cropVarietyService from '@/services/cropVarietyService'
import { getDictItems } from '@/stores/modules/dictionary'
import { useRoute } from 'vue-router'
import { enhancedApiClient } from '@/lib/apiClient'

// 权限检查 - 已取消，所有人可使用所有功能
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true
const canPrint = true

// Store
const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()
const route = useRoute()

// 状态
const loading = computed(() => seedlingStore.isLoading)
const items = computed(() => seedlingStore.items)

// 种源数据（用于新增弹窗）
const seedSources = ref([])

// 作物品种选项（从育苗记录中实际存在的品种提取）
const cropNames = computed(() => {
  const seen = new Set()
  const uniqueCrops = []
  items.value.forEach(item => {
    if (item.cropName && !seen.has(item.cropName)) {
      seen.add(item.cropName)
      uniqueCrops.push({ value: item.cropName, label: item.cropName })
    }
  })
  // 按名称排序
  uniqueCrops.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))
  return uniqueCrops
})

// 作物品种选项（从品种库服务获取，供弹窗使用）
const cropVarietyOptions = computed(() => {
  cropVarietyService.initVarieties()
  return cropVarietyService.getVarietyOptions()
})

// 筛选条件（支持更多筛选字段）
const filters = ref({
  cropName: '',
  seedlingCode: '',
  sourceCode: '',
  startDate: '',
  endDate: '',
  siteName: '',
  seedlingType: '',
  createBy: '',
  status: '',
  // 更多筛选条件
  initialCountMin: undefined,
  initialCountMax: undefined,
  survivalCountMin: undefined,
  survivalCountMax: undefined,
  lossCountMin: undefined,
  lossCountMax: undefined,
  surplusMin: undefined,
  surplusMax: undefined,
  survivalRateMin: undefined,
  survivalRateMax: undefined,
  lossRateMin: undefined,
  lossRateMax: undefined
})

// 分页
const pagination = ref({ current: 1, pageSize: 10 })

// 选中的行
const selectedRows = ref([])

// 弹窗状态
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const detailModalVisible = ref(false)
const dailyRecordModalVisible = ref(false)
const propagationModalVisible = ref(false)
const printModalVisible = ref(false)
const lightboxVisible = ref(false)
const labelManageModalVisible = ref(false)
const showExportModal = ref(false)
// 2026-07-18 P0-DIFF：补 V1.1 缺失的删除/出圃/结束状态
const showDeleteModal = ref(false)
const pendingDeleteIds = ref([])
const inboundModal = ref({ open: false, record: null, quantity: 1, warehouseName: '', remarks: '' })
const endConfirm = ref({ record: null })
const autoSelectLabelNumber = ref(undefined)

// 当前操作的记录
const currentRecord = ref(null)
const currentImages = ref([])
const labelManageRecord = ref(null)

// 导出状态
const exportMode = ref(false)
const exportFormat = ref('excel')

// 操作模式状态
const operationMode = ref('normal') // 'normal' | 'edit' | 'delete' | 'export' | 'print'

// 打印模式状态
const printMode = ref(false)
// 多记录打印时使用（对齐 V1.1 L242）
const printRecords = ref([])

// 育苗方式选项（对齐 V1.1 L106-115：从字典 seedling_type 读取，去重）
const seedlingTypes = ref([])
const loadSeedlingTypes = () => {
  try {
    const items = getDictItems('seedling_type').map(d => ({ value: d.dictCode, label: d.dictLabel }))
    const seen = new Set()
    seedlingTypes.value = items.filter(t => {
      if (seen.has(t.value)) return false
      seen.add(t.value)
      return true
    })
    if (seedlingTypes.value.length === 0) {
      // 字典未加载时降级用硬编码
      seedlingTypes.value = [
        { value: '穴盘育苗', label: '穴盘育苗' },
        { value: '嫁接育苗', label: '嫁接育苗' },
        { value: '组培育苗', label: '组培育苗' },
        { value: '直播育苗', label: '直播育苗' }
      ]
    }
  } catch {
    seedlingTypes.value = [
      { value: '穴盘育苗', label: '穴盘育苗' },
      { value: '嫁接育苗', label: '嫁接育苗' },
      { value: '组培育苗', label: '组培育苗' },
      { value: '直播育苗', label: '直播育苗' }
    ]
  }
}

// 场地选项（对齐 V1.1 L118-127：从字典 seedling_site 读取，去重）
const sites = ref([])
const loadSites = () => {
  try {
    const items = getDictItems('seedling_site').map(d => ({ value: d.dictCode, label: d.dictLabel }))
    const seen = new Set()
    sites.value = items.filter(s => {
      if (seen.has(s.value)) return false
      seen.add(s.value)
      return true
    })
    if (sites.value.length === 0) {
      sites.value = [
        { value: '1号大棚', label: '1号大棚' },
        { value: '2号大棚', label: '2号大棚' },
        { value: '3号大棚', label: '3号大棚' },
        { value: '露天场地', label: '露天场地' }
      ]
    }
  } catch {
    sites.value = [
      { value: '1号大棚', label: '1号大棚' },
      { value: '2号大棚', label: '2号大棚' },
      { value: '3号大棚', label: '3号大棚' },
      { value: '露天场地', label: '露天场地' }
    ]
  }
}

// 状态选项（对齐 V1.1 SeedlingPage.tsx L130-137 — 6 状态：sown/in_progress/transplant_ready/completed/cancelled/abnormal）
const seedlingStatusOptions = ref([
  { value: 'sown', label: '已播种' },
  { value: 'in_progress', label: '生长中' },
  { value: 'transplant_ready', label: '待出圃' },
  { value: 'completed', label: '已出圃' },
  { value: 'cancelled', label: '已取消' },
  { value: 'abnormal', label: '异常结束' }
])

// 兼容旧引用
const statusOptions = seedlingStatusOptions

// 筛选后的数据
const filteredData = computed(() => {
  return items.value.filter(item => {
    // 使用 startsWith 替代 includes，避免误匹配
    if (filters.value.cropName && filters.value.cropName !== '__all__' && !item.cropName?.startsWith(filters.value.cropName)) return false
    if (filters.value.seedlingCode && !item.seedlingCode?.startsWith(filters.value.seedlingCode)) return false
    if (filters.value.sourceCode && !item.sourceCode?.startsWith(filters.value.sourceCode)) return false
    if (filters.value.siteName && filters.value.siteName !== '__all__' && item.siteName !== filters.value.siteName) return false
    if (filters.value.seedlingType && filters.value.seedlingType !== '__all__' && item.seedlingType !== filters.value.seedlingType) return false
    if (filters.value.status && filters.value.status !== '__all__' && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.startDate < filters.value.startDate) return false
    if (filters.value.endDate && item.startDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy?.startsWith(filters.value.createBy)) return false
    // 更多筛选条件
    if (filters.value.initialCountMin !== undefined && item.initialCount < filters.value.initialCountMin) return false
    if (filters.value.initialCountMax !== undefined && item.initialCount > filters.value.initialCountMax) return false
    if (filters.value.survivalCountMin !== undefined && item.survivalCount < filters.value.survivalCountMin) return false
    if (filters.value.survivalCountMax !== undefined && item.survivalCount > filters.value.survivalCountMax) return false
    if (filters.value.lossCountMin !== undefined && item.lossCount < filters.value.lossCountMin) return false
    if (filters.value.lossCountMax !== undefined && item.lossCount > filters.value.lossCountMax) return false
    // 剩余数量 = initialCount - lossCount
    const surplus = item.initialCount - item.lossCount
    if (filters.value.surplusMin !== undefined && surplus < filters.value.surplusMin) return false
    if (filters.value.surplusMax !== undefined && surplus > filters.value.surplusMax) return false
    if (filters.value.survivalRateMin !== undefined && item.survivalRate < filters.value.survivalRateMin) return false
    if (filters.value.survivalRateMax !== undefined && item.survivalRate > filters.value.survivalRateMax) return false
    if (filters.value.lossRateMin !== undefined && item.lossRate < filters.value.lossRateMin) return false
    if (filters.value.lossRateMax !== undefined && item.lossRate > filters.value.lossRateMax) return false
    return true
  })
})

// 统计卡片数据
const statsData = computed(() => {
  const total = items.value.length
  const inProgress = items.value.filter(s => s.status === 'in_progress').length
  const completed = items.value.filter(s => s.status === 'completed').length
  const monthCount = items.value.filter(s => {
    const date = new Date(s.createTime)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return { total, inProgress, completed, monthCount }
})

// 加载数据
const loadItems = async () => {
  await seedlingStore.loadItems()
}

// 加载种源数据
const loadSeedSources = async () => {
  try {
    await seedSourceStore.loadItems()
    seedSources.value = seedSourceStore.items
  } catch (error) {
    console.error('获取种源数据失败:', error)
  }
}

// 处理筛选条件变化
const handleFiltersChange = (newFilters) => {
  filters.value = { ...newFilters }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
}

// 重置
const handleReset = () => {
  filters.value = {
    cropName: '',
    seedlingCode: '',
    sourceCode: '',
    startDate: '',
    endDate: '',
    siteName: '',
    seedlingType: '',
    createBy: '',
    status: '',
    // 更多筛选条件
    initialCountMin: undefined,
    initialCountMax: undefined,
    survivalCountMin: undefined,
    survivalCountMax: undefined,
    lossCountMin: undefined,
    lossCountMax: undefined,
    surplusMin: undefined,
    surplusMax: undefined,
    survivalRateMin: undefined,
    survivalRateMax: undefined,
    lossRateMin: undefined,
    lossRateMax: undefined
  }
  pagination.value.current = 1
}

// 新增
const handleAdd = () => {
  currentRecord.value = null
  addModalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  currentRecord.value = record
  editModalVisible.value = true
}

// 详情
const handleDetail = (record) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

// 每日记录
const handleDailyRecord = (record) => {
  currentRecord.value = record
  dailyRecordModalVisible.value = true
}
// 2026-07-18 P0-DIFF：补 V1.1 无性繁殖记录触发
const handlePropagation = (record) => {
  currentRecord.value = record
  propagationModalVisible.value = true
}
// 2026-07-18 P0-DIFF：补 V1.1 DeleteConfirmModal 弹窗式删除（与 V1.1 对齐）
const handleDeleteConfirm = async () => {
  const ids = [...pendingDeleteIds.value]
  if (ids.length === 0) return
  showDeleteModal.value = false
  try {
    await seedlingStore.deleteItems(ids)
    selectedRows.value = []
    pendingDeleteIds.value = []
    ElMessage.success(`已删除 ${ids.length} 条育苗记录`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.error(`删除失败：${msg}`)
  }
}
// 2026-07-18 P0-DIFF：补 V1.1 出圃入库（V2.0 用简化版 ElDialog 替代 UnifiedRowHarvestInboundModal）
const handleInbound = (record) => {
  inboundModal.value = { open: true, record, quantity: 1, warehouseName: '', remarks: '' }
}
const handleInboundSuccess = async () => {
  // 对齐 V1.1 L307-310：入库成功后立即刷新列表（让列表的 harvestStockedCount 实时更新）
  inboundModal.value = { open: false, record: null }
  await loadItems()
}

// 每日记录保存成功后刷新数据
const handleDailyRecordSuccess = async () => {
  await loadItems()
  // 从最新 store 数据中找到对应的记录并更新 currentRecord
  if (currentRecord.value) {
    const updatedRecord = items.value.find(s => s.id === currentRecord.value.id)
    if (updatedRecord) {
      currentRecord.value = updatedRecord
    }
  }
}
// 打印
const handlePrint = (record) => {
  currentRecord.value = record
  printModalVisible.value = true
}

// 删除（2026-07-18 P0-DIFF：改为弹窗确认以对齐 V1.1 DeleteConfirmModal）
const handleDelete = (ids) => {
  if (!ids || ids.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  pendingDeleteIds.value = ids
  showDeleteModal.value = true
}

// 操作模式变化
const handleOperationModeChange = (mode) => {
  operationMode.value = mode

  // 导出模式
  if (mode === 'export') {
    exportMode.value = true
    selectedRows.value = []
    return
  }

  // 取消导出模式
  if (mode !== 'export') {
    exportMode.value = false
  }

  // 编辑/删除模式不清空选择
  if (mode === 'edit' || mode === 'delete') {
    return
  }

  // 其他模式清空选择
  selectedRows.value = []
}

// 打印模式变化
const handlePrintModeChange = (mode) => {
  printMode.value = mode
  if (mode) {
    selectedRows.value = []
  }
}

// 全选/取消全选（导出模式）
const handleExportSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

// 导出点击
const handleExportClick = () => {
  operationMode.value = 'export'
  exportMode.value = true
  selectedRows.value = []
}

// 取消导出
const handleExportCancel = () => {
  operationMode.value = 'normal'
  exportMode.value = false
  selectedRows.value = []
}

// 确认导出
const handleExportClickConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 确认打印处理（对齐 V1.1 L461-477：单条直接打印，多条设置 printRecords 走批量）
const handleConfirmPrint = (records) => {
  if (!records || records.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  printRecords.value = records
  if (records.length === 1) {
    currentRecord.value = records[0]
    printModalVisible.value = true
  } else {
    // 多条记录打开打印弹窗选择
    currentRecord.value = records[0]
    printModalVisible.value = true
  }
  printMode.value = false
  selectedRows.value = []
}

// 选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 分页变化
const handlePageChange = (page) => {
  pagination.value.current = page
}

// 每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
}

// 标签管理
const handleLabelManage = (record) => {
  labelManageRecord.value = record
  labelManageModalVisible.value = true
}

// 图片预览
const handleImageClick = (images) => {
  currentImages.value = images
  lightboxVisible.value = true
}

// 结束育苗（对齐 V1.1 L341-396：单态结束，只更新 seedling 自己的状态）
const handleEnd = (record, endType = 'normal') => {
  // 检查是否已结束
  if (record.status === 'completed' || record.endType === 'normal' || record.endType === 'abnormal') {
    ElMessage.warning('该育苗记录已结束，不能再次操作')
    return
  }
  // 设置 endConfirm 显示自定义确认弹窗（不再用 ElMessageBox）
  endConfirm.value = { record, endType }
}

// 执行结束操作（用户在自定义弹窗点"确认结束"时调用）
const executeEnd = async () => {
  if (!endConfirm.value?.record) return
  const record = endConfirm.value.record
  const endType = endConfirm.value.endType || 'normal'

  try {
    // 2026-07-19 P0-FIX：直接更新 seedling 自己的状态（对齐 V1.1 L349-378）
    const seedlingStore = useSeedlingStore()
    const updatedRecord = {
      ...record,
      status: 'completed',
      endType,
      endTime: new Date().toISOString(),
      isFinished: true,
      isHarvestLocked: 0  // 允许补录
    }

    // 调用 Store 更新
    const success = await seedlingStore.updateItem(record.id, updatedRecord)
    if (success) {
      ElMessage.success('育苗记录已结束（仍可补录遗漏库存）')
      endConfirm.value = { record: null }
      await loadItems()
    } else {
      ElMessage.error('结束失败')
    }
  } catch (error) {
    console.error('[handleEnd] 结束育苗失败:', error)
    ElMessage.error('结束失败：' + (error.message || '未知错误'))
  }
}

// 确认导出
const handleConfirmExport = async () => {
  // 获取选中的数据
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))

  // 导出表头
  const headers = [
    '育苗批号', '作物编码', '关联种源', '作物名称', '作物品种',
    '育苗方式', '场地', '开始日期', '预计结束日期', '实际结束日期',
    '初始数量', '成苗数量', '已定植数量', '损耗数量', '剩余总数',
    '成苗率', '损耗率', '育苗结束', '状态', '品质等级',
    '创建人', '创建时间', '备注'
  ]

  // 计算剩余总数
  const getRemainingCount = (record) => record.initialCount - record.lossCount

  // 获取状态标签
  const getStatusLabel = (status) => {
    const map = {
      'in_progress': '进行中',
      'transplant_ready': '待定植',
      'completed': '已完成',
      'abnormal': '异常'
    }
    return map[status] || status
  }

  // 生成导出数据
  const exportData = selectedData.map(record => ({
    '育苗批号': record.seedlingCode,
    '作物编码': record.cropCode || '',
    '关联种源': record.sourceCode,
    '作物名称': record.cropName,
    '作物品种': record.cropVariety,
    '育苗方式': record.seedlingType || '',
    '场地': record.siteName,
    '开始日期': record.startDate,
    '预计结束日期': record.expectedEndDate || '',
    '实际结束日期': record.endDate || '',
    '初始数量': record.initialCount,
    '成苗数量': record.survivalCount,
    '已定植数量': record.plantedCount,
    '损耗数量': record.lossCount,
    '剩余总数': getRemainingCount(record),
    '成苗率': `${record.survivalRate}%`,
    '损耗率': `${record.lossRate}%`,
    '育苗结束': record.isFinished ? '是' : '否',
    '状态': getStatusLabel(record.status),
    '品质等级': record.qualityGrade || '',
    '创建人': record.createBy,
    '创建时间': record.createTime,
    '备注': record.remarks || ''
  }))

  // 创建内容
  const isCsv = exportFormat.value === 'csv'
  const content = isCsv
    ? headers.join(',') + '\n' + exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
    : `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const mimeType = isCsv ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel;charset=utf-8'
  const extension = isCsv ? 'csv' : 'xls'

  const fileName = `育苗管理_${new Date().toISOString().slice(0, 10)}.${extension}`

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
    ElMessage.error('导出失败')
  }

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

// 初始化
onMounted(async () => {
  // 加载字典（育苗方式/场地/单位等）— 对齐 V1.1 L53-60
  loadSeedlingTypes()
  loadSites()
  // 加载育苗数据
  await loadItems()
  // 加载种源数据（用于新增弹窗的关联种源选择）
  await loadSeedSources()

  // URL ?labelNumber= 扫码跳转 — 对齐 V1.1 L178-213
  const labelNumber = route.query.labelNumber
  if (labelNumber) {
    try {
      const label = await enhancedApiClient.get(`/plant-labels/by-number/${encodeURIComponent(String(labelNumber))}`)
      const lbl = label?.label || label
      if (lbl && lbl.seedlingId) {
        // 从 labelNumber 提取 seedlingCode（格式：{seedlingCode}-{4位序号}）
        const parts = String(labelNumber).split('-')
        const seedlingCode = parts.length > 1 ? parts.slice(0, -1).join('-') : String(labelNumber)
        labelManageRecord.value = { id: String(lbl.seedlingId), seedlingCode }
        autoSelectLabelNumber.value = String(labelNumber)
        labelManageModalVisible.value = true
      }
    } catch {
      // 扫码查询失败，静默处理
    }
  }
})
</script>
