<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Briefcase />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">招聘管理</h1>
          <p class="text-xs text-gray-500">招聘信息发布与管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-blue-700 font-medium">招聘中</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ statusCounts.open }}</p>
      </div>
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-amber-700 font-medium">已暂停</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.paused }}</p>
      </div>
      <div class="bg-gray-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-700 font-medium">已结束</p>
        <p class="text-2xl font-bold text-gray-600 mt-1">{{ statusCounts.closed }}</p>
      </div>
      <div class="bg-gray-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-700 font-medium">总职位数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ pagination.total }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索职位名称..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.status" placeholder="招聘状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="招聘中" value="招聘中" />
          <el-option label="已暂停" value="已暂停" />
          <el-option label="已结束" value="已结束" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮区-->
    <div class="bg-white rounded-xl p-3 shadow-sm flex items-center justify-end gap-2">
      <el-button size="small" @click="handleExportClick">
        <el-icon><Download /></el-icon> 导出
      </el-button>
      <el-button type="primary" size="small" @click="openFormModal">
        <el-icon><Plus /></el-icon> 发布职位
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe v-loading="loading">
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无招聘数据' }}</p>
          </div>
        </template>
        <el-table-column prop="title" label="职位名称" min-width="150" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="position" label="岗位" min-width="100" />
        <el-table-column prop="headcount" label="人数" min-width="80" />
        <el-table-column prop="salaryRange" label="薪资范围" min-width="120" />
        <el-table-column prop="publishDate" label="发布日期" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button size="small" :icon="View" circle @click="viewDetail(row)" />
            </el-tooltip>
            <el-tooltip :content="row.status === '招聘中' ? '暂停' : '开启'" placement="top">
              <el-button size="small" :icon="VideoPause" circle type="warning" @click="toggleStatus(row)" />
            </el-tooltip>
            <el-tooltip content="关闭" placement="top">
              <el-button size="small" :icon="Close" circle type="danger" @click="closePosition(row)" />
            </el-tooltip>
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

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="400px">
      <div class="space-y-4">
        <p class="text-sm text-gray-500">选择导出格式（共 {{ allData.length }} 条记录）</p>
        <el-radio-group v-model="exportFormat" class="flex flex-col gap-3">
          <el-radio value="excel" size="large">Excel 格式 (.xls)</el-radio>
          <el-radio value="csv" size="large">CSV 格式 (.csv)</el-radio>
          <el-radio value="word" size="large">Word 格式 (.doc)</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确认导出</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="职位详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="职位名称">{{ currentRecord.title }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="招聘人数">{{ currentRecord.headcount }}</el-descriptions-item>
          <el-descriptions-item label="薪资范围">{{ currentRecord.salaryRange }}</el-descriptions-item>
          <el-descriptions-item label="发布日期">{{ currentRecord.publishDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已投递">{{ currentRecord.applicants }}</el-descriptions-item>
          <el-descriptions-item label="职位描述" :span="2">{{ currentRecord.description }}</el-descriptions-item>
          <el-descriptions-item label="任职要求" :span="2">{{ currentRecord.requirements }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑职位' : '发布职位'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="职位名称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入职位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用工类型" prop="employmentType">
              <el-select v-model="formData.employmentType" placeholder="请选择用工类型">
                <el-option label="正式员工" value="正式员工" />
                <el-option label="临时工" value="临时工" />
                <el-option label="季节工" value="季节工" />
                <el-option label="实习生" value="实习生" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="formData.department" placeholder="请输入部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入岗位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="招聘人数" prop="headcount">
              <el-input-number v-model="formData.headcount" :min="1" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优先类" prop="priority">
              <el-select v-model="formData.priority" placeholder="请选择">
                <el-option v-for="item in RECRUITMENT_PRIORITY_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="招聘来源" prop="source">
              <el-input v-model="formData.source" placeholder="如: 内部推荐" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最低薪资" prop="minSalary">
              <el-input-number v-model="formData.minSalary" :min="0" :precision="0" style="width: 100%" placeholder="最低薪资" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高薪资" prop="maxSalary">
              <el-input-number v-model="formData.maxSalary" :min="0" :precision="0" style="width: 100%" placeholder="最高薪资" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="期望到岗日期" prop="expectedDate">
          <el-date-picker
            v-model="formData.expectedDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="招聘原因" prop="reason">
          <el-input v-model="formData.reason" type="textarea" :rows="2" placeholder="请输入招聘原因" />
        </el-form-item>
        <el-form-item label="职位描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入职位描述" />
        </el-form-item>
        <el-form-item label="岗位要求" prop="requirements">
          <el-input v-model="formData.requirements" type="textarea" :rows="3" placeholder="请输入岗位要求" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Briefcase, Search, Plus, Download, View, VideoPause, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'
import { RECRUITMENT_PRIORITY_OPTIONS, APPROVAL_STATUS_OPTIONS } from '@/data/laborData'

// 状态映射
const statusMap = {
  '招聘中': { label: '招聘中', type: 'success' },
  '已暂停': { label: '已暂停', type: 'warning' },
  '已结束': { label: '已结束', type: 'info' }
}
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// Labor Store
const laborStore = useLaborStore()
const { exportWithFormatSelect } = useExport({ fileName: '招聘数据' })

// 招聘导出列配置
const recruitmentExportColumns = [
  { key: 'title', label: '职位名称' },
  { key: 'department', label: '部门' },
  { key: 'position', label: '岗位' },
  { key: 'headcount', label: '招聘人数' },
  { key: 'salaryRange', label: '薪资范围' },
  { key: 'publishDate', label: '发布日期' },
  { key: 'status', label: '状态' }
]

// 加载/错误状态
const loading = ref(false)
const error = ref('')

// 筛选条件
const filters = reactive({ keyword: '', status: '' })

// 分页
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// 弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  id: null, title: '', employmentType: '', department: '', position: '', headcount: 1,
  priority: '', source: '', minSalary: null, maxSalary: null,
  expectedDate: '', reason: '', description: '', requirements: ''
})

const formRules = {
  title: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
  headcount: [{ required: true, message: '请输入招聘人数', trigger: 'blur' }]
}

// 导出弹窗状态
const exportModalVisible = ref(false)
const exportFormat = ref('excel')

// 数据
const allData = ref([])

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize }
    if (filters.keyword) params.title = filters.keyword
    if (filters.status) params.status = filters.status
    await laborStore.fetchRecruitmentList(params)
    allData.value = laborStore.recruitmentList
    pagination.total = laborStore.recruitmentTotal
  } catch (e) {
    error.value = '加载招聘数据失败，请稍后重试'
    ElMessage.error('加载招聘数据失败')
  } finally {
    loading.value = false
  }
}

