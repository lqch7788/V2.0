<template>
  <el-select
    v-model="selectValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :class="['ui-select', className]"
    @change="handleChange"
  >
    <slot />
  </el-select>
</template>

<script setup>
import { ElSelect } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  filterable: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  collapseTags: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  modelValue: [String, Number, Array]
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleChange = (value) => {
  emit('change', value)
}
</script>

<style scoped>
/* V1.1 Select Trigger 样式 */
:deep(.el-select .el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #9ca3af inset;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 1px #10b981 inset;
}

/* V1.1 Select Dropdown 样式 */
:deep(.el-select-dropdown) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
}

:deep(.el-select-dropdown__item) {
  border-radius: 0.375rem;
}

:deep(.el-select-dropdown__item.is-selected) {
  color: #10b981;
  font-weight: 500;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: #eff6ff;
  color: #1d4ed8;
}
</style>
