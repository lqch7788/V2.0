<!--
  TaskPriorityBadge.vue - 任务优先级徽章
  V1.1 TaskPriorityBadge.tsx 1:1 迁移
-->
<template>
  <span :class="['px-2 py-0.5 text-xs rounded-full font-medium', className]">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const PRIORITY_MAP = {
  urgent: { label: '紧急', className: 'bg-red-100 text-red-700' },
  high: { label: '紧急', className: 'bg-red-100 text-red-700' },
  medium: { label: '重要', className: 'bg-yellow-100 text-yellow-700' },
  low: { label: '一般', className: 'bg-gray-100 text-gray-700' },
  normal: { label: '普通', className: 'bg-gray-100 text-gray-700' },
}

const props = defineProps({
  priority: { type: String, default: 'normal' },
})

const config = computed(() => PRIORITY_MAP[props.priority] || PRIORITY_MAP.normal)
const label = computed(() => config.value.label)
const className = computed(() => config.value.className)
</script>