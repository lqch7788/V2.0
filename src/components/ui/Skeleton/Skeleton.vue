<template>
  <div :class="['ui-skeleton', { 'animate-pulse': animated }]">
    <template v-if="rows > 0">
      <div
        v-for="i in rows"
        :key="i"
        class="skeleton-line"
        :style="{
          width: i === rows && lastWidth ? lastWidth : '100%',
          height: `${lineHeight}px`
        }"
      />
    </template>
    <slot v-else />
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Number,
    default: 3
  },
  lineHeight: {
    type: Number,
    default: 16
  },
  lastWidth: {
    type: String,
    default: '60%'
  },
  animated: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.ui-skeleton {
  width: 100%;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
}

.animate-pulse .skeleton-line {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
