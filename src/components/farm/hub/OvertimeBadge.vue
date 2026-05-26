<template>
  <span
    v-if="timeout"
    :class="[
      'inline-flex items-center gap-1 rounded-full border font-medium',
      sizeClass,
      computedStyle.bg,
      computedStyle.text,
      computedStyle.border
    ]"
    :title="`${typeLabel} - ${isCritical ? '危急' : '预警'}`"
  >
    <el-icon :size="iconSize">
      <WarningFilled v-if="isCritical" />
      <Clock v-else />
    </el-icon>
    <span v-if="showLabel">{{ typeLabel }}</span>
  </span>
</template>

<script>
import { defineComponent, computed, h } from 'vue'
import { WarningFilled, Clock } from '@element-plus/icons-vue'

/**
 * 超时时长显示子组件
 * 计算并显示"已超时X天Y小时"
 */
export const OvertimeDuration = defineComponent({
  name: 'OvertimeDuration',
  props: {
    startedAt: { type: String, required: true },
    size: { type: String, default: 'sm' }
  },
  setup(props) {
    const durationText = computed(() => {
      const started = new Date(props.startedAt)
      const now = new Date()
      const diffMs = now.getTime() - started.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays > 0) {
        const remainHours = diffHours % 24
        return `已超时${diffDays}天${remainHours > 0 ? remainHours + '小时' : ''}`
      }
      return `已超时${diffHours}小时`
    })

    const sizeClass = computed(() => props.size === 'sm' ? 'text-xs' : 'text-sm')

    return () => h('span', { class: `text-red-600 font-medium ${sizeClass.value}` }, durationText.value)
  }
})
</script>

<script setup>
import { computed } from 'vue'

/**
 * 超时预警徽章组件
 * 显示任务超时状态标记
 */
/** @type {import('vue').DefineProps<{timeout?: {type: string, severity: string, startedAt: string}, size?: 'sm'|'md', showLabel?: boolean}>} */
const props = defineProps({
  timeout: { type: Object, default: undefined },
  size: { type: String, default: 'md' },
  showLabel: { type: Boolean, default: true }
})

const isWarning = computed(() => props.timeout?.severity === 'warning')
const isCritical = computed(() => props.timeout?.severity === 'critical')

/** 超时类型中文标签映射 */
const typeLabel = computed(() => {
  switch (props.timeout?.type) {
    case 'accept': return '接受超时'
    case 'execution': return '执行超时'
    case 'acceptance': return '验收超时'
    default: return '超时'
  }
})

/** 根据严重程度返回样式 */
const computedStyle = computed(() => {
  if (isCritical.value) {
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  }
  if (isWarning.value) {
    return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
  }
  return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
})

const sizeClass = computed(() => props.size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1')
const iconSize = computed(() => props.size === 'sm' ? 12 : 16)
</script>
