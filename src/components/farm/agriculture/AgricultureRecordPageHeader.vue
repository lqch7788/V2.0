<template>
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
        <el-icon :size="24" class="text-white"><Sunny /></el-icon>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">农事操作记录</h1>
        <p class="text-sm text-gray-500">统一展示任务派发、临时任务、手动录入的操作记录</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4 mt-6">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <p class="text-sm opacity-90">全部记录</p>
        <p class="text-2xl font-bold">{{ stats.total }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
        <p class="text-sm opacity-90">任务派发</p>
        <p class="text-2xl font-bold">{{ stats.task }}</p>
      </div>
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
        <p class="text-sm opacity-90">临时任务</p>
        <p class="text-2xl font-bold">{{ stats.tempTask }}</p>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
        <p class="text-sm opacity-90">手动录入</p>
        <p class="text-2xl font-bold">{{ stats.manual }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sunny } from '@element-plus/icons-vue'

defineProps({})
</script>
