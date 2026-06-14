<template>
  <ElModal
    :model-value="modelValue"
    :title="title"
    :width="width"
    :height="height"
    :size="size"
    :show-footer="showFooter"
    :show-submit="showSubmit"
    :show-close="showClose"
    :show-maximize="showMaximize"
    :enable-drag="enableDrag"
    :enable-resize="enableResize"
    :submit-text="submitText"
    :cancel-text="cancelText"
    :submit-loading="submitLoading"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :plain-header="plainHeader"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
    @submit="$emit('submit')"
    @cancel="$emit('cancel')"
  >
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
    <template v-if="$slots['header-action']" #header-action>
      <slot name="header-action" />
    </template>
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
  </ElModal>
</template>

<script setup>
import ElModal from '../ElModal.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: [String, Number], default: undefined },
  height: { type: [String, Number], default: undefined },
  size: { type: String, default: 'md' },
  showFooter: { type: Boolean, default: true },
  showSubmit: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  showMaximize: { type: Boolean, default: true },
  enableDrag: { type: Boolean, default: true },
  enableResize: { type: Boolean, default: true },
  submitText: { type: String, default: '保存' },
  cancelText: { type: String, default: '取消' },
  submitLoading: { type: Boolean, default: false },
  closeOnClickModal: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  plainHeader: { type: Boolean, default: false }
})

defineEmits(['update:modelValue', 'close', 'submit', 'cancel'])
</script>
