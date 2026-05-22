<template>
  <Dialog
    v-model="visible"
    :title="title"
    :width="width"
    :height="height"
    :min-width="minWidth"
    :min-height="minHeight"
    :enable-drag="enableDrag"
    :enable-resize="enableResize"
    :show-maximize="showMaximize"
    :show-footer="showFooter"
    :ok-text="okText"
    :cancel-text="cancelText"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @ok="handleOk"
    @close="handleClose"
  >
    <slot />
    <template #footer>
      <slot name="footer">
        <div class="modal-footer-content">
          <slot name="pre-footer" />
          <el-button @click="handleCancel">{{ cancelText }}</el-button>
          <el-button v-if="showOk" type="primary" :loading="submitting" @click="handleOk">
            {{ okText }}
          </el-button>
        </div>
      </slot>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import Dialog from '@/components/ui/Dialog/Dialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '500px' },
  height: { type: String, default: '400px' },
  minWidth: { type: Number, default: 300 },
  minHeight: { type: Number, default: 200 },
  enableDrag: { type: Boolean, default: true },
  enableResize: { type: Boolean, default: true },
  showMaximize: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  showOk: { type: Boolean, default: true },
  okText: { type: String, default: '保存' },
  cancelText: { type: String, default: '取消' },
  submitting: { type: Boolean, default: false },
  closeOnClickModal: { type: Boolean, default: false },
  closeOnPressEscape: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:modelValue',
  'ok',
  'cancel',
  'close'
])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleOk = () => emit('ok')
const handleCancel = () => emit('cancel')
const handleClose = () => emit('close')
</script>

<style scoped>
.modal-footer-content {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