// 统计
const statusCounts = computed(() => ({
  open: allData.value.filter(r => r.status === '招聘中').length,
  paused: allData.value.filter(r => r.status === '已暂停').length,
  closed: allData.value.filter(r => r.status === '已结束').length
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

// 切换状态
const toggleStatus = async (row) => {
  try {
    const targetStatus = row.status === '招聘中' ? '已暂停' : '招聘中'
    await laborStore.updateRecruitment(row.id, { status: targetStatus })
    ElMessage.success(row.status === '招聘中' ? '暂停招聘' : '开启招聘')
    loadData()
  } catch (e) {
    console.error('切换状态失败', e)
  }
}

// 关闭职位
const closePosition = async (row) => {
  try {
    await ElMessageBox.confirm('确定要关闭该职位吗？', '确认关闭', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.updateRecruitment(row.id, { status: '已结束' })
    ElMessage.success('已关闭职位')
    loadData()
  } catch { /* 取消 */ }
}

// 导出
const handleExportClick = () => {
  if (allData.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  exportModalVisible.value = true
}

const confirmExport = () => {
  exportWithFormatSelect(allData.value, recruitmentExportColumns, exportFormat.value, `招聘数据_${new Date().toISOString().slice(0, 10)}`)
  exportModalVisible.value = false
}

// 新增
const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null, title: '', employmentType: '', department: '', position: '', headcount: 1,
    priority: '', source: '', minSalary: null, maxSalary: null,
    expectedDate: '', reason: '', description: '', requirements: ''
  })
  formDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 薪资交叉校验
      if (formData.minSalary > 0 && formData.maxSalary > 0 && formData.minSalary > formData.maxSalary) {
        ElMessage.warning('最低薪资不能大于最高薪资')
        return
      }
      const payload = {
        title: formData.title, employmentType: formData.employmentType,
        department: formData.department, position: formData.position,
        headcount: formData.headcount, priority: formData.priority,
        source: formData.source, minSalary: formData.minSalary, maxSalary: formData.maxSalary,
        expectedDate: formData.expectedDate, reason: formData.reason,
        description: formData.description, requirements: formData.requirements
      }
      if (isEdit.value) {
        await laborStore.updateRecruitment(formData.id, payload)
        ElMessage.success('编辑成功')
      } else {
        await laborStore.createRecruitment(payload)
        ElMessage.success('发布成功')
      }
      formDialogVisible.value = false
      loadData()
    }
  })
}

onMounted(() => { loadData() })
</script>

<style scoped>
/* 继承全局样式 */
</style>
