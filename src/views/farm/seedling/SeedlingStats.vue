<!--
  育苗统计
  对标 V1.1 src/components/farm/seedling/components/SeedlingStats.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">育苗总数</p>
      <p class="text-2xl font-bold text-emerald-600 mt-2">{{ totalSeedlings }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">已出苗</p>
      <p class="text-2xl font-bold text-blue-600 mt-2">{{ sprouted }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">已移栽</p>
      <p class="text-2xl font-bold text-amber-600 mt-2">{{ transplanted }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">成活率</p>
      <p class="text-2xl font-bold text-purple-600 mt-2">{{ survivalRate }}%</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalSeedlings: { type: Number, default: 0 },
  sprouted: { type: Number, default: 0 },
  transplanted: { type: Number, default: 0 },
  survivalRate: { type: Number, default: 0 },
})
</script>