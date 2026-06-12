<template>
  <div class="space-y-4">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <ClipboardList :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">生产领料</h1>
          <p class="text-gray-500">领料记录管理</p>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <ApplicationFilters
      v-model:searchCode="searchCode"
      v-model:searchApplicant="searchApplicant"
      v-model:searchBatchCode="searchBatchCode"
      v-model:searchWarehouse="searchWarehouse"
      v-model:statusFilter="statusFilter"
      @reset="handleReset"
      @page-change="setCurrentPage"
    />

    <!-- 数据表格 -->
    <ApplicationTable
      :filteredData="filteredData"
      :current-page="currentPage"
      :page-size="pageSize"
      :export-mode="exportMode"
      :selected-rows="selectedRows"
      :batch-edit-mode="batchEditMode"
      :expanded-rows="expandedRows"
      @update:currentPage="setCurrentPage"
      @update:pageSize="setPageSize"
      @page-change="setCurrentPage"
      @page-size-change="handlePageSizeChange"
      @export-mode-change="setExportMode"
      @export-click="handleExportClick"
      @cancel-export="handleCancelExport"
      @batch-edit="handleBatchEdit"
      @batch-delete="handleBatchDelete"
      @batch-delete-confirm="handleOpenBatchDeleteConfirm"
      @batch-cancel="handleBatchCancel"
      @select-all="handleSelectAll"
      @view="handleView"
      @edit="handleEdit"
      @add-modal-open="handleAddModalOpen"
      @expand-change="handleExpandChange"
    />

    <!-- 查看详情弹窗 -->
    <DetailModal
      :show="showDetailModal"
      :record="selectedRecord"
      @close="showDetailModal = false"
    />

    <!-- 编辑弹窗 -->
    <EditModal
      :show="showEditModal"
      :record="selectedRecord"
      :edit-form="editForm"
      @close="handleCancelEdit"
      @form-change="setEditForm"
      @add-material="handleEditAddMaterial"
      @remove-material="handleEditRemoveMaterial"
      @material-change="handleEditMaterialChange"
      @save="handleSaveEdit"
      @void-apply="handleVoidApply"
    />

    <!-- 新增弹窗 -->
    <AddModal
      :show="showAddModal"
      :add-form="addForm"
      @close="handleCancelAdd"
      @form-change="setAddForm"
      @add-material="handleAddMaterial"
      @remove-material="handleRemoveMaterial"
      @material-change="handleMaterialChange"
      @generate-code="handleGenerateAddCode"
      @save="handleSaveAdd"
    />

    <!-- 删除确认弹窗 -->
    <DeleteConfirm
      :show="showDeleteConfirm"
      @close="showDeleteConfirm = false"
      @confirm="handleConfirmDelete"
    />

    <!-- 作废弹窗 -->
    <VoidModal
      :show="showVoidModal"
      :record="selectedRecord"
      :reason="voidReason"
      @close="showVoidModal = false"
      @confirm="handleSubmitVoid"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      :show="showBatchEditModal"
      :selected-rows="selectedRows"
      :records-list="materialData"
      @close="showBatchEditModal = false"
      @save-all="handleBatchSaveAll"
    />

    <!-- 批量删除确认弹窗 -->
    <BatchDeleteConfirmModal
      :show="showBatchDeleteConfirm"
      :count="selectedRows.length"
      @close="showBatchDeleteConfirm = false"
      @confirm="handleBatchDeleteConfirm"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportTypeModal
      :show="showExportTypeModal"
      :export-file-type="exportFileType"
      @close="showExportTypeModal = false"
      @change="setExportFileType"
      @confirm="handleConfirmExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ClipboardList } from 'lucide-vue-next'
