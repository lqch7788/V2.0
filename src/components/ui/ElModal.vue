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
          <!--
            ✅ 修复: 兼容自定义 #header 插槽
            - 旧实现：硬编码 <div class="el-modal-header"> 包裹 title + actions
            - 修复后：用 v-if 优先使用消费者传入的 #header 插槽，否则降级到默认 header
            - 影响：BatchEditModal 等多个 1:1 翻译自 V1.1 的弹窗可以正常使用 #header 插槽放关闭按钮
          -->
          <template v-if="$slots.header">
            <div
              class="el-modal-header"
              :class="{ 'el-modal-header-plain': plainHeader }"
              @dblclick="handleMaximize"
            >
              <slot name="header" />
            </div>
          </template>
          <div
            v-else
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
const dragOffset = { x: 0, y: 0 }
let initialSize = { width: 0, height: 0 }
let initialMouse = { x: 0, y: 0 }
let initialPosition = { x: 0, y: 0 }
let rafId = null

// 初始尺寸
// 修复 P0-XXX: 支持 CSS 字符串值（如 'calc(100vh - 32px)' / '720px' / '80vh'）
// 之前 parseInt('calc(...)') 返回 NaN，导致 modalSize.height 失效、容器无高度限制、
// 弹窗内容超出视口、底部按钮无法看到也无法点击
function getDefaultSize() {
  if (props.width && props.height) {
    return {
      width: props.width,
      height: props.height
    }
  }
  return sizeMap[props.size] || sizeMap.md
}

// 判断是否为 CSS 字符串（含非数字字符如 calc/vh/%/px）
function isCssSizeString(val) {
  if (typeof val !== 'string') return false
  return /[a-z%]/.test(val)
}

// 解析居中用的像素值（CSS 字符串无法精确解析，使用默认尺寸估算）
function parseSizeForCentering(val, defaultVal) {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    if (val.endsWith('px')) {
      const n = parseInt(val)
      return isNaN(n) ? defaultVal : n
    }
    // calc/vh/% 等 CSS 值，使用默认尺寸
    return defaultVal
  }
  return defaultVal
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
  // 修复 P0-XXX: CSS 字符串高度（如 calc(100vh - 32px)）无法精确解析，
  // 必须等 modal 真正渲染后用实际 offsetHeight 来计算居中位置
  const defaultSize = sizeMap[props.size] || sizeMap.md
  const targetW = parseSizeForCentering(modalSize.value.width, defaultSize.width)
  // 用实际渲染高度（max-height 限制下可能小于传入的 CSS 字符串）
  const actualH = modalRef.value?.offsetHeight || parseSizeForCentering(modalSize.value.height, defaultSize.height)
  position.value = {
    x: Math.max(BOUNDARY_PADDING, (window.innerWidth - targetW) / 2),
    y: Math.max(BOUNDARY_PADDING, (window.innerHeight - actualH) / 2)
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
  // 修复 P0-XXX:
  // - 数字值 → 精确 height/width（用 px）
  // - CSS 字符串值（calc/vh/%/px） → 用作 max-height/max-width（让弹窗可缩放，footer 始终在视口内）
  const formatSize = (val, isMax = false) => {
    if (isCssSizeString(val)) {
      return isMax ? { max: val } : { exact: val }
    }
    return isMax ? { max: val + 'px' } : { exact: val + 'px' }
  }
  const w = formatSize(modalSize.value.width, false)
  const h = formatSize(modalSize.value.height, false)
  const maxW = formatSize(modalSize.value.width, true)
  const maxH = formatSize(modalSize.value.height, true)
  return {
    left: position.value.x + 'px',
    top: position.value.y + 'px',
    width: w.exact,
    height: h.exact,
    maxWidth: maxW.max,
    maxHeight: maxH.max
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
  // 修复 P0-XXX: CSS 字符串 size 无法参与 resize 计算，退回默认尺寸
  const defaultSize = sizeMap[props.size] || sizeMap.md
  initialSize = {
    width: parseSizeForCentering(modalSize.value.width, defaultSize.width),
    height: parseSizeForCentering(modalSize.value.height, defaultSize.height)
  }
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
  /* 修复 P0-1: z-index 改为 2000（与 Element Plus 原生 el-modal 一致）。
   * 原因：原 9999 会强制覆盖 modal 内部 el-select/date-picker/cascader/autocomplete 等
   * popper 浮层（默认 z-index 2000+），导致下拉/日期面板被弹窗容器遮挡无法交互。
   * 改 2000 后，popper 在 DOM 树 body 末尾（晚于 modal wrapper），
   * 同 z-index 层级下后渲染者覆盖前渲染者，popper 自然浮在 modal 之上。
   * v-loading mask 也是 2000+ → modal 与 mask 在同一 stacking context，由 DOM 顺序决定 */
  z-index: 2000 !important;
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
  /* 修复 P0-XXX: 弹窗最大高度不超视口，避免内容过长时 footer 被推到视口外 */
  max-height: calc(100vh - 32px);
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
