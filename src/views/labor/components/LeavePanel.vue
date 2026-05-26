<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Calendar />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">请假管理</h1>
          <p class="text-xs text-gray-500">员工请假申请与审批管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-amber-700 font-medium">待审批</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.pending }}</p>
      </div>
      <div class="bg-green-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-green-700 font-medium">已通过</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ statusCounts.approved }}</p>
      </div>
      <div class="bg-red-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-red-700 font-medium">已拒绝</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{{ statusCounts.rejected }}</p>
      </div>
      <div class="bg-gray-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-700 font-medium">总记录数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ pagination.total }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索员工姓名..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.leaveType" placeholder="请假类型" clearable class="w-full sm:w-36">
          <el-option label="全部类型" value="" />
          <el-option v-for="item in LEAVE_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.status" placeholder="审批状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option v-for="item in LEAVE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="w-full sm:w-64"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮栏 -->
    <div class="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
      <div class="flex gap-2">
        <el-button v-if="!batchMode" type="primary" size="small" @click="openFormModal">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
        <el-button v-if="!batchMode" type="primary" size="small" @click="enterBatchMode">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button v-if="!batchMode" type="danger" size="small" @click="enterDeleteMode">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
        <el-button v-if="!batchMode" size="small" @click="handleExportClick">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </div>
      <div v-if="batchMode" class="flex items-center gap-2">
        <span class="text-sm text-gray-600">
          已选择 <strong class="text-emerald-600">{{ selectedRows.length }}</strong> 项
          <span v-if="batchMode === 'edit'">（点击批量编辑进入编辑模式）</span>
          <span v-if="batchMode === 'delete'">（确认删除选中的记录）</span>
        </span>
        <el-button size="small" @click="cancelBatchMode">取消</el-button>
        <el-button v-if="batchMode === 'delete'" size="small" type="danger" @click="confirmBatchDelete">确认删除</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table
        ref="tableRef"
        :data="paginatedData"
        stripe
        v-loading="loading"
        :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }"
        @selection-change="handleSelectionChange"
      >
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无数据' }}</p>
          </div>
        </template>
        <el-table-column v-if="batchMode" type="selection" width="55" />
        <el-table-column prop="staffName" label="员工姓名" min-width="100" />
        <el-table-column prop="leaveType" label="请假类型" min-width="100">
          <template #default="{ row }">
            {{ getLeaveTypeLabel(row.leaveType) }}
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" min-width="120" />
        <el-table-column prop="endDate" label="结束日期" min-width="120" />
        <el-table-column prop="days" label="天数" min-width="80" />
        <el-table-column prop="reason" label="请假原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" min-width="100">
          <template #default="{ row }">
            {{ row.approver || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="!batchMode" label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button size="small" :icon="View" circle @click="viewDetail(row)" />
            </el-tooltip>
            <el-tooltip v-if="row.status === '待审批'" content="批准" placement="top">
              <el-button size="small" :icon="Check" circle type="success" @click="approveRecord(row)" />
            </el-tooltip>
            <el-tooltip v-if="row.status === '待审批'" content="驳回" placement="top">
              <el-button size="small" :icon="Close" circle type="danger" @click="rejectRecord(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between p-4 border-t border-gray-100">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>每页</span>
          <el-select v-model="pagination.pageSize" size="small" style="width: 80px" @change="handlePageSizeChange">
            <el-option :value="10" label="10条" />
            <el-option :value="20" label="20条" />
            <el-option :value="50" label="50条" />
          </el-select>
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="请假详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="员工姓名">{{ currentRecord.staffName || currentRecord.userName }}</el-descriptions-item>
          <el-descriptions-item label="请假类型">{{ getLeaveTypeLabel(currentRecord.leaveType) }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentRecord.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentRecord.endDate }}</el-descriptions-item>
          <el-descriptions-item label="天数">{{ currentRecord.days }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="请假原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentRecord.approveTime || currentRecord.approvedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑请假' : '新增请假'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="员工姓名" prop="staffName">
          <el-select v-model="formData.staffName" placeholder="请选择员工" filterable style="width: 100%" @focus="ensureWorkerList">
            <el-option
              v-for="worker in laborStore.workerList"
              :key="worker.id"
              :label="worker.name || worker.staffName || worker.id"
              :value="worker.name || worker.staffName || worker.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="formData.leaveType" placeholder="请选择请假类型">
            <el-option v-for="item in LEAVE_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="天数">
          <el-input v-model="formData.days" readonly placeholder="自动计算" />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input v-model="formData.reason" type="textarea" :rows="3" placeholder="请输入请假原因" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="400px">
      <div class="flex flex-col gap-3 py-2">
        <el-radio-group v-model="exportFormat">
          <div class="flex flex-col gap-2">
            <el-radio value="excel">Excel (.xls)</el-radio>
            <el-radio value="csv">CSV (.csv)</el-radio>
            <el-radio value="word">Word (.doc)</el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确定导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { Calendar, Search, Plus, Edit, Delete, Download, View, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'
import { LEAVE_TYPE_OPTIONS, LEAVE_STATUS_OPTIONS } from '@/data/laborData'

// 请假类型标签映射
const leaveTypeMap = Object.fromEntries(LEAVE_TYPE_OPTIONS.map(o => [o.value, o.label]))
const getLeaveTypeLabel = (type) => leaveTypeMap[type] || type

// 状态映射
const statusMap = {
  '待审批': { label: '待审批', type: 'warning' },
  '已通过': { label: '已通过', type: 'success' },
  '已拒绝': { label: '已拒绝', type: 'danger' },
  '已取消': { label: '已取消', type: 'info' },
  '已撤回': { label: '已撤回', type: 'info' }
}
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// Labor Store
const laborStore = useLaborStore()

// 导出功能
const { exportWithFormatSelect } = useExport({ fileName: '请假记录' })
const exportColumns = [
  { key: 'staffName', label: '员工姓名' },
  { key: 'leaveType', label: '请假类型' },
  { key: 'startDate', label: '开始日期' },
  { key: 'endDate', label: '结束日期' },
  { key: 'days', label: '天数' },
  { key: 'reason', label: '原因' },
  { key: 'status', label: '状态' }
]

// 筛选条件
const filters = reactive({
  keyword: '',
  leaveType: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载状态
const loading = ref(false)
const error = ref('')

// 批量操作
const batchMode = ref(false)
const selectedRows = ref([])
const tableRef = ref()

// 导出弹窗
const exportModalVisible = ref(false)
const exportFormat = ref('excel')

// 弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  id: null,
  staffId: '',
  staffName: '',
  leaveType: '年假',
  startDate: '',
  endDate: '',
  days: 1,
  reason: '',
  remarks: ''
})

const formRules = {
  staffName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  days: [{ required: true, message: '请输入天数', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }]
}

// 数据
const allData = ref([])

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize }
    if (filters.keyword) params.staffName = filters.keyword
    if (filters.leaveType) params.leaveType = filters.leaveType
    if (filters.status) params.status = filters.status
    if (filters.dateRange?.length === 2) {
      params.startDate = filters.dateRange[0]
      params.endDate = filters.dateRange[1]
    }
    await laborStore.fetchLeaveList(params)
    allData.value = laborStore.leaveList
    pagination.total = laborStore.leaveTotal
  } catch (e) {
    console.error('加载请假数据失败:', e)
    error.value = '加载数据失败'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 统计
const statusCounts = computed(() => ({
  pending: allData.value.filter(r => r.status === '待审批').length,
  approved: allData.value.filter(r => r.status === '已通过').length,
  rejected: allData.value.filter(r => r.status === '已拒绝').length,
  total: allData.value.length
}))

// 筛选后数据
const filteredData = computed(() => allData.value)

// 分页数据
const paginatedData = computed(() => allData.value)

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.leaveType = ''
  filters.status = ''
  filters.dateRange = []
  pagination.currentPage = 1
  loadData()
}

// 批量模式
const enterBatchMode = () => { batchMode.value = 'edit' }
const enterDeleteMode = () => { batchMode.value = 'delete' }
const cancelBatchMode = () => { batchMode.value = false; selectedRows.value = [] }
const handleSelectionChange = (selection) => { selectedRows.value = selection }
const handlePageSizeChange = () => { pagination.currentPage = 1; loadData() }

// 批量删除
const confirmBatchDelete = async () => {
  if (selectedRows.value.length === 0) { ElMessage.warning('请先选择记录'); return }
  try {
    await ElMessageBox.confirm(`确定删除选中的${selectedRows.value.length}条记录？`, '批量删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    for (const row of selectedRows.value) {
      await laborStore.deleteLeave(row.id)
    }
    ElMessage.success(`已删除${selectedRows.value.length}条记录`)
    cancelBatchMode()
    loadData()
  } catch { /* 用户取消或错误 */ }
}

// 导出
const handleExportClick = () => {
  if (allData.value.length === 0) { ElMessage.warning('没有可导出的数据'); return }
  exportModalVisible.value = true
}
const handleConfirmExport = () => {
  exportWithFormatSelect(allData.value, exportColumns, exportFormat.value)
  exportModalVisible.value = false
}

// 详情
const viewDetail = (row) => { currentRecord.value = row; detailDialogVisible.value = true }

// 编辑
const editRecord = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id, staffId: row.staffId || '', staffName: row.staffName || row.userName || '',
    leaveType: row.leaveType, startDate: row.startDate, endDate: row.endDate,
    days: row.days, reason: row.reason, remarks: row.remarks || ''
  })
  formDialogVisible.value = true
}

