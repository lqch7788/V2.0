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
        <span class="font-medium">{{ defaultEnergy.water }}m³ <span :class="getTrendIcon(defaultEnergy.waterTrend).cls">{{ getTrendIcon(defaultEnergy.waterTrend).text }}</span></span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">电</span>
        <span class="font-medium">{{ defaultEnergy.electricity }}kWh <span :class="getTrendIcon(defaultEnergy.electricityTrend).cls">{{ getTrendIcon(defaultEnergy.electricityTrend).text }}</span></span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">气</span>
        <span class="font-medium">{{ defaultEnergy.gas }}m³ <span :class="getTrendIcon(defaultEnergy.gasTrend).cls">{{ getTrendIcon(defaultEnergy.gasTrend).text }}</span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lightning } from '@element-plus/icons-vue'

// 能耗数据使用默认值（V1.1也是硬编码，后续迁移到独立API）
const defaultEnergy = { water: 120, electricity: 380, gas: 25, waterTrend: 10, electricityTrend: -5, gasTrend: 0 }

const getTrendIcon = (trend) => {
  if (trend > 0) return { cls: 'text-red-500', text: `↑${trend}%` }
  if (trend < 0) return { cls: 'text-emerald-500', text: `↓${Math.abs(trend)}%` }
  return { cls: 'text-gray-400', text: '→' }
}
</script>
