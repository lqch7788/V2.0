<template>
  <div :class="['ui-space', directionClass, alignClass, wrapClass]">
    <div v-for="(child, index) in children" :key="index" class="space-item shrink-0">
      <component :is="child" />
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  direction: { type: String, default: 'horizontal' }, // horizontal, vertical
  size: { type: [String, Number], default: 'middle' }, // small, middle, large, number
  align: { type: String, default: 'center' }, // start, end, center, baseline
  wrap: { type: Boolean, default: false }
})

const slots = useSlots()
const children = computed(() => slots.default?.() || [])

const directionClass = computed(() => props.direction === 'vertical' ? 'flex-col' : 'flex-row')

const alignClass = computed(() => {
  const alignMap = { start: 'items-start', end: 'items-end', center: 'items-center', baseline: 'items-baseline' }
  return alignMap[props.align] || alignMap.center
})

const wrapClass = computed(() => props.wrap ? 'flex-wrap' : '')
</script>

<style scoped>
.ui-space {
  display: flex;
}

.space-item {
  flex-shrink: 0;
}

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-8 { gap: 2rem; }
</style>
