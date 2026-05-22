<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <User />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">员工信息</h1>
          <p class="text-xs text-gray-500">员工信息管理与组织架构</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#2563eb"><Document /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ totalCount }}</p>
            <p class="text-xs text-gray-500">员工总数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" color="#16a34a"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ activeCount }}</p>
            <p class="text-xs text-gray-500">在职人数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" color="#d97706"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ trialCount }}</p>
            <p class="text-xs text-gray-500">试用期</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" color="#dc2626"><UserDelete /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ leaveCount }}</p>
            <p class="text-xs text-gray-500">离职人数</p>
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
            placeholder="搜索员工姓名、工号..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.department" placeholder="全部部门" clearable class="w-full sm:w-36">
          <el-option label="全部部门" value="" />
          <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
        </el-select>
        <el-select v-model="filters.position" placeholder="全部岗位" clearable class="w-full sm:w-36">
          <el-option label="全部岗位" value="" />
          <el-option v-for="pos in positions" :key="pos" :label="pos" :value="pos" />
        </el-select>
        <el-select v-model="filters.status" placeholder="在职状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="在职" value="active" />
          <el-option label="离职" value="inactive" />
          <el-option label="试用期" value="trial" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮栏 -->
    <div class="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
      <div class="flex gap-2">
        <el-button v-if="!batchMode" type="primary" size="small" @click="openFormModal">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
        <el-button v-if="!batchMode" type="primary" size="small" @click="enterBatchMode">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button v-if="!batchMode" type="danger" size="small" @click="enterDeleteMode">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
        <el-button v-if="!batchMode" size="small" @click="enterExportMode">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </div>
      <div v-if="batchMode" class="flex items-center gap-2">
        <span class="text-sm text-gray-600">
          已选择 <strong class="text-emerald-600">{{ selectedRows.length }}</strong> 项
        </span>
        <el-button size="small" @click="cancelBatchMode">取消</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table
        ref="tableRef"
        :data="paginatedData"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="batchMode" type="selection" width="55" />
        <el-table-column prop="code" label="工号" min-width="100" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="position" label="岗位" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="joinDate" label="入职日期" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="!batchMode" label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="editRecord(row)">编辑</el-button>
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
    <el-dialog v-model="detailDialogVisible" title="员工详情" width="700px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工号">{{ currentRecord.code }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentRecord.gender }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentRecord.phone }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ currentRecord.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">{{ currentRecord.idCard }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="工号" prop="code">
          <el-input v-model="formData.code" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择部门">
            <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-select v-model="formData.position" placeholder="请选择岗位">
            <el-option v-for="pos in positions" :key="pos" :label="pos" :value="pos" />
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
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="在职" value="active" />
            <el-option label="试用期" value="trial" />
            <el-option label="离职" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { User, Search, Plus, Edit, Delete, Download, Document, CircleCheck, Clock } from '@element-plus/icons-vue'
import UserDelete from '@/components/icons/UserDelete.vue'
import { ElMessage } from 'element-plus'
import { } from 'element-plus'

// 部门列表
const departments = ['技术部', '运营部', '市场部', '财务部', '人力资源部']
// 岗位列表
const positions = ['经理', '主管', '专员', '技术员', '助理']

// 状态映射
const statusMap = {
  active: { label: '在职', type: 'success' },
  trial: { label: '试用期', type: 'warning' },
  inactive: { label: '离职', type: 'info' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 筛选条件
const filters = reactive({
  keyword: '',
  department: '',
  position: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 每页条数选项
const pageSizeOptions = [10, 20, 50]

// 批量操作模式
const batchMode = ref(false)
const selectedRows = ref([])
const tableRef = ref()

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 表单弹窗
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  id: null,
  code: '',
  name: '',
  gender: '男',
  phone: '',
  idCard: '',
  department: '',
  position: '',
  joinDate: '',
  status: 'active',
  remark: ''
})

const formRules = {
  code: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

// 模拟数据
const allData = ref([
  { id: 1, code: 'EMP001', name: '张三', gender: '男', phone: '13800138001', idCard: '110101199001011234', department: '技术部', position: '经理', joinDate: '2024-01-15', status: 'active', remark: '' },
  { id: 2, code: 'EMP002', name: '李四', gender: '女', phone: '13800138002', idCard: '110101199002022345', department: '运营部', position: '主管', joinDate: '2024-03-20', status: 'active', remark: '' },
  { id: 3, code: 'EMP003', name: '王五', gender: '男', phone: '13800138003', idCard: '110101199003033456', department: '市场部', position: '专员', joinDate: '2025-01-10', status: 'trial', remark: '' },
  { id: 4, code: 'EMP004', name: '赵六', gender: '女', phone: '13800138004', idCard: '110101199004044567', department: '财务部', position: '技术员', joinDate: '2023-06-01', status: 'active', remark: '' },
  { id: 5, code: 'EMP005', name: '钱七', gender: '男', phone: '13800138005', idCard: '110101199005055678', department: '人力资源部', position: '助理', joinDate: '2025-02-15', status: 'inactive', remark: '已离职' }
])

// 统计
const totalCount = computed(() => allData.value.length)
const activeCount = computed(() => allData.value.filter(r => r.status === 'active').length)
const trialCount = computed(() => allData.value.filter(r => r.status === 'trial').length)
const leaveCount = computed(() => allData.value.filter(r => r.status === 'inactive').length)

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.name.includes(filters.keyword) && !record.code.includes(filters.keyword)) return false
    if (filters.department && record.department !== filters.department) return false
    if (filters.position && record.position !== filters.position) return false
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
  filters.department = ''
  filters.position = ''
  filters.status = ''
  pagination.currentPage = 1
}

// 批量模式
const enterBatchMode = () => {
  batchMode.value = true
}

const enterDeleteMode = () => {
  batchMode.value = true
}

const enterExportMode = () => {
  batchMode.value = true
}

const cancelBatchMode = () => {
  batchMode.value = false
  selectedRows.value = []
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
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

// 编辑
const editRecord = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  formDialogVisible.value = true
}

// 新增
const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    code: '',
    name: '',
    gender: '男',
    phone: '',
    idCard: '',
    department: '',
    position: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    remark: ''
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
          allData.value[index] = { ...formData }
        }
        ElMessage.success('编辑成功')
      } else {
        allData.value.unshift({
          id: Date.now(),
          ...formData
        })
        ElMessage.success('新增成功')
      }
      formDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>
