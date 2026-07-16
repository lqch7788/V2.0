<template>
  <!--
    种源管理主页面（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/SeedSourcePage.tsx

    功能：种源列表展示、筛选、新增、编辑、删除、标签打印、图片查看、导出Excel
    2026-06-25 v3: 种源是纯仓库 — 移除繁殖过程/阶段推进/回流记录弹窗
    2026-07-07 V3.4：取消「入库登记（外购）」入口
  -->
  <div class="space-y-6">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Package :size="24" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">内部种源</h1>
            <p class="text-gray-500">管理种源批次、采购入库和库存记录</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 2026-06-05: 顶部统计卡片已删除（user 要求） -->

    <!-- 筛选器 -->
    <SeedSourceFilter
      :filters="filters"
      :on-change="setFilters"
      :on-search="handleSearch"
      :on-reset="handleReset"
      :crop-categories="cropCategories"
      :suppliers="suppliers"
      :status-options="statusOptions"
    />

    <!-- 数据表格 -->
    <SeedSourceTable
      :data="filteredData"
      :pagination="pagination"
      :selected-rows="selectedRows"
      :operation-mode="batchOp.mode"
      :export-mode="exportMode"
      :print-mode="printMode"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-export="canExport"
      :can-print="canPrint"
      :loading="isLoading"
      @update:pagination="setPagination"
      @update:selected-rows="setSelectedRows"
      @add="handleAdd"
      @edit="handleEdit"
      @detail="handleDetail"
      @delete="handleDelete"
      @transfer="handleTransfer"
      @return="handleReturn"
      @label-manage="handleLabelManage"
      @operation-mode-change="handleOperationModeChange"
      @print-mode-change="handlePrintModeChange"
      @confirm-print="handlePrintConfirm"
      @export-cancel="handleExportCancel"
      @confirm-export="handleExportClickConfirm"
      @export-select-all="handleExportSelectAll"
    />

    <!-- 弹窗 -->
    <AddModal
      v-model:visible="addModalOpen"
      :units="units"
      @success="loadItems"
    />

    <EditModal
      v-if="currentRecord"
      v-model:visible="editModalOpen"
      :record="currentRecord"
      @success="loadItems"
    />

    <DetailModal
      v-if="currentRecord"
      v-model:visible="detailModalOpen"
      :record="currentRecord"
    />

    <PrintLabelModal
      v-if="currentRecord"
      v-model:visible="printModalOpen"
      :record="currentRecord"
    />

    <ImageLightboxModal
      v-model:visible="lightboxOpen"
      :images="currentImages"
    />

    <ExportFormatModal
      v-model:visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @update:export-file-type="exportFormat = $event"
      @confirm="handleConfirmExport"
    />

    <!-- 调拨入库弹窗（append_existing 模式 — 追加到目标种源，对齐 V1.1 UnifiedModal size=xl 1170px） -->
    <el-dialog
      v-if="transferModal.record"
      v-model="transferModal.open"
      :title="`调拨入库 - ${transferModal.record.seedCode}（追加模式）`"
      width="1170px"
      v-dialog-draggable
      :show-close="false"
      @close="handleTransferClose"
    >
      <!-- 2026-07-15: 1:1 对齐 V1.1 UnifiedModal 绿色渐变 header -->
      <template #header>
        <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">{{ `调拨入库 - ${transferModal.record.seedCode}（追加模式）` }}</h3>
          <button
            type="button"
            class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
            aria-label="关闭"
            @click="handleTransferClose"
          >
            <X :size="20" />
          </button>
        </div>
      </template>
      <InventoryTransferPanel
        mode="append_existing"
        :target-seed-source-id="transferModal.record.id"
        :target-crop-name="transferModal.record.cropName"
        :target-crop-variety="transferModal.record.cropVariety || transferModal.record.varietyName"
        @confirm="handleTransferConfirm"
      />
    </el-dialog>

    <!-- 退库弹窗（严格 1:1 关联原库存，对齐 V1.1 UnifiedModal size=xl 1170px） -->
    <el-dialog
      v-if="returnModal.record"
      v-model="returnModal.open"
      :title="`退库 - ${returnModal.record.seedCode}（退回原作物库存）`"
      width="1170px"
      v-dialog-draggable
      :show-close="false"
      @close="handleReturnClose"
    >
      <!-- 2026-07-15: 1:1 对齐 V1.1 UnifiedModal 绿色渐变 header -->
      <template #header>
        <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">{{ `退库 - ${returnModal.record.seedCode}（退回原作物库存）` }}</h3>
          <button
            type="button"
            class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
            aria-label="关闭"
            @click="handleReturnClose"
          >
            <X :size="20" />
          </button>
        </div>
      </template>
      <SeedSourceReturnModal
        :target-seed-source-id="returnModal.record.id"
        :target-seed-source-code="returnModal.record.seedCode"
        @confirm="handleReturnConfirm"
      />
    </el-dialog>

    <!-- 2026-07-01: 种源标签管理弹窗 -->
    <SeedSourceLabelManageModal
      v-if="labelManageModal.record"
      v-model:visible="labelManageModal.open"
      :seed-source-id="labelManageModal.record.id"
      :seed-source-code="labelManageModal.record.seedCode"
      :unit="labelManageModal.record.unit || '粒'"
    />

    <!-- 删除确认弹窗（统一为 DeleteConfirmModal，对应V2.0 DeleteWarningModal） -->
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :selected-count="selectedRows.length"
      @update:is-open="(v) => showDeleteModal = v"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Goods } from '@element-plus/icons-vue'
