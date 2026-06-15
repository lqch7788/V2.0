<template>
  <!-- 农事任务中心 - FarmTaskHub 主页面，与V1.1 FarmTaskHub.tsx 逻辑完全一致 -->
  <div class="space-y-6 p-6">
    <!-- 顶部统计看板 -->
    <FarmHubHeader :stats="hubStats" />

    <!-- Tab切换区域 -->
    <div class="bg-white rounded-xl shadow-sm">
      <!-- Tab 头部 -->
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px gap-1 px-2">
          <button
            v-for="tab in TAB_CONFIG"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-6 py-3 text-base rounded-t-lg transition-all',
              getTabStyle(tab.key),
            ]"
          >
            {{ tab.label }}
            <span
              :class="[
                'ml-2 px-2 py-0.5 text-xs rounded-full font-medium',
                activeTab === tab.key ? 'bg-white/30' : 'bg-gray-200 text-gray-600',
              ]"
            >
              {{ getTabCount(tab.key) }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Tab内容 -->
      <div class="p-4">
        <!-- 农事任务Tab -->
        <div v-if="activeTab === 'task'" key="task-content">
          <TaskTab
            :tasks="filteredTasks"
            :stats="taskStats"
            :selected-ids="selectedIds"
            :filters="taskFilters"
            :on-toggle-select="handleToggleSelect"
            :on-select-all="handleSelectAll"
            :on-clear-selection="handleClearSelection"
            :on-filter-change="handleTaskFilterChange"
            :on-reset-filters="handleResetTaskFilters"
            :on-view-task="handleViewTaskDetail"
            :on-view-task-in-calendar="handleViewTaskInCalendar"
            :on-create="() => showCreateModal = true"
            :on-withdraw="handleTaskWithdraw"
            :on-cancel="handleTaskCancel"
            :on-reassign="handleTaskReassign"
            :on-overtime="handleTaskOvertime"
            :on-continue="handleTaskContinue"
            :on-accept="handleTaskAccept"
            :on-remind="handleTaskRemind"
            :can-remind="canRemind"
            :on-select-executor="handleSelectExecutor"
            :on-publish="handlePublish"
            :on-view-sop="handleViewSop"
            :on-batch-dispatch="handleBatchDispatch"
            :on-batch-verify="handleBatchVerify"
            :on-batch-delete="handleBatchDelete"
            :on-batch-edit="handleBatchEdit"
            :on-import="() => showImportModal = true"
            :on-export="handleExport"
            :on-batch-reassign="handleBatchReassign"
          />
        </div>

        <!-- 巡查记录Tab -->
        <div v-if="activeTab === 'inspection'" key="inspection-content">
          <InspectionTab
            v-if="showInspectionTab"
            :inspections="inspections"
            :stats="inspectionStats"
            :filters="inspectionFilters"
            :current-page="inspectionPage"
            :page-size="inspectionPageSize"
            :export-mode="inspectionExportMode"
            :batch-edit-mode="inspectionBatchEditMode"
            :batch-delete-mode="inspectionBatchDeleteMode"
            :selected-rows="inspectionSelectedRows"
            :detail-record-id="inspectionDetailId"
            :is-create-modal-open="isInspectionCreateOpen"
            :problems="problems"
            @filter-change="handleInspectionFilterChange"
            @reset-filters="handleResetInspectionFilters"
            @page-change="handleInspectionPageChange"
            @page-size-change="handleInspectionPageSizeChange"
            @toggle-export-mode="inspectionExportMode = !inspectionExportMode"
            @toggle-batch-edit-mode="inspectionBatchEditMode = !inspectionBatchEditMode"
            @toggle-batch-delete-mode="inspectionBatchDeleteMode = !inspectionBatchDeleteMode"
            @toggle-select-row="handleInspectionToggleRow"
            @select-all="handleInspectionSelectAll"
            @clear-selection="inspectionSelectedRows = []"
            @view-detail="handleViewInspectionDetail"
            @close-detail="inspectionDetailId = null"
            @open-create-modal="isInspectionCreateOpen = true"
            @close-create-modal="isInspectionCreateOpen = false"
            @report-problem="handleInspectionReportProblem"
            @accept-problem="handleInspectionAcceptProblem"
            @batch-delete="handleInspectionBatchDelete"
            @batch-edit="handleInspectionBatchEdit"
          />
          <div v-else class="text-center py-12 text-gray-400">巡查记录加载中...</div>
        </div>

        <!-- 问题管理Tab -->
        <div v-if="activeTab === 'problem'" key="problem-content">
          <ProblemTab
            v-if="showProblemTab"
            :stats="problemStats"
            :external-tasks="tasks"
            @problem-dispatched="handleProblemDispatched"
          />
          <div v-else class="text-center py-12 text-gray-400">问题管理加载中...</div>
        </div>

        <!-- 临时任务Tab -->
        <div v-if="activeTab === 'tempTask'" key="tempTask-content">
          <TempTaskTab />
        </div>
      </div>
    </div>

    <!-- 今日操作记录 -->
    <TodayOperationRecords
      :records="recentRecords"
      :on-show-all="() => showRecordPanel = true"
    />

    <!-- 操作记录面板（全屏弹窗） -->
    <OperationRecordPanel
      v-if="showRecordPanel"
      :records="recentRecords"
      @close="showRecordPanel = false"
    />

    <!-- ========== 弹窗区域 ========== -->

    <!-- 任务详情弹窗 -->
    <TaskDetailModal
      v-if="detailTaskId"
      :is-open="!!detailTaskId"
      :task="detailTask"
      :records="detailTaskRecords"
      :on-close="() => { detailTaskId = null; detailTaskRecords = [] }"
      @verify="handleTaskVerifyFromDetail"
    />

    <!-- 验收弹窗 -->
    <TaskAcceptanceModal
      v-if="verifyTaskId"
      :is-open="!!verifyTaskId"
      :task="verifyTask"
      :task-records="verifyTaskRecords"
      :on-accept="handleAcceptVerify"
      :on-reject="handleRejectVerify"
      :on-close="() => { verifyTaskId = null; verifyTaskRecords = [] }"
    />

    <!-- 新建任务弹窗 -->
    <CreateTaskModal
      v-if="showCreateModal"
      :is-open="showCreateModal"
      :tasks-hook="tasksHookProxy"
      :on-close="() => showCreateModal = false"
      :on-created="handleTaskCreated"
    />

    <!-- 选择执行人弹窗 -->
    <SelectExecutorModal
      v-if="selectExecutorTask"
      :is-open="!!selectExecutorTask"
      :task="selectExecutorTask"
      :on-confirm="handleConfirmSelectExecutor"
      :on-close="() => selectExecutorTask = null"
    />

    <!-- 撤回弹窗 -->
    <WithdrawCancelModal
      v-if="withdrawTask"
      :is-open="!!withdrawTask"
      :task="withdrawTask"
      type="withdraw"
      :on-confirm="handleWithdrawConfirm"
      :on-close="() => withdrawTask = null"
    />

    <!-- 取消弹窗 -->
    <WithdrawCancelModal
      v-if="cancelTask"
      :is-open="!!cancelTask"
      :task="cancelTask"
      type="cancel"
      :on-confirm="handleCancelConfirm"
      :on-close="() => cancelTask = null"
    />

    <!-- 重新派发弹窗 -->
    <ReassignTaskModal
      v-if="reassignTask"
      :is-open="!!reassignTask"
      :task="reassignTask"
      :on-confirm="handleReassignConfirm"
      :on-close="() => reassignTask = null"
    />

    <!-- 超时处理弹窗 -->
    <OvertimeHandleModal
      v-if="overtimeTask"
      :is-open="!!overtimeTask"
      :task="overtimeTask"
      :timeout="overtimeTimeout"
      :on-continue="handleOvertimeContinue"
      :on-abandon="handleOvertimeAbandon"
      :on-close="() => overtimeTask = null"
    />

    <!-- 问题分派弹窗 -->
    <ProblemDispatchModal
      v-if="dispatchProblemId"
      :problem-id="dispatchProblemId"
      @close="dispatchProblemId = null"
      @dispatched="handleProblemDispatched"
    />

    <!-- 巡查详情弹窗 -->
    <InspectionDetailModal
      v-if="detailInspectionId"
      :record-id="detailInspectionId"
      @close="detailInspectionId = null"
      @report-problem="handleInspectionReportProblemFromDetail"
    />

    <!-- 批量导入弹窗 -->
    <BatchImportModal
      :is-open="showImportModal"
      @close="showImportModal = false"
      @import="handleBatchImport"
    />

    <!-- 批量操作内联弹窗（与V1.1样式一致：渐变头部） -->
    <!-- 批量派发 - 选择执行人 -->
    <el-dialog v-model="showBatchDispatchModal" width="480px" destroy-on-close class="farm-modal">
      <template #header>
        <div class="farm-modal-header">
          <span class="text-white text-lg font-semibold">批量派发任务</span>
        </div>
      </template>
      <p class="text-sm text-gray-500 mb-4">
        将为选中的 <span class="font-medium text-gray-700">{{ batchDispatchTaskIds.length }}</span> 个待派工任务统一指派执行人
      </p>
      <el-select v-model="batchDispatchTarget" placeholder="-- 请选择执行人 --" style="width: 100%" filterable>
        <el-option v-for="s in staffOptions" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <template #footer>
        <el-button @click="showBatchDispatchModal = false">取消</el-button>
        <el-button type="primary" :disabled="!batchDispatchTarget" @click="confirmBatchDispatch">确认派发</el-button>
      </template>
    </el-dialog>

    <!-- 批量验收确认 -->
    <el-dialog v-model="showBatchVerifyConfirm" width="480px" destroy-on-close class="farm-modal">
      <template #header>
        <div class="farm-modal-header">
          <span class="text-white text-lg font-semibold">批量验收通过</span>
        </div>
      </template>
      <p class="text-sm text-gray-500 mb-2">即将对选中的 <span class="font-medium text-gray-700">{{ batchVerifyTaskIds.length }}</span> 个任务全部标记为"验收通过"</p>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p class="text-xs text-yellow-700">此操作将批量通过验收，任务状态将变为"已完成"</p>
      </div>
      <template #footer>
        <el-button @click="showBatchVerifyConfirm = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchVerify">确认批量验收</el-button>
      </template>
    </el-dialog>

    <!-- 批量重派 - 选择新执行人 -->
    <el-dialog v-model="showBatchReassignModal" width="480px" destroy-on-close class="farm-modal">
      <template #header>
        <div class="farm-modal-header">
          <span class="text-white text-lg font-semibold">批量重新派发</span>
        </div>
      </template>
      <p class="text-sm text-gray-500 mb-4">
        将为选中的 <span class="font-medium text-gray-700">{{ batchReassignTaskIds.length }}</span> 个失败/放弃任务统一更换执行人
      </p>
      <el-select v-model="batchReassignTarget" placeholder="-- 请选择新执行人 --" style="width: 100%" filterable>
        <el-option v-for="s in staffOptions" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <template #footer>
        <el-button @click="showBatchReassignModal = false">取消</el-button>
        <el-button type="primary" :disabled="!batchReassignTarget" @click="confirmBatchReassign">确认重派</el-button>
      </template>
    </el-dialog>

    <!-- 批量删除确认弹窗 -->
    <el-dialog v-model="showBatchDeleteConfirm" width="420px" destroy-on-close class="farm-modal">
      <template #header>
        <div class="farm-modal-header bg-gradient-to-r from-red-600 to-red-500">
          <span class="text-white text-lg font-semibold">批量删除</span>
        </div>
      </template>
      <p class="text-sm text-gray-600">确定要删除选中的 <span class="font-medium text-red-600">{{ batchDeleteIds.length }}</span> 个任务吗？此操作不可撤销。</p>
      <template #footer>
        <el-button @click="showBatchDeleteConfirm = false">取消</el-button>
        <el-button type="danger" :loading="batchDeleteLoading" @click="confirmBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出弹窗 -->
    <el-dialog v-model="showExportDialog" width="420px" destroy-on-close class="farm-modal">
      <template #header>
        <div class="farm-modal-header">
          <span class="text-white text-lg font-semibold">导出任务</span>
        </div>
      </template>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat" class="flex flex-col gap-2">
          <el-radio value="excel" border>Excel 文件 (.xls)</el-radio>
          <el-radio value="csv" border>CSV 文件 (.csv)</el-radio>
          <el-radio value="word" border>Word 文件 (.doc)</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" :disabled="exportIds.length === 0" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="showBatchEditModal" width="480px" destroy-on-close class="farm-modal">
      <template #header>
        <div class="farm-modal-header">
          <span class="text-white text-lg font-semibold">批量编辑</span>
        </div>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-gray-500">为选中的 <span class="font-medium text-gray-700">{{ batchEditIds.length }}</span> 个任务统一修改以下字段（留空则不修改）</p>
        <el-form label-width="80px">
          <el-form-item label="优先级">
            <el-select v-model="batchEditForm.priority" placeholder="不修改" clearable style="width: 100%">
              <el-option label="普通" value="normal" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </el-form-item>
          <el-form-item label="任务类型">
            <el-select v-model="batchEditForm.type" placeholder="不修改" clearable style="width: 100%">
              <el-option v-for="t in TASK_TYPES" :key="t.type" :label="t.name" :value="t.type" />
            </el-select>
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker v-model="batchEditForm.dueDate" type="date" placeholder="不修改" style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchEdit">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- SOP内容弹窗 -->
    <el-dialog v-model="showSopModal" width="640px" destroy-on-close class="farm-modal">
      <template #header>
        <div class="farm-modal-header">
          <span class="text-white text-lg font-semibold">作业标准 (SOP)</span>
        </div>
      </template>
      <pre class="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">{{ selectedSopContent || '暂无作业标准内容' }}</pre>
      <template #footer>
        <el-button @click="showSopModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 农事任务中心主页面 - 从V1.1 FarmTaskHub.tsx 1:1迁移
 * 集成所有子组件、弹窗和操作逻辑
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useFarmTaskStore } from '@/stores/modules/farmTask'
import { useUserStore } from '@/stores/modules/user'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useTempTaskStore } from '@/stores/modules/tempTask'
import { useTasks } from '@/composables/useTasks'

