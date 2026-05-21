<template>
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
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="onOpenSmartDispatch">智能派工</el-button>
        <el-button type="primary" @click="onOpenDailyPlan">每日规划</el-button>
        <el-button type="primary" @click="onOpenMonthlyPlan">月度规划</el-button>
      </div>
    </div>

    <!-- 任务统计卡片区域 - 一排9列 -->
    <div class="grid grid-cols-9 gap-3">
      <!-- 待办任务 -->
      <StatCardItem
        :icon="'Document'"
        label="待办任务"
        :value="stats.pendingTasks"
        icon-color="text-blue-500"
      />
      <!-- 进行中任务 -->
      <StatCardItem
        :icon="'Clock'"
        label="进行中"
        :value="stats.inProgressTasks"
        icon-color="text-orange-500"
        value-color="text-orange-600"
      />
      <!-- 今日完成 -->
      <StatCardItem
        :icon="'CircleCheck'"
        label="今日完成"
        :value="stats.todayCompleted"
        icon-color="text-green-500"
        value-color="text-green-600"
      />
      <!-- 紧急问题 -->
      <StatCardItem
        :icon="'Warning'"
        label="紧急问题"
        :value="stats.urgentProblems"
        icon-color="text-red-500"
        value-color="text-red-600"
      />
      <!-- 今日巡查 -->
      <StatCardItem
        :icon="'Odometer'"
        label="今日巡查"
        :value="stats.todayInspections"
        icon-color="text-purple-500"
      />
      <!-- 累计巡查 -->
      <StatCardItem
        :icon="'Document'"
        label="累计巡查"
        :value="stats.totalInspections"
        icon-color="text-indigo-500"
      />
      <!-- 异常巡查 -->
      <StatCardItem
        :icon="'Close'"
        label="异常巡查"
        :value="stats.abnormalInspections"
        icon-color="text-red-400"
        value-color="text-red-500"
      />
      <!-- 待处理问题 -->
      <StatCardItem
        :icon="'WarnTriangleFilled'"
        label="待处理问题"
        :value="stats.pendingProblems"
        icon-color="text-amber-500"
        value-color="text-amber-600"
      />
      <!-- 已处理问题 -->
      <StatCardItem
        :icon="'SuccessFilled'"
        label="已处理问题"
        :value="stats.processedProblems"
        icon-color="text-teal-500"
        value-color="text-teal-600"
      />
    </div>
  </div>
</template>

<script setup>
import { Promotion, Clock, CircleCheck, Warning, Odometer, Document, Close, WarnTriangleFilled, SuccessFilled } from '@element-plus/icons-vue'

defineProps({})

// StatCardItem 子组件
const StatCardItem = {
  props: ['icon', 'label', 'value', 'iconColor', 'valueColor'],
  components: { Clock, CircleCheck, Warning, Odometer, Document, Close, WarnTriangleFilled, SuccessFilled },
  template: `
    <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 px-3 py-2">
      <div class="flex items-center justify-between gap-2">
        <div>
          <p class="text-xs text-gray-500">{{ label }}</p>
          <p :class="['text-xl font-bold', valueColor || 'text-gray-900']">{{ value }}</p>
        </div>
        <el-icon :size="20" :class="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  `
}
</script>
