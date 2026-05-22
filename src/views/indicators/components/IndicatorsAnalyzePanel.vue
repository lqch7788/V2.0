<template>
  <!-- 达成分析面板组件 - V1.1样式 -->
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 月度达成率趋势 -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">指标达成率趋势</h3>
        <div ref="lineChartRef" class="w-full h-[300px]"></div>
      </div>

      <!-- 目标值与实际值对比 -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">目标值与实际值对比</h3>
        <div ref="barChartRef" class="w-full h-[300px]"></div>
      </div>
    </div>

    <!-- 达成情况明细 -->
    <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">达成情况明细</h3>
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="px-3 py-3 text-left text-sm font-semibold">指标名称</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">目标值</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">实际值</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">差距</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">达成率</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">状态</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr
            v-for="(item, index) in analyzeData"
            :key="index"
            class="hover:bg-blue-50 transition-all duration-300"
          >
            <td class="px-3 py-3 text-sm font-medium text-gray-900">{{ item.month }}</td>
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ item.target }}</td>
            <td class="px-3 py-3 text-sm text-gray-900 font-medium font-mono">{{ item.actual }}</td>
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">
              {{ item.actual - item.target > 0 ? '+' : '' }}{{ item.actual - item.target }}
            </td>
            <td class="px-3 py-3">
              <span :class="getAchievementClass(item.达成率)" class="px-2 py-1 text-xs rounded-full">
                {{ item.达成率 }}%
              </span>
            </td>
            <td class="px-3 py-3">
              <span :class="getAchievementClass(item.达成率)" class="px-2 py-1 text-xs rounded-full">
                {{ getAchievementStatus(item.达成率) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  analyzeData: Array
})

// 图表容器
const lineChartRef = ref()
const barChartRef = ref()
let lineChartInstance = null
let barChartInstance = null

// 获取达成率样式
const getAchievementClass = (rate) => {
  if (rate >= 98) return 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  if (rate >= 95) return 'bg-amber-100 text-amber-800 border border-amber-300'
  return 'bg-red-100 text-red-800 border border-red-300'
}

// 获取达成状态文字
const getAchievementStatus = (rate) => {
  if (rate >= 98) return '优秀'
  if (rate >= 95) return '良好'
  return '待改进'
}

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return

  lineChartInstance = echarts.init(lineChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.analyzeData.map(item => item.month),
      axisLabel: {
        fontSize: 12,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      min: 90,
      max: 100,
      axisLabel: {
        fontSize: 12,
        color: '#6b7280',
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '达成率',
        type: 'line',
        data: props.analyzeData.map(item => item.达成率),
        smooth: true,
        lineStyle: {
          color: '#06b6d4',
          width: 2
        },
        itemStyle: {
          color: '#06b6d4'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
            { offset: 1, color: 'rgba(6, 182, 212, 0.05)' }
          ])
        }
      }
    ]
  }

  lineChartInstance.setOption(option)
}

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return

  barChartInstance = echarts.init(barChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 50,
      right: 20,
      top: 40,
      bottom: 50,
      containLabel: true
    },
    legend: {
      data: ['目标值', '实际值'],
      top: 5,
      left: 'center'
    },
    xAxis: {
      type: 'category',
      data: props.analyzeData.map(item => item.month),
      axisLabel: {
        fontSize: 12,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: '#6b7280'
      }
    },
    series: [
      {
        name: '目标值',
        type: 'bar',
        data: props.analyzeData.map(item => item.target),
        itemStyle: {
          color: '#7C3AED',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '实际值',
        type: 'bar',
        data: props.analyzeData.map(item => item.actual),
        itemStyle: {
          color: '#22c55e',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }

  barChartInstance.setOption(option)
}

// 响应窗口大小变化
const handleResize = () => {
  if (lineChartInstance) {
    lineChartInstance.resize()
  }
  if (barChartInstance) {
    barChartInstance.resize()
  }
}

onMounted(() => {
  initLineChart()
  initBarChart()
  window.addEventListener('resize', handleResize)
})

// 监听数据变化，当数据更新时重新渲染图表
watch(() => props.analyzeData, () => {
  if (lineChartInstance && barChartInstance) {
    initLineChart()
    initBarChart()
  }
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (lineChartInstance) {
    lineChartInstance.dispose()
  }
  if (barChartInstance) {
    barChartInstance.dispose()
  }
})
</script>

<style scoped>
/* V1.1表格样式，表头渐变蓝色，行悬浮高亮 */
</style>
