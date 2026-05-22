<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <FileText class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">生产计划</h1>
          <p class="text-gray-500">管理种植批次、生产计划和技术方案</p>
        </div>
      </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <ProductionStatsCards :batches="batches" />

    <!-- Filters -->
    <ProductionFilters
      v-model:batchCodeSearch="batchCodeSearch"
      v-model:plantingModeSearch="plantingModeSearch"
      v-model:cropNameSearch="cropNameSearch"
      v-model:varietySearch="varietySearch"
      v-model:greenhouseSearch="greenhouseSearch"
      v-model:statusFilter="statusFilter"
      v-model:planTypeFilter="planTypeFilter"
      @reset="resetFilters"
      @search="() => {}"
    />

    <!-- 生产计划列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">生产计划列表</h3>
        <div v-if="exportMode" class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed" @click="showExportModal = true">
            <Download class="w-4 h-4" />
            确认导出
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleCancelExport">取消</button>
        </div>
        <div v-else-if="batchEditMode" class="flex gap-2">
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="selectedRows.length === 0"
            @click="showBatchEditModal = true"
          >
            <Edit class="w-4 h-4" />
            批量编辑
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="batchEditMode = false; selectedRows = []">
            取消
          </button>
        </div>
        <div v-else-if="batchDeleteMode" class="flex gap-2">
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="selectedRows.length === 0"
            @click="showDeleteWarning = true"
          >
            <Trash2 class="w-4 h-4" />
            确认删除
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="batchDeleteMode = false; selectedRows = []">
            取消
          </button>
        </div>
        <div v-else class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="showCreateModal = true">
            <Plus class="w-4 h-4" />
            新增
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700" @click="batchEditMode = true; selectedRows = []">
            <Edit class="w-4 h-4" />
            编辑
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700" @click="batchDeleteMode = true; selectedRows = []">
            <Trash2 class="w-4 h-4" />
            删除
          </button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleExportClick">
            <Download class="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      <ProductionTable
        :filtered-batches="filteredBatches"
        :current-page="currentPage"
        :page-size="pageSize"
        :export-mode="exportMode"
        :batch-edit-mode="batchEditMode"
        :batch-delete-mode="batchDeleteMode"
        :selected-rows="selectedRows"
        @page-change="currentPage = $event"
        @page-size-change="handlePageSizeChange"
        @select-row="handleSelectRow"
        @select-all="handleSelectAll"
        @batch-select-all="handleBatchSelectAll"
        @batch-delete-select-all="handleBatchDeleteSelectAll"
        @batch-code-click="selectedBatch = $event; showDetailModal = true"
        @edit="handleSingleEdit"
        @delete="handleSingleDelete"
      />
    </div>

    <!-- Create Batch Modal -->
    <CreateBatchModal
      v-model="showCreateModal"
      :form-data="formData"
      :errors="errors"
      :greenhouses="greenhouses"
      @close="handleClose"
      @save-draft="handleSaveDraft"
      @submit-for-approval="handleSubmitForApproval"
      @generate-code="generateBatchCode"
      @form-change="handleFormChange"
    />

    <!-- Batch Detail Modal -->
    <BatchDetailModal
      v-model="showDetailModal"
      :batch="selectedBatch"
      @close="showDetailModal = false; selectedBatch = null"
    />

    <!-- Export Format Modal -->
    <el-dialog v-model="showExportModal" class="production-export-dialog" title="选择导出格式" width="400px" align-center append-to-body>
      <div class="p-4 space-y-4">
        <p class="text-sm text-gray-600">已选择 {{ selectedRows.length }} 条记录</p>
        <el-radio-group v-model="exportFormat">
          <el-radio label="excel">Excel (.xlsx)</el-radio>
          <el-radio label="csv">CSV (.csv)</el-radio>
          <el-radio label="word">Word (.docx)</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="showExportModal = false">取消</button>
          <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleDoExport">导出</button>
        </div>
      </template>
    </el-dialog>

    <!-- Batch Edit Modal -->
    <BatchEditModal
      v-model="showBatchEditModal"
      v-model:selected-batch-code="selectedBatchCode"
      v-model:edited-batches="editedBatches"
      v-model:edited-batch-codes="editedBatchCodes"
      :selected-rows="selectedRows"
      :batches="batches"
      :greenhouses="greenhouses"
      @close="showBatchEditModal = false"
      @void-warning="showVoidWarning = true"
      @publish="handlePublish"
      @confirm-next="handleConfirmNext"
    />

    <!-- Void Warning Modal -->
    <VoidWarningModal
      v-model="showVoidWarning"
      @confirm="handleVoidConfirm"
    />

    <!-- Delete Warning Modal -->
    <DeleteWarningModal
      v-model="showDeleteWarning"
      :selected-count="selectedRows.length"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Plus, FileText, Download, Edit, Trash2 } from 'lucide-vue-next'
