<template>
  <!-- KPI 指标卡片 - 可复用的关键指标展示组件 -->
  <div
    :class="[
      'bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow',
      compact ? 'p-3' : 'p-5',
      onClick ? 'cursor-pointer' : ''
    ]"
    @click="handleClick"
  >
    <!-- 紧凑模式：横向布局 -->
    <template v-if="compact">
      <div class="flex items-center gap-3">
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0', colors.iconBg]">
          <slot name="icon">
            <el-icon :size="16" color="white"><component :is="iconComponent" /></el-icon>
          </slot>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-bold text-gray-900 truncate">{{ value }}</p>
          <p class="text-[11px] text-gray-500">{{ label }}</p>
        </div>
        <div
          v-if="trend !== undefined"
          :class="['flex items-center gap-0.5 text-xs flex-shrink-0', trend >= 0 ? colors.trendUp : 'text-red-600']"
        >
          <el-icon :size="12"><component :is="trend >= 0 ? 'Top' : 'Bottom'" /></el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>
    </template>

    <!-- 标准模式：纵向布局 -->
    <template v-else>
      <div class="flex items-center justify-between">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shadow-sm', colors.iconBg]">
          <slot name="icon">
            <el-icon :size="20" color="white"><component :is="iconComponent" /></el-icon>
          </slot>
        </div>
        <div
          v-if="trend !== undefined"
          :class="['flex items-center gap-0.5 text-sm', trend >= 0 ? colors.trendUp : 'text-red-600']"
        >
          <el-icon :size="16"><component :is="trend >= 0 ? 'Top' : 'Bottom'" /></el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>
      <div class="mt-3">
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ label }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Top, Bottom } from '@element-plus/icons-vue'

const props = defineProps({
  colorScheme: {
    type: String,
    default: 'emerald'
  },
  compact: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [String, Object],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    default: 0
  },
  trend: {
    type: Number,
    default: undefined
  },
  onClick: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['click'])

// 颜色方案映射
const COLOR_SCHEMES = {
  emerald: { bg: 'bg-emerald-50', iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', trendUp: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600', trendUp: 'text-amber-600' },
  red: { bg: 'bg-red-50', iconBg: 'bg-gradient-to-br from-red-500 to-red-600', trendUp: 'text-red-600' },
  blue: { bg: 'bg-blue-50', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', trendUp: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600', trendUp: 'text-purple-600' },
  slate: { bg: 'bg-slate-50', iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600', trendUp: 'text-slate-600' },
}

const colors = computed(() => COLOR_SCHEMES[props.colorScheme] || COLOR_SCHEMES.emerald)

// 图标组件
const iconComponent = computed(() => {
  if (!props.icon) return null
  if (typeof props.icon === 'string') {
    return props.icon
  }
  return props.icon
})

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
  }
  emit('click')
}
</script>