import { Package, X } from 'lucide-vue-next'

import SeedSourceFilter from '@/components/farm/seed-source/components/SeedSourceFilter.vue'
import SeedSourceTable from '@/components/farm/seed-source/components/SeedSourceTable.vue'
import AddModal from '@/components/farm/seed-source/modals/AddModal.vue'
import EditModal from '@/components/farm/seed-source/modals/EditModal.vue'
import DetailModal from '@/components/farm/seed-source/modals/DetailModal.vue'
import PrintLabelModal from '@/components/farm/seed-source/modals/PrintLabelModal.vue'
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import SeedSourceReturnModal from '@/components/farm/seed-source/modals/SeedSourceReturnModal.vue'
import SeedSourceLabelManageModal from '@/components/farm/seed-source/modals/SeedSourceLabelManageModal.vue'
import InventoryTransferPanel from '@/components/farm/seed-source/modals/InventoryTransferPanel.vue'
import DeleteConfirmModal from '@/components/common/DeleteWarningModal.vue'

import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { useUserStore } from '@/stores/modules/user'
import { seedSourceTransferService } from '@/services/seedSourceTransferService'
import { exportCsv, exportXlsx } from '@/services/exporters'
import { computeStockStatus, seedSourceStatusOptions, SOURCE_ORIGINS, SOURCE_TYPES, StockStatus } from '@/constants/seedSourceDict'

// 简易 toast 包装（V2.0 直接用 ElMessage）
const toast = {
  success: (msg) => ElMessage.success(msg),
  error: (msg) => ElMessage.error(msg),
  warning: (msg) => ElMessage.warning(msg),
  info: (msg) => ElMessage.info(msg)
}

// Store
const seedSourceStore = useSeedSourceStore()
const userStore = useUserStore()

// 权限 - 已取消，所有人可使用所有功能
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)
const canPrint = ref(true)

// 数据
const isLoading = computed(() => seedSourceStore.isLoading)
const items = computed(() => seedSourceStore.items)

// 筛选条件（V1.1 SeedSourceFilters 1:1）
const filters = ref({
  cropCategory: '',
  cropName: '',
  seedCode: '',
  sourceType: '',
  sourceOrigin: '',
  supplierName: '',
  startDate: '',
  endDate: '',
  status: '',
  createBy: '',
  cropType: '',
  orgId: '',
  recorderId: '',
  surplusMin: undefined,
  surplusMax: undefined,
  propagationType: undefined,
  propagationStatus: undefined
})

// 选项（V1.1 cropCategories, suppliers, seedSourceStatusOptions）
const statusOptions = seedSourceStatusOptions

