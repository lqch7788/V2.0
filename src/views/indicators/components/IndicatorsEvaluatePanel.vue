<template>
  <!-- 考核评价面板组件 - V1.1样式 -->
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 基地考核排名 -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon :size="20" class="text-blue-600"><Medal /></el-icon>
          基地考核排名
        </h3>
        <div class="space-y-3">
          <div
            v-for="item in evaluationData"
            :key="item.id"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300"
          >
            <!-- 排名徽章 -->
            <div
              :class="getRankBadgeClass(item.rank)"
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
            >
              {{ item.rank }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
                <span class="text-sm font-bold text-blue-600 font-mono">{{ item.totalScore }}分</span>
              </div>
              <div class="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span>生产 {{ item.productionScore }}</span>
                <span>质量 {{ item.qualityScore }}</span>
                <span>成本 {{ item.costScore }}</span>
                <span>效率 {{ item.efficiencyScore }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 综合评分分布 -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">综合评分分布</h3>
        <div ref="barChartRef" class="w-full h-[300px]"></div>
      </div>
    </div>

    <!-- 评价明细表 -->
    <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">评价明细表</h3>
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="px-3 py-3 text-left text-sm font-semibold">排名</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">基地</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">生产指标</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">质量指标</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">成本指标</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">效率指标</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">综合得分</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">评价等级</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr
            v-for="item in evaluationData"
            :key="item.id"
            class="hover:bg-blue-50 transition-all duration-300"
          >
            <!-- 排名 -->
            <td class="px-3 py-3">
              <span
                :class="getRankBadgeClass(item.rank)"
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              >
                {{ item.rank }}
              </span>
            </td>
            <!-- 基地 -->
            <td class="px-3 py-3 text-sm font-medium text-gray-900">{{ item.name }}</td>
            <!-- 生产指标 -->
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ item.productionScore }}</td>
            <!-- 质量指标 -->
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ item.qualityScore }}</td>
            <!-- 成本指标 -->
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ item.costScore }}</td>
            <!-- 效率指标 -->
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ item.efficiencyScore }}</td>
            <!-- 综合得分 -->
            <td class="px-3 py-3 text-sm font-bold text-blue-600 font-mono">{{ item.totalScore }}</td>
            <!-- 评价等级 -->
            <td class="px-3 py-3">
              <span :class="getGradeClass(item.totalScore)" class="px-2 py-1 text-xs rounded-full">
                {{ getGradeLabel(item.totalScore) }}
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
import { Medal } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const props = defineProps({
  evaluationData: Array
})

// 图表容器
const barChartRef = ref()
let barChartInstance = null

// 获取排名徽章样式
const getRankBadgeClass = (rank) => {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500'
  if (rank === 2) return 'bg-gradient-to-br from-gray-400 to-gray-500'
  if (rank === 3) return 'bg-gradient-to-br from-amber-500 to-amber-600'
  return 'bg-blue-100 text-blue-600'
}

// 获取评价等级
const getGradeLabel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 85) return '良好'
  return '合格'
}

// 获取评价等级样式
const getGradeClass = (score) => {
  if (score >= 90) return 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  if (score >= 85) return 'bg-blue-100 text-blue-800 border border-blue-300'
  return 'bg-gray-100 text-gray-700 border border-gray-300'
}

// 初始化横向柱状图
const initBarChart = () => {
  if (!barChartRef.value) return

  barChartInstance = echarts.init(barChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 8,
      right: 60,
      top: 20,
      bottom: 30,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      min: 70,
      max: 100,
      axisLabel: {
        fontSize: 12,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'category',
      data: props.evaluationData.map(item => item.name),
      axisLabel: {
        fontSize: 12,
        color: '#6b7280',
        width: 100,
        overflow: 'truncate'
      },
      width: 100
    },
    series: [
      {
        name: '总分',
        type: 'bar',
        data: props.evaluationData.map(item => item.totalScore),
        itemStyle: {
          color: '#06b6d4',
          borderRadius: [0, 4, 4, 0]
        },
        barWidth: '60%'
      }
    ]
  }

  barChartInstance.setOption(option)
}

// 响应窗口大小变化
const handleResize = () => {
  if (barChartInstance) {
    barChartInstance.resize()
  }
}

onMounted(() => {
  initBarChart()
  window.addEventListener('resize', handleResize)
})

// 监听数据变化，当数据更新时重新渲染图表
watch(() => props.evaluationData, () => {
  if (barChartInstance) {
    initBarChart()
  }
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (barChartInstance) {
    barChartInstance.dispose()
  }
})
</script>

<style scoped>
/* V1.1表格样式，表头渐变蓝色，行悬浮高亮 */
</style>
