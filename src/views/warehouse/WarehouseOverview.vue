<template>
  <!-- 库存总览页面 - 与V1.1 WarehouseOverviewPage.tsx功能100%一致 -->
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Package :size="24" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">物料库存</h1>
            <p class="text-gray-500">仓库物料库存一览</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 :size="28" class="animate-spin text-emerald-500" />
      <span class="ml-3 text-gray-500">加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-if="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600">加载失败：{{ error }}</p>
      <button class="h-8 px-3 mt-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="warehouseMaterialStore.loadMaterials()">
        <RefreshCw :size="14" class="inline mr-1" />重试
      </button>
    </div>

    <!-- 主内容区（加载中或出错时隐藏） -->
    <template v-if="!loading && !error">
      <!-- 物料筛选器 -->
      <MaterialFilters
        :filters="filters"
        :low-stock-count="lowStockCount"
        @filters-change="handleFiltersChange"
        @low-stock-click="handleLowStockToggle"
      />

      <!-- 操作工具栏 -->
      <ActionToolbar
      title="库存总览"
      :batch-edit-mode="batchEditMode"
      :delete-mode="deleteMode"
      :export-mode="exportMode"
      :selected-rows="selectedRows"
      :low-stock-count="lowStockCount"
      :filters="filters"
      :can-create="true"
      @add="handleAdd"
      @low-stock-toggle="handleLowStockToggle"
      @batch-edit="handleBatchEditClick"
      @delete="handleDeleteWarning"
      @export="handleExport"
      @confirm-batch-edit="handleConfirmBatchEdit"
      @cancel-batch-edit="handleCancelBatchEdit"
      @confirm-delete="handleConfirmBatchDeleteAction"
      @cancel-delete="handleCancelDeleteAction"
      @confirm-export="handleConfirmExportClick"
      @cancel-export="handleCancelExportAction"
    />

    <!-- 物料表格 -->
    <MaterialsTable
      :materials="filteredMaterials"
      :current-page="currentPage"
      :page-size="pageSize"
      :selected-rows="selectedRows"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :delete-mode="deleteMode"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @select-all="handleSelectAll"
      @select-row="handleSelectRow"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @cancel-selection="handleCancelSelection"
      @confirm-export="handleConfirmExportClick"
    />
    </template>

    <!-- 物料详情弹窗 -->
    <MaterialDetailModal
      :material="selectedMaterial"
      :is-open="showDetailModal"
      @close="showDetailModal = false"
    />

    <!-- 物料编辑弹窗 -->
    <MaterialEditModal
      :material="selectedMaterial"
      :is-open="showEditModal"
      @close="handleEditModalClose"
      @save="handleSaveEdit"
    />

    <!-- 物料删除确认弹窗 -->
    <MaterialDeleteConfirmModal
      :material="selectedMaterial"
      :is-open="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDeleteAction"
    />

    <!-- 删除警告弹窗 -->
    <DeleteWarningDialog
      :is-open="showDeleteWarning"
      @close="showDeleteWarning = false"
      @confirm="handleDeleteWarningConfirm"
    />

    <!-- 批量删除确认弹窗 -->
    <BatchDeleteConfirmDialog
      :is-open="showBatchDeleteConfirm"
      :selected-materials="selectedMaterialsForDelete"
      @close="handleBatchDeleteConfirmClose"
      @confirm="handleBatchDeleteConfirm"
    />

    <!-- 批量编辑弹窗 -->
    <MaterialBatchEditModal
      :is-open="showBatchEditModal"
      :selected-rows="selectedRows"
      :filtered-materials="filteredMaterials"
      :batch-edited-materials="batchEditedMaterials"
      :current-batch-edit-index="currentBatchEditIndex"
      @close="handleBatchEditModalClose"
      @material-select="handleBatchMaterialSelect"
      @field-change="handleBatchFieldChange"
      @save-all="handleBatchSaveAll"
      @next="handleBatchNext"
    />

    <!-- 批量编辑警告弹窗 -->
    <BatchEditWarningModal
      :is-open="showBatchEditWarning"
      :selected-count="selectedRows.length"
      @close="showBatchEditWarning = false"
      @confirm="handleBatchEditWarningConfirm"
    />

    <!-- 导出格式选择弹窗 -->
    <MaterialExportModal
      :is-open="showExportModal"
      :selected-count="selectedRows.length"
      :export-format="exportFormat"
      @close="showExportModal = false"
      @format-change="setExportFormat"
      @export="handleDoExport"
    />

    <!-- 新建物料弹窗 - V1.1 MaterialCreateModal 对齐 -->
    <MaterialCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @success="handleCreateSuccess"
    />

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Package, Loader2, RefreshCw } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'

