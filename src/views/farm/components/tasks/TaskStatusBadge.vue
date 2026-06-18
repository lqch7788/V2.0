<!--
  TaskStatusBadge.vue - 任务状态徽章
  V1.1 TaskStatusBadge.tsx 1:1 迁移
-->
<template>
  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full', className]">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { TASK_STATUS_CLASS, TASK_STATUSES } from './taskConstants'

const props = defineProps({
  status: { type: String, default: 'pending' },
})

const label = computed(() => {
  return TASK_STATUSES.find(s => s.value === props.status)?.label || props.status
})

const className = computed(() => TASK_STATUS_CLASS[props.status] || 'bg-gray-100 text-gray-600')
</script>