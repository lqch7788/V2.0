<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white"><Crop /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">生产审批</h1>
            <p class="text-gray-500">技术方案、生产计划、采收申请审批管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1 使用 KpiCardGrid + KpiCard compact，颜色方案 emerald/amber/emerald/red -->
    <KpiCardGrid :columns="4" compact>
      <KpiCard :icon="Document" label="总申请数" :value="stats.total" colorScheme="emerald" compact />
      <KpiCard :icon="Clock" label="待审批" :value="stats.pending" colorScheme="amber" compact />
      <KpiCard :icon="CircleCheck" label="已通过" :value="stats.approved" colorScheme="emerald" compact />
      <KpiCard :icon="CircleClose" label="已拒绝" :value="stats.rejected" colorScheme="red" compact />
    </KpiCardGrid>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl p-1 inline-flex shadow-sm">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="['px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors', activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
        @click="handleTabChange(tab.key)"
      >
        <el-icon :size="16"><component :is="tab.icon" /></el-icon>
        {{ tab.label }}
      </button>
    </div>

    <!-- 搜索筛选 - V1.1: bg-[#F2F6FA] -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <el-input
            v-model="searchTerm"
            placeholder="搜索申请人、申请单号..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="statusFilter" placeholder="全部" style="width: 140px" @change="handleSearch">
          <el-option label="全部" value="全部" />
          <el-option label="待审批" value="待审批" />
          <el-option label="已通过" value="已通过" />
          <el-option label="已拒绝" value="已拒绝" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表格标题 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ currentTabLabel }}</h3>
        <!-- 批量操作按钮 -->
        <div class="flex items-center gap-2">
          <el-button
            :disabled="selectedIds.size === 0"
            :class="[
              selectedIds.size === 0
                ? 'bg-emerald-500 text-white cursor-not-allowed opacity-60'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            ]"
            @click="handleBatchApprove"
          >
            <el-icon class="mr-1"><CircleCheck /></el-icon>
            批量通过
          </el-button>
          <el-button
            :disabled="selectedIds.size === 0"
            :class="[
              selectedIds.size === 0
                ? 'bg-red-500 text-white cursor-not-allowed opacity-60'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
            ]"
            @click="handleBatchReject"
          >
            <el-icon class="mr-1"><CircleClose /></el-icon>
            批量拒绝
          </el-button>
          <el-button
            :disabled="selectedIds.size === 0"
            :class="[
              selectedIds.size === 0
                ? 'bg-blue-500 text-white cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            ]"
            @click="handleExport"
          >
            <el-icon class="mr-1"><Download /></el-icon>
            批量导出
          </el-button>
          <!-- P0-PA-001: "查看全部 →" 链接入口 (V1.1 L405-410) -->
          <router-link
            :to="currentTabPath"
            class="text-sm text-emerald-600 hover:text-emerald-700 font-medium ml-2"
          >
            查看全部 →
          </router-link>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="paginatedData"
        style="width: 100%"
        :header-cell-style="{ background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))', color: '#ffffff', fontWeight: 600, fontSize: '14px' }"
      >
        <el-table-column width="50" align="center">
          <template #header>
            <el-button
              text
              :disabled="pendingInPage.length === 0"
              @click="handleSelectAll(pendingInPage.length !== selectedIds.size || pendingInPage.some(id => !selectedIds.has(id)))"
              title="全选/全不选"
            >
              <el-icon :size="16" :class="(pendingInPage.length > 0 && pendingInPage.every(id => selectedIds.has(id))) ? 'text-emerald-600' : 'text-gray-400'">
                <component :is="(pendingInPage.length > 0 && pendingInPage.every(id => selectedIds.has(id))) ? 'Check' : 'CirclePlus'" />
              </el-icon>
            </el-button>
          </template>
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              text
              @click="handleToggleSelect(row.id)"
            >
              <el-icon :size="16" :class="selectedIds.has(row.id) ? 'text-emerald-600' : 'text-gray-400'">
                <component :is="selectedIds.has(row.id) ? 'Check' : 'CirclePlus'" />
              </el-icon>
            </el-button>
            <span v-else class="w-4 h-4 block"></span>
          </template>
        </el-table-column>
        <!-- P0-PA-007: 列名"申请单号" (V1.1 L431) -->
        <el-table-column prop="code" label="申请单号" min-width="120" />
        <!-- P0-PA-006: 列名"申请标题" (V1.1 L434) -->
        <el-table-column prop="title" label="申请标题" min-width="150" />
        <el-table-column prop="applicantName" label="申请人" min-width="100" />
        <el-table-column prop="applicantDepartment" label="部门" min-width="100" />
        <el-table-column prop="applyDate" label="申请时间" min-width="120" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
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

      <!-- P0-PA-004: 空态 (V1.1 L503-509 "暂无审批记录") -->
      <div v-if="filteredData.length === 0" class="p-12 text-center text-gray-500">
        <el-icon :size="48" class="text-gray-300 mb-3"><Document /></el-icon>
        <p>暂无审批记录</p>
        <p class="text-sm text-gray-400 mt-2">在生产计划/采收申请页面提交申请后，这里将显示审批列表</p>
      </div>

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
        <div v-if="currentApproval" class="space-y-4">
          <!-- 状态标签 -->
          <div>
            <el-tag :type="getStatusBadge(currentApproval.status)" size="small">
              {{ getStatusText(currentApproval.status) }}
            </el-tag>
          </div>

          <!-- 申请信息卡片 -->
          <div class="bg-gray-50 rounded-xl p-4">
            <h4 class="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <el-icon><Document /></el-icon> 申请信息
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-400">申请标题</span>
                <p class="text-sm font-medium text-gray-900">{{ currentApproval.title }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">申请人</span>
                <p class="text-sm font-medium text-gray-900">{{ currentApproval.applicantName || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">申请部门</span>
                <p class="text-sm font-medium text-gray-900">{{ currentApproval.applicantDepartment || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">申请时间</span>
                <p class="text-sm font-medium text-gray-900">{{ currentApproval.applyDate }} {{ currentApproval.applyTime }}</p>
              </div>
              <div v-if="currentApproval.amount">
                <span class="text-xs text-gray-400">申请金额</span>
                <p class="text-sm font-medium text-emerald-600 text-lg">¥{{ Number(currentApproval.amount).toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <!-- 业务关联信息卡片 -->
          <div v-if="currentApproval.businessLink" class="bg-emerald-50 rounded-xl p-4">
            <h4 class="text-sm font-medium text-emerald-600 mb-3 flex items-center gap-2">
              <el-icon><Crop /></el-icon> {{ getBusinessTypeLabel(currentApproval.businessLink.type) }}
            </h4>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="(value, key) in currentApproval.businessLink" :key="key" class="flex flex-col">
                <span class="text-xs text-gray-500">{{ getFieldLabel(key) }}</span>
                <span class="text-sm font-medium text-gray-900">{{ formatBusinessValue(key, value) }}</span>
              </div>
            </div>
          </div>

          <!-- P0-PA-002: 采购物资明细卡片 (V1.1 L588-624) - 仅 purchase 类型显示 -->
          <div v-if="currentApproval.businessLink?.type === 'purchase' && (currentApproval.purchasePlanDetail?.items?.length > 0 || currentApproval.businessLink?.items?.length > 0)" class="bg-blue-50 rounded-xl p-4">
            <h4 class="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
              <el-icon><ShoppingCart /></el-icon> 采购物资明细
            </h4>
            <el-table :data="currentApproval.purchasePlanDetail?.items || currentApproval.businessLink?.items" size="small">
              <el-table-column prop="materialName" label="物料名称">
                <template #default="scope">
                  <span class="text-gray-900">{{ scope.row.materialName || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="specification" label="规格型号" min-width="120">
                <template #default="scope">
                  <span class="text-gray-600">{{ scope.row.specification || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="unit" label="单位" width="80" align="center">
                <template #default="scope">
                  <span class="text-gray-600">{{ scope.row.unit || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="数量" width="80" align="right">
                <template #default="scope">
                  <span class="text-gray-900 font-medium">{{ scope.row.quantity || 0 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="estimatedPrice" label="预估单价" width="100" align="right">
                <template #default="scope">
                  <span class="text-gray-600">¥{{ Number(scope.row.estimatedPrice || 0).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="estimatedTotalPrice" label="小计" width="120" align="right">
                <template #default="scope">
                  <span class="text-emerald-600 font-medium">¥{{ Number(scope.row.estimatedTotalPrice || 0).toLocaleString() }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="flex justify-end mt-2">
              <span class="text-sm font-medium text-gray-700">总计金额：</span>
              <span class="text-lg font-bold text-emerald-600 ml-2">
                ¥{{ purchaseItemsTotal.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- 申请描述卡片 -->
          <div v-if="currentApproval.description" class="bg-blue-50 rounded-xl p-4">
            <h4 class="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
              <el-icon><Document /></el-icon> 申请描述
            </h4>
            <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ currentApproval.description }}</p>
          </div>

          <!-- 审批记录卡片 -->
          <div v-if="currentApproval.records && currentApproval.records.length > 0" class="bg-purple-50 rounded-xl p-4">
            <h4 class="text-sm font-medium text-purple-600 mb-3 flex items-center gap-2">
              <el-icon><Clock /></el-icon> 审批记录
            </h4>
            <div class="space-y-3">
              <div v-for="(record, index) in currentApproval.records" :key="index" class="flex items-start gap-3 p-2 bg-white rounded-lg">
                <div :class="['w-2 h-2 rounded-full mt-2', record.action === 'approve' ? 'bg-emerald-500' : record.action === 'reject' ? 'bg-red-500' : 'bg-gray-400']" />
                <div class="flex-1">
                  <p class="text-sm text-gray-900">
                    <span class="font-medium">{{ record.approverName }}</span>
                    <span class="text-gray-500 mx-1">
                      {{ record.action === 'approve' ? '通过了申请' : record.action === 'reject' ? '拒绝了申请' : record.action === 'partially_approve' ? '部分通过' : '操作' }}
                    </span>
                  </p>
                  <p v-if="record.comment" class="text-xs text-gray-500 mt-1">备注：{{ record.comment }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ record.actionTime }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 审批确认弹窗 -->
      <el-dialog v-model="approvalModalVisible" :title="approvalModal.action === 'approve' ? '确认通过' : '确认拒绝'" width="500px" destroy-on-close>
        <div v-if="approvalModal.approval">
          <div class="mb-4">
            <label class="block text-sm text-gray-700 mb-1">{{ approvalModal.action === 'approve' ? '通过意见（可选）' : '拒绝原因（可选）' }}</label>
            <el-input
              v-model="approvalComment"
              type="textarea"
              :rows="3"
              :placeholder="approvalModal.action === 'approve' ? '请输入通过意见...' : '请输入拒绝原因...'"
            />
          </div>
          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <p class="text-sm text-gray-600">
              <span class="font-medium">申请标题：</span>{{ approvalModal.approval.title }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              <span class="font-medium">申请人：</span>{{ approvalModal.approval.applicantName }}
            </p>
          </div>
        </div>
        <template #footer>
          <el-button @click="approvalModalVisible = false">取消</el-button>
          <el-button :type="approvalModal.action === 'approve' ? 'success' : 'danger'" @click="confirmApprovalAction">
            {{ approvalModal.action === 'approve' ? '确认通过' : '确认拒绝' }}
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Crop,
  Search,
  Clock,
  CircleCheck,
  CircleClose,
  Document,
  Calendar,
  DocumentCopy,
  ShoppingCart,
  Box,
  RefreshRight,
  House,
  View,
  Check,
  CirclePlus,
  Download
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import { KpiCard, KpiCardGrid } from '@/components/summary'

// 审批Store
const approvalStore = useApprovalStore()
const { approvals } = storeToRefs(approvalStore)

// 审批类型
const ApprovalType = {
  TECH_SOLUTION: 'tech_solution',
  PRODUCTION_PLAN: 'production_plan',
  PURCHASE_REQUEST: 'purchase_request',
  PRODUCTION_BATCH: 'production_batch',
  BATCH_CHANGE: 'batch_change',
  BATCH_VOID: 'batch_void',
  HARVEST_REQUEST: 'harvest_request'
}

// 审批状态
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// Tab配置：与V1.1 ProductionApproval L141-146 完全对齐 4 Tab
// 修复 P0-PA-005：恢复 V1.1 4 Tab 配置（V2.0 多了 3 个：生产批次/批次变更/批次作废）
// 备注：以下 3 个 Tab 为 V2.0 P0-EX 自我创造，**不直接删除**（避免破坏 V1.1 数据流与生产依赖），
// 用注释保留，TODO 待确认。后续专项整改时再决定去留。
// TODO-P0-EX-PA: 列待确认 - 生产批次审批/批次变更审批/批次作废审批 是否保留？
//   实际归其他业务页（Production/Crop），非本页面职责
//   结论: 应全部移除，迁移到对应业务页
// P0-PA-001: 添加 path 字段供"查看全部 →" 链接使用（V1.1 L142-145）
const tabs = [
  { key: 'plan', label: '生产计划审批', icon: Calendar, path: '/production', types: [ApprovalType.PRODUCTION_PLAN] },
  { key: 'tech', label: '技术方案审批', icon: DocumentCopy, path: '/tech-solution', types: [ApprovalType.TECH_SOLUTION] },
  { key: 'purchase', label: '采购计划审批', icon: ShoppingCart, path: '/purchase-plan', types: [ApprovalType.PURCHASE_REQUEST] },
  // TODO-P0-EX-PA: { key: 'batch', label: '生产批次审批', icon: Box, types: [ApprovalType.PRODUCTION_BATCH] },  // 列待确认
  // TODO-P0-EX-PA: { key: 'batch_change', label: '批次变更审批', icon: RefreshRight, types: [ApprovalType.BATCH_CHANGE] },  // 列待确认
  // TODO-P0-EX-PA: { key: 'batch_void', label: '批次作废审批', icon: CircleClose, types: [ApprovalType.BATCH_VOID] },  // 列待确认
  { key: 'harvest', label: '采收申请审批', icon: House, path: '/harvest', types: [ApprovalType.HARVEST_REQUEST] }
]

// 当前Tab
const activeTab = ref('plan')

// 搜索和筛选
const searchTerm = ref('')
const statusFilter = ref('全部')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 批量选择
const selectedIds = ref(new Set())

// 详情弹窗
const detailVisible = ref(false)
const currentApproval = ref(null)

// 审批确认弹窗
const approvalModalVisible = ref(false)
const approvalModal = reactive({
  show: false,
  approval: null,
  action: 'approve'
})
const approvalComment = ref('')

// 当前Tab标签
const currentTabLabel = computed(() => {
  const tab = tabs.find(t => t.key === activeTab.value)
  return tab ? tab.label : ''
})

// P0-PA-001: 当前Tab对应业务页路径（V1.1 L405-410 Link to=tabs.find.path）
const currentTabPath = computed(() => {
  const tab = tabs.find(t => t.key === activeTab.value)
  return tab?.path || '/'
})

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

// 根据Tab获取数据
const getCurrentData = computed(() => {
  const currentTabConfig = tabs.find(t => t.key === activeTab.value)
  if (!currentTabConfig) return []
  return approvals.value.filter(a => currentTabConfig.types.includes(a.type))
})

// 筛选数据
const filteredData = computed(() => {
  return getCurrentData.value.filter(item => {
    const matchSearch =
      item.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.applicantName?.includes(searchTerm.value) ||
      item.code?.includes(searchTerm.value)
    const matchStatus =
      statusFilter.value === '全部' ||
      (statusFilter.value === '待审批' && item.status === ApprovalStatus.PENDING) ||
      (statusFilter.value === '已通过' && item.status === ApprovalStatus.APPROVED) ||
      (statusFilter.value === '已拒绝' && item.status === ApprovalStatus.REJECTED)
    return matchSearch && matchStatus
  })
})

// 更新统计
const updateStats = () => {
  stats.total = getCurrentData.value.length
  stats.pending = getCurrentData.value.filter(d => d.status === ApprovalStatus.PENDING).length
  stats.approved = getCurrentData.value.filter(d => d.status === ApprovalStatus.APPROVED).length
  stats.rejected = getCurrentData.value.filter(d => d.status === ApprovalStatus.REJECTED).length
}

// 总页数
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value) || 1)

// 当前页待审批项 ID 列表（用于表头全选按钮）
const pendingInPage = computed(() =>
  paginatedData.value
    .filter(d => d.status === ApprovalStatus.PENDING)
    .map(d => d.id)
)

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// Tab切换
const handleTabChange = (key) => {
  activeTab.value = key
  currentPage.value = 1
  selectedIds.value = new Set()
  updateStats()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  updateStats()
}

// 状态显示 - V1.1: inline pills with tailwind classes
const getStatusClass = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return 'bg-emerald-100 text-emerald-700'
    case ApprovalStatus.REJECTED:
      return 'bg-red-100 text-red-700'
    case ApprovalStatus.PENDING:
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

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

// 全选
const handleSelectAll = (selectAll) => {
  if (selectAll) {
    const pendingIds = paginatedData.value
      .filter(d => d.status === ApprovalStatus.PENDING)
      .map(d => d.id)
    selectedIds.value = new Set(pendingIds)
  } else {
    selectedIds.value = new Set()
  }
}

// 切换选择
const handleToggleSelect = (id) => {
  const newSelected = new Set(selectedIds.value)
  if (newSelected.has(id)) {
    newSelected.delete(id)
  } else {
    newSelected.add(id)
  }
  selectedIds.value = newSelected
}

// 批量通过
const handleBatchApprove = async () => {
  if (selectedIds.value.size === 0) return
  try {
    await ElMessageBox.confirm(`确定要批量通过 ${selectedIds.value.size} 项审批吗？`, '批量审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    })
    const ids = Array.from(selectedIds.value)
    await approvalStore.batchApprove(ids)
    await approvalStore.fetchApprovals()
    selectedIds.value = new Set()
    updateStats()
    ElMessage.success('批量审批通过成功')
  } catch {}
}

// 批量拒绝
const handleBatchReject = async () => {
  if (selectedIds.value.size === 0) return
  try {
    await ElMessageBox.confirm(`确定要批量拒绝 ${selectedIds.value.size} 项审批吗？`, '批量审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const ids = Array.from(selectedIds.value)
    await approvalStore.batchReject(ids, '批量拒绝')
    await approvalStore.fetchApprovals()
    selectedIds.value = new Set()
    updateStats()
    ElMessage.success('批量审批拒绝成功')
  } catch {}
}

// 导出
const handleExport = () => {
  if (selectedIds.value.size === 0) return
  const selectedData = paginatedData.value.filter(d => selectedIds.value.has(d.id))
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
  a.download = `生产审批_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 查看详情
const handleView = (row) => {
  currentApproval.value = row
  detailVisible.value = true
}

// 审批通过（使用确认弹窗）
const handleApprove = (row) => {
  approvalModal.approval = row
  approvalModal.action = 'approve'
  approvalComment.value = ''
  approvalModalVisible.value = true
}

// 审批拒绝（使用确认弹窗）
const handleReject = (row) => {
  approvalModal.approval = row
  approvalModal.action = 'reject'
  approvalComment.value = ''
  approvalModalVisible.value = true
}

// 确认审批操作
const confirmApprovalAction = async () => {
  const item = approvalModal.approval
  if (!item) return
  try {
    if (approvalModal.action === 'approve') {
      await approvalStore.approve(item.id, approvalComment.value)
      ElMessage.success('审核已通过')
    } else {
      await approvalStore.reject(item.id, approvalComment.value || '审批拒绝')
      ElMessage.success('已拒绝')
    }
    await approvalStore.fetchApprovals()
    updateStats()
    approvalModalVisible.value = false
    detailVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 业务类型标签
const getBusinessTypeLabel = (type) => {
  const labels = {
    production: '生产计划信息',
    production_batch: '生产批次信息',
    batch_change: '批次变更信息',
    batch_void: '批次作废信息',
    tech_solution: '技术方案信息',
    harvest: '采收申请信息',
    material: '领料申请信息',
    purchase: '采购申请信息',
    // P0-PA-003: 业务类型 typeLabelMap 补 4 键（V1.1 L640-643 leave/overtime/transfer/resign）
    leave: '请假申请信息',
    overtime: '加班申请信息',
    transfer: '转岗申请信息',
    resign: '离职申请信息',
  }
  return labels[type] || '业务信息'
}

// P0-PA-002: 采购物资明细总计金额（V1.1 L617-622）
const purchaseItemsTotal = computed(() => {
  const items = currentApproval.value?.purchasePlanDetail?.items || currentApproval.value?.businessLink?.items
  if (!items || !Array.isArray(items)) return 0
  return items.reduce((sum, item) => sum + Number(item.estimatedTotalPrice || 0), 0)
})

// 字段中文映射
const getFieldLabel = (key) => {
  const labels = {
    type: '业务类型',
    requestId: '请求ID',
    requestCode: '计划编号',
    batchCode: '批次编号',
    cropName: '作物名称',
    cropCode: '作物编码',
    variety: '品种',
    greenhouseName: '温室区域',
    greenhouseId: '温室ID',
    startDate: '开始日期',
    expectedHarvestDate: '预计采收',
    responsiblePerson: '负责人',
    targetYield: '目标产量',
    plantingArea: '种植面积',
    plantingMode: '种植方式',
    unit: '单位',
    quantity: '数量',
    solutionTitle: '方案标题',
    stage: '阶段',
    version: '版本号',
    remarks: '备注',
    description: '描述',
  }
  return labels[key] || key
}

// 格式化业务数据
const formatBusinessValue = (key, value) => {
  if (key === 'type') {
    const typeMap = {
      production: '生产计划', production_batch: '生产批次',
      batch_change: '批次变更', batch_void: '批次作废',
      tech_solution: '技术方案', harvest: '采收申请',
      material: '领料申请', purchase: '采购申请',
      // P0-PA-003: type 映射补 4 键（V1.1 L690-693 leave/overtime/transfer/resign）
      leave: '请假', overtime: '加班', transfer: '转岗', resign: '离职',
    }
    return typeMap[value] || value
  }
  if (key === 'targetYield') return `${value} kg`
  if (key === 'plantingArea') return `${value} m²`
  if (key === 'plantingMode') {
    const modeMap = {
      internal_seed: '自育种', external_purchase: '外购',
      open_field: '露天栽培', greenhouse: '温室栽培',
      hydroponics: '水培', aeroponics: '气雾培',
      substrate: '基质栽培', soil: '土培',
    }
    return modeMap[value] || value
  }
  if (key === 'stage') {
    const stageMap = {
      seedling: '苗期', vegetative: '营养生长',
      flowering: '开花期', fruiting: '结果期',
      harvest: '采收期', entire: '整个生命周期', whole_lifecycle: '整个生命周期',
    }
    return stageMap[value] || value
  }
  return String(value)
}

// 初始加载 - 从API加载数据
onMounted(async () => {
  await approvalStore.fetchApprovals()
  updateStats()
})
</script>
