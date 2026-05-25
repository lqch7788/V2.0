<template>
  <!-- 施肥统计分析面板组件 -->
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
          <label class="text-xs text-gray-500 mr-2">开始日期</label>
          <el-date-picker
            v-model="timeRange.start"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-32"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 mr-2">结束日期</label>
          <el-date-picker
            v-model="timeRange.end"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-32"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 mr-2">分组维度</label>
          <el-select v-model="groupBy" class="w-32">
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
        <div class="text-2xl font-bold text-blue-600">{{ formatNumber(summary.totalQty) }}</div>
        <div class="text-xs text-gray-500">总施肥量 (kg)</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-amber-600">{{ formatNumber(summary.totalCost) }}</div>
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

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-4">
      <!-- 柱状图 - 施肥量分布 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">
          施肥量分布（按{{ groupByLabel }}）
        </h4>
        <div class="h-[300px]">
          <div v-if="barChartData.length > 0" class="h-full flex flex-col">
            <div class="flex-1 flex items-end justify-around gap-2 px-4">
              <div
                v-for="(item, index) in barChartData.slice(0, 8)"
                :key="index"
                class="flex flex-col items-center flex-1"
              >
                <div
                  class="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:from-emerald-600 hover:to-emerald-500"
                  :style="{ height: `${getBarHeight(item.quantity)}%` }"
                ></div>
                <div class="text-xs text-gray-500 mt-2 truncate max-w-full" :title="item.name">
                  {{ item.name }}
                </div>
                <div class="text-xs font-medium text-emerald-600">{{ formatNumber(item.quantity) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="h-full flex items-center justify-center text-sm text-gray-400">
            暂无数据
          </div>
        </div>
      </div>

      <!-- 饼图 - 肥料类型分布 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">肥料类型分布（按施肥量）</h4>
        <div class="h-[300px] flex items-center justify-center">
          <div v-if="pieChartData.length > 0" class="flex items-center gap-6">
            <!-- 简化的饼图 -->
            <div class="relative w-40 h-40">
              <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                <circle
                  v-for="(item, index) in pieChartData"
                  :key="index"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  :stroke="PIE_COLORS[index % PIE_COLORS.length]"
                  stroke-width="20"
                  :stroke-dasharray="getPieDashArray(item.value)"
                  :stroke-dashoffset="getPieDashOffset(index)"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-700">{{ pieChartData.length }}</div>
                  <div class="text-xs text-gray-500">种类型</div>
                </div>
              </div>
            </div>
            <!-- 图例 -->
            <div class="flex flex-col gap-2">
              <div
                v-for="(item, index) in pieChartData"
                :key="index"
                class="flex items-center gap-2"
              >
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }"
                ></div>
                <span class="text-xs text-gray-600">{{ item.name }}</span>
                <span class="text-xs text-gray-400">{{ getPercentage(item.value) }}%</span>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400">暂无数据</div>
        </div>
      </div>
    </div>

    <!-- 图例说明区 -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center gap-6 flex-wrap">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-emerald-500"></div>
          <span class="text-xs text-gray-500">施肥量 (kg)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-amber-500"></div>
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
import { ref, reactive, computed, watch } from 'vue'
import { useFertilizerStore } from '@/stores/modules/fertilizer'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const fertilizerStore = useFertilizerStore()

// 时间范围
const timeRange = reactive({ start: '', end: '' })

// 分组维度
const groupBy = ref('fertilizer_type')

// 饼图颜色
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#f97316']

// 分组维度标签
const groupByLabel = computed(() => {
  const labels = {
    fertilizer_type: '肥料类型',
    month: '月份',
    crop: '作物品种',
    greenhouse: '温室位置'
  }
  return labels[groupBy.value] || groupBy.value
})

// 汇总数据
const summary = computed(() => {
  const items = fertilizerStore.items || []
  const total = items.length
  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0)
  const totalCost = items.reduce((s, i) => s + (i.totalCost || 0), 0)
  const avgQty = total > 0 ? totalQty / total : 0
  const types = new Set(items.map(i => i.fertilizerType)).size
  return { total, totalQty, totalCost, avgQty, types }
})

// 柱状图数据
const barChartData = computed(() => {
  const items = fertilizerStore.items || []
  const groups = new Map()

  items.forEach(item => {
    let key = ''
    switch (groupBy.value) {
      case 'month':
        key = item.fertilizeTime ? item.fertilizeTime.slice(0, 7) : '未知'
        break
      case 'crop':
        key = item.cropName || '未知'
        break
      case 'fertilizer_type':
        key = getFertilizerTypeName(item.fertilizerType) || '未知'
        break
      case 'greenhouse':
        key = item.greenhouseName || '未知'
        break
    }
    const existing = groups.get(key) || { quantity: 0, cost: 0 }
    existing.quantity += item.quantity || 0
    existing.cost += item.totalCost || 0
    groups.set(key, existing)
  })

  return Array.from(groups.entries())
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.quantity - a.quantity)
})

// 饼图数据
const pieChartData = computed(() => {
  const items = fertilizerStore.items || []
  const typeMap = new Map()

  items.forEach(item => {
    const label = getFertilizerTypeName(item.fertilizerType) || '未知'
    typeMap.set(label, (typeMap.get(label) || 0) + (item.quantity || 0))
  })

  return Array.from(typeMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
})

// 获取肥料类型显示名称
const getFertilizerTypeName = (type) => {
  const typeMap = {
    organic: '有机肥',
    inorganic: '无机肥',
    biological: '生物肥',
    compound: '复合肥',
    trace: '微量元素肥'
  }
  return typeMap[type] || type || '-'
}

// 格式化数字
const formatNumber = (num) => {
  if (num == null) return '0'
  return num.toLocaleString()
}

// 获取柱状图高度百分比
const getBarHeight = (quantity) => {
  if (barChartData.value.length === 0) return 0
  const max = Math.max(...barChartData.value.map(d => d.quantity))
  if (max === 0) return 0
  return (quantity / max) * 100
}

// 获取饼图DashArray
const getPieDashArray = (value) => {
  const total = pieChartData.value.reduce((s, i) => s + i.value, 0)
  if (total === 0) return '0 251.2'
  const percentage = value / total
  const circumference = 2 * Math.PI * 40
  return `${percentage * circumference} ${circumference}`
}

// 获取饼图DashOffset
const getPieDashOffset = (index) => {
  let offset = 0
  for (let i = 0; i < index; i++) {
    const total = pieChartData.value.reduce((s, i) => s + i.value, 0)
    if (total === 0) break
    const percentage = pieChartData.value[i].value / total
    offset += percentage * 2 * Math.PI * 40
  }
  return offset
}

// 获取百分比
const getPercentage = (value) => {
  const total = pieChartData.value.reduce((s, i) => s + i.value, 0)
  if (total === 0) return 0
  return ((value / total) * 100).toFixed(0)
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
