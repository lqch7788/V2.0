<template>
  <div class="flex items-center" :class="className">
    <ol class="flex items-center flex-wrap gap-2">
      <li v-for="(item, index) in items" :key="index" class="inline-flex items-center">
        <a v-if="index < items.length - 1" :href="item.href || '#'" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">{{ item.label }}</a>
        <span v-else class="text-sm font-medium text-gray-900" aria-current="page">{{ item.label }}</span>
        <el-icon v-if="index < items.length - 1" :size="16" class="text-gray-400 ml-2"><ArrowRight /></el-icon>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  className: { type: String, default: '' }
})
</script>
