<template>
  <div class="space-y-4">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon class="w-6 h-6 text-white"><User /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">我的任务</h1>
          <p class="text-gray-500">查看并完成被分派的任务</p>
        </div>
      </div>
    </div>

    <!-- 任务类型标签页筛选 -->
    <TaskFilterTabs
      :task-filter="taskFilter"
      :task-counts="taskCounts"
      :on-filter-change="handleFilterChange"
    />

    <!-- worklog Tab 切换：直接渲染独立的工作日志页 -->
    <WorkLogPage v-if="taskFilter === 'worklog'" />

    <!-- 任务列表（除 worklog 外） -->
    <template v-else>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="overflow-x-auto">
          <table class="min-w-[1200px] w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <!-- 临时任务列头（13 列） -->
                <template v-if="taskFilter === 'temp'">
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">任务编号</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">任务名称</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">类型</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">工作地点</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">负责人</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">开始时间</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">预计结束</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">人工</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">总工时</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">状态</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">紧急程度</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">超时</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">操作</th>
                </template>
                <!-- 巡查反馈列头（14 列） -->
                <template v-else-if="taskFilter === 'problem'">
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">巡查编号</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">巡查类型</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">提交人</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">位置/对象</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">巡查日期</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">巡查结果</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">问题分类</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">严重程度</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">问题照片</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">反馈状态</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">反馈人员</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">处理进度</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">操作</th>
                  <th class="px-3 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">备注</th>
                </template>
                <!-- 农事/全部任务列头（14 列） -->
                <template v-else>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">任务ID</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">任务类型</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">任务区域</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">作物</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">负责人</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">计划开始</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">计划结束</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">任务工时</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">进度</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">优先级</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">状态</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">备注</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">作业标准</th>
                  <th class="px-3 py-3 text-left text-white text-sm font-semibold whitespace-nowrap">操作</th>
                </template>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-if="filteredTasks.length === 0">
                <td :colspan="taskFilter === 'temp' ? 13 : taskFilter === 'problem' ? 14 : 14" class="px-4 py-12 text-center text-gray-400">
                  暂无任务
                </td>
              </tr>
              <tr
                v-for="task in paginatedTasks"
                :key="task.id"
                :class="[
                  'hover:bg-blue-50 transition-colors',
                  task.sourceType === 'tempTask' && task.urgency === 'critical' ? 'bg-red-50' : ''
                ]"
              >
                <ProductionTaskTableRow
                  v-if="taskFilter !== 'temp' && taskFilter !== 'problem'"
                  :task="task"
                  :on-accept="handleAccept"
                  :on-reject="openRejectModal"
                  :on-continue-execution="handleContinueExecution"
                  :on-open-feedback-modal="openFeedbackModal"
                  :on-open-detail-modal="openDetailModal"
                  :on-open-sop-modal="openSopModal"
                />
                <TempTaskTableRow
                  v-else-if="taskFilter === 'temp'"
                  :task="task"
                  :on-accept="handleAccept"
                  :on-reject="openRejectModal"
                  :on-continue-execution="handleContinueExecution"
                  :on-open-feedback-modal="openFeedbackModal"
                  :on-open-detail-modal="openDetailModal"
                />
                <ProblemTaskTableRow
                  v-else-if="taskFilter === 'problem'"
                  :task="task"
                  :unified-tasks="tasks"
                  :accept-task="acceptTask"
                  :on-accept="handleAccept"
                  :on-reject="openRejectModal"
                  :on-continue-execution="handleContinueExecution"
                  :on-open-feedback-modal="openFeedbackModal"
                  :on-open-detail-modal="openDetailModal"
                />
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <TaskPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :total-count="filteredTasks.length"
          :on-page-change="setCurrentPage"
          :on-page-size-change="handlePageSizeChange"
        />
      </div>
    </template>

    <!-- 详情弹窗 -->
    <TaskDetailModal
      :is-open="showDetailModal && !!selectedTask"
      :on-close="closeDetailModal"
      :task="selectedTask"
      :problem-flow-records="currentProblemFlowRecords"
      :operation-records="currentOperationRecords"
      :task-records="currentTaskRecords"
      :get-actual-workload="getActualWorkload"
    />

    <!-- 反馈表单弹窗 -->
    <TaskFeedbackModal
      :is-open="feedbackModal.isOpen"
      :on-close="closeFeedbackModal"
      :task="feedbackModal.task"
      :feedback-form="feedbackForm"
      :set-feedback-form="setFeedbackForm"
      :problem-flow-records="currentFeedbackProblemFlowRecords"
      :validate-required-feedback="validateRequiredFeedback"
      :on-submit="handleSubmitFeedback"
    />

    <!-- 拒绝原因弹窗 -->
    <TaskRejectModal
      :is-open="rejectModal.isOpen"
      :on-close="closeRejectModal"
      :task="rejectModal.task"
      :reject-reason="rejectReason"
      :set-reject-reason="setRejectReason"
      :on-confirm="handleReject"
    />

    <!-- SOP文件查看弹窗 -->
    <TaskSopModal
      :is-open="showSopModal"
      :on-close="closeSopModal"
      :task="selectedSopTask"
    />
  </div>
