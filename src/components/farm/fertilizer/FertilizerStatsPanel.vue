<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 面板头部 -->
    <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-bold text-gray-900">施肥统计分析</h3>
        </div>
      </div>

      <!-- 筛选行 -->
      <div class="flex items-center gap-4 mt-3 flex-wrap">
        <div>
          <span class="text-xs text-gray-500 mr-2">开始日期</span>
          <el-date-picker
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="(val) => setTimeRange((p) => ({ ...p, start: val }))"
            placeholder="选择日期"
          />
        </div>
        <div>
          <span class="text-xs text-gray-500 mr-2">结束日期</span>
          <el-date-picker
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="(val) => setTimeRange((p) => ({ ...p, end: val }))"
            placeholder="选择日期"
          />
        </div>
        <div>
          <span class="text-xs text-gray-500 mr-2">分组维度</span>
          <el-select
            :model-value="groupBy"
            @change="(val) => groupBy = val"
            placeholder="肥料类型"
          >
            <el-option label="肥料类型" value="fertilizer_type" />
            <el-option label="按月份" value="month" />
            <el-option label="作物品种" value="crop" />
            <el-option label="温室位置" value="greenhouse" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 汇总卡片 -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100">
      <div class="text-center">
        <div class="text-2xl font-bold text-emerald-600">{{ summary.total }}</div>
        <div class="text-xs text-gray-500">总记录数</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ summary.totalQty.toLocaleString() }}</div>
        <div class="text-xs text-gray-500">总施肥量 (kg)</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-amber-600">{{ summary.totalCost.toLocaleString() }}</div>
        <div class="text-xs text-gray-500">总成本 (元)</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-600">{{ summary.avgQty.toFixed(1) }}</div>
        <div class="text-xs text-gray-500">平均施肥量 (kg)</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-cyan-600">{{ summary.types }}</div>
        <div class="text-xs text-gray-500">肥料种类数</div>
      </div>
    </div>

    <!-- 图表区域 - 使用 Element Plus 图表占位 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-4">
      <!-- 柱状图区域 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">
          施肥量分布（按{{ groupByLabel }}）
        </h4>
        <div class="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
          <span class="text-gray-400">图表区域 - 柱状图</span>
        </div>
      </div>

      <!-- 饼图区域 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">肥料类型分布（按施肥量）</h4>
        <div class="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
          <span class="text-gray-400">图表区域 - 饼图</span>
        </div>
      </div>
    </div>

    <!-- 图例说明区 -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center gap-6 flex-wrap">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-emerald-500" />
          <span class="text-xs text-gray-500">施肥量 (kg)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-amber-500" />
          <span class="text-xs text-gray-500">成本 (元)</span>
        </div>
        <div class="text-xs text-gray-400 ml-auto">
          统计基于当前筛选条件下的全部记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const groupBy = ref('fertilizer_type')
const timeRange = ref({ start: '', end: '' })

const setTimeRange = (fn) => {
  timeRange.value = fn(timeRange.value)
}

const summary = computed(() => ({
  total,
  totalQty,
  totalCost,
  avgQty,
  types,
}))

const groupByLabel = computed(() => {
  const labels = {
    fertilizer_type: '肥料类型',
    month: '月份',
    crop: '作物品种',
    greenhouse: '温室位置',
  }
  return labels[groupBy.value] || '肥料类型'
})
</script>
