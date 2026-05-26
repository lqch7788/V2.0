<template>
  <div class="space-y-6">
    <!-- 页面标题 - V1.1: ClipboardCheck图标, emerald渐变, 待办审批 -->
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

    <!-- 统计卡片 - V1.1: 2卡片 bg-[#F2F6FA] -->
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
            <span class="text-red-600 text-lg font-bold">!</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ urgentCount }}</p>
            <p class="text-xs text-gray-500">加急</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 - V1.1: bg-[#F2F6FA] -->
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

    <!-- 数据表格 - V1.1: 灰色表头 bg-gray-50 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">待审批列表</h3>
      </div>
      <el-table
        :data="paginatedApprovals"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#111827', fontWeight: '600', fontSize: '14px' }"
      >
        <el-table-column prop="code" label="审批单号" min-width="140" align="center" />
        <el-table-column prop="typeName" label="类型" min-width="100" align="center" />
        <el-table-column label="标题" min-width="180" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 truncate block max-w-[200px]" :title="row.title">
              {{ row.title || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" width="100" align="center" />
        <el-table-column prop="applicantDepartment" label="部门" width="100" align="center" />
        <el-table-column prop="applyDate" label="申请时间" width="120" align="center" />
        <el-table-column label="金额" width="100" align="center">
          <template #default="{ row }">
            {{ row.amount || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              待审批
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
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

      <div v-if="filteredApprovals.length === 0" class="p-8 text-center text-gray-500">
        暂无待审批单据
      </div>

      <!-- 分页 - V1.1 pageSizeOptions: [5,10,20,50] -->
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
          <span class="text-sm text-gray-500">共 {{ filteredApprovals.length }} 条</span>
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
  Tickets, Clock, Search, CircleCheck, CircleClose, View,
  ArrowLeft, ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import ApprovalDetail from '@/components/approval/ApprovalDetail.vue'

const approvalStore = useApprovalStore()
const { pendingApprovals } = storeToRefs(approvalStore)

const searchTerm = ref('')
const typeFilter = ref('全部')
const currentPage = ref(1)
const pageSize = ref(5)
const detailApproval = ref(null)
const detailVisible = ref(false)

// 筛选 - V1.1: typeName匹配
const filteredApprovals = computed(() => {
  return pendingApprovals.value.filter(a => {
    const matchSearch = !searchTerm.value ||
      a.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      a.applicantName?.includes(searchTerm.value)
    const matchType = typeFilter.value === '全部' || a.typeName === typeFilter.value
    return matchSearch && matchType
  })
})

const totalPages = computed(() => Math.ceil(filteredApprovals.value.length / pageSize.value) || 1)
const paginatedApprovals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredApprovals.value.slice(start, start + pageSize.value)
})

// 加急统计 - V1.1: priority === 'urgent'
const urgentCount = computed(() => {
  return pendingApprovals.value.filter(a => a.priority === 'urgent').length
})

const handleSearch = () => {
  currentPage.value = 1
}

const showDetail = (row) => {
  detailApproval.value = row
  detailVisible.value = true
}

// 审批通过
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm('确定要通过该审批吗？', '审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    })
    await approvalStore.approve(row.id)
    ElMessage.success('审核已通过')
    await approvalStore.fetchApprovals()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('审批通过失败:', err)
    }
  }
}

// 审批拒绝 - V1.1: inputValue默认"审批拒绝"
const handleReject = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回确认', {
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      type: 'warning',
      inputValue: '审批拒绝'
    })
    if (value) {
      await approvalStore.reject(row.id, value)
      ElMessage.success('已驳回')
      await approvalStore.fetchApprovals()
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('审批驳回失败:', err)
    }
  }
}

onMounted(() => {
  approvalStore.fetchApprovals()
})
</script>