</template>

<script setup>
/**
 * 我的任务页面
 * 员工查看自己被分派的任务，并完成任务
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/MyTasksPage.tsx (960 行)
 *
 * 核心数据流（与 V1.1 完全一致）：
 * - tasks（useTasks）→ 优先数据源
 * - farmTaskStore.tasks → 降级数据源
 * - 操作记录 → useTasks.taskRecords + useProblemDispatch.problem.flowRecords
 *
 * 6 状态机：pending / accepted / in_progress / waiting_acceptance / completed / rejected
 * 4 Tab：all / production / temp / problem / worklog
 */
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

import { useTasks } from '@/composables/useTasks.js'
import { useFarmTaskStore } from '@/stores/modules/farmTask.js'
import { useProblemStore } from '@/stores/modules/problem.js'
import { useTempTaskStore } from '@/stores/modules/tempTask.js'
import { useInspectionDataStore } from '@/stores/modules/inspectionData.js'

import TaskFilterTabs from './components/myTasks/TaskFilterTabs.vue'
import ProductionTaskTableRow from './components/myTasks/ProductionTaskTableRow.vue'
import TempTaskTableRow from './components/myTasks/TempTaskTableRow.vue'
import ProblemTaskTableRow from './components/myTasks/ProblemTaskTableRow.vue'
import TaskDetailModal from './components/myTasks/TaskDetailModal.vue'
import TaskFeedbackModal from './components/myTasks/TaskFeedbackModal.vue'
import TaskRejectModal from './components/myTasks/TaskRejectModal.vue'
import TaskSopModal from './components/myTasks/TaskSopModal.vue'
import TaskPagination from '@/components/labor/myTasks/TaskPagination.vue'
import WorkLogPage from './components/worklog/WorkLogPage.vue'

import { createEmptyFeedbackForm, createEmptyModalState } from './components/myTasks/types.js'

// ========== Stores & Composables ==========
const {
  tasks: unifiedTasks,
  updateTaskStatus,
  updateTaskProgress,
  submitProgress,
  acceptTask,
  rejectByExecutor,
  continueExecution,
  getTaskRecordsByTaskId,
} = useTasks()
const farmTaskStore = useFarmTaskStore()
const problemStore = useProblemStore()
const tempTaskStore = useTempTaskStore()
const inspectionDataStore = useInspectionDataStore()

// 强制刷新 key（与 V1.1 一致）
const refreshKey = ref(0)

// 当前用户名（原型阶段默认使用陆启闯）
const currentUserName = ref('陆启闯')

