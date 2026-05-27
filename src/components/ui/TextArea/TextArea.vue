<template>
  <el-input
    :model-value="modelValue"
    type="textarea"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :rows="rows"
    :maxlength="maxLength"
    :show-word-limit="showWordLimit"
    :resize="resize"
    :class="className"
    @input="handleInput"
    @change="handleChange"
  />
</template>

<script setup>
import { ElInput } from 'element-plus'

const props = defineProps({
  modelValue: { default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  maxLength: { type: Number, default: undefined },
  showWordLimit: { type: Boolean, default: false },
  resize: { type: String, default: 'vertical' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'input', 'change'])

const handleInput = (value) => { emit('update:modelValue', value); emit('input', value) }
const handleChange = (value) => emit('change', value)
</script>

<style scoped>
:deep(.el-textarea__inner) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #9ca3af inset;
  font-size: 0.875rem;
  padding: 8px 12px;
  color: #374151;
  transition: box-shadow 0.15s ease;
}
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #10b981 inset;
}
:deep(.el-textarea__inner::placeholder) { color: #9ca3af; }
</style>
