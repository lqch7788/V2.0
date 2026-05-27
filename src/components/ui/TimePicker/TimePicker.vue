<template>
  <el-time-picker
    v-model="currentValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="allowClear"
    :format="format"
    :value-format="format"
    :is-range="false"
    :size="size"
    :class="className"
    @change="handleChange"
    @visible-change="handleVisibleChange"
  />
</template>

<script setup>
import { computed } from 'vue'
import { ElTimePicker } from 'element-plus'

const props = defineProps({
  modelValue: { default: '' },
  format: { type: String, default: 'HH:mm:ss' },
  placeholder: { type: String, default: '选择时间' },
  disabled: { type: Boolean, default: false },
  allowClear: { type: Boolean, default: true },
  size: { type: String, default: 'default' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => { emit('update:modelValue', val) }
})

const handleChange = (val) => emit('change', val)
const handleVisibleChange = () => {}
</script>