// ========== 任务数据映射（unifiedTasks 优先，farmTaskStore 降级）==========
const myTasks = computed(() => {
  if (unifiedTasks.value && unifiedTasks.value.length > 0) {
    return unifiedTasks.value.map(t => ({
      id: t.id,
      taskCode: t.taskCode || t.id,
      title: t.title || '',
      types: t.types || [],
      typeLabel: t.typeName || '',
      typeName: t.typeName || '',
      field: t.field || t.greenhouseName || '',
      crop: t.crop || t.cropName || '',
      assignee: t.assigneeName || t.assignee || '',
      assigneeName: t.assigneeName || t.assignee || '',
      assigneeId: t.assigneeId || '',
      planStart: t.planStart || '',
      planEnd: t.planEnd || '',
      progress: t.progress || 0,
      status: t.status,
      priority: t.priority || 'normal',
      estimatedDays: t.estimatedDays || 0,
      estimatedHours: t.estimatedHours || 0,
      dueDate: t.dueDate || '',
      startDate: t.startDate || '',
      requiredFeedback: Array.isArray(t.requiredFeedback)
        ? t.requiredFeedback
        : (Array.isArray(t.feedbackRequirements)
            ? t.feedbackRequirements.map(f => typeof f === 'string' ? f : (f?.type || ''))
            : []),
      feedbackRequirements: t.feedbackRequirements || [],
      remarks: t.remarks || '',
      typeConfig: t.typeConfig || {},
      sopContent: t.sopContent || '',
      materials: t.materials || [],
      tools: t.tools || [],
      sourceProblemId: t.sourceProblemId,
      sourceInspectionId: t.sourceInspectionId,
      sourceType: t.sourceType,
      dispatchMode: t.dispatchMode,
      workLocation: t.workLocation || '',
      urgency: t.urgency || 'normal',
      tempTaskType: t.tempTaskType || '',
      workerCount: t.workerCount || 1,
      totalEstimatedHours: t.totalEstimatedHours || 0,
      sourceId: t.sourceId,
      recordCode: t.recordCode,
      inspectionType: t.inspectionType || 'farm',
      submitterId: t.submitterId,
      submitterName: t.submitterName || t.assignerName || '',
      location: t.location || t.greenhouseName || t.field || '',
      checkDate: t.checkDate || (t.planStart ? t.planStart.split(' ')[0] : ''),
      checkTime: t.checkTime || '',
      checkResult: t.checkResult || '',
      issueCategories: t.issueCategories || [],
      issueSeverity: t.issueSeverity || '',
      issueText: t.issueText || '',
      photos: t.photos || [],
      feedbackStatus: t.feedbackStatus || t.status,
      feedbackUsers: t.feedbackUsers || [],
      processProgress: t.processProgress || t.progress || 0,
      inspectorId: t.inspectorId,
      inspectorName: t.inspectorName || t.assignerName || '',
      createdAt: t.createdAt || '',
    }))
  }
  // 降级：farmTaskStore
  return farmTaskStore.tasks.map(t => ({
    id: t.id,
    taskCode: t.taskCode || t.id,
    title: t.title || '',
    types: [],
    typeLabel: t.typeName || '',
    typeName: t.typeName || '',
    field: t.greenhouseName || t.field || '',
    crop: t.cropName || t.crop || '',
    assignee: t.assigneeName || t.assignee || '',
    assigneeName: t.assigneeName || t.assignee || '',
    assigneeId: t.assigneeId || '',
    planStart: t.planStart || t.startTime || '',
    planEnd: t.planEnd || t.dueDate || '',
    progress: t.progress || 0,
    status: t.status,
    priority: t.priority || 'normal',
    estimatedDays: t.estimatedDays || 0,
    estimatedHours: t.estimatedHours || 0,
    dueDate: t.dueDate || '',
    startDate: t.startTime || '',
    requiredFeedback: Array.isArray(t.feedbackRequirements)
      ? t.feedbackRequirements.map(f => typeof f === 'string' ? f : (f?.type || ''))
      : [],
    feedbackRequirements: t.feedbackRequirements || [],
    remarks: t.remarks || '',
    typeConfig: t.typeConfig || {},
    sopContent: t.sopContent || '',
    materials: t.materials || [],
    tools: t.tools || [],
    sourceProblemId: t.sourceProblemId,
    sourceInspectionId: t.sourceInspectionId,
    sourceType: t.sourceType,
    workLocation: t.greenhouseName || '',
    urgency: t.priority || 'normal',
    tempTaskType: '',
    workerCount: 1,
    totalEstimatedHours: t.estimatedHours || 0,
    sourceId: t.sourceInspectionId,
    recordCode: '',
    inspectionType: 'farm',
    submitterId: t.assignerId,
    submitterName: t.assignerName || '',
    location: t.greenhouseName || t.field || '',
    checkDate: t.planStart ? t.planStart.split(' ')[0] || '' : '',
    checkTime: '',
    checkResult: '',
    issueCategories: [],
    issueSeverity: '',
    issueText: '',
    photos: [],
    feedbackStatus: t.status,
    feedbackUsers: [],
    processProgress: t.progress || 0,
    inspectorId: '',
    inspectorName: t.assignerName || '',
    createdAt: t.createdAt || '',
  }))
})