// ========== 导入所有子组件 ==========
import FarmHubHeader from '@/components/farm/hub/FarmHubHeader.vue'
import TaskTab from '@/components/farm/hub/TaskTab.vue'
import ProblemTab from '@/components/farm/hub/ProblemTab.vue'
import InspectionTab from '@/components/farm/hub/InspectionTab.vue'
import OperationRecordPanel from '@/components/farm/hub/OperationRecordPanel.vue'
import TodayOperationRecords from '@/components/farm/hub/TodayOperationRecords.vue'
import TaskDetailModal from '@/components/farm/hub/TaskDetailModal.vue'
import TaskAcceptanceModal from '@/components/farm/hub/TaskAcceptanceModal.vue'
import CreateTaskModal from '@/components/farm/hub/CreateTaskModal.vue'
import SelectExecutorModal from '@/components/farm/hub/SelectExecutorModal.vue'
import WithdrawCancelModal from '@/components/farm/hub/WithdrawCancelModal.vue'
import ReassignTaskModal from '@/components/farm/hub/ReassignTaskModal.vue'
import OvertimeHandleModal from '@/components/farm/hub/OvertimeHandleModal.vue'
import ProblemDispatchModal from '@/components/farm/hub/ProblemDispatchModal.vue'
import InspectionDetailModal from '@/components/farm/hub/InspectionDetailModal.vue'
import BatchImportModal from '@/components/farm/hub/BatchImportModal.vue'
import TempTaskTab from '@/components/farm/hub/TempTaskTab.vue'

