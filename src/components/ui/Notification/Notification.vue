<template>
  <teleport to="body">
    <transition-group name="notification-slide" tag="div" class="notification-container" :class="positionClass">
      <div
        v-for="item in notifications"
        :key="item.id"
        :class="['notification-item', variantClass(item.variant)]"
      >
        <div class="notification-icon">
          <el-icon :size="20">
            <component :is="getIcon(item.variant)" />
          </el-icon>
        </div>
        <div class="notification-content">
          <div v-if="item.title" class="notification-title">{{ item.title }}</div>
          <div v-if="item.description" class="notification-desc">{{ item.description }}</div>
        </div>
        <button class="notification-close" @click="remove(item.id)">
          <el-icon :size="16"><Close /></el-icon>
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check, Warning, CircleClose, Info, Close } from '@element-plus/icons-vue'

const props = defineProps({
  position: { type: String, default: 'top-right' } // top-right, top-left, bottom-right, bottom-left
})

const notifications = ref([])

const positionClass = computed(() => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }
  return positions[props.position] || positions['top-right']
})

const variantClass = (variant) => ({
  success: 'notification-success',
  warning: 'notification-warning',
  error: 'notification-error',
  info: 'notification-info'
})[variant] || 'notification-info'

const getIcon = (variant) => ({
  success: Check,
  warning: Warning,
  error: CircleClose,
  info: Info
})[variant] || Info

const add = (notification) => {
  const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  notifications.value.push({ ...notification, id })

  if (notification.duration !== 0) {
    setTimeout(() => remove(id), notification.duration || 3000)
  }
}

const remove = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) notifications.value.splice(index, 1)
}

defineExpose({ add, remove })
</script>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 24rem;
}

.top-4 { top: 1rem; }
.bottom-4 { bottom: 1rem; }
.right-4 { right: 1rem; }
.left-4 { left: 1rem; }

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  background: white;
}

.notification-success { border-color: #bbf7d0; }
.notification-warning { border-color: #fde68a; }
.notification-error { border-color: #fecaca; }
.notification-info { border-color: #bfdbfe; }

.notification-icon {
  flex-shrink: 0;
}

.notification-success .notification-icon { color: #16a34a; }
.notification-warning .notification-icon { color: #d97706; }
.notification-error .notification-icon { color: #dc2626; }
.notification-info .notification-icon { color: #2563eb; }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.notification-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.notification-close {
  flex-shrink: 0;
  padding: 0.125rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 0.25rem;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* 过渡动画 */
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.3s ease;
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
