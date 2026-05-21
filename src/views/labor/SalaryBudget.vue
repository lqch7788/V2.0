<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Wallet /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">工资预算</h1>
          <p class="text-xs text-gray-500">编制月度工资预算，汇总各部门工资数据</p>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <!-- 部门筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">部门:</span>
          <el-select v-model="filters.department" placeholder="请选择部门" clearable class="w-[160px]">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </div>

        <!-- 月份筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">月份:</span>
          <el-date-picker
            v-model="filters.month"
            type="month"
            placeholder="请选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-[160px]"
          />
        </div>

        <!-- 状态筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">状态:</span>
          <el-select v-model="filters.status" placeholder="请选择状态" clearable class="w-[140px]">
            <el-option label="待提交" value="pending" />
            <el-option label="已提交" value="submitted" />
            <el-option label="已审批" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-2 ml-auto">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="success" @click="handleOpenFormModal">新增</el-button>
          <el-button @click="handleOpenSummary">汇总</el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="baseSalary" label="基本工资(元)" width="130" align="right">
          <template #default="{ row }">
            {{ row.baseSalary.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="overtimePay" label="加班费(元)" width="130" align="right">
          <template #default="{ row }">
            {{ row.overtimePay.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="bonus" label="奖金(元)" width="120" align="right">
          <template #default="{ row }">
            {{ row.bonus.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="deduction" label="扣款(元)" width="120" align="right">
          <template #default="{ row }">
            {{ row.deduction.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="应发合计(元)" width="130" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-semibold">{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitter" label="提交人" width="100" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看</el-button>
            <el-button link type="success" @click="handleApprove(row)" v-if="row.status === '已提交'">审批</el-button>
            <el-button link type="danger" @click="handleReject(row)" v-if="row.status === '已提交'">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-500">
          共 {{ pagination.total }} 条记录，第 {{ pagination.current }} / {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
        </div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="sizes, prev, pager, next"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑表单弹窗 -->
    <el-dialog v-model="formModalVisible" :title="formTitle" width="600px" @close="handleFormClose">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="部门">
          <el-select v-model="formData.department" placeholder="请选择部门" class="w-full">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="formData.month"
            type="month"
            placeholder="请选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="基本工资">
          <el-input-number v-model="formData.baseSalary" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="加班费">
          <el-input-number v-model="formData.overtimePay" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="奖金">
          <el-input-number v-model="formData.bonus" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="扣款">
          <el-input-number v-model="formData.deduction" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="预算详情" width="700px">
      <div v-if="selectedRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="部门">{{ selectedRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="月份">{{ selectedRecord.month }}</el-descriptions-item>
          <el-descriptions-item label="基本工资">{{ selectedRecord.baseSalary.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="加班费">{{ selectedRecord.overtimePay.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="奖金">{{ selectedRecord.bonus.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="扣款">{{ selectedRecord.deduction.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="应发合计" class="text-emerald-600">
            <strong>{{ selectedRecord.totalAmount.toLocaleString() }} 元</strong>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecord.status)" size="small">{{ selectedRecord.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交人">{{ selectedRecord.submitter }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ selectedRecord.submitTime }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="selectedRecord.remarks" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">备注</h4>
          <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">{{ selectedRecord.remarks }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
        <el-button type="success" @click="handleApprove(selectedRecord)" v-if="selectedRecord?.status === '已提交'">审批</el-button>
        <el-button type="danger" @click="handleReject(selectedRecord)" v-if="selectedRecord?.status === '已提交'">驳回</el-button>
      </template>
    </el-dialog>

    <!-- 汇总弹窗 -->
    <el-dialog v-model="summaryModalVisible" title="预算汇总" width="800px">
      <div v-if="summaryData" class="space-y-6">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="bg-emerald-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500 mb-1">部门数</p>
              <p class="text-2xl font-bold text-emerald-600">{{ summaryData.deptCount }}</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500 mb-1">记录数</p>
              <p class="text-2xl font-bold text-blue-600">{{ summaryData.recordCount }}</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500 mb-1">预算总额</p>
              <p class="text-2xl font-bold text-purple-600">{{ summaryData.totalAmount.toLocaleString() }} 元</p>
            </div>
          </el-col>
        </el-row>

        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-3">按部门汇总</h4>
          <el-table :data="summaryData.byDepartment" border size="small">
            <el-table-column prop="department" label="部门" />
            <el-table-column prop="count" label="记录数" width="100" align="center" />
            <el-table-column prop="totalAmount" label="预算总额" width="150" align="right">
              <template #default="{ row }">
                {{ row.totalAmount.toLocaleString() }} 元
              </template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比" width="100" align="center">
              <template #default="{ row }">
                {{ ((row.totalAmount / summaryData.totalAmount) * 100).toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="summaryModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { departments } from '@/data/laborData'

// 筛选条件
const filters = reactive({
  department: '',
  month: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  current,
  pageSize,
  total: 0
})

// 表格数据
const tableData = ref([
  {
    id: '1',
    department: '技术部',
    month: '2024-03',
    baseSalary,
    overtimePay,
    bonus,
    deduction,
    totalAmount,
    status: '已审批',
    submitter: '张三',
    submitTime: '2024-03-25 14:30:00',
    remarks: ''
  },
  {
    id: '2',
    department: '运营部',
    month: '2024-03',
    baseSalary,
    overtimePay,
    bonus,
    deduction,
    totalAmount,
    status: '已提交',
    submitter: '李四',
    submitTime: '2024-03-26 10:15:00',
    remarks: ''
  },
  {
    id: '3',
    department: '市场部',
    month: '2024-03',
    baseSalary,
    overtimePay,
    bonus,
    deduction,
    totalAmount,
    status: '待提交',
    submitter: '王五',
    submitTime: '',
    remarks: ''
  }
])

// 设置总数据条数
pagination.total = tableData.value.length

// 选中的行
const selectedRowKeys = ref([])

// 表单弹窗
const formModalVisible = ref(false)
const formTitle = ref('新增预算')
const formData = reactive({
  department: '',
  month: '',
  baseSalary,
  overtimePay,
  bonus,
  deduction,
  remarks: ''
})

// 详情弹窗
const detailModalVisible = ref(false)
const selectedRecord = ref(null)

// 汇总弹窗
const summaryModalVisible = ref(false)
const summaryData = ref(null)

// 计算总金额
const grandTotal = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.totalAmount, 0)
})

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '待提交': 'info',
    '已提交': 'warning',
    '已审批': 'success',
    '已驳回': 'danger'
  }
  return typeMap[status] || 'info'
}

// 处理筛选重置
const handleReset = () => {
  filters.department = ''
  filters.month = ''
  filters.status = ''
}

// 处理搜索
const handleSearch = () => {
  pagination.current = 1
  ElMessage.success('查询成功')
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRowKeys.value = selection.map(item => item.id)
}

// 处理分页变化
const handlePageChange = (page) => {
  pagination.current = page
}

const handlePageSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
}

// 打开新增表单弹窗
const handleOpenFormModal = () => {
  formTitle.value = '新增预算'
  Object.assign(formData, {
    department: '',
    month: '',
    baseSalary,
    overtimePay,
    bonus,
    deduction,
    remarks: ''
  })
  formModalVisible.value = true
}

// 关闭表单弹窗
const handleFormClose = () => {
  formModalVisible.value = false
}

// 提交表单
const handleSubmit = () => {
  if (!formData.department || !formData.month) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const total = formData.baseSalary + formData.overtimePay + formData.bonus - formData.deduction
  const newRecord = {
    id: Date.now().toString(),
    ...formData,
    totalAmount,
    status: '待提交',
    submitter: '',
    submitTime: ''
  }
  tableData.value.unshift(newRecord)
  pagination.total = tableData.value.length
  formModalVisible.value = false
  ElMessage.success('新增成功')
}

// 查看详情
const handleViewDetail = (row) => {
  selectedRecord.value = row
  detailModalVisible.value = true
}

// 审批
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定审批通过「${row.department}」的${row.month}工资预算吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    row.status = '已审批'
    ElMessage.success('审批成功')
    detailModalVisible.value = false
  } catch {
    // 用户取消
  }
}

// 驳回
const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm(`确定驳回「${row.department}」的${row.month}工资预算吗？`, '驳回确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    row.status = '已驳回'
    ElMessage.success('已驳回')
    detailModalVisible.value = false
  } catch {
    // 用户取消
  }
}

// 汇总
const handleOpenSummary = () => {
  // 计算汇总数据
  const byDepartment = {}
  tableData.value.forEach(item => {
    if (!byDepartment[item.department]) {
      byDepartment[item.department] = { department: item.department, count, totalAmount: 0 }
    }
    byDepartment[item.department].count++
    byDepartment[item.department].totalAmount += item.totalAmount
  })

  summaryData.value = {
    deptCount: Object.keys(byDepartment).length,
    recordCount: tableData.value.length,
    totalAmount: tableData.value.reduce((sum, item) => sum + item.totalAmount, 0),
    byDepartment: Object.values(byDepartment)
  }
  summaryModalVisible.value = true
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

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.space-y-4 > * + * {
  margin-top: 16px;
}

.space-y-6 > * + * {
  margin-top: 24px;
}

.text-emerald-600 {
  color: #059669;
}

.font-semibold {
  font-weight: 600;
}

.bg-emerald-50 {
  background-color: #ecfdf5;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-purple-50 {
  background-color: #faf5ff;
}
</style>
