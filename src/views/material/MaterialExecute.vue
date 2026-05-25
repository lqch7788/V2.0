<template>
  <div class="space-y-4">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <Upload />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">领料出库</h1>
          <p class="text-gray-500">领料出库记录管理</p>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <ExecuteTabFilters
      v-model:executeSearchCode="searchCode"
      v-model:executeSearchApplicant="searchApplicant"
      v-model:executeSearchBatchCode="searchBatchCode"
      v-model:executeSearchWarehouse="searchWarehouse"
      v-model:executeStatusFilter="statusFilter"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <ExecuteTabTable
      :data="filteredData"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="filteredData.length"
      :expanded-rows="expandedRows"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :selected-rows="selectedRows"
      @update:currentPage="setCurrentPage"
      @update:pageSize="setPageSize"
      @page-change="setCurrentPage"
      @page-size-change="handlePageSizeChange"
      @export-click="handleExportClick"
      @export-confirm="handleExportConfirm"
      @cancel-export="handleCancelExport"
      @batch-edit-click="handleBatchEditClick"
      @batch-delete-click="handleBatchDeleteClick"
      @batch-edit-confirm="handleBatchEditConfirm"
      @batch-delete-confirm="handleBatchDeleteConfirm"
      @batch-cancel="handleBatchCancel"
      @select-all="handleSelectAll"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @add="handleAdd"
      @expand-change="handleExpandChange"
    />

    <!-- 查看详情弹窗 -->
    <ExecuteDetailModal
      :show="showDetailModal"
      :record="selectedRecord"
      @close="showDetailModal = false"
    />

    <!-- 新增出库弹窗 -->
    <ExecuteAddModal
      :show="showAddModal"
      :add-form="addForm"
      :material-pool="materialPool"
      :selected-application-code="selectedApplicationCode"
      :selected-material-indices="selectedMaterialIndices"
      :material-actual-quantities="materialActualQuantities"
      :material-receiving-details="materialReceivingDetails"
      @close="handleCancelAdd"
      @add-form-change="setAddForm"
      @selected-application-code-change="setSelectedApplicationCode"
      @selected-material-indices-change="setSelectedMaterialIndices"
      @material-actual-quantities-change="setMaterialActualQuantities"
      @add-to-material-pool="handleAddToMaterialPool"
      @remove-from-material-pool="handleRemoveFromMaterialPool"
      @update-material-pool-quantity="handleUpdateMaterialPoolQuantity"
      @save="handleSaveAdd"
    />

    <!-- 编辑出库弹窗 -->
    <ExecuteEditModal
      v-if="showEditModal"
      :show="showEditModal"
      :record="selectedRecord"
      :edit-form="editForm"
      @close="handleCancelEdit"
      @form-change="setEditForm"
      @add-material="handleEditAddMaterial"
      @remove-material="handleEditRemoveMaterial"
      @material-change="handleEditMaterialChange"
      @save="handleSaveEdit"
    />

    <!-- 删除确认弹窗 -->
    <ExecuteDeleteWarningModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
    />

    <!-- 批量删除确认弹窗 -->
    <ExecuteDeleteWarningModal
      :show="showBatchDeleteModal"
      @close="showBatchDeleteModal = false"
      @confirm="handleConfirmBatchDelete"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportTypeModal
      :show="showExportModal"
      :export-file-type="exportFileType"
      @close="showExportModal = false"
      @change="setExportFileType"
      @confirm="handleConfirmExport"
    />

    <!-- 批量编辑弹窗 -->
    <ExecuteBatchEditModal
      :show="showBatchEditModal"
      :selected-rows="selectedRows"
      :records-list="executeData"
      @close="showBatchEditModal = false"
      @save-all="handleBatchSaveAll"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useExecuteStore } from '@/stores/modules/inventory/useExecuteStore'
import { getMaterialExecutes } from '@/api/material/apiMaterialExecuteService'
import ExecuteTabFilters from '@/components/materialReceiving/ExecuteTabFilters.vue'
import ExecuteTabTable from '@/components/materialReceiving/ExecuteTabTable.vue'
import {
  ExecuteDetailModal,
  ExecuteAddModal,
  ExecuteDeleteWarningModal,
  ExecuteBatchEditModal,
  ExportTypeModal
} from '@/components/materialReceiving/modals'

// Store
const executeStore = useExecuteStore()

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
const batchEditMode = ref(null)
const selectedRows = ref([])
const expandedRows = ref([])

// 弹窗状态
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showBatchDeleteModal = ref(false)
const showExportModal = ref(false)
const showBatchEditModal = ref(false)

// 当前选中记录
const selectedRecord = ref(null)
const selectedIdForDelete = ref(null)

// 导出相关
const exportFileType = ref('excel')

// 表单数据
const addForm = reactive({
  code: '',
  date: new Date().toISOString().slice(0, 10),
  warehouseLocation: '',
  reviewer: '',
  operator: '',
  productionBatchCode: ''
})

const editForm = reactive({
  code: '',
  date: '',
  applicant: '',
  warehouseLocation: '',
  reviewer: '',
  operator: '',
  productionBatchCode: '',
  executeStatus: '',
  materials: []
})

