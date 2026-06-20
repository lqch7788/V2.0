<!--
  种源统计
  对标 V1.1 src/components/farm/seed-source/components/SeedSourceStats.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">种源总数</p>
      <p class="text-2xl font-bold text-emerald-600 mt-2">{{ total }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">在库</p>
      <p class="text-2xl font-bold text-blue-600 mt-2">{{ inStock }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">已使用</p>
      <p class="text-2xl font-bold text-amber-600 mt-2">{{ used }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">储备率</p>
      <p class="text-2xl font-bold text-purple-600 mt-2">{{ reserveRate }}%</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  total: { type: Number, default: 0 },
  inStock: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  reserveRate: { type: Number, default: 0 },
})
</script>