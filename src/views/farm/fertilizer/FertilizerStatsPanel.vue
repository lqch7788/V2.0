<!--
  肥料统计面板
  对标 V1.1 src/components/farm/fertilizer/FertilizerStatsPanel.tsx
-->
<template>
  <div class="space-y-4">
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总库存</p>
        <p class="text-2xl font-bold text-emerald-600 mt-2">{{ totalStock }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总价值</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">¥{{ totalValue }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">种类数</p>
        <p class="text-2xl font-bold text-amber-600 mt-2">{{ categoryCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">预警</p>
        <p class="text-2xl font-bold text-red-600 mt-2">{{ lowStockCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalStock: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  categoryCount: { type: Number, default: 0 },
  lowStockCount: { type: Number, default: 0 },
})
</script>