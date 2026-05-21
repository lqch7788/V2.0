<template>
  <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-white rounded-lg text-gray-600">
        <el-icon :size="20">
          <component :is="getIcon()" />
        </el-icon>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">{{ sensor.typeName }}</p>
        <p class="text-xs text-gray-500">{{ sensor.greenhouseName }}</p>
      </div>
    </div>
    <div class="text-right">
      <p class="text-lg font-semibold text-gray-900">
        {{ sensor.value }}<span class="text-xs text-gray-500 ml-1">{{ sensor.unit }}</span>
      </p>
      <span :class="['text-xs px-2 py-0.5 rounded-full', getStatusColor()]">
        {{ getStatusText() }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { HotWater, Drizzling, Sunny, WindPower, Odometer } from '@element-plus/icons-vue'

const props = defineProps({})

const getIcon = () => {
  switch (props.sensor.type) {
    case 'air_temp': return HotWater
    case 'air_humidity': return Drizzling
    case 'soil_moisture': return Drizzling
    case 'light': return Sunny
    case 'co2': return WindPower
    default: return Odometer
  }
}

const getStatusColor = () => {
  const colors = {
    normal: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-yellow-100 text-yellow-700',
    critical: 'bg-red-100 text-red-700'
  }
  return colors[props.sensor.status] || 'bg-gray-100 text-gray-700'
}

const getStatusText = () => {
  const texts = {
    normal: '正常',
    warning: '预警',
    critical: '告警'
  }
  return texts[props.sensor.status] || props.sensor.status
}
</script>
