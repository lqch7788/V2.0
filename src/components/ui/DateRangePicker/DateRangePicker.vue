<template>
  <el-date-picker
    v-model="dateRange"
    type="daterange"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :disabled="disabled"
    :clearable="clearable"
    :format="format"
    :value-format="valueFormat"
    :default-time="defaultTime"
    :class="['ui-date-range-picker', className]"
    @change="handleChange"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  startPlaceholder: { type: String, default: '开始日期' },
  endPlaceholder: { type: String, default: '结束日期' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  format: { type: String, default: 'YYYY-MM-DD' },
  valueFormat: { type: String, default: 'YYYY-MM-DD' },
  defaultTime: { type: Array, default: () => [] },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const dateRange = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}
</script>

<style scoped>
/* V1.1 DateRangePicker 样式 */
:deep(.el-date-editor) {
  border-radius: 0.5rem;
}

:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-date-editor .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #9ca3af inset;
}

:deep(.el-date-editor.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #10b981 inset;
}

:deep(.el-range-separator) {
  color: #9ca3af;
}
</style>
