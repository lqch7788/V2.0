<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <UserDelete />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">离职申请</h1>
          <p class="text-xs text-gray-500">员工离职申请与审批管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1彩色背景 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">待审批</p>
            <p class="text-2xl font-bold text-amber-700 mt-1">{{ statusCounts.pending }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
            <el-icon :size="18" color="#d97706"><Clock /></el-icon>
          </div>
        </div>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">已通过</p>
            <p class="text-2xl font-bold text-emerald-700 mt-1">{{ statusCounts.approved }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
            <el-icon :size="18" color="#059669"><CircleCheck /></el-icon>
          </div>
        </div>
      </div>
      <div class="bg-red-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">已拒绝</p>
            <p class="text-2xl font-bold text-red-700 mt-1">{{ statusCounts.rejected }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
            <el-icon :size="18" color="#dc2626"><Close /></el-icon>
          </div>
        </div>
      </div>
      <div class="bg-blue-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">总申请数</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ allData.length }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
            <el-icon :size="18" color="#2563eb"><Document /></el-icon>
          </div>
        </div>
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
        <el-select v-model="filters.status" placeholder="审批状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option v-for="item in APPROVAL_STATUS_OPTIONS.filter(o => o.value)" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe v-loading="loading">
        <el-table-column prop="employeeName" label="员工姓名" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="position" label="岗位" min-width="100" />
        <el-table-column prop="joinDate" label="入职日期" min-width="120" />
        <el-table-column prop="resignDate" label="离职日期" min-width="120" />
        <el-table-column prop="reason" label="离职原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button size="small" :icon="View" circle @click="viewDetail(row)" />
            </el-tooltip>
            <el-tooltip v-if="row.status === '待审批'" content="通过" placement="top">
              <el-button size="small" :icon="Check" circle type="success" @click="approveRecord(row)" />
            </el-tooltip>
            <el-tooltip v-if="row.status === '待审批'" content="驳回" placement="top">
              <el-button size="small" :icon="Close" circle type="danger" @click="rejectRecord(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无数据' }}</p>
          </div>
        </template>
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
    <el-dialog v-model="detailDialogVisible" title="离职详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="员工姓名">{{ currentRecord.staffName || currentRecord.employeeName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ currentRecord.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentRecord.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="预计离职日期">{{ currentRecord.resignDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="离职原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentRecord.approvedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">{{ currentRecord.comment || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Delete, Search, View, Check, Close, Clock, CircleCheck, Document } from '@element-plus/icons-vue'
import UserDelete from '@/components/icons/UserDelete.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { RESIGNATION_TYPE_OPTIONS, APPROVAL_STATUS_OPTIONS } from '@/data/laborData'

// 状态映射 - 与V1.1一致
const statusMap = {
  '待审批': { label: '待审批', type: 'warning' },
  '已通过': { label: '已通过', type: 'success' },
  '已拒绝': { label: '已拒绝', type: 'danger' }
}
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// Labor Store
const laborStore = useLaborStore()

// 筛选条件
const filters = reactive({ keyword: '', status: '' })

// 分页
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// 弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 数据
const allData = ref([])
const loading = ref(false)
const error = ref('')

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize }
    if (filters.keyword) params.staffName = filters.keyword
    if (filters.status) params.status = filters.status
    await laborStore.fetchResignationList(params)
    allData.value = laborStore.resignationList
    pagination.total = laborStore.resignationTotal
  } catch (e) {
    console.error('加载离职数据失败:', e)
    error.value = '加载数据失败'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 统计
const statusCounts = computed(() => ({
  pending: allData.value.filter(r => r.status === '待审批').length,
  approved: allData.value.filter(r => r.status === '已通过').length,
  rejected: allData.value.filter(r => r.status === '已拒绝').length
}))

// 筛选后数据
const filteredData = computed(() => allData.value)
const paginatedData = computed(() => allData.value)

// 搜索/重置
const handleSearch = () => { pagination.currentPage = 1; loadData() }
const handleReset = () => {
  filters.keyword = ''; filters.status = ''
  pagination.currentPage = 1; loadData()
}

// 分页
const handlePageSizeChange = () => { pagination.currentPage = 1; loadData() }

// 详情
const viewDetail = (row) => { currentRecord.value = row; detailDialogVisible.value = true }

// 批准
const approveRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要批准该离职申请吗？', '确认批准', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.approveResignation(row.id, { approver: '当前用户' })
    ElMessage.success('已通过')
    loadData()
  } catch { /* 取消 */ }
}

// 驳回
const rejectRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要驳回该离职申请吗？', '确认驳回', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.updateResignation(row.id, { status: '已拒绝', approver: '当前用户' })
    ElMessage.success('已驳回')
    loadData()
  } catch { /* 取消 */ }
}

onMounted(() => { loadData() })
</script>

<style scoped>
/* 继承全局样式 */
</style>
