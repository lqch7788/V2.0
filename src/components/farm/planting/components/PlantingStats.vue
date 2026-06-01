<!--
  种植统计卡片组件
  1:1 翻译自 V1.1 src/components/farm/planting/components/PlantingStats.tsx
  V1.1 使用 lucide-react 图标 + 公共 StatsCard 组件
  V2.0 使用 Element Plus 图标（@element-plus/icons-vue），内联渲染
-->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-2">
        <!-- 图标容器 - 与V1.1 StatsCard一致 -->
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="16" class="text-white">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <!-- 数值与标签 - 与V1.1 StatsCard一致 -->
        <div>
          <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @typedef {Object} PlantingStatsData
 * @property {number} total - 总批次数
 * @property {number} growing - 生长期数量
 * @property {number} harvested - 已采收数量
 * @property {number} monthCount - 本月新增数量
 */

import { computed } from 'vue'
// V1.1 使用 lucide-react: Trees / Sprout / CheckCircle / TrendingUp
// V2.0 平台差异：使用 Element Plus 等价图标（最近语义匹配）
import { Grid, Sunny, CircleCheck, TrendCharts } from '@element-plus/icons-vue'

/**
 * 统计项数据结构（与 V1.1 StatItem 1:1）
 * @typedef {Object} StatItem
 * @property {string} label - 显示标签
 * @property {number} value - 数值
 * @property {import('vue').Component} icon - Element Plus 图标组件
 * @property {string} color - 背景色 Tailwind class
 */

const props = defineProps({
  /**
   * 统计数据
   * @type {PlantingStatsData}
   */
  data: {
    type: Object,
    default: () => ({
      total: 0,
      growing: 0,
      harvested: 0,
      monthCount: 0
    })
  }
})

/**
 * 4个统计卡片配置 - 与 V1.1 PlantingStats 1:1 翻译
 * @type {import('vue').ComputedRef<StatItem[]>}
 */
const stats = computed(() => [
  {
    label: '总批次数',
    value: props.data?.total ?? 0,
    icon: Grid,           // V1.1: Trees
    color: 'bg-emerald-500'
  },
  {
    label: '生长期',
    value: props.data?.growing ?? 0,
    icon: Sunny,          // V1.1: Sprout
    color: 'bg-amber-500'
  },
  {
    label: '已采收',
    value: props.data?.harvested ?? 0,
    icon: CircleCheck,    // V1.1: CheckCircle
    color: 'bg-green-500'
  },
  {
    label: '本月新增',
    value: props.data?.monthCount ?? 0,
    icon: TrendCharts,    // V1.1: TrendingUp
    color: 'bg-blue-500'
  }
])
</script>
