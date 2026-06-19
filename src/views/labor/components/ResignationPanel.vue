<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <UserMinus />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">离职申请</h1>
          <p class="text-xs text-gray-500">员工离职申请与审批管理</p>
        </div>
      </div>
    </div>

    <!-- 3 KPI 卡片（V1.1 L64-98） -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
      <div class="bg-amber-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#d97706"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-amber-700">{{ statusCounts.待审批 }}</p>
            <p class="text-xs text-amber-600">待审批</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#16a34a"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-green-700">{{ statusCounts.已通过 }}</p>
            <p class="text-xs text-green-600">已通过</p>
          </div>
        </div>
      </div>
      <div class="bg-red-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#dc2626"><Ban /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-red-700">{{ statusCounts.已拒绝 }}</p>
            <p class="text-xs text-red-600">已拒绝</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏（V1.1 ResignationPageFilters） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索员工姓名..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="待审批" value="待审批" />
          <el-option label="已通过" value="已通过" />
          <el-option label="已拒绝" value="已拒绝" />
        </el-select>
        <div class="flex gap-2">
          <el-button type="warning" @click="handleResetFilters"><el-icon><RotateCcw /></el-icon> 重置</el-button>
          <el-button type="default" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 离职申请记录表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">离职申请记录</h3>
        <div class="flex gap-2">
          <template v-if="batchMode === 'none'">
            <el-button size="small" type="primary" @click="openCreateModal"><el-icon><Plus /></el-icon> 新增离职申请</el-button>
            <el-button size="small" type="primary" @click="setBatchMode('approve')"><el-icon><Check /></el-icon> 批量通过</el-button>
            <el-button size="small" type="danger" @click="setBatchMode('reject')"><el-icon><X /></el-icon> 批量驳回</el-button>
            <el-button size="small" @click="setBatchMode('export')"><el-icon><Download /></el-icon> 导出</el-button>
          </template>
          <template v-else>
            <el-button v-if="batchMode === 'approve'" size="small" type="primary" :disabled="!selectedRowKeys.length" @click="handleBatchApprove">
              <el-icon><Check /></el-icon> 确认通过 ({{ selectedRowKeys.length }})
            </el-button>
            <el-button v-if="batchMode === 'reject'" size="small" type="danger" :disabled="!selectedRowKeys.length" @click="handleBatchReject">
              <el-icon><X /></el-icon> 确认驳回 ({{ selectedRowKeys.length }})
            </el-button>
            <el-button v-if="batchMode === 'export'" size="small" @click="handleExport">
              <el-icon><Download /></el-icon> 确认导出 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length}条)` : '(全部)' }}
            </el-button>
            <el-button size="small" @click="cancelBatch"><el-icon><X /></el-icon> 取消</el-button>
          </template>
        </div>
      </div>

      <div class="overflow-auto">
        <el-table :data="paginatedFilteredData" stripe v-loading="loading" @selection-change="handleSelectionChange">
          <el-table-column v-if="batchMode !== 'none'" type="selection" width="55" />
          <el-table-column prop="employeeName" label="员工" min-width="100" />
          <el-table-column prop="department" label="部门" min-width="100" />
          <el-table-column prop="position" label="岗位" min-width="100" />
          <el-table-column prop="joinDate" label="入职日期" min-width="120" />
          <el-table-column prop="applyDate" label="申请日期" min-width="120" />
          <el-table-column prop="resignDate" label="离职日期" min-width="120" />
          <el-table-column prop="resignationType" label="离职类型" min-width="100" />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span :class="getStatusClass(row.status)">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" :icon="Eye" link @click="openDetailModal(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '待审批'" content="通过" placement="top">
                <el-button size="small" :icon="Check" link type="success" @click="handleApprove(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '待审批'" content="驳回" placement="top">
                <el-button size="small" :icon="XCircle" link type="danger" @click="handleReject(row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <template #empty>
            <div class="text-center py-8"><p class="text-gray-400">{{ error || '暂无数据' }}</p></div>
          </template>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filteredData.length }} 条</div>
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" :total="filteredData.length"
          layout="sizes, prev, pager, next, jumper" background
          @size-change="handlePageSizeChange" />
      </div>
    </div>

    <!-- 新增离职申请弹窗（V1.1 CreateModal L134-143 - 关键 P0-MD-018 修复） -->
    <el-dialog v-model="createDialogVisible" title="新增离职申请" width="640px">
      <el-form ref="createFormRef" :model="createFormData" :rules="createFormRules" label-width="120px">
        <el-form-item label="员工" prop="employeeName">
          <el-select v-model="createFormData.employeeName" placeholder="请选择员工" filterable style="width:100%">
            <el-option v-for="w in WORKER_OPTIONS" :key="w.name" :label="`${w.name} - ${w.position}`" :value="w.name" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工作交接人" prop="handoverUser">
              <el-select v-model="createFormData.handoverUser" placeholder="请选择工作交接人" filterable style="width:100%">
                <el-option v-for="w in WORKER_OPTIONS" :key="w.name" :label="w.name" :value="w.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="离职类型" prop="resignationType">
              <el-select v-model="createFormData.resignationType" placeholder="请选择离职类型" style="width:100%">
                <el-option label="主动辞职" value="主动辞职" />
                <el-option label="被动辞退" value="被动辞退" />
                <el-option label="合同到期" value="合同到期" />
                <el-option label="协商解除" value="协商解除" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="期望离职日期" prop="resignDate">
          <el-date-picker v-model="createFormData.resignDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="离职原因" prop="reason">
          <el-input v-model="createFormData.reason" type="textarea" :rows="3" placeholder="请详细说明离职原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateForm">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="离职详情" width="640px">
      <div v-if="currentRecord" class="space-y-2">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="员工">{{ currentRecord.employeeName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ currentRecord.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentRecord.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="预计离职日期">{{ currentRecord.resignDate }}</el-descriptions-item>
          <el-descriptions-item label="离职类型">{{ currentRecord.resignationType }}</el-descriptions-item>
          <el-descriptions-item label="工作交接人">{{ currentRecord.handoverUser || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态" :span="2">
            <span :class="getStatusClass(currentRecord.status)">{{ currentRecord.status }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="离职原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentRecord.approvedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">{{ currentRecord.comment || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 离职申请 Panel
 * 1:1 对应 V1.1 pages/labor/ResignationPage.tsx
 * 关键 P0-MD-018：新增表单弹窗 + 批量通过/驳回 + 导出
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserMinus, Search, RotateCcw, Plus, Check, X, Download, Eye, XCircle, Clock, CircleCheck , Ban } from 'lucide-vue-next'

// 员工下拉选项（V1.1 useWorkerOptions）
const WORKER_OPTIONS = [
  { name: '张明', department: '生产部', position: '生产主管', joinDate: '2020-05-01' },
  { name: '李华', department: '技术部', position: '技术总监', joinDate: '2019-03-15' },
  { name: '王芳', department: '人事部', position: '人事经理', joinDate: '2021-08-10' },
  { name: '赵强', department: '销售部', position: '销售经理', joinDate: '2022-01-20' },
  { name: '孙丽', department: '财务部', position: '财务经理', joinDate: '2020-11-01' },
  { name: '周建军', department: '生产部', position: '农技员', joinDate: '2023-06-01' },
  { name: '吴海', department: '生产部', position: '安全员', joinDate: '2022-09-15' }
]

const getStatusClass = (status) => {
  const map = {
    '待审批': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
    '已通过': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700',
    '已拒绝': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
  }
  return map[status] || 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
}

const initialResignations = [
  { id: '1', employeeName: '钱小宝', department: '生产部', position: '农技员', joinDate: '2024-03-01', applyDate: '2026-05-15', resignDate: '2026-06-15', resignationType: '主动辞职', handoverUser: '张明', reason: '个人职业发展', status: '待审批' },
  { id: '2', employeeName: '孙小军', department: '仓储部', position: '仓库管理员', joinDate: '2023-06-01', applyDate: '2026-05-10', resignDate: '2026-06-01', resignationType: '合同到期', handoverUser: '李华', reason: '合同到期不续签', status: '已通过', approver: '王经理', approvedAt: '2026-05-12', comment: '同意，按时办理' },
  { id: '3', employeeName: '李明', department: '销售部', position: '销售经理', joinDate: '2022-01-20', applyDate: '2026-04-20', resignDate: '2026-05-20', resignationType: '协商解除', handoverUser: '赵强', reason: '双方协商一致解除劳动合同', status: '已通过', approver: '李总', approvedAt: '2026-04-22', comment: '同意' },
  { id: '4', employeeName: '陈某', department: '综合办', position: '人事专员', joinDate: '2025-03-15', applyDate: '2026-05-05', resignDate: '2026-05-31', resignationType: '主动辞职', handoverUser: '王芳', reason: '家庭原因', status: '待审批' },
  { id: '5', employeeName: '王某', department: '生产部', position: '生产工人', joinDate: '2023-08-01', applyDate: '2026-04-15', resignDate: '2026-05-01', resignationType: '被动辞退', handoverUser: '周建军', reason: '严重违反公司规章制度', status: '已拒绝', approver: '李总', approvedAt: '2026-04-18', comment: '需补充材料再议' }
]

const resignations = ref([...initialResignations])
const loading = ref(false)
const error = ref('')

const filters = reactive({ keyword: '', status: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// 批量模式
const batchMode = ref('none')
const selectedRowKeys = ref([])

// 新增表单
const createDialogVisible = ref(false)
const createFormRef = ref()
const createFormData = reactive({
  employeeName: '', handoverUser: '', resignationType: '主动辞职',
  resignDate: '', reason: ''
})
const createFormRules = {
  employeeName: [{ required: true, message: '请选择员工', trigger: 'change' }],
  handoverUser: [{ required: true, message: '请选择工作交接人', trigger: 'change' }],
  resignationType: [{ required: true, message: '请选择离职类型', trigger: 'change' }],
  resignDate: [{ required: true, message: '请选择离职日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入离职原因', trigger: 'blur' }]
}

const detailDialogVisible = ref(false)
const currentRecord = ref(null)

const statusCounts = computed(() => ({
  待审批: resignations.value.filter(r => r.status === '待审批').length,
  已通过: resignations.value.filter(r => r.status === '已通过').length,
  已拒绝: resignations.value.filter(r => r.status === '已拒绝').length
}))

const filteredData = computed(() => {
  return resignations.value.filter(r => {
    if (filters.keyword && !r.employeeName.includes(filters.keyword)) return false
    if (filters.status && r.status !== filters.status) return false
    return true
  })
})
const paginatedFilteredData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

onMounted(() => { loading.value = false })

const handleSearch = () => { pagination.currentPage = 1 }
const handleResetFilters = () => { filters.keyword = ''; filters.status = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }
const handleSelectionChange = (selection) => { selectedRowKeys.value = selection.map(s => s.id) }

const setBatchMode = (mode) => { batchMode.value = mode; selectedRowKeys.value = [] }
const cancelBatch = () => { batchMode.value = 'none'; selectedRowKeys.value = [] }

const openCreateModal = () => {
  Object.assign(createFormData, { employeeName: '', handoverUser: '', resignationType: '主动辞职', resignDate: '', reason: '' })
  createDialogVisible.value = true
}

const submitCreateForm = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    // 从员工选项获取部门和岗位
    const worker = WORKER_OPTIONS.find(w => w.name === createFormData.employeeName)
    const newId = String(resignations.value.length + 1)
    resignations.value.push({
      id: newId,
      employeeName: createFormData.employeeName,
      department: worker?.department || '',
      position: worker?.position || '',
      joinDate: worker?.joinDate || '',
      applyDate: new Date().toISOString().split('T')[0],
      resignDate: createFormData.resignDate,
      resignationType: createFormData.resignationType,
      handoverUser: createFormData.handoverUser,
      reason: createFormData.reason,
      status: '待审批'
    })
    ElMessage.success('离职申请已提交')
    createDialogVisible.value = false
  })
}

// 单条审批
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定审批通过 "${row.employeeName}" 的离职申请吗？`, '确认审批', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    const idx = resignations.value.findIndex(r => r.id === row.id)
    if (idx !== -1) {
      resignations.value[idx] = { ...resignations.value[idx], status: '已通过', approver: '王经理', approvedAt: new Date().toISOString().split('T')[0], comment: '同意' }
      ElMessage.success('已通过')
    }
  } catch { /* 取消 */ }
}

