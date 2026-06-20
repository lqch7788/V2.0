<!--
  农事记录页面头部
  对标 V1.1 src/components/farm/agriculture/components/AgricultureRecordPageHeader.tsx
-->
<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
        <el-icon :size="24" color="white"><Calendar /></el-icon>
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">农事记录</h1>
        <p class="text-gray-500 mt-1">种植施肥浇水等日常农事操作记录</p>
      </div>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { Calendar } from '@element-plus/icons-vue'
</script>