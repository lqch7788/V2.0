<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
        <!-- 模态框容器 - 支持拖动和缩放 -->
        <div
          ref="dialogRef"
          class="dialog-container"
          :class="{ 'dialog-maximized': isMaximized, 'dialog-resizing': isResizing }"
          :style="dialogStyle"
          @mousedown="handleDialogMouseDown"
        >
          <!-- 顶部标题栏 - 可拖动 -->
          <div
            class="dialog-header"
            :class="{ 'cursor-move': enableDrag && !isMaximized }"
            @mousedown.stop="handleHeaderMouseDown"
            @dblclick="handleToggleMaximize"
          >
            <div class="dialog-title">{{ title }}</div>
            <div class="dialog-header-actions">
              <slot name="header-action" />
              <!-- 最大化/还原按钮 -->
              <button
                v-if="showMaximize"
                class="dialog-header-btn"
                :title="isMaximized ? '还原窗口' : '最大化窗口'"
                @click.stop="handleToggleMaximize"
              >
                <el-icon :size="16"><component :is="isMaximized ? 'DocumentCopy' : 'FullScreen'" /></el-icon>
              </button>
              <!-- 关闭按钮 -->
              <button class="dialog-header-btn" title="关闭" @click.stop="handleClose">
                <el-icon :size="18"><Close /></el-icon>
              </button>
            </div>
          </div>

          <!-- 缩放句柄 - 8个方向 -->
          <template v-if="enableResize && !isMaximized">
            <!-- 四角缩放句柄 -->
            <div class="resize-handle resize-handle-nw" @mousedown.stop="startResize('nw', $event)" />
            <div class="resize-handle resize-handle-ne" @mousedown.stop="startResize('ne', $event)" />
            <div class="resize-handle resize-handle-sw" @mousedown.stop="startResize('sw', $event)" />
            <div class="resize-handle resize-handle-se" @mousedown.stop="startResize('se', $event)" />
            <!-- 四边缩放句柄 -->
            <div class="resize-handle resize-handle-n" @mousedown.stop="startResize('n', $event)" />
            <div class="resize-handle resize-handle-s" @mousedown.stop="startResize('s', $event)" />
            <div class="resize-handle resize-handle-w" @mousedown.stop="startResize('w', $event)" />
            <div class="resize-handle resize-handle-e" @mousedown.stop="startResize('e', $event)" />
          </template>

          <!-- 内容区域 -->
          <div class="dialog-body" :class="bodyClassName">
            <slot />
          </div>

          <!-- 底部内容 -->
          <div v-if="$slots.footer || showFooter" class="dialog-footer">
            <slot name="footer">
              <div class="dialog-footer-content">
                <el-button @click="handleCancel">{{ cancelText }}</el-button>
                <el-button v-if="showOk" type="primary" :loading="submitting" @click="handleOk">
                  {{ okText }}
                </el-button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Close, FullScreen, DocumentCopy } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '500px' },
  height: { type: String, default: '400px' },
  minWidth: { type: Number, default: 300 },
  minHeight: { type: Number, default: 200 },
  // 拖动
  enableDrag: { type: Boolean, default: true },
  // 缩放
  enableResize: { type: Boolean, default: true },
  // 最大化
  showMaximize: { type: Boolean, default: true },
  // 底部显示
  showFooter: { type: Boolean, default: true },
  showOk: { type: Boolean, default: true },
  okText: { type: String, default: '保存' },
  cancelText: { type: String, default: '取消' },
  // 提交中状态
  submitting: { type: Boolean, default: false },
  // 自定义样式类
  bodyClassName: { type: String, default: '' },
  // 关闭配置
  closeOnClickModal: { type: Boolean, default: false },
  closeOnPressEscape: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'ok',
  'cancel',
  'opened',
  'closed'
])

// 可见性
const visible = ref(false)

// 位置和尺寸
const dialogRef = ref(null)
const position = ref({ x: 0, y: 0 })
const size = ref({ width: 0, height: 0 })
const isMaximized = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const resizeDirection = ref('')
const initialSize = ref({ width: 0, height: 0 })
const initialMouse = ref({ x: 0, y: 0 })
const initialPosition = ref({ x: 0, y: 0 })
const rafId = ref(null)

// 尺寸预设
const sizePresets = {
  sm: { width: 400, height: 300 },
  md: { width: 500, height: 400 },
  lg: { width: 700, height: 500 },
  xl: { width: 900, height: 600 },
  xxl: { width: 1080, height: 650 }
}

// 解析尺寸
const parseSize = (sizeStr) => {
  if (typeof sizeStr === 'number') return sizeStr
  if (sizeStr.endsWith('px')) return parseInt(sizeStr)
  if (sizeStr.endsWith('%')) return (window.innerWidth * parseInt(sizeStr)) / 100
  return parseInt(sizeStr)
}

// 计算模态框样式
const dialogStyle = computed(() => {
  if (isMaximized.value) {
    return {
      left: '16px',
      top: '16px',
      width: 'calc(100vw - 32px)',
      height: 'calc(100vh - 32px)'
    }
  }
  return {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    width: typeof size.value.width === 'number' ? `${size.value.width}px` : size.value.width,
    height: typeof size.value.height === 'number' ? `${size.value.height}px` : size.value.height
  }
})

// 初始化位置
const initPosition = () => {
  const width = parseSize(props.width)
  const height = parseSize(props.height)
  size.value = { width, height }
  position.value = {
    x: (window.innerWidth - width) / 2,
    y: (window.innerHeight - height) / 2
  }
}

