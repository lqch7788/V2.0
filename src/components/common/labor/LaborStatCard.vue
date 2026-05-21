<template>
  <div class="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <!-- 标题 -->
          <p class="text-sm font-medium text-gray-500 mb-1">{{ title }}</p>

          <!-- 数值 -->
          <div class="flex items-baseline gap-1">
            <span v-if="prefix" class="text-lg font-semibold text-gray-900">{{ prefix }}</span>
            <span class="text-3xl font-bold text-gray-900">{{ value }}</span>
            <span v-if="suffix" class="text-lg font-semibold text-gray-500">{{ suffix }}</span>
          </div>

          <!-- 趋势 -->
          <div v-if="trend" :class="['flex items-center gap-1 mt-2', trendColor]">
            <el-icon v-if="trendDirection === 'up'"><CaretTop /></el-icon>
            <el-icon v-else-if="trendDirection === 'down'"><CaretBottom /></el-icon>
            <el-icon v-else><Minus /></el-icon>
            <span class="text-sm font-medium">
              {{ trend.value > 0 ? '+' : '' }}{{ trend.value }}%
            </span>
            <span class="text-sm text-gray-400 ml-1">较上期</span>
          </div>

          <!-- 描述 -->
          <p v-if="description" class="text-sm text-gray-500 mt-2">{{ description }}</p>
        </div>

        <!-- 图标 -->
        <div
          v-if="icon"
          class="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center"
        >
          <el-icon :size="24" class="text-emerald-600">
            <component :is="icon" />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CaretTop, CaretBottom, Minus } from '@element-plus/icons-vue'

const props = defineProps({"className":"''"})

const trendDirection = computed(() => {
  if (!props.trend) return 'neutral'
  if (props.trend.direction) return props.trend.direction
  if (props.trend.value > 0) return 'up'
  if (props.trend.value < 0) return 'down'
  return 'neutral'
})

const trendColor = computed(() => {
  const colors = {
    up: 'text-red-500',
    down: 'text-green-500',
    neutral: 'text-gray-400'
  }
  return colors[trendDirection.value]
})
</script>
