<template>
  <div class="grid grid-cols-5 gap-4 mb-6">
    <!-- 卡片1: 领料单数 -->
    <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
      <div class="flex items-center justify-between mb-2">
        <div class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
          <el-icon color="#fff"><ClipboardList /></el-icon>
        </div>
        <span class="text-xs font-medium text-emerald-600 bg-emerald-200/50 px-2 py-1 rounded-full">本月</span>
      </div>
      <div class="text-2xl font-bold text-emerald-700 mb-1">{{ summaryData.requisitionCount }}</div>
      <div class="text-xs text-emerald-600/70">领料单数</div>
    </div>

    <!-- 卡片2: 领料总量 -->
    <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50 hover:shadow-lg transition-all duration-300">
      <div class="flex items-center justify-between mb-2">
        <div class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30">
          <el-icon color="#fff"><Box /></el-icon>
        </div>
        <span class="text-xs font-medium text-blue-600 bg-blue-200/50 px-2 py-1 rounded-full">累计</span>
      </div>
      <div class="text-2xl font-bold text-blue-700 mb-1">{{ summaryData.totalQuantity.toLocaleString() }}</div>
      <div class="text-xs text-blue-600/70">领料总量</div>
    </div>

    <!-- 卡片3: 总金额 -->
    <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200/50 hover:shadow-lg transition-all duration-300">
      <div class="flex items-center justify-between mb-2">
        <div class="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/30">
          <span class="text-lg font-bold">¥</span>
        </div>
        <span class="text-xs font-medium text-amber-600 bg-amber-200/50 px-2 py-1 rounded-full">元</span>
      </div>
      <div class="text-2xl font-bold text-amber-700 mb-1">¥{{ summaryData.totalAmount.toLocaleString() }}</div>
      <div class="text-xs text-amber-600/70">总金额</div>
    </div>

    <!-- 卡片4: 差异率 -->
    <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50 hover:shadow-lg transition-all duration-300">
      <div class="flex items-center justify-between mb-2">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shadow-md', summaryData.avgDifferenceRate < 0 ? 'bg-green-500 shadow-green-500/30' : 'bg-red-500 shadow-red-500/30']">
          <el-icon :color="summaryData.avgDifferenceRate < 0 ? '#fff' : '#fff'"><Bottom v-if="summaryData.avgDifferenceRate >= 0" /><Top v-else /></el-icon>
        </div>
        <span :class="['text-xs font-medium px-2 py-1 rounded-full', summaryData.avgDifferenceRate < 0 ? 'text-green-600 bg-green-200/50' : 'text-red-600 bg-red-200/50']">
          {{ summaryData.avgDifferenceRate < 0 ? '正常' : '异常' }}
        </span>
      </div>
      <div :class="['text-2xl font-bold mb-1', summaryData.avgDifferenceRate < 0 ? 'text-green-700' : 'text-red-700']">
        {{ summaryData.avgDifferenceRate.toFixed(1) }}%
      </div>
      <div class="text-xs text-purple-600/70">平均差异率</div>
    </div>

    <!-- 卡片5: 同比变化 -->
    <div class="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-4 border border-rose-200/50 hover:shadow-lg transition-all duration-300">
      <div class="flex items-center justify-between mb-2">
        <div class="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center shadow-md shadow-rose-500/30">
          <el-icon color="#fff"><TrendCharts /></el-icon>
        </div>
        <span class="text-xs font-medium text-rose-600 bg-rose-200/50 px-2 py-1 rounded-full">同比</span>
      </div>
      <div class="text-2xl font-bold text-rose-700 mb-1">+{{ summaryData.yearOnYearChange }}%</div>
      <div class="text-xs text-rose-600/70">较上年同期</div>
    </div>
  </div>
</template>

<script setup>
import { ClipboardList, Box, Bottom, Top, TrendCharts } from '@element-plus/icons-vue'

defineProps({
  summaryData: {
    type: Object,
    default: () => ({
      requisitionCount: 0,
      totalQuantity: 0,
      totalAmount: 0,
      avgDifferenceRate: 0,
      yearOnYearChange: 0
    })
  }
})
</script>