// 物料池
const selectedApplicationCode = ref('')
const selectedMaterialIndices = ref(new Set())
const materialActualQuantities = ref({})
const materialPool = ref([])
const materialReceivingDetails = ref([])

// 出库数据（从 API 加载）
const executeData = ref([])

// 加载出库数据
const loadExecuteData = async () => {
  try {
    // request 拦截器已经提取了 response.data，所以直接是数组
    const items = await getMaterialExecutes()
    // 转换后端数据格式为前端所需格式
    executeData.value = (Array.isArray(items) ? items : []).map(item => ({
      id: item.id,
      code: item.code,
      date: item.date,
      applicant: item.applicant,
      warehouseLocation: item.warehouse_location,
      reviewer: item.reviewer,
      operator: item.operator,
      productionBatchCode: item.production_batch_code,
      executeStatus: item.execute_status,
      executeStatusClass: item.execute_status_class,
      sourceApplicationCodes: item.source_application_codes || [],
      materials: item.materials || []
    }))
  } catch (error) {
    console.error('加载出库数据失败:', error)
    ElMessage.error('加载数据失败，请刷新重试')
  }
}

// 过滤后的数据
const filteredData = computed(() => {
  return executeData.value.filter(item => {
    if (searchCode.value && !item.code.includes(searchCode.value)) return false
    if (searchApplicant.value && !item.applicant.includes(searchApplicant.value)) return false
    if (searchBatchCode.value && !item.productionBatchCode.includes(searchBatchCode.value)) return false
    if (searchWarehouse.value && item.warehouseLocation !== searchWarehouse.value) return false
    if (statusFilter.value && item.executeStatus !== statusFilter.value) return false
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

// 导出
const handleExportClick = () => {
  showExportModal.value = true
}

const handleExportConfirm = () => {
  showExportModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const setExportFileType = (type) => {
  exportFileType.value = type
}

const handleConfirmExport = () => {
  ElMessage.success(`已选择导出格式：${exportFileType.value}`)
  showExportModal.value = false
  exportMode.value = false
}

// 批量编辑
const handleBatchEditClick = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  batchEditMode.value = 'edit'
}

const handleBatchDeleteClick = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  batchEditMode.value = 'delete'
}

const handleBatchEditConfirm = () => {
  showBatchEditModal.value = true
}

const handleBatchDeleteConfirm = () => {
  showBatchDeleteModal.value = true
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
    warehouseLocation: row.warehouseLocation,
    reviewer: row.reviewer,
    operator: row.operator,
    productionBatchCode: row.productionBatchCode,
    executeStatus: row.executeStatus,
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
    applicationCode: '',
    materialCode: '',
    materialName: '',
    spec: '',
    unit: '',
    requestedQuantity: 0,
    actualQuantity: 0,
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

const handleSaveEdit = () => {
  ElMessage.success('保存成功')
  showEditModal.value = false
}

// 删除
const handleDelete = (row) => {
  selectedIdForDelete.value = row.id
  showDeleteModal.value = true
}

const handleConfirmDelete = () => {
  ElMessage.success('删除成功')
  showDeleteModal.value = false
}

const handleConfirmBatchDelete = () => {
  ElMessage.success(`已删除 ${selectedRows.value.length} 项领料出库记录`)
  showBatchDeleteModal.value = false
  batchEditMode.value = null
  selectedRows.value = []
}

// 新增
const handleAdd = () => {
  resetAddForm()
  showAddModal.value = true
}

const resetAddForm = () => {
  addForm.code = ''
  addForm.date = new Date().toISOString().slice(0, 10)
  addForm.warehouseLocation = ''
  addForm.reviewer = ''
  addForm.operator = ''
  addForm.productionBatchCode = ''
  selectedApplicationCode.value = ''
  selectedMaterialIndices.value = new Set()
  materialActualQuantities.value = {}
  materialPool.value = []
}

const handleCancelAdd = () => {
  showAddModal.value = false
}

const setAddForm = (field, value) => {
  addForm[field] = value
}

const setSelectedApplicationCode = (code) => {
  selectedApplicationCode.value = code
  selectedMaterialIndices.value = new Set()
  materialActualQuantities.value = {}
}

const setSelectedMaterialIndices = (indices) => {
  selectedMaterialIndices.value = indices
}

const setMaterialActualQuantities = (quantities) => {
  materialActualQuantities.value = quantities
}

const handleAddToMaterialPool = () => {
  // 实际应从选中的领料单获取物料
  ElMessage.success('已添加到物料池')
}

const handleRemoveFromMaterialPool = (index) => {
  materialPool.value.splice(index, 1)
}

const handleUpdateMaterialPoolQuantity = (index, quantity) => {
  materialPool.value[index].actualQuantity = quantity
}

const handleSaveAdd = () => {
  ElMessage.success('新增成功')
  showAddModal.value = false
}

// 批量保存
const handleBatchSaveAll = () => {
  ElMessage.success('批量编辑保存成功')
  showBatchEditModal.value = false
  batchEditMode.value = null
  selectedRows.value = []
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
  loadExecuteData()
})
</script>
