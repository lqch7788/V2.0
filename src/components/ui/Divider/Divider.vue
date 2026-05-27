<template>
  <hr v-if="!$slots.default" class="w-full border-t my-4" :class="borderClass" />
  <div v-else class="flex items-center my-4">
    <div class="flex-1 border-t" :class="borderClass" />
    <span class="px-3 text-sm text-gray-500 whitespace-nowrap"><slot /></span>
    <div class="flex-1 border-t" :class="borderClass" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'solid' }
})

const borderClass = computed(() => ({
  solid: 'border-gray-200',
  dashed: 'border-dashed border-gray-400',
  dotted: 'border-dotted border-gray-400'
}[props.type] || 'border-gray-200'))
</script>
