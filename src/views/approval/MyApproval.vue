<template>
  <div class="space-y-6">
    <!-- 页面标题 - V1.1 L67-80: FileText图标, emerald渐变, "我提交的审批" -->
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

    <!-- 统计卡片 - V1.1 L82-104 KpiCard风格: 3 卡片 -->
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

    <!-- 筛选工具栏 - V1.1 L106-134: bg-[#F2F6FA] + 搜索 + 审批状态 Select + 搜索按钮 -->
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

    <!-- 数据表格 - V1.1 L136-214: 蓝色渐变表头, 8 列 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">我的申请列表</h3>
      </div>
      <el-table
        :data="paginatedList"
        style="width: 100%"
      >
        <el-table-column prop="code" label="申请单号" align="center" />
        <el-table-column prop="typeName" label="类型" align="center" />
        <el-table-column label="标题" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 max-w-[180px] truncate inline-block" :title="row.title">
              {{ row.title || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="提交时间" align="center" />
        <el-table-column label="当前审批人" align="center">
          <template #default="{ row }">
            {{ getCurrentApprover(row) }}
          </template>
        </el-table-column>
        <el-table-column label="审批流程" align="center">
          <template #default="{ row }">
            {{ row.currentStep }}/{{ row.totalSteps }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
              :class="statusClass(row.status)"
            >
              {{ statusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
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

      <div v-if="filteredList.length === 0" class="p-8 text-center text-gray-500">暂无审批记录</div>

      <!-- 分页 - V1.1 L205-213: 自定义 Pagination 4 功能 -->
      <div class="px-4 py-3 border-t border-gray-100">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :show-page-size="true"
          :page-size-options="[5, 10, 20, 50]"
          @page-change="(p) => (currentPage = p)"
          @page-size-change="(s) => { pageSize = s; currentPage = 1 }"
        />
      </div>
    </div>

    <!-- 审批详情弹窗 - V1.1 L216-235: Dialog + ApprovalDetail + 业务数据 JSON -->
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
 * 我提交的审批页面 — 1:1 翻译 V1.1 src/pages/MyApproval.tsx
 *
 * 修复 P0-011 + P0-012 + P0-013（2026-06-03）：
 * - P0-011: 删除 V2.0 ElMessageBox.confirm 二次确认；恢复 V1.1 一键撤回
 * - P0-012: 分页器改用自定义 Pagination 组件（首页/末页/每页下拉/共X页 4 功能）
 * - P0-013: 详情弹窗补 useApprovalBusinessDetail 业务数据加载 + "加载业务数据中..." 状态
 * - 附加 P0-PM-006: 卡片文案 "待审核" → V1.1 "待审批"
 * - 附加 P0-PM-007: 状态筛选 "待审核" → V1.1 "待审批"
 * - 附加 P0-PM-008: 列宽从显式 width 改回 V1.1 隐式宽度
 */
import { ref, computed, onMounted } from 'vue'
import {
  Document, Clock, CircleCheck, CircleClose, Search, View
} from '@element-plus/icons-vue'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'
import { useApprovalBusinessDetail } from '@/composables/useApprovalBusinessDetail'

const approvalStore = useApprovalStore()
const { myApprovals } = storeToRefs(approvalStore)

// ApprovalStatus 枚举（与 V1.1 types/approval.ts L298 一致）
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PARTIALLY_APPROVED: 'partially_approved'
}

// 状态定义（V1.1 L23-33 1:1 翻译）
const currentUserId = localStorage.getItem('userId') || undefined
const searchTerm = ref('')
const statusFilter = ref('全部')
const currentPage = ref(1)
const detailApproval = ref(null)
const detailVisible = ref(false)
// V1.1 L33 pageSize = 5
const pageSize = ref(5)

// 业务数据加载（V1.1 L32 useApprovalBusinessDetail(detailApproval) 1:1 翻译）
// cycle 3 修复（2026-06-03）：传 getter 函数保证响应式
const { data: businessData, isLoading: businessLoading } = useApprovalBusinessDetail(() => detailApproval.value)

// 筛选（V1.1 L36-48 1:1 翻译）
const filteredList = computed(() => {
  return myApprovals.value.filter(a => {
    const matchSearch = !searchTerm.value ||
      a.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      a.code?.toLowerCase().includes(searchTerm.value)
    const matchStatus =
      statusFilter.value === '全部' ||
      (statusFilter.value === '待审批' && a.status === ApprovalStatus.PENDING) ||
      (statusFilter.value === '已通过' && a.status === ApprovalStatus.APPROVED) ||
      (statusFilter.value === '已拒绝' && a.status === ApprovalStatus.REJECTED)
    return matchSearch && matchStatus
  })
})

// 分页（V1.1 L50-51 1:1 翻译）
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize.value) || 1)
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

// 统计（V1.1 L54-64 1:1 翻译）
const pendingCount = computed(() => {
  return myApprovals.value.filter(a => a.status === ApprovalStatus.PENDING).length
})

const approvedCount = computed(() => {
  return myApprovals.value.filter(a => a.status === ApprovalStatus.APPROVED).length
})

const rejectedCount = computed(() => {
  return myApprovals.value.filter(a => a.status === ApprovalStatus.REJECTED).length
})

// 当前审批人（V1.1 L155-156 + L162-164 1:1 翻译）
const getCurrentApprover = (item) => {
  const approver = item.approvers?.[item.currentStep - 1]
  return approver?.userName || '-'
}

// 状态样式（V1.1 L169-183 1:1 翻译）
const statusClass = (status) => {
  if (status === ApprovalStatus.APPROVED) return 'bg-green-100 text-green-700'
  if (status === ApprovalStatus.REJECTED) return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

const statusLabel = (status) => {
  if (status === ApprovalStatus.PENDING) return '待审批'
  if (status === ApprovalStatus.APPROVED) return '已通过'
  if (status === ApprovalStatus.REJECTED) return '已拒绝'
  return status
}

// 搜索按钮（V1.1 L132 占位符）
const handleSearch = () => {
  currentPage.value = 1
}

const showDetail = (row) => {
  detailApproval.value = row
  detailVisible.value = true
}

// P0-011 修复：恢复 V1.1 L188-190 一键撤回（无 confirm）
const handleWithdraw = async (row) => {
  try {
    await approvalStore.cancel(row.id, '主动撤回')
  } catch (err) {
    console.error('撤回失败:', err)
  }
}

onMounted(() => {
  approvalStore.fetchApprovals()
})
</script>
