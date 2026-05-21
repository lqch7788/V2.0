<template>
  <div class="space-y-6">
    <!-- 预警统计头部 -->
    <AlertStats :purchase-plans-data="purchasePlansData" />

    <!-- 筛选表单 -->
    <PurchasePlanFilters
      :related-batch-code="relatedBatchCode"
      :purchase-type="purchaseType"
      :status="status"
      :alert-filter="alertFilter"
      :applicant="applicant"
      :applicant-department="applicantDepartment"
      :priority="priority"
      :required-start-date="requiredStartDate"
      :required-end-date="requiredEndDate"
      @related-batch-code-change="relatedBatchCode = $event"
      @purchase-type-change="purchaseType = $event"
      @status-change="status = $event"
      @alert-filter-change="alertFilter = $event"
      @applicant-change="applicant = $event"
      @applicant-department-change="applicantDepartment = $event"
      @priority-change="priority = $event"
      @required-start-date-change="requiredStartDate = $event"
      @required-end-date-change="requiredEndDate = $event"
      @reset="handleReset"
      @search="handleSearch"
    />

    <!-- 数据表格 -->
    <PurchasePlanTable
      :data="filteredAndSortedData"
      :current-page="currentPage"
      :page-size="pageSize"
      :selected-rows="selectedRows"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :batch-delete-mode="batchDeleteMode"
      :sort-config="sortConfig"
      :expanded-rows="expandedRows"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-export="canExport"
      @toggle-expand="toggleExpandRow"
      @select-all="handleSelectAll"
      @select-row="handleSelectRow"
      @sort-change="handleSortChange"
      @page-change="currentPage = $event"
      @page-size-change="pageSize = $event; currentPage = 1"
      @view-detail="handleViewDetail"
      @edit="handleSingleEdit"
      @delete="handleSingleDelete"
      @create="handleOpenCreateModal"
      @batch-edit="handleEnterBatchEditMode"
      @batch-delete="handleEnterBatchDeleteMode"
      @export="handleExportClick"
      @export-confirm="handleConfirmExport"
      @export-cancel="handleCancelExport"
      @batch-edit-confirm="handleBatchEditConfirm"
      @batch-edit-cancel="handleBatchEditCancel"
      @batch-delete-confirm="handleDeleteConfirm"
      @batch-delete-cancel="handleBatchDeleteCancel"
    />

    <!-- 创建弹窗 -->
    <CreatePlanModal
      :visible="showCreateModal"
      :create-form="createForm"
      :create-items="createItems"
      :purchase-plans-data="purchasePlansData"
      @close="showCreateModal = false"
      @form-change="handleCreateFormChange"
      @items-change="createItems = $event"
      @submit="handleCreateSubmit"
    />

    <!-- 详情弹窗 -->
    <PlanDetailModal
      :visible="showDetailModal"
      :selected-plan-detail="selectedPlanDetail"
      @close="handleCloseDetailModal"
    />

    <!-- 删除确认弹窗 -->
    <DeleteWarningModal
      v-model:visible="showDeleteModal"
      :selected-count="selectedRows.length"
      @confirm="handleDeleteConfirm"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      v-model:visible="showBatchEditModal"
      :selected-rows="selectedRows"
      :current-editing-plan="currentEditingPlan"
      :batch-edit-data="batchEditData"
      :batch-edit-items="batchEditItems"
      :purchase-plans-data="purchasePlansData"
      @batch-edit-data-change="batchEditData = $event"
      @batch-edit-items-change="batchEditItems = $event"
      @submit="handleBatchEditSave"
    />

    <!-- 导出格式弹窗 -->
    <ExportFormatModal
      v-model:visible="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @change="exportFormat = $event"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import AlertStats from '@/components/purchasePlan/AlertStats.vue'
