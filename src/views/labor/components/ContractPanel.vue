<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Document />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">合同管理</h1>
          <p class="text-xs text-gray-500">员工合同签订与续签管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-green-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-green-700 font-medium">生效</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ statusCounts.normal }}</p>
      </div>
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-amber-700 font-medium">即将到期</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.expiring }}</p>
      </div>
      <div class="bg-red-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-red-700 font-medium">已到期</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{{ statusCounts.expired }}</p>
      </div>
      <div class="bg-gray-100 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-700 font-medium">已终止</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ statusCounts.terminated }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索员工姓名、合同编号..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.status" placeholder="合同状态" clearable class="w-full sm:w-32">
          <el-option v-for="item in CONTRACT_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.contractType" placeholder="合同类型" clearable class="w-full sm:w-32">
          <el-option label="全部类型" value="" />
          <el-option v-for="item in CONTRACT_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="bg-white rounded-xl p-3 shadow-sm flex items-center justify-end gap-2">
      <el-button size="small" @click="handleExportClick">
        <el-icon><Download /></el-icon> 导出
      </el-button>
      <el-button type="primary" size="small" @click="openFormModal">
        <el-icon><Plus /></el-icon> 新建合同
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe v-loading="loading">
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无合同数据' }}</p>
          </div>
        </template>
        <el-table-column prop="contractNo" label="合同编号" min-width="150" />
        <el-table-column prop="employeeName" label="员工姓名" min-width="100" />
        <el-table-column prop="contractType" label="合同类型" min-width="100" />
        <el-table-column prop="startDate" label="开始日期" min-width="120" />
        <el-table-column prop="endDate" label="结束日期" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button size="small" :icon="View" circle @click="viewDetail(row)" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button size="small" :icon="Edit" circle type="primary" @click="editRecord(row)" />
            </el-tooltip>
            <el-tooltip v-if="row.status === '即将到期'" content="续签" placement="top">
              <el-button size="small" :icon="Refresh" circle type="warning" @click="renewContractAction(row)" />
            </el-tooltip>
            <el-tooltip content="下载" placement="top">
              <el-button size="small" :icon="Download" circle type="info" @click="downloadContract(row)" />
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="合同详情" width="700px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="合同编号">{{ currentRecord.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="合同类型">{{ currentRecord.contractType }}</el-descriptions-item>
          <el-descriptions-item label="员工姓名">{{ currentRecord.employeeName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentRecord.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentRecord.endDate }}</el-descriptions-item>
          <el-descriptions-item label="合同金额">{{ currentRecord.amount }} 元</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ currentRecord.signDate }}</el-descriptions-item>
          <el-descriptions-item label="归档编号">{{ currentRecord.archiveNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑合同' : '新建合同'" width="550px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="合同编号" prop="contractNo">
          <el-input v-model="formData.contractNo" placeholder="请输入合同编号" />
        </el-form-item>
        <el-form-item label="员工姓名" prop="employeeName">
          <el-input v-model="formData.employeeName" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="formData.contractType" placeholder="请选择合同类型" @change="onContractTypeChange">
            <el-option v-for="item in CONTRACT_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="签订日期">
          <el-date-picker
            v-model="formData.signDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <!-- 按合同类型显示条件工资字段 -->
        <el-form-item v-if="showMonthlyWage" label="月薪">
          <el-input-number v-model="formData.monthlyWage" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="showDailyWage" label="日工资">
          <el-input-number v-model="formData.dailyWage" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="showHourlyWage" label="时工资">
          <el-input-number v-model="formData.hourlyWage" :min="0" :precision="2" style="width: 100%" />
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
import { ref, computed, reactive, onMounted } from 'vue'
import { Document, Search, Plus, Download, View, Edit, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'
import { CONTRACT_TYPE_OPTIONS, CONTRACT_STATUS_OPTIONS } from '@/data/laborData'

// Labor Store
const laborStore = useLaborStore()
const { exportWithFormatSelect } = useExport({ fileName: '合同数据' })

// 合同导出列配置
const contractExportColumns = [
  { key: 'contractNo', label: '合同编号' },
  { key: 'employeeName', label: '员工姓名' },
  { key: 'contractType', label: '合同类型' },
  { key: 'startDate', label: '开始日期' },
  { key: 'endDate', label: '结束日期' },
  { key: 'status', label: '状态' }
]

// 加载/错误状态
const loading = ref(false)
const error = ref('')

// 状态映射（中文状态值）
const statusMap = {
  '生效': { label: '生效', type: 'success' },
  '即将到期': { label: '即将到期', type: 'warning' },
  '已到期': { label: '已到期', type: 'danger' },
  '已终止': { label: '已终止', type: 'info' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 筛选条件
const filters = reactive({
  keyword: '',
  status: '',
  contractType: ''
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
  id: null,
  contractNo: '',
  employeeName: '',
  idCard: '',
  department: '',
  contractType: '固定期限',
  signDate: '',
  startDate: '',
  endDate: '',
  monthlyWage: 0,
  dailyWage: 0,
  hourlyWage: 0,
  remark: ''
})

// 条件工资字段显隐逻辑
const showMonthlyWage = computed(() => formData.contractType === '固定期限')
const showDailyWage = computed(() => formData.contractType === '劳务合同')
const showHourlyWage = computed(() => formData.contractType === '实习协议')

// 切换合同类型时重置工资字段
const onContractTypeChange = () => {
  formData.monthlyWage = 0
  formData.dailyWage = 0
  formData.hourlyWage = 0
}

const formRules = {
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  employeeName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
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
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status) params.status = filters.status
    if (filters.contractType) params.contractType = filters.contractType
    await laborStore.fetchContractList(params)
    allData.value = laborStore.contractList
    pagination.total = laborStore.contractTotal
  } catch (e) {
    error.value = '加载合同数据失败，请稍后重试'
    ElMessage.error('加载合同数据失败')
  } finally {
    loading.value = false
  }
}

// 统计
const statusCounts = computed(() => ({
  normal: allData.value.filter(r => r.status === '生效').length,
  expiring: allData.value.filter(r => r.status === '即将到期').length,
  expired: allData.value.filter(r => r.status === '已到期').length,
  terminated: allData.value.filter(r => r.status === '已终止').length
}))

// 筛选后的数据
const filteredData = computed(() => allData.value)

// 分页数据
const paginatedData = computed(() => allData.value)

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.status = ''
  filters.contractType = ''
  pagination.currentPage = 1
  loadData()
}

// 分页
const handlePageSizeChange = () => {
  pagination.currentPage = 1
  loadData()
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
    contractNo: '',
    employeeName: '',
    idCard: '',
    department: '',
    contractType: '固定期限',
    signDate: '',
    startDate: '',
    endDate: '',
    monthlyWage: 0,
    dailyWage: 0,
    hourlyWage: 0,
    remark: ''
  })
  formDialogVisible.value = true
}

