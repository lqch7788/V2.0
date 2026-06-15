<!--
  TempTaskPage.vue - 临时任务管理主页面
  V1.1 src/components/labor/tempTask/TempTaskPage.tsx (1657行) 1:1 迁移
  包含 4 区域：统计卡片 / 筛选栏 / 工具栏 / 表格+分页 / 8 个弹窗
-->
<template>
  <div class="space-y-6">
    <!-- 1. 统计卡片（6 列布局） -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
      <div class="bg-white rounded-lg p-3">
        <p class="text-xs text-gray-500">总任务</p>
        <p class="text-lg font-bold text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-lg p-3">
        <p class="text-xs text-gray-500">待执行</p>
        <p class="text-lg font-bold text-amber-600 mt-1">{{ stats.pending }}</p>
      </div>
      <div class="bg-white rounded-lg p-3">
        <p class="text-xs text-gray-500">进行中</p>
        <p class="text-lg font-bold text-blue-600 mt-1">{{ stats.inProgress }}</p>
      </div>
      <div class="bg-white rounded-lg p-3">
        <p class="text-xs text-gray-500">已完成</p>
        <p class="text-lg font-bold text-green-600 mt-1">{{ stats.completed }}</p>
      </div>
      <div class="bg-white rounded-lg p-3 border-l-2 border-red-500">
        <p class="text-xs text-gray-500">非常紧急</p>
        <p class="text-lg font-bold text-red-600 mt-1">{{ stats.critical }}</p>
      </div>
      <div class="bg-white rounded-lg p-3 border-l-2 border-orange-500">
        <p class="text-xs text-gray-500">超时预警</p>
        <div class="flex items-center gap-2 mt-1">
          <p class="text-lg font-bold text-orange-600">{{ stats.overdue + stats.warning }}</p>
          <span v-if="stats.overdue > 0" class="text-xs text-red-600">已超时{{ stats.overdue }}</span>
          <span v-if="stats.warning > 0" class="text-xs text-orange-600">即将到期{{ stats.warning }}</span>
        </div>
      </div>
    </div>

    <!-- 2. 筛选组件 -->
    <TempTaskFilters
      :search-term="filters.searchTerm"
      :urgency-filter="filters.urgencyFilter"
      :status-filter="filters.statusFilter"
      :overdue-filter="filters.overdueFilter"
      @update:search-term="setSearchTerm"
      @update:urgency-filter="setUrgencyFilter"
      @update:status-filter="setStatusFilter"
      @update:overdue-filter="setOverdueFilter"
    />

    <!-- 3. 表格区域 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <!-- 工具栏 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">临时任务派发列表</h3>
        </div>
        <div v-if="exportMode" class="flex gap-2">
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="showExportModal = true">
            确认导出
          </button>
          <button type="button"
            class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
            @click="handleCancelExport">
            取消
          </button>
        </div>
        <div v-else-if="batchEditMode" class="flex gap-2">
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="handleBatchEdit">
            批量编辑
          </button>
          <button type="button"
            class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
            @click="handleCancelBatch">
            取消
          </button>
        </div>
        <div v-else-if="batchDeleteMode" class="flex gap-2">
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete">
            确认删除
          </button>
          <button type="button"
            class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
            @click="handleCancelBatch">
            取消
          </button>
        </div>
        <div v-else class="flex gap-2">
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700"
            @click="openCreateModal">
            <span class="inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新增
            </span>
          </button>
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-blue-500 text-white hover:bg-blue-600"
            @click="enterBatchEdit">
            编辑
          </button>
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-red-500 text-white hover:bg-red-600"
            @click="enterBatchDelete">
            删除
          </button>
          <button type="button"
            class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
            @click="handleExportClick">
            导出
          </button>
        </div>
      </div>

      <!-- 任务列表 -->
      <TempTaskTable
        :tasks="pagedTasks"
        :show-checkbox="exportMode || batchEditMode || batchDeleteMode"
        :export-mode="exportMode"
        :batch-edit-mode="batchEditMode"
        :batch-delete-mode="batchDeleteMode"
        :selected-rows="selectedRows"
        :pagination="pagination"
        @view-task="openDetailModal"
        @edit-task="openEditModal"
        @accept="handleAcceptComplete"
        @withdraw="handleWithdraw"
        @cancel="handleCancel"
        @reassign="handleOpenReassign"
        @select-all="handleSelectAll"
        @select-row="handleSelectRow"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <TempTaskDetailModal
      v-if="selectedTask"
      :is-open="isDetailModalOpen"
      :task="selectedTask"
      @close="closeDetailModal"
    />

    <!-- 创建/编辑表单弹窗 -->
    <TempTaskFormModal
      :is-open="isFormModalOpen"
      :title="editingTask ? '编辑临时任务' : '新建临时任务'"
      :task="editingTask"
      :form-data="formData"
      :errors="errors"
      :worker-users="workerUsers"
      :greenhouses="greenhouses"
      :dispatch-mode="dispatchMode"
      @close="closeFormModal"
      @submit-draft="handleSubmitDraft"
      @submit="handleSubmit"
      @change="updateFormData"
      @generate-code="generateNewTaskCode"
      @dispatch-mode-change="(m) => (dispatchMode = m)"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      v-if="showBatchEditModal"
      :is-open="showBatchEditModal"
      :selected-rows="selectedRows"
      :tasks="tempTasks"
      :users="workerUsers"
      @close="showBatchEditModal = false"
      @confirm="handleBatchEditConfirm"
    />

    <!-- 删除确认弹窗 -->
    <DeleteWarningModal
      v-if="showDeleteWarning"
      :is-open="showDeleteWarning"
      :selected-count="selectedRows.length"
      @close="showDeleteWarning = false"
      @confirm="handleDeleteConfirm"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      v-if="showExportModal"
      :is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @format-change="(f) => (exportFormat = f)"
      @close="showExportModal = false"
      @confirm="handleDoExport"
    />

    <!-- 撤回任务弹窗 -->
    <WithdrawCancelModal
      v-if="withdrawCancelTask"
      :is-open="showWithdrawModal"
      :task="withdrawCancelTask"
      type="withdraw"
      @confirm="handleWithdrawConfirm"
      @close="closeWithdrawModal"
    />

    <!-- 取消任务弹窗 -->
    <WithdrawCancelModal
      v-if="withdrawCancelTask"
      :is-open="showCancelModal"
      :task="withdrawCancelTask"
      type="cancel"
      @confirm="handleCancelConfirm"
      @close="closeCancelModal"
    />

    <!-- 重新派发任务弹窗 -->
    <ReassignTaskModal
      v-if="reassignTask"
      :is-open="showReassignModal"
      :task="reassignTask"
      :users="workerUsersWithRole"
      @confirm="handleReassignConfirm"
      @close="closeReassignModal"
    />

    <!-- 验收弹窗 -->
    <el-dialog
      v-if="verifyTask"
      :model-value="showVerifyModal"
      @update:model-value="closeVerifyModal"
      :title="`任务验收 - ${verifyTask.taskCode || ''}`"
      width="560px"
      destroy-on-close
    >
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="font-medium text-gray-900">{{ verifyTask.title }}</p>
          <div class="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
            <p>执行人：{{ verifyTask.assigneeName }}</p>
            <p>工作地点：{{ verifyTask.location || verifyTask.workLocation || '-' }}</p>
            <p>当前状态：<span class="text-orange-600 font-medium">待验收</span></p>
            <p>进度：{{ verifyTask.progress || 0 }}%</p>
          </div>
        </div>
        <div v-if="verifyTask.completionRemarks">
          <label class="block text-sm font-medium text-gray-700 mb-1">执行人完成备注</label>
          <div class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-sm text-green-700">{{ verifyTask.completionRemarks }}</p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            验收意见 <span class="text-gray-400">(可选)</span>
          </label>
          <textarea v-model="verifyRemarks"
            placeholder="审核通过的验收意见..."
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            驳回原因 <span class="text-red-500">*</span> <span class="text-gray-400">(驳回时必填)</span>
          </label>
          <textarea v-model="verifyRejectReason"
            placeholder="请输入驳回原因..."
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            :disabled="!verifyRejectReason.trim()"
            @click="handleVerifyReject">
            驳回
          </button>
          <button type="button"
            class="px-3 py-1.5 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700"
            @click="handleVerifyAccept">
            验收通过
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 临时任务管理主页面
 * V1.1 src/components/labor/tempTask/TempTaskPage.tsx 1:1 迁移
 *
 * 状态机：5 状态
 *   pending → in_progress → waiting_acceptance → completed
 *   + cancelled / rejected / pending_reassign
 *
 * 联动数据源：useTempTaskStore (Pinia)
 *   - 与 TempTaskTab.vue (农事任务中心临时任务Tab) 共享同一份数据
 *   - 任一端创建/编辑/状态变更会自动同步到另一端
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTempTaskStore } from '@/stores/modules/tempTask'
import { useUserStore } from '@/stores/modules/user'
import TempTaskFilters from './TempTaskFilters.vue'
import TempTaskTable from './TempTaskTable.vue'
import TempTaskFormModal from './TempTaskFormModal.vue'
import TempTaskDetailModal from './TempTaskDetailModal.vue'
import BatchEditModal from './BatchEditModal.vue'
import DeleteWarningModal from './DeleteWarningModal.vue'
import ExportFormatModal from './ExportFormatModal.vue'
import WithdrawCancelModal from './WithdrawCancelModal.vue'
import ReassignTaskModal from './ReassignTaskModal.vue'

