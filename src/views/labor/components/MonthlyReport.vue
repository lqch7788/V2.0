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
            <h1 class="text-2xl font-bold text-gray-900">工作月报</h1>
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
          <el-option v-for="item in DEPT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="success" @click="handleGenerate">生成月报</el-button>
        <el-button @click="handleExportClick">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm p-4">
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
      <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" color="#22c55e"><User /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">平均人数</p>
            <p class="text-xl font-bold text-gray-900">{{ currentStats.avgDailyWorkers }}</p>
          </div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <el-icon :size="20" color="#a855f7"><TrendCharts /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">总工时</p>
            <p class="text-xl font-bold text-gray-900">{{ currentStats.totalWorkhours }}</p>
          </div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" color="#f59e0b"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">总产量</p>
            <p class="text-xl font-bold text-gray-900">{{ currentStats.totalHarvest }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="text-sm font-medium text-gray-700 mb-4">月度生产趋势</h3>
      <div class="h-64 flex items-center justify-center text-gray-400">
        月度生产趋势图表 (需要集成recharts，V1.1使用recharts渲染折线图)
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" border stripe v-loading="loading" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }">
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无月报数据' }}</p>
          </div>
        </template>
        <el-table-column prop="code" label="报表编号" width="120" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="dept" label="部门" width="100" />
        <el-table-column prop="totalWorkdays" label="总工日数" width="100" align="right" />
        <el-table-column prop="totalWorkhours" label="总工时" width="100" align="right" />
        <el-table-column prop="avgDailyWorkers" label="平均人数" width="100" align="right" />
        <el-table-column prop="completedTasks" label="完成任务" width="100" align="right" />
        <el-table-column prop="pendingTasks" label="待办任务" width="100" align="right" />
        <el-table-column prop="totalHarvest" label="总产量" width="100" align="right" />
        <el-table-column prop="qualityRate" label="质量率" width="90" align="right">
          <template #default="{ row }">
            <span :class="getRateClass(row.qualityRate)">{{ row.qualityRate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="laborCost" label="人工成本" width="110" align="right" />
        <el-table-column prop="materialCost" label="物料成本" width="110" align="right" />
        <el-table-column prop="issuesCount" label="问题数" width="80" align="right" />
        <el-table-column prop="resolvedIssues" label="已解决" width="80" align="right" />
        <el-table-column prop="attendanceRate" label="考勤率" width="90" align="right">
          <template #default="{ row }">
            <span :class="getRateClass(row.attendanceRate)">{{ row.attendanceRate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '已发布' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="View" circle @click="handleView(row)" />
            <el-button size="small" :icon="Edit" circle type="primary" @click="handleEdit(row)" />
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

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="400px">
      <div class="space-y-4">
        <p class="text-sm text-gray-500">选择导出格式（共 {{ reports.length }} 条记录）</p>
        <el-radio-group v-model="exportFormat" class="flex flex-col gap-3">
          <el-radio value="excel" size="large">Excel 格式 (.xls)</el-radio>
          <el-radio value="csv" size="large">CSV 格式 (.csv)</el-radio>
          <el-radio value="word" size="large">Word 格式 (.doc)</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确认导出</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="月报详情" width="700px">
      <div v-if="selectedReport" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报表编号">{{ selectedReport.code }}</el-descriptions-item>
          <el-descriptions-item label="月份">{{ selectedReport.month }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ selectedReport.dept }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedReport.status === '已发布' ? 'success' : 'info'" size="small">{{ selectedReport.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总工日数">{{ selectedReport.totalWorkdays }}</el-descriptions-item>
          <el-descriptions-item label="总工时">{{ selectedReport.totalWorkhours }}</el-descriptions-item>
          <el-descriptions-item label="平均人数">{{ selectedReport.avgDailyWorkers }}</el-descriptions-item>
          <el-descriptions-item label="完成任务">{{ selectedReport.completedTasks }}</el-descriptions-item>
          <el-descriptions-item label="待办任务">{{ selectedReport.pendingTasks }}</el-descriptions-item>
          <el-descriptions-item label="总产量">{{ selectedReport.totalHarvest }}</el-descriptions-item>
          <el-descriptions-item label="质量率">{{ selectedReport.qualityRate }}</el-descriptions-item>
          <el-descriptions-item label="人工成本">{{ selectedReport.laborCost }}</el-descriptions-item>
          <el-descriptions-item label="物料成本">{{ selectedReport.materialCost }}</el-descriptions-item>
          <el-descriptions-item label="问题数">{{ selectedReport.issuesCount }}</el-descriptions-item>
          <el-descriptions-item label="已解决">{{ selectedReport.resolvedIssues }}</el-descriptions-item>
          <el-descriptions-item label="考勤率">{{ selectedReport.attendanceRate }}</el-descriptions-item>
          <el-descriptions-item label="发布人">{{ selectedReport.publisher }}</el-descriptions-item>
          <el-descriptions-item label="发布日期">{{ selectedReport.publishDate }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editModalVisible" title="编辑月报" width="700px">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报表编号">
              <el-input v-model="formData.code" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份">
              <el-date-picker v-model="formData.month" type="month" format="YYYY-MM" value-format="YYYY-MM" class="w-full" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门">
              <el-select v-model="formData.dept" class="w-full">
                <el-option v-for="item in DEPT_OPTIONS.filter(d => d.value)" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" class="w-full">
                <el-option label="草稿" value="草稿" />
                <el-option label="已发布" value="已发布" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总工日数">
              <el-input-number v-model="formData.totalWorkdays" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总工时">
              <el-input-number v-model="formData.totalWorkhours" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平均人数">
              <el-input-number v-model="formData.avgDailyWorkers" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成任务">
              <el-input-number v-model="formData.completedTasks" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="待办任务">
              <el-input-number v-model="formData.pendingTasks" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总产量">
              <el-input v-model="formData.totalHarvest" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="质量率">
              <el-input v-model="formData.qualityRate" class="w-full" placeholder="如: 98.5%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考勤率">
              <el-input v-model="formData.attendanceRate" class="w-full" placeholder="如: 96.2%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人工成本">
              <el-input v-model="formData.laborCost" class="w-full" placeholder="如: 50,000" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料成本">
              <el-input v-model="formData.materialCost" class="w-full" placeholder="如: 30,000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="问题数">
              <el-input-number v-model="formData.issuesCount" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已解决">
              <el-input-number v-model="formData.resolvedIssues" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布人">
              <el-input v-model="formData.publisher" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布日期">
              <el-date-picker v-model="formData.publishDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 月报生成弹窗 -->
    <el-dialog v-model="reportDialogVisible" title="月度工作汇总报告" width="700px">
      <div v-if="generatedReport" class="space-y-6">
        <!-- 报告头 -->
        <div class="bg-emerald-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">报告周期</p>
          <p class="text-lg font-bold text-gray-900">{{ generatedReport.month }} / {{ generatedReport.dept }}</p>
        </div>

        <!-- 月度总结 -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">月度总结</h4>
          <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
            {{ generatedReport.summary }}
          </div>
        </div>

        <!-- 数据明细 -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">部门明细 ({{ generatedReport.details.recordCount }} 条记录)</h4>
          <el-table :data="reports" border size="small">
            <el-table-column prop="dept" label="部门" width="100" />
            <el-table-column prop="completedTasks" label="完成任务" width="90" align="right" />
            <el-table-column prop="pendingTasks" label="待办任务" width="80" align="right" />
            <el-table-column prop="totalWorkhours" label="工时" width="80" align="right" />
            <el-table-column prop="totalHarvest" label="总产量" width="100" align="right" />
            <el-table-column prop="qualityRate" label="质量率" width="80" align="right" />
            <el-table-column prop="attendanceRate" label="考勤率" width="80" align="right" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center gap-3">
          <el-radio-group v-model="reportExportFormat" size="small">
            <el-radio value="excel">Excel</el-radio>
            <el-radio value="csv">CSV</el-radio>
            <el-radio value="word">Word</el-radio>
          </el-radio-group>
          <el-button type="success" @click="exportGeneratedReport">导出月报</el-button>
          <el-button @click="reportDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Document, Calendar, User, TrendCharts, Warning, Download, View, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'
import { DEPT_OPTIONS } from '@/data/laborData'

const laborStore = useLaborStore()
const { exportWithFormatSelect } = useExport({ fileName: '工作月报' })

// 月报导出列配置（与表格列对应）
const reportExportColumns = [
  { key: 'code', label: '报表编号' },
  { key: 'month', label: '月份' },
  { key: 'dept', label: '部门' },
  { key: 'totalWorkdays', label: '总工日数' },
  { key: 'totalWorkhours', label: '总工时' },
  { key: 'avgDailyWorkers', label: '平均人数' },
  { key: 'completedTasks', label: '完成任务' },
  { key: 'pendingTasks', label: '待办任务' },
  { key: 'totalHarvest', label: '总产量' },
  { key: 'qualityRate', label: '质量率' },
  { key: 'laborCost', label: '人工成本' },
  { key: 'materialCost', label: '物料成本' },
  { key: 'issuesCount', label: '问题数' },
  { key: 'resolvedIssues', label: '已解决' },
  { key: 'attendanceRate', label: '考勤率' },
  { key: 'status', label: '状态' }
]

// 月报生成弹窗
const reportDialogVisible = ref(false)
const generatedReport = ref(null)
const reportExportFormat = ref('excel')

// 加载/错误状态
const loading = ref(false)
const error = ref('')

// 导出弹窗状态
const exportModalVisible = ref(false)
const exportFormat = ref('excel')

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
  completedTasks: 0,
  avgDailyWorkers: 0,
  totalWorkhours: 0,
  totalHarvest: ''
})

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (filters.month) params.month = filters.month
    if (filters.dept) params.dept = filters.dept
    await laborStore.fetchMonthlyReportList(params)
    // 计算汇总统计
    const list = laborStore.monthlyReportList
    currentStats.completedTasks = list.reduce((sum, r) => sum + (r.completedTasks || 0), 0)
    currentStats.avgDailyWorkers = list.reduce((sum, r) => sum + (r.avgDailyWorkers || 0), 0)
    currentStats.totalWorkhours = list.reduce((sum, r) => sum + (r.totalWorkhours || 0), 0)
    const totalHarvest = list.reduce((sum, r) => sum + (parseFloat(r.totalHarvest) || 0), 0)
    currentStats.totalHarvest = totalHarvest.toLocaleString()
  } catch (e) {
    error.value = '加载月报数据失败，请稍后重试'
    ElMessage.error('加载月报数据失败')
  } finally {
    loading.value = false
  }
}

const reports = computed(() => laborStore.monthlyReportList)
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
  id: null,
  code: '',
  month: '',
  dept: '',
  totalWorkdays: 0,
  totalWorkhours: 0,
  avgDailyWorkers: 0,
  completedTasks: 0,
  pendingTasks: 0,
  totalHarvest: '',
  qualityRate: '',
  laborCost: '',
  materialCost: '',
  issuesCount: 0,
  resolvedIssues: 0,
  attendanceRate: '',
  publisher: '',
  publishDate: '',
  status: '草稿'
})

