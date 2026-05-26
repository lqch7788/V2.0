<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Search />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">招聘申请</h1>
          <p class="text-xs text-gray-500">招聘需求申请与审批</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-amber-600">待审批</p>
        <p class="text-2xl font-bold text-amber-700 mt-1">{{ statusCounts.pending }}</p>
      </div>
      <div class="bg-green-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-green-600">已通过</p>
        <p class="text-2xl font-bold text-green-700 mt-1">{{ statusCounts.approved }}</p>
      </div>
      <div class="bg-red-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-red-600">已拒绝</p>
        <p class="text-2xl font-bold text-red-700 mt-1">{{ statusCounts.rejected }}</p>
      </div>
      <div class="bg-gray-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总申请数</p>
        <p class="text-2xl font-bold text-gray-700 mt-1">{{ allData.length }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索申请人、职位..."
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

    <!-- 操作按钮栏 -->
    <div class="bg-white rounded-xl p-3 shadow-sm flex items-center justify-end gap-2">
      <el-button type="primary" size="small" @click="openApplyForm">
        <el-icon><Plus /></el-icon> 新增申请
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe v-loading="loading" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }">
        <el-table-column prop="applicant" label="申请人" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="position" label="申请职位" min-width="120" />
        <el-table-column prop="headcount" label="人数" min-width="80" />
        <el-table-column prop="reason" label="申请原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="applyDate" label="申请日期" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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
            <el-tooltip content="编辑" placement="top">
              <el-button size="small" :icon="Edit" circle type="primary" @click="editRecord(row)" />
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
    <el-dialog v-model="detailDialogVisible" title="申请详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人">{{ currentRecord.applicant }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="申请职位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="招聘人数">{{ currentRecord.headcount }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentRecord.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentRecord.approvedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">{{ currentRecord.comment || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="applyFormVisible" :title="isEditApply ? '编辑申请' : '新增招聘申请'" width="550px">
      <el-form ref="applyFormRef" :model="applyFormData" :rules="applyFormRules" label-width="100px">
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="applyFormData.applicant" placeholder="请输入申请人" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="applyFormData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="申请职位" prop="position">
          <el-input v-model="applyFormData.position" placeholder="请输入申请职位" />
        </el-form-item>
        <el-form-item label="招聘人数" prop="headcount">
          <el-input-number v-model="applyFormData.headcount" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="申请原因" prop="reason">
          <el-input v-model="applyFormData.reason" type="textarea" :rows="3" placeholder="请输入申请原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApplyForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Search, View, Check, Close, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { RECRUITMENT_PRIORITY_OPTIONS, APPROVAL_STATUS_OPTIONS } from '@/data/laborData'

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

// 申请表单弹窗
const applyFormVisible = ref(false)
const isEditApply = ref(false)
const applyFormRef = ref()
const applyFormData = reactive({
  id: null,
  applicant: '',
  department: '',
  position: '',
  headcount: 1,
  reason: ''
})

const applyFormRules = {
  applicant: [{ required: true, message: '请输入申请人', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  position: [{ required: true, message: '请输入申请职位', trigger: 'blur' }],
  headcount: [{ required: true, message: '请输入招聘人数', trigger: 'blur' }]
}

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
    await laborStore.fetchRecruitmentList(params)
    allData.value = laborStore.recruitmentList
    pagination.total = laborStore.recruitmentTotal
  } catch (e) {
    console.error('加载招聘申请数据失败:', e)
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

// 编辑申请
const editRecord = (row) => {
  isEditApply.value = true
  Object.assign(applyFormData, row)
  applyFormVisible.value = true
}

// 新增申请
const openApplyForm = () => {
  isEditApply.value = false
  Object.assign(applyFormData, {
    id: null, applicant: '', department: '', position: '', headcount: 1, reason: ''
  })
  applyFormVisible.value = true
}

// 提交申请表单
const submitApplyForm = async () => {
  if (!applyFormRef.value) return
  await applyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = {
          applicant: applyFormData.applicant,
          department: applyFormData.department,
          position: applyFormData.position,
          headcount: applyFormData.headcount,
          reason: applyFormData.reason
        }
        if (isEditApply.value) {
          await laborStore.updateRecruitment(applyFormData.id, payload)
          ElMessage.success('编辑成功')
        } else {
          await laborStore.createRecruitment({ ...payload, status: '待审批', applyDate: new Date().toISOString().split('T')[0] })
          ElMessage.success('申请提交成功')
        }
        applyFormVisible.value = false
        loadData()
      } catch (e) {
        ElMessage.error(isEditApply.value ? '编辑失败' : '提交失败')
      }
    }
  })
}

// 批准
const approveRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要批准该招聘申请吗？', '确认批准', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.approveRecruitment(row.id, { approver: '当前用户' })
    ElMessage.success('已通过')
    loadData()
  } catch { /* 取消 */ }
}

// 驳回
const rejectRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要驳回该招聘申请吗？', '确认驳回', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.updateRecruitment(row.id, { status: '已拒绝', approver: '当前用户' })
    ElMessage.success('已驳回')
    loadData()
  } catch { /* 取消 */ }
}

onMounted(() => { loadData() })
</script>

<style scoped>
/* 继承全局样式 */
</style>
