<!--
  TaskExecutePanel.vue - 任务工单管理面板
  V1.1 TasksPage.tsx 1:1 重构（去除 mock，接入 useTasks composable）
  数据源：useTasks composable 统一合并 farmTaskStore + tempTaskStore + inspectionDataStore
-->
<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="20" class="text-white"><Check /></el-icon>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">任务工单管理</h2>
          <p class="text-xs text-gray-500">管理农事任务派发、执行和验收</p>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">搜索:</span>
          <el-input v-model="filters.searchTerm" placeholder="搜索任务编号/名称" class="w-48" clearable />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">任务类型:</span>
          <el-select v-model="filters.typeFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="t in TASK_TYPES" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">状态:</span>
          <el-select v-model="filters.statusFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="s in TASK_STATUSES" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">作业模式:</span>
          <el-select v-model="filters.modeFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="派工" value="dispatch" />
            <el-option label="自主" value="self" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>

        <div class="ml-auto flex gap-2">
          <template v-if="exportMode">
            <el-button type="primary" :disabled="selectedRows.length === 0" @click="showExportModal = true">确认导出</el-button>
            <el-button @click="handleCancelExport">取消</el-button>
          </template>
          <template v-else-if="batchEditMode">
            <el-button type="primary" :disabled="selectedRows.length === 0" @click="showBatchEditModal = true">批量编辑</el-button>
            <el-button @click="handleCancelBatch">取消</el-button>
          </template>
          <template v-else-if="batchDeleteMode">
            <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">确认删除</el-button>
            <el-button @click="handleCancelBatch">取消</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="openCreateModal"><el-icon><Plus /></el-icon> 新增</el-button>
            <el-button @click="enterBatchEdit">编辑</el-button>
            <el-button type="danger" @click="enterBatchDelete">删除</el-button>
            <el-button @click="handleExportClick">导出</el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 任务列表表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedTasks" style="width: 100%" v-loading="loading">
        <!-- P0-PM-02: 复选框列宽 55 → 48 -->
        <el-table-column type="selection" width="48" :selectable="isRowSelectable" />
        <!-- P0-PM-04: 任务编号列宽 130 → 100 -->
        <el-table-column label="任务编号" width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailModal(row)">{{ row.taskCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="任务标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="任务类型" width="100">
          <template #default="{ row }">
            <TaskTypeTag :type="row.type" :type-name="row.typeName" />
          </template>
        </el-table-column>
        <el-table-column prop="greenhouseName" label="作业区域" width="120" show-overflow-tooltip />
        <el-table-column prop="assigneeName" label="执行人" width="100" />
        <el-table-column label="计划开始" width="120">
          <template #default="{ row }">
            <span class="text-sm text-gray-600">{{ row.planStart || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="计划结束" width="120" />
        <el-table-column label="优先级" width="80">
          <template #default="{ row }">
            <TaskPriorityBadge :priority="row.priority" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <TaskStatusBadge :status="row.status" />
          </template>
        </el-table-column>
        <!-- P0-PM-03: 操作列宽 200 → 180 -->
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailModal(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openEditModal(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTasks.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <TaskDetailModal :task="selectedTask" @close="closeDetailModal" @confirm-complete="handleConfirmComplete" />

    <!-- 创建/编辑表单弹窗 -->
    <TaskFormModal
      v-model:is-open="isFormModalOpen"
      :title="editingTask ? '编辑任务' : '创建任务'"
      :form-data="formData"
      :errors="formErrors"
      :task-types="TASK_TYPES"
      :greenhouses="greenhouseList"
      :batches="cropBatches"
      :workers="workerUsers"
      @submit="handleFormSubmit"
      @close="closeFormModal"
      @change="updateFormData"
    />

    <!-- 删除确认弹窗 -->
    <DeleteWarningModal
      v-model:is-open="showDeleteWarning"
      :selected-count="selectedRows.length"
      @confirm="handleDeleteConfirm"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      v-model:is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @format-change="exportFormat = $event"
      @confirm="handleDoExport"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      v-model:is-open="showBatchEditModal"
      :selected-rows="selectedRows"
      :tasks="tasks"
      :users="workerOptions"
      :greenhouses="greenhouseOptions"
      @confirm="handleBatchEditConfirm"
    />
  </div>
</template>

<script setup>
/**
 * TaskExecutePanel.vue
 * V1.1 TasksPage.tsx → V2.0 Vue3 + Element Plus
 * 数据流：useTasks() composable → farmTaskStore/tempTaskStore/inspectionDataStore
 */
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Plus } from '@element-plus/icons-vue'
import { useTasks } from '@/composables/useTasks'
import { useUserStore } from '@/stores/modules/user'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import TaskStatusBadge from './tasks/TaskStatusBadge.vue'
import TaskPriorityBadge from './tasks/TaskPriorityBadge.vue'
import TaskTypeTag from './tasks/TaskTypeTag.vue'
import TaskDetailModal from './tasks/TaskDetailModal.vue'
import TaskFormModal from './tasks/TaskFormModal.vue'
import BatchEditModal from './tasks/BatchEditModal.vue'
import DeleteWarningModal from './tasks/DeleteWarningModal.vue'
import ExportFormatModal from './tasks/ExportFormatModal.vue'
import { TASK_TYPES, TASK_STATUSES } from './tasks/taskConstants'

// ========== 数据源 ==========
const { tasks, addTask, updateTask, deleteTask, updateTaskStatus } = useTasks()
const userStore = useUserStore()
const greenhouseStore = useGreenhouseStore()
const productionPlanStore = useProductionPlanStore()

const loading = ref(false)
const greenhouses = computed(() => greenhouseStore.greenhouses || [])
const cropBatches = computed(() => productionPlanStore.batches || [])
const workerUsers = computed(() => {
  const users = userStore.users || []
  return users.filter(u => u.role === 'technician' || u.role === 'worker' || u.position === '工人' || u.position === '技术员')
})
const greenhouseList = computed(() => greenhouses.value.map(g => ({ id: g.id, name: g.name })))
const greenhouseOptions = computed(() => greenhouseList.value)
const workerOptions = computed(() => workerUsers.value.map(u => ({ id: u.id, name: u.name })))

// ========== 筛选 ==========
const filters = ref({
  searchTerm: '',
  typeFilter: '',
  statusFilter: '',
  modeFilter: '',
})

// ========== 分页 ==========
const pagination = ref({ currentPage: 1, pageSize: 10 })

// ========== 批量操作状态 ==========
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const showBatchEditModal = ref(false)
const exportFormat = ref('excel')

// ========== 详情弹窗 ==========
const selectedTask = ref(null)
const isDetailModalOpen = ref(false)

// ========== 表单弹窗 ==========
const isFormModalOpen = ref(false)
const editingTask = ref(null)

const initialFormData = () => ({
  taskCode: '',
  title: '',
  type: '',
  batchCode: '',
  greenhouseId: '',
  assigneeId: '',
  dueDate: new Date().toISOString().slice(0, 10),
  workDuration: 0,
  priority: 'medium',
  mode: 'dispatch',
  description: '',
})
const formData = ref(initialFormData())
const formErrors = ref({})

// ========== 过滤 & 分页 ==========
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    if (filters.value.searchTerm) {
      const q = filters.value.searchTerm
      const hit = (task.taskCode || '').includes(q) || (task.title || '').includes(q)
      if (!hit) return false
    }
    if (filters.value.typeFilter && (task.type || task.typeName) !== filters.value.typeFilter) {
      const matchName = TASK_TYPES.find(t => t.value === filters.value.typeFilter)?.label
      if (task.typeName !== matchName && task.type !== filters.value.typeFilter) return false
    }
    if (filters.value.statusFilter && task.status !== filters.value.statusFilter) return false
    if (filters.value.modeFilter && task.mode !== filters.value.modeFilter && task.dispatchMode !== filters.value.modeFilter) return false
    return true
  })
})

