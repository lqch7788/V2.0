<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Grid /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">智能调度</h1>
          <p class="text-xs text-gray-500">智能任务调度管理</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <SmartDispatchPanel />
    </div>
  </div>
</template>

<script setup>
import { Grid } from '@element-plus/icons-vue'
import SmartDispatchPanel from './components/SmartDispatchPanel.vue'
</script>
