<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-2">
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="16" class="text-white">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Goods, OfficeBuilding, CaretTop, Warning } from '@element-plus/icons-vue'

const props = defineProps({})

const stats = computed(() => [
  {
    label: '总种源数',
    value: props.data.total,
    icon,
    color: 'bg-emerald-500',
  },
  {
    label: '库存总量',
    value: props.data.totalQuantity.toLocaleString(),
    icon,
    color: 'bg-blue-500',
    unit: '株/粒',
  },
  {
    label: '本月新增',
    value: props.data.monthCount,
    icon,
    color: 'bg-amber-500',
  },
  {
    label: '库存预警',
    value: props.data.alertCount,
    icon,
    color: 'bg-red-500',
  },
])
</script>