// 导入V2.0已有的组件
import ActionToolbar from './components/ActionToolbar.vue'
import MaterialFilters from './components/MaterialFilters.vue'
import MaterialsTable from './components/MaterialsTable.vue'
import MaterialDetailModal from './components/MaterialDetailModal.vue'
import MaterialEditModal from './components/MaterialEditModal.vue'
import MaterialDeleteConfirmModal from './components/MaterialDeleteConfirmModal.vue'
import MaterialBatchEditModal from './components/MaterialBatchEditModal.vue'
import BatchEditWarningModal from './components/BatchEditWarningModal.vue'
import DeleteWarningDialog from './components/DeleteWarningDialog.vue'
import BatchDeleteConfirmDialog from './components/BatchDeleteConfirmDialog.vue'
import MaterialExportModal from './components/MaterialExportModal.vue'
import MaterialCreateModal from './components/MaterialCreateModal.vue'

// 使用Store
const warehouseMaterialStore = useWarehouseMaterialStore()
const { loading, error } = storeToRefs(warehouseMaterialStore)

// 初始化加载
onMounted(async () => {
  try {
    await warehouseMaterialStore.loadMaterials()
  } catch {
    // 错误已在Store中处理
  }
})

// 筛选状态 - 与V1.1保持一致
const filters = reactive({
  code: '',
  name: '',
  category: '全部',
  supplier: '',
  location: '',
  searchBigCategory: '',
  searchMidCategory: '',
  searchSubCategory: '',
  showLowStock: false
})

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 选择/模式状态
const selectedRows = ref([])
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)

// UI 状态
const showExportModal = ref(false)
const exportFormat = ref('excel')
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteWarning = ref(false)
const showBatchEditModal = ref(false)
const showBatchEditWarning = ref(false)
const showBatchDeleteConfirm = ref(false)
const batchEditedMaterials = ref({})
const currentBatchEditIndex = ref(0)
const selectedMaterial = ref(null)

// 新建物料弹窗状态 - V1.1 setShowCreateModal 对齐
const showCreateModal = ref(false)
const createPrefillName = ref('')
const createExpandCodeGen = ref(false)

// URL deep link: ?new=1&prefillName=xxx
onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('new') === '1') {
      createPrefillName.value = params.get('prefillName') || ''
      createExpandCodeGen.value = true
      showCreateModal.value = true
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  } catch {}
})

// 新增按钮回调 - V1.1 handleAdd 对齐
const handleAdd = () => {
  createPrefillName.value = ''
  createExpandCodeGen.value = false
  showCreateModal.value = true
}

// 新建成功回调
const handleCreateSuccess = async (_material) => {
  // store 内部已 loadMaterials，无需重复
}

