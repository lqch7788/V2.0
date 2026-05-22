<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Checked /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">生产审批</h1>
          <p class="text-gray-500">生产相关审批流程</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">待审批</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">已通过</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" class="text-red-600"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">已驳回</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <el-icon :size="20" class="text-purple-600"><Grid /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">全部</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式切换 -->
    <div class="bg-white rounded-xl p-1 shadow-sm">
      <div class="flex gap-1 p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === tab.value
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
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
          <el-input v-model="filters.searchText" placeholder="申请单号/申请人" clearable />
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
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">{{ currentTabLabel }}列表</h3>
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
        <el-table-column prop="type" label="生产类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeColorMap[row.type]" size="small" effect="light">
              {{ typeLabelMap[row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" min-width="100" align="center" />
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
            <div v-if="row.status === 'pending'" class="flex items-center justify-center gap-1">
              <el-button type="success" size="small" @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">驳回</el-button>
            </div>
            <el-button v-else type="primary" size="small" @click="handleView(row)">查看</el-button>
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
  Checked,
  Clock,
  CircleCheck,
  Warning,
  Grid,
  Search,
  Refresh,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 标签页配置
const tabs = [
  { value: 'tech', label: '技术方案' },
  { value: 'plan', label: '生产计划' },
  { value: 'harvest', label: '采收申请' }
]

// 当前标签
const activeTab = ref('tech')

// 当前标签名称
const currentTabLabel = computed(() => {
  const tab = tabs.find(t => t.value === activeTab.value)
  return tab ? tab.label : ''
})

// 生产类型标签映射
const typeLabelMap = {
  'tech': '技术方案',
  'plan': '生产计划',
  'harvest': '采收申请'
}

// 生产类型颜色映射
const typeColorMap = {
  'tech': 'primary',
  'plan': 'warning',
  'harvest': 'success'
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
  pending: 5,
  approved: 18,
  rejected: 4,
  total: 27
})

// 筛选条件
const filters = reactive({
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

// 生产审批数据
const records = ref([
  { id: '1', code: 'PP2024030101', type: 'tech', applicant: '张伟民', department: '技术部', createTime: '2024-03-01 09:30', reason: '番茄种植技术方案优化', status: 'pending' },
  { id: '2', code: 'PP2024030102', type: 'plan', applicant: '李明轩', department: '生产部', createTime: '2024-03-01 10:15', reason: '下周生产计划安排', status: 'pending' },
  { id: '3', code: 'PP2024030103', type: 'harvest', applicant: '王建国', department: '生产部', createTime: '2024-03-01 11:00', reason: '番茄首批采收申请', status: 'pending' },
  { id: '4', code: 'PP2024022801', type: 'tech', applicant: '赵俊杰', department: '技术部', createTime: '2024-02-28 09:30', reason: '黄瓜种植技术方案', status: 'approved' },
  { id: '5', code: 'PP2024022802', type: 'plan', applicant: '钱文涛', department: '生产部', createTime: '2024-02-28 10:15', reason: '本月生产计划调整', status: 'approved' },
  { id: '6', code: 'PP2024022803', type: 'harvest', applicant: '孙丽华', department: '生产部', createTime: '2024-02-28 11:00', reason: '茄子采收申请', status: 'rejected' },
  { id: '7', code: 'PP2024022701', type: 'tech', applicant: '周建设', department: '技术部', createTime: '2024-02-27 09:00', reason: '辣椒种植技术方案', status: 'approved' },
  { id: '8', code: 'PP2024022702', type: 'plan', applicant: '吴光明', department: '生产部', createTime: '2024-02-27 10:30', reason: '新增生产线计划', status: 'approved' },
])

// 筛选后的记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    if (record.type !== activeTab.value) return false
    if (filters.status && record.status !== filters.status) return false
    if (filters.date && !record.createTime.startsWith(filters.date)) return false
    if (filters.searchText) {
      const text = filters.searchText.toLowerCase()
      if (!record.code.toLowerCase().includes(text) &&
          !record.applicant.toLowerCase().includes(text)) {
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
    status: '',
    date: '',
    searchText: ''
  })
  currentPage.value = 1
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
const handleApprove = (row) => {
  ElMessageBox.confirm(`确定要通过该生产审批申请吗？`, '审核确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    ElMessage.success('审核已通过')
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

// 查看详情
const handleView = (row) => {
  ElMessage.info('查看审批详情：' + row.code)
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
