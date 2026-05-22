<template>
  <div class="bg-white rounded-xl p-6 shadow-none border border-gray-100">
    <h3 class="text-base font-semibold text-gray-900 mb-4">成本构成分析</h3>
    <div class="flex gap-4 mb-4">
      <select
        :value="period"
        @change="$emit('period-change', ($event.target as HTMLSelectElement).value)"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
      >
        <option value="month">本月</option>
        <option value="quarter">本季度</option>
        <option value="year">本年</option>
      </select>
      <select
        :value="crop"
        @change="$emit('crop-change', ($event.target as HTMLSelectElement).value)"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
      >
        <option value="">全部作物</option>
        <option value="C001">番茄</option>
        <option value="C002">黄瓜</option>
        <option value="C003">辣椒</option>
      </select>
      <select
        :value="areaType"
        @change="$emit('area-type-change', ($event.target as HTMLSelectElement).value)"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
      >
        <option value="">全部区域类型</option>
        <option value="greenhouse">大棚</option>
        <option value="field">大田</option>
      </select>
    </div>
    <div class="h-56 relative">
      <div class="relative w-full h-full flex items-center justify-center">
        <!-- 饼图 SVG -->
        <svg viewBox="0 0 200 200" class="w-40 h-40">
          <!-- 扇区 path -->
          <path
            v-for="(slice, index) in piePaths"
            :key="index"
            :d="slice.path"
            :fill="colors[index % colors.length]"
            class="transition-all hover:opacity-80 cursor-pointer"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          />
          <!-- 中心空白 -->
          <circle cx="100" cy="100" r="40" fill="white" />
        </svg>

        <!-- 百分比 Label + 引线 -->
        <svg
          v-for="(slice, index) in labelPositions"
          :key="'label-' + index"
          class="absolute pointer-events-none"
          style="position: absolute; width: 200px; height: 200px; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        >
          <!-- 引线 -->
          <polyline
            :points="slice.linePoints"
            fill="none"
            stroke="#d1d5db"
            stroke-width="1"
          />
          <!-- 百分比文字 -->
          <text
            :x="slice.labelX"
            :y="slice.labelY"
            :text-anchor="slice.textAnchor"
            dominant-baseline="central"
            style="font-size: 11px; fill: #6b7280;"
          >
            {{ slice.percent }}%
          </text>
        </svg>

        <!-- Tooltip -->
        <div
          v-if="hoveredIndex !== null && piePaths[hoveredIndex]"
          class="absolute px-3 py-2 bg-white border rounded-lg shadow-lg text-sm z-20"
          style="border-color: #e5e7eb; border-radius: 8px; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        >
          <div style="color: #374151; font-weight: 500;">{{ data[hoveredIndex]?.name }}</div>
          <div style="color: #6b7280; font-size: 12px;">{{ data[hoveredIndex]?.value }}元</div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      <div
        v-for="(item, index) in data.slice(0, 4)"
        :key="item.name"
        class="flex items-center gap-1.5"
      >
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: colors[index % colors.length] }"
        />
        <span class="text-xs" style="color: #6b7280;">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface CostItem {
  name: string
  value: number
}

defineEmits<{
  (e: 'period-change', value: string): void
  (e: 'crop-change', value: string): void
  (e: 'area-type-change', value: string): void
}>()

const hoveredIndex = ref<number | null>(null)

const props = withDefaults(defineProps<{
  period?: string
  crop?: string
  areaType?: string
  data?: CostItem[]
}>(), {
  data: () => [
    { name: '人工成本', value: 35 },
    { name: '肥料成本', value: 25 },
    { name: '水电成本', value: 15 },
    { name: '设备折旧', value: 15 },
    { name: '其他成本', value: 10 }
  ]
})

const total = computed(() => props.data.reduce((sum, item) => sum + item.value, 0))

// 计算饼图扇区路径 (V1.1: innerRadius=40, outerRadius=70)
const piePaths = computed(() => {
  const cx = 100, cy = 100, r = 70  // outerRadius
  let startAngle = -90 // 从12点钟方向开始

  return props.data.map(item => {
    const angle = (item.value / total.value) * 360
    const endAngle = startAngle + angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

    startAngle = endAngle

    return { path }
  })
})

// 计算百分比标签位置和引线 (V1.1样式)
const labelPositions = computed(() => {
  const cx = 100, cy = 100
  const outerRadius = 70
  const labelRadius = 90  // outerRadius + 20
  let startAngle = -90

  return props.data.map((item) => {
    const angle = (item.value / total.value) * 360
    const midAngle = startAngle + angle / 2

    const RADIAN = Math.PI / 180

    // 扇区边缘中点（引线起点）
    const edgeX = cx + outerRadius * Math.cos(midAngle * RADIAN)
    const edgeY = cy + outerRadius * Math.sin(midAngle * RADIAN)

    // 引线折点（稍微延伸）
    const lineX = cx + (outerRadius + 10) * Math.cos(midAngle * RADIAN)
    const lineY = cy + (outerRadius + 10) * Math.sin(midAngle * RADIAN)

    // 标签位置
    const labelX = cx + labelRadius * Math.cos(midAngle * RADIAN)
    const labelY = cy + labelRadius * Math.sin(midAngle * RADIAN)

    const textAnchor = labelX > cx ? 'start' : 'end'

    startAngle = startAngle + angle

    return {
      labelX,
      labelY,
      textAnchor,
      percent: Math.round((item.value / total.value) * 100),
      linePoints: `${edgeX},${edgeY} ${lineX},${lineY} ${labelX},${labelY}`
    }
  })
})
</script>
