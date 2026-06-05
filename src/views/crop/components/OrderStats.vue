<template>
  <!-- 订单统计卡片组件 - V1.1 OrderStats.tsx 1:1 翻译 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center gap-2">
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
          <component :is="stat.icon" class="w-4 h-4 text-white" />
        </div>
        <div>
          <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * OrderStats 订单统计卡片组件
 * 对应 V1.1 src/components/farm/order/components/OrderStats.tsx 1:1 翻译
 *
 * Props：
 * - data: { total, inProgress, completed, thisMonth } 4 项统计数据
 *
 * 卡片样式与 V1.1 OrderStats.tsx L47-65 一致：
 * - 4 列 grid 布局
 * - 颜色：订单总数(blue)/进行中(amber)/已完成(emerald)/本月新增(purple)
 * - 图标：Package/TrendingUp/CheckCircle/Calendar
 */
import { computed } from 'vue'
import { Package, TrendingUp, CheckCircle, Calendar } from 'lucide-vue-next'

interface StatsData {
  total: number
  inProgress: number
  completed: number
  thisMonth: number
}

interface Props {
  data: StatsData
}

const props = defineProps<Props>()

const stats = computed(() => [
  {
    label: '订单总数',
    value: props.data.total,
    color: 'bg-blue-500',
    icon: Package
  },
  {
    label: '进行中',
    value: props.data.inProgress,
    color: 'bg-amber-500',
    icon: TrendingUp
  },
  {
    label: '已完成',
    value: props.data.completed,
    color: 'bg-emerald-500',
    icon: CheckCircle
  },
  {
    label: '本月新增',
    value: props.data.thisMonth,
    color: 'bg-purple-500',
    icon: Calendar
  }
])
</script>
