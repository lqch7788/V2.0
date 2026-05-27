<template>
  <div class="w-full" :class="className">
    <div class="relative">
      <div v-for="(item, index) in items" :key="index" class="relative flex gap-4 pb-6">
        <div class="flex flex-col items-center">
          <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10" :class="nodeClass(item.status)">
            <el-icon v-if="item.status === 'completed'" :size="20"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="item.status === 'processing'" :size="20"><Clock /></el-icon>
            <el-icon v-else :size="20"><CircleClose /></el-icon>
          </div>
          <div v-if="index < items.length - 1" class="w-0.5 h-full absolute top-8 left-4" :class="item.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'" />
        </div>
        <div class="flex-1 pt-1">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium" :class="item.status === 'pending' ? 'text-gray-400' : 'text-gray-900'">{{ item.title }}</h4>
            <span v-if="item.time" class="text-xs text-gray-500">{{ item.time }}</span>
          </div>
          <p v-if="item.description" class="text-sm mt-1" :class="item.status === 'pending' ? 'text-gray-400' : 'text-gray-500'">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CircleCheckFilled, Clock, CircleClose } from '@element-plus/icons-vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  className: { type: String, default: '' }
})

function nodeClass(status) {
  if (status === 'completed') return 'border-emerald-500 text-emerald-500'
  if (status === 'processing') return 'border-blue-500 text-blue-500 animate-pulse'
  return 'border-gray-400 text-gray-300'
}
</script>
