<template>
  <div class="space-y-6">
    <!-- 页面头部 - V1.1: ClipboardList图标, emerald渐变 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
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

    <!-- 统计卡片 - V1.1 KpiCard风格: bg-[#F2F6FA] -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-700"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            <p class="text-xs text-gray-500">待审批</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-700"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            <p class="text-xs text-gray-500">已通过</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <el-icon :size="20" class="text-red-700"><CircleClose /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
            <p class="text-xs text-gray-500">已拒绝</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <el-icon :size="20" class="text-blue-700"><Document /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-xs text-gray-500">全部</p>
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

    <!-- 搜索筛选 - V1.1: bg-[#F2F6FA] -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
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

    <!-- 数据列表 - V1.1: 蓝色渐变表头 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">我的申请列表</h3>
      </div>

      <el-table :data="paginatedData" style="width: 100%" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: '600', borderBottom: 'none' }">
        <el-table-column prop="code" label="审批单号" width="120" />
        <el-table-column prop="title" label="标题" width="150" />
        <el-table-column prop="typeName" label="类型" width="100" />
        <el-table-column prop="applicantName" label="申请人" width="100" />
        <el-table-column prop="applyDate" label="申请时间" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button link size="small" @click="handleView(row)" title="查看">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
              <template v-if="row.status === 'pending'">
                <el-button link size="small" @click="handleApprove(row)" title="通过">
                  <el-icon :size="16"><CircleCheck /></el-icon>
                </el-button>
                <el-button link size="small" @click="handleReject(row)" title="拒绝">
                  <el-icon :size="16"><CircleClose /></el-icon>
                </el-button>
              </template>
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
  DocumentCopy, Search, Clock, CircleCheck, CircleClose,
  Document, Grid, List, Close, Check, View
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

const currentUserId = localStorage.getItem('userId') || 'user_001'
const activeTab = ref('all')
const searchTerm = ref('')
const typeFilter = ref('全部')
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentApproval = ref(null)

// 筛选数据
const filteredData = computed(() => {
  return approvals.value.filter(item => {
    if (item.applicantId !== currentUserId) return false
    if (activeTab.value === 'pending' && item.status !== ApprovalStatus.PENDING) return false
    if (activeTab.value === 'approved' && item.status !== ApprovalStatus.APPROVED) return false
    if (activeTab.value === 'rejected' && item.status !== ApprovalStatus.REJECTED) return false
    const matchSearch = !searchTerm.value ||
      item.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.applicantName?.includes(searchTerm.value) ||
      item.code?.includes(searchTerm.value)
    const matchType = typeFilter.value === '全部' || item.type === typeFilter.value
    return matchSearch && matchType
  })
})

const stats = reactive({ total: 0, pending: 0, approved: 0, rejected: 0 })

const updateStats = () => {
  const myApps = approvals.value.filter(a => a.applicantId === currentUserId)
  stats.total = myApps.length
  stats.pending = myApps.filter(d => d.status === ApprovalStatus.PENDING).length
  stats.approved = myApps.filter(d => d.status === ApprovalStatus.APPROVED).length
  stats.rejected = myApps.filter(d => d.status === ApprovalStatus.REJECTED).length
}

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value) || 1)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const handleTabChange = (key) => { activeTab.value = key; currentPage.value = 1 }
const handleSearch = () => { currentPage.value = 1 }

// V1.1状态样式: 内联pills
const getStatusClass = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED: return 'bg-emerald-100 text-emerald-700'
    case ApprovalStatus.REJECTED: return 'bg-red-100 text-red-700'
    case ApprovalStatus.PENDING: return 'bg-amber-100 text-amber-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED: return '已通过'
    case ApprovalStatus.REJECTED: return '已拒绝'
    case ApprovalStatus.PENDING: return '待审批'
    default: return status
  }
}

const handleView = (row) => {
  currentApproval.value = row
  detailVisible.value = true
}

// 审批通过
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm('确定要通过该审批申请吗？', '审核确认', {
      confirmButtonText: '确认', cancelButtonText: '取消', type: 'success'
    })
    await approvalStore.approve(row.id)
    ElMessage.success('审核已通过')
    updateStats()
  } catch (err) {
    if (err !== 'cancel') console.error('审批通过失败:', err)
  }
}

// 审批拒绝
const handleReject = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回确认', {
      confirmButtonText: '确认驳回', cancelButtonText: '取消', type: 'warning',
      inputValue: '审批拒绝'
    })
    if (value) {
      await approvalStore.reject(row.id, value)
      ElMessage.success('已驳回')
      updateStats()
    }
  } catch (err) {
    if (err !== 'cancel') console.error('审批驳回失败:', err)
  }
}

onMounted(async () => {
  await approvalStore.fetchApprovals()
  updateStats()
})
</script>
