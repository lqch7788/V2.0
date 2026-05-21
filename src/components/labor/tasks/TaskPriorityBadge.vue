<template>
  <span :class="['px-2 py-0.5 text-xs rounded-full font-medium', config.className]">
    {{ config.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue' className: string }> = {
  high: {
    label: '紧急',
    className: 'bg-red-100 text-red-700',
  },
  medium: {
    label: '重要',
    className: 'bg-yellow-100 text-yellow-700',
  },
  low: {
    label: '一般',
    className: 'bg-gray-100 text-gray-700',
  },
}

const config = computed(() => priorityConfig[props.priority] || priorityConfig.low)
</script>
