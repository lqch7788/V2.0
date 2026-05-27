<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><component :is="Wallet" /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">预算申请</h1>
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
        <el-select v-model="filters.deptId" placeholder="部门" clearable class="w-[160px]">
          <el-option label="技术部" value="技术部" />
          <el-option label="运营部" value="运营部" />
          <el-option label="市场部" value="市场部" />
        </el-select>
        <el-date-picker
          v-model="filters.budgetMonth"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="月份"
          class="w-[160px]"
        />
        <el-select v-model="filters.status" placeholder="状态" clearable class="w-[140px]">
          <el-option label="全部状态" value="" />
          <el-option label="待提交" value="待提交" />
          <el-option label="已提交" value="已提交" />
          <el-option label="已审核" value="已审核" />
          <el-option label="已驳回" value="已驳回" />
          <el-option label="已取消" value="已取消" />
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
        <p class="text-sm text-gray-500">已审核</p>
        <p class="text-2xl font-bold text-green-600 mt-1">
          {{ data.filter(r => r.status === '已审核').length }}
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
      <el-table :data="paginatedData" border stripe v-loading="loading">
        <el-table-column prop="budgetCode" label="预算编号" width="140" />
        <el-table-column prop="deptId" label="部门" width="120" />
        <el-table-column prop="budgetMonth" label="月份" width="100" />
        <el-table-column prop="totalBaseSalary" label="基本工资(元)" width="130" align="right">
          <template #default="{ row }">
            ¥{{ row.totalBaseSalary.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalBonus" label="奖金(元)" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.totalBonus.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalOvertimePay" label="加班费(元)" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.totalOvertimePay.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="grandTotal" label="预算总额(元)" width="140" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-semibold">¥{{ row.grandTotal.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="applyTime" label="申请时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="View" circle @click="handleView(row)" />
            <el-button v-if="row.status === '已提交'" size="small" :icon="Select" circle type="success" @click="handleApprove(row)" />
            <el-button v-if="row.status === '已提交'" size="small" :icon="CloseBold" circle type="danger" @click="handleReject(row)" />
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无数据' }}</p>
          </div>
        </template>
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
          <el-select v-model="formData.deptId" class="w-full">
            <el-option label="技术部" value="技术部" />
            <el-option label="运营部" value="运营部" />
            <el-option label="市场部" value="市场部" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="formData.budgetMonth"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="基本工资">
          <el-input-number v-model="formData.totalBaseSalary" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="奖金">
          <el-input-number v-model="formData.totalBonus" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="加班费">
          <el-input-number v-model="formData.totalOvertimePay" :min="0" :precision="2" class="w-full" />
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
          <el-descriptions-item label="部门">{{ selectedRecord.deptId }}</el-descriptions-item>
          <el-descriptions-item label="月份">{{ selectedRecord.budgetMonth }}</el-descriptions-item>
          <el-descriptions-item label="基本工资">{{ selectedRecord.totalBaseSalary.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="奖金">{{ selectedRecord.totalBonus.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="加班费">{{ selectedRecord.totalOvertimePay.toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="预算总额" class="text-emerald-600">
            <strong>{{ selectedRecord.grandTotal.toLocaleString() }} 元</strong>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecord.status)" size="small">{{ selectedRecord.status }}</el-tag>
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
        <el-button type="success" @click="handleApprove(selectedRecord)" v-if="selectedRecord?.status === '已提交'">审批</el-button>
        <el-button type="danger" @click="handleReject(selectedRecord)" v-if="selectedRecord?.status === '已提交'">驳回</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="400px">
      <el-radio-group v-model="exportFormat" class="flex flex-col gap-3">
        <el-radio value="excel">Excel (.xls)</el-radio>
        <el-radio value="csv">CSV (.csv)</el-radio>
        <el-radio value="word">Word (.doc)</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确认导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Wallet, View, Select, CloseBold } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'

// Labor Store
const laborStore = useLaborStore()

// 导出功能
const { exportWithFormatSelect } = useExport({ fileName: '预算记录' })
// 导出列配置（与表格列对应）
const exportColumns = [
  { key: 'budgetCode', label: '预算编号' },
  { key: 'deptId', label: '部门' },
  { key: 'budgetMonth', label: '月份' },
  { key: 'totalBaseSalary', label: '基本工资(元)' },
  { key: 'totalBonus', label: '奖金(元)' },
  { key: 'totalOvertimePay', label: '加班费(元)' },
  { key: 'grandTotal', label: '预算总额(元)' },
  { key: 'status', label: '状态' },
  { key: 'applicant', label: '申请人' },
  { key: 'applyTime', label: '申请时间' }
]

// 状态映射（中文状态值）
const statusMap = {
  '待提交': { label: '待提交', type: 'info' },
  '已提交': { label: '已提交', type: 'warning' },
  '已审核': { label: '已审核', type: 'success' },
  '已驳回': { label: '已驳回', type: 'danger' },
  '已取消': { label: '已取消', type: 'info' }
}

// 筛选条件
const filters = reactive({
  deptId: '',
  budgetMonth: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const data = ref([])
const loading = ref(false)
const error = ref('')

const total = computed(() => pagination.total)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => data.value)

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize }
    if (filters.deptId) params.deptId = filters.deptId
    if (filters.budgetMonth) params.budgetMonth = filters.budgetMonth
    if (filters.status) params.status = filters.status
    await laborStore.fetchBudgetList(params)
    data.value = laborStore.budgetList
    pagination.total = laborStore.budgetTotal
  } catch (e) {
    console.error('加载预算数据失败:', e)
    error.value = '加载数据失败'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 弹窗状态
const addModalVisible = ref(false)
const detailModalVisible = ref(false)
const selectedRecord = ref(null)
// 导出弹窗状态
const exportModalVisible = ref(false)
const exportFormat = ref('excel')

// 表单数据
const formData = reactive({
  deptId: '',
  budgetMonth: '',
  totalBaseSalary: 0,
  totalBonus: 0,
  totalOvertimePay: 0,
  remarks: ''
})

// 获取状态类型
const getStatusType = (status) => {
  return statusMap[status]?.type || 'info'
}

// 重置
const handleReset = () => {
  filters.deptId = ''
  filters.budgetMonth = ''
  filters.status = ''
  pagination.currentPage = 1
  loadData()
}

// 查询
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    deptId: '',
    budgetMonth: '',
    totalBaseSalary: 0,
    totalBonus: 0,
    totalOvertimePay: 0,
    remarks: ''
  })
  addModalVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!formData.deptId || !formData.budgetMonth) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const grandTotal = formData.totalBaseSalary + formData.totalBonus + formData.totalOvertimePay
  try {
    await laborStore.createBudget({
      deptId: formData.deptId,
      budgetMonth: formData.budgetMonth,
      totalBaseSalary: formData.totalBaseSalary,
      totalBonus: formData.totalBonus,
      totalOvertimePay: formData.totalOvertimePay,
      grandTotal,
      remarks: formData.remarks,
      status: '待提交',
      applicant: '当前用户',
      applyTime: ''
    })
    addModalVisible.value = false
    ElMessage.success('提交成功')
    loadData()
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

// 查看
const handleView = (row) => {
  selectedRecord.value = row
  detailModalVisible.value = true
}

// 审批
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定审批通过「${row.deptId}」的${row.budgetMonth}预算申请吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    await laborStore.updateBudget(row.id, { ...row, status: '已审核' })
    ElMessage.success('审批成功')
    detailModalVisible.value = false
    loadData()
  } catch {
    // 用户取消
  }
}

// 驳回
const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm(`确定驳回「${row.deptId}」的${row.budgetMonth}预算申请吗？`, '驳回确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await laborStore.updateBudget(row.id, { ...row, status: '已驳回' })
    ElMessage.success('已驳回')
    detailModalVisible.value = false
    loadData()
  } catch {
    // 用户取消
  }
}

// 导出
const handleExport = () => {
  if (!data.value || data.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  exportModalVisible.value = true
}

// 确认导出
const confirmExport = () => {
  exportWithFormatSelect(data.value, exportColumns, exportFormat.value, '预算记录')
  exportModalVisible.value = false
}

onMounted(() => { loadData() })
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
