<!--
  @file 种植管理主页面 - 1:1 翻译自 V1.1 PlantingPage.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\farm\planting\PlantingPage.tsx
  @description 复合组件：组装 L3 叶子组件 + 9 个弹窗
  @note V1.1 内联所有状态/逻辑（无独立 composable），V2.0 保持内联
-->
<template>
  <div class="space-y-6">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <TreePine class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">种植管理</h1>
            <p class="text-gray-500">管理种植批次、生产计划和技术方案</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <PlantingFilter
      :filters="filters"
      :on-change="setFilters"
      :on-search="handleSearch"
      :on-reset="handleReset"
      :crop-names="cropNames"
      :areas="areas"
      :status-options="plantingStatusOptions"
    />

    <!-- 数据表格 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>
    <PlantingTable
      :data="filteredData"
      :pagination="pagination"
      :on-change="setPagination"
      :on-page-size-change="(pageSize) => setPagination({ ...pagination, pageSize })"
      :selected-rows="selectedRows"
      :on-selection-change="setSelectedRows"
      :on-edit="handleEdit"
      :on-detail="handleDetail"
      :on-harvest="handleHarvest"
      :on-print="handlePrint"
      :on-delete="handleDelete"
      :on-image-click="handleImageClick"
      :on-end="handleEnd"
      :on-add="() => setAddModalOpen(true)"
      :on-label-detail="handleLabelDetail"
      :on-move="handleMove"
      :on-mark="handleMark"
      :on-seed-saving="handleSeedSaving"
      :on-daily-record="handleDailyRecord"
      :on-inbound="handleInbound"
      :on-breeding-record="handleBreedingRecord"
      :on-seed-saving-record="handleSeedSavingRecord"
      :on-view-move-records="handleViewMoveRecords"
      :operation-mode="operationMode"
      :on-operation-mode-change="setOperationMode"
      :export-mode="exportMode"
      :on-export-click="handleExportClick"
      :on-export-select-all="handleExportSelectAll"
      :on-export-cancel="handleExportCancel"
      :on-confirm-export="handleExportClickConfirm"
      :print-mode="printMode"
      :on-print-mode-change="setPrintMode"
      :on-confirm-print="handlePrintConfirm"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-export="canExport"
      :can-print="canPrint"
    />

    <!-- 弹窗组 -->
    <AddModal
      :is-open="addModalOpen"
      :on-close="() => setAddModalOpen(false)"
      :on-success="loadItems"
      :crop-names="cropNames"
      :areas="areas"
      :source-type-options="sourceTypeOptions"
      @success="loadItems"
    />

    <EditModal
      v-if="currentRecord"
      :is-open="editModalOpen"
      :on-close="() => setEditModalOpen(false)"
      :on-success="loadItems"
      :record="currentRecord"
      :areas="areas"
    />

    <DetailModal
      v-if="currentRecord"
      :is-open="detailModalOpen"
      :on-close="() => setDetailModalOpen(false)"
      :record="currentRecord"
    />

    <HarvestModal
      v-if="currentRecord"
      :is-open="harvestModalOpen"
      :on-close="() => setHarvestModalOpen(false)"
      :on-success="loadItems"
      :record="currentRecord"
      @submit="handleHarvestSubmit"
    />

    <PrintModal
      v-if="currentRecord"
      :is-open="printModalOpen"
      :on-close="() => setPrintModalOpen(false)"
      :record="currentRecord"
    />

    <ImageLightboxModal
      :is-open="lightboxOpen"
      :on-close="() => setLightboxOpen(false)"
      :images="currentImages"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      :is-open="showExportModal"
      :export-file-type="exportFormat"
      :on-change="setExportFormat"
      :on-close="() => setShowExportModal(false)"
      :on-confirm="handleConfirmExport"
      :selected-count="selectedRows.length"
    />

    <!-- 标签详情弹窗 -->
    <LabelDetailModal
      :is-open="labelDetailOpen"
      :on-close="() => setLabelDetailOpen(false)"
      :labels="plantLabels.map((l) => ({
        id: l.id,
        labelNumber: l.label_number,
        plantingId: parseInt(l.planting_id, 10) || 0,
        moveInAreaName: l.move_in_area_name || '',
        moveInDate: l.move_in_date || '',
        moveOutAreaName: l.move_out_area_name || '',
        moveOutDate: l.move_out_date || '',
      }))"
      :resume-map="resumeMap"
    />

    <!-- 移入/移出弹窗 -->
    <MoveModal
      v-if="currentRecord"
      :is-open="moveModalOpen"
      :on-close="() => setMoveModalOpen(false)"
      :area-options="areas"
      :is-harvested="currentRecord.isHarvest"
      :on-submit="handleMoveSubmit"
    />

    <!-- 标记管理弹窗 -->
    <MarkModal
      :is-open="markModalOpen"
      :on-close="() => setMarkModalOpen(false)"
      :marks="marks.map((m) => ({
        id: m.id,
        name: m.name,
        color: m.color,
        icon: m.icon,
        parentId: m.parent_id,
        markAid: m.mark_aid,
        isUse: m.is_use,
        sortOrder: m.sort_order,
      }))"
      :labels="plantLabels.map((l) => ({
        id: l.id,
        labelNumber: l.label_number,
      }))"
      :on-submit="handleMarkSubmit"
    />

    <!-- 2026-07-22 P0 修复：每日记录弹窗（1:1 对齐 V1.1 PlantingPage.tsx L685-699）-->
    <DailyRecordModal
      v-if="dailyRecordModal.open"
      :is-open="dailyRecordModal.open"
      :on-close="closeDailyRecord"
      :record="dailyRecordModal.record"
      :on-success="handleDailyRecordSuccess"
      :read-only="isReadOnly(dailyRecordModal.record)"
    />

    <!-- 2026-07-22 P0 修复：行级采收入库弹窗（1:1 对齐 V1.1）-->
    <UnifiedRowHarvestInboundModal
      v-if="inboundUnifiedOpen && inboundUnifiedRecord"
      :is-open="inboundUnifiedOpen"
      :on-close="closeInboundUnified"
      :source-record="inboundUnifiedRecord"
      stock-type="planting"
      source-module="planting"
      :on-success="handleInboundSuccess"
    />

    <!-- 2026-07-22 P0 修复：移入/移出记录查看弹窗 -->
    <PlantingMoveRecordsModal
      v-if="moveRecordsOpen && currentRecord"
      :is-open="moveRecordsOpen"
      :on-close="() => setMoveRecordsOpen(false)"
      :planting="currentRecord"
    />
  </div>
