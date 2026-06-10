<template>
  <!-- 订单统计卡片组件 - V1.1 OrderStats.tsx 1:1 翻译（6 卡片版） -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

<script setup>
/**
 * OrderStats 订单统计卡片组件
 * 对应 V1.1 src/components/farm/order/components/OrderStats.tsx 1:1 翻译
 *
 * Props：
 * - data: { total, inProgress, completed, thisMonth, planned, cancelled } 6 项统计数据
 *
 * 卡片样式与 V1.1 OrderStats.tsx L22-58 1:1 一致：
 * - 6 列 grid 布局（xl:grid-cols-6）
 * - 颜色：总数(blue)/已计划(indigo)/进行中(amber)/已完成(emerald)/已取消(rose)/本月(purple)
 * - 图标：Package/FileCheck/TrendingUp/CheckCircle/XCircle/Calendar
 */
import { computed } from 'vue'
import { Package, TrendingUp, CheckCircle, Calendar, FileCheck, XCircle } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// 与 V1.1 OrderStats.tsx L22-58 完全一致的 6 卡片配置
const stats = computed(() => [
  {
    label: '订单总数',
    value: props.data.total ?? 0,
    color: 'bg-blue-500',
    icon: Package
  },
  {
    label: '已计划',
    value: props.data.planned ?? 0,
    color: 'bg-indigo-500',
    icon: FileCheck
  },
  {
    label: '进行中',
    value: props.data.inProgress ?? 0,
    color: 'bg-amber-500',
    icon: TrendingUp
  },
  {
    label: '已完成',
    value: props.data.completed ?? 0,
    color: 'bg-emerald-500',
    icon: CheckCircle
  },
  {
    label: '已取消',
    value: props.data.cancelled ?? 0,
    color: 'bg-rose-500',
    icon: XCircle
  },
  {
    label: '本月新增',
    value: props.data.thisMonth ?? 0,
    color: 'bg-purple-500',
    icon: Calendar
  }
])
</script>
