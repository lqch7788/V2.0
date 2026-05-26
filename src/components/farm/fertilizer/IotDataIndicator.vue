<template>
  <!-- IoT数据指示灯 - 从V1.1 IotDataIndicator.tsx 1:1迁移 -->
  <span class="inline-flex items-center gap-1.5">
    <span :class="['w-2 h-2 rounded-full', statusClass]" />
    <span class="text-xs" :class="textClass">{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'offline' },
  label: { type: String, default: '' },
})

const statusMap = {
  online: { cls: 'bg-green-500', text: 'text-green-600', label: '在线' },
  offline: { cls: 'bg-gray-400', text: 'text-gray-500', label: '离线' },
  warning: { cls: 'bg-amber-500', text: 'text-amber-600', label: '警告' },
  error: { cls: 'bg-red-500', text: 'text-red-600', label: '异常' },
}

const statusClass = computed(() => statusMap[props.status]?.cls || 'bg-gray-400')
const textClass = computed(() => statusMap[props.status]?.text || 'text-gray-500')

const label = computed(() => {
  if (props.label) return props.label
  return statusMap[props.status]?.label || props.status
})
</script>