import { useProductionPlanStore, useGreenhouseStore } from '@/stores'
import { showAlert, showConfirm } from '@/lib/dialogService'
import request from '@/api/request'
import ProductionStatsCards from '@/components/production/ProductionStatsCards.vue'
import ProductionFilters from '@/components/production/ProductionFilters.vue'
import ProductionTable from '@/components/production/ProductionTable.vue'
import CreateBatchModal from '@/components/production/modals/CreateBatchModal.vue'
import BatchDetailModal from '@/components/production/modals/BatchDetailModal.vue'
import BatchEditModal from '@/components/production/modals/BatchEditModal.vue'
import VoidWarningModal from '@/components/production/modals/VoidWarningModal.vue'
import DeleteWarningModal from '@/components/production/modals/DeleteWarningModal.vue'
import { PlanType, PlanTypeCodePrefix, batchStatusLabels } from '@/components/production/constants'
import { getAllVarieties } from '@/services/cropVarietyService'

// ==================== Store ====================
const productionPlanStore = useProductionPlanStore()
const greenhouseStore = useGreenhouseStore()

const batches = computed(() => productionPlanStore.plans)
const greenhouses = computed(() => greenhouseStore.greenhouses)

onMounted(() => {
  if (greenhouses.value.length === 0) {
    greenhouseStore.loadGreenhouses()
  }
  productionPlanStore.fetchPlans()
})

// 页面可见性变化时自动刷新数据
onMounted(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      productionPlanStore.fetchPlans()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
})

// ==================== Permissions ====================
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true

// ==================== Filters ====================
const statusFilter = ref('all')
const planTypeFilter = ref('all')
const batchCodeSearch = ref('')
const plantingModeSearch = ref('')
const cropNameSearch = ref('')
const varietySearch = ref('')
const greenhouseSearch = ref('')

function resetFilters() {
  batchCodeSearch.value = ''
  plantingModeSearch.value = ''
  cropNameSearch.value = ''
  varietySearch.value = ''
  greenhouseSearch.value = ''
  statusFilter.value = 'all'
  planTypeFilter.value = 'all'
}

const filteredBatches = computed(() => {
  return batches.value.filter((batch) => {
    const matchBatchCode = !batchCodeSearch.value || batch.batchCode.toLowerCase().includes(batchCodeSearch.value.toLowerCase())
    const matchPlantingMode = !plantingModeSearch.value || (batch.plantingMode || '').toLowerCase().includes(plantingModeSearch.value.toLowerCase())
    const matchCropName = !cropNameSearch.value || (batch.cropName || '').toLowerCase().includes(cropNameSearch.value.toLowerCase())
    const matchVariety = !varietySearch.value || (batch.variety || '').toLowerCase().includes(varietySearch.value.toLowerCase())
    const matchGreenhouse = !greenhouseSearch.value || (batch.greenhouseName || '').toLowerCase().includes(greenhouseSearch.value.toLowerCase())
    const matchStatus = statusFilter.value === 'all' || batch.batchStatus === statusFilter.value
    const matchPlanType = planTypeFilter.value === 'all' || batch.planType === planTypeFilter.value
    return matchBatchCode && matchPlantingMode && matchCropName && matchVariety && matchGreenhouse && matchStatus && matchPlanType
  })
})

