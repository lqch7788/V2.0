<template>
  <el-input
    v-model="inputValue"
    type="textarea"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :rows="rows"
    :resize="resize"
    :maxlength="maxlength"
    :show-word-limit="showWordLimit"
    :class="['ui-textarea', className]"
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  },
  resize: {
    type: String,
    default: 'vertical' // none, both, horizontal, vertical
  },
  maxlength: {
    type: [String, Number],
    default: ''
  },
  showWordLimit: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'change', 'focus', 'blur'])

const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleInput = (value) => {
  emit('input', value)
}

const handleChange = (value) => {
  emit('change', value)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
/* V1.1 TextArea 样式 */
:deep(.el-textarea__inner) {
  border-radius: 0.5rem;
  border-color: #d1d5db;
  font-size: 0.875rem;
  padding: 0.625rem 0.75rem;
}

:deep(.el-textarea__inner:hover) {
  border-color: #9ca3af;
}

:deep(.el-textarea__inner:focus) {
  border-color: #10b981;
  box-shadow: 0 0 0 1px #10b981 inset;
}

:deep(.el-textarea__inner::placeholder) {
  color: #9ca3af;
}

:deep(.el-input__count) {
  background: transparent;
  color: #9ca3af;
  font-size: 0.75rem;
}
</style>
