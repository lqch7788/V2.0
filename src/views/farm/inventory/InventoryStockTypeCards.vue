<!--
  库存类型卡片
  对标 V1.1 src/components/farm/inventory/InventoryStockTypeCards.tsx
-->
<template>
  <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
    <div
      v-for="type in types"
      :key="type.code"
      class="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      :class="{ 'ring-2 ring-emerald-500': active === type.code }"
      @click="$emit('select', type.code)"
    >
      <div class="flex items-center gap-2">
        <el-icon :size="24" :color="type.color"><component :is="type.icon" /></el-icon>
        <div>
          <p class="font-semibold text-gray-900">{{ type.label }}</p>
          <p class="text-xs text-gray-500">{{ type.count }} 项</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Box, Goods, Sell, TakeawayBox, Tickets, Tools } from '@element-plus/icons-vue'

defineProps({
  active: { type: String, default: '' },
  counts: { type: Object, default: () => ({}) },
})

defineEmits(['select'])

const types = [
  { code: 'all', label: '全部', icon: Box, color: '#059669' },
  { code: 'seed', label: '种子', icon: Tickets, color: '#3b82f6' },
  { code: 'fertilizer', label: '肥料', icon: Goods, color: '#f59e0b' },
  { code: 'pesticide', label: '农药', icon: Tools, color: '#ef4444' },
  { code: 'tool', label: '工具', icon: Sell, color: '#8b5cf6' },
  { code: 'other', label: '其他', icon: TakeawayBox, color: '#6b7280' },
]
</script>