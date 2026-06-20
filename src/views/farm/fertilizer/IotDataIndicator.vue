<!--
  物联网数据指标组件
  对标 V1.1 src/components/farm/fertilizer/IotDataIndicator.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon :size="18" color="#059669"><Cpu /></el-icon>
      物联网实时数据
    </h3>
    <div class="grid grid-cols-3 gap-3">
      <div v-for="ind in indicators" :key="ind.key" class="p-3 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">{{ ind.label }}</span>
          <el-icon :color="statusColor(ind.status)"><component :is="statusIcon(ind.status)" /></el-icon>
        </div>
        <div class="text-2xl font-bold mt-1" :class="statusColor(ind.status)">
          {{ ind.value }}{{ ind.unit }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Cpu } from '@element-plus/icons-vue'

defineProps({
  indicators: { type: Array, default: () => [] },
})

const statusColor = (s) => ({ normal: 'text-emerald-600', warning: 'text-amber-600', critical: 'text-red-600' }[s] || 'text-gray-600')
const statusIcon = (s) => ({ normal: 'CircleCheck', warning: 'WarningFilled', critical: 'CircleClose' }[s] || 'InfoFilled')
</script>