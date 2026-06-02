<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="el-modal-wrapper" @keydown.esc="handleEsc">
        <!-- Backdrop -->
        <div class="el-modal-backdrop" @click="onBackdropClick" />

        <!-- Modal Container -->
        <div
          ref="modalRef"
          class="el-modal-container"
          :class="[
            { 'is-maximized': isMaximized, 'is-resizing': isResizing, 'is-dragging': isDragging },
            enableDrag && !isMaximized ? 'cursor-move' : ''
          ]"
          :style="containerStyle"
          @mousedown="handleContainerMouseDown"
        >
          <!-- Resize Handles (8 directions, hidden when maximized) -->
          <template v-if="enableResize && !isMaximized">
            <div class="resize-handle resize-nw" @mousedown.stop="handleResizeMouseDown($event, 'nw')" />
            <div class="resize-handle resize-ne" @mousedown.stop="handleResizeMouseDown($event, 'ne')" />
            <div class="resize-handle resize-sw" @mousedown.stop="handleResizeMouseDown($event, 'sw')" />
            <div class="resize-handle resize-se" @mousedown.stop="handleResizeMouseDown($event, 'se')" />
            <div class="resize-handle resize-n"  @mousedown.stop="handleResizeMouseDown($event, 'n')" />
            <div class="resize-handle resize-s"  @mousedown.stop="handleResizeMouseDown($event, 's')" />
            <div class="resize-handle resize-w"  @mousedown.stop="handleResizeMouseDown($event, 'w')" />
            <div class="resize-handle resize-e"  @mousedown.stop="handleResizeMouseDown($event, 'e')" />
          </template>

          <!-- Header -->
          <div
            class="el-modal-header"
            :class="{ 'el-modal-header-plain': plainHeader }"
            @dblclick="handleMaximize"
          >
            <span class="el-modal-title">{{ title }}</span>
            <div class="el-modal-header-actions">
              <slot name="header-action" />
              <button
                v-if="showMaximize"
                class="el-modal-action-btn"
                :title="isMaximized ? '还原窗口' : '最大化窗口'"
                @click.stop="handleMaximize"
              >
                <el-icon :size="18">
                  <FullScreen v-if="!isMaximized" />
                  <Aim v-else />
                </el-icon>
              </button>
              <button
                v-if="showClose"
                class="el-modal-action-btn"
                title="关闭"
                @click.stop="handleClose"
              >
                <el-icon :size="20"><Close /></el-icon>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div :class="['el-modal-body', bodyClassName]">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="showFooter" class="el-modal-footer">
            <slot name="footer">
              <el-button :size="buttonSize" @click="handleCancel">{{ cancelText }}</el-button>
              <el-button
                v-if="showSubmit"
                :size="buttonSize"
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit"
              >
                {{ submitLoading ? submitLoadingText : submitText }}
              </el-button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { Close, FullScreen, Aim } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: [String, Number], default: undefined },
  height: { type: [String, Number], default: undefined },
  size: { type: String, default: 'md', validator: (v) => ['sm','md','lg','xl','xxl','xxxl','full'].includes(v) },
  closeOnClickModal: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  showSubmit: { type: Boolean, default: true },
  showMaximize: { type: Boolean, default: true },
  enableDrag: { type: Boolean, default: true },
  enableResize: { type: Boolean, default: true },
  submitText: { type: String, default: '保存' },
  cancelText: { type: String, default: '取消' },
  submitLoading: { type: Boolean, default: false },
  submitLoadingText: { type: String, default: '保存中...' },
  destroyOnClose: { type: Boolean, default: false },
  bodyClassName: { type: String, default: '' },
  buttonSize: { type: String, default: 'default' },
  plainHeader: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close', 'submit', 'cancel'])

// V1.1 Modal sizeDefaults (width × height, px)
const sizeMap = {
  sm:   { width: 400,  height: 300 },
  md:   { width: 500,  height: 400 },
  lg:   { width: 700,  height: 500 },
  xl:   { width: 900,  height: 600 },
  xxl:  { width: 1080, height: 650 },
  xxxl: { width: 1350, height: 700 }
}

const BOUNDARY_PADDING = 30

const visible = computed(() => props.modelValue)

// === 状态 ===
const modalRef = ref(null)
const isMaximized = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)

const position = ref({ x: 0, y: 0 })
const modalSize = ref({ width: 0, height: 0 })

