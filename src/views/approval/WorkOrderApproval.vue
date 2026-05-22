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

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><Document /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">总工单</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" class="text-blue-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">进行中</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.inProgress }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">已完成</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><RefreshRight /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">待开始</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
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
      <el-table :data="paginatedData" style="width: 100%" stripe>
        <el-table-column prop="code" label="工单编号" min-width="120" />
        <el-table-column prop="name" label="工人姓名" min-width="100" />
        <el-table-column prop="workerId" label="工号" min-width="80" />
        <el-table-column prop="area" label="工作区域" min-width="100" />
        <el-table-column prop="process" label="工序" min-width="100" />
        <el-table-column prop="workload" label="工作量" min-width="100" />
        <el-table-column prop="date" label="工作日期" min-width="120" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag
              :type="statusTypeMap[row.statusClass] || 'info'"
              size="small"
              effect="light"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button
                type="primary"
                :icon="View"
                circle
                size="small"
                title="查看"
                @click="handleView(row)"
              />
              <el-button
                type="warning"
                :icon="Edit"
                circle
                size="small"
                title="编辑"
                @click="handleEdit(row)"
              />
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  DocumentCopy,
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

// 状态类型映射
const statusTypeMap = {
  'normal': 'success',
  'pending': 'warning',
  'draft': 'info'
}

// 当前模式
const workOrderMode = ref('glass')

// 筛选条件
const code = ref('')
const name = ref('')
const date = ref('')

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
  // 实际项目中这里打开详情弹窗
  console.log('查看工单:', row)
}

// 编辑
const handleEdit = (row) => {
  // 实际项目中这里打开编辑弹窗
  console.log('编辑工单:', row)
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
