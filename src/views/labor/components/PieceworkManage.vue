<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Box /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">计件工资管理</h1>
            <p class="text-xs text-gray-500">管理临时工计件工资记录</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button>导入</el-button>
          <el-button @click="handleExportClick">导出</el-button>
          <el-button type="primary" @click="handleAdd">新建</el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-blue-50">
          <el-icon :size="20" color="#3b82f6"><User /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">计件工人</p>
          <p class="text-lg font-semibold text-gray-900">{{ stats.totalWorkers }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-green-50">
          <el-icon :size="20" color="#22c55e"><Box /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">总数量</p>
          <p class="text-lg font-semibold text-gray-900">{{ stats.totalQuantity.toLocaleString() }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-emerald-50">
          <el-icon :size="20" color="#10b981"><Coin /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">总工资</p>
          <p class="text-lg font-semibold text-gray-900">¥{{ stats.totalAmount.toLocaleString() }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-purple-50">
          <el-icon :size="20" color="#a855f7"><Coin /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">人均工资</p>
          <p class="text-lg font-semibold text-gray-900">¥{{ stats.avgAmountPerWorker.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="p-4 bg-white rounded-lg border border-gray-200">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="text-sm font-medium text-gray-700">筛选条件</span>
        <el-input v-model="filters.workerName" placeholder="员工姓名" clearable class="w-[160px]" />
        <el-input v-model="filters.taskName" placeholder="任务名称" clearable class="w-[160px]" />
        <el-date-picker
          v-model="filters.startDate"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="w-[160px]"
        />
        <el-date-picker
          v-model="filters.endDate"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="w-[160px]"
        />
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-[140px]">
          <el-option label="待确认" value="待确认" />
          <el-option label="已确认" value="已确认" />
          <el-option label="已发放" value="已发放" />
        </el-select>
        <el-button type="ghost" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <el-table :data="paginatedData" border stripe v-loading="loading">
        <el-table-column prop="workDate" label="日期" width="120" />
        <el-table-column prop="workerName" label="员工" width="100" />
        <el-table-column prop="taskName" label="任务" width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.quantity.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="total" label="合计" width="120" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-semibold">¥{{ row.total.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="View" circle @click="handleViewDetail(row)" />
            <el-button size="small" :icon="Edit" circle type="primary" @click="handleEdit(row)" />
            <el-button size="small" :icon="Select" circle type="success" @click="handleConfirm(row)" />
            <el-button size="small" :icon="Delete" circle type="danger" @click="handleDelete(row)" />
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
    <el-dialog v-model="addModalVisible" title="新建计件记录" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="员工">
          <el-input v-model="formData.workerName" />
        </el-form-item>
        <el-form-item label="任务">
          <el-input v-model="formData.taskName" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="formData.unit" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="formData.quantity" :min="0.01" class="w-full" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="formData.unitPrice" :min="0.01" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="工作日期">
          <el-date-picker
            v-model="formData.workDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="计件详情" width="500px">
      <div v-if="selectedRecord" class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">员工</span>
          <span class="text-gray-900">{{ selectedRecord.workerName }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">任务</span>
          <span class="text-gray-900">{{ selectedRecord.taskName }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">单位</span>
          <span class="text-gray-900">{{ selectedRecord.unit }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">数量</span>
          <span class="text-gray-900">{{ selectedRecord.quantity.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">单价</span>
          <span class="text-gray-900">¥{{ selectedRecord.unitPrice.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">合计</span>
          <span class="text-emerald-600 font-semibold">¥{{ selectedRecord.total.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">工作日期</span>
          <span class="text-gray-900">{{ selectedRecord.workDate }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">状态</span>
          <el-tag :type="getStatusType(selectedRecord.status)" size="small">{{ selectedRecord.status }}</el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Box, User, Coin, View, Edit, Delete, Select } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'

// Labor Store
const laborStore = useLaborStore()

// 筛选条件
const filters = reactive({
  workerName: '',
  taskName: '',
  startDate: '',
  endDate: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const stats = reactive({
  totalWorkers: 0,
  totalQuantity: 0,
  totalAmount: 0,
  avgAmountPerWorker: 0
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
    if (filters.workerName) params.workerName = filters.workerName
    if (filters.taskName) params.taskName = filters.taskName
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.status) params.status = filters.status
    await laborStore.fetchPieceworkList(params)
    data.value = laborStore.pieceworkList
    pagination.total = laborStore.pieceworkTotal
    // 更新统计
    stats.totalWorkers = new Set(data.value.map(r => r.workerName)).size
    stats.totalQuantity = data.value.reduce((sum, r) => sum + (r.quantity || 0), 0)
    stats.totalAmount = data.value.reduce((sum, r) => sum + (r.total || 0), 0)
    stats.avgAmountPerWorker = stats.totalWorkers > 0 ? stats.totalAmount / stats.totalWorkers : 0
  } catch (e) {
    console.error('加载计件工资数据失败:', e)
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

// 表单数据
const formData = reactive({
  workerName: '',
  taskName: '',
  unit: '件',
  quantity: 0,
  unitPrice: 0,
  workDate: '',
  remarks: ''
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
  filters.workerName = ''
  filters.taskName = ''
  filters.startDate = ''
  filters.endDate = ''
  filters.status = ''
  pagination.currentPage = 1
  loadData()
}

// 处理新增
const handleAdd = () => {
  Object.assign(formData, {
    workerName: '',
    taskName: '',
    unit: '件',
    quantity: 0,
    unitPrice: 0,
    workDate: '',
    remarks: '',
    _editId: null
  })
  addModalVisible.value = true
}

// 确认新增/编辑
const handleConfirmAdd = async () => {
  if (!formData.workerName || !formData.taskName || !formData.workDate) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const total = formData.quantity * formData.unitPrice
  try {
    if (formData._editId) {
      // 编辑模式
      await laborStore.updatePiecework(formData._editId, {
        workerName: formData.workerName,
        taskName: formData.taskName,
        unit: formData.unit,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        total,
        workDate: formData.workDate,
        remarks: formData.remarks || ''
      })
      ElMessage.success('编辑成功')
    } else {
      // 新增模式
      await laborStore.createPiecework({
        workerName: formData.workerName,
        taskName: formData.taskName,
        unit: formData.unit,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        total,
        workDate: formData.workDate,
        remarks: formData.remarks || '',
        status: '待确认'
      })
      ElMessage.success('新增成功')
    }
    addModalVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(formData._editId ? '编辑失败' : '新增失败')
  }
}

// 查看详情
const handleViewDetail = (row) => {
  selectedRecord.value = row
  detailModalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  Object.assign(formData, {
    workerName: row.workerName,
    taskName: row.taskName,
    unit: row.unit,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    workDate: row.workDate,
    remarks: row.remarks || ''
  })
  // 编辑模式暂存id
  formData._editId = row.id
  addModalVisible.value = true
}

// 确认
const handleConfirm = async (row) => {
  try {
    await laborStore.updatePiecework(row.id, { ...row, status: '已确认' })
    ElMessage.success('确认成功')
    loadData()
  } catch (e) {
    ElMessage.error('确认失败')
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除"${row.workerName} - ${row.taskName}" 的计件记录吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await laborStore.deletePiecework(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

// 导出
const exportColumns = [
  { key: 'workDate', label: '日期' },
  { key: 'workerName', label: '员工' },
  { key: 'taskName', label: '任务' },
  { key: 'unit', label: '单位' },
  { key: 'quantity', label: '数量' },
  { key: 'unitPrice', label: '单价' },
  { key: 'total', label: '合计' },
  { key: 'status', label: '状态' },
]

const { exportWithFormatSelect } = useExport({ fileName: '计件工资管理' })
const exportModalVisible = ref(false)
const exportFormat = ref('excel')

const handleExportClick = () => {
  exportModalVisible.value = true
}

const handleConfirmExport = () => {
  exportWithFormatSelect(data.value, exportColumns, exportFormat.value)
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

.rounded-lg {
  border-radius: 0.5rem;
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
