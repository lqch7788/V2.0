<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-blue-500 to-indigo-600">
          <el-icon :size="20" class="text-white">
            <Memo />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">今日待办</span>
      </div>
      <span class="text-2xl font-bold text-blue-600">{{ stats.total }}</span>
    </div>
    <div class="space-y-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-emerald-500"><Grape /></el-icon>
          农事任务
        </span>
        <span class="font-medium">{{ stats.farming }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-cyan-500"><Setting /></el-icon>
          设备维护
        </span>
        <span class="font-medium">{{ stats.equipment }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-amber-500"><Calendar /></el-icon>
          采收处理
        </span>
        <span class="font-medium">{{ stats.harvest }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-orange-500"><CircleCheck /></el-icon>
          待办审批
        </span>
        <span class="font-medium">{{ stats.approval }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Memo, Grape, Setting, Calendar, CircleCheck } from '@element-plus/icons-vue'

const stats = ref({
  total: 12,
  farming: 5,
  equipment: 3,
  harvest: 2,
  approval: 1
})
</script>
