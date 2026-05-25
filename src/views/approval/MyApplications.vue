<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><DocumentCopy /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">我的申请</h1>
          <p class="text-gray-500">查看我提交的所有审批申请</p>
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
            <el-icon :size="16" class="text-red-600"><CircleClose /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">已拒绝</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-300">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="16" class="text-blue-600"><Document /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">全部</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl p-1 inline-flex shadow-sm">
      <el-button
        v-for="tab in tabs"
        :key="tab.key"
        :type="activeTab === tab.key ? 'primary' : ''"
        :class="['px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors', activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
        @click="handleTabChange(tab.key)"
      >
        <el-icon :size="16"><component :is="tab.icon" /></el-icon>
        {{ tab.label }}
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex gap-4 items-end">
        <div class="flex-1">
          <el-input
            v-model="searchTerm"
            placeholder="搜索审批单号、标题..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="typeFilter" placeholder="全部类型" style="width: 160px" @change="handleSearch">
          <el-option label="全部类型" value="全部" />
          <el-option label="领料申请" value="material_request" />
          <el-option label="退料单" value="return_material" />
          <el-option label="采购申请" value="purchase_request" />
          <el-option label="请假" value="leave" />
          <el-option label="加班" value="overtime" />
          <el-option label="离职" value="resignation" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">我的申请列表</h3>
      </div>

      <el-table :data="paginatedData" style="width: 100%" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #6366f1)', color: 'white', fontWeight: '600' }">
        <el-table-column prop="code" label="审批单号" min-width="120" />
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="typeName" label="类型" min-width="100" />
        <el-table-column prop="applicantName" label="申请人" min-width="100" />
        <el-table-column prop="applyDate" label="申请时间" min-width="120" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusBadge(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button type="primary" size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>

      <!-- 详情弹窗 -->
      <el-dialog v-model="detailVisible" title="审批详情" width="800px" destroy-on-close>
        <ApprovalDetail v-if="currentApproval" :approval="currentApproval" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  DocumentCopy,
  Search,
  Clock,
  CircleCheck,
  CircleClose,
  Document,
  Grid,
  List,
  Close,
  Check,
  View
} from '@element-plus/icons-vue'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'

const approvalStore = useApprovalStore()
const { approvals } = storeToRefs(approvalStore)

const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

const tabs = [
  { key: 'all', label: '全部', icon: Grid },
  { key: 'pending', label: '待审批', icon: Clock },
  { key: 'approved', label: '已通过', icon: CircleCheck },
  { key: 'rejected', label: '已拒绝', icon: Close }
]

// 当前用户ID
const currentUserId = localStorage.getItem('userId') || 'user_001'

// 当前Tab
const activeTab = ref('all')

// 搜索和筛选
const searchTerm = ref('')
const typeFilter = ref('全部')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 详情弹窗
const detailVisible = ref(false)
const currentApproval = ref(null)

// 筛选数据
const filteredData = computed(() => {
  return approvals.value.filter(item => {
    // 只看当前用户提交的
    if (item.applicantId !== currentUserId) return false
    // Tab筛选
    if (activeTab.value === 'pending' && item.status !== ApprovalStatus.PENDING) return false
    if (activeTab.value === 'approved' && item.status !== ApprovalStatus.APPROVED) return false
    if (activeTab.value === 'rejected' && item.status !== ApprovalStatus.REJECTED) return false
    // 搜索
    const matchSearch =
      !searchTerm.value ||
      item.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.applicantName?.includes(searchTerm.value) ||
      item.code?.includes(searchTerm.value)
    // 类型筛选
    const matchType = typeFilter.value === '全部' || item.type === typeFilter.value
    return matchSearch && matchType
  })
})

// 更新统计
const updateStats = () => {
  const myApps = approvals.value.filter(a => a.applicantId === currentUserId)
  stats.total = myApps.length
  stats.pending = myApps.filter(d => d.status === ApprovalStatus.PENDING).length
  stats.approved = myApps.filter(d => d.status === ApprovalStatus.APPROVED).length
  stats.rejected = myApps.filter(d => d.status === ApprovalStatus.REJECTED).length
}

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value) || 1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// Tab切换
const handleTabChange = (key) => {
  activeTab.value = key
  currentPage.value = 1
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 状态显示
const getStatusBadge = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return 'success'
    case ApprovalStatus.REJECTED:
      return 'danger'
    case ApprovalStatus.PENDING:
      return 'warning'
    default:
      return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return '已通过'
    case ApprovalStatus.REJECTED:
      return '已拒绝'
    case ApprovalStatus.PENDING:
      return '待审批'
    default:
      return status
  }
}

// 查看详情
const handleView = (row) => {
  currentApproval.value = row
  detailVisible.value = true
}

// 初始化
onMounted(async () => {
  await approvalStore.fetchApprovals()
  updateStats()
})
</script>
