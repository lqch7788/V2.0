<!--
  TaskTypeTag.vue - 任务类型标签
  V1.1 TaskTypeTag.tsx 1:1 迁移
-->
<template>
  <span class="text-sm text-gray-700">{{ displayName }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { TASK_TYPES } from './taskConstants'

const props = defineProps({
  type: { type: String, default: '' },
  typeName: { type: String, default: '' },
})

const displayName = computed(() => {
  if (props.typeName) return props.typeName
  return TASK_TYPES.find(t => t.value === props.type)?.label || props.type || '-'
})
</script>