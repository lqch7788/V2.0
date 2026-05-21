<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium',
      config?.color || 'bg-gray-100',
      config?.textColor || 'text-gray-700',
      sizeClasses[size],
      className
    ]"
  >
    <!-- 圆点 -->
    <span
      v-if="showDot"
      :class="['mr-1.5 rounded-full', config?.dotColor || 'bg-gray-500', dotSizeClasses[size]]"
    />
    {{ displayLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

// 状态配置

const STATUS_CONFIG = {
  pending: { label: '待执行', color: 'bg-gray-100', textColor: 'text-gray-700', dotColor: 'bg-gray-500' },
  in_progress: { label: '进行中', color: 'bg-blue-100', textColor: 'text-blue-700', dotColor: 'bg-blue-500' },
  completed: { label: '已完成', color: 'bg-green-100', textColor: 'text-green-700', dotColor: 'bg-green-500' },
  cancelled: { label: '已取消', color: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-500' },
  paused: { label: '已暂停', color: 'bg-yellow-100', textColor: 'text-yellow-700', dotColor: 'bg-yellow-500' },
  overdue: { label: '已逾期', color: 'bg-orange-100', textColor: 'text-orange-700', dotColor: 'bg-orange-500' },
  draft: { label: '草稿', color: 'bg-gray-100', textColor: 'text-gray-500', dotColor: 'bg-gray-400' },
  approved: { label: '已批准', color: 'bg-emerald-100', textColor: 'text-emerald-700', dotColor: 'bg-emerald-500' },
  rejected: { label: '已拒绝', color: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-500' }
}

const props = defineProps({"showDot":"true","size":"'md'","className":"''"})

const config = computed(() => STATUS_CONFIG[props.status])
const displayLabel = computed(() => props.label || config.value?.label || props.status)

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm'
}

const dotSizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5'
}
</script>
