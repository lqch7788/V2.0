<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
        @click="handleMaskClick"
      >
        <div
          class="bg-white rounded-xl w-full shadow-xl flex flex-col relative"
          :class="[isMaximized ? '' : 'transition-shadow']"
          :style="dialogStyle"
          @click.stop
        >
          <!-- 右下角缩放拖动条（仅 enableResize=true 且未最大化时显示） -->
          <div
            v-if="enableResize && !isMaximized"
            class="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-10"
            @mousedown="handleResizeStart"
          >
            <svg class="w-full h-full text-gray-300 hover:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
            </svg>
          </div>

          <!-- 头部（渐变 + 标题 + 可选最大化/关闭） -->
          <div
            class="px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-between rounded-t-xl flex-shrink-0 select-none"
            :class="[enableDrag ? 'cursor-move' : 'cursor-default']"
            @mousedown="handleDragStart"
          >
            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
              <slot name="header">{{ title }}</slot>
            </h3>
            <div class="flex items-center gap-1">
              <el-button
                v-if="showMaximize"
                link
                @click="toggleMaximize"
                class="hover:bg-white/10"
                style="color: rgba(255,255,255,0.8);"
              >
                <el-icon v-if="isMaximized" style="color: white;"><ScaleToOriginal /></el-icon>
                <el-icon v-else style="color: white;"><FullScreen /></el-icon>
              </el-button>
              <el-button
                v-if="showCloseButton"
                link
                class="hover:bg-white/10"
                style="color: rgba(255,255,255,0.8);"
                @click="handleClose"
              >
                <el-icon style="color: white;"><Close /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 中间滚动内容区（slot body） -->
          <div class="flex-1 overflow-y-auto" :style="bodyStyle">
            <slot></slot>
          </div>

          <!-- 底部按钮区（slot footer，可选） -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
// 第二阶段 Y3 重构：抽取 BaseModal 统一弹窗外壳
// 1:1 保留 V1.1 CreatePlanModal.tsx 行为（拖拽/最大化/缩放/关闭/ESC/蒙层点击）
// 1:1 保留 V1.1 Modal.tsx 视觉（emerald 渐变 header）
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'

interface Props {
  // 双向绑定显示状态
  visible: boolean
  // 标题（不传 header slot 时生效）
  title?: string
  // 尺寸
  width?: number | string
  height?: number | string
  // 是否点击蒙层关闭
  maskClosable?: boolean
  // 是否按 ESC 关闭
  escClosable?: boolean
  // 是否显示右上角关闭按钮
  showCloseButton?: boolean
  // 是否显示最大化按钮
  showMaximize?: boolean
  // 是否启用拖拽（拖动 header 移动弹窗）
  enableDrag?: boolean
  // 是否启用缩放（右下角拖动改尺寸）
  enableResize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: 800,
  height: 'auto',
  maskClosable: true,
  escClosable: true,
  showCloseButton: true,
  showMaximize: false,
  enableDrag: false,
  enableResize: false,
})

const emit = defineEmits<{
  'update:visible': [val: boolean]
  'close': []
}>()

// ========== 弹窗状态 ==========
const isMaximized = ref(false)
const dialogPosition = ref({ x: 0, y: 0 })
const dialogSize = ref({ width: 0, height: 0 })

// 初始化尺寸
watch(
  () => props.visible,
  (val) => {
    if (val) {
      isMaximized.value = false
      dialogPosition.value = { x: 0, y: 0 }
      dialogSize.value = {
        width: typeof props.width === 'number' ? props.width : parseInt(String(props.width)) || 800,
        height: typeof props.height === 'number' ? props.height : parseInt(String(props.height)) || 0,
      }
    }
  }
)

const dialogStyle = computed(() => {
  if (isMaximized.value) {
    return {
      position: 'fixed' as const,
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      borderRadius: '0',
      zIndex: 100,
    }
  }
  const hasPosition = dialogPosition.value.x || dialogPosition.value.y
  return {
    position: 'fixed' as const,
    top: hasPosition ? `${dialogPosition.value.y}px` : '50%',
    left: hasPosition ? `${dialogPosition.value.x}px` : '50%',
    transform: hasPosition ? 'none' : 'translate(-50%, -50%)',
    width: `${dialogSize.value.width}px`,
    height: dialogSize.value.height > 0 ? `${dialogSize.value.height}px` : 'auto',
    maxWidth: '90vw',
    maxHeight: '90vh',
    minWidth: '40rem',
  }
})

const bodyStyle = computed(() => {
  // 固定高度时限制 max-height 避免溢出
  if (dialogSize.value.height > 0 && !isMaximized.value) {
    return { maxHeight: 'calc(85vh - 140px)' }
  }
  return {}
})

// ========== 拖动处理（V1.1 Modal enableDrag） ==========
let isDragging = false
let dragOffset = { x: 0, y: 0 }

const handleDragStart = (e: MouseEvent) => {
  if (!props.enableDrag || isMaximized.value) return
  isDragging = true
  const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect()
  if (rect) {
    dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  } else {
    dragOffset = { x: 0, y: 0 }
  }
  e.preventDefault()
}

const onDragMove = (e: MouseEvent) => {
  if (!isDragging || isMaximized.value) return
  const newX = e.clientX - dragOffset.x
  const newY = e.clientY - dragOffset.y
  const maxX = window.innerWidth - 100
  const maxY = window.innerHeight - 50
  dialogPosition.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY)),
  }
}

const onDragEnd = () => {
  isDragging = false
}

// ========== 缩放处理（V1.1 Modal enableResize） ==========
let isResizing = false
let resizeStart = { x: 0, y: 0, width: 0, height: 0 }

const handleResizeStart = (e: MouseEvent) => {
  if (!props.enableResize || isMaximized.value) return
  e.preventDefault()
  isResizing = true
  resizeStart = {
    x: e.clientX,
    y: e.clientY,
    width: dialogSize.value.width,
    height: dialogSize.value.height || 600,
  }
}

const onResizeMove = (e: MouseEvent) => {
  if (!isResizing) return
  const dx = e.clientX - resizeStart.x
  const dy = e.clientY - resizeStart.y
  dialogSize.value = {
    width: Math.max(640, resizeStart.width + dx),
    height: Math.max(400, resizeStart.height + dy),
  }
}

const onResizeEnd = () => {
  isResizing = false
}

// ========== 最大化（V1.1 Modal showMaximize） ==========
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

// ========== 关闭（点击遮罩 + 关闭按钮 + ESC） ==========
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleMaskClick = () => {
  if (props.maskClosable) handleClose()
}

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible && props.escClosable) {
    handleClose()
  }
}

// 拖动/缩放/ESC 事件
onMounted(() => {
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
  document.removeEventListener('keydown', handleEsc)
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

</invoke>