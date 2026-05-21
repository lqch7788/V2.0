<template>
  <div class="space-y-4">
    <!-- 任务类型标签页筛选 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <el-radio-group v-model="taskFilter" @change="handleFilterChange">
        <el-radio-button label="all">全部 ({{ taskCounts.all }})</el-radio-button>
        <el-radio-button label="problem">问题处理 ({{ taskCounts.problem }})</el-radio-button>
        <el-radio-button label="production">生产任务 ({{ taskCounts.production }})</el-radio-button>
        <el-radio-button label="temp">临时任务 ({{ taskCounts.temp }})</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 任务列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <el-table :data="paginatedTasks" style="width: 100%" v-loading="loading" class="min-w-[1200px]">
          <!-- 生产任务列 -->
          <template v-if="taskFilter === 'production' || taskFilter === 'all'">
            <el-table-column prop="taskCode" label="任务ID" width="120" />
            <el-table-column prop="typeName" label="任务类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.typeName || '农事任务' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="field" label="任务区域" width="120" show-overflow-tooltip />
            <el-table-column prop="crop" label="作物" width="100" />
            <el-table-column prop="assigneeName" label="负责人" width="100" />
            <el-table-column prop="planStart" label="计划开始" width="120" />
            <el-table-column prop="planEnd" label="计划结束" width="120" />
            <el-table-column prop="estimatedHours" label="任务工时" width="80">
              <template #default="{ row }">
                {{ row.estimatedHours || row.estimatedDays * 8 || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.progress || 0" :stroke-width="10" />
              </template>
            </el-table-column>
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
            <el-table-column prop="remarks" label="备注" width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="handleAccept(row)" v-if="row.status === 'pending'">接单</el-button>
                <el-button link type="success" size="small" @click="handleFeedback(row)" v-if="row.status === 'in_progress'">反馈</el-button>
              </template>
            </el-table-column>
          </template>

          <!-- 临时任务列 -->
          <template v-else-if="taskFilter === 'temp'">
            <el-table-column prop="taskCode" label="任务编号" width="120" />
            <el-table-column prop="title" label="任务名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="tempTaskType" label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.tempTaskType || row.typeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="workLocation" label="工作地点" width="120" />
            <el-table-column prop="assigneeName" label="负责人" width="100" />
            <el-table-column prop="startDate" label="开始时间" width="120" />
            <el-table-column prop="dueDate" label="预计结束" width="120" />
            <el-table-column prop="workerCount" label="人工" width="60" />
            <el-table-column prop="totalEstimatedHours" label="总工时" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="urgency" label="紧急程度" width="100">
              <template #default="{ row }">
                <el-tag :type="getUrgencyType(row.urgency)" size="small">
                  {{ getUrgencyText(row.urgency) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button link type="success" size="small" @click="handleFeedback(row)">反馈</el-button>
              </template>
            </el-table-column>
          </template>

          <!-- 问题处理列 -->
          <template v-else-if="taskFilter === 'problem'">
            <el-table-column prop="recordCode" label="巡查编号" width="120" />
            <el-table-column prop="inspectionType" label="巡查类型" width="100" />
            <el-table-column prop="submitterName" label="提交人" width="100" />
            <el-table-column prop="location" label="位置/对象" width="120" />
            <el-table-column prop="checkDate" label="巡查日期" width="120" />
            <el-table-column prop="checkResult" label="巡查结果" width="100" />
            <el-table-column prop="issueCategories" label="问题分类" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="danger">{{ row.issueCategories?.[0] || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="issueSeverity" label="严重程度" width="100">
              <template #default="{ row }">
                <el-tag :type="getSeverityType(row.issueSeverity)" size="small">
                  {{ row.issueSeverity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="问题照片" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.photos && row.photos.length > 0" size="small">有</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="feedbackStatus" label="反馈状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.feedbackStatus || row.status)" size="small">
                  {{ getStatusText(row.feedbackStatus || row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="feedbackUsers" label="反馈人员" width="100" />
            <el-table-column prop="processProgress" label="处理进度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.processProgress || row.progress || 0" :stroke-width="10" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button link type="success" size="small" @click="handleFeedback(row)">反馈</el-button>
              </template>
            </el-table-column>
          </template>

          <!-- 空状态 -->
          <template #empty>
            <div class="py-12 text-center text-gray-400">
              <el-icon :size="48" class="mb-4"><DocumentDelete /></el-icon>
              <p>暂无任务</p>
            </div>
          </template>
        </el-table>
      </div>

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
import { DocumentDelete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 任务筛选类型
type TaskFilterType = 'all' | 'problem' | 'production' | 'temp'

// 当前筛选
const taskFilter = ref('all')

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
    taskCode: 'NS202401001',
    title: '番茄施肥作业',
    typeName: '施肥',
    field: '1号大棚',
    crop: '番茄',
    assigneeName: '张三',
    assignee: '张三',
    planStart: '2024-01-15',
    planEnd: '2024-01-16',
    estimatedHours,
    estimatedDays,
    progress,
    priority: 'high',
    status: 'in_progress',
    remarks: '按计划执行'
  },
  {
    id: '2',
    taskCode: 'TT202401001',
    title: '紧急病虫害防治',
    tempTaskType: '病虫害防治',
    workLocation: '2号大棚',
    assigneeName: '李四',
    startDate: '2024-01-15',
    dueDate: '2024-01-20',
    workerCount,
    totalEstimatedHours,
    urgency: 'urgent',
    status: 'pending'
  },
  {
    id: '3',
    taskCode: 'NS202401002',
    title: '黄瓜灌溉任务',
    typeName: '灌溉',
    field: '3号大棚',
    crop: '黄瓜',
    assigneeName: '王五',
    planStart: '2024-01-14',
    planEnd: '2024-01-14',
    estimatedHours,
    progress,
    priority: 'normal',
    status: 'completed',
    remarks: '已完成'
  }
])

// 任务统计
const taskCounts = computed(() => ({
  all: tasks.value.length,
  problem,
  production: tasks.value.filter(t => t.taskCode?.startsWith('NS')).length,
  temp: tasks.value.filter(t => t.taskCode?.startsWith('TT')).length
}))

// 过滤后的任务
const filteredTasks = computed(() => {
  switch (taskFilter.value) {
    case 'production':
      return tasks.value.filter(t => t.taskCode?.startsWith('NS'))
    case 'temp':
      return tasks.value.filter(t => t.taskCode?.startsWith('TT'))
    case 'problem':
      return []
    default:
      return tasks.value
  }
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
    low: 'info',
    normal: 'info'
  }
  return typeMap[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const textMap = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低',
    normal: '普通'
  }
  return textMap[priority] || '普通'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    rejected: 'danger',
    accepted: 'primary'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待接受',
    accepted: '已接受',
    in_progress: '进行中',
    waiting_acceptance: '待验收',
    completed: '已完成',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return textMap[status] || status
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

// 获取严重程度类型
const getSeverityType = (severity) => {
  const typeMap = {
    '严重': 'danger',
    '中等': 'warning',
    '轻微': 'info'
  }
  return typeMap[severity] || 'info'
}

// 筛选变化
const handleFilterChange = (filter) => {
  pagination.value.currentPage = 1
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看任务: ${row.taskCode}`)
}

// 接单
const handleAccept = (row) => {
  ElMessage.success(`已接受任务: ${row.taskCode}`)
}

// 反馈
const handleFeedback = (row) => {
  ElMessage.info(`提交反馈: ${row.taskCode}`)
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
