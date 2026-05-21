<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-yellow-500 to-orange-600">
          <el-icon :size="20" class="text-white">
            <Lightning />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">今日能耗</span>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">水</span>
        <span class="font-medium">{{ energyConsumption.water }}m³ <span :class="getTrendClass(energyConsumption.waterTrend)">{{ getTrendIcon(energyConsumption.waterTrend) }}</span></span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">电</span>
        <span class="font-medium">{{ energyConsumption.electricity }}kWh <span :class="getTrendClass(energyConsumption.electricityTrend)">{{ getTrendIcon(energyConsumption.electricityTrend) }}</span></span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">气</span>
        <span class="font-medium">{{ energyConsumption.gas }}m³ <span :class="getTrendClass(energyConsumption.gasTrend)">{{ getTrendIcon(energyConsumption.gasTrend) }}</span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lightning } from '@element-plus/icons-vue'

defineProps({
  energyConsumption: Object
})

const getTrendIcon = (trend) => {
  if (trend > 0) return `↑${trend}%`
  if (trend < 0) return `↓${Math.abs(trend)}%`
  return '→'
}

const getTrendClass = (trend) => {
  if (trend > 0) return 'text-red-500'
  if (trend < 0) return 'text-emerald-500'
  return 'text-gray-400'
}
</script>
