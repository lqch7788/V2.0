<template>
  <!-- 临时任务Tab - 从V1.1 TempTaskTab.tsx 1:1迁移基础版本 -->
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

    <!-- 统计条 -->
    <div class="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-4 text-sm">
      <span class="text-gray-600">共 <strong class="text-emerald-700">{{ filteredList.length }}</strong> 条</span>
      <span class="text-amber-600">待执行 {{ stats.pending }}</span>
      <span class="text-blue-600">进行中 {{ stats.inProgress }}</span>
      <span class="text-green-600">已完成 {{ stats.completed }}</span>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-lg border border-gray-100">
      <el-table :data="pagedList" style="width: 100%" size="medium" @selection-change="onSelectionChange">
        <el-table-column v-if="batchMode" type="selection" width="45" />
        <el-table-column label="任务编号" width="130">
          <template #default="{ row }">
            <span class="text-blue-600 cursor-pointer hover:underline text-sm" @click="openDetail(row)">{{ row.taskCode }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务名称" min-width="140">
          <template #default="{ row }">{{ row.title }}</template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.tempTaskType)" size="small">{{ row.tempTaskType || '其他' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工作地点" width="110">
          <template #default="{ row }">{{ row.workLocation || '-' }}</template>
        </el-table-column>
        <el-table-column label="执行人" width="80">
          <template #default="{ row }">{{ row.assigneeName || '-' }}</template>
        </el-table-column>
        <el-table-column label="紧急程度" width="85">
          <template #default="{ row }">
            <el-tag :type="getUrgencyTagType(row.urgency)" size="small">{{ urgencyLabel(row.urgency) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="截止日期" width="105">
          <template #default="{ row }">{{ row.dueDate || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-1 flex-wrap">
              <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
              <el-button link type="primary" size="small" @click="openEditModal(row)">编辑</el-button>
              <el-button v-if="row.status === 'pending'" link type="warning" size="small" @click="handleWithdraw(row)">撤回</el-button>
              <el-button v-if="row.status === 'in_progress'" link type="danger" size="small" @click="handleCancel(row)">取消</el-button>
              <el-button v-if="row.status === 'waiting_acceptance'" link type="success" size="small" @click="handleAccept(row)">验收</el-button>
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

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="showFormModal" :title="editingTask ? '编辑临时任务' : '新建临时任务'" width="560px" destroy-on-close>
      <el-form :model="formData" label-width="90px" label-position="right">
        <el-form-item label="任务名称" required>
          <el-input v-model="formData.title" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="formData.tempTaskType" style="width: 100%">
            <el-option v-for="t in TEMP_TASK_TYPE_OPTIONS" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作地点">
          <el-input v-model="formData.workLocation" placeholder="请输入工作地点" />
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="formData.assigneeId" style="width: 100%" filterable placeholder="请选择执行人">
            <el-option v-for="u in userOptions" :key="u.value" :label="u.label" :value="u.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="formData.dueDate" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
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
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.notes" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFormModal = false">取消</el-button>
        <el-button @click="handleFormDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleFormPublish">发布任务</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="任务详情" width="480px" destroy-on-close>
      <template v-if="selectedTask">
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-gray-500">任务编号：</span>{{ selectedTask.taskCode }}</div>
            <div><span class="text-gray-500">状态：</span><el-tag :type="getStatusTagType(selectedTask.status)" size="small">{{ statusLabel(selectedTask.status) }}</el-tag></div>
            <div><span class="text-gray-500">任务类型：</span>{{ selectedTask.tempTaskType || '其他' }}</div>
            <div><span class="text-gray-500">紧急程度：</span>{{ urgencyLabel(selectedTask.urgency) }}</div>
            <div><span class="text-gray-500">工作地点：</span>{{ selectedTask.workLocation || '-' }}</div>
            <div><span class="text-gray-500">执行人：</span>{{ selectedTask.assigneeName || '-' }}</div>
            <div><span class="text-gray-500">发布人：</span>{{ selectedTask.assignerName || '-' }}</div>
            <div><span class="text-gray-500">截止日期：</span>{{ selectedTask.dueDate || '-' }}</div>
          </div>
          <div v-if="selectedTask.description" class="bg-gray-50 rounded-lg p-3 text-sm">
            <p class="text-gray-500 mb-1">任务描述：</p>
            <p>{{ selectedTask.description }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 临时任务Tab组件 - 从V1.1 TempTaskTab.tsx 1:1迁移基础版本
 * 提供临时任务的创建、编辑、删除、筛选、批量操作功能
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

// ========== 常量 ==========
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

// ========== 演示数据生成 ==========
function generateTempTaskCode(index) {
  const now = new Date()
  const datePrefix = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    now.getDate().toString().padStart(2, '0')
  return `LS${datePrefix}-${String(index).padStart(3, '0')}`
}

function generateTempTaskStatus(index) {
  const statuses = ['pending', 'in_progress', 'waiting_acceptance', 'completed', 'pending', 'in_progress']
  return statuses[index % statuses.length]
}

function generateDemoTempTasks(count = 8) {
  const names = ['张建国', '李永强', '王明辉', '赵志远']
  const locations = ['A1号温室', 'B2号温室', 'C3号温室', 'D5号大棚', '园区公共区域']
  const types = ['病虫害防治', '施肥', '浇水', '除草', '修剪', '采收', '设备维修', '其他']
  const list = []
  const now = new Date()
  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7) + 1)
    list.push({
      id: `tmp-${i}`,
      taskCode: generateTempTaskCode(i),
      title: `临时${types[i % types.length]}任务`,
      tempTaskType: types[i % types.length],
      workLocation: locations[i % locations.length],
      assigneeId: `U00${(i % 4) + 1}`,
      assigneeName: names[i % names.length],
      assignerId: 'U000',
      assignerName: '管理员',
      urgency: ['normal', 'urgent', 'critical'][i % 3],
      status: generateTempTaskStatus(i),
      dueDate: dueDate.toISOString().split('T')[0],
      estimatedHours: Math.floor(Math.random() * 8) + 1,
      description: `临时${types[i % types.length]}作业任务描述`,
      notes: '',
    })
  }
  return list
}

// ========== 状态 ==========
const tempTasks = ref(generateDemoTempTasks(8))
const statusFilter = ref('all')
const urgencyFilter = ref('all')
const searchTerm = ref('')
const batchMode = ref(null)
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

// 表单弹窗
const showFormModal = ref(false)
const editingTask = ref(null)
const formData = ref({
  title: '', tempTaskType: '其他', workLocation: '', assigneeId: '',
  dueDate: '', urgency: 'normal', estimatedHours: 4, description: '', notes: '',
})

// 详情弹窗
const showDetailModal = ref(false)
const selectedTask = ref(null)

// 用户列表
const userStore = useUserStore()
const userOptions = computed(() => {
  const users = userStore.users || []
  if (users.length === 0) {
    return [
      { value: 'U001', label: '张建国' },
      { value: 'U002', label: '李永强' },
      { value: 'U003', label: '王明辉' },
      { value: 'U004', label: '赵志远' },
    ]
  }
  return users.map(u => ({ value: u.id, label: u.name }))
})

// ========== 计算属性 ==========
const filteredList = computed(() => {
  let list = tempTasks.value
  if (statusFilter.value !== 'all') list = list.filter(t => t.status === statusFilter.value)
  if (urgencyFilter.value !== 'all') list = list.filter(t => t.urgency === urgencyFilter.value)
  if (searchTerm.value) {
    const kw = searchTerm.value.toLowerCase()
    list = list.filter(t => (t.taskCode || '').toLowerCase().includes(kw) || (t.title || '').toLowerCase().includes(kw))
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
  completed: filteredList.value.filter(t => t.status === 'completed').length,
}))

// ========== 标签辅助 ==========
function getTypeTagType(type) {
  const map = { '病虫害防治': 'danger', '施肥': 'success', '浇水': '', '除草': 'success', '修剪': 'info', '采收': 'warning', '设备维修': 'danger', '其他': 'info' }
  return map[type] || 'info'
}
function getUrgencyTagType(u) {
  const map = { normal: '', urgent: 'warning', critical: 'danger' }
  return map[u] || 'info'
}
function getStatusTagType(s) {
  const map = { pending: 'info', in_progress: 'warning', waiting_acceptance: '', completed: 'success', cancelled: 'info' }
  return map[s] || 'info'
}
function urgencyLabel(u) {
  const map = { normal: '普通', urgent: '紧急', critical: '非常紧急' }
  return map[u] || u || '普通'
}
function statusLabel(s) {
  const map = { pending: '待执行', in_progress: '进行中', waiting_acceptance: '待验收', completed: '已完成', cancelled: '已取消' }
  return map[s] || s || '-'
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
function confirmBatchAction() {
  if (batchMode.value === 'delete') {
    ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条临时任务吗？此操作不可撤销。`, '批量删除', { type: 'warning' })
      .then(() => {
        tempTasks.value = tempTasks.value.filter(t => !selectedIds.value.includes(t.id))
        ElMessage.success('批量删除完成')
        cancelBatchMode()
      }).catch(() => {})
  }
}
function cancelBatchMode() {
  batchMode.value = null
  selectedIds.value = []
}

// ========== CRUD ==========
function openCreateModal() {
  editingTask.value = null
  formData.value = {
    title: '', tempTaskType: '其他', workLocation: '', assigneeId: '',
    dueDate: '', urgency: 'normal', estimatedHours: 4, description: '', notes: '',
  }
  showFormModal.value = true
}
function openEditModal(task) {
  editingTask.value = task
  formData.value = { ...task }
  showFormModal.value = true
}
function handleFormDraft() {
  saveTempTask('pending')
}
function handleFormPublish() {
  saveTempTask('pending')
}
function saveTempTask(status) {
  if (!formData.value.title.trim()) {
    ElMessage.warning('请输入任务名称')
    return
  }
  const assigneeName = userOptions.value.find(u => u.value === formData.value.assigneeId)?.label || '待分配'
  if (editingTask.value) {
    Object.assign(editingTask.value, formData.value, { assigneeName, status })
    ElMessage.success('任务已更新')
  } else {
    const newTask = {
      ...formData.value,
      id: `tmp-${Date.now()}`,
      taskCode: `LS${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(tempTasks.value.length + 1).padStart(3, '0')}`,
      assigneeName,
      assignerId: 'U000',
      assignerName: '管理员',
      status,
    }
    tempTasks.value.unshift(newTask)
    ElMessage.success('任务已创建')
  }
  showFormModal.value = false
}
function openDetail(task) {
  selectedTask.value = task
  showDetailModal.value = true
}
function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该任务吗？', '删除确认', { type: 'warning' })
    .then(() => {
      tempTasks.value = tempTasks.value.filter(t => t.id !== id)
      ElMessage.success('删除成功')
    }).catch(() => {})
}
function handleWithdraw(task) {
  task.status = 'cancelled'
  ElMessage.success('任务已撤回')
}
function handleCancel(task) {
  task.status = 'cancelled'
  ElMessage.success('任务已取消')
}
function handleAccept(task) {
  task.status = 'completed'
  ElMessage.success('验收通过')
}
</script>