// ========== Store ==========
const tempTaskStore = useTempTaskStore()
const userStore = useUserStore()

// ========== 数据源（与 TempTaskTab.vue 1:1 共享）==========
const tempTasks = computed(() => Array.isArray(tempTaskStore.tasks) ? tempTaskStore.tasks : [])

const workerUsers = computed(() => {
  const list = userStore.users || []
  return list.map(u => ({ id: u.id || u.userId, name: u.name || u.userName || u.username }))
})

const workerUsersWithRole = computed(() => {
  const list = userStore.users || []
  return list.map(u => ({
    id: u.id || u.userId,
    name: u.name || u.userName || u.username,
    role: u.role || u.userRole || '',
  }))
})

const greenhouses = computed(() => {
  // V2.0 中温室通常在 greenhouseStore，这里给空数组兜底
  if (userStore.greenhouses) return userStore.greenhouses
  return []
})

// ========== 筛选（与 V1.1 useTempTaskFilters 1:1）==========
const filters = reactive({
  searchTerm: '',
  urgencyFilter: 'all',
  statusFilter: 'all',
  overdueFilter: 'all',
})

const filteredTasks = computed(() => {
  let list = tempTasks.value
  if (filters.searchTerm) {
    const kw = filters.searchTerm.toLowerCase()
    list = list.filter(t =>
      (t.taskCode || '').toLowerCase().includes(kw) ||
      (t.title || '').toLowerCase().includes(kw)
    )
  }
  if (filters.urgencyFilter !== 'all') {
    list = list.filter(t => (t.urgency || 'normal') === filters.urgencyFilter)
  }
  if (filters.statusFilter !== 'all') {
    list = list.filter(t => t.status === filters.statusFilter)
  }
  if (filters.overdueFilter !== 'all') {
    list = list.filter(t => {
      const overdueStatus = getOverdueStatusForFilter(t)
      return overdueStatus === filters.overdueFilter
    })
  }
  return list
})