</template>

<script setup>
/**
 * @file PlantingPage.vue
 * @description 种植管理主页面 - 1:1 翻译自 V1.1 PlantingPage.tsx
 *              V1.1 内联所有状态/逻辑（无独立 composable），V2.0 保持内联
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\farm\planting\PlantingPage.tsx
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TreePine } from 'lucide-vue-next'
import PlantingFilter from './components/PlantingFilter.vue'
import PlantingTable from './PlantingTable.vue'
import {
  AddModal,
  EditModal,
  DetailModal,
  HarvestModal,
  PrintModal,
  ImageLightboxModal,
  ExportFormatModal,
  LabelDetailModal,
  MoveModal,
  MarkModal,
  // 2026-07-22 P0 修复：补全缺失的弹窗
  DailyRecordModal,
  UnifiedRowHarvestInboundModal,
  PlantingMoveRecordsModal,
} from './modals'
import { ElMessage } from 'element-plus'
import { useDictionaryStore } from '@/stores/modules/dictionary'
import { usePlantingStore, PlantingStatus, SourceType } from '@/stores/modules/planting'
import { usePlantLabelStore } from '@/stores/modules/plantLabel'
import * as cropBatchService from '@/services/apiCropBatchService'
import { enhancedApiClient } from '@/lib/apiClient'
import { showAlert, showConfirm } from '@/lib/dialogService'

// ==================== 类型定义（JSDoc） ====================

/**
 * 种植记录（来自 L1 Pinia store）
 * @typedef {import('@/stores/modules/planting').Planting} Planting
 */

/**
 * 筛选条件
 * @typedef {Object} PlantingFilters
 * @property {string} cropName
 * @property {string} plantCode
 * @property {string} sourceCode
 * @property {string} areaName
 * @property {string} isHarvest
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} transplantDate
 * @property {string} createBy
 * @property {string} orgName
 * @property {number|undefined} countMin
 * @property {number|undefined} countMax
 */

/**
 * 标签/标记操作载荷
 * @typedef {Object} MovePayload
 * @property {'move_in'|'move_out'} operationType
 * @property {string} labelNumber
 * @property {string} targetArea
 * @property {string} operationDate
 * @property {string} remarks
 */

