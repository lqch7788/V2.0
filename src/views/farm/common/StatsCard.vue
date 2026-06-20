<!--
  通用统计卡片
  对标 V1.1 src/components/farm/common/StatsCard.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="iconBgClass">
        <el-icon :size="24" :color="iconColor">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="flex-1">
        <div class="text-2xl font-bold text-gray-900">{{ value }}</div>
        <div class="text-sm text-gray-500 mt-1">{{ label }}</div>
      </div>
    </div>
    <div v-if="trend !== undefined" class="mt-3 flex items-center gap-1 text-xs">
      <el-icon :size="12" :color="trend >= 0 ? '#10b981' : '#ef4444'">
        <component :is="trend >= 0 ? 'CaretTop' : 'CaretBottom'" />
      </el-icon>
      <span :class="trend >= 0 ? 'text-emerald-600' : 'text-red-600'">
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-gray-400">较上期</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: String, default: 'DataAnalysis' },
  iconColor: { type: String, default: '#059669' },
  trend: { type: Number, default: undefined },
})

const iconBgClass = computed(() => 'bg-emerald-50')

const iconComponent = computed(() => props.icon)
</script>