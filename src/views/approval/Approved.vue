<template>
  <div class="space-y-6">
    <!-- 页面标题 - V1.1: FileCheck图标, emerald渐变, 已办审批 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><CircleCheck /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">已办审批</h1>
          <p class="text-gray-500">已完成的审批任务列表</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1: 3卡片 bg-[#F2F6FA] -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" class="text-green-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ approvedCount }}</p>
            <p class="text-xs text-gray-500">已通过</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" class="text-red-600"><CircleClose /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ rejectedCount }}</p>
            <p class="text-xs text-gray-500">已拒绝</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span class="text-blue-600 text-lg">📊</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ totalCount }}</p>
            <p class="text-xs text-gray-500">审批总数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 - V1.1: bg-[#F2F6FA], 搜索 + 审批结果 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <el-input v-model="searchTerm" placeholder="搜索审批单标题、申请人..." clearable />
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">审批结果</label>
          <el-select v-model="resultFilter" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="全部" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已拒绝" value="已拒绝" />
          </el-select>
        </div>
        <el-button size="small" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
      </div>
    </div>

    <!-- 数据表格 - V1.1: 灰色表头, 无批量操作-->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">已审批列表</h3>
      </div>
      <el-table
        :data="paginatedList"
        style="width: 100%"
      >
        <el-table-column prop="code" label="审批单号" width="140" align="center" />
        <el-table-column prop="typeName" label="类型" width="100" align="center" />
        <el-table-column label="标题" width="180" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 truncate block max-w-[150px]" :title="row.title">
              {{ row.title || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" width="100" align="center" />
        <el-table-column prop="applyDate" label="申请时间" width="120" align="center" />
        <el-table-column label="审批时间" width="120" align="center">
          <template #default="{ row }">
            {{ row.updatedAt?.substring(0, 10) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="center">
          <template #default="{ row }">
            {{ row.amount || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="审批结果" width="100" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
              :class="row.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ row.status === 'approved' ? '已通过' : '已拒绝' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button link size="small" @click="showDetail(row)" title="查看">
              <el-icon :size="16"><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredList.length === 0" class="p-8 text-center text-gray-500">
        暂无已审批记录      </div>

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
          <span class="text-sm text-gray-500">共{{ filteredList.length }}条</span>
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
  CircleCheck, CircleClose, Search, View,
  ArrowLeft, ArrowRight
} from '@element-plus/icons-vue'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'

const approvalStore = useApprovalStore()
const { approvedApprovals, rejectedApprovals } = storeToRefs(approvalStore)

const searchTerm = ref('')
const resultFilter = ref('全部')
const currentPage = ref(1)
const pageSize = ref(5)
const detailApproval = ref(null)
const detailVisible = ref(false)

// 合并数据源：已通过 + 已拒绝（已办审批包含这两种状态）
const approvedSourceData = computed(() => {
  return [...approvedApprovals.value, ...rejectedApprovals.value]
})

// 筛选 - V1.1: 审批结果过滤
const filteredList = computed(() => {
  return approvedSourceData.value.filter(a => {
    const matchSearch = !searchTerm.value ||
      a.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      a.applicantName?.includes(searchTerm.value)
    const matchResult =
      resultFilter.value === '全部' ||
      (resultFilter.value === '已通过' && a.status === 'approved') ||
      (resultFilter.value === '已拒绝' && a.status === 'rejected')
    return matchSearch && matchResult
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize.value) || 1)
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

// 统计 - V1.1逻辑
const approvedCount = computed(() => approvedApprovals.value.length)
const rejectedCount = computed(() => rejectedApprovals.value.length)
const totalCount = computed(() => approvedCount.value + rejectedCount.value)

const handleSearch = () => {
  currentPage.value = 1
}

const showDetail = (row) => {
  detailApproval.value = row
  detailVisible.value = true
}

onMounted(() => {
  approvalStore.fetchApprovals()
})
</script>
