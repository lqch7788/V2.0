<template>
  <!-- 库存总览页面 - 与V1.1 WarehouseOverviewPage.tsx功能100%一致 -->
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Goods />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">库存总览</h1>
            <p class="text-gray-500">仓库物料库存总览</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 物料筛选器 -->
    <MaterialFilters
      :filters="filters"
      :low-stock-count="lowStockCount"
      @filters-change="handleFiltersChange"
      @low-stock-click="handleLowStockToggle"
    />

    <!-- 操作工具栏 -->
    <ActionToolbar
      title="物料汇总表"
      :batch-edit-mode="batchEditMode"
      :delete-mode="deleteMode"
      :export-mode="exportMode"
      :selected-rows="selectedRows"
      :low-stock-count="lowStockCount"
      :filters="filters"
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

    <!-- 新增物料弹窗 -->
    <el-dialog v-model="showAddModal" title="新增物料" width="600px" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="物料编码" required>
          <el-input v-model="addForm.code" placeholder="系统自动生成" disabled />
        </el-form-item>
        <el-form-item label="物料名称" required>
          <el-input v-model="addForm.name" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="物料分类">
          <el-input v-model="addForm.category" placeholder="请输入物料分类" />
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="addForm.specification" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="addForm.unit" placeholder="如：袋、箱、个" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="addForm.quantity" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="最低库存">
          <el-input-number v-model="addForm.minStock" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="最高库存">
          <el-input-number v-model="addForm.maxStock" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input v-model="addForm.price" placeholder="请输入单价" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="addForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="addForm.location" placeholder="请输入存放位置" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAddForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Goods } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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

// 使用Store
const warehouseMaterialStore = useWarehouseMaterialStore()

// 初始化加载
onMounted(async () => {
  await warehouseMaterialStore.loadMaterials()
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

// 筛选数据 - 过滤函数
const filterMaterials = (materials, filters) => {
  if (!Array.isArray(materials)) return []
  return materials.filter((m) => {
    if (filters.code && !m.code.includes(filters.code)) return false
    if (filters.name && !m.name.includes(filters.name)) return false
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
  return warehouseMaterialStore.materials.filter(m => m.quantity < m.minStock).length
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

const handleSelectRow = (id) => {
  const idx = selectedRows.value.indexOf(id)
  if (idx >= 0) {
    selectedRows.value = selectedRows.value.filter(r => r !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
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
  const headers = ['物料编码', '物料名称', '分类', '规格', '单位', '库存数量', '最低库存', '最高库存', '单价', '供应商', '存放位置', '数据状态']
  const rows = selectedData.map(m => [
    m.code, m.name, m.category, m.specification, m.unit,
    m.quantity, m.minStock, m.maxStock, m.price, m.supplier, m.location, m.dataStatus
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
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>物料库存</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

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
  await warehouseMaterialStore.removeMaterial(id)
  await warehouseMaterialStore.loadMaterials()
}

const handleSaveEdit = async (material) => {
  await warehouseMaterialStore.editMaterial(material.id, material)
  await warehouseMaterialStore.loadMaterials()
  showEditModal.value = false
  selectedMaterial.value = null
}

// ActionToolbar callbacks
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

const handleBatchSaveAll = () => {
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  batchEditedMaterials.value = {}
  currentBatchEditIndex.value = 0
  warehouseMaterialStore.loadMaterials()
  ElMessage.success('批量编辑保存成功')
}

const handleBatchNext = () => {
  const nextIndex = currentBatchEditIndex.value + 1
  if (nextIndex < selectedRows.value.length) {
    currentBatchEditIndex.value = nextIndex
  } else {
    currentBatchEditIndex.value = 0
  }
}

// 新增物料
const showAddModal = ref(false)

const addForm = reactive({
  code: '',
  name: '',
  category: '',
  specification: '',
  unit: '袋',
  quantity: 0,
  minStock: 0,
  maxStock: 0,
  price: '',
  supplier: '',
  location: ''
})

const handleAdd = () => {
  // 重置表单
  addForm.code = ''
  addForm.name = ''
  addForm.category = ''
  addForm.specification = ''
  addForm.unit = '袋'
  addForm.quantity = 0
  addForm.minStock = 0
  addForm.maxStock = 0
  addForm.price = ''
  addForm.supplier = ''
  addForm.location = ''
  showAddModal.value = true
}

const handleSaveAddForm = async () => {
  if (!addForm.name) {
    ElMessage.warning('请输入物料名称')
    return
  }
  try {
    await warehouseMaterialStore.addMaterial({
      name: addForm.name,
      category: addForm.category,
      specification: addForm.specification,
      unit: addForm.unit,
      quantity: addForm.quantity,
      minStock: addForm.minStock,
      maxStock: addForm.maxStock,
      price: addForm.price,
      supplier: addForm.supplier,
      location: addForm.location
    })
    showAddModal.value = false
    ElMessage.success('新增物料成功')
  } catch (error) {
    ElMessage.error('新增物料失败')
  }
}
</script>
