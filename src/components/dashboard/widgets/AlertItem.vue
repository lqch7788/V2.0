<template>
  <div v-if="message.type === 'alert'" class="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
    <el-icon :size="20" class="text-red-500 flex-shrink-0 mt-0.5">
      <WarningFilled />
    </el-icon>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-red-900">{{ message.title }}</p>
      <p class="text-xs text-red-600 mt-0.5 truncate">{{ message.content }}</p>
    </div>
    <span class="text-xs text-red-400">{{ formatTime(message.sendTime) }}</span>
  </div>
</template>

<script setup>
import { WarningFilled } from '@element-plus/icons-vue'

defineProps({})

const formatTime = (sendTime) => {
  return sendTime.split(' ')[1] || ''
}
</script>