// ========== Stores ==========
const taskStore = useFarmTaskStore()
const userStore = useUserStore()
const greenhouseStore = useGreenhouseStore()

// ========== useTasks 业务逻辑层（与V1.1 useTasks 完全一致） ==========
const tasksHook = useTasks()

// ========== Tab配置（与V1.1完全一致） ==========
const TAB_CONFIG = [
  { key: 'task', label: '农事任务' },
  { key: 'tempTask', label: '临时任务' },
  { key: 'inspection', label: '巡查记录' },
  { key: 'problem', label: '问题管理' },
]

// ========== 核心状态 ==========
const activeTab = ref('task')
const showRecordPanel = ref(false)

// 任务数据 - 从Store获取
const tasks = computed(() => taskStore.tasks || [])

// 巡查/问题数据 - 本地状态（后续对接Store）
const inspections = ref([])
const problems = ref([])
const showInspectionTab = ref(true)
const showProblemTab = ref(true)

// ========== 任务筛选（与V1.1结构完全一致） ==========
const taskFilters = reactive({
  status: 'all',
  type: 'all',
  area: 'all',
  search: '',
  assignee: 'all',
  batchCode: 'all',
})

const selectedIds = ref([])

// 任务预筛选（与V1.1 hub.getFilteredTasks()逻辑一致）
const filteredTasks = computed(() => {
  let list = tasks.value
  if (taskFilters.status !== 'all') list = list.filter(t => t.status === taskFilters.status)
  if (taskFilters.type !== 'all') list = list.filter(t => t.type === taskFilters.type)
  if (taskFilters.area !== 'all') list = list.filter(t => t.greenhouseName === taskFilters.area)
  if (taskFilters.assignee !== 'all') list = list.filter(t => t.assigneeName === taskFilters.assignee)
  if (taskFilters.batchCode !== 'all') list = list.filter(t => t.batchCode === taskFilters.batchCode)
  // 搜索维度（与V1.1一致：搜索任务编号/标题/执行人）
  if (taskFilters.search && taskFilters.search.trim()) {
    const keyword = taskFilters.search.trim().toLowerCase()
    list = list.filter(t =>
      (t.taskCode && t.taskCode.toLowerCase().includes(keyword)) ||
      (t.title && t.title.toLowerCase().includes(keyword)) ||
      (t.assigneeName && t.assigneeName.toLowerCase().includes(keyword))
    )
  }
  return list
})

// 任务统计
const taskStats = computed(() => ({
  total: tasks.value.length,
  pending: tasks.value.filter(t => t.status === 'pending').length,
  accepted: tasks.value.filter(t => t.status === 'accepted').length,
  inProgress: tasks.value.filter(t => t.status === 'in_progress').length,
  waitingAcceptance: tasks.value.filter(t => t.status === 'waiting_acceptance').length,
  completed: tasks.value.filter(t => t.status === 'completed').length,
}))

// ========== Hub统计（顶部9卡片） ==========
const hubStats = computed(() => ({
  pendingTasks: tasks.value.filter(t => t.status === 'pending').length,
  inProgressTasks: tasks.value.filter(t => t.status === 'in_progress' || t.status === 'accepted').length,
  acceptedTasks: tasks.value.filter(t => t.status === 'accepted').length,
  todayCompleted: tasks.value.filter(t => t.status === 'completed').length,
  urgentProblems: problems.value.filter(p => p.issueSeverity === '严重').length,
  todayInspections: inspections.value.length,
  totalInspections: inspections.value.length,
  abnormalInspections: inspections.value.filter(i => i.status === 'critical' || i.status === 'abnormal').length,
  pendingProblems: problems.value.filter(p => p.status === '待处理').length,
  processedProblems: problems.value.filter(p => p.status === '已处理').length,
}))

