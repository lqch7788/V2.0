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
          <h1 class="text-lg font-bold text-gray-900">招聘管理</h1>
          <p class="text-xs text-gray-500">招聘信息发布与管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">招聘中</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ statusCounts.open }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已暂停</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.paused }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已结束</p>
        <p class="text-2xl font-bold text-gray-600 mt-1">{{ statusCounts.closed }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总职位数</p>
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
          <el-option label="招聘中" value="open" />
          <el-option label="已暂停" value="paused" />
          <el-option label="已结束" value="closed" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮栏 -->
    <div class="bg-white rounded-xl p-3 shadow-sm flex items-center justify-end">
      <el-button type="primary" size="small" @click="openFormModal">
        <el-icon><Plus /></el-icon> 发布职位
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe>
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="warning" size="small" @click="toggleStatus(row)">
              {{ row.status === 'open' ? '暂停' : '开启' }}
            </el-button>
            <el-button link type="danger" size="small" @click="closePosition(row)">关闭</el-button>
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
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑职位' : '发布职位'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="职位名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入职位名称" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="招聘人数" prop="headcount">
          <el-input-number v-model="formData.headcount" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="薪资范围" prop="salaryRange">
          <el-input v-model="formData.salaryRange" placeholder="如: 5000-8000" />
        </el-form-item>
        <el-form-item label="职位描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入职位描述" />
        </el-form-item>
        <el-form-item label="任职要求" prop="requirements">
          <el-input v-model="formData.requirements" type="textarea" :rows="3" placeholder="请输入任职要求" />
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
import { ref, computed, reactive } from 'vue'
import { Briefcase, Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { } from 'element-plus'

// 状态映射
const statusMap = {
  open: { label: '招聘中', type: 'success' },
  paused: { label: '已暂停', type: 'warning' },
  closed: { label: '已结束', type: 'info' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 筛选条件
const filters = reactive({
  keyword: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 表单弹窗
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  title: '',
  department: '',
  position: '',
  headcount: 1,
  salaryRange: '',
  description: '',
  requirements: ''
})

const formRules = {
  title: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
  headcount: [{ required: true, message: '请输入招聘人数', trigger: 'blur' }]
}

// 模拟数据
const allData = ref([
  { id: 1, title: '高级农艺师', department: '技术部', position: '农艺师', headcount: 2, salaryRange: '8000-12000', publishDate: '2026-05-01', status: 'open', applicants: 5, description: '负责农业技术指导', requirements: '有3年以上农业经验' },
  { id: 2, title: '运营专员', department: '运营部', position: '运营', headcount: 1, salaryRange: '5000-8000', publishDate: '2026-05-10', status: 'open', applicants: 3, description: '负责日常运营管理', requirements: '有运营经验优先' },
  { id: 3, title: '市场专员', department: '市场部', position: '市场', headcount: 2, salaryRange: '6000-10000', publishDate: '2026-04-15', status: 'paused', applicants: 8, description: '负责市场推广', requirements: '有市场推广经验' },
  { id: 4, title: '仓库管理员', department: '仓储部', position: '仓储', headcount: 1, salaryRange: '4000-6000', publishDate: '2026-04-01', status: 'closed', applicants: 2, description: '负责仓库管理', requirements: '有仓储管理经验' }
])

// 统计
const statusCounts = computed(() => ({
  open: allData.value.filter(r => r.status === 'open').length,
  paused: allData.value.filter(r => r.status === 'paused').length,
  closed: allData.value.filter(r => r.status === 'closed').length
}))

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.title.includes(filters.keyword)) return false
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
  filters.status = ''
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

// 切换状态
const toggleStatus = (row) => {
  const index = allData.value.findIndex(r => r.id === row.id)
  if (index !== -1) {
    allData.value[index].status = row.status === 'open' ? 'paused' : 'open'
    ElMessage.success(`已${row.status === 'open' ? '暂停' : '开启'}招聘`)
  }
}

// 关闭职位
const closePosition = (row) => {
  const index = allData.value.findIndex(r => r.id === row.id)
  if (index !== -1) {
    allData.value[index].status = 'closed'
    ElMessage.success('已关闭职位')
  }
}

// 新增
const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, {
    title: '',
    department: '',
    position: '',
    headcount: 1,
    salaryRange: '',
    description: '',
    requirements: ''
  })
  formDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = allData.value.findIndex(r => r.id === formData.id)
        if (index !== -1) {
          allData.value[index] = { ...allData.value[index], ...formData }
        }
        ElMessage.success('编辑成功')
      } else {
        allData.value.unshift({
          id: Date.now(),
          ...formData,
          publishDate: new Date().toISOString().split('T')[0],
          status: 'open',
          applicants: 0
        })
        ElMessage.success('发布成功')
      }
      formDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>
