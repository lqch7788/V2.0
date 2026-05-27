<template>
  <el-input-number
    v-model="currentValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :placeholder="placeholder"
    :precision="precision"
    :size="size"
    :class="className"
    :controls="controls"
    @change="handleChange"
  />
</template>

<script setup>
import { computed } from 'vue'
import { ElInputNumber } from 'element-plus'

const props = defineProps({
  modelValue: { type: Number, default: undefined },
  min: { type: Number, default: -Infinity },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  precision: { type: Number, default: undefined },
  size: { type: String, default: 'default' },
  controls: { type: Boolean, default: true },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => { emit('update:modelValue', val) }
})

const handleChange = (val) => emit('change', val)
</script>