// ========== 筛选状态 ==========
const taskFilter = ref('all')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤后的任务（按 taskFilter）
const filteredTasks = computed(() => {
  // 排序函数：按创建时间倒序
  const sortByCreatedAt = (a, b) => {
    const getTime = (task) => {
      const ts = task.createdAt || task.planStart || task.startDate || ''
      if (!ts) return 0
      const d = new Date(ts)
      return isNaN(d.getTime()) ? 0 : d.getTime()
    }
    return getTime(b) - getTime(a)
  }

  // 临时任务单独排序（按 startDate 倒序）
  const sortTempByStartDate = (a, b) => {
    const getTime = (task) => {
      const ts = task.startDate || task.planStart || ''
      if (!ts) return 0
      const d = new Date(ts)
      return isNaN(d.getTime()) ? 0 : d.getTime()
    }
    return getTime(b) - getTime(a)
  }

  if (taskFilter.value === 'problem') {
    return myTasks.value
      .filter(task => {
        const dm = task.dispatchMode
        if (dm === 'problem' || dm === 'inspection') return true
        if (task.sourceProblemId !== undefined || task.sourceInspectionId !== undefined) return true
        return false
      })
      .sort(sortByCreatedAt)
  }
  if (taskFilter.value === 'production') {
    return myTasks.value
      .filter(task => {
        if (!task.taskCode || !task.taskCode.startsWith('NS')) return false
        const dm = task.dispatchMode
        if (dm === 'problem' || dm === 'inspection' || dm === 'tempTask') return false
        if (task.sourceType === 'tempTask') return false
        if (task.sourceProblemId !== undefined) return false
        return true
      })
      .sort(sortByCreatedAt)
  }
  if (taskFilter.value === 'temp') {
    return myTasks.value
      .filter(task => {
        if (!task.taskCode || !task.taskCode.startsWith('TT')) return false
        if (task.status === 'draft') return false
        return task.sourceType === 'tempTask' || task.dispatchMode === 'tempTask'
      })
      .sort(sortTempByStartDate)
  }
  // all
  return [...myTasks.value].sort(sortByCreatedAt)
})

// 分页
const totalPages = computed(() => Math.ceil(filteredTasks.value.length / pageSize.value) || 1)
const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = Math.min(start + pageSize.value, filteredTasks.value.length)
  return filteredTasks.value.slice(start, end)
})

// 各类型任务数量
const taskCounts = computed(() => ({
  all: myTasks.value.length,
  problem: myTasks.value.filter(t => t.sourceProblemId !== undefined).length,
  production: myTasks.value.filter(t => !t.sourceProblemId && t.sourceType !== 'tempTask').length,
  temp: myTasks.value.filter(t => t.sourceType === 'tempTask').length,
}))

// ========== 详情弹窗状态 ==========
const selectedTask = ref(null)
const showDetailModal = ref(false)
const showSopModal = ref(false)
const selectedSopTask = ref(null)

function openDetailModal(task) {
  selectedTask.value = task
  showDetailModal.value = true
}
function closeDetailModal() {
  showDetailModal.value = false
  selectedTask.value = null
}

// ========== 反馈弹窗状态 ==========
const feedbackModal = ref(createEmptyModalState())
const feedbackForm = ref(createEmptyFeedbackForm())

