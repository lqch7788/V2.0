<!--
  采收页面头部
  对标 V1.1 src/components/farm/harvest/components/HarvestPageHeader.tsx
-->
<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
        <el-icon :size="24" color="white"><Box /></el-icon>
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">采收管理</h1>
        <p class="text-gray-500 mt-1">采收任务登记与产量统计</p>
      </div>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { Box } from '@element-plus/icons-vue'
</script>