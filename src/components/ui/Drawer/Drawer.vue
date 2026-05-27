<template>
  <el-drawer
    :model-value="modelValue"
    :title="title"
    :direction="direction"
    :size="size"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :class="className"
    @close="handleClose"
  >
    <slot />
  </el-drawer>
</template>

<script setup>
import { ElDrawer } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  direction: { type: String, default: 'rtl' },
  size: { type: [String, Number], default: '30%' },
  closeOnClickModal: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'close'])

const handleClose = () => { emit('update:modelValue', false); emit('close') }
</script>
