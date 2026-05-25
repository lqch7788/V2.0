<template>
  <div class="space-y-6 p-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Grape /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">农事管理</h1>
          <p class="text-gray-500">智能排程与任务调度管理中心</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" class="text-blue-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">今日待办</p>
            <p class="text-2xl font-bold text-gray-800">{{ statusStats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <el-icon :size="24" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">进行中任务</p>
            <p class="text-2xl font-bold text-gray-800">{{ statusStats.inProgress }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon :size="24" class="text-amber-600"><Warning /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">超时预警</p>
            <p class="text-2xl font-bold text-gray-800">{{ statusStats.overdue }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">快捷入口</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <router-link
          to="/farm/task"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
        >
          <el-icon :size="32" class="text-emerald-600 mb-2"><List /></el-icon>
          <span class="text-sm font-medium text-gray-700">任务中心</span>
        </router-link>

        <router-link
          to="/farm/schedule"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <el-icon :size="32" class="text-blue-600 mb-2"><Calendar /></el-icon>
          <span class="text-sm font-medium text-gray-700">排班调度</span>
        </router-link>

        <router-link
          to="/farm/dispatch"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <el-icon :size="32" class="text-purple-600 mb-2"><Operation /></el-icon>
          <span class="text-sm font-medium text-gray-700">智能派工</span>
        </router-link>

        <router-link
          to="/farm/worklog"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all"
        >
          <el-icon :size="32" class="text-amber-600 mb-2"><Document /></el-icon>
          <span class="text-sm font-medium text-gray-700">工作日志</span>
        </router-link>

        <router-link
          to="/farm/temp-task"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all"
        >
          <el-icon :size="32" class="text-red-600 mb-2"><Clock /></el-icon>
          <span class="text-sm font-medium text-gray-700">临时任务</span>
        </router-link>
      </div>
    </div>

    <!-- 最近任务动态 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">最近任务动态</h3>
      <el-table :data="recentTasks" style="width: 100%">
        <el-table-column prop="taskCode" label="任务编号" width="120" />
        <el-table-column prop="title" label="任务名称" min-width="180" />
        <el-table-column prop="typeName" label="任务类型" width="100" />
        <el-table-column prop="assigneeName" label="执行人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Grape, Clock, CircleCheck, Warning, List, Calendar, Operation, Document } from '@element-plus/icons-vue'
import { useFarmTaskStore } from '@/stores/modules/farmTask'

const store = useFarmTaskStore()

/** 统计数据（来自 store 计算属性 statusStats） */
const statusStats = computed(() => store.statusStats)

/** 最近10条任务（按 updatedAt 倒序排列） */
const recentTasks = computed(() => {
  return [...store.filteredTasks]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 10)
})

/** 状态 → Element Plus Tag 类型映射 */
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    accepted: 'warning',
    in_progress: 'warning',
    waiting_acceptance: '',
    completed: 'success',
    cancelled: 'danger',
    abandoned: 'danger',
  }
  return typeMap[status] || 'info'
}

/** 状态 → 中文显示文本映射 */
const getStatusText = (status) => {
  const textMap = {
    pending: '待执行',
    accepted: '已接受',
    in_progress: '进行中',
    waiting_acceptance: '待验收',
    completed: '已完成',
    cancelled: '已取消',
    abandoned: '已废弃',
  }
  return textMap[status] || status
}

onMounted(() => {
  store.fetchTasks()
})
</script>