// 切换最大化
const handleToggleMaximize = () => {
  if (!props.showMaximize) return

  if (isMaximized.value) {
    // 还原
    isMaximized.value = false
    position.value = { ...initialSize.value.restorePosition }
    size.value = { ...initialSize.value.restoreSize }
  } else {
    // 最大化
    initialSize.value = {
      restorePosition: { ...position.value },
      restoreSize: { ...size.value }
    }
    isMaximized.value = true
  }
}

// 关闭
const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}

// 取消
const handleCancel = () => {
  handleClose()
  emit('cancel')
}

// 确认
const handleOk = () => {
  emit('ok')
}

// 拖动开始
const handleHeaderMouseDown = (e) => {
  if (!props.enableDrag || isMaximized.value) return
  if (e.target.closest('.dialog-header-btn')) return

  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
}

// 对话框点击（获取焦点）
const handleDialogMouseDown = () => {
  // 可以用来做层级管理
}

// 缩放开始
const startResize = (direction, e) => {
  if (!props.enableResize || isMaximized.value) return

  isResizing.value = true
  resizeDirection.value = direction
  initialSize.value = { ...size.value }
  initialMouse.value = { x: e.clientX, y: e.clientY }
  initialPosition.value = { ...position.value }
}

// 鼠标移动
const handleMouseMove = (e) => {
  if (rafId.value) {
    cancelAnimationFrame(rafId.value)
  }

  rafId.value = requestAnimationFrame(() => {
    if (isDragging.value) {
      const rawX = e.clientX - dragOffset.value.x
      const rawY = e.clientY - dragOffset.value.y
      const padding = 30

      position.value = {
        x: Math.max(padding, Math.min(rawX, window.innerWidth - size.value.width - padding)),
        y: Math.max(padding, Math.min(rawY, window.innerHeight - size.value.height - padding))
      }
    }

    if (isResizing.value) {
      const deltaX = e.clientX - initialMouse.value.x
      const deltaY = e.clientY - initialMouse.value.y

      let newWidth = initialSize.value.width
      let newHeight = initialSize.value.height
      let newX = initialPosition.value.x
      let newY = initialPosition.value.y

      if (resizeDirection.value.includes('e')) {
        newWidth = Math.max(props.minWidth, initialSize.value.width + deltaX)
      }
      if (resizeDirection.value.includes('s')) {
        newHeight = Math.max(props.minHeight, initialSize.value.height + deltaY)
      }
      if (resizeDirection.value.includes('w')) {
        newWidth = Math.max(props.minWidth, initialSize.value.width - deltaX)
        newX = initialPosition.value.x + (initialSize.value.width - newWidth)
      }
      if (resizeDirection.value.includes('n')) {
        newHeight = Math.max(props.minHeight, initialSize.value.height - deltaY)
        newY = initialPosition.value.y + (initialSize.value.height - newHeight)
      }

      size.value = { width: newWidth, height: newHeight }
      position.value = { x: newX, y: newY }
    }
  })
}

// 鼠标释放
const handleMouseUp = () => {
  if (rafId.value) {
    cancelAnimationFrame(rafId.value)
    rafId.value = null
  }
  isDragging.value = false
  isResizing.value = false
  resizeDirection.value = ''
}

// ESC键关闭
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.closeOnPressEscape && visible.value) {
    handleClose()
  }
}

// 监听显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    initPosition()
    emit('opened')
    document.addEventListener('keydown', handleKeyDown)
  } else {
    emit('closed')
    document.removeEventListener('keydown', handleKeyDown)
  }
}, { immediate: true })

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('keydown', handleKeyDown)
  if (rafId.value) {
    cancelAnimationFrame(rafId.value)
  }
})
</script>

<style scoped>
/* V1.1 风格的 Dialog 组件 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  overflow: hidden;
  min-width: 300px;
  min-height: 200px;
}

.dialog-container.dialog-resizing {
  user-select: none;
}

/* 标题栏 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  color: white;
  flex-shrink: 0;
  user-select: none;
}

.dialog-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.dialog-header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dialog-header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.15s;
}

.dialog-header-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 内容区域 */
.dialog-body {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

/* 底部区域 */
.dialog-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.dialog-footer-content {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* 缩放句柄样式 */
.resize-handle {
  position: absolute;
  background: transparent;
}

.resize-handle-nw,
.resize-handle-ne,
.resize-handle-sw,
.resize-handle-se {
  width: 12px;
  height: 12px;
}

.resize-handle-n,
.resize-handle-s {
  height: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.resize-handle-e,
.resize-handle-w {
  width: 8px;
  top: 50%;
  transform: translateY(-50%);
}

/* 四角位置 */
.resize-handle-nw {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

.resize-handle-ne {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

.resize-handle-sw {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
}

.resize-handle-se {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}

/* 四边位置 */
.resize-handle-n {
  top: 0;
  cursor: n-resize;
}

.resize-handle-s {
  bottom: 0;
  cursor: s-resize;
}

.resize-handle-w {
  left: 0;
  cursor: w-resize;
}

.resize-handle-e {
  right: 0;
  cursor: e-resize;
}

/* 缩放句柄悬浮效果 */
.resize-handle:hover {
  background: rgba(16, 185, 129, 0.3);
}

/* 过渡动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-active .dialog-container,
.dialog-fade-leave-active .dialog-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog-container,
.dialog-fade-leave-to .dialog-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
