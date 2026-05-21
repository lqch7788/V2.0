<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Connection /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">IoT监控</h1>
          <p class="text-xs text-gray-500">物联网设备监控</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <el-empty description="IoT监控页面建设中..." />
    </div>
  </div>
</template>

<script setup>
import { Connection } from '@element-plus/icons-vue'
</script>
