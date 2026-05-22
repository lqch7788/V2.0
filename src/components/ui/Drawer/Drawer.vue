<template>
  <teleport to="body">
    <transition name="drawer-slide">
      <div v-if="visible" class="drawer-overlay" @click.self="handleClose">
        <div
          ref="drawerRef"
          class="drawer-container"
          :class="{ 'drawer-placement-right': placement === 'right', 'drawer-placement-left': placement === 'left' }"
          :style="drawerStyle"
        >
          <!-- 标题栏 -->
          <div class="drawer-header">
            <div class="drawer-title">
              <slot name="title">{{ title }}</slot>
            </div>
            <button class="drawer-close" @click="handleClose">
              <el-icon :size="18"><Close /></el-icon>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="drawer-body">
            <slot />
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="drawer-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '400px' },
  placement: { type: String, default: 'right' }, // right, left
  closeOnClickModal: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
  emit('close')
}

const drawerStyle = computed(() => ({
  width: props.width
}))
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
}

.drawer-container {
  position: fixed;
  top: 0;
  bottom: 0;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.drawer-placement-right {
  right: 0;
}

.drawer-placement-left {
  left: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to right, #10b981, #059669, #10b981);
}

.drawer-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.drawer-close {
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.drawer-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* 过渡动画 */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: opacity 0.3s;
}

.drawer-slide-enter-active .drawer-container,
.drawer-slide-leave-active .drawer-container {
  transition: transform 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
}

.drawer-slide-enter-from .drawer-container,
.drawer-slide-leave-to .drawer-container {
  transform: translateX(100%);
}

.drawer-placement-left.drawer-slide-enter-from .drawer-container,
.drawer-placement-left.drawer-slide-leave-to .drawer-container {
  transform: translateX(-100%);
}
</style>
