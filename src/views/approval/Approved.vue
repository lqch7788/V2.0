<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><CircleCheck /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">已审批</h1>
          <p class="text-xs text-gray-500">已完成的审批记录</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <el-empty description="已审批页面建设中..." />
    </div>
  </div>
</template>

<script setup>
import { CircleCheck } from '@element-plus/icons-vue'
</script>