// V1.1 兼容：作物类别（V2.0 暂无 cropData.js，内联最小化）
const cropCategories = [
  { value: '蔬菜类', label: '蔬菜类' },
  { value: '粮食类', label: '粮食类' },
  { value: '水果类', label: '水果类' },
  { value: '经济作物', label: '经济作物' }
]
// V1.1 兼容：供应商列表（实际由 modal 内部从 /suppliers API 加载，此处仅作占位）
const suppliers = ref([])
// V1.1 兼容：单位列表
const units = [
  { value: '袋', label: '袋' },
  { value: '粒', label: '粒' },
  { value: '颗', label: '颗' },
  { value: '株', label: '株' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' }
]

// 分页（V1.1 SeedSourcePage.tsx L86: pageSize=10）
const pagination = ref({ current: 1, pageSize: 10 })

// 选中行
const selectedRows = ref([])

// 弹窗状态
const addModalOpen = ref(false)
const editModalOpen = ref(false)
const detailModalOpen = ref(false)
const printModalOpen = ref(false)
const lightboxOpen = ref(false)
const currentRecord = ref(null)
const currentImages = ref([])

// 导出状态
const exportFormat = ref('xlsx')
const showExportModal = ref(false)
const showDeleteModal = ref(false)

// 2026-06-06: 合并 3 个独立 state 为 BatchOpState discriminated union
const batchOp = ref({ mode: 'normal' })
const exportMode = computed(() => batchOp.value.mode === 'export')
const printMode = computed(() => batchOp.value.mode === 'print')

// 打印记录（待打印队列）
const printRecords = ref([])

// 标签管理弹窗
const labelManageModal = ref({ open: false, record: null })

// 调拨弹窗
const transferModal = ref({ open: false, record: null })

// 退库弹窗
const returnModal = ref({ open: false, record: null })

// 过滤数据（V1.1 useFilteredSeedSources 内联版）
const filteredData = computed(() => {
  let data = items.value
  const f = filters.value

  if (f.cropName) {
    data = data.filter(item => (item.cropName || '').includes(f.cropName))
  }
  if (f.seedCode) {
    data = data.filter(item => (item.seedCode || '').includes(f.seedCode))
  }
  if (f.sourceOrigin && f.sourceOrigin !== '__all__') {
    data = data.filter(item => item.sourceOrigin === f.sourceOrigin)
  }
  if (f.sourceType && f.sourceType !== '__all__') {
    data = data.filter(item => item.sourceType === f.sourceType)
  }
  if (f.supplierName && f.supplierName !== '__all__') {
    data = data.filter(item => (item.supplierName || '').includes(f.supplierName))
  }
  if (f.status && f.status !== '__all__') {
    // 实时计算 status
    data = data.filter(item => {
      const live = computeStockStatus(item.availableCount, item.initialCount)
      return live === f.status
    })
  }
  if (f.startDate) {
    data = data.filter(item => (item.purchaseDate || item.createTime || '') >= f.startDate)
  }
  if (f.endDate) {
    data = data.filter(item => (item.purchaseDate || item.createTime || '') <= f.endDate)
  }
  if (f.createBy) {
    data = data.filter(item => (item.createBy || '').includes(f.createBy))
  }
  if (f.surplusMin !== undefined && f.surplusMin !== null) {
    data = data.filter(item => (item.availableCount || 0) >= f.surplusMin)
  }
  if (f.surplusMax !== undefined && f.surplusMax !== null) {
    data = data.filter(item => (item.availableCount || 0) <= f.surplusMax)
  }
  if (f.cropCategory) data = data.filter(item => item.cropCategory === f.cropCategory)
  if (f.cropType) data = data.filter(item => (item.cropType || '') === f.cropType)
  if (f.recorderId) data = data.filter(item => (item.createBy || '').includes(f.recorderId))
  if (f.propagationType) data = data.filter(item => item.propagationType === f.propagationType)
  if (f.propagationStatus) data = data.filter(item => item.propagationStatus === f.propagationStatus)

  // createTime 倒序（最新在前，与 V1.1 一致）
  return [...data].sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''))
})

// 加载数据
const loadItems = async () => {
  await seedSourceStore.loadItems()
}

// 筛选/分页操作
const setFilters = (newFilters) => {
  filters.value = newFilters
}
const setPagination = (val) => {
  pagination.value = val
}
const setSelectedRows = (val) => {
  selectedRows.value = val
}

// 处理搜索
const handleSearch = () => {
  pagination.value = { ...pagination.value, current: 1 }
}

