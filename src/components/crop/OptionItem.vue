<template>
  <div
    class="w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-emerald-50 cursor-pointer"
    :class="{ 'bg-emerald-50': isSelected }"
    @click="$emit('select', option)"
  >
    <el-icon class="text-emerald-500 mt-0.5 flex-shrink-0"><Leaf /></el-icon>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-900 text-sm">{{ option.label }}</span>
        <span class="text-xs text-gray-400 font-mono">{{ option.value }}</span>
      </div>
      <div class="text-xs text-gray-500 truncate">{{ option.fullPath }}</div>
    </div>
    <span v-if="isSelected" class="text-xs text-emerald-600 font-medium">已选</span>
  </div>
</template>

<script setup>
import { Leaf } from 'lucide-vue-next'

defineProps({
  option: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>
