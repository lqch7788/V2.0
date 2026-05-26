<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Warning /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">劳动风险预警</h1>
            <p class="text-xs text-gray-500">监控和管理劳动风险预警信息</p>
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
        </div>
      </div>
    </div>

    <!-- 预警仪表盘 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <el-icon :size="24" color="#ef4444"><WarningFilled /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.today }}</p>
            <p class="text-xs text-gray-500">今日预警</p>
          </div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <el-icon :size="24" color="#f59e0b"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.week }}</p>
            <p class="text-xs text-gray-500">本周预警</p>
          </div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" color="#3b82f6"><InfoFilled /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            <p class="text-xs text-gray-500">待处理</p>
          </div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <el-icon :size="24" color="#22c55e"><CircleCheckFilled /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.resolved }}</p>
            <p class="text-xs text-gray-500">已处理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">预警列表</h3>
      </div>

      <!-- 筛选栏 -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center gap-4 flex-wrap">
          <el-input v-model="filters.keyword" placeholder="搜索标题/内容/人员/部门" clearable class="w-[220px]" @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="filters.level" placeholder="预警等级" clearable class="w-[140px]">
            <el-option label="全部" value="" />
            <el-option v-for="item in RISK_LEVEL_OPTIONS.filter(o => o.value)" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="filters.type" placeholder="预警类型" clearable class="w-[160px]">
            <el-option label="全部" value="" />
            <el-option v-for="item in RISK_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="filters.status" placeholder="处理状态" clearable class="w-[140px]">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="handled" />
          </el-select>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <!-- 预警列表 -->
      <div v-loading="loading" class="divide-y divide-gray-100">
        <div v-if="paginatedData.length === 0 && !loading" class="py-8 text-center text-gray-400">暂无预警数据</div>
        <div
          v-for="alert in paginatedData"
          :key="alert.id"
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start gap-4">
            <!-- 预警图标 -->
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', getLevelBgClass(alert.level)]">
              <el-icon :size="20" :color="getLevelColor(alert.level)">
                <WarningFilled v-if="alert.level === 'critical'" />
                <Warning v-else-if="alert.level === 'danger' || alert.level === 'warning'" />
                <InfoFilled v-else />
              </el-icon>
            </div>

            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-medium text-gray-900">{{ alert.title }}</h4>
                  <el-tag :type="getLevelType(alert.level)" size="small">{{ getLevelText(alert.level) }}</el-tag>
                  <el-tag :type="alert.status === 'pending' ? 'warning' : 'success'" size="small">{{ alert.status === 'pending' ? '待处理' : '已处理' }}</el-tag>
                </div>
                <span class="text-xs text-gray-400">{{ alert.createTime }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ alert.content }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>{{ alert.department }}</span>
                <span>{{ alert.staffName }}</span>
                <span>{{ alert.alertTypeName }}</span>
              </div>
            </div>

            <!-- 操作 -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <el-button size="small" :icon="View" circle @click="handleView(alert)" />
              <el-button size="small" :icon="Check" circle type="success" @click="handleResolve(alert)" v-if="alert.status === 'pending'" />
            </div>
          </div>
        </div>
      </div>

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
    <el-dialog v-model="detailModalVisible" title="预警详情" width="600px">
      <div v-if="selectedAlert" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预警等级">
            <el-tag :type="getLevelType(selectedAlert.level)" size="small">{{ getLevelText(selectedAlert.level) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="selectedAlert.status === 'pending' ? 'warning' : 'success'" size="small">{{ selectedAlert.status === 'pending' ? '待处理' : '已处理' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预警类型">{{ selectedAlert.alertTypeName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ selectedAlert.department }}</el-descriptions-item>
          <el-descriptions-item label="员工">{{ selectedAlert.staffName }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedAlert.createTime }}</el-descriptions-item>
        </el-descriptions>
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">预警标题</h4>
          <p class="text-sm text-gray-900">{{ selectedAlert.title }}</p>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">预警内容</h4>
          <p class="text-sm text-gray-600">{{ selectedAlert.content }}</p>
        </div>
        <div v-if="selectedAlert.handleRemarks">
          <h4 class="text-sm font-medium text-gray-700 mb-2">处理备注</h4>
          <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">{{ selectedAlert.handleRemarks }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleResolve(selectedAlert)" v-if="selectedAlert?.status === 'pending'">处理</el-button>
      </template>
    </el-dialog>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addModalVisible" title="新建风险预警" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="预警等级">
          <el-select v-model="formData.level" class="w-full">
            <el-option v-for="item in RISK_LEVEL_OPTIONS.filter(o => o.value)" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警类型">
          <el-select v-model="formData.alertType" class="w-full">
            <el-option v-for="item in RISK_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="formData.department" class="w-full">
            <el-option label="技术部" value="技术部" />
            <el-option label="运营部" value="运营部" />
            <el-option label="市场部" value="市场部" />
          </el-select>
        </el-form-item>
        <el-form-item label="工号">
          <el-input v-model="formData.staffId" />
        </el-form-item>
        <el-form-item label="员工">
          <el-input v-model="formData.staffName" />
        </el-form-item>
        <el-form-item label="预警标题">
          <el-input v-model="formData.title" />
        </el-form-item>
        <el-form-item label="预警内容">
          <el-input v-model="formData.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="处理人">
          <el-input v-model="formData.handler" placeholder="请输入处理人" />
        </el-form-item>
        <el-form-item label="处理时间">
          <el-date-picker v-model="formData.handleTime" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" placeholder="选择处理时间" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Warning, Download, Plus, WarningFilled, InfoFilled, CircleCheckFilled, Search, View, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { RISK_LEVEL_OPTIONS, RISK_TYPE_OPTIONS } from '@/data/laborData'
import { useExport } from '@/composables/useExport'

// Labor Store
const laborStore = useLaborStore()

// 筛选条件
const filters = reactive({ keyword: '', level: '', type: '', status: '' })

// 分页
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// 统计数据（从Store数据计算）
const stats = computed(() => {
  const list = allData.value
  const today = new Date().toISOString().slice(0, 10)
  const getWeekStart = () => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    return d.toISOString().slice(0, 10)
  }
  const weekStart = getWeekStart()
  return {
    today: list.filter(r => r.createTime && r.createTime.slice(0, 10) === today).length,
    week: list.filter(r => r.createTime && r.createTime.slice(0, 10) >= weekStart).length,
    pending: list.filter(r => r.status === 'pending').length,
    resolved: list.filter(r => r.status === 'handled').length
  }
})

// 数据
const loading = computed(() => laborStore.loading)

// 从Store获取数据
const allData = computed(() => {
  let list = laborStore.riskList
  // 客户端关键词搜索
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    list = list.filter(r =>
      (r.title && r.title.toLowerCase().includes(kw)) ||
      (r.content && r.content.toLowerCase().includes(kw)) ||
      (r.staffName && r.staffName.toLowerCase().includes(kw)) ||
      (r.department && r.department.toLowerCase().includes(kw))
    )
  }
  return list
})

// 加载数据
const loadData = async () => {
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize }
    if (filters.level) params.level = filters.level
    if (filters.type) params.alertType = filters.type
    if (filters.status) params.status = filters.status
    if (filters.keyword) params.keyword = filters.keyword
    await laborStore.fetchRiskList(params)
  } catch (e) {
    console.error('加载风险数据失败:', e)
    ElMessage.error('加载风险数据失败')
  }
}