function getOverdueStatusForFilter(task) {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return 'normal'
  const now = new Date()
  const due = new Date(task.dueDate)
  if (isNaN(due.getTime())) return 'normal'
  const diff = due.getTime() - now.getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 0) return 'overdue'
  if (hours < 24) return 'warning'
  return 'normal'
}

// 统计（与 V1.1 stats 1:1）
const stats = computed(() => {
  const list = tempTasks.value
  return {
    total: list.length,
    pending: list.filter(t => t.status === 'pending').length,
    inProgress: list.filter(t => t.status === 'in_progress').length,
    completed: list.filter(t => t.status === 'completed').length,
    critical: list.filter(t => t.urgency === 'critical').length,
    overdue: list.filter(t => getOverdueStatusForFilter(t) === 'overdue').length,
    warning: list.filter(t => getOverdueStatusForFilter(t) === 'warning').length,
  }
})

function setSearchTerm(v) { filters.searchTerm = v }
function setUrgencyFilter(v) { filters.urgencyFilter = v }
function setStatusFilter(v) { filters.statusFilter = v }
function setOverdueFilter(v) { filters.overdueFilter = v }

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(10)
const pagination = computed(() => ({
  currentPage: currentPage.value,
  pageSize: pageSize.value,
  total: filteredTasks.value.length,
}))

