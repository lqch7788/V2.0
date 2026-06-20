<!--
  任务筛选 Tab
  对标 V1.1 src/components/labor/myTasks/TaskFilterTabs.tsx
-->
<template>
  <div class="bg-white rounded-xl p-1 inline-flex shadow-sm">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
      :class="modelValue === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
      @click="$emit('update:modelValue', tab.key)"
    >
      <el-icon :size="14"><component :is="tab.icon" /></el-icon>
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="text-xs opacity-75">({{ tab.count }})</span>
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