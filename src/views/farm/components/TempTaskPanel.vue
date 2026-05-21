<template>
  <div class="space-y-4">
    <!-- 页面标题 - 临时任务派发 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
          <el-icon :size="20" class="text-white"><Warning /></el-icon>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">临时任务派发</h2>
          <p class="text-xs text-gray-500">管理不在计划内的临时任务派发</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-md">
        <p class="text-sm text-gray-500">总任务</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-md">
        <p class="text-sm text-gray-500">待执行</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.pending }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-md">
        <p class="text-sm text-gray-500">进行中</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.inProgress }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-md">
        <p class="text-sm text-gray-500">已完成</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.completed }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
        <p class="text-sm text-gray-500">非常紧急</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{{ stats.critical }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
        <p class="text-sm text-gray-500">超时预警</p>
        <div class="flex items-center gap-3 mt-1">
          <p class="text-2xl font-bold text-orange-600">{{ stats.overdue + stats.warning }}</p>
          <span v-if="stats.overdue > 0" class="text-xs text-red-600">已超时{{ stats.overdue }}</span>
          <span v-if="stats.warning > 0" class="text-xs text-orange-600">即将到期{{ stats.warning }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">搜索:</span>
          <el-input
            v-model="filters.searchTerm"
            placeholder="搜索任务编号/名称"
            class="w-48"
            clearable
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">紧急程度:</span>
          <el-select v-model="filters.urgencyFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="普通" value="normal" />
            <el-option label="紧急" value="urgent" />
            <el-option label="非常紧急" value="critical" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">状态:</span>
          <el-select v-model="filters.statusFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="待接受" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">超时筛选:</span>
          <el-select v-model="filters.overdueFilter" placeholder="不限" class="w-28" clearable>
            <el-option label="不限" value="" />
            <el-option label="全部超时" value="all" />
            <el-option label="已超时" value="overdue" />
            <el-option label="即将到期" value="warning" />
          </el-select>
        </div>

        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>

        <div class="ml-auto flex gap-2">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增
          </el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedTasks" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="taskCode" label="任务编号" width="130" />
        <el-table-column prop="title" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="tempTaskType" label="任务类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.tempTaskType)" size="small">
              {{ row.tempTaskType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workLocation" label="工作地点" width="120" show-overflow-tooltip />
        <el-table-column prop="assigneeName" label="执行人" width="100" />
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column prop="urgency" label="紧急程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getUrgencyType(row.urgency)" size="small">
              {{ getUrgencyText(row.urgency) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTasks.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 统计数据
const stats = ref({
  total,
  pending,
  inProgress,
  completed,
  critical,
  overdue,
  warning: 0
})

// 筛选条件
const filters = ref({
  searchTerm: '',
  urgencyFilter: '',
  statusFilter: '',
  overdueFilter: ''
})

// 分页
const pagination = ref({
  currentPage,
  pageSize: 10
})

// 加载状态
const loading = ref(false)

// 任务数据
const tasks = ref([
  {
    id: '1',
    taskCode: 'TT202401001',
    title: '紧急病虫害防治',
    tempTaskType: '病虫害防治',
    workLocation: '1号大棚',
    assigneeName: '张三',
    dueDate: '2024-01-20',
    urgency: 'critical',
    status: 'pending',
    priority: 'urgent',
    description: '发现番茄叶霉病，需要紧急处理',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    taskCode: 'TT202401002',
    title: '临时浇水任务',
    tempTaskType: '浇水',
    workLocation: '2号大棚',
    assigneeName: '李四',
    dueDate: '2024-01-18',
    urgency: 'normal',
    status: 'in_progress',
    priority: 'normal',
    description: '由于近期降雨不足，需要临时增加浇水',
    createdAt: '2024-01-14'
  }
])

// 过滤后的任务
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    if (filters.value.searchTerm && !task.taskCode.includes(filters.value.searchTerm) && !task.title.includes(filters.value.searchTerm)) {
      return false
    }
    if (filters.value.urgencyFilter && task.urgency !== filters.value.urgencyFilter) {
      return false
    }
    if (filters.value.statusFilter && task.status !== filters.value.statusFilter) {
      return false
    }
    return true
  })
})

// 分页后的任务
const paginatedTasks = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredTasks.value.slice(start, end)
})

// 获取任务类型标签颜色
const getTypeTagType = (type) => {
  const typeMap = {
    '施肥': 'success',
    '浇水': 'primary',
    '除草': 'warning',
    '修剪': 'info',
    '采收': 'danger',
    '病虫害防治': 'danger'
  }
  return typeMap[type] || ''
}

// 获取紧急程度类型
const getUrgencyType = (urgency) => {
  const typeMap = {
    critical: 'danger',
    urgent: 'warning',
    normal: 'info'
  }
  return typeMap[urgency] || 'info'
}

// 获取紧急程度文本
const getUrgencyText = (urgency) => {
  const textMap = {
    critical: '非常紧急',
    urgent: '紧急',
    normal: '普通'
  }
  return textMap[urgency] || '普通'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待接受',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
}

// 重置
const handleReset = () => {
  filters.value = {
    searchTerm: '',
    urgencyFilter: '',
    statusFilter: '',
    overdueFilter: ''
  }
  pagination.value.currentPage = 1
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增临时任务 - 功能待实现')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能 - 待实现')
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看任务: ${row.taskCode}`)
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑任务: ${row.taskCode}`)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除任务 "${row.title}" 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 分页大小改变
const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

// 页码改变
const handlePageChange = (page) => {
  pagination.value.currentPage = page
}
</script>
