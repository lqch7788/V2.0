<!--
  农场 Hub 页面头部
  对标 V1.1 src/components/farm/hub/FarmHubHeader.tsx
-->
<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
        <el-icon :size="24" color="white"><HomeFilled /></el-icon>
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">农事 Hub</h1>
        <p class="text-gray-500 mt-1">农事任务一站式管理中心</p>
      </div>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { HomeFilled } from '@element-plus/icons-vue'
</script>