// ==================== Pagination ====================
const currentPage = ref(1)
const pageSize = ref(10)

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

// ==================== Form State ====================
const formData = ref({
  batchCode: '',
  planType: PlanType.PLANTING,
  planTypeName: '种植计划',
  cropCode: '',
  cropName: '',
  variety: '',
  greenhouseId: '',
  plantingArea: '',
  startDate: '',
  expectedHarvestDate: '',
  targetYield: '',
  plantingMode: '',
  responsiblePerson: '',
  publisher: localStorage.getItem('username') || '陆启闯',
  description: '',
  planDetail: '',
})

const errors = ref<Record<string, string>>({})

function handleFormChange(field: string, value: unknown) {
  formData.value = { ...formData.value, [field]: value }
}

function resetForm() {
  formData.value = {
    batchCode: '',
    planType: PlanType.PLANTING,
    planTypeName: '种植计划',
    cropCode: '',
    cropName: '',
    variety: '',
    greenhouseId: '',
    plantingArea: '',
    startDate: '',
    expectedHarvestDate: '',
    targetYield: '',
    plantingMode: '',
    responsiblePerson: '',
    publisher: localStorage.getItem('username') || '陆启闯',
    description: '',
    planDetail: '',
  }
}

function validateForm() {
  const newErrors: Record<string, string> = {}
  if (!formData.value.batchCode.trim()) newErrors.batchCode = '请输入批次编号'
  if (!formData.value.cropName) newErrors.cropName = '请选择作物'
  if (!formData.value.variety.trim()) newErrors.variety = '请输入品种'
  if (!formData.value.greenhouseId) newErrors.greenhouseId = '请选择区域'
  if (!formData.value.plantingArea) newErrors.plantingArea = '请输入种植面积'
  if (!formData.value.startDate) newErrors.startDate = '请选择定植日期'
  if (!formData.value.expectedHarvestDate) newErrors.expectedHarvestDate = '请选择预计采收日期'
  if (!formData.value.targetYield) newErrors.targetYield = '请输入目标产量'
  if (!formData.value.plantingMode) newErrors.plantingMode = '请选择种植模式'
  if (!formData.value.responsiblePerson) newErrors.responsiblePerson = '请选择负责人'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// ==================== Modals ====================
const showCreateModal = ref(false)
const selectedBatch = ref<any>(null)
const showDetailModal = ref(false)
const exportMode = ref(false)
const selectedRows = ref<string[]>([])
const exportFormat = ref('excel')
const showExportModal = ref(false)
const batchEditMode = ref(false)
const showBatchEditModal = ref(false)
const selectedBatchCode = ref('')
const editedBatchCodes = ref<string[]>([])
const editedBatches = ref<Record<string, any>>({})
const showVoidWarning = ref(false)
const batchDeleteMode = ref(false)
const showDeleteWarning = ref(false)

function handleClose() {
  showCreateModal.value = false
  resetForm()
  errors.value = {}
}

function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

function handleCancelExport() {
  exportMode.value = false
  selectedRows.value = []
}

function handleSelectAll() {
  if (selectedRows.value.length === filteredBatches.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredBatches.value.map(b => b.id)
  }
}

function handleSelectRow(id: string) {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

function handleBatchSelectAll() {
  const selectable = filteredBatches.value.filter(b => b.batchStatus !== 'completed' && b.batchStatus !== 'cancelled')
  if (selectedRows.value.length === selectable.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = selectable.map(b => b.id)
  }
}

function handleBatchDeleteSelectAll() {
  const deletable = filteredBatches.value.filter(b => b.batchStatus === 'draft' || b.batchStatus === 'cancelled')
  if (selectedRows.value.length === deletable.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = deletable.map(b => b.id)
  }
}

function generateBatchCode() {
  const year = new Date().getFullYear()
  const num = batches.value.length + 1
  const prefix = PlanTypeCodePrefix[formData.value.planType as keyof typeof PlanTypeCodePrefix] || 'FQ'
  const code = `${prefix}${year}-${String(num).padStart(3, '0')}`
  formData.value = { ...formData.value, batchCode: code }
}

// ==================== Create Handlers ====================
async function handleSaveDraft() {
  if (!validateForm()) return

  const greenhouse = greenhouses.value.find(g => g.id === formData.value.greenhouseId)
  const cropVariety = getAllVarieties().find(v =>
    v.varietyName === formData.value.cropName || v.typeName === formData.value.cropName || v.categoryName === formData.value.cropName
  )
  const today = new Date().toISOString().slice(0, 10)

  const apiData = {
    id: `PP${Date.now()}`,
    batchCode: formData.value.batchCode,
    batchName: formData.value.batchCode,
    planType: formData.value.planType,
    cropName: formData.value.cropName,
    variety: formData.value.variety,
    greenhouseId: formData.value.greenhouseId,
    greenhouseName: greenhouse?.name || '',
    areaName: greenhouse?.name || '',
    areaId: '',
    targetQuantity: parseInt(formData.value.targetYield as string) || 0,
    targetYield: parseInt(formData.value.targetYield as string) || 0,
    actualYield: 0,
    startDate: formData.value.startDate,
    expectedHarvestDate: formData.value.expectedHarvestDate,
    actualHarvestDate: '',
    status: 'draft',
    stage: 'seedling',
    stageName: '苗期',
    priority: 'normal',
    remarks: formData.value.description || '',
    publisher: formData.value.publisher || localStorage.getItem('username') || '陆启闯',
    createBy: formData.value.publisher || localStorage.getItem('username') || '陆启闯',
    responsiblePerson: formData.value.responsiblePerson,
    unit: 'kg',
    publishDate: '',
    batchStatus: 'draft',
    planDetail: formData.value.planDetail || '',
    planDetailFileName: '',
    plantingArea: parseFloat(formData.value.plantingArea as string) || 0,
    plantingMode: formData.value.plantingMode,
    supplierName: '',
    seedlingSiteName: '',
    seedQuantity: 0,
    targetSeedlingCount: 0,
  }

  try {
    await productionPlanStore.addPlan(apiData)
    showCreateModal.value = false
    resetForm()
    errors.value = {}
  } catch (error) {
    console.error('保存草稿失败:', error)
    await showAlert('保存草稿失败，请重试')
  }
}

async function refreshApprovals() {
  try {
    await request.get('/approvals')
  } catch (error) {
    console.error('刷新审批数据失败:', error)
  }
}

async function handleSubmitForApproval() {
  if (!validateForm()) return

  const greenhouse = greenhouses.value.find(g => g.id === formData.value.greenhouseId)
  const today = new Date().toISOString().slice(0, 10)

  const apiData = {
    id: `PP${Date.now()}`,
    batchCode: formData.value.batchCode,
    batchName: formData.value.batchCode,
    planType: formData.value.planType,
    cropName: formData.value.cropName,
    variety: formData.value.variety,
    greenhouseId: formData.value.greenhouseId,
    greenhouseName: greenhouse?.name || '',
    areaName: greenhouse?.name || '',
    areaId: '',
    targetQuantity: parseInt(formData.value.targetYield as string) || 0,
    targetYield: parseInt(formData.value.targetYield as string) || 0,
    actualYield: 0,
    startDate: formData.value.startDate,
    expectedHarvestDate: formData.value.expectedHarvestDate,
    actualHarvestDate: '',
    status: 'pending',
    stage: 'seedling',
    stageName: '苗期',
    priority: 'normal',
    remarks: formData.value.description || '',
    publisher: formData.value.publisher || localStorage.getItem('username') || '陆启闯',
    createBy: formData.value.publisher || localStorage.getItem('username') || '陆启闯',
    responsiblePerson: formData.value.responsiblePerson,
    unit: 'kg',
    publishDate: today,
    batchStatus: 'pending',
    planDetail: formData.value.planDetail || '',
    planDetailFileName: '',
    plantingArea: parseFloat(formData.value.plantingArea as string) || 0,
    plantingMode: formData.value.plantingMode,
    supplierName: '',
    seedlingSiteName: '',
    seedQuantity: 0,
    targetSeedlingCount: 0,
  }

  try {
    await productionPlanStore.addPlan(apiData)

    // 创建审批单
    const approvalData = {
      id: `AP${Date.now()}`,
      type: 'production_plan',
      typeName: '生产计划',
      title: `生产计划审批：${formData.value.batchCode}`,
      description: `作物：${formData.value.cropName} ${formData.value.variety}\n种植区域：${greenhouse?.name || ''}\n目标产量：${formData.value.targetYield}kg`,
      applicantId: localStorage.getItem('userId') || '',
      applicantName: formData.value.publisher || localStorage.getItem('username') || '陆启闯',
      applicantDepartment: localStorage.getItem('department') || '',
      applyDate: today,
      status: 'pending',
      priority: 'normal',
      businessLink: {
        type: 'production',
        requestId: apiData.id,
        requestCode: apiData.batchCode,
        cropName: formData.value.cropName,
        variety: formData.value.variety,
        greenhouseName: greenhouse?.name || '',
        startDate: formData.value.startDate,
        expectedHarvestDate: formData.value.expectedHarvestDate,
        responsiblePerson: formData.value.responsiblePerson,
        targetYield: parseInt(formData.value.targetYield as string) || 0,
        plantingArea: parseFloat(formData.value.plantingArea as string) || 0,
        plantingMode: formData.value.plantingMode,
      },
    }
    await request.post('/approvals', approvalData)

    // 刷新审批中心数据
    await refreshApprovals()

    showCreateModal.value = false
    resetForm()
    errors.value = {}
  } catch (error) {
    console.error('提交审批失败:', error)
    await showAlert('提交审批失败，请重试')
  }
}

// ==================== Export ====================
async function handleDoExport() {
  try {
    const selectedData = batches.value.filter(b => selectedRows.value.includes(b.id))
    const headers = ['生产计划批次号', '种植模式', '作物名称', '作物品种', '种植区域', '种植面积', '开始时间', '预计结束时间', '负责人', '目标产量', '发布人', '初次发布时间', '最后修改时间', '当前状态', '版本号', '备注']
    const exportData = selectedData.map(row => ({
      '生产计划批次号': row.batchCode,
      '种植模式': row.plantingMode,
      '作物名称': row.cropName,
      '作物品种': row.variety,
      '种植区域': row.greenhouseName,
      '种植面积': row.plantingArea,
      '开始时间': row.startDate,
      '预计结束时间': row.expectedHarvestDate,
      '负责人': row.responsiblePerson,
      '目标产量': row.targetYield,
      '发布人': row.publisher || '-',
      '初次发布时间': row.publishDate || '-',
      '最后修改时间': row.lastModifyDate || '-',
      '当前状态': batchStatusLabels[row.batchStatus || 'draft'] || '-',
      '版本号': 'V1.0',
      '备注': row.description || '-',
    }))

    let content = ''
    let mimeType = ''
    let extension = ''

    if (exportFormat.value === 'csv') {
      content = headers.join(',') + '\n' + exportData.map(row =>
        headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(',')
      ).join('\n')
      mimeType = 'text/csv;charset=utf-8'
      extension = 'csv'
    } else if (exportFormat.value === 'excel') {
      content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h as keyof typeof row] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
      mimeType = 'application/vnd.ms-excel;charset=utf-8'
      extension = 'xls'
    } else if (exportFormat.value === 'word') {
      content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h as keyof typeof row] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
      mimeType = 'application/vnd.ms-word;charset=utf-8'
      extension = 'doc'
    }

    const fileName = `生产计划_${new Date().toISOString().slice(0, 10)}.${extension}`
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
  } catch (error) {
    console.error('导出失败:', error)
    await showAlert('导出失败，请重试')
    showExportModal.value = false
    exportMode.value = false
    selectedRows.value = []
  }
}

