<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Clock />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">加班管理</h1>
          <p class="text-xs text-gray-500">员工加班申请与审批管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">待审批</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.pending }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已审批</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ statusCounts.approved }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已驳回</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{{ statusCounts.rejected }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总记录数</p>
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
        <el-select v-model="filters.overtimeType" placeholder="加班类型" clearable class="w-full sm:w-36">
          <el-option label="全部类型" value="" />
          <el-option label="工作日加班" value="weekday" />
          <el-option label="周末加班" value="weekend" />
          <el-option label="节假日加班" value="holiday" />
        </el-select>
        <el-select v-model="filters.status" placeholder="审批状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="待审批" value="pending" />
          <el-option label="已审批" value="approved" />
          <el-option label="已驳回" value="rejected" />
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
        <el-button v-if="!batchMode" size="small" @click="enterExportMode">
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
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table
        ref="tableRef"
        :data="paginatedData"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="batchMode" type="selection" width="55" />
        <el-table-column prop="userName" label="员工姓名" min-width="100" />
        <el-table-column prop="date" label="日期" min-width="120" />
        <el-table-column prop="overtimeType" label="加班类型" min-width="120">
          <template #default="{ row }">
            {{ getOvertimeTypeLabel(row.overtimeType) }}
          </template>
        </el-table-column>
        <el-table-column prop="hours" label="时长(小时)" min-width="100" />
        <el-table-column prop="totalPay" label="加班费(元)" min-width="120">
          <template #default="{ row }">
            {{ row.totalPay ? `¥${row.totalPay.toFixed(2)}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="150" show-overflow-tooltip />
        <el-table-column v-if="!batchMode" label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" link type="success" size="small" @click="approveRecord(row)">批准</el-button>
            <el-button v-if="row.status === 'pending'" link type="danger" size="small" @click="rejectRecord(row)">驳回</el-button>
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
    <el-dialog v-model="detailDialogVisible" title="加班详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="员工姓名">{{ currentRecord.userName }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ currentRecord.date }}</el-descriptions-item>
          <el-descriptions-item label="加班类型">{{ getOvertimeTypeLabel(currentRecord.overtimeType) }}</el-descriptions-item>
          <el-descriptions-item label="时长(小时)">{{ currentRecord.hours }}</el-descriptions-item>
          <el-descriptions-item label="加班费(元)">{{ currentRecord.totalPay ? `¥${currentRecord.totalPay.toFixed(2)}` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentRecord.approvedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑加班' : '新增加班'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="员工姓名" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="formData.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="加班类型" prop="overtimeType">
          <el-select v-model="formData.overtimeType" placeholder="请选择加班类型">
            <el-option label="工作日加班" value="weekday" />
            <el-option label="周末加班" value="weekend" />
            <el-option label="节假日加班" value="holiday" />
          </el-select>
        </el-form-item>
        <el-form-item label="时长(小时)" prop="hours">
          <el-input-number v-model="formData.hours" :min="0.5" :max="24" :step="0.5" />
        </el-form-item>
        <el-form-item label="加班费(元)">
          <el-input-number v-model="formData.totalPay" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="原因" prop="reason">
          <el-input v-model="formData.reason" type="textarea" :rows="3" placeholder="请输入加班原因" />
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
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Clock, Search, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { } from 'element-plus'

// 加班类型映射
const overtimeTypeMap = {
  weekday: '工作日加班',
  weekend: '周末加班',
  holiday: '节假日加班'
}

const getOvertimeTypeLabel = (type) => overtimeTypeMap[type] || type

// 状态映射
const statusMap = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已审批', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 筛选条件
const filters = reactive({
  keyword: '',
  overtimeType: '',
  status: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize,
  total: 0
})

// 批量操作模式
const batchMode = ref(false)
const selectedRows = ref([])
const tableRef = ref()

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 表单弹窗
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  id: null | null,
  userName: '',
  date: '',
  overtimeType: 'weekday',
  hours,
  totalPay,
  reason: '',
  remarks: ''
})

const formRules = {
  userName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  overtimeType: [{ required: true, message: '请选择加班类型', trigger: 'change' }],
  hours: [{ required: true, message: '请输入时长', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入加班原因', trigger: 'blur' }]
}

// 模拟数据
const allData = ref([
  { id, userName: '张三', date: '2026-05-20', overtimeType: 'weekday', hours, totalPay, reason: '项目紧急上线', status: 'pending', approver: '', approvedAt: '' },
  { id, userName: '李四', date: '2026-05-18', overtimeType: 'weekend', hours, totalPay, reason: '设备维护', status: 'approved', approver: '王经理', approvedAt: '2026-05-18 17:00' },
  { id, userName: '王五', date: '2026-05-15', overtimeType: 'holiday', hours, totalPay, reason: '节假日值班', status: 'approved', approver: '王经理', approvedAt: '2026-05-15 12:00' },
  { id, userName: '赵六', date: '2026-05-10', overtimeType: 'weekday', hours, totalPay, reason: '客户需求变更', status: 'rejected', approver: '王经理', approvedAt: '2026-05-10 15:00' }
])

// 统计
const statusCounts = computed(() => ({
  pending: allData.value.filter(r => r.status === 'pending').length,
  approved: allData.value.filter(r => r.status === 'approved').length,
  rejected: allData.value.filter(r => r.status === 'rejected').length,
  total: allData.value.length
}))

// 筛选后的数据
const filteredData = computed(() => {
  pagination.total = allData.value.length
  return allData.value.filter(record => {
    if (filters.keyword && !record.userName.includes(filters.keyword)) return false
    if (filters.overtimeType && record.overtimeType !== filters.overtimeType) return false
    if (filters.status && record.status !== filters.status) return false
    return true
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.overtimeType = ''
  filters.status = ''
  filters.dateRange = []
  pagination.currentPage = 1
}

// 批量模式
const enterBatchMode = () => {
  batchMode.value = 'edit'
}

const enterDeleteMode = () => {
  batchMode.value = 'delete'
}

const enterExportMode = () => {
  batchMode.value = 'export'
}

const cancelBatchMode = () => {
  batchMode.value = false
  selectedRows.value = []
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页
const handlePageSizeChange = () => {
  pagination.currentPage = 1
}

// 详情
const viewDetail = (row) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 编辑
const editRecord = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  formDialogVisible.value = true
}

// 新增
const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, {
    id,
    userName: '',
    date: new Date().toISOString().split('T')[0],
    overtimeType: 'weekday',
    hours,
    totalPay,
    reason: '',
    remarks: ''
  })
  formDialogVisible.value = true
}

// 批准
const approveRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要批准该加班申请吗？', '确认批准', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = allData.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      allData.value[index].status = 'approved'
      allData.value[index].approver = '当前用户'
      allData.value[index].approvedAt = new Date().toLocaleString()
    }
    ElMessage.success('已批准')
  } catch {
    // 取消操作
  }
}

// 驳回
const rejectRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要驳回该加班申请吗？', '确认驳回', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = allData.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      allData.value[index].status = 'rejected'
      allData.value[index].approver = '当前用户'
      allData.value[index].approvedAt = new Date().toLocaleString()
    }
    ElMessage.success('已驳回')
  } catch {
    // 取消操作
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = allData.value.findIndex(r => r.id === formData.id)
        if (index !== -1) {
          allData.value[index] = { ...allData.value[index], ...formData }
        }
        ElMessage.success('编辑成功')
      } else {
        allData.value.unshift({
          id: Date.now(),
          ...formData,
          status: 'pending',
          approver: '',
          approvedAt: ''
        })
        ElMessage.success('新增成功')
      }
      formDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>
