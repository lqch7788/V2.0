<template>
  <el-drawer
    :model-value="modelValue"
    :title="title"
    :size="computedSize"
    :direction="direction"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    :z-index="zIndex"
    class="el-drawer-wrapper"
    @close="handleClose"
  >
    <!-- 内容区 -->
    <div class="drawer-body">
      <slot />
    </div>

    <!-- Footer -->
    <template v-if="showFooter" #footer>
      <div class="drawer-footer-inner">
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
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 是否显示 */
  modelValue: { type: Boolean, default: false },
  /** 标题 */
  title: { type: String, default: '' },
  /** 自定义尺寸（默认 448px，与 V1.1 Drawer max-w-md 一致） */
  size: { type: [String, Number], default: undefined },
  /** 弹出方向：rtl=右侧，ltr=左侧，ttb=顶部，btt=底部 */
  direction: { type: String, default: 'rtl' },
  /** 点击遮罩是否关闭 */
  closeOnClickModal: { type: Boolean, default: true },
  /** 是否显示底部 */
  showFooter: { type: Boolean, default: true },
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
  /** 层级 */
  zIndex: { type: Number, default: 2000 },
  /** 按钮尺寸 */
  buttonSize: { type: String, default: 'default' }
})

const emit = defineEmits(['update:modelValue', 'close', 'submit', 'cancel'])

const computedSize = computed(() => {
  if (props.size !== undefined) return props.size
  return '448px'
})

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
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
/* ==================== 与 V1.1 Drawer.tsx 完全一致 ==================== */

/* 覆盖 Element Plus 默认 header */
.el-drawer-wrapper :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 1.5rem 1.5rem 0; /* p-6 pb-0 */
  border-bottom: none;
}

.el-drawer-wrapper :deep(.el-drawer__header span) {
  font-size: 1.125rem; /* text-lg */
  font-weight: 600;    /* font-semibold */
  color: #111827;      /* text-gray-900 */
}

/* 覆盖 Element Plus 默认 body / footer padding */
.el-drawer-wrapper :deep(.el-drawer__body) {
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.el-drawer-wrapper :deep(.el-drawer__footer) {
  padding: 0;
  border-top: none;
}

/* 自定义内容区：与 V1.1 DrawerContent p-6 一致 */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem; /* p-6 */
}

/* 自定义 Footer：与 V1.1 DrawerFooter 完全一致 */
.drawer-footer-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem; /* gap-3 */
  padding: 1rem 1.5rem 1.5rem 1.5rem; /* p-6 pt-4 */
  border-top: 1px solid #f3f4f6; /* border-gray-100 */
}

/* 按钮样式 */
.el-drawer-wrapper :deep(.el-button) {
  border-radius: 0.5rem;
  font-weight: 500;
}

.el-drawer-wrapper :deep(.el-button--primary) {
  background-color: #059669;
  border-color: #059669;
}

.el-drawer-wrapper :deep(.el-button--primary:hover) {
  background-color: #047857;
  border-color: #047857;
}
</style>
