<template>
  <span
    v-if="timeout"
    :class="[
      'inline-flex items-center gap-1 rounded-full border font-medium',
      sizeClass,
      style.bg,
      style.text,
      style.border
    ]"
    :title="`${getTypeLabel()} - ${isCritical ? '危急' : '预警'}`"
  >
    <el-icon :size="iconSize">
      <component :is="iconComponent" />
    </el-icon>
    <span v-if="showLabel">{{ getTypeLabel() }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { Warning, Clock } from '@element-plus/icons-vue'

const props = defineProps({"size":"'sm'","showLabel":"true"})

const isWarning = computed(() => props.timeout?.severity === 'warning')
const isCritical = computed(() => props.timeout?.severity === 'critical')

const getTypeLabel = () => {
  switch (props.timeout?.type) {
    case 'accept': return '接受超时'
    case 'execution': return '执行超时'
    case 'acceptance': return '验收超时'
    default: return '超时'
  }
}

const style = computed(() => {
  if (isCritical.value) {
    return {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    }
  }
  if (isWarning.value) {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
    }
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  }
})

const iconComponent = computed(() => isCritical.value ? Warning )
const sizeClass = computed(() => props.size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1')
const iconSize = computed(() => props.size === 'sm' ? 12 )
</script>
