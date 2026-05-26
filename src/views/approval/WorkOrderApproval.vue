<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Clipboard /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">工单管理</h1>
          <p class="text-gray-500">工单列表与发布 - 支持玻璃温室/日光温室/大田三种模式</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1: bg-[#F2F6FA] -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><Document /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-xs text-gray-500">总工单</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" class="text-blue-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.inProgress }}</p>
            <p class="text-xs text-gray-500">进行中</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
            <p class="text-xs text-gray-500">已完成</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><RefreshRight /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            <p class="text-xs text-gray-500">待开始</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式切换 -->
    <div class="bg-white rounded-xl p-1 shadow-sm">
      <div class="flex gap-1 p-1">
        <button
          v-for="mode in modes"
          :key="mode.value"
          @click="workOrderMode = mode.value"
          :class="[
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            workOrderMode === mode.value
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">工单编号</label>
          <el-input
            v-model="code"
            placeholder="请输入工单编号"
            clearable
          />
        </div>
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">工人姓名</label>
          <el-input
            v-model="name"
            placeholder="请输入姓名"
            clearable
          />
        </div>
        <div class="min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <el-date-picker
            v-model="date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>
        <div class="flex gap-2">
          <el-button type="default" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建工单
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ modeLabel }}工单列表
        </h3>
      </div>
      <el-table :data="paginatedData" style="width: 100%" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: '600' }">
        <el-table-column prop="code" label="工单编号" min-width="120" />
        <el-table-column prop="name" label="工人姓名" min-width="100" />
        <el-table-column prop="workerId" label="工号" min-width="80" />
        <el-table-column prop="area" label="工作区域" min-width="100" />
        <el-table-column prop="process" label="工序" min-width="100" />
        <el-table-column prop="workload" label="工作量" min-width="100" />
        <el-table-column prop="date" label="工作日期" min-width="120" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(row.statusClass)">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button link size="small" @click="handleView(row)" title="查看">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
              <el-button link size="small" @click="handleEdit(row)" title="编辑">
                <el-icon :size="16"><Edit /></el-icon>
              </el-button>
              <el-button link size="small" @click="handleApprove(row)" title="审批">
                <el-icon :size="16"><CircleCheck /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select
            v-model="pageSize"
            @change="handlePageSizeChange"
            style="width: 80px"
          >
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">共 {{ workOrders.length }} 条</span>
          <el-button
            :icon="ArrowLeft"
            circle
            size="small"
            :disabled="currentPage === 1"
            @click="handlePrevPage"
          />
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <el-button
            :icon="ArrowRight"
            circle
            size="small"
            :disabled="currentPage >= totalPages"
            @click="handleNextPage"
          />
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="工单详情" width="600px" destroy-on-close>
      <div v-if="currentOrder" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工单编号">{{ currentOrder.code }}</el-descriptions-item>
          <el-descriptions-item label="工号">{{ currentOrder.workerId }}</el-descriptions-item>
          <el-descriptions-item label="工人姓名">{{ currentOrder.name }}</el-descriptions-item>
          <el-descriptions-item label="工作区域">{{ currentOrder.area }}</el-descriptions-item>
          <el-descriptions-item label="工序">{{ currentOrder.process }}</el-descriptions-item>
          <el-descriptions-item label="工作量">{{ currentOrder.workload }}</el-descriptions-item>
          <el-descriptions-item label="工作日期">{{ currentOrder.date }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTypeMap[currentOrder.statusClass] || 'info'" size="small" effect="light">
              {{ currentOrder.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog v-model="approveVisible" title="工单审批" width="500px" destroy-on-close>
      <div v-if="currentOrder" class="space-y-4">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工单编号">{{ currentOrder.code }}</el-descriptions-item>
          <el-descriptions-item label="工人姓名">{{ currentOrder.name }}</el-descriptions-item>
          <el-descriptions-item label="工作内容">{{ currentOrder.process }} - {{ currentOrder.workload }}</el-descriptions-item>
        </el-descriptions>
        <el-form-item label="审批意见">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审批备注" />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApprove">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  Search,
  Plus,
  View,
  Edit,
  ArrowLeft,
  ArrowRight,
  Document,
  Clock,
  CircleCheck,
  RefreshRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 工单数据类型

// 模式选项
const modes = [
  { value: 'glass', label: '模式一（玻璃温室）' },
  { value: 'solar', label: '模式二（日光温室）' },
  { value: 'field', label: '模式三（大田）' }
]

// 统计数据
const stats = reactive({
  total: 25,
  inProgress: 8,
  completed: 12,
  pending: 5
})

// 状态类型映射 - V1.1: inline pill classes
const statusTypeMap = {
  'normal': 'success',
  'pending': 'warning',
  'draft': 'info'
}

// 状态样式 - V1.1: inline pills
const getStatusClass = (statusClass) => {
  switch (statusClass) {
    case 'normal':
      return 'bg-emerald-100 text-emerald-700'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'draft':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// 当前模式
const workOrderMode = ref('glass')

// 筛选条件
const code = ref('')
const name = ref('')
const date = ref('')

// 弹窗状态
const detailVisible = ref(false)
const approveVisible = ref(false)
const currentOrder = ref(null)
const approveForm = reactive({
  result: 'approve',
  comment: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 工单数据
const workOrders = ref([
  { id: '1', code: 'WO20240301', name: '张伟民', workerId: 'W001', area: '1号棚', process: '授粉', workload: '500株', date: '2024-03-01', status: '已完成', statusClass: 'normal' },
  { id: '2', code: 'WO20240302', name: '李明轩', workerId: 'W002', area: '2号棚', process: '浇水', workload: '800㎡', date: '2024-03-01', status: '进行中', statusClass: 'pending' },
  { id: '3', code: 'WO20240303', name: '王建国', workerId: 'W003', area: '3号棚', process: '施肥', workload: '200kg', date: '2024-03-01', status: '已完成', statusClass: 'normal' },
  { id: '4', code: 'WO20240304', name: '赵俊杰', workerId: 'W004', area: '1号棚', process: '疏果', workload: '300株', date: '2024-03-02', status: '待开始', statusClass: 'draft' },
  { id: '5', code: 'WO20240305', name: '钱文涛', workerId: 'W005', area: '2号棚', process: '病虫害防治', workload: '600㎡', date: '2024-03-02', status: '进行中', statusClass: 'pending' },
])

// 计算当前模式标签
const modeLabel = computed(() => {
  const mode = modes.find(m => m.value === workOrderMode.value)
  return mode ? mode.label.replace(/模式[一二三]（|）/g, '') : ''
})

// 总页数
const totalPages = computed(() => Math.ceil(workOrders.value.length / pageSize.value) || 1)

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return workOrders.value.slice(start, start + pageSize.value)
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  // 实际项目中这里会根据筛选条件过滤数据
}

// 新建工单
const handleAdd = () => {
  // 实际项目中这里打开新建弹窗
}

// 查看
const handleView = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info('编辑工单功能开发中：' + row.code)
}

// 审批
const handleApprove = (row) => {
  currentOrder.value = row
  approveForm.result = 'approve'
  approveForm.comment = ''
  approveVisible.value = true
}

// 提交审批
const handleSubmitApprove = () => {
  if (approveForm.result === 'approve') {
    ElMessage.success('工单 ' + currentOrder.value.code + ' 已通过审批')
  } else {
    ElMessage.success('工单 ' + currentOrder.value.code + ' 已驳回')
  }
  approveVisible.value = false
}

// 分页操作
const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}
</script>
