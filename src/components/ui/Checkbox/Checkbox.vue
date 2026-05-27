<template>
  <el-checkbox
    :model-value="modelValue"
    :disabled="disabled"
    :label="label"
    :class="className"
    @change="handleChange"
  >
    <slot />
  </el-checkbox>
</template>

<script setup>
import { ElCheckbox } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>
