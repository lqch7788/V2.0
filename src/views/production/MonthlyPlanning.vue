<template>
  <div class="space-y-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <Calendar />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">月计划</h1>
          <p class="text-gray-500">管理月度生产计划</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">本月计划</p>
            <p class="text-2xl font-bold text-gray-900">{{ currentMonthPlans.length }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <el-icon :size="24" color="#a855f7">
              <Calendar />
            </el-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-emerald-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">已完成</p>
            <p class="text-2xl font-bold text-gray-900">{{ completedCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <el-icon :size="24" color="#10b981">
              <CircleCheck />
            </el-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">进行中</p>
            <p class="text-2xl font-bold text-gray-900">{{ inProgressCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" color="#3b82f6">
              <Loading />
            </el-icon>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">待执行</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <el-icon :size="24" color="#f97316">
              <Clock />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 月份选择 -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">计划月份</label>
          <el-date-picker
            v-model="filterMonth"
            type="month"
            placeholder="请选择月份"
            value-format="YYYY-MM"
            style="width: 100%"
            @change="handleFilterChange"
          />
        </div>

        <!-- 状态筛选 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">状态</label>
          <el-select
            v-model="filterStatus"
            placeholder="请选择状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option value="draft" label="草稿" />
            <el-option value="pending" label="待审批" />
            <el-option value="approved" label="已审批" />
            <el-option value="in_progress" label="进行中" />
            <el-option value="completed" label="已完成" />
            <el-option value="cancelled" label="已取消" />
          </el-select>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">月计划列表</h3>
      <div class="flex gap-2">
        <el-button v-if="canCreate" type="primary" @click="handleOpenAddModal">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button v-if="canExport" type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <el-table :data="paginatedData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />

        <el-table-column prop="planCode" label="计划编号" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">
              {{ row.planCode }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="planMonth" label="计划月份" width="120" />

        <el-table-column prop="cropName" label="作物名称" width="120" />

        <el-table-column prop="planType" label="计划类型" width="100">
          <template #default="{ row }">
            <span>{{ getPlanTypeName(row.planType) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="targetArea" label="目标面积" width="100">
          <template #default="{ row }">
            {{ row.targetArea }} m²
          </template>
        </el-table-column>

        <el-table-column prop="targetYield" label="目标产量" width="100">
          <template #default="{ row }">
            {{ row.targetYield }} {{ row.unit || 'kg' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="publisher" label="发布人" width="100" />

        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button link type="primary" size="small" @click="handleDetail(row)">
                详情
              </el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteRow(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">共 {{ filteredData.length }} 条</span>
        </div>
        <div class="flex items-center gap-2">
          <el-button
            :disabled="currentPage === 1"
            size="small"
            @click="handlePageChange(currentPage - 1)"
          >
            上一页
          </el-button>
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <el-button
            :disabled="currentPage >= totalPages"
            size="small"
            @click="handlePageChange(currentPage + 1)"
          >
            下一页
          </el-button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailModalVisible"
      title="月计划详情"
      width="600px"
    >
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="计划编号">{{ currentRecord.planCode }}</el-descriptions-item>
          <el-descriptions-item label="计划月份">{{ currentRecord.planMonth }}</el-descriptions-item>
          <el-descriptions-item label="作物名称">{{ currentRecord.cropName }}</el-descriptions-item>
          <el-descriptions-item label="计划类型">{{ getPlanTypeName(currentRecord.planType) }}</el-descriptions-item>
          <el-descriptions-item label="目标面积">{{ currentRecord.targetArea }} m²</el-descriptions-item>
          <el-descriptions-item label="目标产量">{{ currentRecord.targetYield }} {{ currentRecord.unit || 'kg' }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentRecord.responsiblePerson }}</el-descriptions-item>
          <el-descriptions-item label="发布人">{{ currentRecord.publisher }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusName(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editModalVisible"
      title="编辑月计划"
      width="600px"
    >
      <div v-if="currentRecord" class="space-y-4">
        <el-form :model="editForm" label-width="100px">
          <el-form-item label="计划类型">
            <el-select v-model="editForm.planType" placeholder="请选择计划类型">
              <el-option value="planting" label="种植计划" />
              <el-option value="seedling" label="育苗计划" />
              <el-option value="harvest" label="采收计划" />
              <el-option value="other" label="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="目标面积">
            <el-input-number v-model="editForm.targetArea" :min="0" />
          </el-form-item>
          <el-form-item label="目标产量">
            <el-input-number v-model="editForm.targetYield" :min="0" />
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="editForm.responsiblePerson" placeholder="请输入负责人" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="editForm.status" placeholder="请选择状态">
              <el-option value="draft" label="草稿" />
              <el-option value="pending" label="待审批" />
              <el-option value="approved" label="已审批" />
              <el-option value="in_progress" label="进行中" />
              <el-option value="completed" label="已完成" />
              <el-option value="cancelled" label="已取消" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="editForm.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="editModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增弹窗 -->
    <el-dialog
      v-model="addModalVisible"
      title="新增月计划"
      width="600px"
    >
      <div class="space-y-4">
        <el-form :model="addForm" label-width="100px">
          <el-form-item label="计划月份" required>
            <el-date-picker
              v-model="addForm.planMonth"
              type="month"
              placeholder="请选择月份"
              value-format="YYYY-MM"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="作物名称" required>
            <el-input v-model="addForm.cropName" placeholder="请输入作物名称" />
          </el-form-item>
          <el-form-item label="计划类型" required>
            <el-select v-model="addForm.planType" placeholder="请选择计划类型">
              <el-option value="planting" label="种植计划" />
              <el-option value="seedling" label="育苗计划" />
              <el-option value="harvest" label="采收计划" />
              <el-option value="other" label="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="目标面积">
            <el-input-number v-model="addForm.targetArea" :min="0" />
          </el-form-item>
          <el-form-item label="目标产量">
            <el-input-number v-model="addForm.targetYield" :min="0" />
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="addForm.responsiblePerson" placeholder="请输入负责人" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="addForm.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式弹窗 -->
    <ExportFormatModal
      v-model:visible="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @change="exportFormat = $event"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Search, Plus, Download, CircleCheck, Loading, Clock } from '@element-plus/icons-vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import dayjs from 'dayjs'

// 权限控制
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)

// 统计数据
const monthlyPlans = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])

// 筛选状态
const filterMonth = ref('')
const filterStatus = ref('')

// 弹窗状态
const detailModalVisible = ref(false)
const editModalVisible = ref(false)
const addModalVisible = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const currentRecord = ref(null)

// 编辑表单
const editForm = reactive({
  planType: '',
  targetArea: 0,
  targetYield: 0,
  responsiblePerson: '',
  status: '',
  remarks: ''
})

// 新增表单
const addForm = reactive({
  planMonth: '',
  cropName: '',
  planType: '',
  targetArea: 0,
  targetYield: 0,
  responsiblePerson: '',
  remarks: ''
})

// 从localStorage加载数据
const loadData = () => {
  const stored = localStorage.getItem('monthlyPlans')
  if (stored) {
    monthlyPlans.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    monthlyPlans.value = [
      {
        id: 'MP001',
        planCode: `YJH${dayjs().format('YYYYMM')}01`,
        planMonth: dayjs().format('YYYY-MM'),
        cropName: '番茄',
        planType: 'planting',
        targetArea: 1000,
        targetYield: 5000,
        unit: 'kg',
        responsiblePerson: '张三',
        publisher: '管理员',
        status: 'approved',
        remarks: '计划在春季种植'
      },
      {
        id: 'MP002',
        planCode: `YJH${dayjs().format('YYYYMM')}02`,
        planMonth: dayjs().format('YYYY-MM'),
        cropName: '黄瓜',
        planType: 'planting',
        targetArea: 800,
        targetYield: 4000,
        unit: 'kg',
        responsiblePerson: '李四',
        publisher: '管理员',
        status: 'in_progress',
        remarks: ''
      },
      {
        id: 'MP003',
        planCode: `YJH${dayjs().subtract(1, 'month').format('YYYYMM')}01`,
        planMonth: dayjs().subtract(1, 'month').format('YYYY-MM'),
        cropName: '茄子',
        planType: 'harvest',
        targetArea: 500,
        targetYield: 2500,
        unit: 'kg',
        responsiblePerson: '王五',
        publisher: '管理员',
        status: 'completed',
        remarks: '已完成采收'
      }
    ]
    saveData()
  }
}

// 保存数据到localStorage
const saveData = () => {
  localStorage.setItem('monthlyPlans', JSON.stringify(monthlyPlans.value))
}

// 本月计划
const currentMonthPlans = computed(() => {
  const currentMonth = dayjs().format('YYYY-MM')
  return monthlyPlans.value.filter(p => p.planMonth === currentMonth)
})

// 已完成数量
const completedCount = computed(() => {
  return monthlyPlans.value.filter(p => p.status === 'completed').length
})

// 进行中数量
const inProgressCount = computed(() => {
  return monthlyPlans.value.filter(p => p.status === 'in_progress').length
})

// 待执行数量
const pendingCount = computed(() => {
  return monthlyPlans.value.filter(p => p.status === 'pending' || p.status === 'approved').length
})

// 筛选后的数据
const filteredData = computed(() => {
  return monthlyPlans.value.filter(item => {
    if (filterMonth.value && item.planMonth !== filterMonth.value) return false
    if (filterStatus.value && item.status !== filterStatus.value) return false
    return true
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

// 状态名称映射
const getStatusName = (status) => {
  const statusMap = {
    draft: '草稿',
    pending: '待审批',
    approved: '已审批',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 计划类型名称映射
const getPlanTypeName = (type) => {
  const typeMap = {
    planting: '种植计划',
    seedling: '育苗计划',
    harvest: '采收计划',
    other: '其他'
  }
  return typeMap[type] || type
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterMonth.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handlePageChange = (page) => {
  currentPage.value = page
}

// 打开新增弹窗
const handleOpenAddModal = () => {
  Object.assign(addForm, {
    planMonth: dayjs().format('YYYY-MM'),
    cropName: '',
    planType: '',
    targetArea: 0,
    targetYield: 0,
    responsiblePerson: '',
    remarks: ''
  })
  addModalVisible.value = true
}

// 新增计划
const handleAdd = () => {
  if (!addForm.planMonth || !addForm.cropName || !addForm.planType) {
    ElMessage.warning('请填写必填项')
    return
  }

  const newPlan = {
    id: `MP${Date.now()}`,
    planCode: `YJH${dayjs().format('YYYYMM')}${String(monthlyPlans.value.length + 1).padStart(2, '0')}`,
    planMonth: addForm.planMonth,
    cropName: addForm.cropName,
    planType: addForm.planType,
    targetArea: addForm.targetArea,
    targetYield: addForm.targetYield,
    unit: 'kg',
    responsiblePerson: addForm.responsiblePerson,
    publisher: localStorage.getItem('username') || '管理员',
    status: 'draft',
    remarks: addForm.remarks
  }

  monthlyPlans.value.unshift(newPlan)
  saveData()
  addModalVisible.value = false
  ElMessage.success('添加成功')
}

// 详情
const handleDetail = (row) => {
  currentRecord.value = row
  detailModalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRecord.value = row
  Object.assign(editForm, {
    planType: row.planType,
    targetArea: row.targetArea,
    targetYield: row.targetYield,
    responsiblePerson: row.responsiblePerson,
    status: row.status,
    remarks: row.remarks
  })
  editModalVisible.value = true
}

// 保存编辑
const handleSaveEdit = () => {
  if (!currentRecord.value) return

  const index = monthlyPlans.value.findIndex(p => p.id === currentRecord.value.id)
  if (index !== -1) {
    monthlyPlans.value[index] = {
      ...monthlyPlans.value[index],
      planType: editForm.planType,
      targetArea: editForm.targetArea,
      targetYield: editForm.targetYield,
      responsiblePerson: editForm.responsiblePerson,
      status: editForm.status,
      remarks: editForm.remarks
    }
    saveData()
    editModalVisible.value = false
    ElMessage.success('保存成功')
  }
}

// 删除行
const handleDeleteRow = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除计划 ${row.planCode} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    monthlyPlans.value = monthlyPlans.value.filter(p => p.id !== row.id)
    saveData()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleDoExport = () => {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))
  const headers = ['计划编号', '计划月份', '作物名称', '计划类型', '目标面积', '目标产量', '单位', '负责人', '发布人', '状态', '备注']
  const exportData = selectedData.map(row => ({
    '计划编号': row.planCode,
    '计划月份': row.planMonth,
    '作物名称': row.cropName,
    '计划类型': getPlanTypeName(row.planType),
    '目标面积': row.targetArea,
    '目标产量': row.targetYield,
    '单位': row.unit || 'kg',
    '负责人': row.responsiblePerson,
    '发布人': row.publisher,
    '状态': getStatusName(row.status),
    '备注': row.remarks || ''
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${row[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else {
    content = `<html><head><meta charset="utf-8"><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #4a90d9; color: white; }</style></head><body><table>${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const fileName = `月计划_${dayjs().format('YYYY-MM')}.${extension}`

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  showExportModal.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

// 初始化
onMounted(() => {
  loading.value = true
  loadData()
  loading.value = false
})
</script>
