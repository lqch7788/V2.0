<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><TrendCharts /></el-icon>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">人效分析</h1>
            <p class="text-xs text-gray-500">查看各部门人效指标及趋势分析</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="handleExport">
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
        <el-date-picker
          v-model="filters.startDate"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="开始月份"
          class="w-[160px]"
        />
        <el-date-picker
          v-model="filters.endDate"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="结束月份"
          class="w-[160px]"
        />
        <el-select v-model="filters.department" placeholder="部门" clearable class="w-[160px]">
          <el-option label="技术部" value="技术部" />
          <el-option label="运营部" value="运营部" />
          <el-option label="市场部" value="市场部" />
          <el-option label="生产部" value="生产部" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <!-- 核心指标仪表盘 -->
    <div class="grid grid-cols-5 gap-4">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">总产出</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ summaryMetrics.totalOutput.toLocaleString() }}</p>
        <p class="text-xs text-gray-400 mt-1">件/斤</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">人均产出</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ summaryMetrics.avgOutputPerWorker.toFixed(1) }}</p>
        <p class="text-xs text-gray-400 mt-1">件/斤每人</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">工时效率</p>
        <p class="text-2xl font-bold text-purple-600 mt-1">{{ (summaryMetrics.avgEfficiency * 100).toFixed(1) }}%</p>
        <p class="text-xs text-gray-400 mt-1">平均</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">任务达成率</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ (summaryMetrics.taskCompletionRate * 100).toFixed(1) }}%</p>
        <p class="text-xs text-gray-400 mt-1">平均</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500">出勤率</p>
        <p class="text-2xl font-bold text-cyan-600 mt-1">{{ (summaryMetrics.attendanceRate * 100).toFixed(1) }}%</p>
        <p class="text-xs text-gray-400 mt-1">平均</p>
      </div>
    </div>

    <!-- 趋势图表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="text-sm font-medium text-gray-700 mb-4">人效趋势</h3>
      <div class="h-64 flex items-center justify-center text-gray-400">
        趋势图表区域
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" border stripe>
        <el-table-column prop="date" label="月份" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="totalWorkers" label="总人数" width="80" align="center" />
        <el-table-column prop="totalOutput" label="总产出" width="100" align="right">
          <template #default="{ row }">
            {{ row.totalOutput.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="avgOutputPerWorker" label="人均产出" width="100" align="right">
          <template #default="{ row }">
            {{ row.avgOutputPerWorker.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalHours" label="总工时" width="100" align="right">
          <template #default="{ row }">
            {{ row.totalHours.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="avgEfficiency" label="工时效率" width="100" align="right">
          <template #default="{ row }">
            {{ (row.avgEfficiency * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="taskCompletionRate" label="任务达成率" width="110" align="right">
          <template #default="{ row }">
            {{ (row.taskCompletionRate * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="attendanceRate" label="出勤率" width="90" align="right">
          <template #default="{ row }">
            {{ (row.attendanceRate * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="success" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="modalVisible" :title="modalTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="月份">
          <el-date-picker
            v-model="formData.date"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="formData.department" class="w-full">
            <el-option label="技术部" value="技术部" />
            <el-option label="运营部" value="运营部" />
            <el-option label="市场部" value="市场部" />
            <el-option label="生产部" value="生产部" />
          </el-select>
        </el-form-item>
        <el-form-item label="总人数">
          <el-input-number v-model="formData.totalWorkers" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="总产出">
          <el-input-number v-model="formData.totalOutput" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="总工时">
          <el-input-number v-model="formData.totalHours" :min="0" class="w-full" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { TrendCharts, Download, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = reactive({
  startDate: '2024-01',
  endDate: '2024-03',
  department: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 汇总指标
const summaryMetrics = reactive({
  totalOutput: 125000,
  avgOutputPerWorker: 2500,
  avgEfficiency: 0.92,
  taskCompletionRate: 0.88,
  attendanceRate: 0.95
})

// 表格数据
const data = ref([
  { id: '1', date: '2024-03', department: '技术部', totalWorkers: 15, totalOutput: 42000, avgOutputPerWorker: 2800, totalHours: 3600, avgEfficiency: 0.94, taskCompletionRate: 0.90, attendanceRate: 0.96 },
  { id: '2', date: '2024-03', department: '运营部', totalWorkers: 12, totalOutput: 30000, avgOutputPerWorker: 2500, totalHours: 2880, avgEfficiency: 0.91, taskCompletionRate: 0.87, attendanceRate: 0.94 },
  { id: '3', date: '2024-03', department: '生产部', totalWorkers: 25, totalOutput: 53000, avgOutputPerWorker: 2120, totalHours: 6000, avgEfficiency: 0.89, taskCompletionRate: 0.85, attendanceRate: 0.93 },
  { id: '4', date: '2024-02', department: '技术部', totalWorkers: 15, totalOutput: 40000, avgOutputPerWorker: 2667, totalHours: 3600, avgEfficiency: 0.92, taskCompletionRate: 0.88, attendanceRate: 0.95 },
  { id: '5', date: '2024-02', department: '运营部', totalWorkers: 12, totalOutput: 28000, avgOutputPerWorker: 2333, totalHours: 2880, avgEfficiency: 0.90, taskCompletionRate: 0.86, attendanceRate: 0.93 }
])

const total = computed(() => data.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return data.value.slice(start, start + pagination.pageSize)
})

// 弹窗状态
const modalVisible = ref(false)
const modalTitle = ref('新增记录')
const editingRecord = ref(null)

// 表单数据
const formData = reactive({
  date: '',
  department: '',
  totalWorkers: 0,
  totalOutput: 0,
  totalHours: 0
})

// 重置
const handleReset = () => {
  filters.startDate = '2024-01'
  filters.endDate = '2024-03'
  filters.department = ''
}

// 查询
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增记录'
  editingRecord.value = null
  Object.assign(formData, {
    date: '',
    department: '',
    totalWorkers: 0,
    totalOutput: 0,
    totalHours: 0
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  modalTitle.value = '编辑记录'
  editingRecord.value = row
  Object.assign(formData, row)
  modalVisible.value = true
}

// 确认
const handleConfirm = () => {
  if (!formData.date || !formData.department) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const avgOutputPerWorker = formData.totalOutput / formData.totalWorkers
  const avgEfficiency = (formData.totalOutput / formData.totalHours) || 0

  if (editingRecord.value) {
    Object.assign(editingRecord.value, formData, { avgOutputPerWorker, avgEfficiency })
    ElMessage.success('更新成功')
  } else {
    data.value.unshift({
      id: Date.now().toString(),
      ...formData,
      avgOutputPerWorker,
      avgEfficiency,
      taskCompletionRate: 0.88,
      attendanceRate: 0.95
    })
    ElMessage.success('新增成功')
  }
  modalVisible.value = false
}

// 查看
const handleView = (row) => {
  ElMessage.info('详情功能开发中')
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${row.date} - ${row.department}" 的记录吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = data.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      data.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
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

.grid-cols-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}
</style>
