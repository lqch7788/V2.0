<template>
  <div class="flex flex-col items-center justify-center py-12 text-gray-500" :class="className">
    <el-icon :size="48" class="text-gray-300 mb-4"><FolderOpened /></el-icon>
    <p class="text-sm">{{ description || '暂无数据' }}</p>
    <slot />
  </div>
</template>

<script setup>
import { FolderOpened } from '@element-plus/icons-vue'
defineProps({ description: { type: String, default: '' }, className: { type: String, default: '' } })
</script>
