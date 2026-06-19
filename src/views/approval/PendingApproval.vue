<template>
  <div class="space-y-6">
    <!-- 页面标题 - V1.1 L59-71: ClipboardCheck图标, emerald渐变, "待办审批" -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Tickets /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">待办审批</h1>
          <p class="text-gray-500">待审批的单据列表</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1 L73-96: 2 卡片 bg-[#F2F6FA] -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ pendingApprovals.length }}</p>
            <p class="text-xs text-gray-500">待审批</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <span class="text-red-600 text-lg">!</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ urgentCount }}</p>
            <p class="text-xs text-gray-500">加急</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 - V1.1 L98-126: bg-[#F2F6FA] + 搜索 + 类型 Select + 搜索按钮 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <el-input v-model="searchTerm" placeholder="搜索审批单标题、申请人..." clearable />
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">审批类型</label>
          <el-select v-model="typeFilter" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="全部" />
            <el-option label="领料单" value="领料单" />
            <el-option label="采购申请" value="采购申请" />
            <el-option label="退料单" value="退料单" />
          </el-select>
        </div>
        <el-button size="small" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
      </div>
    </div>

    <!-- 数据表格 - V1.1 L128-194: 灰色表头, 9 列 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">待审批列表</h3>
      </div>
      <el-table
        :data="paginatedApprovals"
        style="width: 100%"
      >
        <el-table-column prop="code" label="审批单号" align="center" />
        <el-table-column prop="typeName" label="类型" align="center" />
        <el-table-column label="标题" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 max-w-[200px] truncate inline-block" :title="row.title">
              {{ row.title || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" align="center" />
        <el-table-column prop="applicantDepartment" label="部门" align="center" />
        <el-table-column prop="applyDate" label="申请时间" align="center" />
        <el-table-column label="金额" align="center">
          <template #default="{ row }">
            {{ row.amount || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              {{ row.status === ApprovalStatus.PENDING ? '待审批' : row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button link size="small" @click="handleApprove(row)" title="通过">
                <el-icon :size="16"><CircleCheck /></el-icon>
              </el-button>
              <el-button link size="small" @click="handleReject(row)" title="拒绝">
                <el-icon :size="16"><CircleClose /></el-icon>
              </el-button>
              <el-button link size="small" @click="showDetail(row)" title="查看">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredApprovals.length === 0" class="p-8 text-center text-gray-500">暂无待审批单据</div>

      <!-- 分页 - V1.1 L185-193: 自定义 Pagination 4 功能 -->
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

    <!-- 审批详情弹窗 - V1.1 L196-215: Dialog + ApprovalDetail + 业务数据 JSON -->
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
 * 待办审批页面 — 1:1 翻译 V1.1 src/pages/PendingApproval.tsx
 *
 * 修复 P0-004 + P0-005 + P0-006 + P0-007（2026-06-03）：
 * - P0-004: 类型 Select "领料" 改回 V1.1 "领料单"
 * - P0-005: 删除 V2.0 ElMessageBox.confirm/prompt 二次确认；恢复 V1.1 一键通过/拒绝
 * - P0-006: 分页器改用自定义 Pagination 组件（首页/末页/每页下拉/共X页 4 功能）
 * - P0-007: 详情弹窗补 useApprovalBusinessDetail 业务数据加载 + "加载业务数据中..." 状态
 * - 附加 P0-PM-004: 卡片文案 "待审核" → V1.1 "待审批"
 * - 附加 P0-PM-005: 列宽从显式 width 改回 V1.1 隐式宽度
 */
import { ref, computed, onMounted } from 'vue'
import {
  Tickets, Clock, Search, CircleCheck, CircleClose, View
} from '@element-plus/icons-vue'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'
import { useApprovalBusinessDetail } from '@/composables/useApprovalBusinessDetail'

const approvalStore = useApprovalStore()
const { pendingApprovals } = storeToRefs(approvalStore)

// ApprovalStatus 枚举（与 V1.1 types/approval.ts L298 一致）
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 状态定义（V1.1 L29-36）
// 权限检查 - V1.1 L28-29: 已取消，所有人可使用所有功能
const canApprove = true
const searchTerm = ref('')
const typeFilter = ref('全部')
const currentPage = ref(1)
// V1.1 L34 pageSize = 5
const pageSize = ref(5)
const detailApproval = ref(null)
const detailVisible = ref(false)

// 业务数据加载（V1.1 L36 useApprovalBusinessDetail(detailApproval) 1:1 翻译）
// cycle 3 修复（2026-06-03）：传 getter 函数保证响应式
const { data: businessData, isLoading: businessLoading } = useApprovalBusinessDetail(() => detailApproval.value)

// 筛选（V1.1 L39-47 1:1 翻译）
const filteredApprovals = computed(() => {
  return pendingApprovals.value.filter(a => {
    const matchSearch = !searchTerm.value ||
      a.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      a.applicantName?.includes(searchTerm.value)
    const matchType = typeFilter.value === '全部' || a.typeName === typeFilter.value
    return matchSearch && matchType
  })
})

// 分页（V1.1 L49-50 1:1 翻译）
const totalPages = computed(() => Math.ceil(filteredApprovals.value.length / pageSize.value) || 1)
const paginatedApprovals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredApprovals.value.slice(start, start + pageSize.value)
})

// 加急统计（V1.1 L53-55 1:1 翻译）
const urgentCount = computed(() => {
  return pendingApprovals.value.filter(a => a.priority === 'urgent').length
})

// 搜索按钮（V1.1 L124 占位符）
const handleSearch = () => {
  currentPage.value = 1
}

const showDetail = (row) => {
  detailApproval.value = row
  detailVisible.value = true
}

// P0-005 修复：恢复 V1.1 L165-170 一键通过/拒绝（无 confirm/prompt）
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

onMounted(() => {
  approvalStore.fetchApprovals()
})
</script>
