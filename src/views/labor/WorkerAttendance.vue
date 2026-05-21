<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Clock /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">工人考勤</h1>
          <p class="text-xs text-gray-500">临时工人考勤管理</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <WorkerAttendancePanel />
    </div>
  </div>
</template>

<script setup>
import { Clock } from '@element-plus/icons-vue'
import WorkerAttendancePanel from './components/WorkerAttendancePanel.vue'
</script>
