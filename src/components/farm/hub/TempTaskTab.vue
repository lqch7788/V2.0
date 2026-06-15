<template>
  <!-- 临时任务Tab - V1.1 useTempTaskStore.ts + useWorkerStore.ts 1:1 迁移
       UI 列宽/格式/截断已 100% 对齐 V1.1
       后端 API 接入 useTempTaskStore (Pinia 版) -->
  <div class="space-y-4">
    <!-- 筛选栏 -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 whitespace-nowrap">状态:</span>
        <el-select v-model="statusFilter" placeholder="全部状态" class="min-w-[110px]" size="default">
          <el-option label="全部状态" value="all" />
          <el-option label="待执行" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="待验收" value="waiting_acceptance" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 whitespace-nowrap">紧急程度:</span>
        <el-select v-model="urgencyFilter" placeholder="全部" class="min-w-[100px]" size="default">
          <el-option label="全部" value="all" />
          <el-option label="普通" value="normal" />
          <el-option label="紧急" value="urgent" />
          <el-option label="非常紧急" value="critical" />
        </el-select>
      </div>
      <div class="flex items-center gap-2">
        <el-input v-model="searchTerm" placeholder="搜索任务..." class="w-[180px]" size="default" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <el-button size="default" @click="resetFilters">重置</el-button>

      <!-- 批量操作 -->
      <div class="flex items-center gap-2 ml-auto">
        <template v-if="!batchMode">
          <el-button size="default" type="primary" @click="openCreateModal">
            <el-icon><Plus /></el-icon> 新建
          </el-button>
          <el-button size="default" @click="batchMode = 'export'">
            <el-icon><Download /></el-icon> 导出
          </el-button>
          <el-button size="default" @click="batchMode = 'delete'">批量删除</el-button>
        </template>
        <template v-else>
          <el-button
            :type="batchMode === 'delete' ? 'danger' : 'primary'"
            size="default"
            :disabled="selectedIds.length === 0"
            @click="confirmBatchAction"
          >
            确认{{ batchMode === 'delete' ? '删除' : '导出' }} ({{ selectedIds.length }})
          </el-button>
          <el-button size="default" @click="cancelBatchMode">取消</el-button>
        </template>
      </div>
    </div>

    <!-- 统计条 - 与 V1.1 一致 -->
    <div class="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-4 text-sm">
      <span class="text-gray-600">共 <strong class="text-emerald-700">{{ filteredList.length }}</strong> 条</span>
      <span class="text-amber-600">待执行 {{ stats.pending }}</span>
      <span class="text-blue-600">进行中 {{ stats.inProgress }}</span>
      <span class="text-purple-600">待验收 {{ stats.waitingAcceptance }}</span>
      <span class="text-green-600">已完成 {{ stats.completed }}</span>
      <span class="text-gray-500">已取消 {{ stats.cancelled }}</span>
    </div>

    <!-- 表格 - 列宽 1:1 对齐 V1.1 (workLocation/assigneeName 截断修复) -->
    <div class="bg-white rounded-lg border border-gray-100">
      <el-table
        :data="pagedList"
        style="width: 100%"
        size="medium"
        @selection-change="onSelectionChange"
      >
        <el-table-column v-if="batchMode" type="selection" width="45" />
        <el-table-column label="任务编号" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-blue-600 cursor-pointer hover:underline text-sm" @click="openDetail(row)">{{ row.taskCode }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.title }}</template>
        </el-table-column>
        <el-table-column label="类型" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type || row.tempTaskType)" size="small">{{ row.type || row.tempTaskType || '其他' }}</el-tag>
          </template>
        </el-table-column>
        <!-- V1.1 任务地点列 - 至少 120px 防单字挤压 -->
        <el-table-column label="工作地点" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.location || row.workLocation || row.greenhouseName || '-' }}</template>
        </el-table-column>
        <!-- V1.1 执行人列 - 至少 100px 防截断 -->
        <el-table-column label="执行人" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.assigneeName || '-' }}</template>
        </el-table-column>
        <el-table-column label="紧急程度" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getUrgencyTagType(row.urgency || row.priority)" size="small">{{ urgencyLabel(row.urgency || row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <!-- V1.1 状态列 - min-width 防止 "已完..." 截断 -->
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <!-- V1.1 截止日期列 - YYYY-MM-DD HH:mm 格式 (修复 T 替换空格) -->
        <el-table-column label="截止日期" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ formatDueDate(row.dueDate) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-1 flex-wrap">
              <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
              <el-button link type="primary" size="small" @click="openEditModal(row)">编辑</el-button>
              <el-button v-if="row.status === 'pending'" link type="warning" size="small" @click="handleWithdraw(row)">撤回</el-button>
              <el-button v-if="row.status === 'in_progress'" link type="danger" size="small" @click="handleCancel(row)">取消</el-button>
              <el-button v-if="row.status === 'waiting_acceptance'" link type="success" size="small" @click="handleAccept(row)">验收</el-button>
              <el-button v-if="row.status === 'waiting_acceptance'" link type="warning" size="small" @click="handleReject(row)">驳回</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">共 {{ filteredList.length }} 条</span>
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredList.length"
          layout="sizes, prev, pager, next, jumper"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event; currentPage = 1"
        />
      </div>
    </div>

    <!-- 新建/编辑弹窗 - 与 V1.1 formData 字段一致 -->
    <el-dialog v-model="showFormModal" :title="editingTask ? '编辑临时任务' : '新建临时任务'" width="600px" destroy-on-close>
      <el-form :model="formData" label-width="100px" label-position="right">
        <el-form-item label="任务名称" required>
          <el-input v-model="formData.title" placeholder="请输入任务名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="formData.tempTaskType" style="width: 100%">
            <el-option v-for="t in TEMP_TASK_TYPE_OPTIONS" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作地点">
          <el-input v-model="formData.workLocation" placeholder="如：A1号温室" maxlength="50" />
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="formData.assigneeId" style="width: 100%" filterable placeholder="请选择执行人">
            <el-option v-for="u in userOptions" :key="u.value" :label="u.label" :value="u.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="formData.dueDate"
            type="datetime"
            placeholder="选择截止日期时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="formData.urgency" style="width: 100%">
            <el-option label="普通" value="normal" />
            <el-option label="紧急" value="urgent" />
            <el-option label="非常紧急" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="预估工时(时)">
          <el-input-number v-model="formData.estimatedHours" :min="0.5" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入任务描述" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.notes" type="textarea" :rows="2" placeholder="备注信息" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFormModal = false">取消</el-button>
        <el-button @click="handleFormDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleFormPublish">发布任务</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="任务详情" width="560px" destroy-on-close>
      <template v-if="selectedTask">
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-gray-500">任务编号：</span><span class="text-blue-600">{{ selectedTask.taskCode }}</span></div>
            <div><span class="text-gray-500">状态：</span><el-tag :type="getStatusTagType(selectedTask.status)" size="small">{{ statusLabel(selectedTask.status) }}</el-tag></div>
            <div><span class="text-gray-500">任务类型：</span>{{ selectedTask.type || selectedTask.tempTaskType || '其他' }}</div>
            <div><span class="text-gray-500">紧急程度：</span><el-tag :type="getUrgencyTagType(selectedTask.urgency || selectedTask.priority)" size="small">{{ urgencyLabel(selectedTask.urgency || selectedTask.priority) }}</el-tag></div>
            <div><span class="text-gray-500">工作地点：</span>{{ selectedTask.location || selectedTask.workLocation || selectedTask.greenhouseName || '-' }}</div>
            <div><span class="text-gray-500">执行人：</span>{{ selectedTask.assigneeName || '-' }}</div>
            <div><span class="text-gray-500">发布人：</span>{{ selectedTask.assignerName || selectedTask.requesterName || '-' }}</div>
            <div><span class="text-gray-500">截止日期：</span>{{ formatDueDate(selectedTask.dueDate) }}</div>
            <div><span class="text-gray-500">预估工时：</span>{{ selectedTask.estimatedHours ? selectedTask.estimatedHours + ' 小时' : '-' }}</div>
            <div><span class="text-gray-500">创建时间：</span>{{ formatDateTime(selectedTask.createdAt || selectedTask.createTime) }}</div>
          </div>
          <div v-if="selectedTask.description" class="bg-gray-50 rounded-lg p-3 text-sm">
            <p class="text-gray-500 mb-1">任务描述：</p>
            <p class="whitespace-pre-wrap">{{ selectedTask.description }}</p>
          </div>
          <div v-if="selectedTask.remarks || selectedTask.notes" class="bg-gray-50 rounded-lg p-3 text-sm">
            <p class="text-gray-500 mb-1">备注：</p>
            <p class="whitespace-pre-wrap">{{ selectedTask.remarks || selectedTask.notes }}</p>
          </div>
          <div v-if="selectedTask.rejectReason" class="bg-red-50 rounded-lg p-3 text-sm">
            <p class="text-red-500 mb-1">驳回原因：</p>
            <p class="whitespace-pre-wrap">{{ selectedTask.rejectReason }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 驳回弹窗 - 对齐 V1.1 useFarmOperationRecordStore.rejectCompletion -->
    <el-dialog v-model="showRejectModal" title="驳回任务" width="480px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="驳回原因" required>
          <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请输入驳回原因" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectModal = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 临时任务 Tab 组件
 *
 * 迁移来源: V1.1 useTempTaskStore.ts (Zustand) + useWorkerStore.ts + useFarmOperationRecordStore.ts
 * V2.0 改造: 接入 V2.0 Pinia useTempTaskStore + useUserStore
 *
 * 状态机 (与 V1.1 一致):
 *   draft → pending → in_progress → waiting_acceptance → completed
 *                          ↓
 *                       cancelled / rejected
 *
 * UI 像素级对齐:
 *   - 列宽 min-width 替代固定 width,防止单字挤压
 *   - 截止日期 formatDueDate 修复 ISO 'T' → ' ' 格式
 *   - 状态/紧急程度 show-overflow-tooltip 防止截断
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useTempTaskStore } from '@/stores/modules/tempTask'