// 新增
const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, { id: null, staffId: '', staffName: '', leaveType: '年假', startDate: '', endDate: '', days: 1, reason: '', remarks: '' })
  formDialogVisible.value = true
}

// 批准
const approveRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要批准该请假申请吗？', '确认批准', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await laborStore.approveLeave(row.id, { approver: '当前用户' })
    ElMessage.success('已批准')
    loadData()
  } catch { /* 取消 */ }
}

// 驳回
const rejectRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要驳回该请假申请吗？', '确认驳回', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await laborStore.rejectLeave(row.id, { approver: '当前用户' })
    ElMessage.success('已驳回')
    loadData()
  } catch { /* 取消 */ }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const payload = {
        staffId: formData.staffId,
        staffName: formData.staffName,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days,
        reason: formData.reason,
        remarks: formData.remarks
      }
      if (isEdit.value) {
        await laborStore.updateLeave(formData.id, payload)
        ElMessage.success('编辑成功')
      } else {
        await laborStore.createLeave(payload)
        ElMessage.success('新增成功')
      }
      formDialogVisible.value = false
      loadData()
    }
  })
}

// 监听开始/结束日期，自动计算天数
watch(
  () => [formData.startDate, formData.endDate],
  ([start, end]) => {
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      formData.days = diffDays > 0 ? diffDays : 0
    }
  }
)

// 确保员工列表已加载
const ensureWorkerList = () => {
  if (laborStore.workerList.length === 0) {
    laborStore.fetchWorkers()
  }
}

onMounted(() => { loadData(); ensureWorkerList() })
</script>

<style scoped>
/* 继承全局样式 */
</style>