// 筛选数据 - 过滤函数
const filterMaterials = (materials, filters) => {
  if (!Array.isArray(materials)) return []
  return materials.filter((m) => {
    if (filters.code && !m.code.includes(filters.code)) return false
    if (filters.name && !m.name.includes(filters.name)) return false
    if (filters.category && filters.category !== '全部' && m.category !== filters.category) return false
    if (filters.supplier && m.supplier !== filters.supplier) return false
    if (filters.location && m.location !== filters.location) return false
    if (filters.searchBigCategory && !m.code.startsWith(filters.searchBigCategory)) return false
    if (filters.searchMidCategory && !m.code.slice(2, 4).startsWith(filters.searchMidCategory)) return false
    if (filters.searchSubCategory && !m.code.slice(4, 6).startsWith(filters.searchSubCategory)) return false
    if (filters.showLowStock && m.quantity >= m.minStock) return false
    return true
  })
}

// 筛选后的物料
const filteredMaterials = computed(() => {
  return filterMaterials(warehouseMaterialStore.materials, filters)
})

// 低库存数量
const lowStockCount = computed(() => {
  const list = warehouseMaterialStore.materials || []
  return list.filter(m => m.quantity < m.minStock).length
})

// 用于批量删除的物料列表
const selectedMaterialsForDelete = computed(() => {
  return filteredMaterials.value.filter(m => selectedRows.value.includes(m.id))
})

// 选择操作
const handleSelectAll = () => {
  if (selectedRows.value.length === filteredMaterials.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredMaterials.value.map(m => m.id)
  }
}

const handleSelectRow = (idOrIds) => {
  // MaterialsTable emit的是完整ID数组
  if (Array.isArray(idOrIds)) {
    selectedRows.value = idOrIds
    return
  }
  // 兼容单ID操作
  const idx = selectedRows.value.indexOf(idOrIds)
  if (idx >= 0) {
    selectedRows.value = selectedRows.value.filter(r => r !== idOrIds)
  } else {
    selectedRows.value = [...selectedRows.value, idOrIds]
  }
}

const handleCancelSelection = () => {
  exportMode.value = false
  batchEditMode.value = false
  deleteMode.value = false
  selectedRows.value = []
}

// 筛选变化
const handleFiltersChange = (newFilters) => {
  Object.assign(filters, newFilters)
  currentPage.value = 1
}

