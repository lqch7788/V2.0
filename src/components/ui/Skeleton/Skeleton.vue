<template>
  <div class="animate-pulse bg-gray-200" :class="variantClass">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'rectangular' }
})

const variantClass = computed(() => ({
  text: 'h-4 rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg'
}[props.variant] || 'rounded-lg'))
</script>
