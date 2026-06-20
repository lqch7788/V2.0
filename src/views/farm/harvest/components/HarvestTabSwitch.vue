<!--
  采收 Tab 切换
  对标 V1.1 src/components/farm/harvest/components/HarvestTabSwitch.tsx
-->
<template>
  <div class="bg-white rounded-xl p-1 inline-flex shadow-sm">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      :class="modelValue === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
      @click="$emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="ml-1 text-xs opacity-75">({{ tab.count }})</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  tabs: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue'])
</script>