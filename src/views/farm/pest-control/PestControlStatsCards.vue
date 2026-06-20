<!--
  病虫害统计卡片
  对标 V1.1 src/components/farm/pest-control/PestControlStatsCards.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">本月防治次数</p>
      <p class="text-2xl font-bold text-emerald-600 mt-2">{{ controlCount }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">病虫害发现</p>
      <p class="text-2xl font-bold text-amber-600 mt-2">{{ diseaseCount }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">药剂使用量</p>
      <p class="text-2xl font-bold text-blue-600 mt-2">{{ pesticideUsed }} L</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">损失率</p>
      <p class="text-2xl font-bold text-red-600 mt-2">{{ lossRate }}%</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  controlCount: { type: Number, default: 0 },
  diseaseCount: { type: Number, default: 0 },
  pesticideUsed: { type: Number, default: 0 },
  lossRate: { type: Number, default: 0 },
})
</script>