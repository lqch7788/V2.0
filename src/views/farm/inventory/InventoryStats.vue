<!--
  库存统计
  对标 V1.1 src/components/farm/inventory/InventoryStats.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">物料总数</p>
      <p class="text-2xl font-bold text-emerald-600 mt-2">{{ totalItems }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">库存价值</p>
      <p class="text-2xl font-bold text-blue-600 mt-2">¥{{ totalValue }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">低库存</p>
      <p class="text-2xl font-bold text-amber-600 mt-2">{{ lowStock }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">预警</p>
      <p class="text-2xl font-bold text-red-600 mt-2">{{ alerts }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalItems: { type: Number, default: 0 },
  totalValue: { type: [Number, String], default: 0 },
  lowStock: { type: Number, default: 0 },
  alerts: { type: Number, default: 0 },
})
</script>