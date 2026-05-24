<template>
  <!-- 270度弧形仪表盘组件 - 与V1.1完全一致 -->
  <div class="flex flex-col items-center">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="overflow-visible">
      <!-- 背景圆弧 -->
      <circle
        :cx="cx"
        :cy="cy"
        :r="radius"
        fill="none"
        stroke="#e5e7eb"
        :stroke-width="strokeWidth"
        :stroke-dasharray="`${arcLength} ${gapLength}`"
        :stroke-dashoffset="0"
        stroke-linecap="round"
        :transform="`rotate(135, ${cx}, ${cy})`"
      />
      <!-- 数值圆弧 -->
      <circle
        v-if="percentage > 0"
        :cx="cx"
        :cy="cy"
        :r="radius"
        fill="none"
        :stroke="arcColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="`${valueLength} ${fullCircumference - valueLength}`"
        :stroke-dashoffset="0"
        stroke-linecap="round"
        :transform="`rotate(135, ${cx}, ${cy})`"
        class="transition-all duration-500"
      />
      <!-- 刻度标记 -->
      <line
        v-for="tick in tickPositions"
        :key="tick"
        :x1="cx + innerR * Math.cos(tickRad(tick))"
        :y1="cy + innerR * Math.sin(tickRad(tick))"
        :x2="cx + outerR * Math.cos(tickRad(tick))"
        :y2="cy + outerR * Math.sin(tickRad(tick))"
        stroke="#d1d5db"
        stroke-width="2"
      />
      <!-- 指针 -->
      <line
        :x1="cx"
        :y1="cy"
        :x2="needleX"
        :y2="needleY"
        stroke="#374151"
        stroke-width="2.5"
        stroke-linecap="round"
        class="transition-all duration-500"
      />
      <!-- 中心圆点 -->
      <circle :cx="cx" :cy="cy" r="5" fill="#374151" />
      <circle :cx="cx" :cy="cy" r="2.5" fill="white" />
      <!-- 中心文字 -->
      <text
        :x="cx"
        :y="cy + 36"
        text-anchor="middle"
        class="text-2xl font-bold"
        fill="#1e293b"
      >
        {{ Math.round(percentage) }}%
      </text>
    </svg>
    <span class="text-sm text-gray-500 -mt-2">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 百分比值 (0-100) */
  percentage: {
    type: Number,
    default: 0
  },
  /** 底部标签 */
  label: {
    type: String,
    default: ''
  },
  /** 颜色主题 */
  colorScheme: {
    type: String,
    default: 'emerald',
    validator: (v) => ['emerald', 'amber', 'red'].includes(v)
  },
  /** 宽高尺寸，默认 200 */
  size: {
    type: Number,
    default: 200
  }
})

/** 颜色主题映射 - 与V1.1完全一致 */
const COLOR_MAP = {
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
}

// 仪表盘几何参数 - 与V1.1完全一致
const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2 + 10)
const radius = 65
const strokeWidth = 14
const fullCircumference = 2 * Math.PI * radius
const arcRatio = 270 / 360
const arcLength = fullCircumference * arcRatio
const gapLength = fullCircumference - arcLength
const valueLength = computed(() => arcLength * Math.min(props.percentage / 100, 1))

const arcColor = computed(() => COLOR_MAP[props.colorScheme] || COLOR_MAP.emerald)

// 指针计算 - 与V1.1完全一致
const startAngleDeg = 225
const totalSweepDeg = 270
const needleLength = radius - 18

const currentAngleDeg = computed(() => {
  return startAngleDeg + (Math.min(props.percentage / 100, 1)) * totalSweepDeg
})

const needleX = computed(() => {
  const angleRad = (currentAngleDeg.value * Math.PI) / 180
  return cx.value + needleLength * Math.cos(angleRad)
})

const needleY = computed(() => {
  const angleRad = (currentAngleDeg.value * Math.PI) / 180
  return cy.value + needleLength * Math.sin(angleRad)
})

// 刻度标记
const tickPositions = [0, 25, 50, 75, 100]

const tickRad = (tick) => {
  const tickAngleDeg = startAngleDeg + (tick / 100) * totalSweepDeg
  return (tickAngleDeg * Math.PI) / 180
}

const innerR = computed(() => radius - strokeWidth / 2 - 4)
const outerR = computed(() => radius + strokeWidth / 2 + 4)
</script>
