<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Wallet /></el-icon>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">预算申请</h1>
            <p class="text-xs text-gray-500">工资预算申请与审批</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="handleExport">导出</el-button>
          <el-button type="primary" @click="handleAdd">新增申请</el-button>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <el-select v-model="filters.department" placeholder="部门" clearable class="w-[160px]">
          <el-option label="技术部" value="技术部" />
          <el-option label="运营部" value="运营部" />
          <el-option label="市场部" value="市场部" />
        </el-select>
        <el-date-picker
          v-model="filters.month"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="月份"
          class="w-[160px]"
        />
        <el-select v-model="filters.status" placeholder="状态" clearable class="w-[140px]">
          <el-option label="待提交" value="pending" />
          <el-option label="已提交" value="submitted" />
          <el-option label="已审批" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">待提交</p>
        <p class="text-2xl font-bold text-gray-400 mt-1">
          {{ data.filter(r => r.status === '待提交').length }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">已提交</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">
          {{ data.filter(r => r.status === '已提交').length }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">已审批</p>
        <p class="text-2xl font-bold text-green-600 mt-1">
          {{ data.filter(r => r.status === '已审批').length }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">已驳回</p>
        <p class="text-2xl font-bold text-red-600 mt-1">
          {{ data.filter(r => r.status === '已驳回').length }}
        </p>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" border stripe>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="baseAmount" label="基本工资(元)" width="130" align="right">
          <template #default="{ row }">
            {{ row.baseAmount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="bonus" label="奖金(元)" width="110" align="right">
          <template #default="{ row }">
            {{ row.bonus.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="overtime" label="加班费(元)" width="110" align="right">
          <template #default="{ row }">
            {{ row.overtime.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="预算总额(元)" width="140" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-semibold">{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="applyTime" label="申请时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="success" @click="handleApprove(row)" v-if="row.status === 'submitted'">审批</el-button>
            <el-button link type="danger" @click="handleReject(row)" v-if="row.status === 'submitted'">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-500">
          共 {{ total }} 条记录，第 {{ pagination.currentPage }} / {{ totalPages }} 页
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addModalVisible" title="预算申请" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="部门">
          <el-select v-model="formData.department" class="w-full">
            <el-option label="技术部" value="技术部" />
            <el-option label="运营部" value="运营部" />
            <el-option label="市场部" value="市场部" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="formData.month"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="基本工资">
          <el-input-number v-model="formData.baseAmount" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="奖金">
          <el-input-number v-model="formData.bonus" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="加班费">
          <el-input-number v-model="formData.overtime" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="预算详情" width="600px">
      <div v-if="selectedRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="部门">{{ selectedRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="月份">{{ selectedRecord.month }}</el-descriptions-item>
          <el-descriptions-item label="基本工资">{{ selectedRecord.baseAmount.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="奖金">{{ selectedRecord.bonus.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="加班费">{{ selectedRecord.overtime.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="预算总额" class="text-emerald-600">
            <strong>{{ selectedRecord.totalAmount.toLocaleString() }} 元</strong>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecord.status)" size="small">{{ selectedRecord.statusText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedRecord.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ selectedRecord.applyTime }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="selectedRecord.remarks" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">备注</h4>
          <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">{{ selectedRecord.remarks }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
        <el-button type="success" @click="handleApprove(selectedRecord)" v-if="selectedRecord?.status === 'submitted'">审批</el-button>
        <el-button type="danger" @click="handleReject(selectedRecord)" v-if="selectedRecord?.status === 'submitted'">驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = reactive({
  department: '',
  month: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 表格数据
const data = ref([
  {
    id: '1',
    department: '技术部',
    month: '2024-03',
    baseAmount: 80000,
    bonus: 10000,
    overtime: 5000,
    totalAmount: 95000,
    status: 'approved',
    statusText: '已审批',
    applicant: '张三',
    applyTime: '2024-03-20 14:30:00',
    remarks: ''
  },
  {
    id: '2',
    department: '运营部',
    month: '2024-03',
    baseAmount: 60000,
    bonus: 5000,
    overtime: 3000,
    totalAmount: 68000,
    status: 'submitted',
    statusText: '已提交',
    applicant: '李四',
    applyTime: '2024-03-21 10:15:00',
    remarks: ''
  },
  {
    id: '3',
    department: '市场部',
    month: '2024-03',
    baseAmount: 50000,
    bonus: 3000,
    overtime: 0,
    totalAmount: 53000,
    status: 'pending',
    statusText: '待提交',
    applicant: '王五',
    applyTime: '',
    remarks: ''
  },
  {
    id: '4',
    department: '技术部',
    month: '2024-02',
    baseAmount: 75000,
    bonus: 8000,
    overtime: 4000,
    totalAmount: 87000,
    status: 'rejected',
    statusText: '已驳回',
    applicant: '张三',
    applyTime: '2024-02-22 09:00:00',
    remarks: '预算超支，需调整'
  }
])

const total = computed(() => data.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return data.value.slice(start, start + pagination.pageSize)
})

// 弹窗状态
const addModalVisible = ref(false)
const detailModalVisible = ref(false)
const selectedRecord = ref(null)

// 表单数据
const formData = reactive({
  department: '',
  month: '',
  baseAmount: 0,
  bonus: 0,
  overtime: 0,
  remarks: ''
})

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'submitted': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

// 重置
const handleReset = () => {
  filters.department = ''
  filters.month = ''
  filters.status = ''
}

// 查询
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    department: '',
    month: '',
    baseAmount: 0,
    bonus: 0,
    overtime: 0,
    remarks: ''
  })
  addModalVisible.value = true
}

// 提交
const handleSubmit = () => {
  if (!formData.department || !formData.month) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const totalAmount = formData.baseAmount + formData.bonus + formData.overtime
  const newRecord = {
    id: Date.now().toString(),
    ...formData,
    totalAmount,
    status: 'pending',
    statusText: '待提交',
    applicant: '当前用户',
    applyTime: ''
  }
  data.value.unshift(newRecord)
  addModalVisible.value = false
  ElMessage.success('提交成功')
}

// 查看
const handleView = (row) => {
  selectedRecord.value = row
  detailModalVisible.value = true
}

// 审批
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定审批通过「${row.department}」的${row.month}预算申请吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    row.status = 'approved'
    row.statusText = '已审批'
    ElMessage.success('审批成功')
    detailModalVisible.value = false
  } catch {
    // 用户取消
  }
}

// 驳回
const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm(`确定驳回「${row.department}」的${row.month}预算申请吗？`, '驳回确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    row.status = 'rejected'
    row.statusText = '已驳回'
    ElMessage.success('已驳回')
    detailModalVisible.value = false
  } catch {
    // 用户取消
  }
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中')
}
</script>

<style scoped>
.bg-white {
  background-color: white;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.space-y-4 > * + * {
  margin-top: 16px;
}

.grid {
  display: grid;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.text-emerald-600 {
  color: #059669;
}

.font-semibold {
  font-weight: 600;
}
</style>
