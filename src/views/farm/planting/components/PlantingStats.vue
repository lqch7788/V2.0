<!--
  种植统计
  对标 V1.1 src/components/farm/planting/components/PlantingStats.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">种植面积</p>
      <p class="text-2xl font-bold text-emerald-600 mt-2">{{ totalArea }} 亩</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">种植批次</p>
      <p class="text-2xl font-bold text-blue-600 mt-2">{{ batches }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">已完成</p>
      <p class="text-2xl font-bold text-amber-600 mt-2">{{ completed }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">成活率</p>
      <p class="text-2xl font-bold text-purple-600 mt-2">{{ survivalRate }}%</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalArea: { type: Number, default: 0 },
  batches: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  survivalRate: { type: Number, default: 0 },
})
</script>