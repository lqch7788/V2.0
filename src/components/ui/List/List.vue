<template>
  <div class="space-y-1" :class="className">
    <slot />
  </div>
</template>

<script setup>
defineProps({ className: { type: String, default: '' } })
</script>
