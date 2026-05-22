<template>
  <div class="space-y-4">
    <!-- 页面标题 - 任务工单管理 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="20" class="text-white"><Check /></el-icon>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">任务工单管理</h2>
          <p class="text-xs text-gray-500">管理农事任务派发、执行和验收</p>
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
          <span class="text-sm text-gray-500">任务类型:</span>
          <el-select v-model="filters.typeFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="施肥" value="fertilization" />
            <el-option label="灌溉" value="irrigation" />
            <el-option label="修剪" value="pruning" />
            <el-option label="植保" value="pesticide" />
            <el-option label="采收" value="harvest" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">状态:</span>
          <el-select v-model="filters.statusFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="待执行" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">作业模式:</span>
          <el-select v-model="filters.modeFilter" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="派工" value="dispatch" />
            <el-option label="自主" value="self" />
          </el-select>
        </div>

        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>

        <div class="ml-auto flex gap-2">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增
          </el-button>
          <el-button @click="handleBatchEdit">编辑</el-button>
          <el-button type="danger" @click="handleBatchDelete">删除</el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedTasks" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="taskCode" label="任务编号" width="130" />
        <el-table-column prop="title" label="任务标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="typeName" label="任务类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="greenhouseName" label="作业区域" width="120" show-overflow-tooltip />
        <el-table-column prop="assigneeName" label="执行人" width="100" />
        <el-table-column prop="planStart" label="计划开始" width="120" />
        <el-table-column prop="dueDate" label="计划结束" width="120" />
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
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
import { Check, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = ref({
  searchTerm: '',
  typeFilter: '',
  statusFilter: '',
  modeFilter: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 加载状态
const loading = ref(false)

// 任务数据
const tasks = ref([
  {
    id: '1',
    taskCode: 'NS202401001',
    title: '番茄施肥作业',
    typeName: '施肥',
    greenhouseName: '1号大棚',
    assigneeName: '张三',
    planStart: '2024-01-15',
    dueDate: '2024-01-16',
    priority: 'high',
    status: 'pending',
    mode: 'dispatch'
  },
  {
    id: '2',
    taskCode: 'NS202401002',
    title: '黄瓜灌溉任务',
    typeName: '灌溉',
    greenhouseName: '2号大棚',
    assigneeName: '李四',
    planStart: '2024-01-14',
    dueDate: '2024-01-15',
    priority: 'medium',
    status: 'in_progress',
    mode: 'dispatch'
  },
  {
    id: '3',
    taskCode: 'NS202401003',
    title: '番茄修剪',
    typeName: '修剪',
    greenhouseName: '3号大棚',
    assigneeName: '王五',
    planStart: '2024-01-13',
    dueDate: '2024-01-14',
    priority: 'low',
    status: 'completed',
    mode: 'self'
  }
])

// 过滤后的任务
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    if (filters.value.searchTerm && !task.taskCode.includes(filters.value.searchTerm) && !task.title.includes(filters.value.searchTerm)) {
      return false
    }
    if (filters.value.typeFilter && task.typeName !== filters.value.typeFilter) {
      return false
    }
    if (filters.value.statusFilter && task.status !== filters.value.statusFilter) {
      return false
    }
    if (filters.value.modeFilter && task.mode !== filters.value.modeFilter) {
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

// 获取优先级类型
const getPriorityType = (priority) => {
  const typeMap = {
    urgent: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const textMap = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || '普通'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待执行',
    in_progress: '进行中',
    completed: '已完成'
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
    typeFilter: '',
    statusFilter: '',
    modeFilter: ''
  }
  pagination.value.currentPage = 1
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增任务 - 功能待实现')
}

// 批量编辑
const handleBatchEdit = () => {
  ElMessage.info('批量编辑 - 功能待实现')
}

// 批量删除
const handleBatchDelete = () => {
  ElMessage.info('批量删除 - 功能待实现')
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
