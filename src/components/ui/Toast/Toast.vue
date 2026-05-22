<template>
  <teleport to="body">
    <transition-group name="toast-slide" tag="div" class="toast-container">
      <div
        v-for="item in toasts"
        :key="item.id"
        :class="['toast-item', variantClass(item.type)]"
      >
        <el-icon :size="18" class="toast-icon">
          <component :is="getIcon(item.type)" />
        </el-icon>
        <span class="toast-message">{{ item.message }}</span>
        <button class="toast-close" @click="dismiss(item.id)">
          <el-icon :size="14"><Close /></el-icon>
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'
import { Check, Warning, CircleClose, Info, Close } from '@element-plus/icons-vue'

const toasts = ref([])

const variantClass = (type) => ({
  success: 'toast-success',
  warning: 'toast-warning',
  error: 'toast-error',
  info: 'toast-info'
})[type] || 'toast-info'

const getIcon = (type) => ({
  success: Check,
  warning: Warning,
  error: CircleClose,
  info: Info
})[type] || Info

const addToast = (type, message, duration = 3000) => {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  toasts.value.push({ id, type, message, duration })

  if (duration > 0) {
    setTimeout(() => dismiss(id), duration)
  }
}

const dismiss = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) toasts.value.splice(index, 1)
}

defineExpose({
  success: (message, duration) => addToast('success', message, duration),
  error: (message, duration) => addToast('error', message, duration),
  warning: (message, duration) => addToast('warning', message, duration),
  info: (message, duration) => addToast('info', message, duration)
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 24rem;
  width: 100%;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  background: white;
}

.toast-success { border-color: #bbf7d0; background: #f0fdf4; }
.toast-warning { border-color: #fde68a; background: #fffbeb; }
.toast-error { border-color: #fecaca; background: #fef2f2; }
.toast-info { border-color: #bfdbfe; background: #eff6ff; }

.toast-icon {
  flex-shrink: 0;
}

.toast-success .toast-icon { color: #16a34a; }
.toast-warning .toast-icon { color: #d97706; }
.toast-error .toast-icon { color: #dc2626; }
.toast-info .toast-icon { color: #2563eb; }

.toast-message {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.toast-close {
  flex-shrink: 0;
  padding: 0.125rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  color: #6b7280;
}

/* 过渡动画 */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
