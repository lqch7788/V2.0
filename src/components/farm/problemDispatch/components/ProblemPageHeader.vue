<template>
  <!-- 问题分派页面头部 - 从V1.1 ProblemPageHeader.tsx 1:1迁移 -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
        <el-icon :size="20" class="text-white"><Promotion /></el-icon>
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ title }}</h1>
        <p class="text-sm text-gray-500">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Promotion } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, default: '问题分派' },
  subtitle: { type: String, default: '将巡检发现的问题分派给员工处理' },
})
</script>
