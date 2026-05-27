<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm" :class="className">
    <div v-if="$slots.header || header" class="flex flex-col space-y-1.5 p-6" :class="{ 'border-b border-gray-200': $slots.default }">
      <slot name="header">
        <h3 class="font-semibold leading-none tracking-tight">{{ header }}</h3>
      </slot>
    </div>
    <div class="p-6 pt-0" v-if="$slots.default">
      <slot />
    </div>
    <div v-if="$slots.footer || footer" class="p-6 border-t border-gray-200">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  className: { type: String, default: '' },
  header: String,
  footer: String
})
</script>
