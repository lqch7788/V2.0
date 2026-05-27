<template>
  <el-input
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :show-password="showPassword"
    :prefix-icon="prefixIcon"
    :suffix-icon="suffixIcon"
    :size="size"
    :class="className"
    @input="handleInput"
    @change="handleChange"
  />
</template>

<script setup>
import { ElInput } from 'element-plus'

const props = defineProps({
  modelValue: { default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  showPassword: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  className: { type: String, default: '' },
  prefixIcon: Object,
  suffixIcon: Object
})

const emit = defineEmits(['update:modelValue', 'input', 'change'])

const handleInput = (value) => { emit('update:modelValue', value); emit('input', value) }
const handleChange = (value) => emit('change', value)
</script>
