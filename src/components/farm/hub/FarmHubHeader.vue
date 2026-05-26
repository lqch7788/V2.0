<template>
  <!-- 顶部统计看板 - 与V1.1 FarmHubHeader 1:1一致 -->
  <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
    <!-- 顶部导航栏 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Promotion /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">农事任务中心</h1>
          <p class="text-gray-500">智能排程与任务调度管理中心</p>
        </div>
      </div>
    </div>

    <!-- 任务统计卡片区域 - 一排9列 -->
    <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
      <!-- 待办任务 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">待办任务</p>
            <p class="text-xl font-bold text-gray-900">{{ stats.pendingTasks }}</p>
          </div>
          <el-icon :size="20" class="text-blue-500"><Document /></el-icon>
        </div>
      </div>

      <!-- 进行中任务 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">进行中</p>
            <p class="text-xl font-bold text-orange-600">{{ stats.inProgressTasks }}</p>
          </div>
          <el-icon :size="20" class="text-orange-500"><Clock /></el-icon>
        </div>
      </div>

      <!-- 今日完成 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">今日完成</p>
            <p class="text-xl font-bold text-green-600">{{ stats.todayCompleted }}</p>
          </div>
          <el-icon :size="20" class="text-green-500"><CircleCheck /></el-icon>
        </div>
      </div>

      <!-- 紧急问题 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">紧急问题</p>
            <p class="text-xl font-bold text-red-600">{{ stats.urgentProblems }}</p>
          </div>
          <el-icon :size="20" class="text-red-500"><Warning /></el-icon>
        </div>
      </div>

      <!-- 今日巡查 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">今日巡查</p>
            <p class="text-xl font-bold text-gray-900">{{ stats.todayInspections }}</p>
          </div>
          <el-icon :size="20" class="text-purple-500"><Odometer /></el-icon>
        </div>
      </div>

      <!-- 累计巡查 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">累计巡查</p>
            <p class="text-xl font-bold text-gray-900">{{ stats.totalInspections }}</p>
          </div>
          <el-icon :size="20" class="text-indigo-500"><Document /></el-icon>
        </div>
      </div>

      <!-- 异常巡查 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">异常巡查</p>
            <p class="text-xl font-bold text-red-500">{{ stats.abnormalInspections }}</p>
          </div>
          <el-icon :size="20" class="text-red-400"><Close /></el-icon>
        </div>
      </div>

      <!-- 待处理问题 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">待处理问题</p>
            <p class="text-xl font-bold text-amber-600">{{ stats.pendingProblems }}</p>
          </div>
          <el-icon :size="20" class="text-amber-500"><WarnTriangleFilled /></el-icon>
        </div>
      </div>

      <!-- 已处理问题 -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">已处理问题</p>
            <p class="text-xl font-bold text-teal-600">{{ stats.processedProblems }}</p>
          </div>
          <el-icon :size="20" class="text-teal-500"><SuccessFilled /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/** 农场Hub头部统计看板 - 从V1.1 FarmHubHeader.tsx 1:1迁移 */
import {
  Promotion, Clock, CircleCheck, Warning,
  Odometer, Document, Close, WarnTriangleFilled, SuccessFilled,
} from '@element-plus/icons-vue'

defineProps({
  /** Hub统计数据 */
  stats: {
    type: Object,
    default: () => ({
      pendingTasks: 0,
      inProgressTasks: 0,
      todayCompleted: 0,
      urgentProblems: 0,
      todayInspections: 0,
      totalInspections: 0,
      abnormalInspections: 0,
      pendingProblems: 0,
      processedProblems: 0,
    }),
  },
})

</script>