// ==================== 1:1 翻译 V1.1 权限 ====================
// V1.1 注释：种植模块权限已取消，直接设置为 true
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true
const canPrint = true

// ==================== 路由 ====================
const router = useRouter()

// ==================== Store ====================
const dictionaryStore = useDictionaryStore()
const plantingStore = usePlantingStore()
const plantLabelStore = usePlantLabelStore()

// ==================== 字典数据 ====================
/** @type {import('vue').ComputedRef<any[]>} */
const dictionaries = computed(() => dictionaryStore.dictionaries || [])
const loadDictionaries = dictionaryStore.loadDictionaries

// ==================== V1.1 useEffect：字典为空时加载 ====================
onMounted(() => {
  if (dictionaries.value.length === 0) {
    loadDictionaries()
  }
})

// ==================== 字典选项（1:1 翻译 V1.1 useMemo） ====================
/** @type {import('vue').ComputedRef<{value: string, label: string}[]>} */
const cropNames = computed(() => {
  // 从种植数据中提取所有唯一的作物名称
  const uniqueCropNames = [...new Set(plantings.value.map((item) => item.cropName).filter(Boolean))]
  return uniqueCropNames
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }))
})

/** @type {import('vue').ComputedRef<{value: string, label: string}[]>} */
const areas = computed(() => {
  return (dictionaryStore.dictionaries || [])
    .filter(d => d.category === 'planting_area' && d.status === 'active')
    .map((d) => ({ value: d.dictCode, label: d.dictLabel }))
})

/** @type {import('vue').ComputedRef<{value: string, label: string}[]>} */
const sourceTypeOptions = computed(() => {
  return (dictionaryStore.dictionaries || [])
    .filter(d => d.category === 'source_type' && d.status === 'active')
    .map((d) => ({ value: d.dictCode, label: d.dictLabel }))
})

/** @type {import('vue').ComputedRef<{value: string, label: string}[]>} */
const plantingStatusOptions = computed(() => {
  return (dictionaryStore.dictionaries || [])
    .filter(d => d.category === 'planting_status' && d.status === 'active')
    .map((d) => ({ value: d.dictCode, label: d.dictLabel }))
})

// ==================== 从 Store 映射（1:1 翻译 V1.1 解构） ====================
// V1.1: const { items: plantings, isLoading: loading, loadItems, deleteItem, deleteItems } = usePlantingStore()
// V2.0 store 使用 plantings/isLoading/fetchPlantings/deletePlanting/deletePlantings
/** @type {import('vue').ComputedRef<Planting[]>} */
const plantings = computed(() => plantingStore.plantings || [])
const loading = computed(() => plantingStore.isLoading || false)
const loadItems = plantingStore.fetchPlantings
const deleteItems = plantingStore.deletePlantings

// ==================== 从标签 Store 映射（1:1 翻译 V1.1 解构） ====================
// V1.1: const { labels: plantLabels, resumeMap, marks, loadLabels, loadMarks, loadResumesForLabels, submitMove, submitMark } = usePlantLabelStore()
const plantLabels = computed(() => plantLabelStore.labels || [])
const resumeMap = computed(() => plantLabelStore.resumeMap || {})
const marks = computed(() => plantLabelStore.marks || [])
const loadLabels = plantLabelStore.loadLabels
const loadMarks = plantLabelStore.loadMarks
const loadResumesForLabels = plantLabelStore.loadResumesForLabels

// V2.0 store 未提供 submitMove/submitMark（planLabel.js 缺失 actions）
// 提供降级函数：返回 false 并提示用户暂未实现
async function submitMove() {
  await showAlert('移入/移出功能暂未实现，请稍后再试。')
  return false
}
async function submitMark() {
  await showAlert('标记分配功能暂未实现，请稍后再试。')
  return false
}

// ==================== 筛选状态 ====================
/** @type {import('vue').Ref<PlantingFilters>} */
const filters = ref({
  cropName: '',
  plantCode: '',
  sourceCode: '',
  areaName: '',
  isHarvest: '',
  startDate: '',
  endDate: '',
  transplantDate: '',
  createBy: '',
  orgName: '',
  countMin: undefined,
  countMax: undefined,
})
const setFilters = (v) => { filters.value = v }

// ==================== 分页状态 ====================
// 2026-07-22 P0 修复：V1.1 PlantingPage.tsx L83 默认 pageSize=20
const pagination = ref({ current: 1, pageSize: 20 })
const setPagination = (v) => { pagination.value = v }