function openFeedbackModal(task) {
  feedbackModal.value = { isOpen: true, task }
  feedbackForm.value = {
    ...createEmptyFeedbackForm(),
    progress: task.progress || 0,
  }
  showDetailModal.value = false
}
function closeFeedbackModal() {
  feedbackModal.value = createEmptyModalState()
}
function setFeedbackForm(formOrUpdater) {
  if (typeof formOrUpdater === 'function') {
    feedbackForm.value = formOrUpdater(feedbackForm.value)
  } else {
    feedbackForm.value = formOrUpdater
  }
}

// ========== 拒绝弹窗状态 ==========
const rejectModal = ref(createEmptyModalState())
const rejectReason = ref('')

function openRejectModal(task) {
  rejectModal.value = { isOpen: true, task }
  rejectReason.value = ''
}
function closeRejectModal() {
  rejectModal.value = createEmptyModalState()
  rejectReason.value = ''
}
function setRejectReason(reason) {
  rejectReason.value = reason
}

// ========== SOP 弹窗 ==========
function openSopModal(task, e) {
  if (e && e.stopPropagation) e.stopPropagation()
  selectedSopTask.value = task
  showSopModal.value = true
}
function closeSopModal() {
  showSopModal.value = false
  selectedSopTask.value = null
}

// ========== 任务操作：接受 / 拒绝 / 开始 / 完成 / 继续 ==========

/**
 * 接受任务：pending → accepted（同时联动 problemStore 与 unifiedTasks）
 */
function handleAccept(task) {
  // 联动：问题处理接单
  if (task.sourceProblemId) {
    problemStore.acceptProblem?.(task.sourceProblemId, 'U013', currentUserName.value)
  }
  const unifiedTask = unifiedTasks.value.find(t => t.taskCode === task.id || t.id === task.id)
  if (unifiedTask) {
    acceptTask(unifiedTask.id)
  }
  showDetailModal.value = false
}

/**
 * 拒绝任务：pending → rejected（执行人拒绝）
 */
function handleReject() {
  if (!rejectModal.value.task || !rejectReason.value.trim()) return
  const task = rejectModal.value.task
  if (task.sourceProblemId) {
    problemStore.rejectProblem?.(task.sourceProblemId, 'U013', currentUserName.value, rejectReason.value)
  }
  const unifiedTask = unifiedTasks.value.find(t => t.taskCode === task.id || t.id === task.id)
  if (unifiedTask) {
    rejectByExecutor(unifiedTask.id, rejectReason.value, unifiedTask.assigneeId, unifiedTask.assigneeName)
  }
  rejectModal.value = createEmptyModalState()
  rejectReason.value = ''
  showDetailModal.value = false
  ElMessage.success('已拒绝任务，将通知管理员重新分派')
}

/**
 * 开始执行：accepted → in_progress
 */
function handleStartProcessing(task) {
  const unifiedTask = unifiedTasks.value.find(t => t.taskCode === task.id || t.id === task.id)
  if (unifiedTask) {
    updateTaskStatus(unifiedTask.id, 'in_progress')
  }
  showDetailModal.value = false
}

/**
 * 继续执行：rejected → in_progress
 */
function handleContinueExecution(task) {
  const unifiedTask = unifiedTasks.value.find(t => t.taskCode === task.id || t.id === task.id)
  if (unifiedTask) {
    continueExecution(unifiedTask.id)
  }
  refreshKey.value++
  ElMessage.success('已恢复任务执行')
}

/**
 * 确认完成：进度 100% → completed
 */
function handleConfirmComplete(task) {
  const unifiedTask = unifiedTasks.value.find(t => t.taskCode === task.id || t.id === task.id)
  if (unifiedTask) {
    updateTaskProgress(unifiedTask.id, 100)
    updateTaskStatus(unifiedTask.id, 'completed')
  }
  showDetailModal.value = false
  selectedTask.value = null
  ElMessage.success('任务已完成')
}

/**
 * 更新任务进度（100% 时不自动完成，需提交反馈）
 */