import PurchasePlanFilters from '@/components/purchasePlan/PurchasePlanFilters.vue'
import PurchasePlanTable from '@/components/purchasePlan/PurchasePlanTable.vue'
import CreatePlanModal from '@/components/purchasePlan/CreatePlanModal.vue'
import PlanDetailModal from '@/components/purchasePlan/PlanDetailModal.vue'
import BatchEditModal from '@/components/purchasePlan/BatchEditModal.vue'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { usePurchasePlanStore } from '@/stores/modules/purchasePlan'
import { useUserStore } from '@/stores/modules/user'
import { calculateOverdueAlert } from '@/types/purchase'
import {  PurchasePlan, PurchasePlanItem  } from '@/types/purchase'
import dayjs from 'dayjs'

// 权限控制
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)

// Store
const purchasePlanStore = usePurchasePlanStore()
const userStore = useUserStore()

// 合并 API 数据与审批状态更新
const purchasePlansData = computed(() => purchasePlanStore.getPlansWithStatus())

// 筛选状态
const relatedBatchCode = ref('')
const purchaseType = ref('全部')
const status = ref('全部')
const alertFilter = ref('全部')
const applicant = ref('')
const applicantDepartment = ref('')
const priority = ref('全部')
const requiredStartDate = ref('')
const requiredEndDate = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 模式状态
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)

// 选中状态
const selectedRows = ref([])
const exportFormat = ref('excel')

// 弹窗状态
const showDeleteModal = ref(false)
const showExportModal = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const showBatchEditModal = ref(false)

// 详情选中
const selectedPlanDetail = ref(null)

// 创建表单状态
const createForm = reactive({
  purchaseApplicationCode: '',
  relatedBatchCode: '',
  purchaseType: '生产物资采购',
  applicant: localStorage.getItem('username') || '陆启闯',
  applicantDepartment: '生产部',
  applyDate: dayjs().format('YYYY-MM-DD'),
  requiredDate: '',
  priority: '中',
  remarks: '',
  otherBatchReason: '',
  approvalPerson: '',
})

const createItems = ref([])

// 批量编辑相关状态
const currentEditingPlan = ref(null)
const batchEditData = reactive({
  purchaseType: '',
  priority: '',
  requiredDate: '',
  remarks: '',
})
const batchEditItems = ref([])

// 展开行状态
const expandedRows = ref(new Set())

// 排序状态
const sortConfig = ref(null)

// 加载采购计划数据
onMounted(async () => {
  await purchasePlanStore.fetchPlans()
})

