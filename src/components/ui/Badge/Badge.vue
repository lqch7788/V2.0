<template>
  <span :class="['ui-badge', variantClass, sizeClass]">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default' // default, success, warning, danger, info
  },
  size: {
    type: String,
    default: 'default' // default, sm, lg
  }
})

const variantClass = computed(() => {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    processing: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    disabled: 'bg-gray-100 text-gray-400',
    cancelled: 'bg-gray-100 text-gray-400'
  }
  return variants[props.variant] || variants.default
})

const sizeClass = computed(() => {
  const sizes = {
    default: 'px-2 py-0.5 text-xs',
    sm: 'px-1.5 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  }
  return sizes[props.size] || sizes.default
})
</script>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
