<template>
  <div class="space-y-4">
    <!-- 统计卡片行 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 今日预警 -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-600 font-medium">今日预警</p>
            <p class="text-3xl font-bold text-blue-700 mt-1">{{ stats.todayCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
            <el-icon :size="24" class="text-blue-600"><Bell /></el-icon>
          </div>
        </div>
      </div>

      <!-- 本周预警 -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-purple-600 font-medium">本周预警</p>
            <p class="text-3xl font-bold text-purple-700 mt-1">{{ stats.weekCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
            <el-icon :size="24" class="text-purple-600"><Clock /></el-icon>
          </div>
        </div>
      </div>

      <!-- 待处理预警 -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-orange-600 font-medium">待处理预警</p>
            <p class="text-3xl font-bold text-orange-700 mt-1">{{ stats.pendingCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
            <el-icon :size="24" class="text-orange-600"><Warning /></el-icon>
          </div>
        </div>
      </div>

      <!-- 已处理预警 -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-600 font-medium">已处理预警</p>
            <p class="text-3xl font-bold text-green-700 mt-1">{{ stats.totalCount - stats.pendingCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
            <el-icon :size="24" class="text-green-600"><CircleCheck /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警等级分布 -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-700 mb-3">预警等级分布（待处理）</h3>
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="(config, level) in levelConfig"
          :key="level"
          :class="['flex items-center gap-3 p-3 rounded-lg border', config.bg]"
        >
          <el-icon :size="20" :class="config.color">
            <component :is="config.icon" />
          </el-icon>
          <div>
            <p :class="['text-sm font-medium', config.color]">{{ config.label }}</p>
            <p :class="['text-2xl font-bold', config.color]">{{ stats.byLevel[level] || 0 }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Bell, Clock, Warning, CircleCheck, WarningFilled, WarnTriangleFilled, CircleClose } from '@element-plus/icons-vue' icon: any; color: string; bg: string }> = {
  warning: {
    label: '一般提醒',
    icon,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  danger: {
    label: '需要注意',
    icon,
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
  },
  critical: {
    label: '紧急处理',
    icon,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
}
</script>