const paginatedTasks = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  return filteredTasks.value.slice(start, start + pagination.value.pageSize)
})

const isRowSelectable = (row) => {
  if (batchEditMode.value) return row.status !== 'completed' && row.status !== 'cancelled'
  if (batchDeleteMode.value) return row.status === 'pending'
  return true
}

// ========== 详情操作 ==========
function openDetailModal(task) { selectedTask.value = task; isDetailModalOpen.value = true }
function closeDetailModal() { isDetailModalOpen.value = false; selectedTask.value = null }

// ========== 表单操作 ==========
function generateTaskCode() {
  const today = new Date()
  const ymd = today.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String((tasks.value.length || 0) + 1).padStart(3, '0')
  return `NS${ymd}${seq}`
}

function openCreateModal() {
  editingTask.value = null
  formData.value = { ...initialFormData(), taskCode: generateTaskCode() }
  formErrors.value = {}
  isFormModalOpen.value = true
}

function openEditModal(task) {
  editingTask.value = task
  formData.value = {
    taskCode: task.taskCode || '',
    title: task.title || '',
    type: task.type || '',
    batchCode: task.batchCode || '',
    greenhouseId: task.greenhouseId || '',
    assigneeId: task.assigneeId || '',
    dueDate: task.dueDate || new Date().toISOString().slice(0, 10),
    workDuration: task.workDuration || task.estimatedHours || 0,
    priority: task.priority || 'medium',
    mode: task.mode || task.dispatchMode || 'dispatch',
    description: task.description || '',
  }
  formErrors.value = {}
  isFormModalOpen.value = true
}

function closeFormModal() { isFormModalOpen.value = false; editingTask.value = null }

function updateFormData(field, value) {
  formData.value = { ...formData.value, [field]: value }
}

