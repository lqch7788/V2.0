<template>
  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors" :class="variantClasses">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'default' }
})

const variantMap = {
  default: 'border-transparent bg-gray-900 text-gray-50',
  secondary: 'border-transparent bg-gray-100 text-gray-900',
  destructive: 'border-transparent bg-red-500 text-gray-50',
  outline: 'text-gray-950',
  success: 'border-transparent bg-green-100 text-green-800',
  warning: 'border-transparent bg-yellow-100 text-yellow-800',
  info: 'border-transparent bg-blue-100 text-blue-800'
}

const variantClasses = computed(() => variantMap[props.variant] || variantMap.default)
</script>