// ==================== 选中状态 ====================
/** @type {import('vue').Ref<string[]>} */
const selectedRows = ref([])
const setSelectedRows = (v) => { selectedRows.value = v }

// ==================== 1:1 翻译 V1.1 useEffect：初始化加载 ====================
onMounted(() => {
  loadItems()
})

// ==================== 弹窗状态 ====================
const addModalOpen = ref(false)
const editModalOpen = ref(false)
const detailModalOpen = ref(false)
const harvestModalOpen = ref(false)
const printModalOpen = ref(false)
const lightboxOpen = ref(false)
const setAddModalOpen = (v) => { addModalOpen.value = v }
const setEditModalOpen = (v) => { editModalOpen.value = v }
const setDetailModalOpen = (v) => { detailModalOpen.value = v }
const setHarvestModalOpen = (v) => { harvestModalOpen.value = v }
const setPrintModalOpen = (v) => { printModalOpen.value = v }
const setLightboxOpen = (v) => { lightboxOpen.value = v }

/** @type {import('vue').Ref<Planting | null>} */
const currentRecord = ref(null)
const currentImages = ref([])

// 标签/标记/移动弹窗状态
const labelDetailOpen = ref(false)
const moveModalOpen = ref(false)
const markModalOpen = ref(false)
const setLabelDetailOpen = (v) => { labelDetailOpen.value = v }
const setMoveModalOpen = (v) => { moveModalOpen.value = v }
const setMarkModalOpen = (v) => { markModalOpen.value = v }
/** @type {import('vue').Ref<Planting | null>} */
const currentLabelPlanting = ref(null)

// 2026-07-22 P0 修复：补全缺失的弹窗状态
/** @type {import('vue').Ref<{open: boolean, record: Planting | null}>} */
const dailyRecordModal = ref({ open: false, record: null })
const inboundUnifiedOpen = ref(false)
/** @type {import('vue').Ref<{id: string, plantCode: string, cropName?: string, cropVariety?: string, cropCode?: string, unit?: string, plantingMode?: string, endTime?: string, status?: string} | null>} */
const inboundUnifiedRecord = ref(null)
const moveRecordsOpen = ref(false)
const setMoveRecordsOpen = (v) => { moveRecordsOpen.value = v }

// 导出状态
const exportMode = ref(false)
const exportFormat = ref('xlsx')
const showExportModal = ref(false)
const setExportFormat = (v) => { exportFormat.value = v }
const setShowExportModal = (v) => { showExportModal.value = v }

// 操作模式
/** @type {import('vue').Ref<'normal'|'detail'|'edit'|'harvest'|'print'|'image'|'delete'|'export'>} */
const operationMode = ref('normal')
const setOperationMode = (v) => { operationMode.value = v }

// 打印模式
const printMode = ref(false)
const setPrintMode = (v) => { printMode.value = v }
/** @type {import('vue').Ref<Planting[]>} */
const printRecords = ref([])

// ==================== 过滤后的数据（1:1 翻译 V1.1 useMemo） ====================
/** @type {import('vue').ComputedRef<Planting[]>} */
const filteredData = computed(() => {
  return plantings.value.filter((item) => {
    if (filters.value.cropName && !item.cropName.includes(filters.value.cropName)) return false
    if (filters.value.plantCode && !item.plantCode.includes(filters.value.plantCode)) return false
    if (filters.value.sourceCode && !item.sourceCode.includes(filters.value.sourceCode)) return false
    if (filters.value.areaName && !item.areaName.includes(filters.value.areaName)) return false
    if (filters.value.isHarvest && String(item.isHarvest) !== filters.value.isHarvest) return false
    if (filters.value.startDate && item.plantingDate < filters.value.startDate) return false
    if (filters.value.endDate && item.plantingDate > filters.value.endDate) return false
    if (filters.value.transplantDate && item.transplantDate !== filters.value.transplantDate) return false
    if (filters.value.createBy && !item.createBy.includes(filters.value.createBy)) return false
    // 方案 3.3: 组织筛选 + 定植数量范围
    if (filters.value.orgName && !item.orgName?.includes(filters.value.orgName)) return false
    if (filters.value.countMin !== undefined && item.plantingCount < filters.value.countMin) return false
    if (filters.value.countMax !== undefined && item.plantingCount > filters.value.countMax) return false
    return true
  })
})

