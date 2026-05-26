<template>
  <div class="space-y-4">
    <!-- 任务类型标签页筛选 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <el-radio-group v-model="taskFilter" @change="handleFilterChange">
        <el-radio-button label="all">全部 ({{ taskCounts.all }})</el-radio-button>
        <el-radio-button label="problem">巡查反馈 ({{ taskCounts.problem }})</el-radio-button>
        <el-radio-button label="production">农事任务 ({{ taskCounts.production }})</el-radio-button>
        <el-radio-button label="temp">临时任务 ({{ taskCounts.temp }})</el-radio-button>
        <el-radio-button label="worklog">工作日志 ({{ taskCounts.worklog }})</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 任务列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden" v-if="taskFilter !== 'worklog'">
      <div class="overflow-x-auto" v-loading="store.loading">
        <el-table :data="paginatedTasks" style="width: 100%" class="min-w-[1200px]">
          <!-- 生产任务列 -->
          <template v-if="taskFilter === 'production' || taskFilter === 'all'">
            <el-table-column prop="taskCode" label="任务ID" width="120" />
            <el-table-column label="任务类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.typeName || row.typeLabel || '农事任务' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="field" label="任务区域" width="120" show-overflow-tooltip />
            <el-table-column prop="crop" label="作物" width="100" />
            <el-table-column prop="assigneeName" label="负责人" width="100" />
            <el-table-column prop="planStart" label="计划开始" width="120" />
            <el-table-column prop="planEnd" label="计划结束" width="120" />
            <el-table-column label="任务工时" width="80">
              <template #default="{ row }">
                {{ row.estimatedHours || (row.estimatedDays || 0) * 8 || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="进度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.progress || 0" :stroke-width="10" />
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="80">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remarks" label="备注" width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <!-- pending: 接受+拒绝（与 V1.1 ProductionTaskTableRow 一致） -->
                <template v-if="row.status === 'pending'">
                  <el-button type="success" size="small" @click="handleAccept(row)" class="text-xs">接受</el-button>
                  <el-button type="danger" size="small" @click="handleReject(row)" class="text-xs">拒绝</el-button>
                </template>
                <!-- accepted/in_progress: 提交进度 -->
                <el-button v-if="row.status === 'accepted' || row.status === 'in_progress'" type="primary" size="small" @click="handleFeedback(row)" class="text-xs">提交进度</el-button>
                <!-- rejected: 继续执行+查看 -->
                <template v-if="row.status === 'rejected'">
                  <el-button type="warning" size="small" @click="handleContinueExecution(row)" class="text-xs">继续执行</el-button>
                  <el-button type="info" size="small" @click="handleView(row)" class="text-xs">查看</el-button>
                </template>
                <!-- waiting_acceptance/completed: 查看 -->
                <el-button v-if="row.status === 'waiting_acceptance' || row.status === 'completed'" type="info" size="small" @click="handleView(row)" class="text-xs">查看</el-button>
                <el-button v-if="row.sopContent" type="primary" link size="small" @click="handleSop(row)">SOP</el-button>
              </template>
            </el-table-column>
          </template>

          <!-- 临时任务列 -->
          <template v-else-if="taskFilter === 'temp'">
            <el-table-column prop="taskCode" label="任务编号" width="130" />
            <el-table-column prop="title" label="任务名称" min-width="180" show-overflow-tooltip />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.tempTaskType || row.typeName || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="workLocation" label="工作地点" width="120" />
            <el-table-column prop="assigneeName" label="负责人" width="100" />
            <el-table-column prop="startDate" label="开始时间" width="120" />
            <el-table-column prop="dueDate" label="预计结束" width="120" />
            <el-table-column prop="workerCount" label="人工" width="60" />
            <el-table-column label="总工时" width="80">
              <template #default="{ row }">
                {{ row.totalEstimatedHours || row.estimatedHours || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="紧急程度" width="100">
              <template #default="{ row }">
                <el-tag :type="getUrgencyType(row.urgency)" size="small">
                  {{ getUrgencyText(row.urgency) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="handleAccept(row)" v-if="row.status === 'pending'">接单</el-button>
                <el-button link type="success" size="small" @click="handleFeedback(row)" v-if="row.status === 'in_progress'">反馈</el-button>
              </template>
            </el-table-column>
          </template>

          <!-- 巡查反馈列 -->
          <template v-else-if="taskFilter === 'problem'">
            <el-table-column prop="recordCode" label="巡查编号" width="130" />
            <el-table-column label="巡查类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.inspectionType === 'farm' ? '农场巡查' : '设备巡查' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submitterName" label="提交人" width="100" />
            <el-table-column prop="location" label="位置/对象" width="120" />
            <el-table-column prop="checkDate" label="巡查日期" width="120" />
            <el-table-column prop="checkResult" label="巡查结果" width="100" />
            <el-table-column label="问题分类" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="danger">{{ row.issueCategories?.[0] || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="严重程度" width="100">
              <template #default="{ row }">
                <el-tag :type="getSeverityType(row.issueSeverity)" size="small">
                  {{ row.issueSeverity || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="问题照片" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.photos && row.photos.length > 0" size="small">有</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="反馈状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.feedbackStatus || row.status)" size="small">
                  {{ getStatusText(row.feedbackStatus || row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="处理进度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.processProgress || row.progress || 0" :stroke-width="10" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button link type="success" size="small" @click="handleFeedback(row)">反馈</el-button>
              </template>
            </el-table-column>
          </template>

          <!-- 空状态 -->
          <template #empty>
            <div class="py-12 text-center text-gray-400">
              <el-icon :size="48" class="mb-4"><DocumentDelete /></el-icon>
              <p>暂无任务数据</p>
            </div>
          </template>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="flex justify-end p-4" v-if="filteredTasks.length > 0">
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

    <!-- 工作日志（独立组件） -->
    <WorkLogPage v-if="taskFilter === 'worklog'" />

    <!-- 任务详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="任务详情" width="700px" top="5vh">
      <div v-if="selectedTask" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务编号">{{ selectedTask.taskCode }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ selectedTask.typeName || selectedTask.typeLabel || '-' }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ selectedTask.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedTask.assigneeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ selectedTask.field || selectedTask.workLocation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="作物">{{ selectedTask.crop || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划开始">{{ selectedTask.planStart || selectedTask.startDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划结束">{{ selectedTask.planEnd || selectedTask.dueDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="selectedTask.progress || 0" :stroke-width="10" style="width: 150px" />
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedTask.status)">{{ getStatusText(selectedTask.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedTask.remarks" label="备注" :span="2">{{ selectedTask.remarks }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
        <template v-if="selectedTask?.status === 'pending'">
          <el-button type="success" @click="handleAcceptFromDetail">接受</el-button>
          <el-button type="danger" @click="handleRejectFromDetail">拒绝</el-button>
        </template>
        <el-button v-if="selectedTask?.status === 'accepted' || selectedTask?.status === 'in_progress'" type="primary" @click="handleFeedbackFromDetail">提交进度</el-button>
        <el-button v-if="selectedTask?.status === 'rejected'" type="warning" @click="handleContinueFromDetail">继续执行</el-button>
      </template>
    </el-dialog>

    <!-- 反馈弹窗 -->
    <el-dialog v-model="showFeedbackModal" title="任务反馈" width="650px" top="5vh">
      <el-form :model="feedbackForm" label-width="100px">
        <el-form-item label="任务进度">
          <el-slider v-model="feedbackForm.progress" :step="10" show-input />
        </el-form-item>
        <el-form-item label="反馈内容">
          <el-input v-model="feedbackForm.description" type="textarea" :rows="4" placeholder="请输入反馈内容..." />
        </el-form-item>
        <el-form-item label="物料编码">
          <el-input v-model="feedbackForm.materialCode" placeholder="输入使用的物料编码（可选）" />
        </el-form-item>
        <el-form-item label="完成情况">
          <el-radio-group v-model="feedbackForm.canContinue">
            <el-radio :value="true">可继续执行</el-radio>
            <el-radio :value="false">无法继续</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!feedbackForm.canContinue" label="原因说明">
          <el-input v-model="feedbackForm.cannotContinueReason" type="textarea" :rows="2" placeholder="请说明无法继续的原因..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFeedbackModal = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
      </template>
    </el-dialog>

    <!-- SOP弹窗 -->
    <el-dialog v-model="showSopModal" :title="`作业标准文件 - ${selectedTask?.taskCode || selectedTask?.id || ''}`" width="600px" top="5vh">
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="mb-3" v-if="selectedTask">
          <span class="text-sm font-medium text-gray-700">任务类型：</span>
          <div class="flex flex-wrap gap-2 mt-1">
            <el-tag v-if="selectedTask.typeName" size="small" type="success">{{ selectedTask.typeName }}</el-tag>
          </div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <pre class="text-sm text-gray-700 whitespace-pre-wrap font-sans">{{ selectedTask?.sopContent || '暂无SOP内容' }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="showSopModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { DocumentDelete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFarmTaskStore } from '@/stores/modules/farmTask.js'
import { useWorkLogStore } from '@/stores/modules/workLog.js'
import WorkLogPage from './worklog/WorkLogPage.vue'

const store = useFarmTaskStore()
const workLogStore = useWorkLogStore()

// 当前筛选
const taskFilter = ref('all')

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 弹窗状态
const showDetailModal = ref(false)
const showFeedbackModal = ref(false)
const showSopModal = ref(false)
const selectedTask = ref(null)

// 反馈表单
const feedbackForm = reactive({
  progress: 50,
  description: '',
  materialCode: '',
  canContinue: true,
  cannotContinueReason: ''
})

// 组件挂载时加载数据
onMounted(() => {
  if (store.tasks.length === 0) {
    store.fetchTasks()
  }
})

// 任务统计（与 V1.1 MyTasksPage.tsx 筛选逻辑一致）
const taskCounts = computed(() => ({
  all: store.tasks.length,
  problem: store.tasks.filter(t => t.sourceProblemId != null).length,
  production: store.tasks.filter(t => {
    if (!t.taskCode || !t.taskCode.startsWith('NS')) return false
    if (t.sourceType === 'tempTask') return false
    if (t.sourceProblemId != null) return false
    return true
  }).length,
  temp: store.tasks.filter(t => {
    if (t.sourceType === 'tempTask') return true
    if (t.taskCode && t.taskCode.startsWith('TT')) return true
    return false
  }).length,
  worklog: workLogStore.workLogs.length
}))

// 过滤后的任务（与 V1.1 MyTasksPage.tsx 筛选逻辑一致）
const filteredTasks = computed(() => {
  // 按创建时间倒序排序
  const sortByTime = (a, b) => {
    const getTime = (t) => {
      const ts = t.createdAt || t.planStart || t.startDate || ''
      if (!ts) return 0
      const d = new Date(ts)
      return isNaN(d.getTime()) ? 0 : d.getTime()
    }
    return getTime(b) - getTime(a)
  }

  let result = []
  switch (taskFilter.value) {
    case 'production':
      // 农事任务：仅显示 NS 开头，排除临时任务和问题反馈任务
      result = store.tasks.filter(t => {
        if (!t.taskCode || !t.taskCode.startsWith('NS')) return false
        if (t.sourceType === 'tempTask') return false
        if (t.sourceProblemId != null) return false
        return true
      })
      break
    case 'temp':
      // 临时任务：TT 开头或 sourceType 为 tempTask，排除草稿
      result = store.tasks.filter(t => {
        if (t.status === 'draft') return false
        if (t.sourceType === 'tempTask') return true
        if (t.taskCode && t.taskCode.startsWith('TT')) return true
        return false
      })
      break
    case 'problem':
      // 巡查反馈：有 sourceProblemId 的
      result = store.tasks.filter(t => t.sourceProblemId != null)
      break
    case 'worklog':
      return []
    default:
      result = [...store.tasks]
  }
  return result.sort(sortByTime)
})

// 分页后的任务
const paginatedTasks = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  return filteredTasks.value.slice(start, start + pagination.value.pageSize)
})

// ====== 工具函数 ======

const getPriorityType = (priority) => {
  const map = { urgent: 'danger', high: 'warning', medium: 'primary', low: 'info', normal: 'info' }
  return map[priority] || 'info'
}

const getPriorityText = (priority) => {
  const map = { urgent: '紧急', high: '高', medium: '中', low: '低', normal: '普通' }
  return map[priority] || '普通'
}

const getStatusType = (status) => {
  const map = { pending: 'warning', accepted: 'primary', in_progress: 'primary', waiting_acceptance: 'warning', completed: 'success', rejected: 'danger', cancelled: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待接受', accepted: '已接受', in_progress: '进行中', waiting_acceptance: '待验收', completed: '已完成', rejected: '已拒绝', cancelled: '已取消' }
  return map[status] || status
}

const getUrgencyType = (urgency) => {
  const map = { critical: 'danger', urgent: 'warning', normal: 'info' }
  return map[urgency] || 'info'
}

const getUrgencyText = (urgency) => {
  const map = { critical: '非常紧急', urgent: '紧急', normal: '普通' }
  return map[urgency] || '普通'
}

const getSeverityType = (severity) => {
  const map = { '严重': 'danger', '中等': 'warning', '轻微': 'info' }
  return map[severity] || 'info'
}

// ====== 事件处理 ======

const handleFilterChange = () => {
  pagination.value.currentPage = 1
}

const handlePageSizeChange = () => {
  pagination.value.currentPage = 1
}

const handlePageChange = () => {}

// 查看详情
const handleView = (row) => {
  selectedTask.value = row
  showDetailModal.value = true
}

// 查看SOP
const handleSop = (row) => {
  selectedTask.value = row
  showSopModal.value = true
}

// 接单（pending → accepted，与 V1.1 acceptTask 一致）
const handleAccept = async (row) => {
  try {
    await ElMessageBox.confirm(`确定接受任务 "${row.taskCode || row.title}" 吗？`, '确认接单', {
      confirmButtonText: '确定接单',
      cancelButtonText: '取消',
      type: 'info'
    })
    await store.accept(row.id)
    ElMessage.success('已接受任务，请开始执行')
  } catch { /* 取消 */ }
}

// 从详情页接单
const handleAcceptFromDetail = async () => {
  await handleAccept(selectedTask.value)
  showDetailModal.value = false
}

// 从详情页拒绝
const handleRejectFromDetail = async () => {
  await handleReject(selectedTask.value)
  showDetailModal.value = false
}

// 从详情页继续执行
const handleContinueFromDetail = async () => {
  showDetailModal.value = false
  await handleContinueExecution(selectedTask.value)
}

// 拒绝任务（pending → rejected，与 V1.1 rejectByExecutor 一致）
const handleReject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝任务', {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValidator: (val) => val ? true : '请输入拒绝原因',
      inputErrorMessage: '拒绝原因不能为空'
    })
    await store.reject(row.id, reason)
    ElMessage.success('已拒绝任务，将通知管理员重新分派')
  } catch { /* 取消 */ }
}

// 继续执行（rejected → in_progress，与 V1.1 continueExecution 一致）
const handleContinueExecution = async (row) => {
  try {
    await ElMessageBox.confirm(`确定继续执行任务 "${row.taskCode || row.title}" 吗？`, '确认继续执行', {
      confirmButtonText: '确定继续',
      cancelButtonText: '取消',
      type: 'info'
    })
    await store.start(row.id)
    ElMessage.success('已恢复任务执行')
  } catch { /* 取消 */ }
}

// 反馈
const handleFeedback = (row) => {
  selectedTask.value = row
  feedbackForm.progress = row.progress || 50
  feedbackForm.description = ''
  feedbackForm.materialCode = ''
  feedbackForm.canContinue = true
  feedbackForm.cannotContinueReason = ''
  showFeedbackModal.value = true
}

// 从详情页反馈
const handleFeedbackFromDetail = () => {
  showDetailModal.value = false
  handleFeedback(selectedTask.value)
}

// 提交反馈（与 V1.1 submitProgress 一致：进度100%时提交验收 → waiting_acceptance）
const submitFeedback = async () => {
  if (!selectedTask.value) return
  try {
    const newProgress = feedbackForm.progress
    const desc = feedbackForm.description || (feedbackForm.canContinue ? '正常执行' : `无法继续: ${feedbackForm.cannotContinueReason}`)

    // 无法继续 → 拒绝任务
    if (!feedbackForm.canContinue && feedbackForm.cannotContinueReason.trim()) {
      await store.reject(selectedTask.value.id, feedbackForm.cannotContinueReason)
      ElMessage.warning('已提交无法继续反馈，任务将重新分派')
      showFeedbackModal.value = false
      return
    }

    // 提交进度记录
    await store.submitProgressData(selectedTask.value.id, newProgress, desc)

    // 进度100%时提交验收
    if (newProgress >= 100) {
      await store.submitAcceptance(selectedTask.value.id)
      ElMessage.success('已提交验收申请，等待管理员审核')
    } else {
      ElMessage.success('进度反馈提交成功')
    }
    showFeedbackModal.value = false
  } catch (err) {
    ElMessage.error('反馈提交失败')
  }
}
</script>
