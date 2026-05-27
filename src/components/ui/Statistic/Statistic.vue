<template>
  <div class="space-y-2" :class="className">
    <p v-if="title" class="text-sm text-gray-500">{{ title }}</p>
    <div class="flex items-baseline gap-2">
      <span v-if="prefix" class="text-lg text-gray-600">{{ prefix }}</span>
      <span class="text-3xl font-bold text-gray-900">{{ displayValue }}</span>
      <span v-if="suffix" class="text-lg text-gray-600">{{ suffix }}</span>
    </div>
    <div v-if="trend !== undefined" class="flex items-center gap-1 text-sm" :class="trendClass">
      <el-icon :size="16"><component :is="trendIcon" /></el-icon>
      <span>{{ trend > 0 ? '+' : '' }}{{ trend }}%</span>
      <span class="text-gray-400">较上期</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Top, Bottom } from '@element-plus/icons-vue'

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: [Number, String], default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  trend: { type: Number, default: undefined },
  trendDirection: { type: String, default: undefined },
  format: { type: Function, default: undefined },
  className: { type: String, default: '' }
})

const displayValue = computed(() => {
  if (props.format) return props.format(props.value)
  if (typeof props.value === 'number') return props.value.toLocaleString()
  return props.value
})

const trendUp = computed(() => props.trendDirection === 'up' || (!props.trendDirection && props.trend > 0))
const trendDown = computed(() => props.trendDirection === 'down' || (!props.trendDirection && props.trend < 0))

const trendClass = computed(() => ({
  'text-emerald-600': trendUp.value,
  'text-red-600': trendDown.value,
  'text-gray-500': !trendUp.value && !trendDown.value
}))

const trendIcon = computed(() => trendUp.value ? Top : Bottom)
</script>