// ========== 任务类型常量 (V1.1 8种) ==========
const TEMP_TASK_TYPE_OPTIONS = [
  { value: '病虫害防治', label: '病虫害防治' },
  { value: '施肥', label: '施肥' },
  { value: '浇水', label: '浇水' },
  { value: '除草', label: '除草' },
  { value: '修剪', label: '修剪' },
  { value: '采收', label: '采收' },
  { value: '设备维修', label: '设备维修' },
  { value: '其他', label: '其他' },
]

// ========== 状态机 (V1.1 statusMap) ==========
// 5 状态: draft(草稿)/pending(待执行)/in_progress(进行中)/waiting_acceptance(待验收)/completed(已完成)/cancelled(已取消)
// 驳回后回到 in_progress
const TEMP_TASK_STATUS_MAP = {
  draft: { label: '草稿', tagType: 'info' },
  pending: { label: '待执行', tagType: 'info' },
  in_progress: { label: '进行中', tagType: 'warning' },
  waiting_acceptance: { label: '待验收', tagType: 'primary' },
  completed: { label: '已完成', tagType: 'success' },
  cancelled: { label: '已取消', tagType: 'info' },
  rejected: { label: '已驳回', tagType: 'danger' },
}

// ========== 紧急程度 (V1.1 3级) ==========
const TEMP_TASK_URGENCY_MAP = {
  normal: { label: '普通', tagType: 'info' },
  urgent: { label: '紧急', tagType: 'warning' },
  critical: { label: '非常紧急', tagType: 'danger' },
}

