<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <Document />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">生产计划</h1>
          <p class="text-gray-500">管理种植批次、生产计划和技术方案</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <ProductionStatsCards :batches="batches" />

    <!-- 筛选表单 -->
    <ProductionFilters
      :batch-code-search="batchCodeSearch"
      :planting-mode-search="plantingModeSearch"
      :crop-name-search="cropNameSearch"
      :variety-search="varietySearch"
      :greenhouse-search="greenhouseSearch"
      :status-filter="statusFilter"
      :plan-type-filter="planTypeFilter"
      @batch-code-change="batchCodeSearch = $event"
      @planting-mode-change="plantingModeSearch = $event"
      @crop-name-change="cropNameSearch = $event"
      @variety-change="varietySearch = $event"
      @greenhouse-change="greenhouseSearch = $event"
      @status-change="statusFilter = $event"
      @plan-type-change="planTypeFilter = $event"
      @reset="resetFilters"
      @search="handleSearch"
    />

    <!-- 生产计划列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">生产计划列表</h3>
        <div class="flex gap-2">
          <el-button v-if="canCreate" type="primary" @click="handleOpenCreateModal">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" type="warning" @click="handleBatchEdit">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" type="danger" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport" type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <ProductionTable
        :filtered-batches="filteredBatches"
        :current-page="currentPage"
        :page-size="pageSize"
        :selected-rows="selectedRows"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @select-row="handleSelectRow"
        @select-all="handleSelectAll"
        @batch-code-click="handleBatchCodeClick"
        @edit="handleSingleEdit"
        @delete="handleSingleDelete"
      />
    </div>

    <!-- 创建批次弹窗 -->
    <CreateBatchModal
      :visible="showCreateModal"
      :form-data="formData"
      :errors="errors"
      :greenhouses="greenhouses"
      @close="handleCloseCreateModal"
      @save-draft="handleSaveDraft"
      @submit-for-approval="handleSubmitForApproval"
      @form-change="handleFormChange"
      @generate-code="generateBatchCode"
    />

    <!-- 批次详情弹窗 -->
    <BatchDetailModal
      v-if="selectedBatch"
      :batch="selectedBatch"
      @close="selectedBatch = null"
    />

    <!-- 导出格式弹窗 -->
    <ExportFormatModal
      :visible="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @close="showExportModal = false"
      @change="exportFormat = $event"
      @confirm="handleDoExport"
    />

    <!-- 删除确认弹窗 -->
    <DeleteWarningModal
      v-model:visible="showDeleteWarning"
      :selected-count="selectedRows.length"
      @confirm="handleDeleteConfirm"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      v-model:visible="showBatchEditModal"
      :selected-rows="selectedRows"
      :batches="batches"
      :greenhouses="greenhouses"
      @publish="handlePublish"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import ProductionStatsCards from '@/components/production/ProductionStatsCards.vue'
import ProductionFilters from '@/components/production/ProductionFilters.vue'
import ProductionTable from '@/components/production/ProductionTable.vue'
import CreateBatchModal from '@/components/production/modals/CreateBatchModal.vue'
import BatchDetailModal from '@/components/production/modals/BatchDetailModal.vue'
import BatchEditModal from '@/components/production/modals/BatchEditModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import {  CropBatch  } from '@/types'
import dayjs from 'dayjs'

// 权限控制
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)

// Store
const greenhouseStore = useGreenhouseStore()
const productionPlanStore = useProductionPlanStore()

const greenhouses = computed(() => greenhouseStore.greenhouses)
const batches = computed(() => productionPlanStore.plans)

// 筛选状态
const batchCodeSearch = ref('')
const plantingModeSearch = ref('')
const cropNameSearch = ref('')
const varietySearch = ref('')
const greenhouseSearch = ref('')
const statusFilter = ref('all')
const planTypeFilter = ref('all')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 选中状态
const selectedRows = ref([])

// 模式状态
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)

// 弹窗状态
const showCreateModal = ref(false)
const showExportModal = ref(false)
const showDeleteWarning = ref(false)
const showBatchEditModal = ref(false)

// 详情选中
const selectedBatch = ref(null)

// 导出格式
const exportFormat = ref('excel')

