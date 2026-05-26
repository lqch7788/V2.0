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
            <h1 class="text-2xl font-bold text-gray-900">绩效考核</h1>
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
          <el-button style="background-color: #3b82f6; border-color: #3b82f6; color: white;" @click="handleBatchEdit">
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
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
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
      <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm">
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
      <div class="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 shadow-sm">
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
          <el-option label="全部" value="" />
          <el-option label="待评估" value="待评估" />
          <el-option label="已评估" value="已评估" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <!-- 图表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="text-sm font-medium text-gray-700 mb-4">绩效分布</h3>
      <div class="h-48 flex items-center justify-center text-gray-400">
        绩效分布图表 (需要集成recharts，V1.1使用recharts渲染柱状图和饼图)
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 批量操作栏 -->
      <div v-if="batchMode" class="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border-b border-blue-200">
        <span class="text-sm text-blue-700 font-medium">已选择 {{ selectedRows.length }} 条记录</span>
        <el-button type="warning" size="small" @click="handleConfirmBatchEdit" :disabled="selectedRows.length === 0">批量编辑</el-button>
        <el-button type="danger" size="small" @click="handleConfirmBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
        <el-button size="small" @click="handleCancelBatch">取消批量模式</el-button>
      </div>

      <el-table ref="tableRef" :data="paginatedData" border stripe @selection-change="handleSelectionChange" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }">
        <el-table-column v-if="batchMode" type="selection" width="55" />
        <el-table-column prop="staffId" label="工号" width="100" />
        <el-table-column prop="staffName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="taskCompletionRate" label="任务完成率" width="120" align="right">
          <template #default="{ row }">
            <span :class="getScoreClass(row.taskCompletionRate)">{{ row.taskCompletionRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="attendanceRate" label="出勤率" width="100" align="right">
          <template #default="{ row }">
            <span :class="getScoreClass(row.attendanceRate)">{{ row.attendanceRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="workQuality" label="工作质量" width="100" align="right">
          <template #default="{ row }">
            <span :class="getScoreClass(row.workQuality)">{{ row.workQuality }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="safetyCompliance" label="安全规范" width="100" align="right">
          <template #default="{ row }">
            <span :class="getScoreClass(row.safetyCompliance)">{{ row.safetyCompliance }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="teamworkAttitude" label="协作态度" width="100" align="right">
          <template #default="{ row }">
            <span :class="getScoreClass(row.teamworkAttitude)">{{ row.teamworkAttitude }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="综合得分" width="100" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-bold">{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="80" align="center">
          <template #default="{ row }">
            <span :class="getRankBadgeClass(row.rank)">{{ row.rank }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已评估' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="View" circle @click="handleView(row)" />
            <el-button size="small" :icon="Edit" circle type="primary" @click="handleEdit(row)" />
            <el-button size="small" :icon="Delete" circle type="danger" @click="handleDelete(row)" />
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

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="400px">
      <div class="flex flex-col gap-3 py-2">
        <el-radio-group v-model="exportFormat">
          <div class="flex flex-col gap-2">
            <el-radio value="excel">Excel (.xls)</el-radio>
            <el-radio value="csv">CSV (.csv)</el-radio>
            <el-radio value="word">Word (.doc)</el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确定导出</el-button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Trophy, Download, Plus, Edit, Delete, User, TrendCharts, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { PERFORMANCE_GRADE_OPTIONS } from '@/data/laborData'
import { useExport } from '@/composables/useExport'

// Labor Store
const laborStore = useLaborStore()

// 筛选条件
const filters = reactive({ staffName: '', staffId: '', department: '', month: '', status: '' })

// 分页
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// 统计数据（从加载的数据中计算）
const stats = reactive({ total: 0, evaluated: 0, avgScore: 0 })

// 数据
const allData = ref([])

// 加载数据
const loadData = async () => {
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize }
    if (filters.staffName) params.staffName = filters.staffName
    if (filters.staffId) params.staffId = filters.staffId
    if (filters.department) params.department = filters.department
    if (filters.month) params.month = filters.month
    if (filters.status) params.status = filters.status
    await laborStore.fetchPerformanceList(params)
    allData.value = laborStore.performanceList
    const list = allData.value
    stats.total = list.length
    stats.evaluated = list.filter(r => r.status === '已评估').length
    const evaluated = list.filter(r => r.status === '已评估' && r.totalScore > 0)
    stats.avgScore = evaluated.length ? Math.round(evaluated.reduce((s, r) => s + Number(r.totalScore), 0) / evaluated.length) : 0
  } catch (e) {
    console.error('加载绩效数据失败:', e)
  }
}

const total = computed(() => allData.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => allData.value)

// 弹窗状态
const modalVisible = ref(false)
const detailModalVisible = ref(false)
const modalTitle = ref('新增考核记录')
const selectedRecord = ref(null)
const editingRecord = ref(null)

// 表单数据
const getDefaultMonth = () => new Date().toISOString().slice(0, 7)
const formData = reactive({
  id: null, staffId: '', staffName: '', department: '生产部', month: getDefaultMonth(),
  taskCompletionRate: 0, attendanceRate: 0, workQuality: 0,
  safetyCompliance: 0, teamworkAttitude: 0, status: '待评估'
})

// 重置
const handleReset = () => {
  filters.staffName = ''; filters.staffId = ''; filters.department = ''
  filters.month = ''; filters.status = ''
  pagination.currentPage = 1; loadData()
}

// 查询
const handleSearch = () => { pagination.currentPage = 1; loadData() }

// 新增
const handleAdd = () => {
  modalTitle.value = '新增考核记录'
  editingRecord.value = null
  Object.assign(formData, {
    id: null, staffId: '', staffName: '', department: '生产部', month: getDefaultMonth(),
    taskCompletionRate: 0, attendanceRate: 0, workQuality: 0,
    safetyCompliance: 0, teamworkAttitude: 0, status: '待评估'
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  modalTitle.value = '编辑考核记录'
  editingRecord.value = row
  Object.assign(formData, { ...row, id: row.id })
  modalVisible.value = true
}

// 确认（新增/编辑）
const handleConfirm = async () => {
  if (!formData.staffId || !formData.staffName || !formData.month) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const totalScore = Math.round(
    (formData.taskCompletionRate * 0.30 +
    formData.attendanceRate * 0.20 +
    formData.workQuality * 0.25 +
    formData.safetyCompliance * 0.15 +
    formData.teamworkAttitude * 0.10)
  )

  const payload = {
    staffId: formData.staffId, staffName: formData.staffName,
    department: formData.department, month: formData.month,
    taskCompletionRate: formData.taskCompletionRate,
    attendanceRate: formData.attendanceRate,
    workQuality: formData.workQuality,
    safetyCompliance: formData.safetyCompliance,
    teamworkAttitude: formData.teamworkAttitude,
    totalScore, status: formData.status
  }

  try {
    if (editingRecord.value) {
      await laborStore.updatePerformance(formData.id, payload)
      ElMessage.success('更新成功')
    } else {
      await laborStore.createPerformance(payload)
      ElMessage.success('新增成功')
    }
    modalVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('操作失败: ' + (e.message || '未知错误'))
  }
}

// 查看
const handleView = (row) => { selectedRecord.value = row; detailModalVisible.value = true }

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${row.staffName} - ${row.month}" 的考核记录吗？`, '删除确认', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.deletePerformance(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* 用户取消 */ }
}

// 批量操��模式
const batchMode = ref(false)
const tableRef = ref(null)
const selectedRows = ref([])

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleBatchEdit = () => {
  batchMode.value = true
  selectedRows.value = []
  ElMessage.info('已进入批量编辑模式，请勾选需要编辑的记录')
}

const handleConfirmBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先勾选需要编辑的记录')
    return
  }
  ElMessage.success(`已选择 ${selectedRows.value.length} 条记录，准备批量编辑`)
  // 可扩展：打开批量编辑弹窗
}

const handleBatchDelete = () => {
  batchMode.value = true
  selectedRows.value = []
  ElMessage.info('已进入批量删除模式，请勾选需要删除的记录')
}

const handleConfirmBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先勾选需要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条考核记录吗？`,
      '批量删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    for (const row of selectedRows.value) {
      await laborStore.deletePerformance(row.id)
    }
    ElMessage.success(`成功删除 ${selectedRows.value.length} 条记录`)
    batchMode.value = false
    selectedRows.value = []
    loadData()
  } catch { /* 用户取消 */ }
}

const handleCancelBatch = () => {
  batchMode.value = false
  selectedRows.value = []
}

// 导出
const exportColumns = [
  { key: 'staffId', label: '工号' },
  { key: 'staffName', label: '姓名' },
  { key: 'department', label: '部门' },
  { key: 'month', label: '月份' },
  { key: 'taskCompletionRate', label: '任务完成率' },
  { key: 'attendanceRate', label: '出勤率' },
  { key: 'workQuality', label: '工作质量' },
  { key: 'safetyCompliance', label: '安全规范' },
  { key: 'teamworkAttitude', label: '协作态度' },
  { key: 'totalScore', label: '综合得分' },
  { key: 'rank', label: '排名' },
  { key: 'status', label: '状态' },
]

const { exportWithFormatSelect } = useExport({ fileName: '绩效考核' })
const exportModalVisible = ref(false)
const exportFormat = ref('excel')

const handleExport = () => {
  exportModalVisible.value = true
}

const handleConfirmExport = () => {
  exportWithFormatSelect(allData.value, exportColumns, exportFormat.value)
  exportModalVisible.value = false
}

// 得分颜色格式化：>=90绿色, >=80翠绿, >=70琥珀, <70红色
const getScoreClass = (score) => {
  const s = Number(score)
  if (s >= 90) return 'text-green-600 font-bold'
  if (s >= 80) return 'text-emerald-600 font-semibold'
  if (s >= 70) return 'text-amber-600 font-semibold'
  return 'text-red-600 font-semibold'
}

// 排名徽章：1st金色, 2nd灰色, 3rd橙色
const getRankBadgeClass = (rank) => {
  const r = String(rank)
  if (r === '1' || r === '1st') return 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-white text-xs font-bold'
  if (r === '2' || r === '2nd') return 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold'
  if (r === '3' || r === '3rd') return 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-400 text-white text-xs font-bold'
  return 'text-gray-500 text-xs'
}

onMounted(() => { loadData() })
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
