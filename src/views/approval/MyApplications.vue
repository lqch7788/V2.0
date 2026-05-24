<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><DocumentCopy /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">我的申请</h1>
          <p class="text-gray-500">我提交的审批申请</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white rounded-lg p-3 border border-gray-300">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="16" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">待审批</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-300">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="16" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">已通过</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-300">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="16" class="text-red-600"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">已驳回</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-300">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <el-icon :size="16" class="text-purple-600"><Grid /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">全部</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">申请类型</label>
          <el-select v-model="filters.type" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="领料申请" value="material" />
            <el-option label="采购申请" value="purchase" />
            <el-option label="生产申请" value="production" />
            <el-option label="农事申请" value="farm" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">申请时间</label>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索关键词</label>
          <el-input v-model="filters.searchText" placeholder="申请单号" clearable />
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
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增申请
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">我的申请列表</h3>
        <div class="flex gap-2">
          <el-button
            v-if="!batchDeleteMode"
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
        </div>
      </div>

      <el-table
        :data="paginatedRecords"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="batchDeleteMode" type="selection" width="50" align="center" />
        <el-table-column prop="code" label="申请单号" min-width="140" align="center" />
        <el-table-column prop="type" label="申请类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeColorMap[row.type]" size="small" effect="light">
              {{ typeLabelMap[row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" min-width="100" align="center" />
        <el-table-column prop="createTime" label="申请时间" min-width="120" align="center" />
        <el-table-column prop="reason" label="申请原因" min-width="150" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-500 truncate block max-w-[150px]" :title="row.reason">
              {{ row.reason || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusColorMap[row.status]" size="small" effect="light">
              {{ statusLabelMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button v-if="row.status === 'pending'" type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="申请详情" width="800px" top="5vh">
      <div v-if="selectedApplication" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请单号">{{ selectedApplication.code }}</el-descriptions-item>
          <el-descriptions-item label="申请类型">{{ typeLabelMap[selectedApplication.type] }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ selectedApplication.department }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ selectedApplication.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusColorMap[selectedApplication.status]">{{ statusLabelMap[selectedApplication.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请原因" :span="2">{{ selectedApplication.reason }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  DocumentCopy,
  Clock,
  CircleCheck,
  Warning,
  Grid,
  Search,
  Refresh,
  Plus,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 申请类型标签映射
const typeLabelMap = {
  'material': '领料申请',
  'purchase': '采购申请',
  'production': '生产申请',
  'farm': '农事申请',
  'budget': '预算申请'
}

// 申请类型颜色映射
const typeColorMap = {
  'material': 'primary',
  'purchase': 'warning',
  'production': 'success',
  'farm': 'info',
  'budget': 'danger'
}

// 状态标签映射
const statusLabelMap = {
  'pending': '待审批',
  'approved': '已通过',
  'rejected': '已驳回'
}

// 状态颜色映射
const statusColorMap = {
  'pending': 'warning',
  'approved': 'success',
  'rejected': 'danger'
}

// 统计数据
const stats = reactive({
  pending: 3,
  approved: 12,
  rejected: 2,
  total: 17
})

// 筛选条件
const filters = reactive({
  type: '',
  status: '',
  date: '',
  searchText: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 批量选择
const selectedRows = ref([])
const batchDeleteMode = ref(false)

// 我的申请数据
const records = ref([
  { id: '1', code: 'AP2024030101', type: 'material', department: '生产部', createTime: '2024-03-01 09:30', reason: '番茄种植所需肥料', status: 'pending' },
  { id: '2', code: 'AP2024030102', type: 'purchase', department: '采购部', createTime: '2024-03-01 10:15', reason: '采购新型灌溉设备', status: 'pending' },
  { id: '3', code: 'AP2024030103', type: 'production', department: '生产部', createTime: '2024-03-01 11:00', reason: '调整本周生产计划', status: 'pending' },
  { id: '4', code: 'AP2024022801', type: 'material', department: '生产部', createTime: '2024-02-28 09:30', reason: '黄瓜种植所需肥料', status: 'approved' },
  { id: '5', code: 'AP2024022802', type: 'purchase', department: '采购部', createTime: '2024-02-28 10:15', reason: '采购新型植保无人机', status: 'approved' },
  { id: '6', code: 'AP2024022803', type: 'farm', department: '农业部', createTime: '2024-02-28 11:00', reason: '茄子种植需要浇水', status: 'rejected' },
  { id: '7', code: 'AP2024022701', type: 'material', department: '生产部', createTime: '2024-02-27 09:00', reason: '辣椒种植所需农药', status: 'approved' },
  { id: '8', code: 'AP2024022702', type: 'production', department: '生产部', createTime: '2024-02-27 10:30', reason: '新增一条生产线', status: 'approved' },
])

// 筛选后的记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    if (filters.type && record.type !== filters.type) return false
    if (filters.status && record.status !== filters.status) return false
    // 日期筛选：createTime格式为"2024-02-28 11:00"，检查是否以日期字符串开头
    if (filters.date && !record.createTime?.startsWith(filters.date)) return false
    if (filters.searchText) {
      const text = filters.searchText.toLowerCase()
      if (!record.code.toLowerCase().includes(text)) {
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
    type: '',
    status: '',
    date: '',
    searchText: ''
  })
  currentPage.value = 1
}

// 新增申请
const handleAdd = () => {
  ElMessage.info('新增申请功能开发中')
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

// 查看详情
const selectedApplication = ref(null)
const showDetailModal = ref(false)

const handleView = (row) => {
  selectedApplication.value = row
  showDetailModal.value = true
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info('编辑申请：' + row.code)
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