const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTasks.value.slice(start, start + pageSize.value)
})

function onPageChange(page) { currentPage.value = page }
function onPageSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

// ========== 弹窗状态 ==========
const selectedTask = ref(null)
const isDetailModalOpen = ref(false)
const isFormModalOpen = ref(false)
const editingTask = ref(null)

// 批量操作状态
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')

// 撤回/取消弹窗
const showWithdrawModal = ref(false)
const showCancelModal = ref(false)
const withdrawCancelTask = ref(null)

// 重新派发弹窗
const showReassignModal = ref(false)
const reassignTask = ref(null)

// 验收弹窗
const showVerifyModal = ref(false)
const verifyTask = ref(null)
const verifyRemarks = ref('')
const verifyRejectReason = ref('')

// 派发模式
const dispatchMode = ref('manual')

// ========== 表单（与 V1.1 formData 字段 1:1）==========
const defaultFormData = () => ({
  taskCode: '',
  title: '',
  urgency: 'normal',
  tempTaskType: 'fertilization',
  workLocation: '',
  estimatedHours: 0,
  assigneeId: '',
  assigneeName: '',
  planStart: '',
  dueDate: '',
  description: '',
  notes: '',
  priority: 'low',
  estimatedDays: 0,
  greenhouseId: '',
  workerCount: 1,
  requiredFeedback: [],
})

const formData = reactive(defaultFormData())
const errors = reactive({})

function updateFormData(key, value) {
  formData[key] = value
  if (errors[key]) delete errors[key]
}

// 生成任务编号（与 V1.1 generateNewTaskCode 1:1）
function generateNewTaskCode() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = `TT${today}`
  const seqs = tempTasks.value
    .filter(t => typeof t.taskCode === 'string' && t.taskCode.startsWith(prefix))
    .map(t => parseInt(t.taskCode.replace(prefix, ''), 10) || 0)
  const next = seqs.length > 0 ? Math.max(...seqs) + 1 : 1
  formData.taskCode = `${prefix}${String(next).padStart(3, '0')}`
}

// 紧急程度 -> 优先级映射
const URGENCY_TO_PRIORITY = { critical: 'urgent', urgent: 'high', normal: 'normal' }

function handleSubmitDraft() {
  submitTask('draft')
}

function handleSubmit() {
  submitTask('pending')
}

async function submitTask(status) {
  // 校验
  const newErrors = {}
  if (!formData.title?.trim()) newErrors.title = '请输入任务名称'
  if (!formData.tempTaskType) newErrors.tempTaskType = '请选择任务类型'
  if (!formData.workLocation) newErrors.workLocation = '请选择工作地点'
  if (!formData.dueDate) newErrors.dueDate = '请选择截止时间'
  if (status === 'pending' && !formData.assigneeId) {
    newErrors.assigneeId = '发布时必须选择执行人'
  }
  if (formData.tempTaskType === 'other' && !formData.notes?.trim()) {
    newErrors.notes = '选择"其他"类型时必须填写备注说明'
  }
  Object.assign(errors, newErrors)
  if (Object.keys(newErrors).length > 0) {
    ElMessage.warning('请检查必填项')
    return
  }

  // 当前操作人
  const currentUser = userStore.users?.[0] || userStore.currentUser || { id: 'admin', name: '管理员' }
  const assignerId = currentUser.id || currentUser.userId || 'admin'
  const assignerName = currentUser.name || currentUser.userName || '管理员'

  // 最终状态（草稿直接 draft；发布根据派发模式）
  let finalStatus = 'draft'
  if (status === 'pending') {
    finalStatus = dispatchMode.value === 'ai_assisted' ? 'pending_ai' : 'pending'
  }

  const payload = {
    taskCode: formData.taskCode,
    title: formData.title,
    type: formData.tempTaskType,
    typeName: getTypeName(formData.tempTaskType),
    urgency: formData.urgency,
    priority: URGENCY_TO_PRIORITY[formData.urgency] || 'normal',
    location: formData.workLocation,
    greenhouseId: formData.greenhouseId || '',
    greenhouseName: formData.workLocation,
    workLocation: formData.workLocation,
    assigneeId: formData.assigneeId || '',
    assigneeName: formData.assigneeName || '待分配',
    assignerId,
    assignerName,
    requesterId: assignerId,
    requesterName: assignerName,
    planStart: formData.planStart || '',
    dueDate: formData.dueDate,
    estimatedDays: formData.estimatedDays || 0,
    estimatedHours: formData.estimatedHours || 0,
    workerCount: formData.workerCount || 1,
    description: formData.description || '',
    remarks: formData.notes || '',
    notes: formData.notes || '',
    requiredFeedback: formData.requiredFeedback || [],
    sourceType: 'tempTask',
    dispatchMode: 'tempTask',
    status: finalStatus,
  }

  try {
    if (editingTask.value) {
      await tempTaskStore.updateTask(editingTask.value.id, payload)
      ElMessage.success('任务已更新')
    } else {
      const created = await tempTaskStore.createTask(payload)
      if (created) {
        ElMessage.success(`任务已创建: ${created.taskCode || ''}`)
      }
    }
    closeFormModal()
  } catch (e) {
    ElMessage.error('保存失败: ' + (e?.message || '未知错误'))
  }
}

