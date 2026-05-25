<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><List /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">我的任务</h1>
          <p class="text-gray-500">查看和管理分配给您的任务</p>
        </div>
      </div>
    </div>

    <!-- 任务面板 -->
    <MyTasksPanel />
  </div>
</template>

<script setup>
import { List } from '@element-plus/icons-vue'
import MyTasksPanel from './components/MyTasksPanel.vue'
</script>
