<template>
  <div class="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200" :class="className">
    <slot />
    <div v-if="$slots.actions" class="flex items-center gap-2 ml-auto">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({ className: { type: String, default: '' } })
</script>
