<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <el-icon :size="20" color="white">
              <CirclePlus />
            </el-icon>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">入职办理</h1>
            <p class="text-xs text-gray-500">招聘→入职闭环管理</p>
          </div>
        </div>
        <el-button type="primary" @click="openFormModal">
          <el-icon><Plus /></el-icon> 办理入职
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索姓名、身份证号、手机号..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="待入职" value="pending" />
          <el-option label="办理中" value="processing" />
          <el-option label="已入职" value="completed" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">待入职</p>
            <p class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.pending }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <el-icon :size="24" color="#d97706"><Clock /></el-icon>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">办理中</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ statusCounts.processing }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" color="#2563eb"><Warning /></el-icon>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">已入职</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ statusCounts.completed }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <el-icon :size="24" color="#16a34a"><CircleCheck /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">入职记录</h3>
        <div class="flex gap-2">
          <el-button size="small" @click="openFormModal">
            <el-icon><Plus /></el-icon> 新增
          </el-button>
          <el-button size="small" type="primary">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button size="small" type="danger">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
          <el-button size="small">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </div>

      <el-table :data="paginatedData" stripe>
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <div>
              <p class="font-medium text-gray-900">{{ row.name }}</p>
              <p class="text-sm text-gray-500">{{ row.phone }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="岗位" min-width="120">
          <template #default="{ row }">
            <div>
              <p class="text-gray-900">{{ row.position }}</p>
              <p class="text-sm text-gray-500">{{ row.department }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contractType" label="合同类型" min-width="100" />
        <el-table-column prop="joinDate" label="入职日期" min-width="120" />
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
            <el-button v-if="row.status === 'pending'" link type="primary" size="small" @click="startProcess(row)">开始办理</el-button>
            <el-button v-if="row.status === 'processing'" link type="success" size="small" @click="completeOnboarding(row)">完成入职</el-button>
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
    <el-dialog v-model="detailDialogVisible" title="入职详情" width="700px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentRecord.phone }}</el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">{{ currentRecord.idCard }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="合同类型">{{ currentRecord.contractType }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ currentRecord.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增弹窗 -->
    <el-dialog v-model="formDialogVisible" title="办理入职" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="formData.contractType" placeholder="请选择合同类型">
            <el-option label="劳动合同" value="劳动合同" />
            <el-option label="劳务合同" value="劳务合同" />
            <el-option label="实习协议" value="实习协议" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期" prop="joinDate">
          <el-date-picker
            v-model="formData.joinDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
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
import { CirclePlus, Search, Plus, Edit, Delete, Download, Clock, Warning, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { } from 'element-plus'

// 状态映射
const statusMap = {
  pending: { label: '待入职', type: 'warning' },
  processing: { label: '办理中', type: 'primary' },
  completed: { label: '已入职', type: 'success' }
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
  pageSize: 10
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 表单弹窗
const formDialogVisible = ref(false)
const formRef = ref()
const formData = reactive({
  name: '',
  phone: '',
  idCard: '',
  position: '',
  department: '',
  contractType: '劳动合同',
  joinDate: new Date().toISOString().split('T')[0]
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

// 模拟数据
const allData = ref([
  { id, name: '新员工A', phone: '13700137001', idCard: '110101199001011234', position: '技术员', department: '技术部', contractType: '劳动合同', joinDate: '2026-05-25', status: 'pending' },
  { id, name: '新员工B', phone: '13700137002', idCard: '110101199002022345', position: '运营专员', department: '运营部', contractType: '劳动合同', joinDate: '2026-05-20', status: 'processing' },
  { id, name: '新员工C', phone: '13700137003', idCard: '110101199003033456', position: '市场专员', department: '市场部', contractType: '实习协议', joinDate: '2026-05-15', status: 'completed' }
])

// 统计
const statusCounts = computed(() => ({
  pending: allData.value.filter(r => r.status === 'pending').length,
  processing: allData.value.filter(r => r.status === 'processing').length,
  completed: allData.value.filter(r => r.status === 'completed').length
}))

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.name.includes(filters.keyword) && !record.idCard.includes(filters.keyword) && !record.phone.includes(filters.keyword)) return false
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

// 开始办理
const startProcess = (row) => {
  const index = allData.value.findIndex(r => r.id === row.id)
  if (index !== -1) {
    allData.value[index].status = 'processing'
    ElMessage.success('已开始办理入职')
  }
}

// 完成入职
const completeOnboarding = async (row) => {
  try {
    await ElMessageBox.confirm('确定要完成入职办理吗？这将创建员工档案。', '确认完成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = allData.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      allData.value[index].status = 'completed'
      ElMessage.success('入职办理已完成')
    }
  } catch {
    // 取消操作
  }
}

// 新增
const openFormModal = () => {
  Object.assign(formData, {
    name: '',
    phone: '',
    idCard: '',
    position: '',
    department: '',
    contractType: '劳动合同',
    joinDate: new Date().toISOString().split('T')[0]
  })
  formDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      allData.value.unshift({
        id: Date.now(),
        ...formData,
        status: 'pending'
      })
      ElMessage.success('入职登记成功')
      formDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>
