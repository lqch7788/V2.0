<template>
  <!-- 采收统计卡片组件 - V1.1样式 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">
            {{ stat.value }}{{ stat.unit || '' }}
          </p>
        </div>
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="20" class="text-white">
            <component :is="stat.icon" />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Goods, OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
})

const stats = computed(() => {
  const totalQuantity = props.records.reduce((sum, r) => sum + (r.harvestQuantity || 0), 0)
  const gradeAPercent = props.records.length > 0
    ? Math.round(props.records.filter(r => r.grade === 'A').length / props.records.length * 100)
    : 0
  // 待入库 = 采收中、已采收、已分级状态的数量（已入库不算待入库）
  const pendingInboundCount = props.records.filter(r => ['harvesting', 'harvested', 'graded'].includes(r.status)).length

  return [
    {
      label: '本月采收批次',
      value: props.records.length,
      icon: Goods,
      color: 'bg-emerald-500',
    },
    {
      label: '总采收量',
      value: totalQuantity,
      icon: OfficeBuilding,
      color: 'bg-blue-500',
      unit: 'kg',
    },
    {
      label: 'A级占比',
      value: gradeAPercent,
      icon: Goods,
      color: 'bg-amber-500',
      unit: '%',
    },
    {
      label: '待入库',
      value: pendingInboundCount,
      icon: OfficeBuilding,
      color: 'bg-purple-500',
    },
  ]
})
</script>
