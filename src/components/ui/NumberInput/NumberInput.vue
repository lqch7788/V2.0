<template>
  <el-input-number
    v-model="inputValue"
    :min="min"
    :max="max"
    :step="step"
    :precision="precision"
    :disabled="disabled"
    :controls="controls"
    :controls-position="controlsPosition"
    :placeholder="placeholder"
    :class="['ui-number-input', className]"
    @change="handleChange"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: -Infinity },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  precision: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  controls: { type: Boolean, default: true },
  controlsPosition: { type: String, default: 'right' }, // right, left
  placeholder: { type: String, default: '' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}
</script>

<style scoped>
/* V1.1 NumberInput 样式 */
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #9ca3af inset;
}

:deep(.el-input-number .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #10b981 inset;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: #f9fafb;
  border-radius: 0.25rem;
  color: #6b7280;
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #059669;
}
</style>