// ========== 人员选项（用于批量操作下拉） ==========
const staffOptions = computed(() => {
  const users = userStore.users || []
  return users.map(w => ({ value: w.id || w.name, label: w.name }))
})

// ========== 巡查状态 ==========
const inspectionFilters = reactive({
  recordCode: '',
  inspectorName: '',
  inspectionType: 'all',
  startDate: '',
  endDate: '',
  status: 'all',
  problemStatus: 'all',
})
const inspectionPage = ref(1)
const inspectionPageSize = ref(10)
const inspectionExportMode = ref(false)
const inspectionBatchEditMode = ref(false)
const inspectionBatchDeleteMode = ref(false)
const inspectionSelectedRows = ref([])
const inspectionDetailId = ref(null)
const isInspectionCreateOpen = ref(false)

const inspectionStats = computed(() => ({
  total: inspections.value.length,
  normal: inspections.value.filter(i => i.status === 'normal').length,
  attention: inspections.value.filter(i => i.status === 'attention').length,
  abnormal: inspections.value.filter(i => i.status === 'critical' || i.status === 'abnormal').length,
}))

// ========== 问题统计 ==========
const problemStats = computed(() => ({
  total: problems.value.length,
  pending: problems.value.filter(p => p.status === '待处理').length,
  processing: problems.value.filter(p => p.status === '处理中').length,
  resolved: problems.value.filter(p => p.status === '已处理').length,
}))

// ========== 操作记录（与 V1.1 useFarmHub.recentRecords 格式一致） ==========
const WORKER_NAMES = ['陆启闯', '郭靖', '杨过', '张无忌', '令狐冲', '段誉', '黄蓉', '陈家洛', '任盈盈']
const OPERATION_ACTIONS = [
  { type: 'create', text: '创建了任务' },
  { type: 'accept', text: '接受了任务' },
  { type: 'start', text: '开始执行任务' },
  { type: 'progress', text: '提交了进度反馈' },
  { type: 'submit_acceptance', text: '提交了验收申请' },
  { type: 'verify', text: '验收通过了任务' },
]

const recentRecords = computed(() => {
  // 优先使用操作记录（通过 useTasks 管理），降级使用演示数据
  const opRecords = tasksHook.taskRecords.value
  if (opRecords && opRecords.length > 0) {
    return opRecords.slice(0, 10).map(r => ({
      id: r.id,
      timestamp: new Date(r.actionTime), // Date 对象
      operatorType: r.operatorName === '系统' ? 'system' : 'user',
      operatorName: r.operatorName || '未知',
      content: `${r.operatorName} ${r.actionName}【${r.taskTitle || r.taskCode}】`,
    }))
  }
  // 降级：从当前任务生成演示记录
  const records = []
  const now = new Date()
  tasks.value.slice(0, 8).forEach((t, i) => {
    const date = new Date(now)
    date.setHours(date.getHours() - i * 2)
    const action = OPERATION_ACTIONS[i % OPERATION_ACTIONS.length]
    const operatorName = t.assigneeName && t.assigneeName !== '系统' ? t.assigneeName : WORKER_NAMES[i % WORKER_NAMES.length]
    records.push({
      id: `rec-${i}`,
      timestamp: date,
      operatorType: action.type === 'verify' ? 'system' : 'user',
      operatorName: action.type === 'verify' ? '系统' : operatorName,
      content: `${action.type === 'verify' ? '系统' : operatorName} ${action.text}【${t.title || t.taskCode}】`,
    })
  })
  return records
})

// 临时任务计数（供Tab徽标，从 tempTaskStore 实时读取）
const tempTaskStore = useTempTaskStore()
const tempTaskCount = computed(() => tempTaskStore.tasks.length)

// ========== 弹窗状态 ==========
const detailTaskId = ref(null)
const verifyTaskId = ref(null)
const dispatchProblemId = ref(null)
const detailInspectionId = ref(null)
const showCreateModal = ref(false)
const showImportModal = ref(false)
const showSopModal = ref(false)
const selectedSopContent = ref('')
const selectExecutorTask = ref(null)
const withdrawTask = ref(null)
const cancelTask = ref(null)
const reassignTask = ref(null)
const overtimeTask = ref(null)

// ========== 弹窗关联数据 ==========
// 通过ID从tasks数组查找任务对象（模仿V1.1 Adapter模式）
const detailTask = computed(() => tasks.value.find(t => t.id === detailTaskId.value) || null)
const verifyTask = computed(() => tasks.value.find(t => t.id === verifyTaskId.value) || null)
const detailTaskRecords = ref([])
const verifyTaskRecords = ref([])

// 超时信息（根据任务状态推断超时类型）
const overtimeTimeout = computed(() => {
  if (!overtimeTask.value) return null
  const task = overtimeTask.value
  let type = 'execution'
  let severity = 'warning'
  if (task.status === 'pending') type = 'accept'
  else if (task.status === 'waiting_acceptance') type = 'acceptance'
  if (task.dueDate && new Date(task.dueDate) < new Date()) severity = 'critical'
  return {
    type,
    severity,
    startedAt: task.planStart || task.startTime || task.createdAt,
  }
})

// 监听detailTaskId变化，自动加载任务记录
watch(detailTaskId, async (newId) => {
  if (newId) {
    detailTaskRecords.value = await getTaskRecords(newId)
  } else {
    detailTaskRecords.value = []
  }
})

// 监听verifyTaskId变化，自动加载验收记录
watch(verifyTaskId, async (newId) => {
  if (newId) {
    verifyTaskRecords.value = await getTaskRecords(newId)
  } else {
    verifyTaskRecords.value = []
  }
})

// ========== 批量操作状态 ==========
const showBatchDispatchModal = ref(false)
const batchDispatchTarget = ref('')
const batchDispatchTaskIds = ref([])
const showBatchVerifyConfirm = ref(false)
const batchVerifyTaskIds = ref([])
const showBatchReassignModal = ref(false)
const batchReassignTarget = ref('')
const batchReassignTaskIds = ref([])
const showBatchDeleteConfirm = ref(false)
const batchDeleteIds = ref([])
const batchDeleteLoading = ref(false)
const showExportDialog = ref(false)
const exportFormat = ref('excel')
const exportIds = ref([])
const batchEditIds = ref([])

