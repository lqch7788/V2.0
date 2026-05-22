<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-3">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="20" style="color: white;">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div>
          <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Goods, OfficeBuilding, TrendCharts, Warning } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      total: 0,
      totalQuantity: 0,
      monthCount: 0,
      alertCount: 0
    })
  }
})

const stats = computed(() => [
  {
    label: '总种源数',
    value: props.data.total || 0,
    icon: Goods,
    color: 'bg-emerald-500',
  },
  {
    label: '库存总量',
    value: (props.data.totalQuantity || 0).toLocaleString(),
    icon: OfficeBuilding,
    color: 'bg-blue-500',
  },
  {
    label: '本月新增',
    value: props.data.monthCount || 0,
    icon: TrendCharts,
    color: 'bg-amber-500',
  },
  {
    label: '库存预警',
    value: props.data.alertCount || 0,
    icon: Warning,
    color: 'bg-red-500',
  },
])
</script>