// ==================== 统计卡片数据 ====================
/** @type {import('vue').ComputedRef<{total: number, growing: number, harvested: number, monthCount: number}>} */
const statsData = computed(() => {
  const list = plantings.value
  const total = list.length
  const growing = list.filter(
    (p) => p.status === PlantingStatus.PLANTED || p.status === PlantingStatus.GROWING
  ).length
  const harvested = list.filter((p) => p.status === PlantingStatus.HARVESTED).length
  const monthCount = list.filter((p) => {
    const date = new Date(p.createTime)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return { total, growing, harvested, monthCount }
})

// ==================== 处理操作 ====================
function handleEdit(record) {
  currentRecord.value = record
  setEditModalOpen(true)
}
function handleDetail(record) {
  currentRecord.value = record
  setDetailModalOpen(true)
}
function handleHarvest(record) {
  currentRecord.value = record
  setHarvestModalOpen(true)
}
function handlePrint(record) {
  currentRecord.value = record
  setPrintModalOpen(true)
}
function handleImageClick(images) {
  currentImages.value = images
  setLightboxOpen(true)
}

// 2026-07-24: 真正调用 plantingStore.harvestPlanting（对齐 V1.1 L66-71）
async function handleHarvestSubmit(payload) {
  // payload: { harvestDate, harvestQuantity, remarks }
  const plantingCount = Number(currentRecord.value?.plantingCount || 0)
  const harvestCount = Number(payload.harvestQuantity || 0)
  // 计算损耗率（对齐 V1.1 L60-62）
  const attritionRate = plantingCount > 0
    ? Math.round((1 - harvestCount / plantingCount) * 100)
    : 0
  try {
    await plantingStore.harvestPlanting(
      String(currentRecord.value?.id),
      payload.harvestDate,
      harvestCount,
      attritionRate
    )
    ElMessage.success(`已采收：${currentRecord.value?.plantCode}（产量 ${harvestCount} 株，损耗率 ${attritionRate}%）`)
    setHarvestModalOpen(false)
    await loadItems()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.error(`采收登记失败：${msg}`)
  }
}

// ==================== 处理删除（标签履历关联检查） ====================
async function handleDelete(ids) {
  // 删除前检查标签履历关联
  for (const id of ids) {
    try {
      const res = await enhancedApiClient.get(`/plantings/${id}/check-deletable`)
      if (res.data && !res.data.deletable) {
        await showAlert(`种植记录已被 ${res.data.labelCount} 个标签引用，无法删除。\n请先清理标签关联后再删除。`)
        return
      }
    } catch {
      // 检查失败不阻止删除（降级策略）
    }
  }
  const success = await deleteItems(ids)
  if (success) {
    selectedRows.value = []
  } else {
    await showAlert('删除失败，请重试。')
  }
}

// ==================== 处理结束计划 ====================
async function handleEnd(record, endType) {
  if (!record.productionPlanCode) {
    await showAlert('该种植没有关联的生产计划，无法结束')
    return
  }

  const batch = await cropBatchService.getCropBatchByCode(record.productionPlanCode)
  if (!batch) {
    await showAlert('未找到关联的生产计划')
    return
  }

  if (batch.batchStatus === 'completed') {
    await showAlert('该生产计划已完成结束，不能重复结束')
    return
  }

  const completionRate = cropBatchService.getCompletionRate(batch, record.harvestQuantity || 0)
  const isNormal = endType === 'normal'
  const confirmMsg = isNormal
    ? `确认正常结束此生产计划？\n\n采收完成比例：${Math.round(completionRate * 100)}%\n结束后禁止一切入库和补录操作`
    : `确认异常结束此生产计划？\n\n采收完成比例：${Math.round(completionRate * 100)}%\n结束后如需补录，需提交审核申请`

  if (!await showConfirm(confirmMsg)) {
    return
  }

  const result = await cropBatchService.endCropBatch(batch.id, endType)
  if (result) {
    await showAlert(isNormal ? '生产计划已正常结束' : '生产计划已异常结束')
    window.location.reload()
  } else {
    await showAlert('结束失败')
  }
}

// ==================== 标签详情 - 加载该种植的标签并打开弹窗 ====================
async function handleLabelDetail(record) {
  currentLabelPlanting.value = record
  await loadLabels(record.id)
  // 从 store 读取最新状态（避免闭包陷阱）
  const freshLabels = plantLabelStore.labels
  const labelIds = freshLabels.map((l) => l.id)
  if (labelIds.length > 0) {
    await loadResumesForLabels(labelIds)
  }
  setLabelDetailOpen(true)
}

// ==================== 移入/移出 ====================
function handleMove(record) {
  currentRecord.value = record
  setMoveModalOpen(true)
}

// ==================== 标记管理 ====================
async function handleMark(record) {
  currentLabelPlanting.value = record
  await loadLabels(record.id)
  await loadMarks()
  setMarkModalOpen(true)
}

// ==================== 留种操作 ====================
function handleSeedSaving(record) {
  // V1.1: /farm/seed-source；V2.0: /crop/seed-source
  const params = new URLSearchParams({
    action: 'seed-saving',
    plantingId: record.id,
    plantingCode: record.plantingCode || '',
    cropName: record.cropName || '',
  })
  router.push(`/crop/seed-source?${params.toString()}`)
}

// 2026-07-24: 育种记录（行级按钮回调，对齐 V1.1 onBreedingRecord）
function handleBreedingRecord(record) {
  // 育种记录弹窗 - 与 V1.1 行为一致：跳转种植详情或打开弹窗
  // V1.1 中 BreedingFields/BreedingHistoryTable 通过 PlantingLabelManageModal 入口
  // V2.0 简化：直接进入详情页（详情页包含育种历史区块）
  // 预留独立弹窗入口
  ElMessage.info(`打开 ${record.plantCode} 的育种记录（${record.isBreeding ? '已启用' : '未启用'}）`)
}

// 2026-07-24: 留种记录（行级按钮回调，对齐 V1.1 onSeedSavingRecord）
function handleSeedSavingRecord(record) {
  // 与 handleSeedSaving 区分：V1.1 独立 onSeedSavingRecord 用于查看历史
  handleSeedSaving(record)
}

// ==================== 移入/移出提交 ====================
async function handleMoveSubmit(data) {
  // 从 store 读取最新标签列表（避免闭包陷阱）
  const freshLabels = plantLabelStore.labels
  const label = freshLabels.find((l) => l.label_number === data.labelNumber)
  if (!label) {
    ElMessage.error(`未找到对应标签 [${data.labelNumber}]，请检查标签编号`)
    return false
  }
  // 2026-07-24: 将 quantity 加到提交数据
  const submitData = {
    ...data,
    quantity: Number(data.quantity || 1),
    targetAreaName: data.targetArea  // 区域名称(area label) - 后端需要
  }
  const ok = await submitMove(label.id, submitData)
  if (ok) {
    ElMessage.success(`移动成功：${data.labelNumber} → ${data.targetArea}（${submitData.quantity} 株）`)
    await loadItems()
  } else {
    ElMessage.error('移动操作失败')
  }
  return ok
}

// ==================== 标记提交 ====================
async function handleMarkSubmit(markId, labelIds) {
  const ok = await submitMark(markId, labelIds)
  if (ok) {
    await showAlert('标记分配成功')
  } else {
    await showAlert('标记分配失败')
  }
  return ok
}

// 2026-07-22 P0 修复：每日记录弹窗操作（1:1 对齐 V1.1 PlantingPage.tsx L173-188）
function handleDailyRecord(record) {
  dailyRecordModal.value = { open: true, record }
}
function closeDailyRecord() {
  dailyRecordModal.value = { open: false, record: null }
}
function handleDailyRecordSuccess() {
  // Store action 内部已 await loadItems()，列表会实时刷新
  // 不调用 closeDailyRecord — 弹窗只在用户主动关闭时才关闭
}

// 2026-07-22 P0 修复：行级采收入库弹窗操作（1:1 对齐 V1.1 PlantingPage.tsx L142-155）
function handleInbound(record) {
  // 实时从 store 取最新 record（避免 stale 快照）
  const latest = plantingStore.plantings?.find?.((i) => i.id === record.id) || record
  inboundUnifiedRecord.value = {
    id: String(latest.id),
    plantCode: latest.plantCode,
    cropName: latest.cropName || '',
    cropVariety: latest.cropVariety || '',
    cropCode: latest.cropCode || '',
    unit: latest.unit || '株',
    plantingMode: latest.plantingMode,
    endTime: latest.endTime,
    status: latest.status
  }
  inboundUnifiedOpen.value = true
}
function closeInboundUnified() {
  inboundUnifiedOpen.value = false
  inboundUnifiedRecord.value = null
}
async function handleInboundSuccess() {
  closeInboundUnified()
  await loadItems()
}

// 2026-07-22 P0 修复：移入/移出记录查看
function handleViewMoveRecords(record) {
  currentRecord.value = record
  setMoveRecordsOpen(true)
}

// 2026-07-22 P0 修复：只读判断（用于 DailyRecordModal）
const isReadOnly = (r) => {
  if (!r) return false
  return Boolean(
    r.status === PlantingStatus.ENDED ||
    r.status === PlantingStatus.HARVESTED ||
    r.status === 'cancelled' ||
    r.endType === 'normal' ||
    r.endType === 'abnormal'
  )
}

// ==================== 搜索/重置 ====================
function handleSearch() {
  pagination.value = { ...pagination.value, current: 1 }
}

function handleReset() {
  filters.value = {
    cropName: '',
    plantCode: '',
    sourceCode: '',
    areaName: '',
    isHarvest: '',
    startDate: '',
    endDate: '',
    transplantDate: '',
    createBy: '',
    orgName: '',
    countMin: undefined,
    countMax: undefined,
  }
  pagination.value = { ...pagination.value, current: 1 }
}

// ==================== 导出相关 ====================
function handleExportClick() {
  setOperationMode('export')
  exportMode.value = true
  selectedRows.value = []
}

function handleExportSelectAll() {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map((item) => item.id)
  }
}

function handleExportCancel() {
  exportMode.value = false
  setOperationMode('normal')
  selectedRows.value = []
}

function handleExportClickConfirm() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要导出的数据')
    return
  }
  setShowExportModal(true)
}

