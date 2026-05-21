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
    @focus="handleFocus"
    @blur="handleBlur"
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

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
.ui-input {
  /* 可自定义样式 */
}
</style>
