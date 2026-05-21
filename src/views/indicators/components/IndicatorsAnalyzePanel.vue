<template>
  <!-- 达成分析面板组件 -->
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
      <el-table :data="analyzeData" style="width: 100%">
        <el-table-column prop="month" label="指标名称" width="120">
          <template #default="{ row }">
            <span class="text-sm font-medium text-gray-900">{{ row.month }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="目标值" width="120">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">{{ row.target }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actual" label="实际值" width="120">
          <template #default="{ row }">
            <span class="text-sm text-gray-900 font-medium font-mono">{{ row.actual }}</span>
          </template>
        </el-table-column>
        <el-table-column label="差距" width="120">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">
              {{ row.actual - row.target > 0 ? '+' : '' }}{{ row.actual - row.target }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="达成率" width="120">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="getAchievementTagType(row.achievementRate)"
              effect="plain"
            >
              {{ row.achievementRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="getAchievementTagType(row.achievementRate)"
              effect="plain"
            >
              {{ getAchievementStatus(row.achievementRate) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  analyzeData: Array
})

// 图表容器
const lineChartRef = ref()
const barChartRef = ref()

// 获取达成率标签类型
const getAchievementTagType = (rate) => {
  if (rate >= 98) return 'success'
  if (rate >= 95) return 'warning'
  return 'danger'
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

  const chart = echarts.init(lineChartRef.value)

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
        fontSize,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      min,
      max,
      axisLabel: {
        fontSize,
        color: '#6b7280',
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '达成率',
        type: 'line',
        data: props.analyzeData.map(item => item.achievementRate),
        smooth,
        lineStyle: {
          color: '#06b6d4',
          width: 2
        },
        itemStyle: {
          color: '#06b6d4'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset, color: 'rgba(6, 182, 212, 0.3)' },
            { offset, color: 'rgba(6, 182, 212, 0.05)' }
          ])
        }
      }
    ]
  }

  chart.setOption(option)
}

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return

  const chart = echarts.init(barChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    legend: {
      data: ['目标值', '实际值'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: props.analyzeData.map(item => item.month),
      axisLabel: {
        fontSize,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize,
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

  chart.setOption(option)
}

onMounted(() => {
  initLineChart()
  initBarChart()
})
</script>