let resizeDir = ''
let dragOffset = { x: 0, y: 0 }
let initialSize = { width: 0, height: 0 }
let initialMouse = { x: 0, y: 0 }
let initialPosition = { x: 0, y: 0 }
let rafId = null

// 初始尺寸
function getDefaultSize() {
  if (props.width && props.height) {
    return {
      width: typeof props.width === 'number' ? props.width : parseInt(props.width),
      height: typeof props.height === 'number' ? props.height : parseInt(props.height)
    }
  }
  return sizeMap[props.size] || sizeMap.md
}

function resetState() {
  isMaximized.value = false
  isDragging.value = false
  isResizing.value = false
  modalSize.value = getDefaultSize()
  nextTick(() => centerModal())
}

function centerModal() {
  if (isMaximized.value) return
  const w = modalSize.value.width
  const h = modalSize.value.height
  position.value = {
    x: Math.max(BOUNDARY_PADDING, (window.innerWidth - w) / 2),
    y: Math.max(BOUNDARY_PADDING, (window.innerHeight - h) / 2)
  }
}

// === 容器样式 ===
const containerStyle = computed(() => {
  if (isMaximized.value) {
    return {
      left: '16px',
      top: '16px',
      width: 'calc(100vw - 32px)',
      height: 'calc(100vh - 32px)'
    }
  }
  return {
    left: position.value.x + 'px',
    top: position.value.y + 'px',
    width: modalSize.value.width + 'px',
    height: modalSize.value.height + 'px'
  }
})

// === 拖拽 ===
function handleContainerMouseDown(e) {
  // 阻止 resize 触发
  if (isResizing.value) return
  if (!props.enableDrag || isMaximized.value) return
  // 只允许在 header 区域触发拖拽
  if (!e.target.closest('.el-modal-header')) return
  if (e.target.closest('.el-modal-action-btn')) return
  if (e.target.closest('button')) return

  isDragging.value = true
  dragOffset.x = e.clientX - position.value.x
  dragOffset.y = e.clientY - position.value.y

  document.addEventListener('mousemove', handleDragMouseMove)
  document.addEventListener('mouseup', handleDragMouseUp)
  e.preventDefault()
}

function handleDragMouseMove(e) {
  if (!isDragging.value) return
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const rawX = e.clientX - dragOffset.x
    const rawY = e.clientY - dragOffset.y
    const w = modalSize.value.width
    const h = modalSize.value.height
    const maxX = window.innerWidth - w - BOUNDARY_PADDING
    const maxY = window.innerHeight - 60
    position.value = {
      x: Math.max(BOUNDARY_PADDING, Math.min(rawX, maxX)),
      y: Math.max(BOUNDARY_PADDING, Math.min(rawY, maxY))
    }
  })
}

function handleDragMouseUp() {
  isDragging.value = false
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  document.removeEventListener('mousemove', handleDragMouseMove)
  document.removeEventListener('mouseup', handleDragMouseUp)
}

// === Resize (8 directions) ===
function handleResizeMouseDown(e, dir) {
  isResizing.value = true
  resizeDir = dir
  initialSize = { ...modalSize.value }
  initialMouse = { x: e.clientX, y: e.clientY }
  initialPosition = { ...position.value }

  document.addEventListener('mousemove', handleResizeMouseMove)
  document.addEventListener('mouseup', handleResizeMouseUp)
  e.preventDefault()
}

function handleResizeMouseMove(e) {
  if (!isResizing.value) return
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const deltaX = e.clientX - initialMouse.x
    const deltaY = e.clientY - initialMouse.y
    let newWidth = initialSize.width
    let newHeight = initialSize.height
    let newX = initialPosition.x
    let newY = initialPosition.y

    if (resizeDir.includes('e')) {
      newWidth = Math.max(320, initialSize.width + deltaX)
    }
    if (resizeDir.includes('s')) {
      newHeight = Math.max(200, initialSize.height + deltaY)
    }
    if (resizeDir.includes('w')) {
      newWidth = Math.max(320, initialSize.width - deltaX)
      newX = initialPosition.x + (initialSize.width - newWidth)
    }
    if (resizeDir.includes('n')) {
      newHeight = Math.max(200, initialSize.height - deltaY)
      newY = initialPosition.y + (initialSize.height - newHeight)
    }

    modalSize.value = { width: newWidth, height: newHeight }
    position.value = { x: newX, y: newY }
  })
}

