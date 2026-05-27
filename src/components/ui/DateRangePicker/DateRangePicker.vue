<template>
  <el-date-picker
    v-model="currentValue"
    type="daterange"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :range-separator="rangeSeparator"
    :disabled="disabled"
    :clearable="clearable"
    :format="format"
    :value-format="valueFormat"
    :size="size"
    :class="className"
    @change="handleChange"
  />
</template>

<script setup>
import { computed } from 'vue'
import { ElDatePicker } from 'element-plus'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  startPlaceholder: { type: String, default: '开始日期' },
  endPlaceholder: { type: String, default: '结束日期' },
  rangeSeparator: { type: String, default: '-' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  format: { type: String, default: 'YYYY-MM-DD' },
  valueFormat: { type: String, default: 'YYYY-MM-DD' },
  size: { type: String, default: 'default' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => { emit('update:modelValue', val); emit('change', val) }
})

const handleChange = (val) => emit('change', val)
</script>