// 处理重置
const handleReset = () => {
  filters.value = {
    cropCategory: '',
    cropName: '',
    seedCode: '',
    sourceType: '',
    sourceOrigin: '',
    supplierName: '',
    startDate: '',
    endDate: '',
    status: '',
    createBy: '',
    cropType: '',
    orgId: '',
    recorderId: '',
    surplusMin: undefined,
    surplusMax: undefined,
    propagationType: undefined,
    propagationStatus: undefined
  }
  pagination.value = { ...pagination.value, current: 1 }
}

// 新增/编辑/详情/打印
const handleAdd = () => {
  currentRecord.value = null
  addModalOpen.value = true
}

const handleEdit = (record) => {
  currentRecord.value = record
  editModalOpen.value = true
}

const handleDetail = (record) => {
  currentRecord.value = record
  detailModalOpen.value = true
}

const handlePrint = (record) => {
  currentRecord.value = record
  printModalOpen.value = true
}

const handleImageClick = (images) => {
  currentImages.value = images
  lightboxOpen.value = true
}

// 调拨
const handleTransfer = (record) => {
  transferModal.value = { open: true, record }
}
const handleTransferClose = () => {
  transferModal.value = { open: false, record: null }
}
const handleTransferConfirm = async (items) => {
  const record = transferModal.value.record
  if (!record) return
  try {
    const result = await seedSourceTransferService.appendToExistingSeedSource({
      targetSeedSourceId: record.id,
      items,
      operator: userStore.currentUser
        ? { id: userStore.currentUser.oid, name: userStore.currentUser.realName || userStore.currentUser.username }
        : undefined
    })
    toast.success(`调拨成功：追加 ${result.appendedCount} ${record.unit}，当前可用 ${result.newAvailableCount}`)
    handleTransferClose()
    await loadItems()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await ElMessageBox.alert(`调拨失败：${msg}`, '错误', { type: 'error' })
  }
}

// 退库
const handleReturn = (record) => {
  returnModal.value = { open: true, record }
}
const handleReturnClose = () => {
  returnModal.value = { open: false, record: null }
}
const handleReturnConfirm = async (items) => {
  const record = returnModal.value.record
  if (!record) return
  try {
    const result = await seedSourceTransferService.returnToInventory({
      targetSeedSourceId: record.id,
      items,
      operator: userStore.currentUser
        ? { id: userStore.currentUser.oid, name: userStore.currentUser.realName || userStore.currentUser.username }
        : undefined
    })
    toast.success(`退库成功：退回 ${result.returnedCount} ${record.unit}，剩余可用 ${result.newSourceRemaining}`)
    handleReturnClose()
    await loadItems()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await ElMessageBox.alert(`退库失败：${msg}`, '错误', { type: 'error' })
  }
}

// 标签管理
const handleLabelManage = (record) => {
  labelManageModal.value = { open: true, record }
}

// 操作模式变更
const handleOperationModeChange = (mode) => {
  batchOp.value = { mode }
  if (mode === 'export' || mode === 'delete' || mode === 'edit') {
    selectedRows.value = []
  }
}

const handlePrintModeChange = (val) => {
  if (val) {
    batchOp.value = { mode: 'print' }
  } else {
    batchOp.value = { mode: 'normal' }
  }
  selectedRows.value = []
}

