<!--
  效率图表
  对标 V1.1 src/components/labor/efficiency/EfficiencyChart.tsx
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
    xAxis: { type: 'category', data: props.data.map((d) => d.name) },
    yAxis: { type: 'value' },
    series: [{
      data: props.data.map((d) => d.value),
      type: 'line',
      smooth: true,
      itemStyle: { color: '#059669' },
      areaStyle: { opacity: 0.3 },
    }],
  })
}

onMounted(render)
watch(() => props.data, render, { deep: true })
</script>