function handleProgressChange(taskId, progress) {
  const unifiedTask = unifiedTasks.value.find(t => t.taskCode === taskId || t.id === taskId)
  if (unifiedTask) {
    updateTaskProgress(unifiedTask.id, progress)
  }
  if (selectedTask.value && selectedTask.value.id === taskId) {
    selectedTask.value = { ...selectedTask.value, progress }
  }
}

// ========== 校验必填反馈 ==========
function validateRequiredFeedback() {
  if (!feedbackModal.value.task?.requiredFeedback || feedbackModal.value.task.requiredFeedback.length === 0) {
    return { valid: true, message: '' }
  }
  const required = feedbackModal.value.task.requiredFeedback
  const { workloadConfirm, gpsLocation, photosBefore, photosAfter, materialCode, voiceNote } = feedbackForm.value

  if (required.includes('workload_confirm') && !workloadConfirm) {
    return { valid: false, message: '请确认工作量' }
  }
  if (required.includes('gps') && !gpsLocation) {
    return { valid: false, message: '请完成位置打卡' }
  }
  if (required.includes('photo_before') && (!photosBefore || photosBefore.length === 0)) {
    return { valid: false, message: '请上传作业前照片' }
  }
  if (required.includes('photo_after') && (!photosAfter || photosAfter.length === 0)) {
    return { valid: false, message: '请上传作业后照片' }
  }
  if (required.includes('material') && !materialCode) {
    return { valid: false, message: '请扫码或输入物资编码' }
  }
  if (required.includes('voice') && !voiceNote) {
    return { valid: false, message: '请录制语音备注' }
  }
  return { valid: true, message: '' }
}

/**
 * 提交反馈
 */
function handleSubmitFeedback() {
  try {
    if (!feedbackModal.value.task) {
      return
    }
    const task = feedbackModal.value.task

    // 处理"无法继续"模式
    if (feedbackForm.value.cannotContinue && feedbackForm.value.cannotContinueReason.trim()) {
      const unifiedTask = unifiedTasks.value.find(t => t.taskCode === task.id || t.id === task.id)
      if (unifiedTask) {
        rejectByExecutor(
          unifiedTask.id,
          feedbackForm.value.cannotContinueReason,
          unifiedTask.assigneeId,
          unifiedTask.assigneeName,
        )
        if (task.sourceProblemId) {
          problemStore.rejectProblem?.(task.sourceProblemId, 'U013', currentUserName.value, feedbackForm.value.cannotContinueReason)
        }
      }
      feedbackModal.value = createEmptyModalState()
      ElMessage.success('已提交无法继续反馈，任务将重新分派')
      return
    }

    // 校验必填反馈
    const validation = validateRequiredFeedback()
    if (!validation.valid) {
      ElMessage.warning(validation.message)
      return
    }

    const unifiedTask = unifiedTasks.value.find(t => t.taskCode === task.id || t.id === task.id)
    if (unifiedTask) {
      const isFinal = feedbackForm.value.progress === 100
      submitProgress(unifiedTask.id, feedbackForm.value.progress, {
        remarks: feedbackForm.value.resultText || feedbackForm.value.progressText,
        workload: feedbackForm.value.workloadConfirm
          ? (feedbackForm.value.workloadConfirm.days * 24 + feedbackForm.value.workloadConfirm.hours)
          : (feedbackForm.value.workloadHours ? parseFloat(feedbackForm.value.workloadHours) : undefined),
        isFinal,
        gpsLocation: feedbackForm.value.gpsLocation || undefined,
        photosBefore: feedbackForm.value.photosBefore.length > 0 ? feedbackForm.value.photosBefore : undefined,
        photosAfter: feedbackForm.value.photosAfter.length > 0 ? feedbackForm.value.photosAfter : undefined,
        voiceNote: feedbackForm.value.voiceNote || undefined,
        materialCode: feedbackForm.value.materialCode || undefined,
        workloadDays: feedbackForm.value.workloadConfirm?.days,
        workloadHours: feedbackForm.value.workloadConfirm?.hours,
        workers: feedbackForm.value.workloadConfirm?.workers,
      })
    }

    feedbackModal.value = createEmptyModalState()
    ElMessage.success('提交成功！')
  } catch (err) {
    ElMessage.error('提交失败：' + (err?.message || String(err)))
  }
}