import { useMaterialRequestStore } from '@/stores/modules/inventory/useMaterialRequestStore'
import { getMaterialRequests, createMaterialRequest, updateMaterialRequest, deleteMaterialRequest } from '@/services/apiMaterialRequestService'
import ApplicationFilters from '@/components/materialReceiving/ApplicationFilters.vue'
import ApplicationTable from '@/components/materialReceiving/ApplicationTable.vue'
import {
  DetailModal,
  AddModal,
  EditModal,
  BatchEditModal,
  VoidModal,
  DeleteConfirm,
  ExportTypeModal,
  BatchDeleteConfirmModal
} from '@/components/materialReceiving/modals'

// Store
const materialRequestStore = useMaterialRequestStore()

// 搜索状态
const searchCode = ref('')
const searchApplicant = ref('')
const searchBatchCode = ref('')
const searchWarehouse = ref('')
const statusFilter = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

const setCurrentPage = (page) => {
  currentPage.value = page
}

const setPageSize = (size) => {
  pageSize.value = size
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 模式状态
const exportMode = ref(false)
const batchEditMode = ref(null) // 'edit' | 'delete' | null
const selectedRows = ref([])
const expandedRows = ref([])

// 弹窗状态
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showAddModal = ref(false)
const showDeleteConfirm = ref(false)
const showVoidModal = ref(false)
const showBatchEditModal = ref(false)
const showBatchDeleteConfirm = ref(false)
const showExportTypeModal = ref(false)
const showEditAlert = ref(false)

// 当前选中记录
const selectedRecord = ref(null)

// 表单数据
const editForm = reactive({
  code: '',
  date: '',
  applicant: '',
  department: '',
  warehouseLocation: '',
  plantArea: '',
  reviewer: '',
  productionBatchCode: '',
  materials: []
})

const addForm = reactive({
  code: '',
  date: new Date().toISOString().slice(0, 10),
  applicant: '',
  department: '',
  warehouseLocation: '',
  plantArea: '',
  reviewer: '',
  productionBatchCode: '',
  materials: []
})

// 作废原因
const voidReason = ref('')

// 导出相关
const exportFileType = ref('excel')

// 物料申请数据（从 API 加载）
const materialData = ref([])

// 字段映射：后端 snake_case → 前端 camelCase
const FIELD_MAP_APPLICATION = {
  id: 'id',
  request_code: 'code',
  apply_date: 'date',
  applicant_name: 'applicant',
  department_name: 'department',
  warehouse_name: 'warehouseLocation',
  plant_area: 'plantArea',
  reviewer: 'reviewer',
  production_batch_code: 'productionBatchCode',
  approval_status: 'approvalStatus',
  remarks: 'remarks',
  reject_reason: 'rejectReason',
  materials: 'materials'
}

function normalizeApplicationRecord(item) {
  const result = { ...item }
  for (const [snake, camel] of Object.entries(FIELD_MAP_APPLICATION)) {
    if (snake in result && result[snake] !== undefined && result[snake] !== null) {
      result[camel] = result[snake]
    }
  }
  // 解析 materials JSON
  if (typeof result.materials === 'string') {
    try { result.materials = JSON.parse(result.materials) } catch { result.materials = [] }
  }
  if (!Array.isArray(result.materials)) result.materials = []
  // 状态文本/样式
  result.status = getStatusText(result.approvalStatus)
  result.statusClass = getStatusClass(result.approvalStatus)
  return result
}

// 加载物料申请数据
const loadMaterialData = async () => {
  try {
    const result = await getMaterialRequests()
    // 后端返回 { data: [...], meta: {...} }，统一通过 normalize 转换
    const list = Array.isArray(result) ? result : (result.data || [])
    materialData.value = list.map(normalizeApplicationRecord)
  } catch (error) {
    console.error('加载物料申请数据失败:', error)
    ElMessage.error('加载数据失败，请刷新重试')
  }
}

// 根据审批状态获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待审批',
    'approved': '已审批',
    'rejected': '已拒绝',
    'voided': '已作废'
  }
  return statusMap[status] || status || '待审批'
}

// 根据审批状态获取样式类名
const getStatusClass = (status) => {
  const classMap = {
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
    'voided': 'voided'
  }
  return classMap[status] || 'pending'
}

