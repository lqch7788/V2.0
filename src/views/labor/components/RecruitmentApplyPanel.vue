<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <User />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">招聘申请</h1>
          <p class="text-xs text-gray-500">员工提交招聘需求与上级审批</p>
        </div>
      </div>
    </div>

    <!-- 筛选栏（V1.1 L75-130 多字段筛选） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索申请人、职位..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.department" placeholder="全部部门" clearable class="w-full sm:w-32">
          <el-option label="全部部门" value="" />
          <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
        <el-select v-model="filters.position" placeholder="全部职位" clearable class="w-full sm:w-32">
          <el-option label="全部职位" value="" />
          <el-option v-for="p in POSITION_OPTIONS" :key="p" :label="p" :value="p" />
        </el-select>
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

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">招聘申请记录</h3>
        <div class="flex gap-2">
          <template v-if="batchMode === 'none'">
            <el-button size="small" type="primary" @click="openApplyForm"><el-icon><Plus /></el-icon> 新增招聘</el-button>
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
          <el-table-column prop="applicant" label="申请人" min-width="100" />
          <el-table-column prop="department" label="部门" min-width="100" />
          <el-table-column prop="position" label="申请职位" min-width="120" />
          <el-table-column label="人数" min-width="80" align="center">
            <template #default="{ row }">{{ row.headcount }} 人</template>
          </el-table-column>
          <el-table-column prop="reason" label="申请原因" min-width="150" show-overflow-tooltip />
          <el-table-column prop="applyDate" label="申请日期" min-width="120" />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" :icon="View" circle @click="openDetailModal(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '待审批'" content="通过" placement="top">
                <el-button size="small" :icon="Check" circle type="success" @click="handleApprove(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '待审批'" content="驳回" placement="top">
                <el-button size="small" :icon="XCircle" circle type="danger" @click="handleReject(row)" />
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="招聘申请详情" width="600px">
      <div v-if="currentRecord" class="space-y-2">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人">{{ currentRecord.applicant }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="申请职位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="人数">{{ currentRecord.headcount }} 人</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentRecord.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">{{ currentRecord.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="审批人" :span="2">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">{{ currentRecord.comment || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 表单弹窗（V1.1 完整字段） -->
    <el-dialog v-model="formDialogVisible" title="新增招聘申请" width="640px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="formData.applicant" placeholder="请输入申请人" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="formData.department" placeholder="请选择部门" style="width:100%">
                <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请职位" prop="position">
              <el-select v-model="formData.position" placeholder="请选择职位" style="width:100%">
                <el-option v-for="p in POSITION_OPTIONS" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="人数" prop="headcount">
          <el-input-number v-model="formData.headcount" :min="1" :precision="0" style="width:100%" />
        </el-form-item>
        <el-form-item label="申请原因" prop="reason">
          <el-input v-model="formData.reason" type="textarea" :rows="3" placeholder="请输入申请原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 招聘申请 Panel（V1.1 RecruitmentApplyPage from pages/labor/RecruitmentPage.tsx）
 * 实现批量通过/批量驳回/导出 + 审批详情
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Search, RotateCcw, Plus, Check, X, Download, View, XCircle } from 'lucide-vue-next'
import { DEPT_OPTIONS } from '@/data/laborData'

const POSITION_OPTIONS = ['农技员', '仓库管理员', '销售经理', '财务专员', '人事专员', '生产主管', '实习生', '安全员', '技术员']

const initialApplications = [
  { id: '1', applicant: '张明', department: '生产部', position: '农技员', headcount: 3, reason: '春季播种任务紧迫，需补充技术人员', applyDate: '2026-03-01', status: '待审批' },
  { id: '2', applicant: '李华', department: '仓储部', position: '仓库管理员', headcount: 2, reason: '仓库物资出入库工作量大幅增加', applyDate: '2026-03-05', status: '待审批' },
  { id: '3', applicant: '王芳', department: '技术部', position: '实习生', headcount: 5, reason: '夏季农业科研项目用人需求', applyDate: '2026-03-10', status: '已通过', approver: '王经理', comment: '同意，按计划执行' },
  { id: '4', applicant: '赵强', department: '销售部', position: '销售经理', headcount: 1, reason: '销售团队扩编', applyDate: '2026-02-15', status: '已通过', approver: '李总', comment: '已批' },
  { id: '5', applicant: '孙丽', department: '财务部', position: '财务专员', headcount: 1, reason: '财务部人员调整', applyDate: '2026-02-20', status: '已拒绝', approver: '王经理', comment: '本年度编制已满' },
  { id: '6', applicant: '陈刚', department: '综合办', position: '人事专员', headcount: 1, reason: '人事工作量增加', applyDate: '2026-02-25', status: '待审批' }
]

const getStatusType = (status) => {
  const map = { '待审批': 'warning', '已通过': 'success', '已拒绝': 'danger' }
  return map[status] || 'info'
}

const applications = ref([...initialApplications])
const loading = ref(false)
const error = ref('')

const filters = reactive({ keyword: '', department: '', position: '', status: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// 批量模式：none | approve | reject | export
const batchMode = ref('none')
const selectedRowKeys = ref([])

const formDialogVisible = ref(false)
const formRef = ref()
const formData = reactive({ applicant: '', department: '', position: '', headcount: 1, reason: '' })
const formRules = {
  applicant: [{ required: true, message: '请输入申请人', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请选择职位', trigger: 'change' }],
  headcount: [{ required: true, type: 'number', min: 1, message: '请输入有效人数', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }]
}

const detailDialogVisible = ref(false)
const currentRecord = ref(null)

const filteredData = computed(() => {
  return applications.value.filter(r => {
    if (filters.keyword) {
      const kw = filters.keyword
      if (!r.applicant.includes(kw) && !r.position.includes(kw)) return false
    }
    if (filters.department && r.department !== filters.department) return false
    if (filters.position && r.position !== filters.position) return false
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
const handleResetFilters = () => { filters.keyword = ''; filters.department = ''; filters.position = ''; filters.status = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }
const handleSelectionChange = (selection) => { selectedRowKeys.value = selection.map(s => s.id) }

const setBatchMode = (mode) => {
  batchMode.value = mode
  selectedRowKeys.value = []
}
const cancelBatch = () => { batchMode.value = 'none'; selectedRowKeys.value = [] }

// 单条审批
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定审批通过 "${row.applicant}" 的招聘申请吗？`, '确认审批', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    const idx = applications.value.findIndex(r => r.id === row.id)
    if (idx !== -1) {
      applications.value[idx] = { ...applications.value[idx], status: '已通过', approver: '王经理', comment: '同意' }
      ElMessage.success('已通过')
    }
  } catch { /* 取消 */ }
}

const handleReject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回原因：', '驳回招聘申请', { confirmButtonText: '确定驳回', cancelButtonText: '取消', type: 'warning' })
    if (!reason || !reason.trim()) { ElMessage.warning('请输入驳回原因'); return }
    const idx = applications.value.findIndex(r => r.id === row.id)
    if (idx !== -1) {
      applications.value[idx] = { ...applications.value[idx], status: '已拒绝', approver: '王经理', comment: reason }
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
    applications.value = applications.value.map(r => {
      if (selectedRowKeys.value.includes(r.id) && r.status === '待审批') {
        return { ...r, status: '已通过', approver: '王经理', comment: '批量通过' }
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
    applications.value = applications.value.map(r => {
      if (selectedRowKeys.value.includes(r.id) && r.status === '待审批') {
        return { ...r, status: '已拒绝', approver: '王经理', comment: reason }
      }
      return r
    })
    ElMessage.success('批量驳回成功')
    cancelBatch()
  } catch { /* 取消 */ }
}

const handleExport = () => {
  const selectedData = selectedRowKeys.value.length
    ? applications.value.filter(r => selectedRowKeys.value.includes(r.id))
    : applications.value
  const headers = ['申请人', '部门', '申请职位', '人数', '申请原因', '申请日期', '状态']
  const exportData = selectedData.map(r => ({
    '申请人': r.applicant, '部门': r.department, '申请职位': r.position,
    '人数': r.headcount, '申请原因': r.reason, '申请日期': r.applyDate, '状态': r.status
  }))
  const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `招聘申请_${new Date().toISOString().slice(0, 10)}.xls`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
  cancelBatch()
}

const openDetailModal = (row) => { currentRecord.value = row; detailDialogVisible.value = true }
const openApplyForm = () => {
  Object.assign(formData, { applicant: '', department: '', position: '', headcount: 1, reason: '' })
  formDialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const newId = String(applications.value.length + 1)
    applications.value.push({ id: newId, ...formData, applyDate: new Date().toISOString().split('T')[0], status: '待审批' })
    ElMessage.success('申请已提交')
    formDialogVisible.value = false
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>