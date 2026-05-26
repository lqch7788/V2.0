<template>
  <!-- 页面头部 - 从V1.1 PageHeader.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
        <el-icon :size="24" class="text-white"><Promotion /></el-icon>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <p class="text-gray-500">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Promotion } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, default: '农事任务派发' },
  subtitle: { type: String, default: '智能排程与任务调度管理中心' },
})
</script>
