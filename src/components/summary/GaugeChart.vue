<template>
  <!-- 仪表盘图表组件 -->
  <div class="relative w-36 h-36">
    <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
      <!-- 背景圆弧 -->
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="bgColor"
        :stroke-width="strokeWidth"
      />
      <!-- 进度圆弧 -->
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="transition-all duration-500"
      />
    </svg>
    <!-- 中心文字 -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span :class="['text-2xl font-bold', scoreColor]">{{ percentage }}%</span>
    </div>
  </div>
  <p v-if="label" class="text-xs text-gray-500 text-center mt-2">{{ label }}</p>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({"percentage":"0","colorScheme":"'emerald'"})

// 仪表盘尺寸参数
const strokeWidth = 8
const radius = 40
const circumference = 2 * Math.PI * radius

// 进度计算
const dashOffset = computed(() => {
  const progress = Math.min(Math.max(props.percentage, 0), 100)
  return circumference * (1 - progress / 100)
})

// 颜色配置
const COLOR_CONFIG = {
  emerald: { progress: '#10b981', bg: '#d1fae5', score: 'text-emerald-600' },
  amber: { progress: '#f59e0b', bg: '#fef3c7', score: 'text-amber-600' },
  red: { progress: '#ef4444', bg: '#fee2e2', score: 'text-red-600' },
}

const progressColor = computed(() => COLOR_CONFIG[props.colorScheme].progress)
const bgColor = computed(() => COLOR_CONFIG[props.colorScheme].bg)
const scoreColor = computed(() => COLOR_CONFIG[props.colorScheme].score)
</script>
