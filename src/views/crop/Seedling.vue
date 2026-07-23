<!--
  育苗管理主页面（完全重写 - 1:1 对齐 V1.1 SeedlingPage.tsx）
  V1.1源文件：src/components/farm/seedling/SeedlingPage.tsx

  架构：
  - 页面管理所有状态（currentRecord、各弹窗 visible）
  - 弹窗用简单 div 实现（不用 el-dialog，避免 directive 问题）
  - 每个弹窗接收 visible / onClose / onSuccess / record props
  - handler 只做 setCurrentRecord + setVisible(true)
-->
<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
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
        :export-mode="exportModeRef"
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

    <!-- ========== 弹窗区（简单 div 实现，不用 el-dialog）========== -->

    <!-- 新增弹窗 -->
    <AddModal
      :visible="addModalVisible"
      :seed-sources="seedSources"
      :crop-variety-options="cropVarietyOptions"
      :seedling-types="seedlingTypes"
      :sites="sites"
      @close="addModalVisible = false"
      @success="handleAddSuccess"
    />

    <!-- 编辑弹窗 -->
    <EditModal
      v-if="currentRecord"
      :visible="editModalVisible"
      :record="currentRecord"
      :seed-sources="seedSources"
      :crop-variety-options="cropVarietyOptions"
      :seedling-types="seedlingTypes"
      :sites="sites"
      @close="editModalVisible = false"
      @success="handleEditSuccess"
    />

    <!-- 详情弹窗 -->
    <DetailModal
      v-if="currentRecord"
      :visible="detailModalVisible"
      :record="currentRecord"
      @close="detailModalVisible = false"
    />

    <!-- 每日记录弹窗 -->
    <DailyRecordModal
      v-if="currentRecord"
      :visible="dailyRecordModalVisible"
      :record="currentRecord"
      :read-only="Boolean(currentRecord.status === 'completed' || currentRecord.status === 'abnormal' || currentRecord.status === 'cancelled' || currentRecord.endType === 'normal' || currentRecord.endType === 'abnormal')"
      @close="dailyRecordModalVisible = false"
      @success="handleDailyRecordSuccess"
    />

    <!-- 无性繁殖记录弹窗 -->
    <SeedlingPropagationModal
      v-if="currentRecord"
      :visible="propagationModalVisible"
      :record="currentRecord"
      :read-only="Boolean(currentRecord.status === 'completed' || currentRecord.status === 'abnormal' || currentRecord.endType === 'normal' || currentRecord.endType === 'abnormal')"
      @close="propagationModalVisible = false"
      @success="handlePropagationSuccess"
    />

    <!-- 打印标签弹窗 -->
    <PrintLabelModal
      v-if="currentRecord"
      :visible="printModalVisible"
      :record="currentRecord"
      @close="printModalVisible = false"
    />

    <!-- 图片预览弹窗 -->
    <ImageLightboxModal
      :visible="lightboxVisible"
      :images="currentImages"
      @close="lightboxVisible = false"
    />

    <!-- 标签管理弹窗 -->
    <SeedlingLabelManageModal
      v-if="labelManageRecord"
      :visible="labelManageModalVisible"
      :seedling-id="labelManageRecord.id"
      :seedling-code="labelManageRecord.seedlingCode"
      :auto-select-label-number="autoSelectLabelNumber"
      :read-only="Boolean(labelManageRecord.status === 'completed' || labelManageRecord.status === 'abnormal' || labelManageRecord.endType === 'normal' || labelManageRecord.endType === 'abnormal')"
      @close="labelManageModalVisible = false"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      :visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @close="showExportModal = false"
      @confirm="handleConfirmExport"
      @update:export-file-type="exportFormat = $event"
    />

    <!-- 删除确认弹窗 -->
    <DeleteConfirmModal
      :visible="showDeleteModal"
      :selected-count="pendingDeleteIds.length"
      @close="showDeleteModal = false; pendingDeleteIds = []"
      @confirm="handleDeleteConfirm"
    />

    <!-- 出圃入库弹窗 -->
    <UnifiedRowHarvestInboundModal
      v-if="inboundModal.record"
      :is-open="inboundModal.open"
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
      @close="inboundModal = { open: false, record: null }"
      @success="handleInboundSuccess"
    />

    <!-- 结束育苗确认弹窗 -->
    <EndSeedlingModal
      v-if="endConfirm.record"
      :record="endConfirm.record"
      @close="endConfirm = { record: null }"
      @success="handleEndSuccess"
    />
  </div>