const total = computed(() => allData.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return allData.value.slice(start, start + pagination.pageSize)
})

// 弹窗状态
const detailModalVisible = ref(false)
const addModalVisible = ref(false)
const selectedAlert = ref(null)

// 表单数据
const formData = reactive({
  level: 'warning', alertType: '', staffId: '', department: '', staffName: '', title: '', content: '', remarks: '', handler: '', handleTime: ''
})

// 风险等级样式映射（V1.1 3级：warning/danger/critical）
const levelStyleMap = {
  'warning': { bgClass: 'bg-amber-100', color: '#f59e0b', type: 'warning', text: '一般提醒' },
  'danger': { bgClass: 'bg-orange-100', color: '#f97316', type: 'danger', text: '需要注意' },
  'critical': { bgClass: 'bg-red-100', color: '#ef4444', type: 'danger', text: '紧急处理' }
}
const getLevelBgClass = (level) => levelStyleMap[level]?.bgClass || 'bg-gray-100'
const getLevelColor = (level) => levelStyleMap[level]?.color || '#6b7280'
const getLevelType = (level) => levelStyleMap[level]?.type || 'info'
const getLevelText = (level) => levelStyleMap[level]?.text || level

// 重置
const handleReset = () => {
  filters.keyword = ''; filters.level = ''; filters.type = ''; filters.status = ''
  pagination.currentPage = 1; loadData()
}

// 查询
const handleSearch = () => { pagination.currentPage = 1; loadData() }

// 查看
const handleView = (alert) => { selectedAlert.value = alert; detailModalVisible.value = true }

// 处理
const resolveRemark = ref('')
const handleResolve = async (alert) => {
  try {
    resolveRemark.value = ''
    const { value: remark } = await ElMessageBox.prompt('请输入处理备注', '处理确认', {
      confirmButtonText: '确定', cancelButtonText: '取消',
      inputValidator: (val) => val ? true : '请输入处理备注',
      inputErrorMessage: '处理备注不能为空'
    })
    await laborStore.resolveRisk(alert.id, { handleRemarks: remark })
    ElMessage.success('处理成功')
    loadData()
  } catch { /* 用户取消 */ }
}

// 新增
const handleAdd = () => {
  Object.assign(formData, { level: 'warning', alertType: '', staffId: '', department: '', staffName: '', title: '', content: '', remarks: '', handler: '', handleTime: '' })
  addModalVisible.value = true
}

// 确认新增
const handleConfirmAdd = async () => {
  if (!formData.title || !formData.content || !formData.department) {
    ElMessage.warning('请填写完整信息')
    return
  }
  await laborStore.createRisk(formData)
  addModalVisible.value = false
  ElMessage.success('新增成功')
  loadData()
}

// 导出
const exportColumns = [
  { key: 'title', label: '预警标题' },
  { key: 'level', label: '预警等级' },
  { key: 'alertTypeName', label: '预警类型' },
  { key: 'department', label: '部门' },
  { key: 'staffName', label: '员工' },
  { key: 'content', label: '预警内容' },
  { key: 'status', label: '处理状态' },
  { key: 'createTime', label: '创建时间' },
]

const { exportWithFormatSelect } = useExport({ fileName: '劳动风险预警' })
const exportModalVisible = ref(false)
const exportFormat = ref('excel')

const handleExport = () => {
  exportModalVisible.value = true
}

const handleConfirmExport = () => {
  exportWithFormatSelect(allData.value, exportColumns, exportFormat.value)
  exportModalVisible.value = false
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

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.divide-y > * + * {
  border-top-width: 1px;
}

.divide-gray-100 {
  border-color: #f3f4f6;
}
</style>
