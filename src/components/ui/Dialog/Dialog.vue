<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :class="['ui-dialog', className]"
    @close="handleClose"
  >
    <slot />
    <template #footer v-if="$slots.footer || showFooter">
      <slot name="footer">
        <div class="dialog-footer">
          <el-button @click="handleCancel">{{ cancelText }}</el-button>
          <el-button v-if="showOk" type="primary" @click="handleOk">{{ okText }}</el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElDialog } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '50%'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showOk: {
    type: Boolean,
    default: true
  },
  okText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  className: {
    type: String,
    default: ''
  },
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'close', 'ok', 'cancel'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => emit('close')
const handleOk = () => emit('ok')
const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}
</script>

<style scoped>
/* V1.1 Dialog 样式 */
:deep(.el-dialog) {
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

:deep(.el-dialog__header) {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-right: 0;
}

:deep(.el-dialog__title) {
  font-size: 1.125rem;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 1.5rem;
}

:deep(.el-dialog__footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
