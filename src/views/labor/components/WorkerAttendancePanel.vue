<template>
  <div class="space-y-4 p-4">
    <!-- 今日排班对比卡片 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-2 mb-3">
        <el-icon :size="16" color="#3b82f6">
          <Calendar />
        </el-icon>
        <span class="text-sm font-medium text-gray-700">今日排班对比（{{ todayStr }}）</span>
        <span class="text-xs text-gray-400">数据来源：农事管理 → 排班调度</span>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-blue-50 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <el-icon :size="16" color="#2563eb">
              <Calendar />
            </el-icon>
            <span class="text-xs text-blue-600 font-medium">计划在班</span>
          </div>
          <div class="text-2xl font-bold text-blue-700 mt-1">{{ scheduleComparison.scheduledCount }}</div>
          <div class="text-xs text-blue-500">人</div>
        </div>
        <div class="bg-emerald-50 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <el-icon :size="16" color="#059669">
              <CircleCheck />
            </el-icon>
            <span class="text-xs text-emerald-600 font-medium">已打卡</span>
          </div>
          <div class="text-2xl font-bold text-emerald-700 mt-1">{{ scheduleComparison.checkedInCount }}</div>
          <div class="text-xs text-emerald-500">人</div>
        </div>
        <div class="bg-red-50 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <el-icon :size="16" color="#dc2626">
              <CircleClose />
            </el-icon>
            <span class="text-xs text-red-600 font-medium">排班缺勤</span>
          </div>
          <div class="text-2xl font-bold text-red-700 mt-1">{{ scheduleComparison.absentCount }}</div>
          <div class="text-xs text-red-500">人（在班未打卡）</div>
        </div>
        <div class="bg-amber-50 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <el-icon :size="16" color="#d97706">
              <Warning />
            </el-icon>
            <span class="text-xs text-amber-600 font-medium">临时到岗</span>
          </div>
          <div class="text-2xl font-bold text-amber-700 mt-1">{{ scheduleComparison.unscheduledCount }}</div>
          <div class="text-xs text-amber-500">人（未排班打卡）</div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索工人姓名..."
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select v-model="filters.department" placeholder="全部部门" clearable class="w-full sm:w-40">
          <el-option label="全部部门" value="" />
          <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="迟到" value="late" />
          <el-option label="早退" value="early" />
          <el-option label="请假" value="leave" />
          <el-option label="缺勤" value="absent" />
        </el-select>
        <el-date-picker
          v-model="filters.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full sm:w-40"
        />
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
        <el-table-column prop="workerName" label="工人姓名" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="date" label="日期" min-width="120" />
        <el-table-column prop="checkInTime" label="签到时间" min-width="120">
          <template #default="{ row }">
            {{ row.checkInTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="checkOutTime" label="签退时间" min-width="120">
          <template #default="{ row }">
            {{ row.checkOutTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
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
    <el-dialog v-model="detailDialogVisible" title="考勤详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工人姓名">{{ currentRecord.workerName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ currentRecord.date }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="签到时间">{{ currentRecord.checkInTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="签退时间">{{ currentRecord.checkOutTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑考勤' : '新增考勤'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="工人姓名" prop="workerName">
          <el-input v-model="formData.workerName" placeholder="请输入工人姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择部门">
            <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="formData.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="签到时间" prop="checkInTime">
          <el-time-picker v-model="formData.checkInTime" format="HH:mm" value-format="HH:mm" placeholder="选择时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="签退时间" prop="checkOutTime">
          <el-time-picker v-model="formData.checkOutTime" format="HH:mm" value-format="HH:mm" placeholder="选择时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="迟到" value="late" />
            <el-option label="早退" value="early" />
            <el-option label="请假" value="leave" />
            <el-option label="缺勤" value="absent" />
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
import { ref, computed, reactive, onMounted } from 'vue'
import {
  Calendar, CircleCheck, CircleClose, Warning, Search, Plus, Edit, Delete, Download
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { enhancedApiClient } from '@/lib/apiClient'

// 今日日期字符串
const todayStr = new Date().toISOString().split('T')[0]

// Labor Store
const laborStore = useLaborStore()

// 部门列表
const departments = ['技术部', '运营部', '市场部', '财务部']

// 筛选条件
const filters = reactive({
  keyword: '',
  department: '',
  status: '',
  date: todayStr
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

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
  workerName: '',
  department: '',
  date: '',
  checkInTime: '',
  checkOutTime: '',
  status: 'normal',
  remark: ''
})

const formRules = {
  workerName: [{ required: true, message: '请输入工人姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 规范化后端数据为前端格式
function normalizeAttendance(record) {
  return {
    id: record.id,
    workerName: record.name || record.worker_name || '',
    department: record.dept || '',
    date: record.date || '',
    checkInTime: record.check_in || '',
    checkOutTime: record.check_out || '',
    status: record.status_class || record.status || 'normal',
    remark: record.remarks || ''
  }
}

// 规范化前端数据为后端格式
function denormalizeAttendance(data) {
  return {
    id: data.id,
    worker_id: data.workerName,
    name: data.workerName,
    dept: data.department,
    date: data.date,
    check_in: data.checkInTime,
    check_out: data.checkOutTime,
    status: data.status,
    status_class: data.status,
    remarks: data.remark
  }
}

// 考勤数据
const allData = ref([])

// 加载数据
const loadData = async () => {
  try {
    const params = {}
    if (filters.date) params.start_date = filters.date
    if (filters.date) params.end_date = filters.date
    if (filters.department) params.dept = filters.department
    if (filters.keyword) params.keyword = filters.keyword

    const response = await enhancedApiClient.get('/attendance', params)
    const records = response?.data || response || []
    allData.value = Array.isArray(records) ? records.map(r => normalizeAttendance(r)) : []
  } catch (error) {
    console.error('[WorkerAttendancePanel] 加载考勤数据失败:', error)
    allData.value = []
  }
}

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.workerName.includes(filters.keyword)) return false
    if (filters.department && record.department !== filters.department) return false
    if (filters.status && record.status !== filters.status) return false
    if (filters.date && record.date !== filters.date) return false
    return true
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// 排班对比数据（基于实际数据计算）
const scheduleComparison = computed(() => {
  const todayRecords = allData.value.filter(r => r.date === todayStr)
  return {
    scheduledCount: todayRecords.length,
    checkedInCount: todayRecords.filter(r => r.checkInTime).length,
    absentCount: todayRecords.filter(r => !r.checkInTime && r.status !== 'leave').length,
    unscheduledCount: 0
  }
})

// 状态映射
const statusMap = {
  normal: { label: '正常', type: 'success' },
  late: { label: '迟到', type: 'warning' },
  early: { label: '早退', type: 'warning' },
  leave: { label: '请假', type: 'info' },
  absent: { label: '缺勤', type: 'danger' }
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.department = ''
  filters.status = ''
  filters.date = todayStr
  pagination.currentPage = 1
  loadData()
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
    workerName: '',
    department: '',
    date: filters.date || todayStr,
    checkInTime: '',
    checkOutTime: '',
    status: 'normal',
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
        const data = denormalizeAttendance(formData)
        if (isEdit.value) {
          // 编辑
          await enhancedApiClient.put(`/attendance/${formData.id}`, data)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          data.id = `ATT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          await enhancedApiClient.post('/attendance/batch', { records: [data] })
          ElMessage.success('新增成功')
        }
        formDialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交考勤失败:', error)
        ElMessage.error('提交失败')
      }
    }
  })
}

// 初始化加载
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 继承全局样式 */
</style>