// 获取完成率样式
const getRateClass = (rate) => {
  const num = parseFloat(rate)
  if (num >= 90) return 'text-emerald-600 font-semibold'
  if (num >= 80) return 'text-amber-600 font-semibold'
  return 'text-red-600 font-semibold'
}

// 查询
const handleSearch = () => { pagination.currentPage = 1; loadData() }

// 生成月报 - 根据当前筛选数据生成月度汇总报告
const handleGenerate = () => {
  const list = reports.value
  if (list.length === 0) {
    ElMessage.warning('当前没有月报数据，请先查询')
    return
  }
  const totalCompleted = list.reduce((sum, r) => sum + (r.completedTasks || 0), 0)
  const totalPending = list.reduce((sum, r) => sum + (r.pendingTasks || 0), 0)
  const totalWorkhours = list.reduce((sum, r) => sum + (r.totalWorkhours || 0), 0)
  const totalHarvest = list.reduce((sum, r) => sum + (parseFloat(r.totalHarvest) || 0), 0)
  const totalIssues = list.reduce((sum, r) => sum + (r.issuesCount || 0), 0)
  const deptSet = new Set(list.map(r => r.dept).filter(Boolean))

  generatedReport.value = {
    month: filters.month || '全部月份',
    dept: filters.dept || '全部部门',
    summary: `本月${filters.dept || '各部门'}共完成任务${totalCompleted}项（待办${totalPending}项），总工时${totalWorkhours}小时，总产量${totalHarvest.toLocaleString()}，异常事件${totalIssues}起。`,
    details: {
      deptCount: deptSet.size,
      recordCount: list.length,
      totalCompleted,
      totalPending,
      totalWorkhours,
      totalHarvest,
      totalIssues
    }
  }
  reportDialogVisible.value = true
}

// 月报导出
const exportGeneratedReport = () => {
  exportWithFormatSelect(reports.value, reportExportColumns, reportExportFormat.value, `工作月报_${filters.month || '全部'}_${new Date().toISOString().slice(0, 10)}`)
}

// 表格数据导出
const handleExportClick = () => {
  if (reports.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  exportModalVisible.value = true
}

const handleConfirmExport = () => {
  exportWithFormatSelect(reports.value, reportExportColumns, exportFormat.value, `工作月报_${filters.month || '全部'}_${new Date().toISOString().slice(0, 10)}`)
  exportModalVisible.value = false
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
  if (editingReport.value) {
    Object.assign(editingReport.value, formData)
    ElMessage.success('更新成功')
  }
  editModalVisible.value = false
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
