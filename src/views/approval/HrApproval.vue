<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><User /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">人事审批中心</h1>
          <p class="text-gray-500">人事相关审批流程管理</p>
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
            <p class="text-xs text-gray-500">总记录</p>
            <p class="text-lg font-bold text-gray-900">{{ totalCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 关键词搜索 -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
          <el-input
            v-model="searchTerm"
            placeholder="搜索申请人、申请单号..."
            clearable
          />
        </div>
        <!-- 类型筛选 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">审批类型</label>
          <el-select v-model="typeFilter" placeholder="全部类型" class="w-full">
            <el-option label="全部类型" value="all" />
            <el-option label="请假申请" value="leave" />
            <el-option label="加班申请" value="overtime" />
            <el-option label="离职申请" value="resignation" />
            <el-option label="招聘申请" value="recruitment" />
            <el-option label="入职办理" value="onboarding" />
            <el-option label="考勤补录" value="attendance_repair" />
            <el-option label="调薪申请" value="salary_adjustment" />
            <el-option label="合同续签" value="contract_renewal" />
            <el-option label="工资预算" value="salary_budget" />
            <el-option label="转岗申请" value="transfer" />
          </el-select>
        </div>
        <!-- 状态筛选 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">审批状态</label>
          <el-select v-model="statusFilter" placeholder="全部状态" class="w-full">
            <el-option label="全部状态" value="all" />
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </div>
        <!-- 开始日期 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <!-- 结束日期 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <!-- 搜索按钮 -->
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表格标题栏 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">人事审批</h3>
        <!-- 批量操作按钮 -->
        <div class="flex items-center gap-2">
          <el-button
            :disabled="selectedRowKeys.length === 0"
            :class="[
              selectedRowKeys.length === 0
                ? 'bg-emerald-500 text-white cursor-not-allowed opacity-60'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            ]"
            @click="handleBatchApprove"
          >
            <el-icon class="mr-1"><CircleCheck /></el-icon>
            批量通过
          </el-button>
          <el-button
            :disabled="selectedRowKeys.length === 0"
            :class="[
              selectedRowKeys.length === 0
                ? 'bg-red-500 text-white cursor-not-allowed opacity-60'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
            ]"
            @click="handleBatchReject"
          >
            <el-icon class="mr-1"><CircleClose /></el-icon>
            批量拒绝
          </el-button>
          <el-button
            :disabled="selectedRowKeys.length === 0"
            :class="[
              selectedRowKeys.length === 0
                ? 'bg-blue-500 text-white cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            ]"
            @click="handleExport"
          >
            <el-icon class="mr-1"><Download /></el-icon>
            批量导出
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="paginatedData"
        style="width: 100%"
        :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #6366f1)', color: 'white', fontWeight: '600' }"
        @selection-change="handleRowSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="code" label="申请单号" min-width="150" />
        <el-table-column prop="applicantName" label="申请人" min-width="100" />
        <el-table-column prop="typeName" label="类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="申请时间" min-width="120" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusBadge(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button type="primary" size="small" @click="handleViewDetail(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                size="small"
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="danger"
                size="small"
                @click="handleReject(row)"
              >
                拒绝
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="totalCount > 0" class="px-4 py-3 border-t border-gray-100">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalCount"
          layout="prev, pager, next"
          background
        />
      </div>
      <div v-else class="p-8 text-center text-gray-500">暂无审批记录</div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalOpen" title="审批详情" width="720px" destroy-on-close>
      <div v-if="currentRecord" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500">申请单号</label>
            <p class="font-medium">{{ currentRecord.code }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">类型</label>
            <p class="font-medium">{{ currentRecord.typeName }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">申请人</label>
            <p class="font-medium">{{ currentRecord.applicantName }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">部门</label>
            <p class="font-medium">{{ currentRecord.applicantDepartment }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">申请时间</label>
            <p class="font-medium">{{ currentRecord.applyDate }} {{ currentRecord.applyTime }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">状态</label>
            <p class="font-medium">
              <el-tag :type="getStatusBadge(currentRecord.status)" size="small">
                {{ getStatusText(currentRecord.status) }}
              </el-tag>
            </p>
          </div>
        </div>
        <div v-if="currentRecord.title">
          <label class="text-sm text-gray-500">标题</label>
          <p class="font-medium">{{ currentRecord.title }}</p>
        </div>
        <div v-if="currentRecord.description">
          <label class="text-sm text-gray-500">描述</label>
          <p class="text-gray-700">{{ currentRecord.description }}</p>
        </div>
        <!-- 业务关联信息 -->
        <div v-if="currentRecord.businessLink" class="border-t pt-4 mt-4">
          <h4 class="font-medium mb-3">详细信息</h4>
          <div v-if="currentRecord.businessLink.leaveType" class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">请假类型</label>
              <p class="font-medium">{{ currentRecord.businessLink.leaveType }}</p>
            </div>
            <div v-if="currentRecord.businessLink.startDate">
              <label class="text-sm text-gray-500">开始日期</label>
              <p class="font-medium">{{ currentRecord.businessLink.startDate }}</p>
            </div>
            <div v-if="currentRecord.businessLink.endDate">
              <label class="text-sm text-gray-500">结束日期</label>
              <p class="font-medium">{{ currentRecord.businessLink.endDate }}</p>
            </div>
            <div v-if="currentRecord.businessLink.totalDays">
              <label class="text-sm text-gray-500">天数</label>
              <p class="font-medium">{{ currentRecord.businessLink.totalDays }}天</p>
            </div>
          </div>
          <div v-if="currentRecord.businessLink.overtimeType" class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">加班类型</label>
              <p class="font-medium">{{ currentRecord.businessLink.overtimeType }}</p>
            </div>
            <div v-if="currentRecord.businessLink.date">
              <label class="text-sm text-gray-500">加班日期</label>
              <p class="font-medium">{{ currentRecord.businessLink.date }}</p>
            </div>
            <div v-if="currentRecord.businessLink.startTime">
              <label class="text-sm text-gray-500">开始时间</label>
              <p class="font-medium">{{ currentRecord.businessLink.startTime }}</p>
            </div>
            <div v-if="currentRecord.businessLink.endTime">
              <label class="text-sm text-gray-500">结束时间</label>
              <p class="font-medium">{{ currentRecord.businessLink.endTime }}</p>
            </div>
            <div v-if="currentRecord.businessLink.totalHours">
              <label class="text-sm text-gray-500">总时长</label>
              <p class="font-medium">{{ currentRecord.businessLink.totalHours }}小时</p>
            </div>
          </div>
          <div v-if="currentRecord.businessLink.reason" class="mt-3">
            <label class="text-sm text-gray-500">原因</label>
            <p class="text-gray-700">{{ currentRecord.businessLink.reason }}</p>
          </div>
        </div>
        <!-- 审批流程 -->
        <div v-if="currentRecord.approvers && currentRecord.approvers.length > 0" class="border-t pt-4 mt-4">
          <h4 class="font-medium mb-3">审批人</h4>
          <div class="space-y-2">
            <div v-for="(approver, index) in currentRecord.approvers" :key="index" class="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <span class="font-medium">{{ approver.userName }}</span>
                <span class="text-gray-500 ml-2">{{ approver.role }}</span>
              </div>
              <el-tag :type="getStatusBadge(approver.status === 'approved' ? 'approved' : approver.status === 'rejected' ? 'rejected' : 'pending')" size="small">
                {{ getStatusText(approver.status === 'approved' ? 'approved' : approver.status === 'rejected' ? 'rejected' : 'pending') }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="detailModalOpen = false">关闭</el-button>
          <template v-if="currentRecord && currentRecord.status === 'pending'">
            <el-button type="success" @click="handleApprove(currentRecord)">通过</el-button>
            <el-button type="danger" @click="handleReject(currentRecord)">拒绝</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 通过确认弹窗 -->
    <el-dialog v-model="approveModalOpen" title="审批确认" width="400px" destroy-on-close>
      <p class="text-gray-700">确定要通过该审批申请吗？</p>
      <div v-if="currentRecord" class="mt-3 p-3 bg-gray-50 rounded">
        <p><strong>申请人：</strong>{{ currentRecord.applicantName }}</p>
        <p><strong>类型：</strong>{{ currentRecord.typeName }}</p>
      </div>
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">审批意见（可选）</label>
        <el-input
          v-model="approveComment"
          type="textarea"
          :rows="3"
          placeholder="请输入审批意见..."
        />
      </div>
      <template #footer>
        <el-button @click="approveModalOpen = false">取消</el-button>
        <el-button type="success" @click="handleConfirmApprove">确认</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝确认弹窗 -->
    <el-dialog v-model="rejectModalOpen" title="驳回确认" width="400px" destroy-on-close>
      <p class="text-gray-700">确定要驳回该审批申请吗？</p>
      <div v-if="currentRecord" class="mt-3 p-3 bg-gray-50 rounded">
        <p><strong>申请人：</strong>{{ currentRecord.applicantName }}</p>
        <p><strong>类型：</strong>{{ currentRecord.typeName }}</p>
      </div>
      <template #footer>
        <el-button @click="rejectModalOpen = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmReject">确认驳回</el-button>
      </template>
    </el-dialog>

    <!-- 批量通过确认弹窗 -->
    <el-dialog v-model="batchApproveModalOpen" title="批量审批确认" width="400px" destroy-on-close>
      <p class="text-gray-700">
        确定要通过选中的 <strong class="text-green-600">{{ selectedRowKeys.length }}</strong> 项审批吗？
      </p>
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">审批意见（可选）</label>
        <el-input
          v-model="batchApproveComment"
          type="textarea"
          :rows="3"
          placeholder="请输入审批意见..."
        />
      </div>
      <template #footer>
        <el-button @click="batchApproveModalOpen = false">取消</el-button>
        <el-button type="success" @click="handleConfirmBatchApprove">确认</el-button>
      </template>
    </el-dialog>

    <!-- 批量驳回确认弹窗 -->
    <el-dialog v-model="batchRejectModalOpen" title="批量驳回确认" width="400px" destroy-on-close>
      <p class="text-gray-700">
        确定要驳回选中的 <strong class="text-red-600">{{ selectedRowKeys.length }}</strong> 项审批吗？
      </p>
      <template #footer>
        <el-button @click="batchRejectModalOpen = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmBatchReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  User,
  Search,
  Clock,
  CircleCheck,
  CircleClose,
  Document,
  View,
  Download
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'

// 审批Store
const approvalStore = useApprovalStore()
const { approvals } = storeToRefs(approvalStore)

// 审批类型
const ApprovalType = {
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  RESIGNATION: 'resignation',
  RECRUITMENT: 'recruitment',
  ONBOARDING: 'onboarding',
  ATTENDANCE_REPAIR: 'attendance_repair',
  SALARY_ADJUSTMENT: 'salary_adjustment',
  CONTRACT_RENEWAL: 'contract_renewal',
  SALARY_BUDGET: 'salary_budget',
  TRANSFER: 'transfer'
}

// 审批状态
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 类型名称映射
const typeNameMap = {
  [ApprovalType.LEAVE]: '请假申请',
  [ApprovalType.OVERTIME]: '加班申请',
  [ApprovalType.RESIGNATION]: '离职申请',
  [ApprovalType.RECRUITMENT]: '招聘申请',
  [ApprovalType.ONBOARDING]: '入职办理',
  [ApprovalType.ATTENDANCE_REPAIR]: '考勤补录',
  [ApprovalType.SALARY_ADJUSTMENT]: '调薪申请',
  [ApprovalType.CONTRACT_RENEWAL]: '合同续签',
  [ApprovalType.SALARY_BUDGET]: '工资预算',
  [ApprovalType.TRANSFER]: '转岗申请'
}

// 筛选状态
const searchTerm = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const startDate = ref('')
const endDate = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 选中状态（批量操作）
const selectedRowKeys = ref([])

// 弹窗状态
const detailModalOpen = ref(false)
const approveModalOpen = ref(false)
const rejectModalOpen = ref(false)
const batchApproveModalOpen = ref(false)
const batchRejectModalOpen = ref(false)

// 当前操作的审批记录
const currentRecord = ref(null)

// 审批意见
const approveComment = ref('')
const batchApproveComment = ref('')

// 筛选后的数据
const filteredData = computed(() => {
  return approvals.value.filter(a => {
    // 类型筛选
    const matchType = typeFilter.value === 'all' || a.type === typeFilter.value
    // 状态筛选
    const matchStatus = statusFilter.value === 'all' || a.status === statusFilter.value
    // 日期范围筛选
    const matchStartDate = !startDate.value || a.applyDate >= startDate.value
    const matchEndDate = !endDate.value || a.applyDate <= endDate.value
    // 关键词搜索
    const matchSearch = !searchTerm.value ||
      a.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      a.applicantName?.includes(searchTerm.value) ||
      a.code?.includes(searchTerm.value)

    return matchType && matchStatus && matchStartDate && matchEndDate && matchSearch
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const totalCount = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value) || 1)

// 统计数据
const stats = computed(() => ({
  pending: approvals.value.filter(a => a.status === ApprovalStatus.PENDING).length,
  approved: approvals.value.filter(a => a.status === ApprovalStatus.APPROVED).length,
  rejected: approvals.value.filter(a => a.status === ApprovalStatus.REJECTED).length
}))

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

// 类型标签
const getTypeTagType = (type) => {
  const typeTagMap = {
    [ApprovalType.LEAVE]: 'primary',
    [ApprovalType.OVERTIME]: 'warning',
    [ApprovalType.RESIGNATION]: 'danger',
    [ApprovalType.RECRUITMENT]: 'success',
    [ApprovalType.ONBOARDING]: 'info',
    [ApprovalType.ATTENDANCE_REPAIR]: 'warning',
    [ApprovalType.SALARY_ADJUSTMENT]: 'primary',
    [ApprovalType.CONTRACT_RENEWAL]: 'info',
    [ApprovalType.SALARY_BUDGET]: 'success',
    [ApprovalType.TRANSFER]: 'warning'
  }
  return typeTagMap[type] || 'info'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 行选择变化
const handleRowSelectionChange = (selection) => {
  selectedRowKeys.value = selection.map(item => item.id)
}

// 查看详情
const handleViewDetail = (record) => {
  currentRecord.value = record
  detailModalOpen.value = true
}

// 单条审批 - 通过
const handleApprove = (record) => {
  currentRecord.value = record
  approveModalOpen.value = true
}

// 确认通过
const handleConfirmApprove = async () => {
  if (currentRecord.value) {
    try {
      await approvalStore.approve(currentRecord.value.id)
      await approvalStore.fetchApprovals()
      ElMessage.success('审批已通过')
      approveModalOpen.value = false
      currentRecord.value = null
      approveComment.value = ''
    } catch (error) {
      ElMessage.error('审批失败')
    }
  }
}

// 单条审批 - 拒绝
const handleReject = (record) => {
  currentRecord.value = record
  rejectModalOpen.value = true
}

// 确认拒绝
const handleConfirmReject = async () => {
  if (currentRecord.value) {
    try {
      await approvalStore.reject(currentRecord.value.id, '审批拒绝')
      await approvalStore.fetchApprovals()
      ElMessage.success('已驳回')
      rejectModalOpen.value = false
      currentRecord.value = null
    } catch (error) {
      ElMessage.error('驳回失败')
    }
  }
}

// 批量通过
const handleBatchApprove = () => {
  if (selectedRowKeys.value.length === 0) return
  batchApproveModalOpen.value = true
}

// 确认批量通过
const handleConfirmBatchApprove = async () => {
  if (selectedRowKeys.value.length === 0) return
  try {
    await approvalStore.batchApprove(selectedRowKeys.value)
    await approvalStore.fetchApprovals()
    ElMessage.success(`已通过 ${selectedRowKeys.value.length} 项审批`)
    selectedRowKeys.value = []
    batchApproveModalOpen.value = false
    batchApproveComment.value = ''
  } catch (error) {
    ElMessage.error('批量审批失败')
  }
}

// 批量拒绝
const handleBatchReject = () => {
  if (selectedRowKeys.value.length === 0) return
  batchRejectModalOpen.value = true
}

// 确认批量拒绝
const handleConfirmBatchReject = async () => {
  if (selectedRowKeys.value.length === 0) return
  try {
    await approvalStore.batchReject(selectedRowKeys.value, '批量拒绝')
    await approvalStore.fetchApprovals()
    ElMessage.success(`已驳回 ${selectedRowKeys.value.length} 项审批`)
    selectedRowKeys.value = []
    batchRejectModalOpen.value = false
  } catch (error) {
    ElMessage.error('批量驳回失败')
  }
}

// 批量导出
const handleExport = () => {
  if (selectedRowKeys.value.length === 0) return
  const selectedData = paginatedData.value.filter(d => selectedRowKeys.value.includes(d.id))
  const exportData = selectedData.map(d => ({
    单号: d.code,
    标题: d.title,
    申请人: d.applicantName,
    部门: d.applicantDepartment,
    申请时间: d.applyDate,
    状态: getStatusText(d.status)
  }))
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `人事审批_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 初始化 - 从API加载数据
onMounted(async () => {
  await approvalStore.fetchApprovals()
})
</script>
