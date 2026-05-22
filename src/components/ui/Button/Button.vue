<template>
  <el-button
    :size="mappedSize"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    :round="round"
    :circle="circle"
    :class="buttonClass"
    :type="mappedType"
    native-type="button"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { computed } from 'vue'
import { ElButton } from 'element-plus'

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  },
  circle: {
    type: Boolean,
    default: false
  },
  nativeType: {
    type: String,
    default: 'button'
  },
  icon: Object
})

const emit = defineEmits(['click'])

// V1.1 样式映射
const variantClass = {
  default: 'bg-emerald-600 text-white hover:bg-emerald-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'hover:bg-gray-100 hover:text-gray-900',
  link: 'text-emerald-600 underline-offset-4 hover:underline',
  blue: 'bg-blue-600 text-white hover:bg-blue-700',
  warning: 'bg-amber-500 text-white hover:bg-amber-600'
}

const sizeClass = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs rounded-md',
  lg: 'h-12 px-8 rounded-md text-base',
  icon: 'h-9 w-9'
}

// Element Plus 类型映射
const typeMap = {
  default: 'default',
  destructive: 'danger',
  outline: 'default',
  secondary: 'default',
  ghost: 'default',
  link: 'default',
  blue: 'primary',
  warning: 'warning'
}

const sizeMap = {
  default: 'default',
  sm: 'small',
  lg: 'large',
  icon: 'default'
}

const mappedType = computed(() => typeMap[props.variant || 'default'] || 'default')
const mappedSize = computed(() => sizeMap[props.size || 'default'] || 'default')

const buttonClass = computed(() => [
  variantClass[props.variant || 'default'],
  sizeClass[props.size || 'default']
])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Element Plus 按钮样式覆盖以匹配 V1.1 */
:deep(.el-button) {
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

:deep(.el-button--default) {
  background-color: #059669;
  border-color: #059669;
  color: white;
}

:deep(.el-button--default:hover) {
  background-color: #047857;
  border-color: #047857;
}

:deep(.el-button--primary) {
  background-color: #059669;
  border-color: #059669;
}

:deep(.el-button--danger) {
  background-color: #dc2626;
  border-color: #dc2626;
}

:deep(.el-button--warning) {
  background-color: #f59e0b;
  border-color: #f59e0b;
}
</style>