function handleResizeMouseUp() {
  isResizing.value = false
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  document.removeEventListener('mousemove', handleResizeMouseMove)
  document.removeEventListener('mouseup', handleResizeMouseUp)
}

// === 最大化 ===
function handleMaximize() {
  isMaximized.value = !isMaximized.value
}

// === 关闭 ===
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleSubmit() { emit('submit') }
function handleCancel() { emit('cancel'); handleClose() }

function onBackdropClick() {
  if (props.closeOnClickModal) handleClose()
}

function handleEsc(e) {
  if (props.closeOnPressEscape && e.key === 'Escape') handleClose()
}

// === 监听 visible 变化 ===
watch(visible, (val) => {
  if (val) {
    resetState()
    document.addEventListener('keydown', handleEsc)
  } else {
    document.removeEventListener('keydown', handleEsc)
    document.removeEventListener('mousemove', handleDragMouseMove)
    document.removeEventListener('mouseup', handleDragMouseUp)
    document.removeEventListener('mousemove', handleResizeMouseMove)
    document.removeEventListener('mouseup', handleResizeMouseUp)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEsc)
  document.removeEventListener('mousemove', handleDragMouseMove)
  document.removeEventListener('mouseup', handleDragMouseUp)
  document.removeEventListener('mousemove', handleResizeMouseMove)
  document.removeEventListener('mouseup', handleResizeMouseUp)
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* === Modal 容器 === */
.el-modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
}

.el-modal-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.el-modal-container {
  position: absolute;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  overflow: hidden;
  user-select: none;
}

.el-modal-container.is-maximized {
  border-radius: 12px;
}

/* === Header === */
.el-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  flex-shrink: 0;
}

.el-modal-header-plain {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.el-modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.75rem;
}

.el-modal-header-plain .el-modal-title {
  color: #111827;
}

.el-modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.el-modal-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #ffffff;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0;
}

.el-modal-header-plain .el-modal-action-btn {
  color: #6b7280;
}

.el-modal-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.el-modal-header-plain .el-modal-action-btn:hover {
  background-color: #f3f4f6;
}

/* === Body === */
.el-modal-body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  user-select: text;
}

@media (min-width: 640px) {
  .el-modal-body { padding: 1rem 1.5rem; }
}

/* === Footer === */
.el-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;
}

/* === Resize Handles (8 directions) === */
.resize-handle {
  position: absolute;
  z-index: 10;
}

.resize-nw {
  top: 0; left: 0;
  width: 12px; height: 12px;
  cursor: nw-resize;
}
.resize-ne {
  top: 0; right: 0;
  width: 12px; height: 12px;
  cursor: ne-resize;
}
.resize-sw {
  bottom: 0; left: 0;
  width: 12px; height: 12px;
  cursor: sw-resize;
}
.resize-se {
  bottom: 0; right: 0;
  width: 12px; height: 12px;
  cursor: se-resize;
}
.resize-n {
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 24px; height: 6px;
  cursor: n-resize;
}
.resize-s {
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 24px; height: 6px;
  cursor: s-resize;
}
.resize-w {
  top: 50%; left: 0;
  transform: translateY(-50%);
  width: 6px; height: 24px;
  cursor: w-resize;
}
.resize-e {
  top: 50%; right: 0;
  transform: translateY(-50%);
  width: 6px; height: 24px;
  cursor: e-resize;
}

/* 拖拽/调整大小时禁用文本选择 */
:global(.el-modal-container.is-dragging),
:global(.el-modal-container.is-resizing) {
  cursor: move !important;
  user-select: none !important;
}

:global(.el-modal-container.is-resizing) * {
  pointer-events: none;
}

/* === 弹窗内 input/select/textarea 单层轮廓样式 === */
.el-modal-container input,
.el-modal-container select,
.el-modal-container textarea {
  outline: none !important;
}

.el-modal-container input:focus,
.el-modal-container select:focus,
.el-modal-container textarea:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: #10b981 !important;
}

.el-modal-container input:focus-visible,
.el-modal-container select:focus-visible,
.el-modal-container textarea:focus-visible {
  outline: none !important;
}

.el-modal-container input::-ms-clear,
.el-modal-container input::-ms-reveal {
  display: none;
}
</style>
