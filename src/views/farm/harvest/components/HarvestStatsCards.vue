<!--
  采收统计卡片
  对标 V1.1 src/components/farm/harvest/components/HarvestStatsCards.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">总采收量</p>
      <p class="text-2xl font-bold text-emerald-600 mt-2">{{ totalYield }} kg</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">采收次数</p>
      <p class="text-2xl font-bold text-blue-600 mt-2">{{ totalCount }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">合格品率</p>
      <p class="text-2xl font-bold text-amber-600 mt-2">{{ passRate }}%</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">入库量</p>
      <p class="text-2xl font-bold text-purple-600 mt-2">{{ storedYield }} kg</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalYield: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  passRate: { type: Number, default: 0 },
  storedYield: { type: Number, default: 0 },
})
</script>