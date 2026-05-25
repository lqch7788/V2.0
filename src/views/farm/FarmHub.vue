<template>
  <div class="space-y-6 p-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Grape /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">农事任务中心</h1>
          <p class="text-gray-500">农事任务管理与调度</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon :size="24" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">待办任务</p>
            <p class="text-2xl font-bold text-gray-800">{{ store.statusStats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" class="text-blue-600"><Loading /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">进行中</p>
            <p class="text-2xl font-bold text-gray-800">{{ store.statusStats.inProgress }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <el-icon :size="24" class="text-purple-600"><Checked /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">待验收</p>
            <p class="text-2xl font-bold text-gray-800">{{ store.statusStats.waitingAcceptance }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <el-icon :size="24" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">已完成</p>
            <p class="text-2xl font-bold text-gray-800">{{ store.statusStats.completed }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 + 操作按钮 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <!-- 状态筛选 -->
        <el-select
          v-model="filters.status"
          placeholder="任务状态"
          clearable
          size="default"
          style="width: 140px"
          @change="handleFilterChange"
        >
          <el-option label="待执行" value="pending" />
          <el-option label="已接受" value="accepted" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="待验收" value="waiting_acceptance" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>

        <!-- 优先级筛选 -->
        <el-select
          v-model="filters.priority"
          placeholder="优先级"
          clearable
          size="default"
          style="width: 120px"
          @change="handleFilterChange"
        >
          <el-option label="紧急" value="urgent" />
          <el-option label="高" value="high" />
          <el-option label="普通" value="normal" />
        </el-select>

        <!-- 关键词搜索 -->
        <el-input
          v-model="filters.keyword"
          placeholder="搜索任务编号/名称/执行人"
          clearable
          size="default"
          style="width: 260px"
          @clear="handleFilterChange"
          @keyup.enter="handleFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button type="primary" @click="handleFilterChange">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>

        <el-button @click="handleResetFilters">重置</el-button>

        <div class="flex-1" />

        <!-- 快捷操作 -->
        <el-button type="success" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
        <el-button @click="handleBatchImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 任务列表表格 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <el-table
        v-loading="store.loading"
        :data="store.filteredTasks"
        stripe
        size="default"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column prop="taskCode" label="任务编号" width="150" />
        <el-table-column prop="title" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="typeName" label="任务类型" width="100" align="center" />
        <el-table-column prop="assigneeName" label="执行人" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.assigneeName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="区域" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.greenhouseName || row.field || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small" effect="plain">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="截止日期" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-red-500': isOverdue(row) }">
              {{ row.dueDate || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button link type="primary" size="small" @click="handleViewDetail(row)">
                查看
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                link type="warning" size="small"
                @click="handleWithdraw(row)"
              >
                撤回
              </el-button>
              <el-button
                v-if="row.status === 'pending' || row.status === 'accepted'"
                link type="danger" size="small"
                @click="handleCancel(row)"
              >
                取消
              </el-button>
              <el-button
                v-if="['accepted', 'in_progress', 'failed'].includes(row.status)"
                link type="info" size="small"
                @click="handleReassign(row)"
              >
                重派
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          :current-page="store.pagination.page"
          :page-size="store.pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="store.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新建任务弹窗 -->
    <el-dialog v-model="showCreateDialog" title="新建任务" width="560px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createFormRules" label-width="100px">
        <el-form-item label="任务名称" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择任务类型" style="width: 100%">
            <el-option label="施肥" value="fertilization" />
            <el-option label="灌溉" value="irrigation" />
            <el-option label="修剪" value="pruning" />
            <el-option label="植保" value="pesticide" />
            <el-option label="除草" value="weeding" />
            <el-option label="采收" value="harvest" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="温室区域" prop="greenhouseName">
          <el-input v-model="createForm.greenhouseName" placeholder="请输入温室/区域名称" />
        </el-form-item>
        <el-form-item label="执行人" prop="assigneeName">
          <el-input v-model="createForm.assigneeName" placeholder="请输入执行人姓名" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="createForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="普通" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="createForm.dueDate"
            type="date"
            placeholder="请选择截止日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateTask">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 取消任务确认弹窗 -->
    <el-dialog v-model="showCancelDialog" title="取消任务" width="420px" destroy-on-close>
      <p class="text-sm text-gray-600 mb-4">
        确定要取消任务 <span class="font-medium text-gray-800">{{ currentTask?.title }}</span> 吗？
      </p>
      <el-input
        v-model="cancelReason"
        type="textarea"
        placeholder="请输入取消原因"
        :rows="2"
      />
      <template #footer>
        <el-button @click="showCancelDialog = false">关闭</el-button>
        <el-button type="danger" :loading="actionLoading" @click="confirmCancel">确认取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Grape, Clock, Loading, Checked, CircleCheck,
  Search, Plus, Upload, Download
} from '@element-plus/icons-vue'
import { useFarmTaskStore } from '@/stores/modules/farmTask'
import { ElMessage, ElMessageBox } from 'element-plus'

// ========== Store ==========
const store = useFarmTaskStore()

// ========== 筛选状态 ==========
const filters = reactive({
  status: '',
  priority: '',
  keyword: '',
})

// ========== 新建任务 ==========
const showCreateDialog = ref(false)
const createLoading = ref(false)
const createFormRef = ref(null)
const createForm = reactive({
  title: '',
  type: '',
  greenhouseName: '',
  assigneeName: '',
  priority: 'normal',
  dueDate: '',
})

const createFormRules = {
  title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  greenhouseName: [{ required: true, message: '请输入温室区域', trigger: 'blur' }],
  assigneeName: [{ required: true, message: '请输入执行人', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
}

// ========== 取消任务 ==========
const showCancelDialog = ref(false)
const cancelReason = ref('')
const currentTask = ref(null)
const actionLoading = ref(false)

// ========== 类型名称映射 ==========
const typeLabelMap = {
  fertilization: '施肥',
  irrigation: '灌溉',
  pruning: '修剪',
  pesticide: '植保',
  weeding: '除草',
  harvest: '采收',
  other: '其他',
}

// ========== 状态映射 ==========
const statusLabelMap = {
  draft: '草稿',
  pending: '待执行',
  accepted: '已接受',
  in_progress: '进行中',
  waiting_acceptance: '待验收',
  completed: '已完成',
  cancelled: '已取消',
  abandoned: '已放弃',
  rejected: '已驳回',
  failed: '失败',
}

const statusTypeMap = {
  draft: 'info',
  pending: 'info',
  accepted: '',
  in_progress: 'warning',
  waiting_acceptance: '',
  completed: 'success',
  cancelled: 'danger',
  abandoned: 'danger',
  rejected: 'danger',
  failed: 'danger',
}

// ========== 优先级映射 ==========
const priorityLabelMap = {
  urgent: '紧急',
  high: '高',
  normal: '普通',
}

const priorityTypeMap = {
  urgent: 'danger',
  high: 'warning',
  normal: 'info',
}

// ========== 辅助函数 ==========
const getStatusType = (status) => statusTypeMap[status] || 'info'
const getStatusLabel = (status) => statusLabelMap[status] || status
const getPriorityType = (priority) => priorityTypeMap[priority] || 'info'
const getPriorityLabel = (priority) => priorityLabelMap[priority] || priority

/** 判断是否超期 */
const isOverdue = (row) => {
  if (!row.dueDate) return false
  if (['completed', 'cancelled', 'abandoned'].includes(row.status)) return false
  return row.dueDate < new Date().toISOString().split('T')[0]
}

// ========== 筛选操作 ==========
const handleFilterChange = () => {
  store.setFilters({
    status: filters.status,
    priority: filters.priority,
    keyword: filters.keyword,
  })
  store.setPage(1)
  store.fetchTasks({ page: 1 })
}

const handleResetFilters = () => {
  filters.status = ''
  filters.priority = ''
  filters.keyword = ''
  store.resetFilters()
  store.setPage(1)
  store.fetchTasks({ page: 1 })
}

// ========== 分页操作 ==========
const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchTasks({ page })
}

const handleSizeChange = (size) => {
  store.setPageSize(size)
  store.fetchTasks({ page: 1 })
}

// ========== 任务操作 ==========
const handleViewDetail = (row) => {
  ElMessage.info(`查看任务详情: ${row.taskCode}`)
  // TODO: 后续实现详情弹窗
}

const handleWithdraw = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要撤回任务 "${row.title}" 吗？`,
      '撤回确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await store.withdraw(row.id)
    ElMessage.success('任务已撤回')
  } catch {
    // 用户取消
  }
}

const handleCancel = (row) => {
  currentTask.value = row
  cancelReason.value = ''
  showCancelDialog.value = true
}

const confirmCancel = async () => {
  if (!currentTask.value) return
  actionLoading.value = true
  try {
    await store.cancel(currentTask.value.id, cancelReason.value || '手动取消')
    ElMessage.success('任务已取消')
    showCancelDialog.value = false
  } catch (e) {
    ElMessage.error(e.message || '取消失败')
  } finally {
    actionLoading.value = false
  }
}

const handleReassign = (row) => {
  // 重派简化处理：弹出输入框让用户输入新执行人
  ElMessageBox.prompt('请输入新执行人姓名', '重新派发', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async ({ value }) => {
    if (!value || !value.trim()) {
      ElMessage.warning('执行人姓名不能为空')
      return
    }
    try {
      await store.reassign(row.id, value.trim())
      ElMessage.success('任务已重新派发')
    } catch (e) {
      ElMessage.error(e.message || '重派失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// ========== 新建任务 ==========
const handleCreateTask = async () => {
  if (!createFormRef.value) return
  try {
    await createFormRef.value.validate()
  } catch {
    return
  }
  createLoading.value = true
  try {
    const typeName = typeLabelMap[createForm.type] || createForm.type
    await store.createTask({
      title: createForm.title,
      type: createForm.type,
      typeName,
      greenhouseName: createForm.greenhouseName,
      assigneeName: createForm.assigneeName,
      priority: createForm.priority,
      dueDate: createForm.dueDate,
      status: 'pending',
    })
    ElMessage.success('任务创建成功')
    showCreateDialog.value = false
    // 重置表单
    Object.assign(createForm, {
      title: '',
      type: '',
      greenhouseName: '',
      assigneeName: '',
      priority: 'normal',
      dueDate: '',
    })
  } catch (e) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    createLoading.value = false
  }
}

// ========== 批量导入 ==========
const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中')
}

// ========== 导出 ==========
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// ========== 初始化 ==========
onMounted(() => {
  store.fetchTasks({ page: 1 })
})
</script>
