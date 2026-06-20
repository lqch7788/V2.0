<!--
  月报图表组件
  对标 V1.1 src/components/labor/monthly/MonthlyReportChart.tsx
-->
<template>
  <div ref="chartRef" :style="{ width: '100%', height: height + 'px' }"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  height: { type: Number, default: 350 },
})

const chartRef = ref(null)
let chart = null

const render = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['工资', '奖金', '扣款'] },
    xAxis: { type: 'category', data: props.data.map((d) => d.month) },
    yAxis: { type: 'value' },
    series: [
      { name: '工资', data: props.data.map((d) => d.salary), type: 'bar', itemStyle: { color: '#059669' } },
      { name: '奖金', data: props.data.map((d) => d.bonus), type: 'bar', itemStyle: { color: '#3b82f6' } },
      { name: '扣款', data: props.data.map((d) => d.deduction), type: 'bar', itemStyle: { color: '#ef4444' } },
    ],
  })
}

onMounted(render)
watch(() => props.data, render, { deep: true })
</script>