// 筛选后的批次数据
const filteredBatches = computed(() => {
  return batches.value.filter(batch => {
    const matchBatchCode = !batchCodeSearch.value || batch.batchCode.toLowerCase().includes(batchCodeSearch.value.toLowerCase())
    const matchPlantingMode = !plantingModeSearch.value || batch.plantingMode.toLowerCase().includes(plantingModeSearch.value.toLowerCase())
    const matchCropName = !cropNameSearch.value || batch.cropName.toLowerCase().includes(cropNameSearch.value.toLowerCase())
    const matchVariety = !varietySearch.value || batch.variety.toLowerCase().includes(varietySearch.value.toLowerCase())
    const matchGreenhouse = !greenhouseSearch.value || batch.greenhouseName.toLowerCase().includes(greenhouseSearch.value.toLowerCase())
    const matchStatus = statusFilter.value === 'all' || batch.batchStatus === statusFilter.value
    const matchPlanType = planTypeFilter.value === 'all' || batch.planType === planTypeFilter.value
    return matchBatchCode && matchPlantingMode && matchCropName && matchVariety && matchGreenhouse && matchStatus && matchPlanType
  })
})

// 表单数据
const formData = reactive({
  batchCode: '',
  planType: 'planting',
  planTypeName: '种植计划',
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
  planDetail: ''
})

const errors = ref({})

// 加载数据
onMounted(async () => {
  await greenhouseStore.loadGreenhouses()
  await productionPlanStore.fetchPlans()
})

const resetFilters = () => {
  batchCodeSearch.value = ''
  plantingModeSearch.value = ''
  cropNameSearch.value = ''
  varietySearch.value = ''
  greenhouseSearch.value = ''
  statusFilter.value = 'all'
  planTypeFilter.value = 'all'
}

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleSelectRow = (id) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const handleSelectAll = (selected) => {
  if (selected) {
    selectedRows.value = filteredBatches.value.map(b => b.id)
  } else {
    selectedRows.value = []
  }
}

const handleBatchCodeClick = (batch) => {
  selectedBatch.value = batch
}

const handleFormChange = (field, value) => {
  (formData)[field] = value
}

const generateBatchCode = () => {
  const year = new Date().getFullYear()
  const num = batches.value.length + 1
  const prefix = formData.planType === 'planting' ? 'ZZB' : formData.planType === 'seedling' ? 'YMB' : 'JZB'
  formData.batchCode = `${prefix}${year}-${String(num).padStart(3, '0')}`
}

const handleOpenCreateModal = () => {
  // 获取第一个活跃的温室
  const activeGreenhouses = greenhouses.value.filter(g => g.status === 'active')
  const firstGreenhouseId = activeGreenhouses[0]?.id || ''

  Object.assign(formData, {
    batchCode: '',
    planType: 'planting',
    planTypeName: '种植计划',
    cropName: '',
    variety: '',
    greenhouseId: firstGreenhouseId,
    plantingArea: '',
    startDate: '',
    expectedHarvestDate: '',
    targetYield: '',
    plantingMode: 'open_field',
    responsiblePerson: '郭靖',
    publisher: localStorage.getItem('username') || '陆启闯',
    description: '',
    planDetail: ''
  })

  showCreateModal.value = true
}

const handleCloseCreateModal = () => {
  showCreateModal.value = false
}

