<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><OfficeBuilding /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">仓库概览</h1>
          <p class="text-xs text-gray-500">仓库库存总览</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <el-empty description="仓库概览页面建设中..." />
    </div>
  </div>
</template>

<script setup>
import { OfficeBuilding } from '@element-plus/icons-vue'
</script>
