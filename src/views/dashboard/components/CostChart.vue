<template>
  <div class="bg-white rounded-xl p-6 shadow-none border border-gray-100">
    <h3 class="text-base font-semibold text-gray-900 mb-4">成本构成分析</h3>
    <div class="flex gap-4 mb-4">
      <el-select :model-value="period" @change="$emit('period-change', $event)" size="small" style="width: 80px">
        <el-option label="本月" value="month" />
        <el-option label="本季度" value="quarter" />
        <el-option label="本年" value="year" />
      </el-select>
      <el-select :model-value="crop" @change="$emit('crop-change', $event)" placeholder="全部作物" size="small" style="width: 100px">
        <el-option label="全部作物" value="" />
        <el-option label="番茄" value="C001" />
        <el-option label="黄瓜" value="C002" />
        <el-option label="辣椒" value="C003" />
      </el-select>
      <el-select :model-value="areaType" @change="$emit('area-type-change', $event)" placeholder="全部区域类型" size="small" style="width: 120px">
        <el-option label="全部区域类型" value="" />
        <el-option label="大棚" value="greenhouse" />
        <el-option label="大田" value="field" />
      </el-select>
    </div>
    <div class="h-56">
      <div class="relative w-full h-full flex items-center justify-center">
        <!-- 饼图 SVG -->
        <svg viewBox="0 0 200 200" class="w-40 h-40">
          <!-- 扇区 path -->
          <path
            v-for="(slice, index) in piePaths"
            :key="index"
            :d="slice.path"
            :fill="colors[index % colors.length]"
            class="transition-all hover:opacity-80"
          />
          <!-- 中心空白 - 用最上层的circle覆盖 -->
          <circle cx="100" cy="100" r="35" fill="white" />
        </svg>
        <!-- 中心文字 -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none" style="top: 20%; height: 60%;">
          <span class="text-lg font-bold text-gray-700">成本</span>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      <div v-for="(item, index) in data.slice(0, 4)" :key="item.name" class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: colors[index % colors.length] }"></div>
        <span class="text-xs text-gray-600">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const props = defineProps({
  period: String,
  crop: String,
  areaType: String,
  data: {
    type: Array,
    default: () => [
      { name: '种子', value: 15000 },
      { name: '肥料', value: 22000 },
      { name: '农药', value: 8000 },
      { name: '人工', value: 35000 },
      { name: '设备', value: 12000 }
    ]
  }
})

defineEmits(['period-change', 'crop-change', 'area-type-change'])

const total = computed(() => props.data.reduce((sum, item) => sum + item.value, 0))

// 计算饼图扇区路径
const piePaths = computed(() => {
  const cx = 100, cy = 100, r = 50
  let startAngle = -90 // 从12点钟方向开始

  return props.data.map(item => {
    const angle = (item.value / total.value) * 360
    const endAngle = startAngle + angle

    // 转换为弧度
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    // 计算起点和终点坐标
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    // 判断是否为大弧
    const largeArc = angle > 180 ? 1 : 0

    // 移动到圆心 -> 画到起点 -> 画弧到终点 -> 闭合到圆心
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

    startAngle = endAngle

    return { path }
  })
})
</script>