// 过滤后的数据
const filteredData = computed(() => {
  return materialData.value.filter(item => {
    if (searchCode.value && !item.code.includes(searchCode.value)) return false
    if (searchApplicant.value && !item.applicant.includes(searchApplicant.value)) return false
    if (searchBatchCode.value && !item.productionBatchCode.includes(searchBatchCode.value)) return false
    if (searchWarehouse.value && item.warehouseLocation !== searchWarehouse.value) return false
    if (statusFilter.value && item.status !== statusFilter.value) return false
    return true
  })
})

// 重置搜索
const handleReset = () => {
  searchCode.value = ''
  searchApplicant.value = ''
  searchBatchCode.value = ''
  searchWarehouse.value = ''
  statusFilter.value = ''
}

// 导出相关
const setExportMode = (val) => {
  exportMode.value = val
  if (!val) {
    selectedRows.value = []
  }
}

const handleExportClick = () => {
  showExportTypeModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const setExportFileType = (type) => {
  exportFileType.value = type
}

const handleConfirmExport = () => {
  const exportData = selectedRows.value.length > 0
    ? filteredData.value.filter(item => selectedRows.value.includes(item.id))
    : filteredData.value
  const headers = ['申请单号', '日期', '申请人', '部门', '仓库', '种植区域', '审核人', '生产批次号', '状态']
  const rows = exportData.map(item => [
    item.code, item.date, item.applicant, item.department,
    item.warehouseLocation, item.plantArea, item.reviewer,
    item.productionBatchCode, item.status
  ])

  let content, mimeType, extension
  if (exportFileType.value === 'csv') {
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(','))].join('\n')
    content = '﻿' + csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFileType.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>领料申请</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `领料申请_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportTypeModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

// 批量编辑
const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  batchEditMode.value = 'edit'
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  batchEditMode.value = 'delete'
}

// 批量删除 - 打开确认弹窗
const handleOpenBatchDeleteConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  showBatchDeleteConfirm.value = true
}

// 批量删除 - 执行删除
const handleBatchDeleteConfirm = async () => {
  try {
    for (const id of selectedRows.value) {
      await deleteMaterialRequest(id)
    }
    ElMessage.success(`已删除 ${selectedRows.value.length} 项记录`)
    showBatchDeleteConfirm.value = false
    batchEditMode.value = null
    selectedRows.value = []
    await loadMaterialData()
  } catch (error) {
    ElMessage.error('批量删除失败: ' + (error.message || '未知错误'))
  }
}

const handleBatchCancel = () => {
  batchEditMode.value = null
  selectedRows.value = []
}

const handleSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

// 查看详情
const handleView = (row) => {
  selectedRecord.value = row
  showDetailModal.value = true
}

// 编辑
const handleEdit = (row) => {
  selectedRecord.value = row
  Object.assign(editForm, {
    code: row.code,
    date: row.date,
    applicant: row.applicant,
    department: row.department,
    warehouseLocation: row.warehouseLocation,
    plantArea: row.plantArea,
    reviewer: row.reviewer,
    productionBatchCode: row.productionBatchCode,
    materials: [...row.materials]
  })
  showEditModal.value = true
}

const handleCancelEdit = () => {
  showEditModal.value = false
}

const setEditForm = (field, value) => {
  editForm[field] = value
}

const handleEditAddMaterial = () => {
  editForm.materials.push({
    materialCode: '',
    materialName: '',
    spec: '',
    unit: '',
    requestedQuantity: 0,
    stockQuantity: 0,
    unitPrice: 0,
    warehousePosition: '',
    remark: ''
  })
}

const handleEditRemoveMaterial = (index) => {
  editForm.materials.splice(index, 1)
}

const handleEditMaterialChange = (index, field, value) => {
  editForm.materials[index][field] = value
}

const handleSaveEdit = async () => {
  if (!selectedRecord.value) return
  try {
    await updateMaterialRequest(selectedRecord.value.id, {
      request_code: editForm.code,
      apply_date: editForm.date,
      applicant_name: editForm.applicant,
      department_name: editForm.department,
      warehouse_name: editForm.warehouseLocation,
      plant_area: editForm.plantArea,
      reviewer: editForm.reviewer,
      production_batch_code: editForm.productionBatchCode,
      materials: editForm.materials
    })
    ElMessage.success('保存成功')
    showEditModal.value = false
    await loadMaterialData()
  } catch (error) {
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
  }
}

const handleVoidApply = () => {
  showVoidModal.value = true
}

const handleSubmitVoid = async () => {
  if (!selectedRecord.value) return
  try {
    await updateMaterialRequest(selectedRecord.value.id, {
      approval_status: 'voided',
      remarks: voidReason.value
    })
    ElMessage.success('作废申请已提交')
    showVoidModal.value = false
    voidReason.value = ''
    await loadMaterialData()
  } catch (error) {
    ElMessage.error('作废失败: ' + (error.message || '未知错误'))
  }
}

// 新增
const handleAddModalOpen = () => {
  resetAddForm()
  handleGenerateAddCode()
  showAddModal.value = true
}

const handleCancelAdd = () => {
  showAddModal.value = false
}

const resetAddForm = () => {
  addForm.code = ''
  addForm.date = new Date().toISOString().slice(0, 10)
  addForm.applicant = ''
  addForm.department = ''
  addForm.warehouseLocation = ''
  addForm.plantArea = ''
  addForm.reviewer = ''
  addForm.productionBatchCode = ''
  addForm.materials = []
}

const setAddForm = (field, value) => {
  addForm[field] = value
}

const handleGenerateAddCode = () => {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  addForm.code = `LL${dateStr}-001`
}

const handleAddMaterial = () => {
  addForm.materials.push({
    materialCode: '',
    materialName: '',
    spec: '',
    unit: '',
    requestedQuantity: 0,
    stockQuantity: 0,
    unitPrice: 0,
    warehousePosition: '',
    remark: ''
  })
}

const handleRemoveMaterial = (index) => {
  addForm.materials.splice(index, 1)
}

const handleMaterialChange = (index, field, value) => {
  addForm.materials[index][field] = value
}

const handleSaveAdd = async () => {
  if (!addForm.code || !addForm.applicant) {
    ElMessage.warning('请填写必要的申请信息')
    return
  }
  try {
    await createMaterialRequest({
      request_code: addForm.code,
      apply_date: addForm.date,
      applicant_name: addForm.applicant,
      department_name: addForm.department,
      warehouse_name: addForm.warehouseLocation,
      plant_area: addForm.plantArea,
      reviewer: addForm.reviewer,
      production_batch_code: addForm.productionBatchCode,
      materials: addForm.materials,
      approval_status: 'pending'
    })
    ElMessage.success('新增成功')
    showAddModal.value = false
    await loadMaterialData()
  } catch (error) {
    ElMessage.error('新增失败: ' + (error.message || '未知错误'))
  }
}

// 删除
const handleConfirmDelete = () => {
  ElMessage.success('删除成功')
  showDeleteConfirm.value = false
}

// 批量保存（从BatchEditModal传入编辑后的数据）
const handleBatchSaveAll = async (editedData) => {
  try {
    const updates = editedData || {}
    for (const [id, data] of Object.entries(updates)) {
      await updateMaterialRequest(id, data)
    }
    ElMessage.success('批量编辑保存成功')
    showBatchEditModal.value = false
    batchEditMode.value = null
    selectedRows.value = []
    await loadMaterialData()
  } catch (error) {
    ElMessage.error('批量保存失败: ' + (error.message || '未知错误'))
  }
}

// 展开行
const handleExpandChange = (row, expanded) => {
  const index = expandedRows.value.indexOf(row.id)
  if (expanded && index === -1) {
    expandedRows.value.push(row.id)
  } else if (!expanded && index > -1) {
    expandedRows.value.splice(index, 1)
  }
}

// 加载数据
onMounted(() => {
  loadMaterialData()
})
</script>