function getTypeName(type) {
  const map = {
    fertilization: '施肥', irrigation: '灌溉', pruning: '修剪',
    pesticide: '植保', rootIrrigation: '灌根', planting: '定植',
    harvest: '采收', weeding: '除草', other: '其他',
  }
  return map[type] || '其他'
}

// ========== 弹窗控制 ==========
function openCreateModal() {
  editingTask.value = null
  Object.assign(formData, defaultFormData())
  generateNewTaskCode()
  isFormModalOpen.value = true
}

function openEditModal(task) {
  editingTask.value = task
  Object.assign(formData, defaultFormData(), {
    taskCode: task.taskCode || '',
    title: task.title || '',
    urgency: task.urgency || 'normal',
    tempTaskType: task.type || task.tempTaskType || 'fertilization',
    workLocation: task.location || task.workLocation || task.greenhouseName || '',
    estimatedHours: task.estimatedHours || 0,
    assigneeId: task.assigneeId || '',
    assigneeName: task.assigneeName || '',
    planStart: task.planStart || '',
    dueDate: task.dueDate || '',
    description: task.description || '',
    notes: task.notes || task.remarks || '',
    priority: task.priority || 'low',
    estimatedDays: task.estimatedDays || 0,
    greenhouseId: task.greenhouseId || '',
    workerCount: task.workerCount || 1,
    requiredFeedback: Array.isArray(task.requiredFeedback) ? [...task.requiredFeedback] : [],
  })
  isFormModalOpen.value = true
}

function openDetailModal(task) {
  selectedTask.value = task
  isDetailModalOpen.value = true
}

function closeDetailModal() {
  isDetailModalOpen.value = false
  selectedTask.value = null
}

function closeFormModal() {
  isFormModalOpen.value = false
  editingTask.value = null
  Object.assign(formData, defaultFormData())
}

// ========== 验收弹窗 ==========
function handleAcceptComplete(task) {
  verifyTask.value = task
  verifyRemarks.value = ''
  verifyRejectReason.value = ''
  showVerifyModal.value = true
}

async function handleVerifyAccept() {
  if (!verifyTask.value) return
  await tempTaskStore.acceptCompletion(verifyTask.value.id, verifyRemarks.value)
  ElMessage.success('验收通过')
  showVerifyModal.value = false
  verifyTask.value = null
  closeDetailModal()
}