const handleReject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回原因：', '驳回离职申请', { confirmButtonText: '确定驳回', cancelButtonText: '取消', type: 'warning' })
    if (!reason || !reason.trim()) { ElMessage.warning('请输入驳回原因'); return }
    const idx = resignations.value.findIndex(r => r.id === row.id)
    if (idx !== -1) {
      resignations.value[idx] = { ...resignations.value[idx], status: '已拒绝', approver: '王经理', approvedAt: new Date().toISOString().split('T')[0], comment: reason }
      ElMessage.success('已驳回')
    }
  } catch { /* 取消 */ }
}

// 批量审批
const handleBatchApprove = async () => {
  if (!selectedRowKeys.value.length) { ElMessage.warning('请先选择要审批的记录'); return }
  try {
    await ElMessageBox.confirm(`确定要批量通过选中的 ${selectedRowKeys.value.length} 条申请吗？`, '批量审批', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    resignations.value = resignations.value.map(r => {
      if (selectedRowKeys.value.includes(r.id) && r.status === '待审批') {
        return { ...r, status: '已通过', approver: '王经理', approvedAt: new Date().toISOString().split('T')[0], comment: '批量通过' }
      }
      return r
    })
    ElMessage.success('批量通过成功')
    cancelBatch()
  } catch { /* 取消 */ }
}

const handleBatchReject = async () => {
  if (!selectedRowKeys.value.length) { ElMessage.warning('请先选择要驳回的记录'); return }
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回原因：', '批量驳回', { confirmButtonText: '确定驳回', cancelButtonText: '取消', type: 'warning' })
    if (!reason || !reason.trim()) { ElMessage.warning('请输入驳回原因'); return }
    resignations.value = resignations.value.map(r => {
      if (selectedRowKeys.value.includes(r.id) && r.status === '待审批') {
        return { ...r, status: '已拒绝', approver: '王经理', approvedAt: new Date().toISOString().split('T')[0], comment: reason }
      }
      return r
    })
    ElMessage.success('批量驳回成功')
    cancelBatch()
  } catch { /* 取消 */ }
}

const handleExport = () => {
  const selectedData = selectedRowKeys.value.length
    ? resignations.value.filter(r => selectedRowKeys.value.includes(r.id))
    : resignations.value
  const headers = ['员工', '部门', '岗位', '入职日期', '申请日期', '离职日期', '离职类型', '状态']
  const exportData = selectedData.map(r => ({
    '员工': r.employeeName, '部门': r.department, '岗位': r.position,
    '入职日期': r.joinDate, '申请日期': r.applyDate, '离职日期': r.resignDate,
    '离职类型': r.resignationType, '状态': r.status
  }))
  const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `离职申请_${new Date().toISOString().slice(0, 10)}.xls`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
  cancelBatch()
}

const openDetailModal = (row) => { currentRecord.value = row; detailDialogVisible.value = true }
</script>

<style scoped>
/* 继承全局样式 */
</style>