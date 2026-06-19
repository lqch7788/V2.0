<template>
  <div class="space-y-6">
    <!-- 页面标题 - V1.1 L60-73: FileCheck图标, emerald渐变, "已办审批" -->
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

    <!-- 统计卡片 - V1.1 L75-109: 3 卡片 bg-[#F2F6FA] -->
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
            <p class="text-2xl font-bold text-gray-900">{{ approvedApprovals.length }}</p>
            <p class="text-xs text-gray-500">审批总数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 - V1.1 L111-138: bg-[#F2F6FA] + 搜索 + 审批结果 Select + 搜索按钮 -->
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

    <!-- 数据表格 - V1.1 L140-198: 灰色表头, 9 列 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">已审批列表</h3>
      </div>
      <el-table
        :data="paginatedList"
        style="width: 100%"
      >
        <el-table-column prop="code" label="审批单号" align="center" />
        <el-table-column prop="typeName" label="类型" align="center" />
        <el-table-column label="标题" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 max-w-[150px] truncate inline-block" :title="row.title">
              {{ row.title || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" align="center" />
        <el-table-column prop="applyDate" label="申请时间" align="center" />
        <el-table-column label="审批时间" align="center">
          <template #default="{ row }">
            {{ row.updatedAt?.substring(0, 10) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="金额" align="center">
          <template #default="{ row }">
            {{ row.amount || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="审批结果" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
              :class="row.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ row.status === 'approved' ? '已通过' : '已拒绝' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button link size="small" @click="showDetail(row)" title="查看">
              <el-icon :size="16"><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredList.length === 0" class="p-8 text-center text-gray-500">暂无已审批记录</div>

      <!-- 分页 - V1.1 L189-197: 自定义 Pagination 4 功能 -->
      <div class="px-4 py-3 border-t border-gray-100">
        <el-pagination
          :current-page="currentPage"
          :total="Math.ceil(totalPages)"
          :page-size="pageSize"
          :show-page-size="true"
          :page-size-options="[5, 10, 20, 50]"
          @page-change="(p) => (currentPage = p)"
          @page-size-change="(s) => { pageSize = s; currentPage = 1 }"
        />
      </div>
    </div>

    <!-- 审批详情弹窗 - V1.1 L200-219: Dialog + ApprovalDetail + 业务数据 JSON -->
    <el-dialog v-model="detailVisible" title="审批详情" width="800px" destroy-on-close>
      <div v-if="detailApproval" class="space-y-4">
        <ApprovalDetail :approval="detailApproval" />
        <div v-if="businessLoading" class="text-sm text-gray-500">加载业务数据中...</div>
        <div v-if="businessData" class="border-t pt-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">关联业务数据</h4>
          <pre class="text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-auto max-h-48">{{ JSON.stringify(businessData, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 已办审批页面 — 1:1 翻译 V1.1 src/pages/Approved.tsx
 *
 * 修复 P0-008 + P0-009 + P0-010（2026-06-03）：
 * - P0-008: 数据源改回 V1.1 useApprovedApprovals 语义 = APPROVED + PARTIALLY_APPROVED
 *          （详见 stores/modules/approval.js L105-112 修复说明）
 * - P0-009: 分页器改用自定义 Pagination 组件（首页/末页/每页下拉/共X页 4 功能）
 * - P0-010: 详情弹窗补 useApprovalBusinessDetail 业务数据加载 + "加载业务数据中..." 状态
 *
 * 页面内的 rejectedCount 通过 store 二次过滤已拒绝的审批（基于 APPROVED + PARTIALLY_APPROVED 数据源）
 * 注意 V1.1 L55-57 原本的 rejectedCount 在已办审批 = APPROVED + PARTIALLY_APPROVED 数据源下应该为 0
 * 这是 V1.1 页面设计选择：已办审批页面里"已拒绝"统计始终为 0（因为 approvedApprovals 不含 REJECTED）
 * 但 V2.0 原版试图"补救"这个不一致（V1.1 design quirk）
 * 1:1 翻译优先遵循 V1.1 行为
 */
import { ref, computed, onMounted } from 'vue'
import {
  CircleCheck, CircleClose, Search, View
} from '@element-plus/icons-vue'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'
import { useApprovalBusinessDetail } from '@/composables/useApprovalBusinessDetail'

const approvalStore = useApprovalStore()
const { approvedApprovals } = storeToRefs(approvalStore)

// ApprovalStatus 枚举（与 V1.1 types/approval.ts L298 一致）
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PARTIALLY_APPROVED: 'partially_approved'
}

// 状态定义（V1.1 L26-31 1:1 翻译）
const searchTerm = ref('')
const resultFilter = ref('全部')
const currentPage = ref(1)
// V1.1 L29 pageSize = 5
const pageSize = ref(5)
const detailApproval = ref(null)
const detailVisible = ref(false)

// 业务数据加载（V1.1 L31 useApprovalBusinessDetail(detailApproval) 1:1 翻译）
// cycle 3 修复（2026-06-03）：传 getter 函数保证响应式
const { data: businessData, isLoading: businessLoading } = useApprovalBusinessDetail(() => detailApproval.value)

// 筛选（V1.1 L34-45 1:1 翻译）
const filteredList = computed(() => {
  return approvedApprovals.value.filter(a => {
    const matchSearch = !searchTerm.value ||
      a.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      a.applicantName?.includes(searchTerm.value)
    const matchResult =
      resultFilter.value === '全部' ||
      (resultFilter.value === '已通过' && a.status === ApprovalStatus.APPROVED) ||
      (resultFilter.value === '已拒绝' && a.status === ApprovalStatus.REJECTED)
    return matchSearch && matchResult
  })
})

// 分页（V1.1 L47-48 1:1 翻译）
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize.value) || 1)
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

// 统计（V1.1 L51-57 1:1 翻译）
const approvedCount = computed(() => {
  return approvedApprovals.value.filter(a => a.status === ApprovalStatus.APPROVED).length
})

const rejectedCount = computed(() => {
  return approvedApprovals.value.filter(a => a.status === ApprovalStatus.REJECTED).length
})

// 搜索按钮（V1.1 L136 占位符）
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