// ========== Tab样式计算 ==========
function getTabStyle(key) {
  const isActive = activeTab.value === key
  const colors = {
    task: isActive ? 'bg-blue-500 text-white font-bold' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
    inspection: isActive ? 'bg-emerald-500 text-white font-bold' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
    problem: isActive ? 'bg-orange-500 text-white font-bold' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
    tempTask: isActive ? 'bg-purple-500 text-white font-bold' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
  }
  return colors[key] || ''
}

function getTabCount(key) {
  switch (key) {
    case 'task': return tasks.value.length
    case 'problem': return problems.value.length
    case 'inspection': return inspections.value.length
    case 'tempTask': return tempTaskCount.value
    default: return 0
  }
}

// ========== 任务操作（与V1.1逻辑完全一致） ==========
function handleToggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function handleSelectAll(ids) { selectedIds.value = [...ids] }
function handleClearSelection() { selectedIds.value = [] }

function handleTaskFilterChange(key, val) {
  taskFilters[key] = val
}

function handleResetTaskFilters() {
  Object.assign(taskFilters, { status: 'all', type: 'all', area: 'all', search: '', assignee: 'all', batchCode: 'all' })
}

function handleViewTaskDetail(taskId) { detailTaskId.value = taskId }
function handleViewTaskInCalendar(task) { detailTaskId.value = task.id }
function handleViewSop(task) {
  selectedSopContent.value = task.sopContent || ''
  showSopModal.value = true
}

// 弹窗触发：设置任务对象，弹窗通过 v-if 渲染
function handleTaskWithdraw(task) { withdrawTask.value = task }
function handleTaskCancel(task) { cancelTask.value = task }
function handleTaskReassign(task) { reassignTask.value = task }
function handleTaskOvertime(task) { overtimeTask.value = task }

async function handleTaskContinue(taskId) {
  await tasksHook.continueExecution(taskId)
  ElMessage.success('任务已继续执行')
}

// 验收：通过verifyTaskId打开TaskAcceptanceModal（与V1.1 Adapter模式一致）
function handleTaskAccept(task) { verifyTaskId.value = task.id }

function handleTaskRemind(task) {
  tasksHook.sendReminder(task.id)
  ElMessage.success(`已向 ${task.assigneeName || '执行人'} 发送催办提醒`)
}

// 催办冷却检查（与V1.1 useReminder.canRemind 逻辑一致）
// 返回值结构对齐 V1.1 useReminder.ts line 82-116：{ allowed, reason?, cooldownSec, todayCount }
function canRemind(taskId) {
  const reminderRecords = tasksHook.reminderRecords.value || []
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // 检查今日催办次数
  const todayReminders = reminderRecords.filter(
    r => r.taskId === taskId && (r.remindedAt || '').startsWith(today)
  )
  const todayCount = todayReminders.length
  if (todayCount >= 5) {
    return { allowed: false, reason: '今日催办次数已达上限(5次)', cooldownSec: 0, todayCount }
  }

  // 检查催办间隔
  const lastReminder = reminderRecords.find(r => r.taskId === taskId)
  if (lastReminder) {
    const lastTime = new Date(lastReminder.remindedAt).getTime()
    const intervalMs = now.getTime() - lastTime
    if (intervalMs < 60 * 60 * 1000) {
      const cooldownSec = Math.ceil((60 * 60 * 1000 - intervalMs) / 1000)
      const minutesLeft = Math.ceil(cooldownSec / 60)
      return {
        allowed: false,
        reason: `催办间隔需大于1小时，还需等待${minutesLeft}分钟`,
        cooldownSec,
        todayCount,
      }
    }
  }

  return { allowed: true, reason: '', cooldownSec: 0, todayCount }
}

function handleSelectExecutor(task) { selectExecutorTask.value = task }

// 发布任务：草稿→发布→选择执行人（与V1.1逻辑一致：发布后自动弹出执行人选择）
async function handlePublish(task) {
  if (task.status !== 'draft') return
  try {
    await tasksHook.publishTask(task.id)
    // 获取Store中更新后的任务对象（避免传递过时的引用）
    const updatedTask = taskStore.tasks.find(t => t.id === task.id)
    selectExecutorTask.value = updatedTask || task
    ElMessage.success('任务已发布，请选择执行人')
  } catch (e) {
    ElMessage.error('发布任务失败：' + (e.message || '未知错误'))
  }
}

// 确认选择执行人（V1.1逻辑：先更新任务执行人信息，再接受任务）
async function handleConfirmSelectExecutor(assigneeId, assigneeName) {
  if (!selectExecutorTask.value) return
  try {
    const taskId = selectExecutorTask.value.id
    // 原子操作：设置执行人 + 状态设为 pending（与V1.1 acceptAndAssign 完全一致）
    await tasksHook.acceptAndAssign(taskId, assigneeId, assigneeName)
    selectExecutorTask.value = null
    ElMessage.success(`任务已分配给 ${assigneeName}，等待执行人接受`)
  } catch (e) {
    ElMessage.error('分配执行人失败：' + (e.message || '未知错误'))
  }
}

// 从详情页跳转到验收
function handleTaskVerifyFromDetail(taskId) {
  detailTaskId.value = null
  detailTaskRecords.value = []
  verifyTaskId.value = taskId
}

// ========== 验收操作（调用真实Store方法，含错误处理） ==========
async function handleAcceptVerify(comments) {
  if (!verifyTaskId.value) return
  try {
    await tasksHook.acceptCompletion(verifyTaskId.value, comments)
    ElMessage.success('验收通过')
    verifyTaskId.value = null
    verifyTaskRecords.value = []
  } catch (e) {
    ElMessage.error('验收操作失败：' + (e.message || '未知错误'))
  }
}

async function handleRejectVerify(reason) {
  if (!verifyTaskId.value) return
  try {
    await tasksHook.rejectForRework(verifyTaskId.value, reason)
    ElMessage.success('已驳回返工')
    verifyTaskId.value = null
    verifyTaskRecords.value = []
  } catch (e) {
    ElMessage.error('驳回操作失败：' + (e.message || '未知错误'))
  }
}

