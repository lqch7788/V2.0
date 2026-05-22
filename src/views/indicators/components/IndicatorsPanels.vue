<template>
  <!-- 分类管理面板组件 - V1.1样式 -->
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 分类汇总 -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon :size="20" class="text-blue-600"><PieChart /></el-icon>
          指标分类汇总
        </h3>
        <div class="space-y-3">
          <div
            v-for="(cat, index) in categorySummary"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300"
          >
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded" :style="{ backgroundColor: cat.color }" />
              <span class="text-sm font-medium text-gray-900">{{ cat.name }}</span>
              <span class="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">{{ cat.count }}个</span>
            </div>
            <span class="text-sm font-medium text-blue-600 font-mono">
              平均达成 {{ cat.avgAchievement }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 指标分布饼图 -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">指标分布</h3>
        <div ref="pieChartRef" class="w-full h-[250px]"></div>
      </div>
    </div>

    <!-- 指标定义配置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <el-icon :size="20" class="text-blue-600"><Setting /></el-icon>
        指标定义配置
      </h3>
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="px-3 py-3 text-left text-sm font-semibold">编码</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">名称</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">计量单位</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">目标值</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">预警值</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">权重</th>
            <th class="px-3 py-3 text-left text-sm font-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr
            v-for="ind in paginatedIndicators"
            :key="ind.id"
            class="hover:bg-blue-50 transition-all duration-300"
          >
            <td class="px-3 py-3 text-sm font-mono text-gray-600">{{ ind.code }}</td>
            <td class="px-3 py-3 text-sm font-medium text-gray-900">{{ ind.name }}</td>
            <td class="px-3 py-3 text-sm text-gray-700">{{ ind.unit }}</td>
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ ind.target }}</td>
            <td class="px-3 py-3 text-sm text-amber-600 font-mono">{{ ind.warning }}</td>
            <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ ind.weight }}%</td>
            <td class="px-3 py-3">
              <el-button type="primary" link size="small" class="text-blue-600">配置</el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { PieChart, Setting } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const props = defineProps({
  categorySummary: Array,
  indicators: Array
})

// 饼图容器
const pieChartRef = ref()
let pieChartInstance = null

// 分页后的指标数据（只显示前10条）
const paginatedIndicators = computed(() => {
  return props.indicators ? props.indicators.slice(0, 10) : []
})

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChartInstance = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '指标分布',
        type: 'pie',
        radius: ['0%', '70%'],
        center: ['30%', '50%'],
        data: props.categorySummary.map(item => ({
          name: item.name,
          value: item.count,
          itemStyle: { color: item.color }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
          fontSize: 12
        }
      }
    ]
  }

  pieChartInstance.setOption(option)
}

// 响应窗口大小变化
const handleResize = () => {
  if (pieChartInstance) {
    pieChartInstance.resize()
  }
}

onMounted(() => {
  initPieChart()
  window.addEventListener('resize', handleResize)
})

// 监听数据变化，当数据更新时重新渲染图表
watch(() => props.categorySummary, () => {
  if (pieChartInstance) {
    initPieChart()
  }
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (pieChartInstance) {
    pieChartInstance.dispose()
  }
})
</script>

<style scoped>
/* V1.1表格样式，表头渐变蓝色，行悬浮高亮 */
</style>