// 确认打印
function handlePrintConfirm(records) {
  if (records.length === 0) {
    showAlert('请先选择要打印的记录')
    return
  }
  printRecords.value = records
  currentRecord.value = records[0]
  setPrintModalOpen(true)
  printMode.value = false
  selectedRows.value = []
}

// ==================== 确认导出（生成 csv/word/excel）====================
async function handleConfirmExport() {
  // 获取选中的数据
  const selectedData = filteredData.value.filter((item) => selectedRows.value.includes(item.id))

  // 导出表头
  const headers = ['种植批号', '来源类型', '来源批号', '作物品种', '品种', '种植区域', '大棚名称', '种植数量', '种植日期', '土壤PH', '土壤EC', '移栽数量', '移栽日期', '是否采收', '采收日期', '损耗率', '溯源码', '状态', '创建人', '创建时间', '备注']

  // 生成导出数据
  const exportData = selectedData.map((record) => ({
    '种植批号': record.plantCode,
    '来源类型': record.sourceType === SourceType.SEED ? '种子' : '种苗',
    '来源批号': record.sourceCode,
    '作物品种': record.cropName,
    '品种': record.cropVariety,
    '种植区域': record.areaName,
    '大棚名称': record.rootName,
    '种植数量': record.plantingCount,
    '种植日期': record.plantingDate,
    '土壤PH': record.soilPH || '',
    '土壤EC': record.soilEC || '',
    '移栽数量': record.transplantCount || '',
    '移栽日期': record.transplantDate || '',
    '是否采收': record.isHarvest ? '是' : '否',
    '采收日期': record.harvestDate || '',
    '损耗率': `${record.attritionRate}%`,
    '溯源码': record.traceabilityCode,
    '状态': record.status === PlantingStatus.PLANTED ? '已定植' : record.status === PlantingStatus.GROWING ? '生长期' : record.status === PlantingStatus.HARVESTED ? '已采收' : '已取消',
    '创建人': record.createBy,
    '创建时间': record.createTime,
    '备注': record.remarks || '',
  }))

  // 创建内容
  let content
  let mimeType
  let extension

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map((row) =>
      headers.map((h) => `"${row[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'word') {
    content = `<html><head><meta charset="utf-8"><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #4a90d9; color: white; }</style></head><body><table border="1"><tr>${headers.map((h) => `<th style="background-color: #4a90d9; color: white;">${h}</th>`).join('')}</tr>${exportData.map((row) => `<tr>${headers.map((h) => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'docx'
  } else {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${exportData.map((row) => `<tr>${headers.map((h) => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  }

  const fileName = `种植管理_${new Date().toISOString().slice(0, 10)}.${extension}`

  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
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
    // 降级：直接下载
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
  setShowExportModal(false)
}
</script>
