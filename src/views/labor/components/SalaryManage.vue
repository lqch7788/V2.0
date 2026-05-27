<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Money /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">工资管理</h1>
            <p class="text-xs text-gray-500">管理员工工资、查看工资条</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="handleExportClick">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <el-input v-model="filters.staffName" placeholder="员工姓名" clearable class="w-[160px]" />
        <el-input v-model="filters.staffId" placeholder="工号" clearable class="w-[140px]" />
        <el-date-picker
          v-model="filters.month"
          type="month"
          placeholder="月份"
          format="YYYY-MM"
          value-format="YYYY-MM"
          class="w-[160px]"
        />
        <el-select v-model="filters.status" placeholder="状态" clearable class="w-[140px]">
          <el-option v-for="item in SALARY_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">待确认</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">
          {{ data.filter(r => r.status === '待确认').length }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">已确认</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">
          {{ data.filter(r => r.status === '已确认').length }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">已发放</p>
        <p class="text-2xl font-bold text-green-600 mt-1">
          {{ data.filter(r => r.status === '已发放').length }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">总记录数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ total }}</p>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" border stripe v-loading="loading">
        <el-table-column prop="staffId" label="工号" width="100" />
        <el-table-column prop="staffName" label="姓名" width="100" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="calcType" label="计算方式" width="100" />
        <el-table-column prop="baseSalary" label="基本工资" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.baseSalary.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="overtimePay" label="加班费" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.overtimePay.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="bonus" label="奖金" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.bonus.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="deduction" label="扣款明细" width="220" align="right">
          <template #default="{ row }">
            <span class="text-xs text-gray-600">
              扣款:¥{{ row.deduction || 0 }} 迟到:¥{{ row.lateDeductions || 0 }} 缺勤:¥{{ row.absenceDeductions || 0 }} 社保:¥{{ row.socialSecurity || 0 }} 公积金:¥{{ row.housingFund || 0 }} 个税:¥{{ row.personalTax || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="netSalary" label="实发工资" width="120" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-semibold">¥{{ row.netSalary.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="View" circle @click="handleViewDetail(row)" />
            <el-button v-if="row.calcType === '日薪' || row.calcType === '时薪'" size="small" :icon="Coin" circle type="warning" @click="handleCalculate(row)" />
            <el-button v-if="row.status === '已发放'" size="small" :icon="Download" circle @click="handleExport(row)" />
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无工资数据' }}</p>
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
    <el-dialog v-model="addModalVisible" title="新建工资记录" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="工号">
          <el-input v-model="formData.staffId" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="formData.staffName" />
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
        <el-form-item label="计算方式">
          <el-select v-model="formData.calcType" class="w-full">
            <el-option v-for="item in SALARY_CALC_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="迟到扣款">
          <el-input-number v-model="formData.lateDeductions" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="缺勤扣款">
          <el-input-number v-model="formData.absenceDeductions" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="社保">
          <el-input-number v-model="formData.socialSecurity" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="公积金">
          <el-input-number v-model="formData.housingFund" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="个税">
          <el-input-number v-model="formData.personalTax" :min="0" :precision="2" class="w-full" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="工资条详情" width="700px">
      <div v-if="selectedRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工号">{{ selectedRecord.staffId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedRecord.staffName }}</el-descriptions-item>
          <el-descriptions-item label="月份">{{ selectedRecord.month }}</el-descriptions-item>
          <el-descriptions-item label="计算方式">{{ selectedRecord.calcType }}</el-descriptions-item>
          <el-descriptions-item label="基本工资">{{ selectedRecord.baseSalary.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="加班费">{{ selectedRecord.overtimePay.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="奖金">{{ selectedRecord.bonus.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="扣款">{{ selectedRecord.deduction.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="迟到扣款">{{ (selectedRecord.lateDeductions || 0).toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="缺勤扣款">{{ (selectedRecord.absenceDeductions || 0).toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="社保">{{ (selectedRecord.socialSecurity || 0).toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="公积金">{{ (selectedRecord.housingFund || 0).toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="个税">{{ (selectedRecord.personalTax || 0).toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="实发工资" class="text-emerald-600">
            <strong>{{ selectedRecord.netSalary.toFixed(2) }} 元</strong>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecord.status)" size="small">{{ selectedRecord.status }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportModalVisible" title="导出工资记录" width="400px">
      <div class="space-y-4">
        <p class="text-sm text-gray-500">选择导出格式（共 {{ data.length }} 条记录）</p>
        <el-radio-group v-model="exportFormat" class="flex flex-col gap-3">
          <el-radio value="excel" size="large">Excel 格式 (.xls)</el-radio>
          <el-radio value="csv" size="large">CSV 格式 (.csv)</el-radio>
          <el-radio value="word" size="large">Word 格式 (.doc)</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确认导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Money, Download, Plus, View, Coin } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'
import { SALARY_CALC_TYPE_OPTIONS, SALARY_STATUS_OPTIONS } from '@/data/laborData'

// Labor Store
const laborStore = useLaborStore()
const { exportWithFormatSelect } = useExport({ fileName: '工资记录' })

// 工资导出列配置
const salaryExportColumns = [
  { key: 'staffId', label: '工号' },
  { key: 'staffName', label: '姓名' },
  { key: 'month', label: '月份' },
  { key: 'calcType', label: '计算方式' },
  { key: 'baseSalary', label: '基本工资' },
  { key: 'overtimePay', label: '加班费' },
  { key: 'bonus', label: '奖金' },
  { key: 'deduction', label: '扣款' },
  { key: 'netSalary', label: '实发工资' },
  { key: 'status', label: '状态' }
]

// 筛选条件
const filters = reactive({
  staffName: '',
  staffId: '',
  month: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载状态
const loading = ref(false)
const error = ref('')

// 表格数据
const data = ref([])

const total = computed(() => pagination.total)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => data.value)

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize }
    if (filters.staffName) params.staffName = filters.staffName
    if (filters.staffId) params.staffId = filters.staffId
    if (filters.month) params.month = filters.month
    if (filters.status) params.status = filters.status
    await laborStore.fetchSalaryList(params)
    data.value = laborStore.salaryList
    pagination.total = laborStore.salaryTotal
  } catch (e) {
    console.error('加载工资数据失败:', e)
    error.value = '加载数据失败'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 弹窗状态
const addModalVisible = ref(false)
const detailModalVisible = ref(false)
const exportModalVisible = ref(false)
const exportFormat = ref('excel')
const selectedRecord = ref(null)

// 表单数据
const formData = reactive({
  staffId: '',
  staffName: '',
  month: '',
  calcType: '月薪',
  baseSalary: 0,
  overtimePay: 0,
  bonus: 0,
  deduction: 0,
  lateDeductions: 0,
  absenceDeductions: 0,
  socialSecurity: 0,
  housingFund: 0,
  personalTax: 0
})

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '待确认': 'warning',
    '已确认': 'primary',
    '已发放': 'success'
  }
  return typeMap[status] || 'info'
}

// 处理重置
const handleReset = () => {
  filters.staffName = ''
  filters.staffId = ''
  filters.month = ''
  filters.status = ''
  pagination.currentPage = 1
  loadData()
}

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 处理新增
const handleAdd = () => {
  Object.assign(formData, {
    staffId: '',
    staffName: '',
    month: '',
    calcType: '月薪',
    baseSalary: 0,
    overtimePay: 0,
    bonus: 0,
    deduction: 0,
    lateDeductions: 0,
    absenceDeductions: 0,
    socialSecurity: 0,
    housingFund: 0,
    personalTax: 0
  })
  addModalVisible.value = true
}

// 确认新增
const handleConfirmAdd = async () => {
  if (!formData.staffId || !formData.staffName || !formData.month) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const totalAdd = formData.baseSalary + formData.overtimePay + formData.bonus
  const totalDeduct = formData.deduction + formData.lateDeductions + formData.absenceDeductions + formData.socialSecurity + formData.housingFund + formData.personalTax
  const netSalary = Math.max(0, totalAdd - totalDeduct)
  try {
    await laborStore.createSalary({
      staffId: formData.staffId,
      staffName: formData.staffName,
      month: formData.month,
      calcType: formData.calcType,
      baseSalary: formData.baseSalary,
      overtimePay: formData.overtimePay,
      bonus: formData.bonus,
      deduction: formData.deduction,
      lateDeductions: formData.lateDeductions,
      absenceDeductions: formData.absenceDeductions,
      socialSecurity: formData.socialSecurity,
      housingFund: formData.housingFund,
      personalTax: formData.personalTax,
      netSalary,
      status: '待确认'
    })
    addModalVisible.value = false
    ElMessage.success('新增成功')
    loadData()
  } catch (e) {
    ElMessage.error('新增失败')
  }
}

// 查看详情
const handleViewDetail = (row) => {
  selectedRecord.value = row
  detailModalVisible.value = true
}

// 计算
const handleCalculate = async (row) => {
  try {
    await laborStore.calculateSalary(row.id, row)
    ElMessage.success('工资计算完成')
    loadData()
  } catch (e) {
    ElMessage.error('工资计算失败')
  }
}

// 导出
const handleExportClick = () => {
  if (data.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  exportModalVisible.value = true
}

const confirmExport = () => {
  exportWithFormatSelect(data.value, salaryExportColumns, exportFormat.value, `工资记录_${new Date().toISOString().slice(0, 10)}`)
  exportModalVisible.value = false
}

const handleExport = (row) => {
  exportWithFormatSelect([row], salaryExportColumns, 'excel', `工资条_${row.staffName}_${row.month}`)
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

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-4 {
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
