<template>
  <div class="inline-flex items-center" :class="className" :style="{ gap: gapMap[gap] || '8px' }">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  gap: { type: [String, Number], default: 'sm' },
  className: { type: String, default: '' }
})

const gapMap = { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' }
</script>
