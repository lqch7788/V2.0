<template>
  <div class="space-y-6">
    <!-- 页面头部 - V1.1 L102-111: ClipboardList图标, emerald渐变, "我的申请" -->
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

    <!-- 统计卡片 - V1.1 L114-143 KpiCard风格 4 卡片 -->
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

    <!-- 搜索筛选 - V1.1 L145-178: bg-[#F2F6FA] + 搜索 + 类型 Select -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex gap-4">
        <div class="flex-1">
          <el-input
            v-model="searchTerm"
            placeholder="搜索审批单号、标题..."
            clearable
            @input="handleSearch"
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
      </div>
    </div>

    <!-- 数据列表 - V1.1 L181-274: 蓝色渐变表头, 7 列 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" style="width: 100%">
        <el-table-column prop="code" label="审批单号" />
        <el-table-column prop="title" label="标题" />
        <el-table-column label="类型">
          <template #default="{ row }">
            {{ formatType(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" />
        <el-table-column prop="applyDate" label="申请时间" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button link size="small" @click="handleView(row)" title="查看">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
              <template v-if="row.status === 'pending'">
                <el-button link size="small" type="success" @click="handleApprove(row)" title="通过">
                  通过
                </el-button>
                <el-button link size="small" type="danger" @click="handleReject(row)" title="拒绝">
                  拒绝
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空态 - V1.1 L197 -->
      <div v-if="paginatedData.length === 0" class="px-4 py-8 text-center text-gray-500">暂无数据</div>

      <!-- 分页 - V1.1 L241-252: 自定义 Pagination 含 4 功能 -->
      <div v-if="filteredData.length > pageSize" class="px-4 py-3 border-t border-gray-100">
        <el-pagination
          v-model:current-page="currentPage"
          :total="filteredData.length"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="() => { currentPage = 1 }"
        />
      </div>
    </div>

    <!-- 审批详情弹窗 - V1.1 L254-273: Dialog + ApprovalDetail + 业务数据 JSON -->
    <el-dialog v-model="detailVisible" title="审批详情" width="800px" destroy-on-close>
      <div v-if="currentApproval" class="space-y-4">
        <ApprovalDetail :approval="currentApproval" />
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
 * 我的申请页面 — 1:1 翻译 V1.1 src/pages/MyApplications.tsx
 *
 * 修复 P0-001 + P0-002 + P0-003（2026-06-03）：
 * - P0-001: 删除 V2.0 自创的 4 个 Tab UI 按钮；默认值改回 V1.1 'pending' (L30)
 * - P0-002: 删除 V2.0 ElMessageBox.confirm/prompt 二次确认；恢复 V1.1 一键通过/拒绝
 * - P0-003: 详情弹窗补 useApprovalBusinessDetail 业务数据加载 + "加载业务数据中..." 状态
 * - 附加 P0-PM-002: 卡片文案 "待审核" → V1.1 "待审批"
 * - 附加 P0-PM-003: 列宽从显式像素改回 V1.1 隐式宽度（移除 width）
 */
import { ref, computed, onMounted } from 'vue'
import {
  DocumentCopy, Search, Clock, CircleCheck, CircleClose,
  Document, View
} from '@element-plus/icons-vue'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import { useApprovalBusinessDetail } from '@/composables/useApprovalBusinessDetail'

const approvalStore = useApprovalStore()
const { approvals } = storeToRefs(approvalStore)

// ApprovalStatus 枚举（与 V1.1 types/approval.ts L298 一致）
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PARTIALLY_APPROVED: 'partially_approved'
}

// 当前用户ID（V1.1 L37 localStorage）
const currentUserId = localStorage.getItem('userId') || 'user_001'

// 状态定义（V1.1 L30-34）
// P0-001 修复：默认值 'pending' 对齐 V1.1，删除 V2.0 自创的 activeTab Tab UI
const activeTab = ref('pending')  // V1.1 L30 useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
const searchTerm = ref('')
const typeFilter = ref('全部')
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentApproval = ref(null)

// 业务数据加载（V1.1 L39 useApprovalBusinessDetail(detailApproval) 1:1 翻译）
// cycle 3 修复（2026-06-03）：传 getter 函数保证响应式
const { data: businessData, isLoading: businessLoading } = useApprovalBusinessDetail(() => currentApproval.value)

// 筛选数据（V1.1 L41-69 + L203-216 1:1 翻译）
const filteredData = computed(() => {
  return approvals.value.filter(item => {
    // 我的申请：applicantId === currentUserId（V1.1 L26-27 通过 useApproval 拿全列表 + L42 默认显示所有）
    if (item.applicantId !== currentUserId) return false
    // Tab 筛选（V1.1 L45-51）
    if (activeTab.value === 'pending' && item.status !== ApprovalStatus.PENDING) return false
    if (activeTab.value === 'approved' &&
        item.status !== ApprovalStatus.APPROVED &&
        item.status !== ApprovalStatus.PARTIALLY_APPROVED) return false
    if (activeTab.value === 'rejected' && item.status !== ApprovalStatus.REJECTED) return false
    // 搜索筛选（V1.1 L54-61）
    const matchSearch = !searchTerm.value ||
      item.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.applicantName?.includes(searchTerm.value) ||
      item.code?.toLowerCase().includes(searchTerm.value)
    // 类型筛选（V1.1 L64-66）
    const matchType = typeFilter.value === '全部' || item.type === typeFilter.value
    return matchSearch && matchType
  })
})

// 统计数据（V1.1 L71-76 1:1 翻译）
const stats = computed(() => {
  const myApps = approvals.value.filter(a => a.applicantId === currentUserId)
  return {
    total: myApps.length,
    pending: myApps.filter(a => a.status === ApprovalStatus.PENDING).length,
    approved: myApps.filter(a => a.status === ApprovalStatus.APPROVED || a.status === ApprovalStatus.PARTIALLY_APPROVED).length,
    rejected: myApps.filter(a => a.status === ApprovalStatus.REJECTED).length
  }
})

// 分页（V1.1 L78-79 1:1 翻译）
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value) || 1)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// 搜索触发 - V1.1 L155 setSearchTerm + setCurrentPage(1) 内联
const handleSearch = () => {
  currentPage.value = 1
}

// 状态样式（V1.1 L81-94 inline pills 1:1 翻译）
const getStatusClass = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED: return 'bg-emerald-100 text-emerald-700'
    case ApprovalStatus.PARTIALLY_APPROVED: return 'bg-blue-100 text-blue-700'
    case ApprovalStatus.REJECTED: return 'bg-red-100 text-red-700'
    case ApprovalStatus.PENDING: return 'bg-amber-100 text-amber-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED: return '已通过'
    case ApprovalStatus.PARTIALLY_APPROVED: return '部分通过'
    case ApprovalStatus.REJECTED: return '已拒绝'
    case ApprovalStatus.PENDING: return '待审批'
    default: return status
  }
}

// 类型格式化（V1.1 L203-207）
const formatType = (type) => {
  if (!type) return '-'
  return String(type).replace(/_/g, ' ')
}

const handleView = (row) => {
  currentApproval.value = row
  detailVisible.value = true
}

// P0-002 修复：恢复 V1.1 L218-230 一键通过/拒绝（无 confirm/prompt）
const handleApprove = async (row) => {
  try {
    await approvalStore.approve(row.id)
  } catch (err) {
    console.error('审批通过失败:', err)
  }
}

const handleReject = async (row) => {
  try {
    await approvalStore.reject(row.id, '审批拒绝')
  } catch (err) {
    console.error('审批拒绝失败:', err)
  }
}

onMounted(async () => {
  await approvalStore.fetchApprovals()
})
</script>
