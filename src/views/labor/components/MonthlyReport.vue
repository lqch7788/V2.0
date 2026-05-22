<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Document /></el-icon>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">工作月报</h1>
            <p class="text-xs text-gray-500">月度生产工作汇总与分析</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <el-date-picker
          v-model="filters.month"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="选择月份"
          class="w-[160px]"
        />
        <el-select v-model="filters.dept" placeholder="选择部门" clearable class="w-[160px]">
          <el-option label="技术部" value="技术部" />
          <el-option label="运营部" value="运营部" />
          <el-option label="市场部" value="市场部" />
          <el-option label="生产部" value="生产部" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="success" @click="handleGenerate">生成月报</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#3b82f6"><Calendar /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">完成任务</p>
            <p class="text-xl font-bold text-gray-900">{{ currentStats.completedTasks }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" color="#22c55e"><User /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">在岗人数</p>
            <p class="text-xl font-bold text-gray-900">{{ currentStats.onDutyCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <el-icon :size="20" color="#a855f7"><TrendCharts /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">完成任务率</p>
            <p class="text-xl font-bold text-gray-900">{{ currentStats.completionRate }}%</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" color="#f59e0b"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">异常事件</p>
            <p class="text-xl font-bold text-gray-900">{{ currentStats.incidents }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="text-sm font-medium text-gray-700 mb-4">月度生产趋势</h3>
      <div class="h-64 flex items-center justify-center text-gray-400">
        趋势图表区域
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" border stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="dept" label="部门" width="100" />
        <el-table-column prop="completedTasks" label="完成任务数" width="120" align="right" />
        <el-table-column prop="totalTasks" label="总任务数" width="100" align="right" />
        <el-table-column prop="onDutyCount" label="在岗人数" width="100" align="right" />
        <el-table-column prop="totalManhours" label="总工时" width="100" align="right" />
        <el-table-column prop="output" label="产出量" width="100" align="right" />
        <el-table-column prop="completionRate" label="完成率" width="100" align="right">
          <template #default="{ row }">
            <span :class="getRateClass(row.completionRate)">{{ row.completionRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="incidents" label="异常事件" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.incidents > 0" class="text-red-600">{{ row.incidents }}</span>
            <span v-else class="text-gray-400">0</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="success" @click="handleEdit(row)">编辑</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="月报详情" width="700px">
      <div v-if="selectedReport" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="月份">{{ selectedReport.month }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ selectedReport.dept }}</el-descriptions-item>
          <el-descriptions-item label="完成任务数">{{ selectedReport.completedTasks }}</el-descriptions-item>
          <el-descriptions-item label="总任务数">{{ selectedReport.totalTasks }}</el-descriptions-item>
          <el-descriptions-item label="在岗人数">{{ selectedReport.onDutyCount }}</el-descriptions-item>
          <el-descriptions-item label="总工时">{{ selectedReport.totalManhours }}</el-descriptions-item>
          <el-descriptions-item label="产出量">{{ selectedReport.output }}</el-descriptions-item>
          <el-descriptions-item label="完成率">
            <span :class="getRateClass(selectedReport.completionRate)">{{ selectedReport.completionRate }}%</span>
          </el-descriptions-item>
          <el-descriptions-item label="异常事件">{{ selectedReport.incidents }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedReport.createTime }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="selectedReport.summary">
          <h4 class="text-sm font-medium text-gray-700 mb-2">月度总结</h4>
          <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">{{ selectedReport.summary }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editModalVisible" title="编辑月报" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="月份">
          <el-date-picker
            v-model="formData.month"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
            disabled
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="formData.dept" class="w-full">
            <el-option label="技术部" value="技术部" />
            <el-option label="运营部" value="运营部" />
            <el-option label="市场部" value="市场部" />
            <el-option label="生产部" value="生产部" />
          </el-select>
        </el-form-item>
        <el-form-item label="完成任务数">
          <el-input-number v-model="formData.completedTasks" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="总任务数">
          <el-input-number v-model="formData.totalTasks" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="在岗人数">
          <el-input-number v-model="formData.onDutyCount" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="总工时">
          <el-input-number v-model="formData.totalManhours" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="产出量">
          <el-input-number v-model="formData.output" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="异常事件">
          <el-input-number v-model="formData.incidents" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="月度总结">
          <el-input v-model="formData.summary" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Document, Calendar, User, TrendCharts, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 筛选条件
const filters = reactive({
  month: '2024-03',
  dept: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 当前统计数据
const currentStats = reactive({
  completedTasks: 42,
  onDutyCount: 48,
  completionRate: 87.5,
  incidents: 2
})

// 表格数据
const reports = ref([
  { id: '1', month: '2024-03', dept: '技术部', completedTasks: 15, totalTasks: 18, onDutyCount: 12, totalManhours: 960, output: 1200, completionRate: 83, incidents: 1, createTime: '2024-03-31 18:00:00', summary: '本月技术部完成了大部分开发任务，团队协作效率有所提升。' },
  { id: '2', month: '2024-03', dept: '运营部', completedTasks: 12, totalTasks: 14, onDutyCount: 10, totalManhours: 800, output: 1500, completionRate: 86, incidents: 0, createTime: '2024-03-31 17:30:00', summary: '运营部工作整体顺利，完成了日常运营和客户对接工作。' },
  { id: '3', month: '2024-03', dept: '生产部', completedTasks: 18, totalTasks: 20, onDutyCount: 15, totalManhours: 1200, output: 3500, completionRate: 90, incidents: 1, createTime: '2024-03-31 17:00:00', summary: '生产部产量稳定，但因设备维修导致部分延误。' },
  { id: '4', month: '2024-02', dept: '技术部', completedTasks: 14, totalTasks: 18, onDutyCount: 11, totalManhours: 880, output: 1100, completionRate: 78, incidents: 2, createTime: '2024-02-29 18:00:00', summary: '春节假期后团队快速恢复工作状态，效率提升明显。' },
  { id: '5', month: '2024-02', dept: '运营部', completedTasks: 10, totalTasks: 14, onDutyCount: 8, totalManhours: 640, output: 1200, completionRate: 71, incidents: 1, createTime: '2024-02-29 17:30:00', summary: '受春节假期影响，本月任务完成率略有下降。' }
])

const total = computed(() => reports.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return reports.value.slice(start, start + pagination.pageSize)
})

// 弹窗状态
const detailModalVisible = ref(false)
const editModalVisible = ref(false)
const selectedReport = ref(null)
const editingReport = ref(null)

// 表单数据
const formData = reactive({
  month: '',
  dept: '',
  completedTasks: 0,
  totalTasks: 0,
  onDutyCount: 0,
  totalManhours: 0,
  output: 0,
  incidents: 0,
  summary: ''
})

// 获取完成率样式
const getRateClass = (rate) => {
  if (rate >= 90) return 'text-emerald-600 font-semibold'
  if (rate >= 80) return 'text-amber-600 font-semibold'
  return 'text-red-600 font-semibold'
}

// 查询
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 生成月报
const handleGenerate = () => {
  ElMessage.success('月报生成中...')
}

// 查看
const handleView = (report) => {
  selectedReport.value = report
  detailModalVisible.value = true
}

// 编辑
const handleEdit = (report) => {
  editingReport.value = report
  Object.assign(formData, report)
  editModalVisible.value = true
}

// 确认编辑
const handleConfirmEdit = () => {
  if (!formData.dept) {
    ElMessage.warning('请选择部门')
    return
  }
  const completionRate = Math.round((formData.completedTasks / formData.totalTasks) * 100)
  if (editingReport.value) {
    Object.assign(editingReport.value, formData, { completionRate })
    ElMessage.success('更新成功')
  }
  editModalVisible.value = false
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

.text-amber-600 {
  color: #d97706;
}

.text-red-600 {
  color: #dc2626;
}

.font-semibold {
  font-weight: 600;
}
</style>