// 过滤和排序后的数据
const filteredAndSortedData = computed(() => {
  return purchasePlansData.value
    .filter(plan => {
      if (relatedBatchCode.value && !plan.relatedBatchCode.toLowerCase().includes(relatedBatchCode.value.toLowerCase())) return false
      if (purchaseType.value !== '全部' && plan.purchaseTypeName !== purchaseType.value) return false
      if (status.value !== '全部' && plan.statusText !== status.value) return false
      if (applicant.value && !plan.applicant.toLowerCase().includes(applicant.value.toLowerCase())) return false
      if (applicantDepartment.value && !plan.applicantDepartment.toLowerCase().includes(applicantDepartment.value.toLowerCase())) return false
      if (priority.value !== '全部' && plan.priorityText !== priority.value) return false
      if (requiredStartDate.value && plan.requiredDate < requiredStartDate.value) return false
      if (requiredEndDate.value && plan.requiredDate > requiredEndDate.value) return false
      if (alertFilter.value !== '全部') {
        const alert = calculateOverdueAlert(plan)
        if (alertFilter.value === '已逾期' && alert.level !== 'overdue') return false
        if (alertFilter.value === '即将到期' && alert.level !== 'warning') return false
      }
      return true
    })
    .sort((a, b) => {
      if (!sortConfig.value) return 0
      const { field, direction } = sortConfig.value
      const aValue = a[field]
      const bValue = b[field]
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
})

// 展开/折叠行切换
const toggleExpandRow = (id) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
}

// 排序处理
const handleSortChange = (field) => {
  if (sortConfig.value?.field !== field) {
    sortConfig.value = { field, direction: 'asc' }
  } else if (sortConfig.value.direction === 'asc') {
    sortConfig.value = { field, direction: 'desc' }
  } else {
    sortConfig.value = null
  }
}

// 重置筛选
const handleReset = () => {
  relatedBatchCode.value = ''
  purchaseType.value = '全部'
  status.value = '全部'
  alertFilter.value = '全部'
  applicant.value = ''
  applicantDepartment.value = ''
  priority.value = '全部'
  requiredStartDate.value = ''
  requiredEndDate.value = ''
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

// 全选
const handleSelectAll = (selected) => {
  if (selected) {
    selectedRows.value = filteredAndSortedData.value.map(p => p.purchaseApplicationCode)
  } else {
    selectedRows.value = []
  }
}

// 选择行
const handleSelectRow = (id) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleDoExport = async () => {
  const selectedData = purchasePlansData.value.filter(p => selectedRows.value.includes(p.id))
  const headers = ['计划编号', '计划名称', '类型', '申请人', '申请日期', '总金额', '供应商', '交货日期', '优先级', '状态']
  const exportData = selectedData.map(row => ({
    '计划编号': row.purchaseApplicationCode,
    '计划名称': row.planTitle,
    '类型': row.purchaseTypeName,
    '申请人': row.applicant,
    '申请日期': row.applyDate,
    '总金额': row.totalAmount,
    '供应商': row.supplierName,
    '交货日期': row.requiredDate,
    '优先级': row.priorityText,
    '状态': row.statusText
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

  const fileName = `采购计划_${dayjs().format('YYYY-MM-DD')}.${extension}`

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

const handleEnterBatchEditMode = () => {
  batchEditMode.value = true
}

const handleEnterBatchDeleteMode = () => {
  batchDeleteMode.value = true
}

const handleDeleteClick = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  try {
    const deletablePlans = purchasePlansData.value
      .filter(p => selectedRows.value.includes(p.purchaseApplicationCode))
      .filter(p => p.status === 'draft' || p.status === 'pending' || p.approvalStatus === 'rejected')

    if (deletablePlans.length === 0) {
      ElMessage.warning('没有可删除的采购计划（只能删除草稿、待审批和审批被拒绝状态）')
      return
    }

    const selectedIds = deletablePlans.map(p => p.id)
    await purchasePlanStore.deletePlans(selectedIds)

    showDeleteModal.value = false
    batchDeleteMode.value = false
    selectedRows.value = []
    ElMessage.success(`已删除 ${selectedIds.length} 个采购计划`)
  } catch (error) {
    console.error('删除采购计划失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

const handleViewDetail = (plan) => {
  selectedPlanDetail.value = plan
  showDetailModal.value = true
}

const handleCloseDetailModal = () => {
  showDetailModal.value = false
  selectedPlanDetail.value = null
}

const handleSingleEdit = (plan) => {
  if (plan.status === 'completed' || plan.status === 'purchasing') {
    ElMessage.warning('该采购计划已归档，无法编辑')
    return
  }
  currentEditingPlan.value = plan
  batchEditData.purchaseType = plan.purchaseType
  batchEditData.priority = plan.priority
  batchEditData.requiredDate = plan.requiredDate || ''
  batchEditData.remarks = plan.remarks || ''
  batchEditItems.value = plan.items || []
  selectedRows.value = [plan.purchaseApplicationCode]
  showBatchEditModal.value = true
}

const handleSingleDelete = async (plan) => {
  if (plan.status !== 'draft' && plan.status !== 'pending' && plan.approvalStatus !== 'rejected') {
    ElMessage.warning('只有草稿、待审批和审批被拒绝的采购计划才能删除')
    return
  }
  try {
    await purchasePlanStore.deletePlan(plan.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除采购计划失败:', error)
    ElMessage.error('删除失败: ' + (error).message)
  }
}

const handleBatchEditConfirm = () => {
  const selectedPlansData = purchasePlansData.value.filter(p => selectedRows.value.includes(p.purchaseApplicationCode))
  if (selectedPlansData.length > 0) {
    currentEditingPlan.value = selectedPlansData[0]
    batchEditData.purchaseType = selectedPlansData[0].purchaseType
    batchEditData.priority = selectedPlansData[0].priority
    batchEditData.requiredDate = selectedPlansData[0].requiredDate || ''
    batchEditData.remarks = selectedPlansData[0].remarks || ''
    batchEditItems.value = selectedPlansData[0].items || []
  }
  showBatchEditModal.value = true
}

const handleBatchEditCancel = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

const handleBatchDeleteCancel = () => {
  batchDeleteMode.value = false
  selectedRows.value = []
}

const handleCloseBatchEditModal = () => {
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  currentEditingPlan.value = null
  batchEditItems.value = []
}

const handleBatchEditSave = async () => {
  if (!currentEditingPlan.value) {
    ElMessage.warning('请先选择一个采购计划')
    return
  }
  try {
    const applicantName = userStore.userInfo?.name || currentEditingPlan.value?.applicant || ''

    await purchasePlanStore.updatePlan(currentEditingPlan.value.id, {
      relatedBatchCode: currentEditingPlan.value.relatedBatchCode,
      purchaseType: batchEditData.purchaseType,
      priority: batchEditData.priority,
      requiredDate: batchEditData.requiredDate,
      remarks: batchEditData.remarks,
      applicantId: currentEditingPlan.value.applicantId,
      applicantName,
      applicantDepartment: currentEditingPlan.value.applicantDepartment,
      items: batchEditItems.value,
    })

    showBatchEditModal.value = false
    batchEditMode.value = false
    selectedRows.value = []
    batchEditItems.value = []
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(`保存失败: ${error instanceof Error ? error.message : '请重试'}`)
  }
}

const handleOpenCreateModal = () => {
  createForm.purchaseApplicationCode = `PA${dayjs().year()}${String(dayjs().month() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
  createForm.relatedBatchCode = ''
  createForm.purchaseType = '生产物资采购'
  createForm.applicant = localStorage.getItem('username') || '陆启闯'
  createForm.applicantDepartment = '生产部'
  createForm.applyDate = dayjs().format('YYYY-MM-DD')
  createForm.requiredDate = ''
  createForm.priority = '中'
  createForm.remarks = ''
  createForm.otherBatchReason = ''
  createForm.approvalPerson = ''
  createItems.value = []
  showCreateModal.value = true
}

const handleCreateFormChange = (field, value) => {
  (createForm)[field] = value
}

const handleCreateSubmit = async () => {
  try {
    const totalAmount = createItems.value.reduce((sum, item) => sum + (item.estimatedTotalPrice || 0), 0)

    const priorityMap = {
      '紧急': 'urgent',
      '高': 'high',
      '中': 'normal',
      '低': 'low',
    }

    const purchaseTypeReverseMap = {
      '生产物资采购': 'production',
      '紧急采购': 'urgent',
      '常规采购': 'routine',
      '劳保用品': 'safety',
      '通用物资': 'material',
      '设备采购': 'equipment',
      '其他': 'other',
    }

    const planData = {
      purchaseApplicationCode: createForm.purchaseApplicationCode,
      relatedBatchCode: createForm.relatedBatchCode,
      purchaseType: purchaseTypeReverseMap[createForm.purchaseType] || 'production',
      applicant: createForm.applicant,
      applicantId: localStorage.getItem('userId') || '',
      applicantDepartment: createForm.applicantDepartment,
      applyDate: createForm.applyDate,
      requiredDate: createForm.requiredDate,
      priority: priorityMap[createForm.priority] || 'normal',
      status: 'pending',
      approvalStatus: 'pending',
      remarks: createForm.remarks,
      approvalPerson: createForm.approvalPerson,
      items: createItems.value,
      totalAmount,
      attachments: [],
    }

    const result = await purchasePlanStore.addPlan(planData)

    if (result && result.id) {
      if (result.autoApprove) {
        ElMessage.success('采购计划已创建，金额在免审批阈值内，已自动通过')
      } else {
        ElMessage.success('采购计划已创建并提交审批')
      }
    }
  } catch (error) {
    console.error('创建采购计划失败:', error)
    ElMessage.error('创建采购计划失败，请重试')
  } finally {
    showCreateModal.value = false
  }
}
</script>
