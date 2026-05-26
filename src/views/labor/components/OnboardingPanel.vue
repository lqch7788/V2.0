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
            <h1 class="text-2xl font-bold text-gray-900">入职办理</h1>
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
          <el-option v-for="item in ONBOARDING_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-button v-if="!batchMode" size="small" type="primary" @click="enterBatchEdit">
            <el-icon><Edit /></el-icon> 批量编辑
          </el-button>
          <el-button v-if="!batchMode" size="small" type="danger" @click="enterBatchDelete">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
          <el-button v-if="!batchMode" size="small" @click="handleExport">
            <el-icon><Download /></el-icon> 导出
          </el-button>
          <template v-if="batchMode">
            <el-button size="small" type="success" @click="confirmBatch">确认({{ selectedIds.length }})</el-button>
            <el-button size="small" @click="cancelBatch">取消</el-button>
          </template>
        </div>
      </div>

      <el-table v-loading="loading" :data="paginatedData" stripe :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }" @selection-change="handleSelectionChange">
        <el-table-column v-if="batchMode" type="selection" width="50" />
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button size="small" :icon="View" circle @click="viewDetail(row)" />
            </el-tooltip>
            <el-tooltip v-if="row.status === '待入职'" content="开始办理" placement="top">
              <el-button size="small" :icon="VideoPlay" circle type="primary" @click="startProcess(row)" />
            </el-tooltip>
            <el-tooltip v-if="row.status === '办理中'" content="完成入职" placement="top">
              <el-button size="small" :icon="Check" circle type="success" @click="completeOnboarding(row)" />
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
        <!-- 劳务合同 → 日工资 -->
        <el-form-item v-if="formData.contractType === '劳务合同'" label="日工资" prop="dailyWage">
          <el-input-number v-model="formData.dailyWage" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <!-- 实习协议 → 时工资 -->
        <el-form-item v-if="formData.contractType === '实习协议'" label="时工资" prop="hourlyWage">
          <el-input-number v-model="formData.hourlyWage" :min="0" :precision="2" style="width: 100%" />
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
import { CirclePlus, Search, Plus, Edit, Delete, Download, Clock, Warning, CircleCheck, View, VideoPlay, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { ONBOARDING_STATUS_OPTIONS, DEPT_OPTIONS, CONTRACT_TYPE_OPTIONS } from '@/data/laborData'
import { useExport } from '@/composables/useExport'

const laborStore = useLaborStore()
const { exportWithFormatSelect } = useExport({ fileName: '入职办理' })

// 加载状态
const loading = ref(false)

// 状态映射
const statusMap = {
  '待入职': { label: '待入职', type: 'warning' },
  '办理中': { label: '办理中', type: 'primary' },
  '已完成': { label: '已完成', type: 'success' },
  '已入职': { label: '已入职', type: 'success' },
  '已取消': { label: '已取消', type: 'info' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status || '待入职'
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
  joinDate: new Date().toISOString().split('T')[0],
  dailyWage: 0,
  hourlyWage: 0
})

// 批量操作状态
const batchMode = ref(false)
const batchType = ref('') // 'edit' | 'delete' | 'export'
const selectedRows = ref([])
const selectedIds = computed(() => selectedRows.value.map(r => r.id))

// 导出配置
const exportModalVisible = ref(false)
const exportFormat = ref('excel')
const exportColumns = [
  { key: 'name', label: '姓名' },
  { key: 'phone', label: '手机号' },
  { key: 'idCard', label: '身份证号' },
  { key: 'position', label: '岗位' },
  { key: 'department', label: '部门' },
  { key: 'status', label: '状态' },
  { key: 'expectedDate', label: '期望入职日期' }
]

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const enterBatchEdit = () => {
  batchMode.value = true
  batchType.value = 'edit'
}

const enterBatchDelete = () => {
  batchMode.value = true
  batchType.value = 'delete'
}

const handleExport = () => {
  batchMode.value = true
  batchType.value = 'export'
}

const confirmBatch = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  try {
    if (batchType.value === 'delete') {
      await ElMessageBox.confirm(`确定删除${selectedIds.value.length}条记录？`, '批量删除', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      })
      for (const id of selectedIds.value) {
        await laborStore.deleteOnboarding(id)
      }
      ElMessage.success(`已删除${selectedIds.value.length}条记录`)
    } else if (batchType.value === 'export') {
      exportWithFormatSelect(selectedRows.value, exportColumns, exportFormat.value)
      ElMessage.success('导出成功')
    }
    cancelBatch()
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量操作失败:', e)
      ElMessage.error('操作失败')
    }
  }
}

const cancelBatch = () => {
  batchMode.value = false
  batchType.value = ''
  selectedRows.value = []
}

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

// 入职数据 - 从Store获取
const allData = computed(() => laborStore.onboardingList || [])

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status) params.status = filters.status
    await laborStore.fetchOnboardingList(params)
  } catch (error) {
    console.error('[OnboardingPanel] 加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 统计
const statusCounts = computed(() => {
  const counts = { pending: 0, processing: 0, completed: 0 }
  allData.value.forEach(r => {
    const status = r.status
    if (status === '待入职') counts.pending++
    else if (status === '办理中') counts.processing++
    else if (status === '已入职' || status === '已完成') counts.completed++
  })
  return counts
})

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.name?.includes(filters.keyword) && !record.idCard?.includes(filters.keyword) && !record.phone?.includes(filters.keyword)) return false
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
  loadData()
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.status = ''
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

// 开始办理（V1.1无需确认，直接执行）
const startProcess = async (row) => {
  try {
    await laborStore.updateOnboardingStatus(row.id, { status: '办理中' })
    ElMessage.success('已开始办理入职')
    loadData()
  } catch (error) {
    console.error('[OnboardingPanel] 开始办理失败:', error)
    ElMessage.error('操作失败')
  }
}

// 完成入职
const completeOnboarding = async (row) => {
  try {
    await ElMessageBox.confirm('确定要完成入职办理吗？这将创建员工档案。', '确认完成', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.updateOnboardingStatus(row.id, { status: '已入职' })
    ElMessage.success('入职办理已完成')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[OnboardingPanel] 完成入职失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 新增
const openFormModal = () => {
  Object.assign(formData, {
    name: '', phone: '', idCard: '', position: '', department: '',
    contractType: '劳动合同',
    joinDate: new Date().toISOString().split('T')[0],
    dailyWage: 0,
    hourlyWage: 0
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
          name: formData.name, phone: formData.phone, idCard: formData.idCard,
          position: formData.position, department: formData.department,
          contractType: formData.contractType, joinDate: formData.joinDate
        }
        if (formData.contractType === '劳务合同') payload.dailyWage = formData.dailyWage
        if (formData.contractType === '实习协议') payload.hourlyWage = formData.hourlyWage
        await laborStore.createOnboarding(payload)
        ElMessage.success('入职登记成功')
        formDialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('[OnboardingPanel] 创建失败:', error)
        ElMessage.error('创建失败')
      }
    }
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 继承全局样式 */
</style>