const validateForm = () => {
  const newErrors = {}
  if (!formData.batchCode.trim()) newErrors.batchCode = '请输入批次编号'
  if (!formData.cropName) newErrors.cropName = '请选择作物'
  if (!formData.variety.trim()) newErrors.variety = '请输入品种'
  if (!formData.greenhouseId) newErrors.greenhouseId = '请选择区域'
  if (!formData.plantingArea) newErrors.plantingArea = '请输入种植面积'
  if (!formData.startDate) newErrors.startDate = '请选择定植日期'
  if (!formData.expectedHarvestDate) newErrors.expectedHarvestDate = '请选择预计采收日期'
  if (!formData.targetYield) newErrors.targetYield = '请输入目标产量'
  if (!formData.plantingMode) newErrors.plantingMode = '请选择种植模式'
  if (!formData.responsiblePerson) newErrors.responsiblePerson = '请选择负责人'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSaveDraft = async () => {
  if (!validateForm()) return

  const greenhouse = greenhouses.value.find(g => g.id === formData.greenhouseId)
  const today = dayjs().format('YYYY-MM-DD')

  const apiData = {
    id: `PP${Date.now()}`,
    batchCode: formData.batchCode,
    batchName: formData.batchCode,
    planType: formData.planType,
    cropName: formData.cropName,
    variety: formData.variety,
    greenhouseId: formData.greenhouseId,
    greenhouseName: greenhouse?.name || '',
    areaName: greenhouse?.name || '',
    areaId: '',
    targetQuantity: parseInt(formData.targetYield) || 0,
    targetYield: parseInt(formData.targetYield) || 0,
    actualYield: 0,
    startDate: formData.startDate,
    expectedHarvestDate: formData.expectedHarvestDate,
    actualHarvestDate: '',
    status: 'draft',
    stage: 'seedling',
    stageName: '苗期',
    priority: 'normal',
    remarks: formData.description || '',
    publisher: formData.publisher,
    createBy: formData.publisher,
    responsiblePerson: formData.responsiblePerson,
    unit: 'kg',
    publishDate: '',
    batchStatus: 'draft',
    planDetail: formData.planDetail || '',
    planDetailFileName: '',
    plantingArea: parseFloat(formData.plantingArea) || 0,
    plantingMode: formData.plantingMode,
    supplierName: '',
    seedlingSiteName: '',
    seedQuantity: 0,
    targetSeedlingCount: 0,
  }

  try {
    await productionPlanStore.addPlan(apiData)
    ElMessage.success('保存草稿成功')
    showCreateModal.value = false
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败，请重试')
  }
}

const handleSubmitForApproval = async () => {
  if (!validateForm()) return

  const greenhouse = greenhouses.value.find(g => g.id === formData.greenhouseId)
  const today = dayjs().format('YYYY-MM-DD')

  const apiData = {
    id: `PP${Date.now()}`,
    batchCode: formData.batchCode,
    batchName: formData.batchCode,
    planType: formData.planType,
    cropName: formData.cropName,
    variety: formData.variety,
    greenhouseId: formData.greenhouseId,
    greenhouseName: greenhouse?.name || '',
    areaName: greenhouse?.name || '',
    areaId: '',
    targetQuantity: parseInt(formData.targetYield) || 0,
    targetYield: parseInt(formData.targetYield) || 0,
    actualYield: 0,
    startDate: formData.startDate,
    expectedHarvestDate: formData.expectedHarvestDate,
    actualHarvestDate: '',
    status: 'pending',
    stage: 'seedling',
    stageName: '苗期',
    priority: 'normal',
    remarks: formData.description || '',
    publisher: formData.publisher,
    createBy: formData.publisher,
    responsiblePerson: formData.responsiblePerson,
    unit: 'kg',
    publishDate: '',
    batchStatus: 'pending',
    planDetail: formData.planDetail || '',
    planDetailFileName: '',
    plantingArea: parseFloat(formData.plantingArea) || 0,
    plantingMode: formData.plantingMode,
    supplierName: '',
    seedlingSiteName: '',
    seedQuantity: 0,
    targetSeedlingCount: 0,
  }

  try {
    await productionPlanStore.addPlan(apiData)
    ElMessage.success('提交审批成功')
    showCreateModal.value = false
  } catch (error) {
    console.error('提交审批失败:', error)
    ElMessage.error('提交审批失败，请重试')
  }
}

const handleBatchEdit = () => {
  batchEditMode.value = true
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  showDeleteWarning.value = true
}

const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleDoExport = async () => {
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
      headers.map(h => `"${row[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const fileName = `生产计划_${dayjs().format('YYYY-MM-DD')}.${extension}`

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  showExportModal.value = false
  selectedRows.value = []
}

const handleDeleteConfirm = async () => {
  try {
    const toDelete = selectedRows.value
    await productionPlanStore.deletePlans(toDelete)
    ElMessage.success('删除成功')
    selectedRows.value = []
  } catch (error) {
    console.error('删除生产计划失败:', error)
    ElMessage.error('删除失败，请重试')
  }
  showDeleteWarning.value = false
}

const handleSingleEdit = (batch) => {
  if (batch.batchStatus === 'completed' || batch.batchStatus === 'cancelled') {
    ElMessage.warning('该生产计划已归档，无法编辑')
    return
  }
  selectedRows.value = [batch.id]
  showBatchEditModal.value = true
}

const handleSingleDelete = async (batch) => {
  if (batch.batchStatus !== 'draft' && batch.batchStatus !== 'cancelled') {
    ElMessage.warning('只有草稿或已作废状态的生产计划才能删除')
    return
  }
  try {
    await productionPlanStore.deletePlan(batch.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除生产计划失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

const handleCloseBatchEditModal = () => {
  showBatchEditModal.value = false
  selectedRows.value = []
}

const handlePublish = async () => {
  ElMessage.success('提交审批成功')
  showBatchEditModal.value = false
  selectedRows.value = []
  await productionPlanStore.fetchPlans()
}

// 批次状态标签映射
const batchStatusLabels = {
  draft: '草稿',
  pending: '待审批',
  approved: '已审批',
  rejected: '已拒绝',
  completed: '已完成',
  cancelled: '已作废'
}
</script>