// ========== 流转记录查询 ==========
function getCurrentProblemFlowRecords() {
  if (!selectedTask.value?.sourceProblemId) return []
  const problem = problemStore.problems?.find?.(p => p.id === selectedTask.value.sourceProblemId)
  return problem?.flowRecords || []
}
const currentProblemFlowRecords = computed(() => getCurrentProblemFlowRecords())

function getCurrentOperationRecords() {
  if (!selectedTask.value) return []
  // V2.0 暂无独立 operationRecord store，从 problemStore + farmTaskStore 中提取
  const records = []
  if (selectedTask.value.sourceProblemId) {
    const problem = problemStore.problems?.find?.(p => p.id === selectedTask.value.sourceProblemId)
    if (problem && problem.flowRecords) {
      problem.flowRecords.forEach(r => {
        records.push({
          operationTypeName: r.action,
          operationType: r.action,
          operatorName: r.operatorName,
          operatorId: r.operatorId,
          operationDate: r.actionTime,
          status: r.toStatus,
          remarks: r.comment || '',
          rejectReason: r.action === 'reject' ? r.comment : '',
        })
      })
    }
  }
  return records
}
const currentOperationRecords = computed(() => getCurrentOperationRecords())

function getCurrentTaskRecords() {
  if (!selectedTask.value) return []
  const unifiedTask = unifiedTasks.value.find(t => t.taskCode === selectedTask.value.id || t.id === selectedTask.value.id)
  if (!unifiedTask) return []
  return getTaskRecordsByTaskId(unifiedTask.id) || []
}
const currentTaskRecords = computed(() => getCurrentTaskRecords())

// 反馈弹窗中的问题流转记录
const currentFeedbackProblemFlowRecords = computed(() => {
  if (!feedbackModal.value.task?.sourceProblemId) return []
  const problem = problemStore.problems?.find?.(p => p.id === feedbackModal.value.task.sourceProblemId)
  return problem?.flowRecords || []
})

// ========== 实际完成工作量 ==========
function getActualWorkload() {
  const records = currentTaskRecords.value || []
  let totalDays = 0
  let totalHours = 0
  let totalWorkers = 0
  let recordCount = 0

  records.forEach(record => {
    if (record.feedback) {
      if (record.feedback.workloadDays) {
        totalDays += record.feedback.workloadDays
        recordCount++
      }
      if (record.feedback.workloadHours) {
        totalHours += record.feedback.workloadHours
        recordCount++
      }
      if (record.feedback.workers && record.feedback.workers > totalWorkers) {
        totalWorkers = record.feedback.workers
      }
    }
  })

  if (recordCount === 0 && selectedTask.value?.progress && selectedTask.value.progress > 0) {
    const estimatedTotal = ((selectedTask.value.estimatedDays || 0) * 8 + (selectedTask.value.estimatedHours || 0))
    if (estimatedTotal > 0) {
      totalHours = Math.round(estimatedTotal * (selectedTask.value.progress / 100) * 10) / 10
    }
  }
  return { days: totalDays, hours: totalHours, workers: totalWorkers }
}

// ========== Tab 切换 / 分页 ==========
function handleFilterChange(filter) {
  taskFilter.value = filter
  currentPage.value = 1
}
function setCurrentPage(page) {
  currentPage.value = page
}
function handlePageSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

// ========== 初始化：拉取所有 Store 数据 ==========
onMounted(() => {
  // 触发各 Store 加载（与 V1.1 useTasks 初始化一致）
  if (farmTaskStore.tasks.length === 0) {
    farmTaskStore.fetchTasks?.()
  }
  tempTaskStore.fetchTasks?.()
  inspectionDataStore.fetchRecords?.()
  problemStore.fetchProblems?.()
})

// ========== 监听任务变化触发刷新 ==========
watch(() => unifiedTasks.value?.length, () => {
  refreshKey.value++
})
</script>