<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Trophy /></el-icon>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">绩效考核</h1>
            <p class="text-xs text-gray-500">员工绩效考核评分与排名</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button type="warning" @click="handleBatchEdit">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" color="#10b981"><User /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-xs text-gray-500">考核人数</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" color="#22c55e"><TrendCharts /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.evaluated }}</p>
            <p class="text-xs text-gray-500">已评估</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" color="#f59e0b"><Trophy /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.avgScore }}</p>
            <p class="text-xs text-gray-500">平均得分</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <el-input v-model="filters.staffName" placeholder="员工姓名" clearable class="w-[140px]" />
        <el-input v-model="filters.staffId" placeholder="工号" clearable class="w-[120px]" />
        <el-select v-model="filters.department" placeholder="部门" clearable class="w-[140px]">
          <el-option label="技术部" value="技术部" />
          <el-option label="运营部" value="运营部" />
          <el-option label="市场部" value="市场部" />
        </el-select>
        <el-date-picker
          v-model="filters.month"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="月份"
          class="w-[160px]"
        />
        <el-select v-model="filters.status" placeholder="状态" clearable class="w-[140px]">
          <el-option label="待评估" value="pending" />
          <el-option label="已评估" value="evaluated" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <!-- 图表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="text-sm font-medium text-gray-700 mb-4">绩效分布</h3>
      <div class="h-48 flex items-center justify-center text-gray-400">
        绩效图表区域
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" border stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="staffId" label="工号" width="100" />
        <el-table-column prop="staffName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="taskCompletionRate" label="任务完成率" width="120" align="right">
          <template #default="{ row }">
            {{ row.taskCompletionRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="attendanceRate" label="出勤率" width="100" align="right">
          <template #default="{ row }">
            {{ row.attendanceRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="workQuality" label="工作质量" width="100" align="right">
          <template #default="{ row }">
            {{ row.workQuality }}%
          </template>
        </el-table-column>
        <el-table-column prop="safetyCompliance" label="安全规范" width="100" align="right">
          <template #default="{ row }">
            {{ row.safetyCompliance }}%
          </template>
        </el-table-column>
        <el-table-column prop="teamworkAttitude" label="协作态度" width="100" align="right">
          <template #default="{ row }">
            {{ row.teamworkAttitude }}%
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="综合得分" width="100" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-bold">{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已评估' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="success" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-500">
          共 {{ total }} 条记录，第 {{ pagination.currentPage }} / {{ totalPages }} 页
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="modalVisible" :title="modalTitle" width="700px">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号">
              <el-input v-model="formData.staffId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="formData.staffName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门">
              <el-select v-model="formData.department" class="w-full">
                <el-option label="技术部" value="技术部" />
                <el-option label="运营部" value="运营部" />
                <el-option label="市场部" value="市场部" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份">
              <el-date-picker
                v-model="formData.month"
                type="month"
                format="YYYY-MM"
                value-format="YYYY-MM"
                class="w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务完成率">
              <el-input-number v-model="formData.taskCompletionRate" :min="0" :max="100" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出勤率">
              <el-input-number v-model="formData.attendanceRate" :min="0" :max="100" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工作质量">
              <el-input-number v-model="formData.workQuality" :min="0" :max="100" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全规范">
              <el-input-number v-model="formData.safetyCompliance" :min="0" :max="100" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="协作态度">
              <el-input-number v-model="formData.teamworkAttitude" :min="0" :max="100" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" class="w-full">
                <el-option label="待评估" value="待评估" />
                <el-option label="已评估" value="已评估" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="考核详情" width="600px">
      <div v-if="selectedRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工号">{{ selectedRecord.staffId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedRecord.staffName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ selectedRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="月份">{{ selectedRecord.month }}</el-descriptions-item>
          <el-descriptions-item label="任务完成率">{{ selectedRecord.taskCompletionRate }}%</el-descriptions-item>
          <el-descriptions-item label="出勤率">{{ selectedRecord.attendanceRate }}%</el-descriptions-item>
          <el-descriptions-item label="工作质量">{{ selectedRecord.workQuality }}%</el-descriptions-item>
          <el-descriptions-item label="安全规范">{{ selectedRecord.safetyCompliance }}%</el-descriptions-item>
          <el-descriptions-item label="协作态度">{{ selectedRecord.teamworkAttitude }}%</el-descriptions-item>
          <el-descriptions-item label="综合得分" class="text-emerald-600">
            <strong>{{ selectedRecord.totalScore }}</strong>
          </el-descriptions-item>
          <el-descriptions-item label="排名">{{ selectedRecord.rank }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedRecord.status === '已评估' ? 'success' : 'warning'" size="small">{{ selectedRecord.status }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Trophy, Download, Plus, Edit, Delete, User, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = reactive({
  staffName: '',
  staffId: '',
  department: '',
  month: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 统计数据
const stats = reactive({
  total: 15,
  evaluated: 12,
  avgScore: 85
})

// 表格数据
const data = ref([
  { id: '1', staffId: 'EMP001', staffName: '张三', department: '技术部', month: '2024-03', taskCompletionRate: 92, attendanceRate: 95, workQuality: 88, safetyCompliance: 96, teamworkAttitude: 90, totalScore: 92, rank: 1, status: '已评估' },
  { id: '2', staffId: 'EMP002', staffName: '李四', department: '技术部', month: '2024-03', taskCompletionRate: 88, attendanceRate: 90, workQuality: 85, safetyCompliance: 92, teamworkAttitude: 88, totalScore: 88, rank: 2, status: '已评估' },
  { id: '3', staffId: 'EMP003', staffName: '王五', department: '运营部', month: '2024-03', taskCompletionRate: 85, attendanceRate: 92, workQuality: 90, safetyCompliance: 88, teamworkAttitude: 85, totalScore: 87, rank: 3, status: '已评估' },
  { id: '4', staffId: 'EMP004', staffName: '赵六', department: '运营部', month: '2024-03', taskCompletionRate: 80, attendanceRate: 88, workQuality: 82, safetyCompliance: 85, teamworkAttitude: 80, totalScore: 82, rank: 4, status: '已评估' },
  { id: '5', staffId: 'EMP005', staffName: '钱七', department: '市场部', month: '2024-03', taskCompletionRate: 0, attendanceRate: 0, workQuality: 0, safetyCompliance: 0, teamworkAttitude: 0, totalScore: 0, rank: 0, status: '待评估' }
])

const total = computed(() => data.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return data.value.slice(start, start + pagination.pageSize)
})

// 弹窗状态
const modalVisible = ref(false)
const detailModalVisible = ref(false)
const modalTitle = ref('新增考核记录')
const selectedRecord = ref(null)
const editingRecord = ref(null)

// 表单数据
const formData = reactive({
  staffId: '',
  staffName: '',
  department: '',
  month: '',
  taskCompletionRate: 0,
  attendanceRate: 0,
  workQuality: 0,
  safetyCompliance: 0,
  teamworkAttitude: 0,
  status: '待评估'
})

// 重置
const handleReset = () => {
  filters.staffName = ''
  filters.staffId = ''
  filters.department = ''
  filters.month = ''
  filters.status = ''
}

// 查询
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增考核记录'
  editingRecord.value = null
  Object.assign(formData, {
    staffId: '',
    staffName: '',
    department: '',
    month: '',
    taskCompletionRate: 0,
    attendanceRate: 0,
    workQuality: 0,
    safetyCompliance: 0,
    teamworkAttitude: 0,
    status: '待评估'
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  modalTitle.value = '编辑考核记录'
  editingRecord.value = row
  Object.assign(formData, row)
  modalVisible.value = true
}

// 确认
const handleConfirm = () => {
  if (!formData.staffId || !formData.staffName || !formData.month) {
    ElMessage.warning('请填写完整信息')
    return
  }
  // 计算综合得分
  const totalScore = Math.round(
    (formData.taskCompletionRate * 0.25 +
    formData.attendanceRate * 0.15 +
    formData.workQuality * 0.25 +
    formData.safetyCompliance * 0.15 +
    formData.teamworkAttitude * 0.20)
  )

  if (editingRecord.value) {
    Object.assign(editingRecord.value, formData, { totalScore })
    ElMessage.success('更新成功')
  } else {
    const rank = data.value.length + 1
    data.value.unshift({
      id: Date.now().toString(),
      ...formData,
      totalScore,
      rank
    })
    ElMessage.success('新增成功')
  }
  modalVisible.value = false
}

// 查看
const handleView = (row) => {
  selectedRecord.value = row
  detailModalVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${row.staffName} - ${row.month}" 的考核记录吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = data.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      data.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消
  }
}

// 批量编辑
const handleBatchEdit = () => {
  ElMessage.info('批量编辑功能开发中')
}

// 批量删除
const handleBatchDelete = () => {
  ElMessage.info('批量删除功能开发中')
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中')
}
</script>

<style scoped>
.bg-white {
  background-color: white;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.space-y-4 > * + * {
  margin-top: 16px;
}

.grid {
  display: grid;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.bg-\[\#F2F6FA\] {
  background-color: #F2F6FA;
}

.text-emerald-600 {
  color: #059669;
}

.font-bold {
  font-weight: 700;
}
</style>
