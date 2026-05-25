<template>
  <!-- 页面头部组件 - 对应V1.1 PageHeader.tsx -->
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- 左侧图标区域 - 渐变背景 -->
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <Goods />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
          <p class="text-gray-500">{{ subtitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Goods } from '@element-plus/icons-vue'

/**
 * 页面头部组件
 * @property {string} title - 页面标题
 * @property {string} [subtitle] - 页面副标题
 */
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>
