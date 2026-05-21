<template>
  <div class="bg-white/50 rounded-xl p-4 border border-gray-100">
    <!-- 标题和图表类型切换 -->
    <div class="flex items-center justify-between mb-4">
      <h5 class="font-semibold text-gray-700">人效趋势（12个月）</h5>
      <div class="flex gap-1">
        <el-button
          @click="chartType = 'bar'"
          :type="chartType === 'bar' ? 'primary' : ''"
          text
          circle
          :class="chartType === 'bar' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'"
          title="柱状图"
        >
          <el-icon><Histogram /></el-icon>
        </el-button>
        <el-button
          @click="chartType = 'line'"
          :type="chartType === 'line' ? 'primary' : ''"
          text
          circle
          :class="chartType === 'line' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'"
          title="折线图"
        >
          <el-icon><DataLine /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="h-72 bg-gray-50 rounded-lg flex items-center justify-center">
      <span class="text-gray-400">图表区域 - {{ chartType === 'bar' ? '柱状图' : '折线图' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Histogram, DataLine } from '@element-plus/icons-vue'

type ChartType = 'bar' | 'line'

const chartType = ref('line')

defineProps({})
</script>
