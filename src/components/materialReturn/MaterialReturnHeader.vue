<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" color="#fff"><ArrowLeftRight /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">生产退料</h1>
          <p class="text-gray-500">生产退料记录管理</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftRight } from '@element-plus/icons-vue'
</script>
