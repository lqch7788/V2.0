<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Medal />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">技能档案</h1>
          <p class="text-xs text-gray-500">员工技能证书与培训记录</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">技能证书</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ totalCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">有效证书</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ validCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">即将过期</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ expiringCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">已过期</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{{ expiredCount }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索员工姓名、证书名称..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.skillType" placeholder="技能类别" clearable class="w-full sm:w-36">
          <el-option label="全部类别" value="" />
          <el-option label="农业技能" value="agriculture" />
          <el-option label="安全证书" value="safety" />
          <el-option label="操作证书" value="operation" />
          <el-option label="管理证书" value="management" />
        </el-select>
        <el-select v-model="filters.status" placeholder="证书状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="有效" value="valid" />
          <el-option label="即将过期" value="expiring" />
          <el-option label="已过期" value="expired" />
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
        <el-icon><Plus /></el-icon> 添加证书
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="employeeName" label="员工姓名" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="skillName" label="证书名称" min-width="150" />
        <el-table-column prop="skillType" label="技能类别" min-width="100">
          <template #default="{ row }">
            {{ getSkillTypeLabel(row.skillType) }}
          </template>
        </el-table-column>
        <el-table-column prop="issueDate" label="发证日期" min-width="120" />
        <el-table-column prop="expireDate" label="到期日期" min-width="120" />
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
            <el-button link type="warning" size="small" @click="renewSkill(row)">续期</el-button>
            <el-button link type="info" size="small" @click="downloadCert(row)">下载</el-button>
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
    <el-dialog v-model="detailDialogVisible" title="技能详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="员工姓名">{{ currentRecord.employeeName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="证书名称">{{ currentRecord.skillName }}</el-descriptions-item>
          <el-descriptions-item label="技能类别">{{ getSkillTypeLabel(currentRecord.skillType) }}</el-descriptions-item>
          <el-descriptions-item label="发证日期">{{ currentRecord.issueDate }}</el-descriptions-item>
          <el-descriptions-item label="到期日期">{{ currentRecord.expireDate }}</el-descriptions-item>
          <el-descriptions-item label="证书编号">{{ currentRecord.certNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="颁发机构" :span="2">{{ currentRecord.issuer }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增弹窗 -->
    <el-dialog v-model="formDialogVisible" title="添加技能证书" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="员工姓名" prop="employeeName">
          <el-input v-model="formData.employeeName" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="证书名称" prop="skillName">
          <el-input v-model="formData.skillName" placeholder="请输入证书名称" />
        </el-form-item>
        <el-form-item label="技能类别" prop="skillType">
          <el-select v-model="formData.skillType" placeholder="请选择技能类别">
            <el-option label="农业技能" value="agriculture" />
            <el-option label="安全证书" value="safety" />
            <el-option label="操作证书" value="operation" />
            <el-option label="管理证书" value="management" />
          </el-select>
        </el-form-item>
        <el-form-item label="证书编号" prop="certNo">
          <el-input v-model="formData.certNo" placeholder="请输入证书编号" />
        </el-form-item>
        <el-form-item label="颁发机构" prop="issuer">
          <el-input v-model="formData.issuer" placeholder="请输入颁发机构" />
        </el-form-item>
        <el-form-item label="发证日期" prop="issueDate">
          <el-date-picker
            v-model="formData.issueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="到期日期" prop="expireDate">
          <el-date-picker
            v-model="formData.expireDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { Medal, Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { } from 'element-plus'

// 技能类别映射
const skillTypeMap = {
  agriculture: '农业技能',
  safety: '安全证书',
  operation: '操作证书',
  management: '管理证书'
}

const getSkillTypeLabel = (type) => skillTypeMap[type] || type

// 状态映射
const statusMap = {
  valid: { label: '有效', type: 'success' },
  expiring: { label: '即将过期', type: 'warning' },
  expired: { label: '已过期', type: 'danger' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 筛选条件
const filters = reactive({
  keyword: '',
  skillType: '',
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
  employeeName: '',
  department: '',
  skillName: '',
  skillType: 'agriculture',
  certNo: '',
  issuer: '',
  issueDate: '',
  expireDate: '',
  remark: ''
})

const formRules = {
  employeeName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  skillName: [{ required: true, message: '请输入证书名称', trigger: 'blur' }],
  skillType: [{ required: true, message: '请选择技能类别', trigger: 'change' }],
  certNo: [{ required: true, message: '请输入证书编号', trigger: 'blur' }],
  issuer: [{ required: true, message: '请输入颁发机构', trigger: 'blur' }],
  issueDate: [{ required: true, message: '请选择发证日期', trigger: 'change' }],
  expireDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

// 模拟数据
const allData = ref([
  { id, employeeName: '张三', department: '技术部', skillName: '农艺师资格证', skillType: 'agriculture', certNo: 'NY-2024-001', issuer: '农业部', issueDate: '2024-01-15', expireDate: '2027-01-14', status: 'valid', remark: '' },
  { id, employeeName: '李四', department: '运营部', skillName: '安全生产证书', skillType: 'safety', certNo: 'AQ-2024-002', issuer: '安监局', issueDate: '2024-03-20', expireDate: '2026-06-19', status: 'expiring', remark: '即将到期' },
  { id, employeeName: '王五', department: '生产部', skillName: '特种作业操作证', skillType: 'operation', certNo: 'TS-2023-003', issuer: '人社局', issueDate: '2023-06-01', expireDate: '2026-05-31', status: 'expired', remark: '已过期' },
  { id, employeeName: '赵六', department: '技术部', skillName: '农业技术员证', skillType: 'agriculture', certNo: 'NY-2025-001', issuer: '农业部', issueDate: '2025-01-10', expireDate: '2028-01-09', status: 'valid', remark: '' }
])

// 统计
const totalCount = computed(() => allData.value.length)
const validCount = computed(() => allData.value.filter(r => r.status === 'valid').length)
const expiringCount = computed(() => allData.value.filter(r => r.status === 'expiring').length)
const expiredCount = computed(() => allData.value.filter(r => r.status === 'expired').length)

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.employeeName.includes(filters.keyword) && !record.skillName.includes(filters.keyword)) return false
    if (filters.skillType && record.skillType !== filters.skillType) return false
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
  filters.skillType = ''
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

// 续期
const renewSkill = (row) => {
  ElMessage.info('续期功能开发中')
}

// 下载
const downloadCert = (row) => {
  ElMessage.info('下载功能开发中')
}

// 新增
const openFormModal = () => {
  Object.assign(formData, {
    employeeName: '',
    department: '',
    skillName: '',
    skillType: 'agriculture',
    certNo: '',
    issuer: '',
    issueDate: '',
    expireDate: '',
    remark: ''
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
        status: 'valid'
      })
      ElMessage.success('添加成功')
      formDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>