// ========== 撤回/取消操作（含错误处理） ==========
async function handleWithdrawConfirm(reason) {
  if (!withdrawTask.value) return
  try {
    await tasksHook.withdrawTask(withdrawTask.value.id, reason)
    withdrawTask.value = null
    ElMessage.success('任务已撤回')
  } catch (e) {
    ElMessage.error('撤回操作失败：' + (e.message || '未知错误'))
  }
}

async function handleCancelConfirm(reason) {
  if (!cancelTask.value) return
  try {
    await tasksHook.cancelTask(cancelTask.value.id, reason)
    cancelTask.value = null
    ElMessage.success('任务已取消')
  } catch (e) {
    ElMessage.error('取消操作失败：' + (e.message || '未知错误'))
  }
}

// ========== 重新派发操作（含错误处理） ==========
async function handleReassignConfirm(assigneeId, assigneeName) {
  if (!reassignTask.value) return
  try {
    await tasksHook.reassignTask(reassignTask.value.id, assigneeId, assigneeName)
    reassignTask.value = null
    ElMessage.success('任务已重新派发')
  } catch (e) {
    ElMessage.error('重新派发失败：' + (e.message || '未知错误'))
  }
}

// ========== 超时处理操作（含错误处理） ==========
async function handleOvertimeContinue(reason, newDeadline) {
  if (!overtimeTask.value) return
  try {
    await tasksHook.handleOvertime(overtimeTask.value.id, 'continue', { reason, newDeadline })
    overtimeTask.value = null
    ElMessage.success('已延长任务时限')
  } catch (e) {
    ElMessage.error('超时处理失败：' + (e.message || '未知错误'))
  }
}

async function handleOvertimeAbandon(reason) {
  if (!overtimeTask.value) return
  try {
    await tasksHook.handleOvertime(overtimeTask.value.id, 'abandon', { reason })
    overtimeTask.value = null
    ElMessage.success('任务已放弃')
  } catch (e) {
    ElMessage.error('放弃操作失败：' + (e.message || '未知错误'))
  }
}

// ========== 任务创建回调 ==========
function handleTaskCreated() {
  showCreateModal.value = false
  ElMessage.success('任务创建成功')
}

