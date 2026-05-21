<template>
  <!-- 分类管理面板组件 -->
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
              <el-tag size="small" type="info" effect="plain">
                {{ cat.count }}个
              </el-tag>
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
      <el-table :data="paginatedIndicators" style="width: 100%">
        <el-table-column prop="code" label="编码" width="120">
          <template #default="{ row }">
            <span class="text-sm font-mono text-gray-600">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <span class="text-sm font-medium text-gray-900">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="计量单位" width="100" />
        <el-table-column prop="target" label="目标值" width="100">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">{{ row.target }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预警值" width="100">
          <template #default="{ row }">
            <span class="text-sm text-amber-600 font-mono">{{ row.warning }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="权重" width="100">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">{{ row.weight }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default>
            <el-button type="primary" link size="small">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PieChart, Setting } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const props = defineProps({
  categorySummary: Array,
  indicators: Array
})

// 饼图容器
const pieChartRef = ref()

// 分页后的指标数据
const paginatedIndicators = computed(() => {
  return props.indicators.slice(0, 10)
})

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  const chart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '指标分布',
        type: 'pie',
        radius: '70%',
        data: props.categorySummary.map(item => ({
          name: item.name,
          value: item.count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur,
            shadowOffsetX,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  initPieChart()
})
</script>
