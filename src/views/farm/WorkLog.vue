<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Document /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">工作日志</h1>
          <p class="text-xs text-gray-500">农事工作日志记录</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <WorkLogPanel />
    </div>
  </div>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
import WorkLogPanel from './components/WorkLogPanel.vue'
</script>
