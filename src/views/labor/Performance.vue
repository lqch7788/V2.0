<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><DataAnalysis /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">绩效管理</h1>
          <p class="text-xs text-gray-500">员工绩效考核</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <PerformanceReview />
    </div>
  </div>
</template>

<script setup>
import { DataAnalysis } from '@element-plus/icons-vue'
import PerformanceReview from './components/PerformanceReview.vue'
</script>
