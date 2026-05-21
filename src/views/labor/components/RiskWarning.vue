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
            <h1 class="text-lg font-bold text-gray-900">劳动风险预警</h1>
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
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <el-icon :size="24" color="#ef4444"><WarningFilled /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.critical }}</p>
            <p class="text-xs text-gray-500">紧急预警</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <el-icon :size="24" color="#f59e0b"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.warning }}</p>
            <p class="text-xs text-gray-500">一般提醒</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
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
      <div class="bg-white rounded-xl shadow-sm p-4">
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
          <el-select v-model="filters.level" placeholder="预警等级" clearable class="w-[140px]">
            <el-option label="紧急预警" value="critical" />
            <el-option label="一般提醒" value="warning" />
            <el-option label="提示信息" value="info" />
          </el-select>
          <el-select v-model="filters.type" placeholder="预警类型" clearable class="w-[160px]">
            <el-option label="加班异常" value="overtime" />
            <el-option label="出勤异常" value="attendance" />
            <el-option label="薪资异常" value="salary" />
            <el-option label="合同到期" value="contract" />
          </el-select>
          <el-select v-model="filters.status" placeholder="处理状态" clearable class="w-[140px]">
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="resolved" />
          </el-select>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <!-- 预警列表 -->
      <div class="divide-y divide-gray-100">
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
                <Warning v-else-if="alert.level === 'warning'" />
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
              <el-button link type="primary" @click="handleView(alert)">详情</el-button>
              <el-button link type="success" @click="handleResolve(alert)" v-if="alert.status === 'pending'">处理</el-button>
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
            <el-option label="紧急预警" value="critical" />
            <el-option label="一般提醒" value="warning" />
            <el-option label="提示信息" value="info" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警类型">
          <el-select v-model="formData.alertType" class="w-full">
            <el-option label="加班异常" value="overtime" />
            <el-option label="出勤异常" value="attendance" />
            <el-option label="薪资异常" value="salary" />
            <el-option label="合同到期" value="contract" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="formData.department" class="w-full">
            <el-option label="技术部" value="技术部" />
            <el-option label="运营部" value="运营部" />
            <el-option label="市场部" value="市场部" />
          </el-select>
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
      </el-form>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Warning, Download, Plus, WarningFilled, InfoFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = reactive({
  level: '',
  type: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 统计数据
const stats = reactive({
  critical,
  warning,
  pending,
  resolved: 8
})

// 表格数据
const data = ref([
  { id: '1', level: 'critical', alertType: 'overtime', alertTypeName: '加班异常', title: '连续加班超限预警', content: '员工张三连续加班超过72小时，已超过公司规定的月度加班上限', department: '技术部', staffName: '张三', status: 'pending', createTime: '2024-03-15 14:30:00', handleRemarks: '' },
  { id: '2', level: 'warning', alertType: 'attendance', alertTypeName: '出勤异常', title: '出勤率低于阈值', content: '员工李四本月出勤率为75%，低于部门平均出勤率90%', department: '运营部', staffName: '李四', status: 'pending', createTime: '2024-03-14 10:15:00', handleRemarks: '' },
  { id: '3', level: 'info', alertType: 'contract', alertTypeName: '合同到期', title: '劳动合同即将到期', content: '员工王五的劳动合同将于30天后到期，请及时处理', department: '市场部', staffName: '王五', status: 'resolved', createTime: '2024-03-10 09:00:00', handleRemarks: '已安排续签流程' },
  { id: '4', level: 'warning', alertType: 'salary', alertTypeName: '薪资异常', title: '工资发放异常', content: '员工赵六本月工资异常，低于正常工资的80%', department: '生产部', staffName: '赵六', status: 'pending', createTime: '2024-03-13 16:45:00', handleRemarks: '' },
  { id: '5', level: 'critical', alertType: 'attendance', alertTypeName: '出勤异常', title: '旷工预警', content: '员工钱七已连续3天未出勤且未请假', department: '技术部', staffName: '钱七', status: 'pending', createTime: '2024-03-15 08:00:00', handleRemarks: '' }
])

const total = computed(() => data.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return data.value.slice(start, start + pagination.pageSize)
})

// 弹窗状态
const detailModalVisible = ref(false)
const addModalVisible = ref(false)
const selectedAlert = ref(null)

// 表单数据
const formData = reactive({
  level: 'warning',
  alertType: 'overtime',
  department: '',
  staffName: '',
  title: '',
  content: ''
})

// 获取预警等级样式
const getLevelBgClass = (level) => {
  const classMap = {
    critical: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100'
  }
  return classMap[level] || 'bg-gray-100'
}

const getLevelColor = (level) => {
  const colorMap = {
    critical: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }
  return colorMap[level] || '#6b7280'
}

const getLevelType = (level) => {
  const typeMap = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return typeMap[level] || 'info'
}

const getLevelText = (level) => {
  const textMap = {
    critical: '紧急预警',
    warning: '一般提醒',
    info: '提示信息'
  }
  return textMap[level] || level
}

// 重置
const handleReset = () => {
  filters.level = ''
  filters.type = ''
  filters.status = ''
}

// 查询
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 查看
const handleView = (alert) => {
  selectedAlert.value = alert
  detailModalVisible.value = true
}

// 处理
const handleResolve = async (alert) => {
  try {
    await ElMessageBox.confirm(`确定处理预警"${alert.title}"吗？`, '处理确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    alert.status = 'resolved'
    alert.handleRemarks = '已处理'
    if (selectedAlert.value?.id === alert.id) {
      selectedAlert.value = alert
    }
    ElMessage.success('处理成功')
  } catch {
    // 用户取消
  }
}

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    level: 'warning',
    alertType: 'overtime',
    department: '',
    staffName: '',
    title: '',
    content: ''
  })
  addModalVisible.value = true
}

// 确认新增
const handleConfirmAdd = () => {
  if (!formData.title || !formData.content || !formData.department) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const alertTypeNameMap = {
    overtime: '加班异常',
    attendance: '出勤异常',
    salary: '薪资异常',
    contract: '合同到期'
  }
  const newAlert = {
    id: Date.now().toString(),
    ...formData,
    alertTypeName: alertTypeNameMap[formData.alertType],
    status: 'pending',
    createTime: new Date().toLocaleString(),
    handleRemarks: ''
  }
  data.value.unshift(newAlert)
  addModalVisible.value = false
  ElMessage.success('新增成功')
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
