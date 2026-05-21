<template>
  <!-- KPI 卡片网格布局组件 -->
  <div
    :class="[
      'grid gap-4',
      columnsClass,
      compact ? '!gap-3' : ''
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({"columns":"4","compact":"false"})

const columnsClass = computed(() => {
  const col = props.columns
  if (col === 5) return 'grid-cols-2 md:grid-cols-5'
  if (col === 6) return 'grid-cols-2 md:grid-cols-6'
  if (col === 3) return 'grid-cols-1 md:grid-cols-3'
  if (col === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-4'
})
</script>
