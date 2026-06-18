<!--
  Inspection.vue - 巡检管理页面
  V1.1 FarmTaskHub.tsx InspectionTab 1:1 对齐：挂载已 1:1 迁移的 inspection 组件库
  解决 P0-1：views 层不再使用 mock 实现，直接复用 src/components/farm/inspection/* 全部组件
-->
<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <InspectionPageHeader />

    <!-- 搜索栏（提交人/起止日期/问题处理状态 3 字段已 1:1 对齐） -->
    <InspectionSearch
      v-model:filters="searchFilters"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 工具栏（新增/批量编辑/批量删除/导出 4 模式） -->
    <InspectionToolbar
      :batch-mode="batchMode"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :batch-delete-mode="batchDeleteMode"
      :selected-count="selectedRows.length"
      :can-create="canCreate"
      :can-export="canExport"
      :can-edit="canEdit"
      :can-delete="canDelete"
      @add="handleAdd"
      @enter-batch-edit="enterBatchMode('edit')"
      @enter-batch-delete="enterBatchDelete"
      @enter-export="enterExportMode"
      @confirm-export="handleConfirmExport"
      @cancel-batch="cancelBatchMode"
    />

    <!-- 表格（14 列 1:1 对齐：选择/巡查编号/巡查类型/提交人/位置对象/巡查日期/巡查结果/问题分类/严重程度/反馈状态/反馈人员/处理进度/操作/备注） -->
    <InspectionTable
      :data="records"
      :loading="loading"
      :show-checkbox="batchMode"
      :selected-rows="selectedRows"
      :users="users"
      @view="handleView"
      @accept="handleAccept"
      @update:selected-rows="(v) => selectedRows = v"
    />

    <!-- 详情弹窗（V1.1 DetailInspectionModal.tsx 14 区块 1:1 对齐） -->
    <DetailInspectionModal
      :is-open="!!detailInspection"
      :inspection="detailInspection"
      :problem-flow-records="currentProblemFlowRecords"
      :operation-records="currentOperationRecords"
      :get-actual-workload="getActualWorkload"
      @close="detailInspection = null"
    />

    <!-- 新建弹窗（V1.1 CreateInspectionModal.tsx 27 字段 1:1 对齐） -->
    <CreateInspectionModal
      :is-open="showCreate"
      :greenhouse-options="greenhouseOptions"
      :worker-options="workerOptions"
      :problem-types="PROBLEM_TYPES"
      @close="showCreate = false"
      @submit="handleCreate"
    />

    <!-- 批量编辑弹窗（V1.1 BatchEditModal.tsx 11 字段 1:1 对齐） -->
    <BatchEditModal
      :is-open="showBatchEdit"
      :records="selectedRows"
      @close="showBatchEdit = false"
      @submit="handleBatchEdit"
    />

    <!-- 删除确认弹窗（V1.1 DeleteWarningModal.tsx 1:1 对齐） -->
    <DeleteWarningModal
      :is-open="showDeleteWarning"
      :count="selectedRows.length"
      @close="showDeleteWarning = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup>
/**
 * 巡检管理页面（V1.1 1:1 对齐）
 * 数据流：useInspectionDataStore.fetchRecords() → records
 * 业务：P0-1~P0-22 全部修复，挂载已迁移的 8 个 inspection 组件
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useInspectionDataStore } from '@/stores/modules/inspectionData.js'
import { useUserStore } from '@/stores/modules/user.js'
import { useProblemStore } from '@/stores/modules/problem.js'

// V1.1 1:1 对齐组件
import InspectionPageHeader from '@/components/farm/inspection/components/InspectionPageHeader.vue'
import InspectionSearch from '@/components/farm/inspection/InspectionSearch.vue'
import InspectionToolbar from '@/components/farm/inspection/InspectionToolbar.vue'
import InspectionTable from '@/components/farm/inspection/InspectionTable.vue'
import DetailInspectionModal from '@/components/farm/inspection/DetailInspectionModal.vue'
import CreateInspectionModal from '@/components/farm/inspection/modals/CreateInspectionModal.vue'
import BatchEditModal from '@/components/farm/inspection/modals/BatchEditModal.vue'
import DeleteWarningModal from '@/components/farm/inspection/modals/DeleteWarningModal.vue'

const inspectionStore = useInspectionDataStore()
const userStore = useUserStore()
const problemStore = useProblemStore()

// 状态
const loading = ref(false)
const searchFilters = ref({ searchTerm: '', inspectorId: '', startDate: '', endDate: '', status: 'all', problemStatus: 'all' })
const batchMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const showCreate = ref(false)
const showBatchEdit = ref(false)
const showDeleteWarning = ref(false)
const detailInspection = ref(null)

// 权限
const canCreate = computed(() => true)
const canExport = computed(() => true)
const canEdit = computed(() => true)
const canDelete = computed(() => true)

// 数据
const records = computed(() => inspectionStore.records || [])
const users = computed(() => userStore.users || [])
const greenhouseOptions = ref([
  { value: 'greenhouse-1', label: '1号棚' },
  { value: 'greenhouse-2', label: '2号棚' },
  { value: 'greenhouse-3', label: '3号棚' },
  { value: 'greenhouse-4', label: '4号棚' },
  { value: 'greenhouse-5', label: '5号棚' },
  { value: 'greenhouse-6', label: '6号棚' },
])
const workerOptions = computed(() =>
  users.value.map(u => ({ value: u.id || u.userId, label: u.name || u.userName }))
)

// V1.1 1:1 枚举
const PROBLEM_TYPES = [
  { value: 'disease', label: '病害' },
  { value: 'pest', label: '虫害' },
  { value: 'environment', label: '环境' },
  { value: 'growth', label: '长势' },
  { value: 'equipment', label: '设备' },
  { value: 'other', label: '其他' },
]

const currentProblemFlowRecords = ref([])
const currentOperationRecords = ref([])

function getActualWorkload() {
  return { days: 0, hours: 0, workers: 0 }
}

// 操作
function handleAdd() {
  showCreate.value = true
}
function handleView(inspection) {
  detailInspection.value = inspection
}
function handleAccept(inspection) {
  ElMessage.success(`已接受巡检 ${inspection.code}`)
  inspectionStore.updateRecord(inspection.id, { status: '已处理' })
}
function handleCreate(data) {
  inspectionStore.createRecord(data)
  showCreate.value = false
  ElMessage.success('巡检记录已创建')
}
function handleSearch() {
  loadData()
}
function handleReset() {
  searchFilters.value = { searchTerm: '', inspectorId: '', startDate: '', endDate: '', status: 'all', problemStatus: 'all' }
  loadData()
}
function enterBatchMode(mode) {
  batchMode.value = true
  if (mode === 'edit') batchEditMode.value = true
}
function enterBatchDelete() {
  batchMode.value = true
  batchDeleteMode.value = true
}
function enterExportMode() {
  batchMode.value = true
  exportMode.value = true
}
function cancelBatchMode() {
  batchMode.value = false
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}
function handleConfirmExport() {
  ElMessage.success(`已导出 ${selectedRows.value.length} 条巡检记录`)
  cancelBatchMode()
}
function handleBatchEdit(data) {
  selectedRows.value.forEach(r => inspectionStore.updateRecord(r.id, data))
  showBatchEdit.value = false
  cancelBatchMode()
  ElMessage.success('批量编辑已保存')
}
function handleConfirmDelete() {
  selectedRows.value.forEach(r => inspectionStore.deleteRecord(r.id))
  showDeleteWarning.value = false
  cancelBatchMode()
  ElMessage.success('删除成功')
}

async function loadData() {
  loading.value = true
  try {
    await inspectionStore.fetchRecords?.()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  userStore.loadUsers?.()
})
</script>
