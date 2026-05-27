<template>
  <div class="relative" :class="className">
    <div v-for="(item, index) in items" :key="index" class="relative flex gap-4 pb-4">
      <div class="flex flex-col items-center">
        <div class="w-3 h-3 rounded-full mt-1.5 z-10" :class="item.active ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-gray-300'" />
        <div v-if="index < items.length - 1" class="w-0.5 flex-1 bg-gray-200" />
      </div>
      <div class="flex-1 pb-2">
        <div class="text-sm font-medium text-gray-900">{{ item.label }}</div>
        <div v-if="item.content" class="text-xs text-gray-500 mt-0.5">{{ item.content }}</div>
        <div v-if="item.time" class="text-xs text-gray-400 mt-1">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  className: { type: String, default: '' }
})
</script>
