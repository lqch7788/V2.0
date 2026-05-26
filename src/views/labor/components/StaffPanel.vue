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
          <h1 class="text-2xl font-bold text-gray-900">员工信息</h1>
          <p class="text-xs text-gray-500">员工信息管理与组织架构</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <el-icon :size="20" color="#2563eb"><Document /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-blue-700">{{ totalCount }}</p>
            <p class="text-xs text-blue-600">员工总数</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <el-icon :size="20" color="#16a34a"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-700">{{ activeCount }}</p>
            <p class="text-xs text-green-600">在职人数</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <el-icon :size="20" color="#d97706"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-amber-700">{{ trialCount }}</p>
            <p class="text-xs text-amber-600">试用期</p>
          </div>
        </div>
      </div>
      <div class="bg-red-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <el-icon :size="20" color="#dc2626"><UserDelete /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-red-700">{{ leaveCount }}</p>
            <p class="text-xs text-red-600">离职人数</p>
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
          <el-option v-for="item in DEPT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.position" placeholder="全部岗位" clearable class="w-full sm:w-36">
          <el-option label="全部岗位" value="" />
          <el-option v-for="pos in POSITIONS" :key="pos" :label="pos" :value="pos" />
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
        v-loading="loading"
        :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }"
        row-class-name="staff-table-row"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="batchMode" type="selection" width="55" />
        <el-table-column prop="code" label="工号" min-width="100" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="position" label="岗位" min-width="100" />
        <el-table-column prop="team" label="班组" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="joinDate" label="入职日期" min-width="120" />
        <el-table-column prop="skillLevel" label="技能等级" min-width="100" />
        <el-table-column prop="contractStatus" label="合同状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getContractStatusType(row.contractStatus)" size="small">
              {{ row.contractStatus || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="!batchMode" label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button size="small" :icon="View" circle @click="viewDetail(row)" />
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
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="700px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <!-- 基本信息 -->
        <el-divider content-position="left">
          <span class="text-sm font-semibold text-gray-700">基本信息</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工号" prop="code">
              <el-input v-model="formData.code" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>

        <!-- 工作信息 -->
        <el-divider content-position="left">
          <span class="text-sm font-semibold text-gray-700">工作信息</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="formData.department" placeholder="请选择部门">
                <el-option v-for="item in DEPT_OPTIONS.filter(d => d.value)" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="position">
              <el-select v-model="formData.position" placeholder="请选择岗位">
                <el-option v-for="pos in POSITIONS" :key="pos" :label="pos" :value="pos" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="班组" prop="team">
              <el-input v-model="formData.team" placeholder="请输入班组" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作业区域" prop="workArea">
              <el-input v-model="formData.workArea" placeholder="请输入作业区域" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="技能等级" prop="skillLevel">
              <el-select v-model="formData.skillLevel" placeholder="请选择技能等级">
                <el-option label="初级" value="初级" />
                <el-option label="中级" value="中级" />
                <el-option label="高级" value="高级" />
                <el-option label="技师" value="技师" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工资类型" prop="wageType">
              <el-select v-model="formData.wageType" placeholder="请选择工资类型">
                <el-option label="月薪" value="月薪" />
                <el-option label="日薪" value="日薪" />
                <el-option label="时薪" value="时薪" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="技能标签">
          <el-input v-model="formData.skillTags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="入职日期" prop="joinDate">
              <el-date-picker
                v-model="formData.joinDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option label="在职" value="active" />
                <el-option label="试用期" value="trial" />
                <el-option label="离职" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 紧急联系人 -->
        <el-divider content-position="left">
          <span class="text-sm font-semibold text-gray-700">紧急联系人</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="联系人姓名">
              <el-input v-model="formData.emergencyName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关系">
              <el-input v-model="formData.emergencyRelation" placeholder="如: 配偶" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="formData.emergencyPhone" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 合同信息 -->
        <el-divider content-position="left">
          <span class="text-sm font-semibold text-gray-700">合同信息</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="合同编号">
              <el-input v-model="formData.contractNo" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同类型">
              <el-select v-model="formData.contractType" placeholder="请选择合同类型">
                <el-option label="固定期限" value="固定期限" />
                <el-option label="无固定期限" value="无固定期限" />
                <el-option label="完成一定任务" value="完成一定任务" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="合同状态">
              <el-select v-model="formData.contractStatus" placeholder="请选择合同状态">
                <el-option label="生效中" value="生效中" />
                <el-option label="即将到期" value="即将到期" />
                <el-option label="已到期" value="已到期" />
                <el-option label="已终止" value="已终止" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同到期日">
              <el-date-picker
                v-model="formData.contractEndDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 教育信息 -->
        <el-divider content-position="left">
          <span class="text-sm font-semibold text-gray-700">教育信息</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="学历">
              <el-select v-model="formData.education" placeholder="请选择学历">
                <el-option label="初中" value="初中" />
                <el-option label="高中" value="高中" />
                <el-option label="中专" value="中专" />
                <el-option label="大专" value="大专" />
                <el-option label="本科" value="本科" />
                <el-option label="硕士" value="硕士" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="毕业院校">
              <el-input v-model="formData.graduatedSchool" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="专业">
              <el-input v-model="formData.major" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
        </el-row>

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
import { ref, computed, reactive, onMounted } from 'vue'
import { User, Search, Plus, Edit, Delete, Download, Document, CircleCheck, Clock, View } from '@element-plus/icons-vue'
import UserDelete from '@/components/icons/UserDelete.vue'
import { ElMessage } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { DEPT_OPTIONS, POSITIONS } from '@/data/laborData'

const laborStore = useLaborStore()

// 部门/岗位列表 - 从配置获取
const departments = computed(() => DEPT_OPTIONS.filter(d => d.value).map(d => ({ dictLabel: d.label, value: d.value })))
const positionOptions = computed(() => POSITIONS.map(p => ({ dictLabel: p, value: p })))

// 状态映射
const statusMap = {
  active: { label: '在职', type: 'success' },
  trial: { label: '试用期', type: 'warning' },
  inactive: { label: '离职', type: 'info' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'
// 合同状态标签类型映射
const getContractStatusType = (status) => {
  const map = { '生效中': 'success', '即将到期': 'warning', '已到期': 'danger', '已终止': 'info' }
  return map[status] || 'info'
}

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
  team: '',
  workArea: '',
  skillLevel: '',
  wageType: '',
  skillTags: '',
  joinDate: '',
  status: 'active',
  // 紧急联系人
  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',
  // 合同信息
  contractNo: '',
  contractType: '',
  contractStatus: '',
  contractEndDate: '',
  // 教育信息
  education: '',
  graduatedSchool: '',
  major: '',
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

// 员工数据 - 从Store获取
const allData = computed(() => (laborStore.workerList || []).map(w => ({
  id: w.id || w.oid,
  oid: w.oid,
  code: w.code || w.workerId || '',
  name: w.name || w.workerName || '',
  gender: w.gender || '男',
  phone: w.phone || w.mobile || '',
  idCard: w.idCard || w.id_card || '',
  department: w.department || w.departmentName || '',
  position: w.position || w.positionName || '',
  joinDate: w.joinDate || w.join_date || '',
  status: w.status || 'active',
  remark: w.remark || ''
})))
const loading = ref(false)
const error = ref('')

// 加载员工数据
const loadWorkers = async () => {
  loading.value = true
  error.value = null
  try {
    await laborStore.fetchWorkers()
  } catch (err) {
    error.value = err.message || '加载员工数据失败'
    console.error('[StaffPanel] 加载员工数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => { loadWorkers() })

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
    team: '',
    workArea: '',
    skillLevel: '',
    wageType: '',
    skillTags: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    contractNo: '',
    contractType: '',
    contractStatus: '',
    contractEndDate: '',
    education: '',
    graduatedSchool: '',
    major: '',
    remark: ''
  })
  formDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = {
          name: formData.name, code: formData.code, gender: formData.gender,
          phone: formData.phone, idCard: formData.idCard,
          department: formData.department, position: formData.position,
          team: formData.team, workArea: formData.workArea,
          skillLevel: formData.skillLevel, wageType: formData.wageType, skillTags: formData.skillTags,
          joinDate: formData.joinDate, status: formData.status,
          emergencyName: formData.emergencyName, emergencyRelation: formData.emergencyRelation,
          emergencyPhone: formData.emergencyPhone,
          contractNo: formData.contractNo, contractType: formData.contractType,
          contractStatus: formData.contractStatus, contractEndDate: formData.contractEndDate,
          education: formData.education, graduatedSchool: formData.graduatedSchool, major: formData.major,
          remark: formData.remark
        }
        if (isEdit.value) {
          await laborStore.updateWorker(formData.id, payload)
          ElMessage.success('编辑成功')
        } else {
          await laborStore.createWorker(payload)
          ElMessage.success('新增成功')
        }
        formDialogVisible.value = false
        loadWorkers()
      } catch (err) {
        console.error('[StaffPanel] 保存失败:', err)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 删除记录
const handleDelete = async (row) => {
  try {
    await laborStore.deleteWorker(row.id)
    ElMessage.success('删除成功')
    loadWorkers()
  } catch (err) {
    console.error('[StaffPanel] 删除失败:', err)
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
:deep(.staff-table-row:hover > td) {
  background-color: #dbeafe !important; /* blue-100 */
  cursor: pointer;
}
</style>
