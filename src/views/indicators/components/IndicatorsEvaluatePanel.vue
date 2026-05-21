<template>
  <!-- 考核评价面板组件 -->
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
      <el-table :data="evaluationData" style="width: 100%">
        <el-table-column label="排名" width="80">
          <template #default="{ row }">
            <div
              :class="getRankBadgeClass(row.rank)"
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            >
              {{ row.rank }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="基地" min-width="120">
          <template #default="{ row }">
            <span class="text-sm font-medium text-gray-900">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productionScore" label="生产指标" width="100">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">{{ row.productionScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="qualityScore" label="质量指标" width="100">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">{{ row.qualityScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="costScore" label="成本指标" width="100">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">{{ row.costScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="efficiencyScore" label="效率指标" width="100">
          <template #default="{ row }">
            <span class="text-sm text-gray-700 font-mono">{{ row.efficiencyScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="综合得分" width="120">
          <template #default="{ row }">
            <span class="text-sm font-bold text-blue-600 font-mono">{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评价等级" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getGradeTagType(row.totalScore)" effect="plain">
              {{ getGradeLabel(row.totalScore) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Medal } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const props = defineProps({
  evaluationData: Array
})

// 图表容器
const barChartRef = ref()

// 获取排名徽章样式
const getRankBadgeClass = (rank) => {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500'
  if (rank === 2) return 'bg-gradient-to-br from-gray-400 to-gray-500'
  if (rank === 3) return 'bg-gradient-to-br from-amber-500 to-amber-600'
  return 'bg-blue-100 text-blue-600'
}

// 获取评价等级标签
const getGradeLabel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 85) return '良好'
  return '合格'
}

// 获取评价等级标签类型
const getGradeTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 85) return 'primary'
  return 'info'
}

// 初始化横向柱状图
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
    xAxis: {
      type: 'value',
      min,
      max,
      axisLabel: {
        fontSize,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'category',
      data: props.evaluationData.map(item => item.name),
      axisLabel: {
        fontSize,
        color: '#6b7280'
      }
    },
    series: [
      {
        name: '总分',
        type: 'bar',
        data: props.evaluationData.map(item => item.totalScore),
        itemStyle: {
          color: '#06b6d4',
          borderRadius: [0, 4, 4, 0]
        }
      }
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  initBarChart()
})
</script>