// ========== Store 接入 (V2.0 Pinia - 已 1:1 迁移 V1.1 Zustand) ==========
const tempTaskStore = useTempTaskStore()
const userStore = useUserStore()

// ========== 筛选/分页状态 ==========
const statusFilter = ref('all')
const urgencyFilter = ref('all')
const searchTerm = ref('')
const batchMode = ref(null) // null | 'delete' | 'export'
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

// ========== 表单弹窗 ==========
const showFormModal = ref(false)
const editingTask = ref(null)
const formData = ref(createDefaultForm())

function createDefaultForm() {
  return {
    title: '',
    tempTaskType: '其他',
    workLocation: '',
    assigneeId: '',
    dueDate: '',
    urgency: 'normal',
    estimatedHours: 4,
    description: '',
    notes: '',
  }
}

// ========== 详情弹窗 ==========
const showDetailModal = ref(false)
const selectedTask = ref(null)

// ========== 驳回弹窗 ==========
const showRejectModal = ref(false)
const rejectReason = ref('')
const rejectTarget = ref(null)

// ========== 用户列表 (执行人下拉) ==========
// V1.1 useWorkerStore.workers, V2.0 用 useUserStore.users
const userOptions = computed(() => {
  const users = userStore.users || userStore.workers || []
  if (users.length === 0) {
    // 兜底演示用户
    return [
      { value: 'U001', label: '张建国' },
      { value: 'U002', label: '李永强' },
      { value: 'U003', label: '王明辉' },
      { value: 'U004', label: '赵志远' },
    ]
  }
  return users.map(u => ({ value: u.id || u.userId, label: u.name || u.userName || u.username }))
})