// 确认打印
const handlePrintConfirm = (records) => {
  if (records.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  printRecords.value = records
  currentRecord.value = records[0]
  printModalOpen.value = true
  batchOp.value = { mode: 'normal' }
  selectedRows.value = []
}

// 导出
const handleExportClickConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleExportCancel = () => {
  batchOp.value = { mode: 'normal' }
  selectedRows.value = []
}

const handleConfirmExport = async () => {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))

  // 导出表头（含图片列，V1.1 20列）
  const headers = [
    '种源图片（链接）', '种源批号', '种源类型', '作物类别',
    '作物品种（最细化）', '作物品种（细分品种）', '品种路径', '供应商',
    '采购日期', '采购数量', '单位', '单价(元)', '总金额(元)',
    '初始数量', '可用数量', '库存状态', '溯源码',
    '创建人', '创建时间', '备注'
  ]

  // 种源类型中英文映射
  const sourceTypeMap = {
    seed: '种子', seedling: '种苗/实生苗', cutting: '扦插苗',
    grafting: '嫁接苗', tissue_culture: '组培苗', split: '分株苗',
    bulb: '种球/球根', self_produced: '自繁苗', external: '外购苗'
  }

  const exportData = selectedData.map(record => ({
    '种源图片': (record.pictures && record.pictures.length > 0) ? record.pictures[0] : '',
    '种源批号': record.seedCode,
    '种源类型': sourceTypeMap[record.sourceType] || record.sourceType || '',
    '作物类别': record.cropCategory,
    '作物品种（最细化）': record.cropName,
    '作物品种（细分品种）': record.cropVariety,
    '品种路径': [
      record.cropCategory,
      record.cropName,
      record.cropVariety && record.cropVariety !== record.cropName ? record.cropVariety : null
    ].filter(Boolean).join(' > ') || '-',
    '供应商': record.supplierName,
    '采购日期': record.purchaseDate,
    '采购数量': record.quantity,
    '单位': record.unit,
    '单价(元)': record.unitPrice,
    '总金额(元)': record.totalAmount,
    '初始数量': record.initialCount,
    '可用数量': record.availableCount,
    '库存状态': (() => {
      const live = computeStockStatus(record.availableCount, record.initialCount)
      return live === StockStatus.SUFFICIENT ? '充足' : live === StockStatus.LOW ? '不足' : '耗尽'
    })(),
    '溯源码': record.traceabilityCode || '',
    '创建人': record.createBy,
    '创建时间': record.createTime,
    '备注': record.remarks || ''
  }))

  // 真实 xlsx 导出（V1.1 风格，SheetJS，含图片列 + 错误降级为 xls）
  try {
    if (exportFormat.value === 'xlsx' || exportFormat.value === 'excel') {
      const XLSX = await import('xlsx')
      const ws = XLSX.utils.json_to_sheet(exportData, { header: headers })
      // 列宽：图片列宽 30、备注列宽 25、其他列宽 15
      ws['!cols'] = headers.map((h) => {
        if (h === '种源图片（链接）') return { wch: 30 }
        if (h === '备注') return { wch: 25 }
        return { wch: 15 }
      })
      // 嵌入 base64 图片链接到对应单元格
      selectedData.forEach((record, rowIdx) => {
        if (record.pictures && record.pictures.length > 0) {
          const imgData = record.pictures[0]
          if (imgData.startsWith('data:image/')) {
            try {
              const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: 0 })
              if (ws[cellRef]) {
                ws[cellRef].l = { Target: imgData }
              }
            } catch { /* 图片嵌入失败不影响导出 */ }
          }
        }
      })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '种源记录')
      const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
      XLSX.writeFile(wb, `内部种源_${today}.xlsx`)
    } else if (exportFormat.value === 'csv') {
      // CSV 导出（用公共函数，含 BOM 保证中文）
      const todayCsv = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
      exportCsv(exportData, headers, `内部种源_${todayCsv}.csv`)
    } else {
      // xls fallback（用公共函数，HTML 假装 xls）
      const todayXls = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
      exportXlsx(exportData, headers, `内部种源_${todayXls}.xls`)
    }
    toast.success('导出成功')
  } catch (err) {
    console.warn('[SeedSourcePage] 导出失败:', err)
    toast.error('导出失败：' + (err instanceof Error ? err.message : String(err)))
  }

  batchOp.value = { mode: 'normal' }
  selectedRows.value = []
  showExportModal.value = false
}

// 删除流程（V2.0 简化版：直接调 store.deleteItems，由服务端做引用检查并返回 409 → throw）
const handleDelete = (ids) => {
  if (!ids || ids.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  selectedRows.value = ids
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  const ids = [...selectedRows.value]
  if (ids.length === 0) return
  showDeleteModal.value = false
  try {
    await seedSourceStore.deleteItems(ids)
    selectedRows.value = []
    toast.success(`已删除 ${ids.length} 条种源记录`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.error(`删除失败：${msg}`)
  }
}

// 全选当前过滤结果（导出模式用）
const handleExportSelectAll = () => {
  selectedRows.value = filteredData.value.map(item => item.id)
}

// 监听 store error
watch(() => seedSourceStore.error, (err) => {
  if (err) {
    toast.error(`加载种源数据失败：${err}`)
    seedSourceStore.clearError()
  }
})

// 组件挂载
onMounted(() => {
  loadItems()
})
</script>
