<template>
  <el-dialog
    :model-value="modelValue"
    :width="computedWidth"
    :close-on-click-modal="closeOnClickModal"
    :show-close="false"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :z-index="zIndex"
    :align-center="alignCenter"
    :draggable="draggable"
    class="el-modal-wrapper"
    :class="{ 'plain-header': plainHeader }"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!-- 自定义标题栏 -->
    <template #header>
      <div class="modal-header-inner">
        <span class="modal-title">{{ title }}</span>
        <div class="modal-header-actions">
          <slot name="header-action" />
          <button
            v-if="showClose"
            class="modal-close-btn"
            @click="handleClose"
          >
            <el-icon :size="20">
              <Close />
            </el-icon>
          </button>
        </div>
      </div>
    </template>

    <!-- 内容区 -->
    <div :class="['modal-body', bodyClassName]">
      <slot />
    </div>

    <!-- Footer -->
    <template v-if="showFooter" #footer>
      <div class="modal-footer-inner">
        <slot name="footer">
          <el-button :size="buttonSize" @click="handleCancel">
            {{ cancelText }}
          </el-button>
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
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  /** 是否显示 */
  modelValue: { type: Boolean, default: false },
  /** 标题 */
  title: { type: String, default: '' },
  /** 自定义宽度（优先级高于 size） */
  width: { type: [String, Number], default: undefined },
  /** 预设尺寸 */
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'full'].includes(val)
  },
  /** 点击遮罩是否关闭 */
  closeOnClickModal: { type: Boolean, default: true },
  /** 是否显示底部 */
  showFooter: { type: Boolean, default: true },
  /** 是否显示关闭按钮 */
  showClose: { type: Boolean, default: true },
  /** 是否显示提交按钮 */
  showSubmit: { type: Boolean, default: true },
  /** 提交按钮文字 */
  submitText: { type: String, default: '保存' },
  /** 取消按钮文字 */
  cancelText: { type: String, default: '取消' },
  /** 提交加载状态 */
  submitLoading: { type: Boolean, default: false },
  /** 提交加载文字 */
  submitLoadingText: { type: String, default: '保存中...' },
  /** 关闭时销毁 */
  destroyOnClose: { type: Boolean, default: false },
  /** 插入到 body */
  appendToBody: { type: Boolean, default: true },
  /** 锁定滚动 */
  lockScroll: { type: Boolean, default: true },
  /** 层级 */
  zIndex: { type: Number, default: 2000 },
  /** 内容区自定义类名 */
  bodyClassName: { type: String, default: '' },
  /** 按钮尺寸 */
  buttonSize: { type: String, default: 'default' },
  /** 是否垂直居中 */
  alignCenter: { type: Boolean, default: true },
  /** 是否使用白色简洁头部（详情弹窗等） */
  plainHeader: { type: Boolean, default: false },
  /** 是否可拖拽 */
  draggable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close', 'submit', 'cancel', 'closed'])

/** 尺寸映射（与 V1.1 Modal sizeDefaults 一致） */
const sizeMap = {
  sm: 400,
  md: 500,
  lg: 700,
  xl: 900,
  xxl: 1080,
  xxxl: 1350,
  full: '100%'
}

const computedWidth = computed(() => {
  if (props.width !== undefined) return props.width
  return sizeMap[props.size] || 560
})

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleClosed() {
  emit('closed')
}

function handleSubmit() {
  emit('submit')
}

function handleCancel() {
  emit('cancel')
  handleClose()
}
</script>

<style scoped>
/* ==================== 与 V1.1 Modal.tsx 完全一致 ==================== */

/* Dialog 外层容器 */
.el-modal-wrapper :deep(.el-dialog) {
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1); /* shadow-xl */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: 0 auto !important;
}

/* 隐藏 Element Plus 默认 header / body / footer 的 padding */
.el-modal-wrapper :deep(.el-dialog__header) {
  margin: 0 !important;
  padding: 0 !important;
  border-bottom: none;
  background: transparent !important;
  display: block !important;
  overflow: visible !important;
}

.el-modal-wrapper :deep(.el-dialog__body) {
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.el-modal-wrapper :deep(.el-dialog__footer) {
  padding: 0 !important;
  border-top: none;
  background-color: #f9fafb !important;
}

/* 自定义标题栏：完全覆盖弹窗顶部宽度 */
.modal-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  flex-shrink: 0;
  margin: -3px -6px 0 -6px;
  width: calc(100% + 12px);
  box-sizing: border-box;
}

/* 白色简洁头部模式 */
.plain-header :deep(.el-dialog__header) {
  background: transparent !important;
}
.plain-header .modal-header-inner {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
}

.plain-header .modal-title {
  color: #111827; /* text-gray-900 */
  font-weight: 700; /* font-bold */
}

.plain-header .modal-close-btn {
  color: #6b7280; /* text-gray-500 */
}

.plain-header .modal-close-btn:hover {
  background-color: #f3f4f6; /* hover:bg-gray-100 */
}

.modal-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 600;    /* font-semibold */
  color: #ffffff;
  line-height: 1.75rem;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  color: #ffffff;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-close-btn:hover {
  background-color: #10b981; /* hover:bg-emerald-500 */
}

/* 内容区：与 V1.1 body 完全一致 */
.modal-body {
  padding: 1rem 1rem; /* px-4 py-4 */
  flex: 1;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .modal-body {
    padding-left: 1.5rem; /* sm:px-6 */
    padding-right: 1.5rem;
  }
}

/* Footer：与 V1.1 footer 完全一致 */
.modal-footer-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem; /* gap-3 */
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb; /* border-gray-200 */
  background-color: #f9fafb;
  flex-shrink: 0;
}

/* 按钮样式：圆角与 V1.1 Button 一致 */
.el-modal-wrapper :deep(.el-button) {
  border-radius: 0.5rem;
  font-weight: 500;
}

.el-modal-wrapper :deep(.el-button--primary) {
  background-color: #059669;
  border-color: #059669;
}

.el-modal-wrapper :deep(.el-button--primary:hover) {
  background-color: #047857;
  border-color: #047857;
}
</style>
