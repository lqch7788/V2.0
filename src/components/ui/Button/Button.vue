<template>
  <el-button
    :size="mappedSize"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    :round="round"
    :circle="circle"
    :type="mappedType"
    :plain="variant === 'ghost' || variant === 'outline'"
    :text="variant === 'link'"
    :link="variant === 'link'"
    :class="buttonClass"
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
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  round: { type: Boolean, default: false },
  circle: { type: Boolean, default: false },
  nativeType: { type: String, default: 'button' },
  icon: Object
})

const emit = defineEmits(['click'])

const typeMap = {
  default: 'primary',
  destructive: 'danger',
  outline: 'default',
  secondary: 'default',
  ghost: 'default',
  link: 'default',
  blue: 'primary',
  warning: 'warning'
}

const sizeMap = { default: 'default', sm: 'small', lg: 'large', icon: 'default' }

const mappedType = computed(() => typeMap[props.variant] || 'primary')
const mappedSize = computed(() => sizeMap[props.size] || 'default')

const variantClass = {
  secondary: '!bg-gray-100 !text-gray-900 hover:!bg-gray-200 !border-gray-100',
  outline: '!border-gray-200 !bg-white hover:!bg-gray-50 hover:!text-gray-900',
  ghost: '!bg-transparent !border-transparent hover:!bg-gray-100 hover:!text-gray-900',
  destructive: '!bg-red-600 !text-white hover:!bg-red-700 !border-red-600',
  warning: '!bg-amber-500 !text-white hover:!bg-amber-600 !border-amber-500',
  link: '!text-emerald-600 !border-none !bg-transparent !shadow-none underline-offset-4 hover:!underline !p-0 !h-auto'
}

const buttonClass = computed(() => [variantClass[props.variant] || '', props.size === 'icon' ? '!w-9 !h-9 !p-0' : ''])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) emit('click', event)
}
</script>
