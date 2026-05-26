<template>
  <div class="space-y-6">
    <!-- 页面标题 - V1.1: emerald渐变 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Edit /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">工作日志</h1>
          <p class="text-gray-500">工作日志记录与审批</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1: bg-[#F2F6FA] -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><Document /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-xs text-gray-500">总日志</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" class="text-blue-600"><Calendar /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.today }}</p>
            <p class="text-xs text-gray-500">今日</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <el-icon :size="20" class="text-purple-600"><Grid /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.week }}</p>
            <p class="text-xs text-gray-500">本周</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" class="text-red-600"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.exception }}</p>
            <p class="text-xs text-gray-500">异常</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 - V1.1: bg-[#F2F6FA] -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <el-date-picker
            v-model="filters.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            clearable
          />
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">工人</label>
          <el-input v-model="filters.worker" placeholder="请输入姓名" clearable />
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">大棚</label>
          <el-select v-model="filters.greenhouse" placeholder="请选择" clearable style="width: 100%">
            <el-option label="1号棚" value="1号棚" />
            <el-option label="2号棚" value="2号棚" />
            <el-option label="3号棚" value="3号棚" />
            <el-option label="4号棚" value="4号棚" />
          </el-select>
        </div>
        <div class="flex gap-2">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表头工具栏 -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">工作日志列表</h3>
        <div class="flex gap-2">
          <el-button
            v-if="!batchEditMode && !batchDeleteMode && !exportMode"
            type="default"
            plain
            size="small"
            @click="batchEditMode = true"
          >
            批量编辑
          </el-button>
          <el-button
            v-if="!batchEditMode && !batchDeleteMode && !exportMode"
            type="danger"
            plain
            size="small"
            @click="batchDeleteMode = true"
          >
            批量删除
          </el-button>
          <el-button
            v-if="!batchEditMode && !batchDeleteMode && !exportMode"
            type="default"
            plain
            size="small"
            @click="exportMode = true"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <template v-if="batchEditMode">
            <el-button type="primary" size="small" @click="handleBatchEdit" :disabled="selectedRows.length === 0">
              批量编辑
            </el-button>
            <el-button size="small" @click="cancelBatch">取消</el-button>
          </template>
          <template v-if="batchDeleteMode">
            <el-button type="danger" size="small" @click="handleConfirmDelete" :disabled="selectedRows.length === 0">
              确认删除 ({{ selectedRows.length }})
            </el-button>
            <el-button size="small" @click="cancelBatch">取消</el-button>
          </template>
          <template v-if="exportMode">
            <el-button type="primary" size="small" @click="handleConfirmExport" :disabled="selectedRows.length === 0">
              确认导出
            </el-button>
            <el-button size="small" @click="cancelBatch">取消</el-button>
          </template>
        </div>
      </div>

      <!-- 表格 - V1.1: blue gradient header -->
      <el-table
        :data="paginatedData"
        style="width: 100%"
        :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: '600' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="batchEditMode || batchDeleteMode || exportMode" type="selection" width="50" align="center" />
        <el-table-column prop="code" label="日志编号" min-width="120" align="center" />
        <el-table-column prop="date" label="日期" min-width="100" align="center" />
        <el-table-column prop="worker" label="工人" min-width="80" align="center" />
        <el-table-column prop="weather" label="天气" min-width="80" align="center" />
        <el-table-column prop="temperature" label="温度" min-width="60" align="center">
          <template #default="{ row }">
            {{ row.temperature }}°
          </template>
        </el-table-column>
        <el-table-column prop="crop" label="作物" min-width="80" align="center" />
        <el-table-column prop="greenhouse" label="大棚" min-width="80" align="center" />
        <el-table-column prop="growthStatus" label="生长状况" min-width="100" align="center" />
        <el-table-column prop="tasks" label="工作内容" min-width="150" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 truncate block max-w-[150px]" :title="row.tasks">
              {{ row.tasks }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button link size="small" @click="handleView(row)" title="查看">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
              <el-button link size="small" @click="handleEdit(row)" title="编辑">
                <el-icon :size="16"><Edit /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select v-model="pagination.pageSize" @change="handlePageSizeChange" style="width: 80px">
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">共 {{ filteredData.length }} 条</span>
          <el-button
            :icon="ArrowLeft"
            circle
            size="small"
            :disabled="pagination.currentPage === 1"
            @click="handlePrevPage"
          />
          <span class="text-sm">{{ pagination.currentPage }} / {{ totalPages }}</span>
          <el-button
            :icon="ArrowRight"
            circle
            size="small"
            :disabled="pagination.currentPage >= totalPages"
            @click="handleNextPage"
          />
        </div>
      </div>
    </div>

    <!-- 批量操作提示栏 -->
    <div v-if="batchEditMode || batchDeleteMode || exportMode" class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
      <div class="text-sm text-gray-600">
        已选择 <strong class="text-emerald-600">{{ selectedRows.length }}</strong> 项
        <span v-if="batchEditMode">（点击批量编辑进入编辑模式）</span>
        <span v-if="batchDeleteMode">（仅待执行状态可删除）</span>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="工作日志详情" width="700px" destroy-on-close>
      <div v-if="currentLog" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500">日志编号</label>
            <p class="font-medium">{{ currentLog.code }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">日期</label>
            <p class="font-medium">{{ currentLog.date }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">工人</label>
            <p class="font-medium">{{ currentLog.worker }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">天气</label>
            <p class="font-medium">{{ currentLog.weather }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">温度</label>
            <p class="font-medium">{{ currentLog.temperature }}°C</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">作物</label>
            <p class="font-medium">{{ currentLog.crop }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">大棚</label>
            <p class="font-medium">{{ currentLog.greenhouse }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">生长状况</label>
            <p class="font-medium">{{ currentLog.growthStatus }}</p>
          </div>
        </div>
        <div>
          <label class="text-sm text-gray-500">工作内容</label>
          <p class="font-medium mt-1">{{ currentLog.tasks }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">问题描述</label>
          <p class="font-medium mt-1">{{ currentLog.problems || '-' }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">处理措施</label>
          <p class="font-medium mt-1">{{ currentLog.solutions || '-' }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 表单弹窗 -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑工作日志' : '新建工作日志'" width="700px" destroy-on-close>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="formData.date"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="工人">
          <el-input v-model="formData.worker" placeholder="请输入工人姓名" />
        </el-form-item>
        <el-form-item label="天气">
          <el-input v-model="formData.weather" placeholder="请输入天气" />
        </el-form-item>
        <el-form-item label="温度">
          <el-input-number v-model="formData.temperature" :min="0" :max="50" />
        </el-form-item>
        <el-form-item label="作物">
          <el-input v-model="formData.crop" placeholder="请输入作物" />
        </el-form-item>
        <el-form-item label="大棚">
          <el-select v-model="formData.greenhouse" placeholder="请选择" style="width: 100%">
            <el-option label="1号棚" value="1号棚" />
            <el-option label="2号棚" value="2号棚" />
            <el-option label="3号棚" value="3号棚" />
            <el-option label="4号棚" value="4号棚" />
          </el-select>
        </el-form-item>
        <el-form-item label="生长状况">
          <el-input v-model="formData.growthStatus" placeholder="请输入生长状况" />
        </el-form-item>
        <el-form-item label="工作内容">
          <el-input v-model="formData.tasks" type="textarea" :rows="3" placeholder="请输入工作内容" />
        </el-form-item>
        <el-form-item label="问题描述">
          <el-input v-model="formData.problems" type="textarea" :rows="2" placeholder="请输入问题描述" />
        </el-form-item>
        <el-form-item label="处理措施">
          <el-input v-model="formData.solutions" type="textarea" :rows="2" placeholder="请输入处理措施" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteVisible" title="删除工作日志警告" width="400px" destroy-on-close>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <span class="text-red-600 text-2xl font-bold">!</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">删除工作日志警告</h3>
        </div>
      </div>
      <div class="text-sm text-gray-600 mt-4 space-y-2">
        <p>确定要删除选中的 <strong>{{ selectedRows.length }}</strong> 个工作日志吗？</p>
        <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
      </div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDeleteConfirm">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportVisible" title="选择导出格式" width="500px" destroy-on-close>
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <div
          v-for="format in exportFormats"
          :key="format.value"
          @click="exportFormat = format.value"
          :class="[
            'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
            exportFormat === format.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div :class="[
            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
            exportFormat === format.value ? 'border-emerald-600' : 'border-gray-300'
          ]">
            <div v-if="exportFormat === format.value" class="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
            <p class="text-xs text-gray-500">{{ format.desc }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="exportVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  Search,
  Refresh,
  Download,
  View,
  Edit,
  ArrowLeft,
  ArrowRight,
  Edit as EditIcon,
  Document,
  Calendar,
  Grid,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 工作日志数据类型

// 统计数据
const stats = reactive({
  total: 35,
  today: 5,
  week: 18,
  exception: 3
})

// 筛选条件
const filters = reactive({
  date: '',
  worker: '',
  greenhouse: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 批量操作状态
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])

// 弹窗状态
const detailVisible = ref(false)
const formVisible = ref(false)
const deleteVisible = ref(false)
const exportVisible = ref(false)

// 当前操作的日志
const currentLog = ref(null)
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  date: '',
  worker: '',
  weather: '',
  temperature: '',
  crop: '',
  greenhouse: '',
  growthStatus: '',
  tasks: '',
  problems: '',
  solutions: ''
})

// 导出格式
const exportFormat = ref('excel')
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 工作日志数据
const workLogs = ref([
  { id: '1', code: 'WL2024030101', date: '2024-03-01', worker: '张伟民', weather: '晴', temperature: 25, crop: '番茄', greenhouse: '1号棚', growthStatus: '良好', tasks: '浇水、施肥', problems: '', solutions: '' },
  { id: '2', code: 'WL2024030102', date: '2024-03-01', worker: '李明轩', weather: '多云', temperature: 22, crop: '黄瓜', greenhouse: '2号棚', growthStatus: '一般', tasks: '除草、松土', problems: '发现少量虫害', solutions: '已喷洒农药' },
  { id: '3', code: 'WL2024030103', date: '2024-03-02', worker: '王建国', weather: '晴', temperature: 26, crop: '茄子', greenhouse: '3号棚', growthStatus: '良好', tasks: '修剪、浇水', problems: '', solutions: '' },
  { id: '4', code: 'WL2024030104', date: '2024-03-02', worker: '赵俊杰', weather: '阴', temperature: 20, crop: '辣椒', greenhouse: '4号棚', growthStatus: '较差', tasks: '施肥、病虫害防治', problems: '生长缓慢', solutions: '增加施肥频次' },
  { id: '5', code: 'WL2024030105', date: '2024-03-03', worker: '钱文涛', weather: '晴', temperature: 28, crop: '番茄', greenhouse: '1号棚', growthStatus: '良好', tasks: '采收、浇水', problems: '', solutions: '' },
])

// 筛选后的数据
const filteredData = computed(() => {
  return workLogs.value.filter(log => {
    if (filters.date && log.date !== filters.date) return false
    if (filters.worker && !log.worker.includes(filters.worker)) return false
    if (filters.greenhouse && log.greenhouse !== filters.greenhouse) return false
    return true
  })
})

// 更新总数
pagination.total = filteredData.value.length

// 总页数
const totalPages = computed(() => Math.ceil(filteredData.value.length / pagination.pageSize) || 1)

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
  Object.assign(filters, { date: '', worker: '', greenhouse: '' })
  pagination.currentPage = 1
}

// 查看
const handleView = (row) => {
  currentLog.value = row
  detailVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentLog.value = row
  Object.assign(formData, row)
  isEdit.value = true
  formVisible.value = true
}

// 新建
const handleAdd = () => {
  currentLog.value = null
  Object.keys(formData).forEach(key => {
    (formData)[key] = key === 'temperature' ? 25 : ''
  })
  isEdit.value = false
  formVisible.value = true
}

// 保存
const handleSave = () => {
  ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
  formVisible.value = false
}

// 批量编辑
const handleBatchEdit = () => {
  ElMessage.info('批量编辑功能开发中')
  cancelBatch()
}

// 确认删除
const handleConfirmDelete = () => {
  deleteVisible.value = true
}

// 确认删除操作
const handleDeleteConfirm = () => {
  ElMessage.success('删除成功')
  deleteVisible.value = false
  cancelBatch()
}

// 确认导出
const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  exportVisible.value = true
}

// 执行导出
const handleDoExport = () => {
  ElMessage.success(`正在导出 ${selectedRows.value.length} 条数据为 ${exportFormat.value.toUpperCase()} 格式`)
  exportVisible.value = false
  cancelBatch()
}

// 取消批量操作
const cancelBatch = () => {
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页操作
const handlePrevPage = () => {
  if (pagination.currentPage > 1) {
    pagination.currentPage--
  }
}

const handleNextPage = () => {
  if (pagination.currentPage < totalPages.value) {
    pagination.currentPage++
  }
}

const handlePageSizeChange = () => {
  pagination.currentPage = 1
}
</script>
