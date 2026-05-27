<template>
  <div class="relative flex gap-3 p-4 rounded-lg border" :class="alertClass" role="alert">
    <!-- Icon -->
    <component :is="iconComp" class="w-5 h-5 flex-shrink-0 mt-0.5" :class="iconColor" />
    <!-- Content -->
    <div class="flex-1 space-y-1">
      <h4 v-if="title" class="text-sm font-medium text-gray-900">{{ title }}</h4>
      <p v-if="description" class="text-sm text-gray-600">{{ description }}</p>
      <div v-if="$slots.action" class="pt-2">
        <slot name="action" />
      </div>
    </div>
    <!-- Close button -->
    <button v-if="onClose" class="absolute top-4 right-4 p-1 rounded hover:bg-black/5 transition-colors" @click="onClose">
      <el-icon :size="16"><Close /></el-icon>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Close, InfoFilled, CircleCheckFilled, WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const props = defineProps({
  variant: { type: String, default: 'default' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  onClose: Function
})

const config = {
  default:  { bg: 'bg-gray-50', border: 'border-gray-200', icon: InfoFilled, iconColor: 'text-gray-500' },
  success:  { bg: 'bg-green-50', border: 'border-green-200', icon: CircleCheckFilled, iconColor: 'text-green-600' },
  warning:  { bg: 'bg-orange-50', border: 'border-orange-200', icon: WarningFilled, iconColor: 'text-orange-600' },
  destructive: { bg: 'bg-red-50', border: 'border-red-200', icon: CircleCloseFilled, iconColor: 'text-red-600' },
  info:     { bg: 'bg-blue-50', border: 'border-blue-200', icon: InfoFilled, iconColor: 'text-blue-600' }
}

const current = computed(() => config[props.variant] || config.default)
const alertClass = computed(() => [current.value.bg, current.value.border])
const iconComp = computed(() => current.value.icon)
const iconColor = computed(() => current.value.iconColor)
</script>
