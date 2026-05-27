<template>
  <el-dialog
    :model-value="modelValue"
    :width="computedWidth"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
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
    <template #header>
      <div class="el-modal-header" :class="{ 'el-modal-header-plain': plainHeader }">
        <span class="el-modal-title">{{ title }}</span>
        <div class="el-modal-header-actions">
          <slot name="header-action" />
          <button v-if="showClose" class="el-modal-close-btn" @click="handleClose">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </div>
    </template>

    <div :class="['el-modal-body', bodyClassName]">
      <slot />
    </div>

    <template v-if="showFooter" #footer>
      <div class="el-modal-footer">
        <slot name="footer">
          <el-button :size="buttonSize" @click="handleCancel">{{ cancelText }}</el-button>
          <el-button v-if="showSubmit" :size="buttonSize" type="primary" :loading="submitLoading" @click="handleSubmit">
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
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: [String, Number], default: undefined },
  size: { type: String, default: 'md', validator: (val) => ['sm','md','lg','xl','xxl','xxxl','full'].includes(val) },
  closeOnClickModal: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  showSubmit: { type: Boolean, default: true },
  submitText: { type: String, default: '保存' },
  cancelText: { type: String, default: '取消' },
  submitLoading: { type: Boolean, default: false },
  submitLoadingText: { type: String, default: '保存中...' },
  destroyOnClose: { type: Boolean, default: false },
  appendToBody: { type: Boolean, default: true },
  lockScroll: { type: Boolean, default: true },
  zIndex: { type: Number, default: 2000 },
  bodyClassName: { type: String, default: '' },
  buttonSize: { type: String, default: 'default' },
  alignCenter: { type: Boolean, default: true },
  plainHeader: { type: Boolean, default: false },
  draggable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close', 'submit', 'cancel', 'closed'])

// V1.1 Modal sizeDefaults（px）
const sizeMap = { sm: 400, md: 500, lg: 700, xl: 900, xxl: 1080, xxxl: 1350, full: '100%' }

const computedWidth = computed(() => {
  if (props.width !== undefined) return props.width
  return sizeMap[props.size] || 560
})

function handleClose() { emit('update:modelValue', false); emit('close') }
function handleClosed() { emit('closed') }
function handleSubmit() { emit('submit') }
function handleCancel() { emit('cancel'); handleClose() }
</script>

<style scoped>
/* V1.1 Modal 风格头部: emerald 渐变 */
.el-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  flex-shrink: 0;
  margin: -3px -6px 0 -6px;
  width: calc(100% + 12px);
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

.el-modal-close-btn {
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
}

.el-modal-header-plain .el-modal-close-btn {
  color: #6b7280;
}

.el-modal-close-btn:hover {
  background-color: rgba(255,255,255,0.2);
}

.el-modal-header-plain .el-modal-close-btn:hover {
  background-color: #f3f4f6;
}

/* Body: py-4 px-4 sm:px-6 */
.el-modal-body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .el-modal-body { padding: 1rem 1.5rem; }
}

/* Footer: flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 */
.el-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

/* Override el-dialog header/footer/body padding */
:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  margin: 0 auto !important;
}

:deep(.el-dialog__header) { margin: 0 !important; padding: 0 !important; display: block !important; overflow: visible !important; }
:deep(.el-dialog__body)   { padding: 0 !important; flex: 1; overflow-y: auto; }
:deep(.el-dialog__footer) { padding: 0 !important; background-color: #f9fafb !important; }
</style>
