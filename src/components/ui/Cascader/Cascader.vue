<template>
  <el-cascader
    v-model="selectedValue"
    :options="options"
    :props="cascaderProps"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :collapse-tags="collapseTags"
    :class="['ui-cascader', className]"
    @change="handleChange"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [Array, String], default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  filterable: { type: Boolean, default: false },
  collapseTags: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  checkStrictly: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const cascaderProps = computed(() => ({
  multiple: props.multiple,
  checkStrictly: props.checkStrictly,
  emitPath: true,
  expandTrigger: 'hover'
}))

const handleChange = (val) => {
  emit('change', val)
}
</script>

<style scoped>
/* V1.1 Cascader 样式 */
:deep(.el-cascader .el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-cascader .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #10b981 inset;
}

:deep(.el-cascader-node__label) {
  font-size: 0.875rem;
}

:deep(.el-cascader-node.in-active-path),
:deep(.el-cascader-node.is-selectable.in-checked-path) {
  color: #059669;
  font-weight: 500;
}
</style>
