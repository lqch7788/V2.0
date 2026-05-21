<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-2">
        <!-- 图标容器 -->
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="16" class="text-white">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <!-- 数值和标签 -->
        <div>
          <p class="text-lg font-bold text-gray-900">
            {{ stat.value }}{{ stat.unit || '' }}
          </p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Goods, OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({})

const stats = computed(() => {
  const totalQuantity = props.records.reduce((sum, r) => sum + r.harvestQuantity, 0)
  const gradeAPercent = props.records.length > 0
    ? Math.round(props.records.filter(r => r.grade === 'A').length / props.records.length * 100)
    : 0
  const pendingInboundCount = props.records.filter(r => ['harvesting', 'harvested', 'graded'].includes(r.status)).length

  return [
    {
      label: '本月采收批次',
      value: props.records.length,
      icon,
      color: 'bg-emerald-500',
    },
    {
      label: '总采收量',
      value,
      icon,
      color: 'bg-blue-500',
      unit: 'kg',
    },
    {
      label: 'A级占比',
      value,
      icon,
      color: 'bg-amber-500',
      unit: '%',
    },
    {
      label: '待入库',
      value,
      icon,
      color: 'bg-purple-500',
    },
  ]
})
</script>
