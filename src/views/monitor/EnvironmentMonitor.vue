<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Monitor /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">环境监控</h1>
          <p class="text-xs text-gray-500">种植环境实时监控</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <el-empty description="环境监控页面建设中..." />
    </div>
  </div>
</template>

<script setup>
import { Monitor } from '@element-plus/icons-vue'
</script>
