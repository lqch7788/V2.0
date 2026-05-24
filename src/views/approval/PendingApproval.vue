<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Clock /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">待审批</h1>
          <p class="text-gray-500">待处理的审批任务</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="bg-white rounded-lg p-3 border border-gray-300">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="16" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">待审批</p>
            <p class="text-lg font-bold text-gray-900">{{ approvalStore.stats.pending }}</p>
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
            <p class="text-lg font-bold text-gray-900">{{ approvalStore.stats.approved }}</p>
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
            <p class="text-lg font-bold text-gray-900">{{ approvalStore.stats.rejected }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-300">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <el-icon :size="16" class="text-orange-600"><Lightning /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">加急</p>
            <p class="text-lg font-bold text-gray-900">{{ approvalStore.stats.urgent }}</p>
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
            <p class="text-lg font-bold text-gray-900">{{ approvalStore.stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">审批类型</label>
          <el-select v-model="localFilters.type" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="领料单" value="领料单" />
            <el-option label="采购申请" value="采购申请" />
            <el-option label="退料单" value="退料单" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="localFilters.status" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索关键词</label>
          <el-input v-model="localFilters.keyword" placeholder="申请单号/申请人" clearable />
        </div>
        <div class="flex gap-2">
          <el-button type="primary" @click="handleSearch" :loading="approvalStore.isLoading">
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
        <h3 class="text-lg font-semibold text-gray-900">待审批列表</h3>
        <div class="flex gap-2">
          <el-button
            v-if="!batchDeleteMode"
            type="danger"
            plain
            size="small"
            @click="batchDeleteMode = true"
          >
            批量审批
          </el-button>
          <template v-if="batchDeleteMode">
            <el-button type="success" size="small" @click="handleBatchApprove" :disabled="selectedRows.length === 0">
              批量通过 ({{ selectedRows.length }})
            </el-button>
            <el-button type="danger" size="small" @click="handleBatchReject" :disabled="selectedRows.length === 0">
              批量驳回 ({{ selectedRows.length }})
            </el-button>
            <el-button size="small" @click="cancelBatchMode">取消</el-button>
          </template>
        </div>
      </div>

      <el-table
        :data="paginatedRecords"
        style="width: 100%"
        stripe
        v-loading="approvalStore.isLoading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="batchDeleteMode" type="selection" width="50" align="center" />
        <el-table-column prop="code" label="申请单号" min-width="140" align="center" />
        <el-table-column prop="typeName" label="审批类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeColorMap[row.type]" size="small" effect="light">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" min-width="100" align="center" />
        <el-table-column prop="applicantDepartment" label="部门" min-width="100" align="center" />
        <el-table-column prop="applyDate" label="申请时间" min-width="120" align="center">
          <template #default="{ row }">
            {{ formatDate(row.applyDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-500 truncate block max-w-[150px]" :title="row.title">
              {{ row.title || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" min-width="100" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ row.amount ? `¥${row.amount}` : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusColorMap[row.status]" size="small" effect="light">
              {{ statusLabelMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button type="success" size="small" @click="handleApprove(row)" :disabled="row.status !== 'pending'">通过</el-button>
              <el-button type="danger" size="small" @click="handleReject(row)" :disabled="row.status !== 'pending'">驳回</el-button>
              <el-button type="primary" size="small" @click="showDetail(row)">查看</el-button>
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
    <el-dialog v-model="detailDialogVisible" title="审批详情" width="700px" destroy-on-close>
      <ApprovalDetail v-if="currentApproval" :approval="currentApproval" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Clock,
  CircleCheck,
  Warning,
  Grid,
  Search,
  Refresh,
  ArrowLeft,
  ArrowRight,
  Lightning
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores'
import { getApprovalTypeName } from '@/services/apiApprovalService'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'

// 审批Store
const approvalStore = useApprovalStore()

// 审批类型标签映射
const typeLabelMap = {
  'material_request': '领料审批',
  'purchase_request': '采购审批',
  'production_plan': '生产审批',
  'task_dispatch': '农事审批',
  'budget_create': '预算审批',
  'leave': '请假',
  'overtime': '加班',
  'resignation': '离职',
}

// 审批类型颜色映射
const typeColorMap = {
  'material_request': 'primary',
  'purchase_request': 'warning',
  'production_plan': 'success',
  'task_dispatch': 'info',
  'budget_create': 'danger',
  'leave': 'primary',
  'overtime': 'warning',
  'resignation': 'danger',
}

// 状态标签映射
const statusLabelMap = {
  'pending': '待审批',
  'approved': '已通过',
  'rejected': '已驳回',
  'partially_approved': '部分通过',
  'cancelled': '已撤回',
  'draft': '草稿',
}

// 状态颜色映射
const statusColorMap = {
  'pending': 'warning',
  'approved': 'success',
  'rejected': 'danger',
  'partially_approved': 'info',
  'cancelled': 'info',
  'draft': 'info',
}

// 本地筛选条件
const localFilters = reactive({
  type: '',
  status: '',
  keyword: '',
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 批量选择
const selectedRows = ref([])
const batchDeleteMode = ref(false)

// 详情弹窗
const detailDialogVisible = ref(false)
const currentApproval = ref(null)

// 显示详情弹窗
const showDetail = (row) => {
  currentApproval.value = row
  detailDialogVisible.value = true
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 筛选后的记录（使用Store的filteredApprovals）
const filteredRecords = computed(() => {
  // 应用本地筛选条件，使用typeName匹配中文审批类型
  return approvalStore.approvals.filter(record => {
    if (localFilters.type && record.typeName !== localFilters.type) return false
    if (localFilters.status && record.status !== localFilters.status) return false
    if (localFilters.keyword) {
      const text = localFilters.keyword.toLowerCase()
      const matchCode = record.code?.toLowerCase().includes(text)
      const matchTitle = record.title?.toLowerCase().includes(text)
      const matchApplicant = record.applicantName?.toLowerCase().includes(text)
      if (!matchCode && !matchTitle && !matchApplicant) return false
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

// 加载数据
const loadData = async () => {
  await approvalStore.fetchApprovals()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  // 应用筛选
  approvalStore.setFilters({
    type: localFilters.type ? [localFilters.type] : undefined,
    status: localFilters.status ? [localFilters.status] : undefined,
    keyword: localFilters.keyword || undefined,
  })
}

// 重置
const handleReset = () => {
  localFilters.type = ''
  localFilters.status = ''
  localFilters.keyword = ''
  approvalStore.resetFilters()
  currentPage.value = 1
}

// 批量选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 取消批量模式
const cancelBatchMode = () => {
  batchDeleteMode.value = false
  selectedRows.value = []
}

// 审核通过
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要通过该审批申请吗？`, '审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    })
    const success = await approvalStore.approve(row.id)
    if (success) {
      ElMessage.success('审核已通过')
    } else {
      ElMessage.error(approvalStore.error || '审批失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('审批通过失败:', err)
    }
  }
}

// 审核驳回 - 默认填写"审批拒绝"
const handleReject = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回确认', {
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      type: 'warning',
      inputValue: '审批拒绝', // 默认值
    })
    if (value) {
      const success = await approvalStore.reject(row.id, value)
      if (success) {
        ElMessage.success('已驳回')
      } else {
        ElMessage.error(approvalStore.error || '审批失败')
      }
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('审批驳回失败:', err)
    }
  }
}

// 批量通过
const handleBatchApprove = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要通过选中的 ${selectedRows.value.length} 条审批吗？`,
      '批量审核确认',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'success' }
    )
    const ids = selectedRows.value.map(row => row.id)
    const success = await approvalStore.batchApprove(ids)
    if (success) {
      ElMessage.success('批量审批通过成功')
      cancelBatchMode()
    } else {
      ElMessage.error(approvalStore.error || '批量审批失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量审批通过失败:', err)
    }
  }
}

// 批量驳回
const handleBatchReject = async () => {
  if (selectedRows.value.length === 0) return
  try {
    const { value } = await ElMessageBox.prompt(
      `请输入驳回原因`,
      '批量驳回确认',
      { confirmButtonText: '确认驳回', cancelButtonText: '取消', type: 'warning' }
    )
    if (value) {
      const ids = selectedRows.value.map(row => row.id)
      const success = await approvalStore.batchReject(ids, value)
      if (success) {
        ElMessage.success('批量审批驳回成功')
        cancelBatchMode()
      } else {
        ElMessage.error(approvalStore.error || '批量审批失败')
      }
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量审批驳回失败:', err)
    }
  }
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

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>
