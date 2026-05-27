<template>
  <div class="relative inline-flex" :class="className">
    <div class="inline-flex items-center justify-center rounded-full bg-gray-200 ring-2 ring-white overflow-hidden" :class="sizeClass" :style="src ? {} : {}">
      <img v-if="src" :src="src" :alt="alt" class="w-full h-full object-cover" />
      <span v-else class="font-medium text-gray-600" :class="textSize">{{ fallback }}</span>
    </div>
    <span v-if="status" class="absolute bottom-0 right-0 rounded-full border-2 border-white" :class="[statusSize, statusColor]" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fallback: { type: String, default: '' },
  size: { type: String, default: 'md' },
  status: { type: String, default: '' },
  className: { type: String, default: '' }
})

const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12', xl: 'w-16 h-16' }
const textSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' }
const statusSizeMap = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-3.5 h-3.5' }
const statusColorMap = { online: 'bg-green-500', offline: 'bg-gray-400', away: 'bg-yellow-500' }

const sizeClass = computed(() => sizeMap[props.size] || sizeMap.md)
const textSize = computed(() => textSizeMap[props.size] || textSizeMap.md)
const statusSize = computed(() => statusSizeMap[props.size] || statusSizeMap.md)
const statusColor = computed(() => statusColorMap[props.status] || '')
</script>
