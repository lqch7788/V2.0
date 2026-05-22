<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><List /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">任务列表</h1>
          <p class="text-xs text-gray-500">任务管理</p>
        </div>
      </div>
    </div>

    <!-- 任务管理面板 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <TaskExecutePanel />
    </div>
  </div>
</template>

<script setup>
import { List } from '@element-plus/icons-vue'
import TaskExecutePanel from './components/TaskExecutePanel.vue'
</script>
