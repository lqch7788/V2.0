<template>
  <el-tree-select
    v-model="selectedValue"
    :data="options"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :check-strictly="checkStrictly"
    :show-checkbox="checkable"
    :render-after-expand="renderAfterExpand"
    :expand-on-click-node="expandOnClickNode"
    :class="['ui-tree-select', className]"
    @change="handleChange"
    @node-click="handleNodeClick"
    @check="handleCheck"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Array, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  filterable: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  checkable: { type: Boolean, default: false },
  checkStrictly: { type: Boolean, default: false },
  renderAfterExpand: { type: Boolean, default: true },
  expandOnClickNode: { type: Boolean, default: true },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change', 'node-click', 'check'])

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}

const handleNodeClick = (data) => {
  emit('node-click', data)
}

const handleCheck = (data, checked) => {
  emit('check', data, checked)
}
</script>

<style scoped>
/* V1.1 TreeSelect 样式 */
:deep(.el-tree-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #10b981 inset;
}

:deep(.el-tree) {
  background: white;
  font-size: 0.875rem;
}

:deep(.el-tree-node__content:hover) {
  background: #f3f4f6;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #ecfdf5;
  color: #059669;
}

:deep(.el-tree-node.is-checked > .el-tree-node__content) {
  color: #059669;
}
</style>
