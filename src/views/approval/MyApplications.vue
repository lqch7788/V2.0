<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><DocumentCopy /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">我的申请</h1>
            <p class="text-gray-500">查看我提交的所有审批申请</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" @click="activeTab = 'pending'">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon :size="16" color="#d97706"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">待审批</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" @click="activeTab = 'approved'">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <el-icon :size="16" color="#059669"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">已通过</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" @click="activeTab = 'rejected'">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <el-icon :size="16" color="#dc2626"><CircleClose /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">已拒绝</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" @click="activeTab = 'all'">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <el-icon :size="16" color="#7c3aed"><Grid /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">全部</p>
            <p class="text-lg font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索关键词</label>
          <el-input v-model="searchTerm" placeholder="搜索审批单号、标题..." clearable @input="currentPage = 1" />
        </div>
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">申请类型</label>
          <el-select v-model="typeFilter" placeholder="全部类型" clearable style="width: 100%" @change="currentPage = 1">
            <el-option label="全部类型" value="" />
            <el-option label="领料申请" value="material_request" />
            <el-option label="退料单" value="return_material" />
            <el-option label="采购申请" value="purchase_request" />
            <el-option label="请假" value="leave" />
            <el-option label="加班" value="overtime" />
            <el-option label="离职" value="resignation" />
          </el-select>
        </div>
        <div class="flex gap-2">
          <el-button type="primary" @click="refreshData">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden" v-loading="approvalStore.isLoading">
      <el-table :data="paginatedData" style="width: 100%" stripe>
        <el-table-column prop="code" label="审批单号" min-width="150" align="center" />
        <el-table-column prop="title" label="标题" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column label="类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small" effect="light">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" min-width="100" align="center" />
        <el-table-column prop="applyDate" label="申请时间" min-width="130" align="center" />
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small" effect="light">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
              <template v-if="row.status === 'pending'">
                <el-button type="success" link size="small" @click="handleApprove(row)">通过</el-button>
                <el-button type="danger" link size="small" @click="handleReject(row)">拒绝</el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="paginatedData.length === 0 && !approvalStore.isLoading" class="py-12 text-center">
        <el-empty description="暂无数据" />
      </div>

      <!-- 分页 -->
      <div v-if="filteredData.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">共 {{ filteredData.length }} 条记录</span>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredData.length"
          :page-sizes="[10, 20, 50]"
          layout="sizes, prev, pager, next"
          @size-change="onPageSizeChange"
          background
          small
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="审批详情" width="700px" top="5vh">
      <div v-if="selectedApplication" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审批单号">{{ selectedApplication.code }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ getTypeLabel(selectedApplication.type) }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ selectedApplication.title }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedApplication.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ selectedApplication.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusColor(selectedApplication.status)">{{ getStatusLabel(selectedApplication.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedApplication.description" label="描述" :span="2">
            {{ selectedApplication.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 关联业务数据 -->
        <div v-if="selectedApplication.businessData" class="border-t pt-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">关联业务数据</h4>
          <pre class="text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-auto max-h-48">{{ JSON.stringify(selectedApplication.businessData, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
        <template v-if="selectedApplication?.status === 'pending'">
          <el-button type="success" @click="handleApproveFromDetail">通过</el-button>
          <el-button type="danger" @click="handleRejectFromDetail">拒绝</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  DocumentCopy, Clock, CircleCheck, CircleClose, Grid, Search
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores/modules/approval.js'
import { ApprovalStatus, ApprovalType } from '@/services/apiApprovalService.ts'

const approvalStore = useApprovalStore()

// 状态Tab
const activeTab = ref('all')

// 搜索和筛选
const searchTerm = ref('')
const typeFilter = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 详情弹窗
const selectedApplication = ref(null)
const showDetailModal = ref(false)

// 组件挂载时从API加载数据
onMounted(() => {
  refreshData()
})

// 刷新数据
async function refreshData() {
  await approvalStore.fetchApprovals()
}

// 统计数据
const stats = computed(() => {
  const list = approvalStore.approvals
  return {
    pending: list.filter(a => a.status === ApprovalStatus.PENDING).length,
    approved: list.filter(a => a.status === ApprovalStatus.APPROVED || a.status === ApprovalStatus.PARTIALLY_APPROVED).length,
    rejected: list.filter(a => a.status === ApprovalStatus.REJECTED).length,
    total: list.length,
  }
})

// 筛选后的数据
const filteredData = computed(() => {
  let result = approvalStore.approvals

  // Tab筛选
  if (activeTab.value === 'pending') {
    result = result.filter(a => a.status === ApprovalStatus.PENDING)
  } else if (activeTab.value === 'approved') {
    result = result.filter(a => a.status === ApprovalStatus.APPROVED || a.status === ApprovalStatus.PARTIALLY_APPROVED)
  } else if (activeTab.value === 'rejected') {
    result = result.filter(a => a.status === ApprovalStatus.REJECTED)
  }

  // 搜索筛选
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(a =>
      a.title?.toLowerCase().includes(term) ||
      a.applicantName?.includes(term) ||
      a.code?.toLowerCase().includes(term)
    )
  }

  // 类型筛选
  if (typeFilter.value) {
    result = result.filter(a => a.type === typeFilter.value)
  }

  return result
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

function onPageSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

// Tab切换时重置分页
watch(activeTab, () => { currentPage.value = 1 })

// 类型标签
function getTypeLabel(type) {
  const labels = {
    material_request: '领料申请', return_material: '退料单', purchase_request: '采购申请',
    production_plan: '生产计划', task_dispatch: '任务派发', harvest_request: '采收申请',
    leave: '请假', overtime: '加班', resignation: '离职',
    budget_create: '预算申请', announcement_approval: '公告审批',
  }
  return labels[type] || (type || '').replace(/_/g, ' ')
}

function getTypeColor(type) {
  if (type?.includes('material') || type?.includes('purchase')) return 'primary'
  if (type?.includes('leave') || type?.includes('overtime') || type?.includes('resignation')) return 'warning'
  if (type?.includes('production') || type?.includes('task')) return 'success'
  return 'info'
}

// 状态标签
function getStatusLabel(status) {
  const labels = {
    [ApprovalStatus.PENDING]: '待审批',
    [ApprovalStatus.APPROVED]: '已通过',
    [ApprovalStatus.PARTIALLY_APPROVED]: '部分通过',
    [ApprovalStatus.REJECTED]: '已拒绝',
    [ApprovalStatus.CANCELLED]: '已取消',
    [ApprovalStatus.DRAFT]: '草稿',
  }
  return labels[status] || status
}

function getStatusColor(status) {
  const colors = {
    [ApprovalStatus.PENDING]: 'warning',
    [ApprovalStatus.APPROVED]: 'success',
    [ApprovalStatus.PARTIALLY_APPROVED]: '',
    [ApprovalStatus.REJECTED]: 'danger',
    [ApprovalStatus.CANCELLED]: 'info',
    [ApprovalStatus.DRAFT]: 'info',
  }
  return colors[status] || 'info'
}

// 查看详情
function handleView(row) {
  selectedApplication.value = row
  showDetailModal.value = true
}

// 审批通过
async function handleApprove(row) {
  try {
    await ElMessageBox.prompt('请输入审批意见（可选）', '审批通过', {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      inputType: 'textarea',
    })
    const success = await approvalStore.approve(row.id)
    if (success) {
      ElMessage.success('审批通过')
    } else {
      ElMessage.error(approvalStore.error || '操作失败')
    }
  } catch { /* 取消 */ }
}

// 审批拒绝
async function handleReject(row) {
  try {
    const { value: comment } = await ElMessageBox.prompt('请输入拒绝原因', '审批拒绝', {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValidator: (val) => val ? true : '请输入拒绝原因',
      inputErrorMessage: '拒绝原因不能为空',
    })
    const success = await approvalStore.reject(row.id, comment)
    if (success) {
      ElMessage.success('已拒绝')
    } else {
      ElMessage.error(approvalStore.error || '操作失败')
    }
  } catch { /* 取消 */ }
}

// 详情弹窗中的审批操作
async function handleApproveFromDetail() {
  await handleApprove(selectedApplication.value)
  if (selectedApplication.value?.status !== ApprovalStatus.PENDING) {
    showDetailModal.value = false
  }
}

async function handleRejectFromDetail() {
  await handleReject(selectedApplication.value)
  if (selectedApplication.value?.status !== ApprovalStatus.PENDING) {
    showDetailModal.value = false
  }
}
</script>
