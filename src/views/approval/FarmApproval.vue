<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Edit /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">农事审批</h1>
          <p class="text-gray-500">任务派发、临时任务、手动录入的操作记录统一管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" class="text-blue-600"><Document /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">总记录</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" class="text-green-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">任务来源</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.task }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">临时任务</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.tempTask }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <el-icon :size="20" class="text-purple-600"><EditPen /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">手动录入</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.manual }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">来源类型</label>
          <el-select v-model="filters.sourceType" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="任务" value="task" />
            <el-option label="临时任务" value="tempTask" />
            <el-option label="手动录入" value="manual" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">操作类型</label>
          <el-select v-model="filters.operationType" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="播种" value="planting" />
            <el-option label="灌溉" value="irrigation" />
            <el-option label="施肥" value="fertilization" />
            <el-option label="病虫害防治" value="pest_control" />
            <el-option label="修剪" value="pruning" />
            <el-option label="采收" value="harvest" />
            <el-option label="除草" value="weeding" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="待执行" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索关键词</label>
          <el-input v-model="filters.searchText" placeholder="操作单号/作物/区域" clearable />
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
          <el-button type="success" @click="handleAdd" v-if="canCreate">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表头工具栏 -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">操作记录列表</h3>
        <div class="flex gap-2">
          <el-button
            v-if="!batchDeleteMode && canDelete"
            type="danger"
            plain
            size="small"
            @click="batchDeleteMode = true"
          >
            批量删除
          </el-button>
          <template v-if="batchDeleteMode">
            <el-button type="danger" size="small" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
              确认删除 ({{ selectedRows.length }})
            </el-button>
            <el-button size="small" @click="cancelBatchDelete">取消</el-button>
          </template>
          <el-button
            v-if="canExport"
            type="default"
            plain
            size="small"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="paginatedRecords"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="batchDeleteMode" type="selection" width="50" align="center" />
        <el-table-column prop="recordCode" label="操作单号" min-width="140" align="center" />
        <el-table-column prop="sourceType" label="来源" min-width="100" align="center">
          <template #default="{ row }">
            <span :class="sourceColorMap[row.sourceType]">{{ sourceLabelMap[row.sourceType] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sourceCode" label="来源编号" min-width="120" align="center">
          <template #default="{ row }">
            <span class="text-blue-600">{{ row.sourceCode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operationType" label="操作类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeColorMap[row.operationType]" size="small" effect="light">
              {{ typeLabelMap[row.operationType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="作物/区域" min-width="140" align="center">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="font-medium text-gray-900">{{ row.cropName }}</div>
              <div class="text-gray-500 text-xs">{{ row.greenhouseName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人员" min-width="100" align="center" />
        <el-table-column prop="operationDate" label="操作日期" min-width="120" align="center" />
        <el-table-column label="进度" min-width="100" align="center">
          <template #default="{ row }">
            <div v-if="row.progress !== undefined" class="flex items-center justify-center gap-2">
              <el-progress :percentage="row.progress" :color="row.progress === 100 ? '#67c23a' : '#409eff'" style="width: 60px" />
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]" size="small" effect="light">
              {{ statusLabelMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="150" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-500 truncate block max-w-[150px]" :title="row.remarks">
              {{ row.remarks || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
          <template #default="{ row }">
            <div v-if="row.status === 'waiting_acceptance'" class="flex items-center justify-center gap-1">
              <el-button type="success" size="small" @click="handleAccept(row)">通过</el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">驳回</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select v-model="pageSize" @change="handlePageSizeChange" style="width: 80px">
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条</span>
          <el-button
            :icon="ArrowLeft"
            circle
            size="small"
            :disabled="currentPage === 1"
            @click="handlePrevPage"
          />
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <el-button
            :icon="ArrowRight"
            circle
            size="small"
            :disabled="currentPage >= totalPages"
            @click="handleNextPage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  Edit,
  Document,
  CircleCheck,
  Clock,
  EditPen,
  Search,
  Refresh,
  Plus,
  Download,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 农事记录数据类型

// 来源标签映射
const sourceLabelMap = {
  'task': '任务',
  'tempTask': '临时任务',
  'manual': '手动录入',
  'inspection': '巡查'
}

// 来源颜色映射
const sourceColorMap = {
  'task': 'text-green-600 font-medium',
  'tempTask': 'text-amber-600 font-medium',
  'manual': 'text-blue-600 font-medium',
  'inspection': 'text-purple-600 font-medium'
}

// 操作类型标签映射
const typeLabelMap = {
  'planting': '播种',
  'irrigation': '灌溉',
  'fertilization': '施肥',
  'pest_control': '病虫害防治',
  'pruning': '修剪',
  'harvest': '采收',
  'weeding': '除草',
  'other': '其他'
}

// 操作类型颜色映射
const typeColorMap = {
  'planting': 'success',
  'irrigation': 'primary',
  'fertilization': 'warning',
  'pest_control': 'danger',
  'pruning': 'info',
  'harvest': 'warning',
  'weeding': 'success',
  'other': 'info'
}

// 状态标签映射
const statusLabelMap = {
  'pending': '待执行',
  'in_progress': '进行中',
  'completed': '已完成',
  'waiting_acceptance': '待验收',
  'rejected': '已驳回',
  'cancelled': '已取消'
}

// 状态颜色映射
const statusTypeMap = {
  'completed': 'success',
  'in_progress': 'primary',
  'pending': 'warning',
  'waiting_acceptance': 'warning',
  'rejected': 'danger',
  'cancelled': 'info'
}

// 统计数据
const stats = reactive({
  total: 12,
  task: 5,
  tempTask: 4,
  manual: 3
})

// 权限
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true

// 筛选条件
const filters = reactive({
  sourceType: '',
  operationType: '',
  status: '',
  greenhouseId: '',
  operatorId: '',
  dateFrom: '',
  dateTo: '',
  searchText: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 批量选择
const selectedRows = ref([])
const batchDeleteMode = ref(false)

// 农事记录数据
const records = ref([
  { id: '1', recordCode: 'AR2024030101', sourceType: 'task', sourceCode: 'T2024030101', operationType: 'planting', cropName: '番茄', greenhouseName: '1号棚', operatorName: '张伟民', operationDate: '2024-03-01', progress: 100, status: 'completed', remarks: '已完成播种' },
  { id: '2', recordCode: 'AR2024030102', sourceType: 'tempTask', sourceCode: 'TT2024030101', operationType: 'irrigation', cropName: '黄瓜', greenhouseName: '2号棚', operatorName: '李明轩', operationDate: '2024-03-01', progress: 60, status: 'in_progress', remarks: '灌溉进行中' },
  { id: '3', recordCode: 'AR2024030103', sourceType: 'manual', operationType: 'fertilization', cropName: '茄子', greenhouseName: '3号棚', operatorName: '王建国', operationDate: '2024-03-02', progress: 80, status: 'waiting_acceptance', remarks: '等待验收' },
  { id: '4', recordCode: 'AR2024030104', sourceType: 'task', sourceCode: 'T2024030102', operationType: 'pest_control', cropName: '辣椒', greenhouseName: '4号棚', operatorName: '赵俊杰', operationDate: '2024-03-02', progress: 40, status: 'in_progress', remarks: '病虫害防治中' },
])

// 筛选后的记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    if (filters.sourceType && record.sourceType !== filters.sourceType) return false
    if (filters.operationType && record.operationType !== filters.operationType) return false
    if (filters.status && record.status !== filters.status) return false
    if (filters.searchText) {
      const text = filters.searchText.toLowerCase()
      if (!record.recordCode.toLowerCase().includes(text) &&
          !record.cropName.toLowerCase().includes(text) &&
          !record.greenhouseName.toLowerCase().includes(text) &&
          !record.operatorName.toLowerCase().includes(text)) {
        return false
      }
    }
    return true
  })
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize.value) || 1)

// 分页数据
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  Object.assign(filters, {
    sourceType: '',
    operationType: '',
    status: '',
    greenhouseId: '',
    operatorId: '',
    dateFrom: '',
    dateTo: '',
    searchText: ''
  })
  currentPage.value = 1
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增功能开发中')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '删除确认', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    batchDeleteMode.value = false
    selectedRows.value = []
  }).catch(() => {})
}

const cancelBatchDelete = () => {
  batchDeleteMode.value = false
  selectedRows.value = []
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 审核通过
const handleAccept = (row) => {
  ElMessageBox.confirm(`确定要通过该操作记录吗？`, '审核确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    ElMessage.success('审核通过')
  }).catch(() => {})
}

// 审核驳回
const handleReject = (row) => {
  ElMessageBox.prompt('请输入驳回原因', '驳回确认', {
    confirmButtonText: '确认驳回',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(({ value }) => {
    if (value) {
      ElMessage.success('已驳回')
    }
  }).catch(() => {})
}

// 分页操作
const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}
</script>
