<!--
  月报主页
  对标 V1.1 src/components/labor/monthly/MonthlyReportPage.tsx
-->
<template>
  <div class="space-y-4">
    <MonthlyStatsCards
      :total-salary="totalSalary"
      :avg-salary="avgSalary"
      :attendance-rate="attendanceRate"
      :worker-count="data.length"
    />
    <MonthlyReportChart :data="chartData" :height="350" />
    <MonthlyReportTable :data="data" @view="handleView" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MonthlyStatsCards from './MonthlyStatsCards.vue'
import MonthlyReportChart from './MonthlyReportChart.vue'
import MonthlyReportTable from './MonthlyReportTable.vue'

const data = [
  { month: '2026-01', workerName: '张三', workDays: 22, baseSalary: 8000, bonus: 2000, deduction: 200, total: 9800 },
  { month: '2026-01', workerName: '李四', workDays: 21, baseSalary: 7500, bonus: 1500, deduction: 100, total: 8900 },
  { month: '2026-02', workerName: '张三', workDays: 20, baseSalary: 8000, bonus: 1800, deduction: 0, total: 9800 },
]

const chartData = computed(() => data.map((d) => ({
  month: `${d.month}-${d.workerName.slice(-2)}`,
  salary: d.baseSalary,
  bonus: d.bonus,
  deduction: d.deduction,
})))

const totalSalary = computed(() => data.reduce((sum, d) => sum + d.total, 0))
const avgSalary = computed(() => Math.round(totalSalary.value / data.length))
const attendanceRate = 95

const handleView = (row) => console.log('view', row)
</script>