// ==================== Single Actions ====================
function handleSingleEdit(batch: any) {
  if (batch.batchStatus === 'completed' || batch.batchStatus === 'cancelled') {
    showAlert('该生产计划已归档，无法编辑')
    return
  }
  selectedBatchCode.value = batch.batchCode
  selectedRows.value = [batch.id]
  showBatchEditModal.value = true
}

async function handleSingleDelete(batch: any) {
  if (batch.batchStatus !== 'draft' && batch.batchStatus !== 'cancelled') {
    await showAlert('只有草稿或已作废状态的生产计划才能删除')
    return
  }
  try {
    await productionPlanStore.deletePlan(batch.id)
    await showAlert('删除成功')
  } catch (error) {
    console.error('删除生产计划失败:', error)
    await showAlert('删除失败，请重试')
  }
}

// ==================== Batch Edit ====================
function handleConfirmNext() {
  if (selectedBatchCode.value && !editedBatchCodes.value.includes(selectedBatchCode.value)) {
    editedBatchCodes.value = [...editedBatchCodes.value, selectedBatchCode.value]
  }
  const currentIndex = selectedRows.value.findIndex(id => {
    const batch = batches.value.find(b => b.id === id)
    return batch?.batchCode === selectedBatchCode.value
  })
  if (currentIndex < selectedRows.value.length - 1) {
    const nextBatch = batches.value.find(b => b.id === selectedRows.value[currentIndex + 1])
    if (nextBatch) {
      selectedBatchCode.value = nextBatch.batchCode
    }
  }
}