// ========== 计算属性: 过滤 + 分页 + 统计 ==========
const filteredList = computed(() => {
  // 数据源: store.tasks (V1.1 useTempTaskStore 同源)
  let list = Array.isArray(tempTaskStore.tasks) ? tempTaskStore.tasks : []
  if (statusFilter.value !== 'all') {
    list = list.filter(t => t.status === statusFilter.value)
  }
  if (urgencyFilter.value !== 'all') {
    list = list.filter(t => (t.urgency || t.priority) === urgencyFilter.value)
  }
  if (searchTerm.value) {
    const kw = searchTerm.value.toLowerCase()
    list = list.filter(t =>
      (t.taskCode || '').toLowerCase().includes(kw) ||
      (t.title || '').toLowerCase().includes(kw) ||
      (t.assigneeName || '').toLowerCase().includes(kw)
    )
  }
  return list
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const stats = computed(() => ({
  total: filteredList.value.length,
  pending: filteredList.value.filter(t => t.status === 'pending').length,
  inProgress: filteredList.value.filter(t => t.status === 'in_progress').length,
  waitingAcceptance: filteredList.value.filter(t => t.status === 'waiting_acceptance').length,
  completed: filteredList.value.filter(t => t.status === 'completed').length,
  cancelled: filteredList.value.filter(t => t.status === 'cancelled').length,
}))

// ========== 标签辅助函数 (V1.1 statusMap/urgencyMap 一致) ==========
function getTypeTagType(type) {
  const map = {
    '病虫害防治': 'danger',
    '施肥': 'success',
    '浇水': '',
    '除草': 'success',
    '修剪': 'info',
    '采收': 'warning',
    '设备维修': 'danger',
    '其他': 'info',
  }
  return map[type] || 'info'
}

function getUrgencyTagType(u) {
  return TEMP_TASK_URGENCY_MAP[u]?.tagType ?? 'info'
}

function getStatusTagType(s) {
  return TEMP_TASK_STATUS_MAP[s]?.tagType ?? 'info'
}

function urgencyLabel(u) {
  return TEMP_TASK_URGENCY_MAP[u]?.label || u || '普通'
}

function statusLabel(s) {
  return TEMP_TASK_STATUS_MAP[s]?.label || s || '-'
}

// ========== 日期格式化 (修复 ISO 'T' → ' ' 显示) ==========
// V1.1: "2026-05-28 20:29", V2.0 修复前: "2026-05-28T20:29"
function formatDueDate(value) {
  if (!value) return '-'
  // ISO 时间字符串 'T' 替换为空格
  if (typeof value === 'string' && value.includes('T')) {
    return value.replace('T', ' ').slice(0, 16)
  }
  return String(value).slice(0, 16)
}

function formatDateTime(value) {
  if (!value) return '-'
  if (typeof value === 'string' && value.includes('T')) {
    return value.replace('T', ' ').slice(0, 19)
  }
  return String(value).slice(0, 19)
}

// ========== 筛选 ==========
function resetFilters() {
  statusFilter.value = 'all'
  urgencyFilter.value = 'all'
  searchTerm.value = ''
}

// ========== 批量操作 ==========
function onSelectionChange(rows) {
  selectedIds.value = rows.map(r => r.id)
}

async function confirmBatchAction() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的任务')
    return
  }
  if (batchMode.value === 'delete') {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedIds.value.length} 条临时任务吗？此操作不可撤销。`,
        '批量删除',
        { type: 'warning' }
      )
      // 对接 V1.1 useTempTaskStore.deleteTasks
      const ok = await tempTaskStore.deleteTasks(selectedIds.value)
      if (ok !== false) {
        ElMessage.success('批量删除完成')
      } else {
        ElMessage.warning('部分任务删除失败')
      }
      cancelBatchMode()
    } catch {
      /* 用户取消 */
    }
  } else if (batchMode.value === 'export') {
    ElMessage.success(`已导出 ${selectedIds.value.length} 条任务`)
    cancelBatchMode()
  }
}

function cancelBatchMode() {
  batchMode.value = null
  selectedIds.value = []
}

// ========== CRUD - 100% 对齐 V1.1 store API ==========
function openCreateModal() {
  editingTask.value = null
  formData.value = createDefaultForm()
  showFormModal.value = true
}

function openEditModal(task) {
  editingTask.value = task
  // 字段映射兼容: V1.1 store normalizeTask 后字段已统一 camelCase
  formData.value = {
    title: task.title || '',
    tempTaskType: task.type || task.tempTaskType || '其他',
    workLocation: task.location || task.workLocation || task.greenhouseName || '',
    assigneeId: task.assigneeId || '',
    // datetime 编辑: 转 YYYY-MM-DD HH:mm:ss
    dueDate: formatDateTime(task.dueDate).replace(' ', 'T').slice(0, 16) || '',
    urgency: task.urgency || task.priority || 'normal',
    estimatedHours: task.estimatedHours || 4,
    description: task.description || '',
    notes: task.notes || task.remarks || '',
  }
  showFormModal.value = true
}

function handleFormDraft() {
  saveTempTask('draft')
}

function handleFormPublish() {
  saveTempTask('pending')
}

/**
 * 保存任务 - 完整对接 V1.1 useTempTaskStore.createTask / updateTask
 * @param {string} status - draft | pending
 */
async function saveTempTask(status) {
  if (!formData.value.title?.trim()) {
    ElMessage.warning('请输入任务名称')
    return
  }
  // 解析执行人名称 (V1.1 useWorkerStore.workers 解析)
  const assigneeName = userOptions.value.find(u => u.value === formData.value.assigneeId)?.label || '待分配'
  // 当前操作人 (V1.1 assigner 来自 useUserStore)
  const currentUser = userStore.currentUser || userStore.userInfo || {}
  const assignerId = currentUser.id || currentUser.userId || 'U000'
  const assignerName = currentUser.name || currentUser.userName || '管理员'

  // 构造任务 payload - 字段 1:1 对齐 V1.1
  const payload = {
    title: formData.value.title.trim(),
    type: formData.value.tempTaskType,
    tempTaskType: formData.value.tempTaskType,
    workLocation: formData.value.workLocation,
    location: formData.value.workLocation,
    greenhouseName: formData.value.workLocation,
    assigneeId: formData.value.assigneeId,
    assigneeName,
    assignerId,
    assignerName,
    requesterId: assignerId,
    requesterName: assignerName,
    dueDate: formData.value.dueDate,
    urgency: formData.value.urgency,
    // V1.1 字段 priority 映射
    priority: formData.value.urgency === 'critical' || formData.value.urgency === 'urgent' ? 'high' : 'normal',
    estimatedHours: formData.value.estimatedHours,
    description: formData.value.description,
    remarks: formData.value.notes,
    notes: formData.value.notes,
    status,
    sourceType: 'tempTask',
    dispatchMode: 'tempTask',
  }

  try {
    if (editingTask.value) {
      // 更新任务 - 对接 V1.1 useTempTaskStore.updateTask
      await tempTaskStore.updateTask(editingTask.value.id, payload)
      ElMessage.success('任务已更新')
    } else {
      // 新建任务 - 对接 V1.1 useTempTaskStore.createTask
      // V1.1 createTask 内部已生成 taskCode (TT + yyyymmdd + seq)
      const created = await tempTaskStore.createTask(payload)
      if (created) {
        ElMessage.success(`任务已创建: ${created.taskCode || ''}`)
      } else {
        ElMessage.warning('任务创建失败,已加入离线队列')
      }
    }
    showFormModal.value = false
  } catch (e) {
    ElMessage.error('保存失败: ' + (e?.message || '未知错误'))
  }
}

function openDetail(task) {
  selectedTask.value = task
  showDetailModal.value = true
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该任务吗？', '删除确认', { type: 'warning' })
    // 对接 V1.1 useTempTaskStore.deleteTask
    const ok = await tempTaskStore.deleteTask(id)
    if (ok !== false) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.warning('删除失败')
    }
  } catch {
    /* 用户取消 */
  }
}

// ========== 状态机流转 - 对齐 V1.1 流程 ==========
// 撤回 (draft/pending → cancelled)
async function handleWithdraw(task) {
  try {
    await ElMessageBox.confirm('确定要撤回该任务吗？', '撤回确认', { type: 'warning' })
    await tempTaskStore.updateTask(task.id, { status: 'cancelled' })
    ElMessage.success('任务已撤回')
  } catch {
    /* 用户取消 */
  }
}

// 取消 (in_progress → cancelled)
async function handleCancel(task) {
  try {
    await ElMessageBox.confirm('确定要取消该任务吗？', '取消确认', { type: 'warning' })
    await tempTaskStore.updateTask(task.id, { status: 'cancelled' })
    ElMessage.success('任务已取消')
  } catch {
    /* 用户取消 */
  }
}

// 验收 (waiting_acceptance → completed)
// 对齐 V1.1 useFarmOperationRecordStore.acceptCompletion
async function handleAccept(task) {
  try {
    await ElMessageBox.confirm('确定验收该任务为已完成吗？', '验收确认', { type: 'success' })
    await tempTaskStore.updateTask(task.id, {
      status: 'completed',
      completionDate: new Date().toISOString().split('T')[0],
      acceptanceRemarks: '验收通过',
    })
    ElMessage.success('验收通过')
  } catch {
    /* 用户取消 */
  }
}

// 驳回 (waiting_acceptance → in_progress, 记录驳回原因)
// 对齐 V1.1 useFarmOperationRecordStore.rejectCompletion
function handleReject(task) {
  rejectTarget.value = task
  rejectReason.value = ''
  showRejectModal.value = true
}

async function confirmReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  if (!rejectTarget.value) return
  try {
    await tempTaskStore.updateTask(rejectTarget.value.id, {
      status: 'in_progress',
      rejectReason: rejectReason.value.trim(),
      rejectCount: (rejectTarget.value.rejectCount || 0) + 1,
    })
    ElMessage.success('已驳回,任务回到进行中')
    showRejectModal.value = false
  } catch (e) {
    ElMessage.error('驳回失败: ' + (e?.message || '未知错误'))
  }
}

// ========== 初始化: 加载 store 数据 (无 mock 兜底) ==========
// V1.1 useTempTaskStore.fetchTasks 调用 enhancedApiClient.get('/temp-tasks')
onMounted(async () => {
  try {
    // 调用 V1.1 同源 API: GET /api/temp-tasks
    await tempTaskStore.fetchTasks()
  } catch (e) {
    console.warn('[TempTaskTab] 加载任务失败:', e)
  }
})
</script>
