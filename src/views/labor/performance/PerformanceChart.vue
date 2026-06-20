<!--
  绩效图表
  对标 V1.1 src/components/labor/performance/PerformanceChart.tsx
-->
<template>
  <div ref="chartRef" :style="{ width: '100%', height: height + 'px' }"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  height: { type: Number, default: 300 },
})

const chartRef = ref(null)
let chart = null

const render = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: props.data.map((d) => d.name) },
    yAxis: { type: 'value', max: 100 },
    series: [{
      data: props.data.map((d) => d.score),
      type: 'bar',
      itemStyle: { color: '#059669' },
      markLine: { data: [{ type: 'average', name: '平均' }] },
    }],
  })
}

onMounted(render)
watch(() => props.data, render, { deep: true })
</script>