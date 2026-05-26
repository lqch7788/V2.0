<template>
  <div class="space-y-6">
    <!-- 页面标题 - V1.1: FileText图标, emerald渐变, 我提交的审批 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Document /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">我提交的审批</h1>
          <p class="text-gray-500">我提交的审批单据及审批进度</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1 KpiCard风格: 3卡片 bg-[#F2F6FA] -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-700"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ pendingCount }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ approvedCount }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ rejectedCount }}</p>
            <p class="text-xs text-gray-500">已拒绝</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 - V1.1: bg-[#F2F6FA] -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <el-input v-model="searchTerm" placeholder="搜索审批单号、标题..." clearable />
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">审批状态</label>
          <el-select v-model="statusFilter" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="全部" />
            <el-option label="待审批" value="待审批" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已拒绝" value="已拒绝" />
          </el-select>
        </div>
        <el-button size="small" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
      </div>
    </div>

    <!-- 数据表格 - V1.1: 蓝色渐变表头 from-blue-500 to-blue-600 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">我的申请列表</h3>
      </div>
      <el-table
        :data="paginatedList"
        style="width: 100%"
        :header-cell-style="{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '14px',
          borderBottom: 'none'
        }"
      >
        <el-table-column prop="code" label="申请单号" min-width="140" align="center" />
        <el-table-column prop="typeName" label="类型" min-width="100" align="center" />
        <el-table-column label="标题" min-width="180" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 truncate block max-w-[180px]" :title="row.title">
              {{ row.title || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="提交时间" min-width="120" align="center" />
        <el-table-column label="当前审批人" min-width="110" align="center">
          <template #default="{ row }">
            {{ getCurrentApprover(row) }}
          </template>
        </el-table-column>
        <el-table-column label="审批流程" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.currentStep }}/{{ row.totalSteps }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
              :class="statusClass(row.status)"
            >
              {{ statusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button
                v-if="row.status === 'pending'"
                link
                size="small"
                @click="handleWithdraw(row)"
                title="撤回"
              >
                <el-icon :size="16"><CircleClose /></el-icon>
              </el-button>
              <el-button link size="small" @click="showDetail(row)" title="查看">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredList.length === 0" class="p-8 text-center text-gray-500">
        暂无审批记录
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select v-model="pageSize" @change="currentPage = 1" style="width: 80px">
            <el-option :value="5" label="5" />
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">共 {{ filteredList.length }} 条</span>
          <el-button :disabled="currentPage === 1" size="small" circle @click="currentPage--">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <el-button :disabled="currentPage >= totalPages" size="small" circle @click="currentPage++">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 审批详情弹窗 - V1.1: Dialog + ApprovalDetail -->
    <el-dialog v-model="detailVisible" title="审批详情" width="700px" destroy-on-close>
      <ApprovalDetail v-if="detailApproval" :approval="detailApproval" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Document, Clock, CircleCheck, CircleClose, Search, View,
  ArrowLeft, ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'

const approvalStore = useApprovalStore()
const { myApprovals } = storeToRefs(approvalStore)

const searchTerm = ref('')
const statusFilter = ref('全部')
const currentPage = ref(1)
const pageSize = ref(5)
const detailApproval = ref(null)
const detailVisible = ref(false)

// 筛选 - V1.1: searchTerm匹配title和code
const filteredList = computed(() => {
  return myApprovals.value.filter(a => {
    const matchSearch = !searchTerm.value ||
      a.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      a.code?.toLowerCase().includes(searchTerm.value)
    const matchStatus =
      statusFilter.value === '全部' ||
      (statusFilter.value === '待审批' && a.status === 'pending') ||
      (statusFilter.value === '已通过' && a.status === 'approved') ||
      (statusFilter.value === '已拒绝' && a.status === 'rejected')
    return matchSearch && matchStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize.value) || 1)
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

// 统计 - V1.1逻辑
const pendingCount = computed(() => {
  return myApprovals.value.filter(a => a.status === 'pending').length
})
const approvedCount = computed(() => {
  return myApprovals.value.filter(a => a.status === 'approved').length
})
const rejectedCount = computed(() => {
  return myApprovals.value.filter(a => a.status === 'rejected').length
})

// 获取当前审批人 - V1.1: approvers[currentStep - 1]
const getCurrentApprover = (item) => {
  const approver = item.approvers?.[item.currentStep - 1]
  return approver?.userName || '-'
}

// 状态样式 - V1.1 inline pills
const statusClass = (status) => {
  if (status === 'approved') return 'bg-green-100 text-green-700'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

const statusLabel = (status) => {
  if (status === 'pending') return '待审批'
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已拒绝'
  return status
}

const handleSearch = () => {
  currentPage.value = 1
}

const showDetail = (row) => {
  detailApproval.value = row
  detailVisible.value = true
}

// 撤回 - V1.1: cancel(id, '主动撤回')
const handleWithdraw = async (row) => {
  try {
    await ElMessageBox.confirm('确定要撤回该审批吗？', '撤回确认', {
      confirmButtonText: '确认撤回',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await approvalStore.cancel(row.id, '主动撤回')
    ElMessage.success('已撤回')
    await approvalStore.fetchApprovals()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('撤回失败:', err)
    }
  }
}

onMounted(() => {
  approvalStore.fetchApprovals()
})
</script>