// 续签
const renewContractAction = async (row) => {
  try {
    await laborStore.renewContract(row.id, { ...row })
    ElMessage.success('续签成功')
    loadData()
  } catch (e) {
    ElMessage.error('续签失败')
  }
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
  exportWithFormatSelect(allData.value, contractExportColumns, exportFormat.value, `合同数据_${new Date().toISOString().slice(0, 10)}`)
  exportModalVisible.value = false
}

// 下载合同信息 - 生成文本摘要文件并触发下载
const downloadContract = (row) => {
  const content = [
    '========================================',
    '           合同信息',
    '========================================',
    `合同编号：${row.contractNo || '-'}`,
    `合同类型：${row.contractType || '-'}`,
    `员工姓名：${row.employeeName || '-'}`,
    `部门：${row.department || '-'}`,
    `开始日期：${row.startDate || '-'}`,
    `结束日期：${row.endDate || '-'}`,
    `合同金额：${row.amount || 0} 元`,
    `签订日期：${row.signDate || '-'}`,
    `归档编号：${row.archiveNo || '-'}`,
    `状态：${getStatusLabel(row.status)}`,
    `备注：${row.remark || '-'}`,
    '========================================',
    `导出时间：${new Date().toLocaleString('zh-CN')}`
  ].join('\n')
  const blob = new Blob(['﻿' + content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${row.employeeName}_${row.contractNo}_合同信息.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('下载成功')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = {
          contractNo: formData.contractNo,
          employeeName: formData.employeeName,
          idCard: formData.idCard,
          department: formData.department,
          contractType: formData.contractType,
          signDate: formData.signDate || new Date().toISOString().split('T')[0],
          startDate: formData.startDate,
          endDate: formData.endDate,
          monthlyWage: formData.monthlyWage,
          dailyWage: formData.dailyWage,
          hourlyWage: formData.hourlyWage,
          remark: formData.remark
        }
        if (isEdit.value) {
          await laborStore.updateContract(formData.id, payload)
          ElMessage.success('编辑成功')
        } else {
          await laborStore.createContract({
            ...payload,
            status: '生效',
            archiveNo: ''
          })
          ElMessage.success('创建成功')
        }
        formDialogVisible.value = false
        loadData()
      } catch (e) {
        ElMessage.error(isEdit.value ? '编辑失败' : '创建失败')
      }
    }
  })
}

onMounted(() => { loadData() })
</script>

<style scoped>
/* 继承全局样式 */
</style>
