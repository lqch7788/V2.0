<template>
  <el-input
    v-model="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :show-password="showPassword"
    :prefix-icon="prefixIcon"
    :suffix-icon="suffixIcon"
    :class="['ui-input', className]"
    @input="handleInput"
    @change="handleChange"
  />
</template>

<script setup>
import { ElInput } from 'element-plus'

const props = defineProps({"modelValue":"''","type":"'text'","placeholder":"''","disabled":"false","readonly":"false","clearable":"false","showPassword":"false","className":"''"})

const emit = defineEmits(['update'])

const handleInput = (value) => {
  emit('update:modelValue', value)
  emit('input', value)
}

const handleChange = (value) => {
  emit('change', value)
}
</script>

<style scoped>
/* V1.1 Input 样式: rounded-lg, border-gray-400, focus:emerald-500 */
:deep(.el-input__wrapper) {
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 0 0 1px #9ca3af inset; /* border-gray-400 */
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 1px #10b981 inset; /* emerald-500 */
}

:deep(.el-input__inner) {
  font-size: 0.875rem; /* text-sm */
}

:deep(.el-input__inner::placeholder) {
  color: #9ca3af; /* placeholder:text-gray-400 */
}
</style>
