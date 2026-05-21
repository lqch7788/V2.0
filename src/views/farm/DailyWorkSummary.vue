<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="#fff"><Clipboard /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">每日工单汇总表</h1>
          <p class="text-gray-500">每日农事工单执行情况汇总</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="(card, index) in statCards"
        :key="index"
        class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            :class="card.iconBgColor"
          >
            <span class="text-lg">{{ card.icon }}</span>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ card.value }}</p>
            <p class="text-xs text-gray-500">{{ card.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 日期筛选 -->
        <div class="min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <el-date-picker
            v-model="dateFilter"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="handleDateChange"
          />
        </div>

        <!-- 工作区域筛选 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">工作区域</label>
          <el-select
            v-model="greenhouseFilter"
            placeholder="选择区域"
            clearable
            style="width: 100%"
            @change="handleFilterChange"
          >
            <el-option
              v-for="option in filterOptions.greenhouses"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <!-- 作业类型筛选 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">作业类型</label>
          <el-select
            v-model="taskTypeFilter"
            placeholder="选择类型"
            clearable
            style="width: 100%"
            @change="handleFilterChange"
          >
            <el-option
              v-for="option in filterOptions.taskTypes"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button v-if="!exportMode" @click="handleExportClick">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <template v-else>
            <el-button type="primary" @click="handleConfirmExport">
              <el-icon><Download /></el-icon>
              确认导出
            </el-button>
            <el-button @click="handleCancelExport">取消</el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table
        :data="paginatedData"
        style="width: 100%"
        :header-cell-style="{ background: 'linear-gradient(to right, #3B82F6, #2563EB)', color: '#fff' }"
        row-class-name="hover:bg-blue-100 transition-colors"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="exportMode"
          type="selection"
          width="50"
        />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="greenhouse" label="工作区域" width="100" />
        <el-table-column prop="crop" label="作物" width="80" />
        <el-table-column prop="taskType" label="作业类型" width="150" />
        <el-table-column label="工作量" width="120">
          <template #default="{ row }">
            {{ formatWorkload(row) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span
              :class="[
                'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                row.status === '已完成' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              ]"
            >
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="完成率" width="100">
          <template #default="{ row }">
            <span
              :class="[
                'font-medium',
                row.completionRate === '100%' ? 'text-green-600' :
                parseInt(row.completionRate) >= 80 ? 'text-amber-600' : 'text-red-600'
              ]"
            >
              {{ row.completionRate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="!exportMode" label="操作" width="80">
          <template #default="{ row }">
            <el-button text circle @click="handleView(row)">
              <el-icon><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 导出模式底部栏 -->
      <div
        v-if="exportMode && selectedRows.length > 0"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <el-button text @click="handleSelectAll">
            {{ selectedRows.length === summaries.length ? '全不选' : '全选' }}
          </el-button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>每页</span>
          <el-select
            v-model="pageSize"
            size="small"
            style="width: 100px"
            @change="handlePageSizeChange"
          >
            <el-option :value="10" label="10条" />
            <el-option :value="20" label="20条" />
            <el-option :value="50" label="50条" />
          </el-select>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredSummaries.length"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 导出格式弹窗 -->
    <el-dialog
      v-model="showExportModal"
      title="选择导出格式"
      width="400px"
    >
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <div
          v-for="format in exportFormats"
          :key="format.value"
          :class="[
            'p-4 border rounded-lg cursor-pointer transition-all',
            exportFormat === format.value
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
          @click="exportFormat = format.value"
        >
          <div class="flex items-center">
            <div
              :class="[
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                exportFormat === format.value ? 'border-emerald-600' : 'border-gray-300'
              ]"
            >
              <div
                v-if="exportFormat === format.value"
                class="w-2 h-2 rounded-full bg-emerald-600"
              />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
              <p class="text-xs text-gray-500">{{ format.desc }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showExportModal = false">取消</el-button>
          <el-button type="primary" @click="handleDoExport">导出</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DocumentCopy,
  Search,
  Download,
  View,
  Loading
} from '@element-plus/icons-vue'

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
  { value: 'excel_with_attachments', label: 'Excel+附件 (.zip)', desc: '包含照片等附件，适合需要原始证据的场景' },
]

// ============ 模拟数据 ============

const generateMockSummaries = () => {
  const tasks = [
    { greenhouse: '东区1号棚', crop: '番茄', taskType: '浇水' },
    { greenhouse: '东区2号棚', crop: '黄瓜', taskType: '施肥' },
    { greenhouse: '西区1号棚', crop: '茄子', taskType: '除草' },
    { greenhouse: '西区2号棚', crop: '辣椒', taskType: '采摘' },
    { greenhouse: '南区1号棚', crop: '番茄', taskType: '打药' },
  ]

  const statuses = ['已完成', '进行中', '待接受', '已接受']
  const completionRates = ['100%', '80%', '60%', '40%', '0%']

  return Array.from({ length: 100 }, (_, i) => {
    const task = tasks[i % tasks.length]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(i / 5))
    const dateStr = date.toISOString().split('T')[0]
    const statusIndex = i % 4
    const status = statuses[statusIndex]
    return {
      id: `summary-${i + 1}`,
      date,
      taskId: `task-${i + 1}`,
      taskCode: `TK${String(i + 1).padStart(4, '0')}`,
      greenhouse: task.greenhouse,
      crop: task.crop,
      taskType: task.taskType,
      plannedArea: Math.floor(Math.random() * 10) + 5,
      completedArea: Math.floor(Math.random() * 10),
      workloadDays: Math.floor(Math.random() * 3) + 1,
      workloadHours: Math.floor(Math.random() * 8) + 1,
      workers: Math.floor(Math.random() * 5) + 1,
      status,
      completionRate: completionRates[Math.floor(Math.random() * 4)],
    }
  })
}

// ============ 状态 ============

const loading = ref(false)
const dateFilter = ref('')
const greenhouseFilter = ref('')
const taskTypeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const allSummaries = ref([])

// 导出相关状态
const exportMode = ref(false)
const selectedRows = ref([])
const exportFormat = ref('excel')
const showExportModal = ref(false)

// ============ 计算属性 ============

const filteredSummaries = computed(() => {
  return allSummaries.value.filter(s => {
    if (dateFilter.value && s.date !== dateFilter.value) return false
    if (greenhouseFilter.value && greenhouseFilter.value !== '全部' && !s.greenhouse.includes(greenhouseFilter.value)) return false
    if (taskTypeFilter.value && taskTypeFilter.value !== '全部' && !s.taskType.includes(taskTypeFilter.value)) return false
    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSummaries.value.slice(start, end)
})

const statCards = computed(() => {
  const total = filteredSummaries.value.length
  const completed = filteredSummaries.value.filter(s => s.status === '已完成').length
  const inProgress = filteredSummaries.value.filter(s =>
    ['已接受', '处理中', '返工中'].includes(s.status)
  ).length
  const pending = filteredSummaries.value.filter(s => s.status === '待接受').length

  return [
    { label: '任务总数', value: total, icon: '📋', iconBgColor: 'bg-blue-500' },
    { label: '已作业', value: completed, icon: '✓', iconBgColor: 'bg-green-500' },
    { label: '进行中', value: inProgress, icon: '⟳', iconBgColor: 'bg-amber-500' },
    { label: '待接受', value: pending, icon: '📨', iconBgColor: 'bg-purple-500' },
  ]
})

const filterOptions = computed(() => {
  const greenhouses = [...new Set(allSummaries.value.map(s => s.greenhouse).filter(Boolean))]
  const taskTypes = [...new Set(allSummaries.value.map(s => s.taskType).filter(Boolean))]

  return {
    dates: [
      { value: '', label: '全部' },
      ...[...new Set(allSummaries.value.map(s => s.date))].map(d => ({ value: d, label: d })),
    ],
    greenhouses: [
      { value: '', label: '全部' },
      ...greenhouses.map(g => ({ value: g, label: g })),
    ],
    taskTypes: [
      { value: '', label: '全部' },
      ...taskTypes.map(t => ({ value: t, label: t })),
    ],
  }
})

// ============ 方法 ============

const formatWorkload = (row) => {
  const parts = []
  if (row.workloadDays) parts.push(`${row.workloadDays}天`)
  if (row.workloadHours) parts.push(`${row.workloadHours}小时`)
  if (row.workers) parts.push(`${row.workers}人`)
  return parts.length > 0 ? parts.join('') : '-'
}

const handleDateChange = () => {
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(s => s.id)
}

const handleSelectAll = () => {
  if (selectedRows.value.length === filteredSummaries.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredSummaries.value.map(s => s.id)
  }
}

const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleDoExport = () => {
  // 实际项目中这里会调用导出服务
  ElMessage.success(`已选择 ${selectedRows.value.length} 条数据，将以 ${exportFormat.value} 格式导出`)
  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
}

const handleView = (row) => {
  ElMessage.info(`查看详情: ${row.taskCode}`)
}

// ============ 监听器 ============

watch([dateFilter, greenhouseFilter, taskTypeFilter], () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})

// ============ 初始化 ============

const initData = () => {
  loading.value = true
  setTimeout(() => {
    allSummaries.value = generateMockSummaries()
    loading.value = false
  }, 300)
}

initData()
</script>
