<!--
  预算图表组件
  对标 V1.1 src/components/labor/budget/BudgetChart.tsx
-->
<template>
  <div ref="chartRef" :style="{ width: '100%', height: height + 'px' }"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  type: { type: String, default: 'bar' }, // bar/pie/line
  height: { type: Number, default: 300 },
})

const chartRef = ref(null)
let chart = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const categories = props.data.map((d) => d.name)
  const values = props.data.map((d) => d.value)

  let option = {}
  if (props.type === 'pie') {
    option = {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '60%',
        data: props.data.map((d) => ({ name: d.name, value: d.value })),
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      }],
    }
  } else if (props.type === 'line') {
    option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      series: [{ data: values, type: 'line', smooth: true, areaStyle: { opacity: 0.3 } }],
    }
  } else {
    option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      series: [{ data: values, type: 'bar', itemStyle: { color: '#059669' } }],
    }
  }

  chart.setOption(option, true)
}

onMounted(renderChart)
watch(() => props.data, renderChart, { deep: true })
</script>