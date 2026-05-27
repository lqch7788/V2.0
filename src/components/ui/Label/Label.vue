<template>
  <label class="text-sm font-medium leading-none mb-1.5 block peer-disabled:cursor-not-allowed peer-disabled:opacity-70" :class="className">
    <slot />
  </label>
</template>

<script setup>
defineProps({ className: { type: String, default: '' } })
</script>
