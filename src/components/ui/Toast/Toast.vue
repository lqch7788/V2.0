<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <transition-group name="toast-slide">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in"
          :class="toastClass(toast.type)"
        >
          <el-icon :size="18"><component :is="toastIcon(toast.type)" /></el-icon>
          <span>{{ toast.message }}</span>
          <button class="ml-2 p-1 rounded hover:bg-black/5" @click="dismiss(toast.id)">
            <el-icon :size="14"><Close /></el-icon>
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'
import { Close, CircleCheckFilled, CircleCloseFilled, WarningFilled, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  toasts: { type: Array, default: () => [] },
  onDismiss: { type: Function, default: () => {} }
})

const emit = defineEmits(['dismiss'])

const dismiss = (id) => {
  emit('dismiss', id)
  if (props.onDismiss) props.onDismiss(id)
}

const toastClass = (type) => ({
  success: 'bg-green-50 text-green-800 border border-green-200',
  error: 'bg-red-50 text-red-800 border border-red-200',
  warning: 'bg-orange-50 text-orange-800 border border-orange-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200'
}[type] || 'bg-gray-50 text-gray-800 border border-gray-200')

const toastIcon = (type) => ({
  success: CircleCheckFilled,
  error: CircleCloseFilled,
  warning: WarningFilled,
  info: InfoFilled
}[type] || InfoFilled)
</script>

<style scoped>
.toast-slide-enter-active { transition: all 0.3s ease; }
.toast-slide-leave-active { transition: all 0.2s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateX(20px); }
.toast-slide-leave-to { opacity: 0; transform: translateX(20px); }
</style>
