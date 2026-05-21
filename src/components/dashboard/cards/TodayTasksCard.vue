<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-blue-500 to-indigo-600">
          <el-icon :size="20" class="text-white">
            <Document />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">今日待办</span>
      </div>
      <span class="text-2xl font-bold text-blue-600">{{ todayTasksBreakdown.total }}</span>
    </div>
    <div class="space-y-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-emerald-500"><Sugar /></el-icon>
          农事任务
        </span>
        <span class="font-medium">{{ todayTasksBreakdown.farming }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-cyan-500"><Odometer /></el-icon>
          设备维护
        </span>
        <span class="font-medium">{{ todayTasksBreakdown.equipment }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-amber-500"><Calendar /></el-icon>
          采收处理
        </span>
        <span class="font-medium">{{ todayTasksBreakdown.harvest }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-orange-500"><SuccessFilled /></el-icon>
          待办审批
        </span>
        <span class="font-medium">{{ todayTasksBreakdown.approval }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document, Sugar, Odometer, Calendar, SuccessFilled } from '@element-plus/icons-vue'

defineProps({
  todayTasksBreakdown: Object
})
</script>
