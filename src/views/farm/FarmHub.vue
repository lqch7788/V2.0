<template>
  <div class="space-y-6 p-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Grape /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">农事总览</h1>
          <p class="text-gray-500">农场资产与作业情况总览</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <el-icon :size="24" class="text-emerald-600"><Grid /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">土地总面积</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.totalArea }} <span class="text-sm font-normal">亩</span></p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" class="text-blue-600"><House /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">温室数量</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.greenhouseCount }} <span class="text-sm font-normal">个</span></p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon :size="24" class="text-amber-600"><Tools /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">设备数量</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.deviceCount }} <span class="text-sm font-normal">台</span></p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">快捷入口</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <router-link
          to="/farm/record"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
        >
          <el-icon :size="32" class="text-emerald-600 mb-2"><Folder /></el-icon>
          <span class="text-sm font-medium text-gray-700">农事记录</span>
        </router-link>

        <router-link
          to="/farm/inspection"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <el-icon :size="32" class="text-blue-600 mb-2"><View /></el-icon>
          <span class="text-sm font-medium text-gray-700">巡检管理</span>
        </router-link>

        <router-link
          to="/farm/task"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <el-icon :size="32" class="text-purple-600 mb-2"><List /></el-icon>
          <span class="text-sm font-medium text-gray-700">任务中心</span>
        </router-link>

        <router-link
          to="/farm/schedule"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all"
        >
          <el-icon :size="32" class="text-amber-600 mb-2"><Calendar /></el-icon>
          <span class="text-sm font-medium text-gray-700">排班调度</span>
        </router-link>

        <router-link
          to="/farm/dispatch"
          class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all"
        >
          <el-icon :size="32" class="text-red-600 mb-2"><Operation /></el-icon>
          <span class="text-sm font-medium text-gray-700">智能派工</span>
        </router-link>
      </div>
    </div>

    <!-- 今日作业情况 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">今日作业情况</h3>
      <el-table :data="todayTasks" style="width: 100%">
        <el-table-column prop="taskCode" label="任务编号" width="120" />
        <el-table-column prop="title" label="任务名称" min-width="180" />
        <el-table-column prop="typeName" label="任务类型" width="100" />
        <el-table-column prop="zone" label="作业区域" width="100" />
        <el-table-column prop="assigneeName" label="执行人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Grape, Grid, House, Tools, Folder, View, List, Calendar, Operation } from '@element-plus/icons-vue'

// 统计数据
const stats = ref({
  totalArea: 500,
  greenhouseCount: 20,
  deviceCount: 45
})

// 今日作业
const todayTasks = ref([
  { taskCode: 'NS20240115001', title: '番茄浇水任务', typeName: '灌溉', zone: '东区1号棚', assigneeName: '张三', status: 'in_progress', statusText: '进行中' },
  { taskCode: 'NS20240115002', title: '黄瓜施肥作业', typeName: '施肥', zone: '东区2号棚', assigneeName: '李四', status: 'pending', statusText: '待执行' },
  { taskCode: 'NS20240115003', title: '茄子除草任务', typeName: '除草', zone: '西区1号棚', assigneeName: '王五', status: 'completed', statusText: '已完成' },
])

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    overdue: 'danger'
  }
  return typeMap[status] || 'info'
}

onMounted(() => {
  // 加载统计数据
})
</script>
