<!--
  任务派发页面头部
  对标 V1.1 src/components/farm/taskDispatch/components/PageHeader.tsx
-->
<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
        <el-icon :size="24" color="white"><Promotion /></el-icon>
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <p class="text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { Promotion } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>