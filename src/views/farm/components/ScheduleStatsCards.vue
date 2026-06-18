<!--
  ScheduleStatsCards.vue - 排班统计卡片（4 张）
  V1.1 SchedulePage.tsx 顶部统计 1:1 对齐
-->
<template>
  <div class="grid grid-cols-4 gap-3">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <el-icon :size="16" class="text-blue-600"><Calendar /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">今日排班</p>
          <p class="text-lg font-bold text-gray-800">{{ todayCount }}</p>
        </div>
      </div>
    </div>
    <div class="bg-green-50 border border-green-200 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <el-icon :size="16" class="text-green-600"><Clock /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">本周已执行</p>
          <p class="text-lg font-bold text-gray-800">{{ executedCount }}</p>
        </div>
      </div>
    </div>
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <el-icon :size="16" class="text-amber-600"><User /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">待调班申请</p>
          <p class="text-lg font-bold text-gray-800">{{ pendingSwapCount }}</p>
        </div>
      </div>
    </div>
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <el-icon :size="16" class="text-purple-600"><Setting /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">本月总数</p>
          <p class="text-lg font-bold text-gray-800">{{ monthCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Clock, User, Setting } from '@element-plus/icons-vue'

defineProps({
  todayCount: { type: Number, default: 0 },
  executedCount: { type: Number, default: 0 },
  pendingSwapCount: { type: Number, default: 0 },
  monthCount: { type: Number, default: 0 },
})
</script>