async function handleVoidConfirm() {
  const currentUserId = localStorage.getItem('userId') || ''
  const currentUserName = localStorage.getItem('username') || '陆启闯'
  const currentDepartment = localStorage.getItem('department') || ''
  const today = new Date().toISOString().slice(0, 10)

  const currentBatch = batches.value.find(b => b.batchCode === selectedBatchCode.value)
  if (!currentBatch) {
    await showAlert('请先选择一个生产计划')
    return
  }

  try {
    const voidId = `BV${Date.now()}_${currentBatch.id}`
    const voidCode = `BV${today.replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    const approvalData = {
      id: voidId,
      type: 'production_plan',
      typeName: '生产计划',
      title: `生产计划作废审批：${currentBatch.batchCode}`,
      description: `申请作废生产计划：${currentBatch.batchCode}\n作物：${currentBatch.cropName} ${currentBatch.variety}\n区域：${currentBatch.greenhouseName}`,
      applicantId: currentUserId,
      applicantName: currentUserName,
      applicantDepartment: currentDepartment,
      applyDate: today,
      status: 'pending',
      priority: 'normal',
      businessLink: {
        type: 'production',
        approvalAction: 'void',
        requestId: currentBatch.id,
        requestCode: currentBatch.batchCode,
        cropName: currentBatch.cropName,
        variety: currentBatch.variety,
        greenhouseName: currentBatch.greenhouseName,
        startDate: currentBatch.startDate,
        expectedHarvestDate: currentBatch.expectedHarvestDate,
        responsiblePerson: currentBatch.responsiblePerson,
      },
    }

    await productionPlanStore.updatePlan(currentBatch.id, { batchStatus: 'pending' })
    await request.post('/approvals', approvalData)

    // 刷新审批中心数据
    await refreshApprovals()

    selectedRows.value = selectedRows.value.filter(id => id !== currentBatch.id)
    delete editedBatches.value[currentBatch.batchCode]
    editedBatches.value = { ...editedBatches.value }

    await showAlert(`已提交作废申请：${currentBatch.batchCode}`)
    showBatchEditModal.value = false
  } catch (error) {
    console.error('提交作废申请失败:', error)
    await showAlert('提交作废申请失败，请重试')
  }

  showVoidWarning.value = false
}

async function handleDeleteConfirm() {
  showDeleteWarning.value = false
  batchDeleteMode.value = false

  const toDelete = selectedRows.value
    .map(id => batches.value.find(b => b.id === id))
    .filter(batch => batch && (batch.batchStatus === 'draft' || batch.batchStatus === 'cancelled'))
    .map(batch => batch.id)

  if (toDelete.length === 0) {
    selectedRows.value = []
    return
  }

  try {
    await productionPlanStore.deletePlans(toDelete)
    selectedRows.value = []
  } catch (error) {
    console.error('删除生产计划失败:', error)
    await showAlert('删除失败，请重试')
  }
}

async function handlePublish() {
  const hasCompleteRequest = Object.values(editedBatches.value).some(
    edited => edited.isCompleted === true
  )

  if (hasCompleteRequest) {
    const confirmed = await showConfirm(
      '⚠️ 重要提示：\n\n' +
      '您选择将计划标记为完成状态。\n\n' +
      '完成后将进行归档：\n' +
      '• 无法进行任何编辑操作\n' +
      '• 无法删除计划\n\n' +
      '此操作不可逆，请确认！'
    )
    if (!confirmed) {
      return
    }
  }

  if (Object.keys(editedBatches.value).length > 0) {
    const submittedBatchIds: string[] = []

    try {
      const currentUserId = localStorage.getItem('userId') || ''
      const currentUserName = localStorage.getItem('username') || '陆启闯'
      const currentDepartment = localStorage.getItem('department') || ''

      for (const batch of batches.value) {
        const edited = editedBatches.value[batch.batchCode]
        if (edited) {
          const apiData: Record<string, unknown> = {}
          if (edited.targetQuantity !== undefined) apiData.targetQuantity = edited.targetQuantity
          if (edited.targetYield !== undefined) apiData.targetYield = edited.targetYield
          if (edited.cropName !== undefined) apiData.cropName = edited.cropName
          if (edited.variety !== undefined) apiData.variety = edited.variety
          if (edited.greenhouseName !== undefined) apiData.greenhouseName = edited.greenhouseName
          if (edited.greenhouseId !== undefined) apiData.greenhouseId = edited.greenhouseId
          if (edited.plantingArea !== undefined) apiData.plantingArea = edited.plantingArea
          if (edited.plantingMode !== undefined) apiData.plantingMode = edited.plantingMode
          if (edited.startDate !== undefined) apiData.startDate = edited.startDate
          if (edited.expectedHarvestDate !== undefined) apiData.expectedHarvestDate = edited.expectedHarvestDate
          if (edited.responsiblePerson !== undefined) apiData.responsiblePerson = edited.responsiblePerson
          if (edited.remarks !== undefined) apiData.remarks = edited.remarks
          if (edited.planDetail !== undefined) apiData.planDetail = edited.planDetail
          if (edited.planDetailFileName !== undefined) apiData.planDetailFileName = edited.planDetailFileName

          apiData.batchStatus = edited.isCompleted === true ? 'pending_complete' : 'pending'

          await productionPlanStore.updatePlan(batch.id, apiData)

          const today = new Date().toISOString().slice(0, 10)
          const changeId = `BC${Date.now()}_${batch.id}`

          const changes: string[] = []
          if (edited.cropName) changes.push(`作物名称: ${batch.cropName} → ${edited.cropName}`)
          if (edited.variety) changes.push(`品种: ${batch.variety} → ${edited.variety}`)
          if (edited.plantingArea) changes.push(`种植面积: ${batch.plantingArea} → ${edited.plantingArea}`)
          if (edited.startDate) changes.push(`开始时间: ${batch.startDate} → ${edited.startDate}`)
          if (edited.expectedHarvestDate) changes.push(`预计结束: ${batch.expectedHarvestDate} → ${edited.expectedHarvestDate}`)
          if (edited.responsiblePerson) changes.push(`负责人: ${batch.responsiblePerson} → ${edited.responsiblePerson}`)
          if (edited.targetYield) changes.push(`目标产量: ${batch.targetYield} → ${edited.targetYield}`)
          if (edited.isCompleted === true) changes.push(`计划完成: 标记为已完成（归档）`)

          const approvalData = {
            id: changeId,
            type: 'production_plan',
            typeName: '生产计划',
            title: edited.isCompleted === true
              ? `生产计划完成归档审批：${batch.batchCode}`
              : `生产计划编辑审批：${batch.batchCode}`,
            description: changes.join('\n'),
            applicantId: currentUserId,
            applicantName: currentUserName,
            applicantDepartment: currentDepartment,
            applyDate: today,
            status: 'pending',
            priority: 'normal',
            businessLink: {
              type: 'production',
              approvalAction: edited.isCompleted === true ? 'complete' : 'edit',
              requestId: batch.id,
              requestCode: batch.batchCode,
              cropName: edited.cropName || batch.cropName,
              variety: edited.variety || batch.variety,
              greenhouseName: edited.greenhouseName || batch.greenhouseName,
              startDate: edited.startDate || batch.startDate,
              expectedHarvestDate: edited.expectedHarvestDate || batch.expectedHarvestDate,
              responsiblePerson: edited.responsiblePerson || batch.responsiblePerson,
              targetYield: edited.targetYield || batch.targetYield,
              plantingArea: edited.plantingArea || batch.plantingArea,
              plantingMode: edited.plantingMode || batch.plantingMode,
            },
          }

          await request.post('/approvals', approvalData)
          submittedBatchIds.push(batch.id)
        }
      }
    } catch (error) {
      console.error('提交审批失败:', error)
      await showAlert('提交审批失败，请重试')
      return
    }

    await productionPlanStore.fetchPlans()

    const remainingSelectedRows = selectedRows.value.filter(id => !submittedBatchIds.includes(id))
    selectedRows.value = remainingSelectedRows

    const remainingEditedBatches = {}
    const remainingEditedBatchCodes = []
    batches.value.forEach(batch => {
      if (submittedBatchIds.includes(batch.id)) {
        // 已提交，清除编辑数据
      } else if (editedBatches.value[batch.batchCode]) {
        remainingEditedBatches[batch.batchCode] = editedBatches.value[batch.batchCode]
        remainingEditedBatchCodes.push(batch.batchCode)
      }
    })
    editedBatches.value = remainingEditedBatches
    editedBatchCodes.value = remainingEditedBatchCodes

    // 如果所有选中项都已提交，关闭弹窗；否则提示用户
    if (remainingSelectedRows.length === 0) {
      showBatchEditModal.value = false
      editedBatches.value = {}
      editedBatchCodes.value = []
      selectedRows.value = []
    } else {
      await showAlert(`已提交 ${submittedBatchIds.length} 项编辑申请，还有 ${remainingSelectedRows.length} 项待处理`)
    }
  } else {
    await showAlert('请先编辑至少一个生产计划')
  }
}

// 模态框打开时初始化表单默认值
watch(showCreateModal, (isOpen) => {
  if (isOpen) {
    const activeGreenhouses = greenhouses.value.filter(g => g.status === 'active')
    const firstGreenhouseId = activeGreenhouses[0]?.id || ''
    const defaultMode = 'open_field'
    const firstResponsiblePerson = '郭靖'

    formData.value = {
      ...formData.value,
      greenhouseId: firstGreenhouseId,
      plantingMode: defaultMode,
      responsiblePerson: firstResponsiblePerson,
    }
  }
})
</script>


<style scoped>
.production-export-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #10b981, #059669, #10b981) !important;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}
.production-export-dialog :deep(.el-dialog__title) {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.75rem;
}
.production-export-dialog :deep(.el-dialog__headerbtn) {
  width: 36px;
  height: 36px;
  top: 50%;
  transform: translateY(-50%);
  right: 1rem;
}
.production-export-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 1.25rem;
}
.production-export-dialog :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #ffffff;
}
.production-export-dialog :deep(.el-dialog__headerbtn:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}
</style>
