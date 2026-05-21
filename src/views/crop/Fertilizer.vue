<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><RefreshRight /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">施肥管理</h1>
          <p class="text-xs text-gray-500">作物施肥记录与管理</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <el-empty description="施肥管理页面建设中..." />
    </div>
  </div>
</template>

<script setup>
import { RefreshRight } from '@element-plus/icons-vue'
</script>