const handleLowStockToggle = () => {
  filters.showLowStock = !filters.showLowStock
  currentPage.value = 1
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 删除操作
const handleDeleteWarning = () => {
  showDeleteWarning.value = true
}

const handleDeleteWarningConfirm = () => {
  showDeleteWarning.value = false
  deleteMode.value = true
}

const handleBatchDeleteConfirmClose = () => {
  showBatchDeleteConfirm.value = false
  deleteMode.value = false
  selectedRows.value = []
}

const handleBatchDeleteConfirm = () => {
  handleBatchDelete(selectedRows.value)
  showBatchDeleteConfirm.value = false
  deleteMode.value = false
  selectedRows.value = []
}

const handleBatchDelete = async (ids) => {
  try {
    await warehouseMaterialStore.removeMaterialsBatch(ids)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 导出处理
const handleExport = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleConfirmExportClick = () => {
  showExportModal.value = true
}

const handleCancelExportAction = () => {
  exportMode.value = false
  selectedRows.value = []
}

const setExportFormat = (format) => {
  exportFormat.value = format
}

const handleDoExport = () => {
  const selectedData = filteredMaterials.value.filter(m => selectedRows.value.includes(m.id))
  // V1.1导出17列完整数据
  const headers = ['物料编号', '物料名称', '分类', '规格型号', '条形码', '单位', '库存数量', '最低库存', '最高库存', '单价', '供应商', '存放位置', '批次号', '生产日期', '有效期至', '最后更新时间', '数据状态']
  const rows = selectedData.map(m => [
    m.code, m.name, m.category, m.specification, m.barcode, m.unit,
    m.quantity, m.minStock, m.maxStock, m.price, m.supplier, m.location,
    m.batchNo, m.productionDate, m.expiryDate, m.lastUpdateTime, m.dataStatus
  ])

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(','))
    ].join('\n')
    const BOM = '﻿'
    content = BOM + csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xlsx'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>物料库存</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'docx'
  }

  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `物料汇总表_${new Date().toISOString().slice(0, 10)}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showExportModal.value = false
    exportMode.value = false
    selectedRows.value = []
    ElMessage.success('导出成功')
  } catch (err) {
    ElMessage.error('导出失败')
    console.error('导出失败:', err)
  }
}

// 查看/编辑/删除操作
const handleView = (material) => {
  selectedMaterial.value = material
  showDetailModal.value = true
}

const handleEdit = (material) => {
  selectedMaterial.value = material
  showEditModal.value = true
}

const handleDelete = (material) => {
  selectedMaterial.value = material
  showDeleteModal.value = true
}

const handleEditModalClose = () => {
  showEditModal.value = false
  selectedMaterial.value = null
}

const handleConfirmDeleteAction = () => {
  if (selectedMaterial.value) {
    handleConfirmDelete(selectedMaterial.value.id)
  }
  showDeleteModal.value = false
  selectedMaterial.value = null
}

const handleConfirmDelete = async (id) => {
  try {
    await warehouseMaterialStore.removeMaterial(id)
    ElMessage.success('删除成功')
  } catch {
    ElMessage.error('删除失败')
  }
}

const handleSaveEdit = async (material) => {
  try {
    await warehouseMaterialStore.editMaterial(material.id, material)
    showEditModal.value = false
    selectedMaterial.value = null
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  }
}

// ActionToolbar callbacks - 与V1.1一致：批量编辑先弹警告再进入模式
const handleBatchEditClick = () => {
  showBatchEditWarning.value = true
}

const handleBatchEditWarningConfirm = () => {
  showBatchEditWarning.value = false
  batchEditMode.value = true
}

const handleConfirmBatchEdit = () => {
  if (selectedRows.value.length === 1) {
    const material = filteredMaterials.value.find(m => m.id === selectedRows.value[0])
    if (material) {
      selectedMaterial.value = material
      showEditModal.value = true
      batchEditMode.value = false
      selectedRows.value = []
    }
  } else {
    showBatchEditModal.value = true
  }
}

const handleCancelBatchEdit = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

const handleConfirmBatchDeleteAction = () => {
  showBatchDeleteConfirm.value = true
}

const handleCancelDeleteAction = () => {
  deleteMode.value = false
  selectedRows.value = []
}

// 批量编辑弹窗回调
const handleBatchEditModalClose = () => {
  showBatchEditModal.value = false
  batchEditedMaterials.value = {}
  currentBatchEditIndex.value = 0
}

const handleBatchMaterialSelect = (idx) => {
  currentBatchEditIndex.value = idx
}

const handleBatchFieldChange = (materialId, field, value) => {
  const currentMaterial = filteredMaterials.value.find(m => m.id === materialId)
  const currentData = batchEditedMaterials.value[materialId] || currentMaterial || {}
  batchEditedMaterials.value = {
    ...batchEditedMaterials.value,
    [materialId]: { ...currentData, [field]: value }
  }
}

const handleBatchSaveAll = async () => {
  try {
    const edits = Object.entries(batchEditedMaterials.value)
    if (edits.length > 0) {
      for (const [materialId, data] of edits) {
        await warehouseMaterialStore.editMaterial(materialId, data)
      }
    }
    showBatchEditModal.value = false
    batchEditMode.value = false
    selectedRows.value = []
    batchEditedMaterials.value = {}
    currentBatchEditIndex.value = 0
    ElMessage.success('批量编辑保存成功')
  } catch {
    ElMessage.error('批量编辑保存失败')
  }
}

const handleBatchNext = () => {
  const nextIndex = currentBatchEditIndex.value + 1
  if (nextIndex < selectedRows.value.length) {
    currentBatchEditIndex.value = nextIndex
  } else {
    currentBatchEditIndex.value = 0
  }
}

</script>