function validateForm() {
  const errs = {}
  if (!formData.value.title) errs.title = '请输入任务标题'
  if (!formData.value.type) errs.type = '请选择任务类型'
  if (!formData.value.mode) errs.mode = '请选择任务模式'
  if (!formData.value.batchCode) errs.batchCode = '请选择批次'
  if (!formData.value.greenhouseId) errs.greenhouseId = '请选择作业区域'
  if (!formData.value.assigneeId) errs.assigneeId = '请选择执行人'
  if (!formData.value.dueDate) errs.dueDate = '请选择截止时间'
  if (!formData.value.workDuration || formData.value.workDuration <= 0) errs.workDuration = '请输入预计工时'
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

async function handleFormSubmit() {
  if (!validateForm()) {
    ElMessage.error('请完善表单必填项')
    return
  }
  const assignee = workerUsers.value.find(u => u.id === formData.value.assigneeId)
  const greenhouse = greenhouses.value.find(g => g.id === formData.value.greenhouseId)
  const batch = cropBatches.value.find(b => b.batchCode === formData.value.batchCode)
  const taskType = TASK_TYPES.find(t => t.value === formData.value.type)

  const payload = {
    ...formData.value,
    assigneeName: assignee?.name || '',
    assignerName: userStore.userInfo?.name || userStore.currentUser?.name || '当前用户',
    assignerId: userStore.userInfo?.id || userStore.currentUser?.id || '',
    greenhouseName: greenhouse?.name || '',
    typeName: taskType?.label || formData.value.type,
    cropName: batch?.cropName || '',
  }

  try {
    if (editingTask.value) {
      await updateTask(editingTask.value.id, payload)
      ElMessage.success('任务已更新')
    } else {
      await addTask({ ...payload, status: 'pending', dispatchMode: 'farm' })
      ElMessage.success('任务已创建')
    }
    closeFormModal()
  } catch (e) {
    console.warn('[TaskExecutePanel] submit error', e)
    ElMessage.error('保存失败')
  }
}

function handleConfirmComplete(task) {
  updateTaskStatus(task.id, 'completed')
  ElMessage.success('任务已标记为完成')
  closeDetailModal()
}

async function handleDeleteTask(task) {
  try {
    await ElMessageBox.confirm(`确定要删除任务 "${task.title}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTask(task.id)
    ElMessage.success('删除成功')
  } catch { /* 取消 */ }
}

function handleSelectAll() {
  if (selectedRows.value.length === filteredTasks.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredTasks.value.map(t => t.id)
  }
}

watch(filteredTasks, () => { pagination.value.currentPage = 1 })

function enterBatchEdit() { batchEditMode.value = true; selectedRows.value = [] }
function enterBatchDelete() { batchDeleteMode.value = true; selectedRows.value = [] }

function handleBatchDelete() { showDeleteWarning.value = true }

async function handleDeleteConfirm() {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个任务吗？此操作无法恢复。`,
      '批量删除任务',
      { type: 'warning' }
    )
  } catch { return }
  for (const id of selectedRows.value) {
    await deleteTask(id)
  }
  ElMessage.success('批量删除完成')
  selectedRows.value = []
  showDeleteWarning.value = false
  batchDeleteMode.value = false
}

async function handleBatchEditConfirm(editedTasks) {
  const entries = Object.entries(editedTasks || {})
  if (entries.length === 0) return
  for (const [taskCode, updates] of entries) {
    const task = tasks.value.find(t => t.taskCode === taskCode)
    if (task) await updateTask(task.id, updates)
  }
  ElMessage.success(`已批量更新 ${entries.length} 个任务`)
  selectedRows.value = []
  batchEditMode.value = false
}

function handleCancelBatch() {
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

function handleExportClick() { exportMode.value = true; selectedRows.value = [] }
function handleCancelExport() { exportMode.value = false; selectedRows.value = [] }

function todayLocal() { return new Date().toISOString().slice(0, 10) }

function handleDoExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  const selectedData = tasks.value.filter(t => selectedRows.value.includes(t.id))
  const headers = ['任务编号', '任务标题', '任务类型', '作业区域', '执行人', '计划开始', '计划结束', '优先级', '状态']
  const exportData = selectedData.map(row => ({
    '任务编号': row.taskCode || '',
    '任务标题': row.title || '',
    '任务类型': row.typeName || '',
    '作业区域': row.greenhouseName || '',
    '执行人': row.assigneeName || '',
    '计划开始': row.planStart || '-',
    '计划结束': row.dueDate || '',
    '优先级': row.priority || '',
    '状态': row.status || '',
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

  const fileName = `任务工单_${todayLocal()}.${extension}`
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
  ElMessage.success(`已导出 ${selectedData.length} 条数据`)
}

function handleSearch() { pagination.value.currentPage = 1 }
function handleReset() {
  filters.value = { searchTerm: '', typeFilter: '', statusFilter: '', modeFilter: '' }
  pagination.value.currentPage = 1
}
function handlePageChange(p) { pagination.value.currentPage = p }
function handlePageSizeChange(s) { pagination.value.pageSize = s; pagination.value.currentPage = 1 }

onMounted(async () => {
  loading.value = true
  try {
    if (!userStore.users || userStore.users.length === 0) {
      await userStore.loadUsers?.()
    }
    if (!greenhouses.value || greenhouses.value.length === 0) {
      await greenhouseStore.loadGreenhouses?.()
    }
    if (!cropBatches.value || cropBatches.value.length === 0) {
      await productionPlanStore.fetchPlans?.()
    }
  } catch (e) {
    console.warn('[TaskExecutePanel] load base data failed:', e)
  } finally {
    loading.value = false
  }
})
</script>