<!--
  效率看板
  对标 V1.1 src/components/labor/efficiency/EfficiencyDashboard.tsx
-->
<template>
  <div class="space-y-4">
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">平均效率</p>
        <p class="text-3xl font-bold text-emerald-600 mt-2">{{ avgEfficiency }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">最高效率</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ maxEfficiency }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">达标率</p>
        <p class="text-3xl font-bold text-amber-600 mt-2">{{ achievementRate }}%</p>
      </div>
    </div>
    <EfficiencyChart :data="chartData" :height="350" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import EfficiencyChart from './EfficiencyChart.vue'

const data = [
  { name: '1月', value: 85 },
  { name: '2月', value: 88 },
  { name: '3月', value: 92 },
  { name: '4月', value: 87 },
  { name: '5月', value: 95 },
  { name: '6月', value: 90 },
]

const chartData = computed(() => data)

const avgEfficiency = computed(() => Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length))
const maxEfficiency = computed(() => Math.max(...data.map((d) => d.value)))
const achievementRate = 90
</script>