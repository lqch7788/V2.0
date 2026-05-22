<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Checked />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">HR审批</h1>
          <p class="text-xs text-gray-500">人力资源审批流程管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">待审批</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.pending }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已批准</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ statusCounts.approved }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已驳回</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{{ statusCounts.rejected }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总记录数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ allData.length }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索员工姓名..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.approvalType" placeholder="审批类型" clearable class="w-full sm:w-36">
          <el-option label="全部类型" value="" />
          <el-option label="入职审批" value="onboarding" />
          <el-option label="离职审批" value="resignation" />
          <el-option label="转正审批" value="regular" />
          <el-option label="调岗审批" value="transfer" />
        </el-select>
        <el-select v-model="filters.status" placeholder="审批状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="待审批" value="pending" />
          <el-option label="已批准" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="w-full sm:w-64"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="employeeName" label="员工姓名" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="approvalType" label="审批类型" min-width="120">
          <template #default="{ row }">
            {{ getApprovalTypeLabel(row.approvalType) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="申请原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" min-width="100">
          <template #default="{ row }">
            {{ row.approver || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" min-width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" link type="success" size="small" @click="approveRecord(row)">批准</el-button>
            <el-button v-if="row.status === 'pending'" link type="danger" size="small" @click="rejectRecord(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between p-4 border-t border-gray-100">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>每页</span>
          <el-select v-model="pagination.pageSize" size="small" style="width: 80px" @change="handlePageSizeChange">
            <el-option :value="10" label="10条" />
            <el-option :value="20" label="20条" />
            <el-option :value="50" label="50条" />
          </el-select>
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="审批详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="员工姓名">{{ currentRecord.employeeName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="审批类型">{{ getApprovalTypeLabel(currentRecord.approvalType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentRecord.approvedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Checked, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 审批类型映射
const approvalTypeMap = {
  onboarding: '入职审批',
  resignation: '离职审批',
  regular: '转正审批',
  transfer: '调岗审批'
}

const getApprovalTypeLabel = (type) => approvalTypeMap[type] || type

// 状态映射
const statusMap = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已批准', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 筛选条件
const filters = reactive({
  keyword: '',
  approvalType: '',
  status: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 模拟数据
const allData = ref([
  { id: 1, employeeName: '张三', department: '技术部', approvalType: 'onboarding', reason: '新员工入职申请', status: 'pending', approver: '', approvedAt: '', createTime: '2026-05-20' },
  { id: 2, employeeName: '李四', department: '运营部', approvalType: 'regular', reason: '试用期转正申请', status: 'approved', approver: '王经理', approvedAt: '2026-05-18 10:00', createTime: '2026-05-15' },
  { id: 3, employeeName: '王五', department: '市场部', approvalType: 'resignation', reason: '个人原因离职', status: 'rejected', approver: '王经理', approvedAt: '2026-05-15 14:00', createTime: '2026-05-10' },
  { id: 4, employeeName: '赵六', department: '生产部', approvalType: 'transfer', reason: '岗位调动申请', status: 'pending', approver: '', approvedAt: '', createTime: '2026-05-19' }
])

// 统计
const statusCounts = computed(() => ({
  pending: allData.value.filter(r => r.status === 'pending').length,
  approved: allData.value.filter(r => r.status === 'approved').length,
  rejected: allData.value.filter(r => r.status === 'rejected').length
}))

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.employeeName.includes(filters.keyword)) return false
    if (filters.approvalType && record.approvalType !== filters.approvalType) return false
    if (filters.status && record.status !== filters.status) return false
    return true
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.approvalType = ''
  filters.status = ''
  filters.dateRange = []
  pagination.currentPage = 1
}

// 分页
const handlePageSizeChange = () => {
  pagination.currentPage = 1
}

// 详情
const viewDetail = (row) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 批准
const approveRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要批准该申请吗？', '确认批准', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = allData.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      allData.value[index].status = 'approved'
      allData.value[index].approver = '当前用户'
      allData.value[index].approvedAt = new Date().toLocaleString()
    }
    ElMessage.success('已批准')
  } catch {
    // 取消操作
  }
}

// 驳回
const rejectRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要驳回该申请吗？', '确认驳回', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = allData.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      allData.value[index].status = 'rejected'
      allData.value[index].approver = '当前用户'
      allData.value[index].approvedAt = new Date().toLocaleString()
    }
    ElMessage.success('已驳回')
  } catch {
    // 取消操作
  }
}
</script>

<style scoped>
/* 继承全局样式 */
</style>
