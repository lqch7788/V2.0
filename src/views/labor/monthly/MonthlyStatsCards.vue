<!--
  月报统计卡片
  对标 V1.1 src/components/labor/monthly/MonthlyStatsCards.tsx
-->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">月度总工资</p>
      <p class="text-2xl font-bold text-emerald-600 mt-2">¥{{ totalSalary }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">平均工资</p>
      <p class="text-2xl font-bold text-blue-600 mt-2">¥{{ avgSalary }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">出勤率</p>
      <p class="text-2xl font-bold text-amber-600 mt-2">{{ attendanceRate }}%</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <p class="text-sm text-gray-500">员工数</p>
      <p class="text-2xl font-bold text-purple-600 mt-2">{{ workerCount }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalSalary: { type: [Number, String], default: 0 },
  avgSalary: { type: [Number, String], default: 0 },
  attendanceRate: { type: Number, default: 0 },
  workerCount: { type: Number, default: 0 },
})
</script>