async function handleVerifyReject() {
  if (!verifyTask.value || !verifyRejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  await tempTaskStore.rejectCompletion(verifyTask.value.id, verifyRejectReason.value)
  ElMessage.success('已驳回')
  showVerifyModal.value = false
  verifyTask.value = null
  closeDetailModal()
}

function closeVerifyModal() {
  showVerifyModal.value = false
  verifyTask.value = null
}

// ========== 撤回/取消 ==========
function handleWithdraw(task) {
  withdrawCancelTask.value = task
  showWithdrawModal.value = true
}

function handleCancel(task) {
  withdrawCancelTask.value = task
  showCancelModal.value = true
}

async function handleWithdrawConfirm(reason) {
  if (!withdrawCancelTask.value) return
  await tempTaskStore.updateTask(withdrawCancelTask.value.id, { status: 'cancelled' })
  ElMessage.success('任务已撤回')
  showWithdrawModal.value = false
  withdrawCancelTask.value = null
}

async function handleCancelConfirm(reason) {
  if (!withdrawCancelTask.value) return
  await tempTaskStore.updateTask(withdrawCancelTask.value.id, { status: 'cancelled' })
  ElMessage.success('任务已取消')
  showCancelModal.value = false
  withdrawCancelTask.value = null
}

function closeWithdrawModal() {
  showWithdrawModal.value = false
  withdrawCancelTask.value = null
}

function closeCancelModal() {
  showCancelModal.value = false
  withdrawCancelTask.value = null
}

// ========== 重新派发 ==========
function handleOpenReassign(task) {
  reassignTask.value = task
  showReassignModal.value = true
}

async function handleReassignConfirm(newAssigneeId, newAssigneeName) {
  if (!reassignTask.value) return
  await tempTaskStore.updateTask(reassignTask.value.id, {
    status: 'pending',
    assigneeId: newAssigneeId,
    assigneeName: newAssigneeName,
    rejectCount: 0,
  })
  ElMessage.success(`已重新派发给 ${newAssigneeName}`)
  showReassignModal.value = false
  reassignTask.value = null
}

function closeReassignModal() {
  showReassignModal.value = false
  reassignTask.value = null
}

// ========== 批量操作 ==========
function handleSelectAll() {
  if (selectedRows.value.length === filteredTasks.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredTasks.value.map(t => t.id)
  }
}

function handleSelectRow(id) {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rid => rid !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

function enterBatchEdit() {
  batchEditMode.value = true
  selectedRows.value = []
}

function enterBatchDelete() {
  batchDeleteMode.value = true
  selectedRows.value = []
}

function handleCancelBatch() {
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

function handleBatchEdit() {
  showBatchEditModal.value = true
}

async function handleBatchEditConfirm(editedTasks) {
  const entries = Object.entries(editedTasks)
  for (const [taskCode, updates] of entries) {
    const task = tempTasks.value.find(t => t.taskCode === taskCode)
    if (task) {
      await tempTaskStore.updateTask(task.id, updates)
    }
  }
  ElMessage.success(`已批量更新 ${entries.length} 个任务`)
  selectedRows.value = []
  batchEditMode.value = false
}

function handleBatchDelete() {
  showDeleteWarning.value = true
}

async function handleDeleteConfirm() {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个临时任务吗？此操作无法恢复。`,
      '批量删除临时任务',
      { type: 'warning' }
    )
    await tempTaskStore.deleteTasks(selectedRows.value)
    ElMessage.success('批量删除完成')
    selectedRows.value = []
    showDeleteWarning.value = false
    batchDeleteMode.value = false
  } catch {
    /* 用户取消 */
  }
}

// ========== 导出 ==========
function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

function handleCancelExport() {
  exportMode.value = false
  selectedRows.value = []
}

function handleDoExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  const selectedData = tempTasks.value.filter(t => selectedRows.value.includes(t.id))
  const headers = ['任务编号', '任务名称', '类型', '工作地点', '发布人', '截止日期', '紧急程度', '状态', '描述']
  const exportData = selectedData.map(row => ({
    '任务编号': row.taskCode,
    '任务名称': row.title,
    '类型': row.type || row.tempTaskType,
    '工作地点': row.workLocation || row.location,
    '发布人': row.assignerName,
    '截止日期': row.dueDate,
    '紧急程度': row.urgency,
    '状态': row.status,
    '描述': row.description || '',
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

  const fileName = `临时任务_${new Date().toISOString().slice(0, 10)}.${extension}`
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

// ========== 初始化 ==========
onMounted(async () => {
  try {
    await tempTaskStore.fetchTasks()
  } catch (e) {
    console.warn('[TempTaskPage] 加载任务失败:', e)
  }
})

// 监听 store 变化，自动重置分页
watch(filteredTasks, () => {
  currentPage.value = 1
})
</script>