// ========== 任务记录获取（与V1.1 getTaskRecordsByTaskId逻辑一致） ==========
async function getTaskRecords(taskId) {
  if (!taskId) return []
  try {
    const records = await taskStore.fetchTaskRecords(taskId)
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

// ========== 批量操作 ==========
function handleBatchDispatch(taskIds) {
  batchDispatchTaskIds.value = taskIds
  batchDispatchTarget.value = ''
  showBatchDispatchModal.value = true
}

function confirmBatchDispatch() {
  if (!batchDispatchTarget.value) return
  const targetId = batchDispatchTarget.value
  const selectedStaff = staffOptions.value.find(s => s.value === targetId)
  const assigneeId = selectedStaff?.value || targetId
  const assigneeName = selectedStaff?.label || targetId
  const count = batchDispatchTaskIds.value.length
  batchDispatchTaskIds.value.forEach(taskId => {
    tasksHook.acceptAndAssign(taskId, assigneeId, assigneeName)
  })
  showBatchDispatchModal.value = false
  batchDispatchTaskIds.value = []
  selectedIds.value = []
  ElMessage.success(`已将 ${count} 个任务批量派发给 ${assigneeName}`)
}

function handleBatchVerify(taskIds) {
  batchVerifyTaskIds.value = taskIds
  showBatchVerifyConfirm.value = true
}

function confirmBatchVerify() {
  batchVerifyTaskIds.value.forEach(taskId => {
    tasksHook.acceptCompletion(taskId)
  })
  showBatchVerifyConfirm.value = false
  batchVerifyTaskIds.value = []
  selectedIds.value = []
  ElMessage.success('批量验收完成')
}

function handleBatchDelete(taskIds) {
  batchDeleteIds.value = taskIds
  showBatchDeleteConfirm.value = true
}

function confirmBatchDelete() {
  batchDeleteLoading.value = true
  batchDeleteIds.value.forEach(taskId => {
    tasksHook.deleteTask(taskId)
  })
  batchDeleteLoading.value = false
  showBatchDeleteConfirm.value = false
  batchDeleteIds.value = []
  selectedIds.value = []
  ElMessage.success('批量删除完成')
}

const showBatchEditModal = ref(false)
const batchEditForm = reactive({ priority: '', type: '', dueDate: '' })

function handleBatchEdit(taskIds) {
  batchEditIds.value = taskIds
  batchEditForm.priority = ''
  batchEditForm.type = ''
  batchEditForm.dueDate = ''
  showBatchEditModal.value = true
}

function confirmBatchEdit() {
  const updates = {}
  if (batchEditForm.priority) updates.priority = batchEditForm.priority
  if (batchEditForm.type) {
    updates.type = batchEditForm.type
    updates.typeName = TASK_TYPES.find(t => t.type === batchEditForm.type)?.name || batchEditForm.type
  }
  if (batchEditForm.dueDate) updates.dueDate = batchEditForm.dueDate
  if (Object.keys(updates).length === 0) { ElMessage.warning('请至少修改一个字段'); return }
  batchEditIds.value.forEach(taskId => {
    tasksHook.updateTask(taskId, updates)
  })
  ElMessage.success(`已批量更新 ${batchEditIds.value.length} 个任务`)
  showBatchEditModal.value = false
  batchEditIds.value = []
  selectedIds.value = []
}

function handleBatchReassign(taskIds) {
  batchReassignTaskIds.value = taskIds
  batchReassignTarget.value = ''
  showBatchReassignModal.value = true
}

function confirmBatchReassign() {
  if (!batchReassignTarget.value) return
  const targetId = batchReassignTarget.value
  const selectedStaff = staffOptions.value.find(s => s.value === targetId)
  const assigneeId = selectedStaff?.value || targetId
  const assigneeName = selectedStaff?.label || targetId
  batchReassignTaskIds.value.forEach(taskId => {
    tasksHook.reassignTask(taskId, assigneeId, assigneeName)
  })
  showBatchReassignModal.value = false
  batchReassignTaskIds.value = []
  selectedIds.value = []
  ElMessage.success(`已将任务批量重派给 ${assigneeName}`)
}

function handleExport(taskIds) {
  exportIds.value = taskIds
  showExportDialog.value = true
}

function handleDoExport() {
  if (exportIds.value.length === 0) return
  const selectedTasks = tasks.value.filter(t => exportIds.value.includes(t.id))
  const headers = ['任务编号', '任务名称', '类型', '执行人', '区域', '优先级', '状态', '截止日期']
  let content
  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + selectedTasks.map(t => headers.map(h => {
      const row = {
        '任务编号': t.taskCode, '任务名称': t.title, '类型': t.typeName,
        '执行人': t.assigneeName, '区域': t.greenhouseName, '优先级': t.priority,
        '状态': t.status, '截止日期': t.dueDate,
      }
      return `"${row[h] || ''}"`
    }).join(',')).join('\n')
    downloadFile(content, `任务导出_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv')
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${selectedTasks.map(t => `<tr>${headers.map(h => {
      const row = { '任务编号': t.taskCode, '任务名称': t.title, '类型': t.typeName, '执行人': t.assigneeName, '区域': t.greenhouseName, '优先级': t.priority, '状态': t.status, '截止日期': t.dueDate }
      return `<td>${row[h] || ''}</td>`
    }).join('')}</tr>`).join('')}</table></body></html>`
    downloadFile(content, `任务导出_${new Date().toISOString().slice(0, 10)}.xls`, 'application/vnd.ms-excel')
  } else {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${selectedTasks.map(t => `<tr>${headers.map(h => {
      const row = { '任务编号': t.taskCode, '任务名称': t.title, '类型': t.typeName, '执行人': t.assigneeName, '区域': t.greenhouseName, '优先级': t.priority, '状态': t.status, '截止日期': t.dueDate }
      return `<td>${row[h] || ''}</td>`
    }).join('')}</tr>`).join('')}</table></body></html>`
    downloadFile(content, `任务导出_${new Date().toISOString().slice(0, 10)}.doc`, 'application/vnd.ms-word')
  }
  showExportDialog.value = false
  exportIds.value = []
  ElMessage.success('导出完成')
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob(['﻿' + content], { type: mimeType + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ========== 导入处理 ==========
function handleBatchImport(importData) {
  if (importData.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }
  importData.forEach(row => {
    tasksHook.createTask({
      title: row.typeLabel || row.type || '农事任务',
      type: row.type || 'other',
      typeName: row.typeLabel || '',
      greenhouseName: row.field || '',
      cropName: row.crop || '',
      priority: row.priority || 'normal',
      assigneeName: row.assignee || '',
      dueDate: row.planEnd?.split(' ')[0] || '',
      status: 'pending',
    })
  })
  showImportModal.value = false
  ElMessage.success(`成功导入 ${importData.length} 条任务`)
}

// ========== 问题/巡查操作 ==========
function handleProblemDispatched() {
  ElMessage.success('问题分派完成')
}

function handleViewInspectionDetail(recordId) {
  detailInspectionId.value = recordId
}

function handleInspectionReportProblem(record) {
  ElMessage.info('问题上报功能')
}

function handleInspectionAcceptProblem(problem) {
  ElMessage.info('问题验收功能')
}

function handleInspectionReportProblemFromDetail(inspectionId) {
  detailInspectionId.value = null
  ElMessage.info(`巡查 ${inspectionId} 问题上报`)
}

function handleInspectionFilterChange(key, val) {
  inspectionFilters[key] = val
}

function handleResetInspectionFilters() {
  Object.assign(inspectionFilters, {
    recordCode: '', inspectorName: '', inspectionType: 'all',
    startDate: '', endDate: '', status: 'all', problemStatus: 'all',
  })
}

function handleInspectionPageChange(page) { inspectionPage.value = page }
function handleInspectionPageSizeChange(size) { inspectionPageSize.value = size }
function handleInspectionToggleRow(index) {
  const idx = inspectionSelectedRows.value.indexOf(index)
  if (idx >= 0) inspectionSelectedRows.value.splice(idx, 1)
  else inspectionSelectedRows.value.push(index)
}
function handleInspectionSelectAll(total) {
  if (inspectionSelectedRows.value.length === total) {
    inspectionSelectedRows.value = []
  } else {
    inspectionSelectedRows.value = Array.from({ length: total }, (_, i) => i)
  }
}
function handleInspectionBatchDelete(ids) {
  inspections.value = inspections.value.filter(i => !ids.includes(i.id))
  ElMessage.success(`已删除 ${ids.length} 条记录`)
}
function handleInspectionBatchEdit(ids) {
  ElMessage.info(`已选中 ${ids.length} 条记录进行批量编辑`)
}

// ========== tasksHook代理（传递给CreateTaskModal） ==========
// 使用 getter 确保 tasks 始终返回解包后的数组（避免 ComputedRef 传递问题）
const tasksHookProxy = {
  createTask: (data) => tasksHook.createTask(data),
  get tasks() { return (taskStore.tasks && taskStore.tasks.length > 0) ? taskStore.tasks : (tasks.value || []) },
}

// ========== 演示数据生成（API无数据时的降级方案） ==========
function generateDemoTaskCode(index) {
  const now = new Date()
  const datePrefix = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    now.getDate().toString().padStart(2, '0')
  return `NS${datePrefix}-${String(index).padStart(3, '0')}`
}

const DEMO_USERS = [
  { id: 'U001', name: '陆启闯' }, { id: 'S001', name: '郭靖' },
  { id: 'S002', name: '杨过' }, { id: 'S003', name: '张无忌' },
  { id: 'S004', name: '令狐冲' }, { id: 'S005', name: '段誉' },
]
const DEMO_GREENHOUSES = [
  { id: 'G001', name: 'A1号温室' }, { id: 'G002', name: 'B2号温室' },
  { id: 'G003', name: 'C3号温室' }, { id: 'G004', name: 'D5号大棚' },
]
const TASK_TYPES = [
  { type: 'fertilization', name: '施肥' }, { type: 'irrigation', name: '灌溉' },
  { type: 'pruning', name: '修剪' }, { type: 'pesticide', name: '植保' },
  { type: 'planting', name: '定植' }, { type: 'harvest', name: '采收' },
  { type: 'weeding', name: '除草' },
]
// 展示所有状态的任务，确保操作按钮覆盖全面
const DEMO_STATUSES = ['draft', 'pending', 'pending', 'accepted', 'in_progress', 'waiting_acceptance', 'completed', 'rejected', 'failed', 'abandoned', 'cancelled']

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateDemoTasks(count = 12) {
  const list = []
  const now = new Date()
  for (let i = 1; i <= count; i++) {
    const user = i <= 2 ? null : randomPick(DEMO_USERS) // 前2个任务没有执行人
    const gh = randomPick(DEMO_GREENHOUSES)
    const typeInfo = randomPick(TASK_TYPES)
    const status = DEMO_STATUSES[(i - 1) % DEMO_STATUSES.length]
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7) + 1)
    // 与 V1.1 autoGenerateTaskCode 编码规则100%一致：NS+年月日-3位流水号
    const taskCode = generateDemoTaskCode(i)
    list.push({
      id: taskCode,
      taskCode,
      title: `${typeInfo.name}作业任务`,
      type: typeInfo.type,
      typeName: typeInfo.name,
      types: [typeInfo.type], // 兼容 V1.1 types 数组格式
      status,
      priority: i % 3 === 0 ? 'urgent' : i % 3 === 1 ? 'high' : 'normal',
      progress: status === 'completed' ? 100 : status === 'in_progress' ? Math.floor(Math.random() * 80) + 10 : 0,
      sourceType: i % 5 === 0 ? 'tempTask' : undefined, // 仅每5个任务为临时任务，其余为普通生产任务
      sourceId: i % 3 === 0 ? `SRC${String(i).padStart(4, '0')}` : undefined,
      assigneeId: user ? user.id : '',
      assigneeName: user ? user.name : '',
      assignerId: 'U000',
      assignerName: '管理员',
      dueDate: dueDate.toISOString().split('T')[0],
      startTime: status !== 'pending' && status !== 'draft' ? now.toISOString() : '',
      completedAt: status === 'completed' ? dueDate.toISOString() : '',
      greenhouseId: gh.id,
      greenhouseName: gh.name,
      cropName: randomPick(['番茄', '黄瓜', '辣椒', '草莓']),
      field: `${gh.name}-B区`,
      planStart: now.toISOString().split('T')[0],
      planEnd: dueDate.toISOString().split('T')[0],
      estimatedDays: Math.floor(Math.random() * 5) + 1,
      estimatedHours: Math.floor(Math.random() * 8) + 1,
      // 超时状态：让第8个任务有超时
      timeout: i === 8 ? { severity: 'critical', type: 'execution' } : undefined,
    })
  }
  return list
}

function generateDemoInspections(count = 6) {
  const list = []
  const now = new Date()
  for (let i = 1; i <= count; i++) {
    const inspector = randomPick(DEMO_USERS)
    const gh = randomPick(DEMO_GREENHOUSES)
    const date = new Date(now)
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    const statuses = ['normal', 'normal', 'attention', 'abnormal']
    const status = statuses[i % statuses.length]
    list.push({
      id: `insp-${i}`,
      recordCode: `XJ${date.toISOString().split('T')[0].replace(/-/g, '')}-${String(i).padStart(3, '0')}`,
      inspectorName: inspector.name,
      inspectorId: inspector.id,
      inspectionType: randomPick(['日常巡查', '专项检查', '定期巡检']),
      greenhouseName: gh.name,
      greenhouseId: gh.id,
      inspectionDate: date.toISOString().split('T')[0],
      status,
      result: status === 'normal' ? '合格' : status === 'attention' ? '需关注' : '异常',
      description: `${date.toISOString().split('T')[0]} ${gh.name} 巡查记录`,
      problemStatus: status === 'abnormal' ? '待处理' : '无',
      createdAt: date.toISOString(),
    })
  }
  return list
}

function generateDemoProblems(count = 6) {
  const list = []
  const now = new Date()
  const severityLevels = ['轻微', '一般', '严重']
  const statuses = ['待处理', '处理中', '待处理', '已处理', '处理中', '待处理']
  const descriptions = [
    '叶片出现黄化现象，需检查营养液配比',
    '灌溉管道接头漏水，需维修',
    '温室内温度偏高，需检查通风系统',
    '部分植株发现蚜虫，需进行植保处理',
    '基质湿度传感器读数异常',
    '补光灯定时器故障，需更换',
  ]
  for (let i = 1; i <= count; i++) {
    const reporter = randomPick(DEMO_USERS)
    const gh = randomPick(DEMO_GREENHOUSES)
    const date = new Date(now)
    date.setDate(date.getDate() - Math.floor(Math.random() * 14))
    list.push({
      id: `prob-${i}`,
      issueCode: `WT${date.toISOString().split('T')[0].replace(/-/g, '')}-${String(i).padStart(3, '0')}`,
      title: descriptions[i - 1],
      description: descriptions[i - 1],
      issueSeverity: severityLevels[i % 3],
      status: statuses[i % statuses.length],
      reporterName: reporter.name,
      reporterId: reporter.id,
      greenhouseName: gh.name,
      greenhouseId: gh.id,
      reportedAt: date.toISOString(),
      resolvedAt: statuses[i % statuses.length] === '已处理' ? now.toISOString() : '',
      category: randomPick(['病虫害', '灌溉', '环境', '设备', '其他']),
      inspectionId: `insp-${Math.floor(Math.random() * 6) + 1}`,
    })
  }
  return list
}

// ========== 初始化 ==========
onMounted(async () => {
  await taskStore.fetchTasks({ page: 1 })
  tempTaskStore.fetchTasks() // 预加载临时任务计数
  // API无数据时降级使用演示数据
  if (!taskStore.tasks || taskStore.tasks.length === 0) {
    const demoTasks = generateDemoTasks(12)
    demoTasks.forEach(t => taskStore.tasks.push(t))
  }
  if (!userStore.users || userStore.users.length === 0) {
    // 填充演示用户
    userStore.users = DEMO_USERS
  }
  if (!greenhouseStore.greenhouses || greenhouseStore.greenhouses.length === 0) {
    greenhouseStore.greenhouses = DEMO_GREENHOUSES
  }
  // 填充巡查和问题数据
  if (inspections.value.length === 0) {
    inspections.value = generateDemoInspections(6)
  }
  if (problems.value.length === 0) {
    problems.value = generateDemoProblems(6)
  }
})
</script>

<style scoped>
/* 渐变弹窗头部样式（与V1.1 Modal组件 bg-gradient-to-r from-emerald-600 to-emerald-500 一致） */
.farm-modal :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  border-radius: 8px 8px 0 0;
}
.farm-modal-header {
  background: linear-gradient(to right, #059669, #10b981);
  padding: 16px 24px;
  border-radius: 8px 8px 0 0;
}
</style>