</template>

<script setup>
/**
 * 育苗管理主页面（完全重写 - 1:1 对齐 V1.1 SeedlingPage.tsx）
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SeedlingFilter from '@/components/farm/seedling/components/SeedlingFilter.vue'
import SeedlingTable from '@/components/farm/seedling/components/SeedlingTable.vue'
import AddModal from '@/components/farm/seedling/modals/AddModal.vue'
import EditModal from '@/components/farm/seedling/modals/EditModal.vue'
import DetailModal from '@/components/farm/seedling/modals/DetailModal.vue'
import DailyRecordModal from '@/components/farm/seedling/modals/DailyRecordModal.vue'
import PrintLabelModal from '@/components/farm/seedling/modals/PrintLabelModal.vue'
import SeedlingLabelManageModal from '@/components/farm/seedling/modals/SeedlingLabelManageModal.vue'
import SeedlingPropagationModal from '@/components/farm/seedling/modals/SeedlingPropagationModal.vue'
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal.vue'
import UnifiedRowHarvestInboundModal from '@/components/farm/inventory/UnifiedRowHarvestInboundModal.vue'
import EndSeedlingModal from '@/components/farm/seedling/modals/EndSeedlingModal.vue'
import { useSeedlingStore } from '@/stores/modules/seedling'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import * as cropVarietyService from '@/services/cropVarietyService'
import { getDictItems } from '@/stores/modules/dictionary'
import { useFilteredSeedlings } from '@/hooks/useFilteredSeedlings'

// 权限
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true
const canPrint = true

// Store
const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()

// 状态
const loading = computed(() => seedlingStore.isLoading)
const items = computed(() => seedlingStore.items)
const seedSources = ref([])

// 筛选条件
const filters = ref({
  cropName: '', seedlingCode: '', sourceCode: '', startDate: '', endDate: '',
  siteName: '', seedlingType: '', createBy: '', status: '',
  initialCountMin: undefined, initialCountMax: undefined,
  survivalCountMin: undefined, survivalCountMax: undefined,
  lossCountMin: undefined, lossCountMax: undefined,
  surplusMin: undefined, surplusMax: undefined,
  survivalRateMin: undefined, survivalRateMax: undefined,
  lossRateMin: undefined, lossRateMax: undefined
})

// 分页
const pagination = ref({ current: 1, pageSize: 10 })
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
const showDeleteModal = ref(false)
const exportFormat = ref('xlsx')

// 当前操作的记录
const currentRecord = ref(null)
const currentImages = ref([])
const labelManageRecord = ref(null)
const autoSelectLabelNumber = ref(undefined)
const pendingDeleteIds = ref([])
const inboundModal = ref({ open: false, record: null })
const endConfirm = ref({ record: null })
const exportMode = ref('excel')
const operationMode = ref('normal')
const exportModeRef = ref(false)
const printMode = ref(false)

// 选项数据
const cropNames = computed(() => {
  const seen = new Set()
  return items.value.filter(item => {
    if (item.cropName && !seen.has(item.cropName)) { seen.add(item.cropName); return true }
    return false
  }).map(item => ({ value: item.cropName, label: item.cropName }))
})

const cropVarietyOptions = computed(() => {
  cropVarietyService.initVarieties()
  return cropVarietyService.getVarietyOptions()
})

const seedlingTypes = ref([])
const sites = ref([])

const seedlingStatusOptions = ref([
  { value: 'sown', label: '已播种' },
  { value: 'in_progress', label: '生长中' },
  { value: 'transplant_ready', label: '待出圃' },
  { value: 'completed', label: '已出圃' },
  { value: 'cancelled', label: '已取消' },
  { value: 'abnormal', label: '异常结束' }
])

// 筛选后的数据（使用 V1.1 同款 hook）
const filteredData = useFilteredSeedlings(items, filters)

// ========== 数据加载 ==========
const loadItems = async () => {
  await seedlingStore.loadItems()
}

const loadSeedSources = async () => {
  await seedSourceStore.loadItems()
  seedSources.value = seedSourceStore.items
}

const loadDictItems = () => {
  try {
    seedlingTypes.value = getDictItems('seedling_type').map(d => ({ value: d.dictCode, label: d.dictLabel }))
    if (seedlingTypes.value.length === 0) {
      seedlingTypes.value = [
        { value: '穴盘育苗', label: '穴盘育苗' },
        { value: '嫁接育苗', label: '嫁接育苗' },
        { value: '组培育苗', label: '组培育苗' },
        { value: '直播育苗', label: '直播育苗' }
      ]
    }
  } catch {}
  try {
    sites.value = getDictItems('seedling_site').map(d => ({ value: d.dictCode, label: d.dictLabel }))
    if (sites.value.length === 0) {
      sites.value = [
        { value: '1号大棚', label: '1号大棚' },
        { value: '2号大棚', label: '2号大棚' },
        { value: '3号大棚', label: '3号大棚' },
        { value: '露天场地', label: '露天场地' }
      ]
    }
  } catch {}
}

// 2026-07-22 P0-修复：添加 `areas` 选项（对齐 V1.1 L139-141，从 planting_area 字典获取，用于定植操作）
const areas = computed(() => {
  try {
    return getDictItems('planting_area').map(d => ({ value: d.dictCode, label: d.dictLabel }))
  } catch {
    return []
  }
})

// ========== 操作处理（严格对齐 V1.1） ==========

const handleAdd = () => {
  addModalVisible.value = true
}

const handleAddSuccess = async () => {
  addModalVisible.value = false
  await loadItems()
}

const handleEdit = (record) => {
  currentRecord.value = record
  editModalVisible.value = true
}

const handleEditSuccess = async () => {
  editModalVisible.value = false
  await loadItems()
}

const handleDetail = (record) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

const handleDailyRecord = (record) => {
  currentRecord.value = record
  dailyRecordModalVisible.value = true
}

const handleDailyRecordSuccess = async () => {
  await loadItems()
  if (currentRecord.value) {
    const updated = seedlingStore.items.find(s => s.id === currentRecord.value.id)
    if (updated) currentRecord.value = updated
  }
}

const handlePropagation = (record) => {
  currentRecord.value = record
  propagationModalVisible.value = true
}

const handlePropagationSuccess = async () => {
  propagationModalVisible.value = false
  await loadItems()
}

const handlePrint = (record) => {
  currentRecord.value = record
  printModalVisible.value = true
}

const handleLabelManage = (record) => {
  labelManageRecord.value = record
  labelManageModalVisible.value = true
}

const handleInbound = (record) => {
  inboundModal.value = { open: true, record }
}

const handleInboundSuccess = async () => {
  // 对齐 V1.1 L304-307：toast 提示入库成功
  ElMessage.success('入库成功')
  inboundModal.value = { open: false, record: null }
  await loadItems()
}

const handleImageClick = (images) => {
  currentImages.value = images
  lightboxVisible.value = true
}

const handleDelete = (ids) => {
  pendingDeleteIds.value = ids
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  const ids = [...pendingDeleteIds.value]
  if (ids.length === 0) return
  showDeleteModal.value = false
  pendingDeleteIds.value = []
  const success = await seedlingStore.deleteItems(ids)
  if (success) selectedRows.value = []
}

const handleEnd = (record) => {
  if (record.endTime) {
    ElMessage.warning('该育苗记录已结束，不能再次操作')
    return
  }
  endConfirm.value = { record }
}

const handleEndSuccess = async () => {
  endConfirm.value = { record: null }
  await loadItems()
}

const handleFiltersChange = (newFilters) => {
  filters.value = { ...newFilters }
}

const handleSearch = () => {
  pagination.value.current = 1
}

const handleReset = () => {
  filters.value = {
    cropName: '', seedlingCode: '', sourceCode: '', startDate: '', endDate: '',
    siteName: '', seedlingType: '', createBy: '', status: '',
    initialCountMin: undefined, initialCountMax: undefined,
    survivalCountMin: undefined, survivalCountMax: undefined,
    lossCountMin: undefined, lossCountMax: undefined,
    surplusMin: undefined, surplusMax: undefined,
    survivalRateMin: undefined, survivalRateMax: undefined,
    lossRateMin: undefined, lossRateMax: undefined
  }
  pagination.value.current = 1
}

const handleOperationModeChange = (mode) => {
  operationMode.value = mode
  if (mode === 'export') exportModeRef.value = true
  if (mode !== 'export') exportModeRef.value = false
  if (mode === 'print') printMode.value = true
  if (mode !== 'print') printMode.value = false
  if (mode === 'edit' || mode === 'delete') return
  selectedRows.value = []
}

const handlePrintModeChange = (mode) => {
  printMode.value = mode
  if (mode) selectedRows.value = []
}

const handleExportSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

const handleExportClick = () => {
  operationMode.value = 'export'
  exportModeRef.value = true
  selectedRows.value = []
}

const handleExportCancel = () => {
  operationMode.value = 'normal'
  exportModeRef.value = false
  selectedRows.value = []
}

const handleExportClickConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleConfirmExport = () => {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))
  const headers = ['育苗批号','作物编码','关联种源','作物名称','作物品种','育苗方式','场地','开始日期','预计结束日期','实际结束日期','初始数量','成苗数量','已定植数量','损耗数量','剩余总数','成苗率','损耗率','育苗结束','状态','品质等级','创建人','创建时间','备注']
  const getRemaining = (r) => r.initialCount - r.lossCount
  const getStatusLabel = (s) => ({in_progress:'进行中',transplant_ready:'待定植',completed:'已完成',abnormal:'异常'}[s] || s)
  const exportData = selectedData.map(r => ({
    '育苗批号': r.seedlingCode, '作物编码': r.cropCode || '', '关联种源': r.sourceCode,
    '作物名称': r.cropName, '作物品种': r.cropVariety, '育苗方式': r.seedlingType || '',
    '场地': r.siteName, '开始日期': r.startDate, '预计结束日期': r.expectedEndDate || '',
    '实际结束日期': r.endDate || '', '初始数量': r.initialCount, '成苗数量': r.survivalCount,
    '已定植数量': r.plantedCount, '损耗数量': r.lossCount, '剩余总数': getRemaining(r),
    '成苗率': `${r.survivalRate}%`, '损耗率': `${r.lossRate}%`, '育苗结束': r.isFinished ? '是' : '否',
    '状态': getStatusLabel(r.status), '品质等级': r.qualityGrade || '', '创建人': r.createBy,
    '创建时间': r.createTime, '备注': r.remarks || ''
  }))
  const isCsv = exportMode.value === 'csv'
  const content = isCsv
    ? headers.join(',') + '\n' + exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
    : `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const mimeType = isCsv ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel;charset=utf-8'
  const ext = isCsv ? 'csv' : 'xls'
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `育苗管理_${new Date().toISOString().slice(0, 10)}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
  exportModeRef.value = false
  selectedRows.value = []
  showExportModal.value = false
}

const handleConfirmPrint = (records) => {
  if (!records || records.length === 0) { ElMessage.warning('请先选择要打印的记录'); return }
  currentRecord.value = records[0]
  printModalVisible.value = true
  printMode.value = false
  selectedRows.value = []
}

const handleSelectionChange = (rows) => { selectedRows.value = rows }
const handlePageChange = (page) => { pagination.value.current = page }
const handleSizeChange = (size) => { pagination.value.pageSize = size; pagination.value.current = 1 }

// 初始化
onMounted(async () => {
  loadDictItems()
  await loadItems()
  await loadSeedSources()
  // 2026-07-22 P0-修复：扫码跳转 — 解析 URL ?labelNumber= 参数，自动打开标签管理弹窗
  // 对齐 V1.1 L177-211
  await handleLabelNumberScan()
})

// 2026-07-22 P0-修复：扫码跳转（对齐 V1.1 L177-211）
const route = useRoute()
const router = useRouter()
// labelManageRecord / autoSelectLabelNumber 已在 L281-282 声明，此处复用

const handleLabelNumberScan = async () => {
  const labelNumber = route.query.labelNumber
  if (!labelNumber) return
  let cancelled = false
  try {
    // 使用 enhancedApiClient（V1.1 useSearchParams 扫码跳转逻辑）
    const { enhancedApiClient } = await import('@/lib/apiClient')
    const res = await enhancedApiClient.get(`/plant-labels/by-number/${encodeURIComponent(String(labelNumber))}`)
    const label = res?.label || res
    if (!label || !label.seedlingId || cancelled) return
    // 从 labelNumber 提取 seedlingCode（格式：{seedlingCode}-{4位序号}）
    const parts = String(labelNumber).split('-')
    const seedlingCode = parts.length > 1 ? parts.slice(0, -1).join('-') : labelNumber
    // 从 store 中查找对应记录
    const targetRecord = seedlingStore.items.find(s => s.id === String(label.seedlingId))
    labelManageRecord.value = targetRecord || { id: String(label.seedlingId), seedlingCode }
    autoSelectLabelNumber.value = String(labelNumber)
    labelManageModalVisible.value = true
    // 清理 URL 参数，避免刷新重复打开
    const nextQuery = { ...route.query }
    delete nextQuery.labelNumber
    router.replace({ query: nextQuery })
  } catch {
    // 扫码查询失败，静默处理
  }
  onUnmounted(() => { cancelled = true })
}
</script>
