<template>
  <div v-if="show" :class="['ui-alert', variantClass]" role="alert">
    <div class="alert-content">
      <div class="alert-icon">
        <el-icon :size="20"><component :is="iconComponent" /></el-icon>
      </div>
      <div class="alert-body">
        <div v-if="title" class="alert-title">{{ title }}</div>
        <div class="alert-message">
          <slot />
        </div>
      </div>
      <button v-if="closable" class="alert-close" @click="handleClose">
        <el-icon :size="16"><Close /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Close, WarningFilled, CircleCheckFilled, InfoFilled, WarningOutlined } from '@element-plus/icons-vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info' // success, warning, error, info
  },
  title: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const variantClass = computed(() => {
  const variants = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }
  return variants[props.type] || variants.info
})

const iconComponent = computed(() => {
  const icons = {
    success: 'CircleCheckFilled',
    warning: 'WarningFilled',
    error: 'WarningFilled',
    info: 'InfoFilled'
  }
  return icons[props.type] || icons.info
})

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.ui-alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-message {
  font-size: 0.875rem;
  line-height: 1.5;
}

.alert-close {
  flex-shrink: 0;
  padding: 0.125rem;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}
</style>
