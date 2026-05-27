<template>
  <el-cascader
    v-model="currentValue"
    :options="options"
    :props="cascaderProps"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :size="size"
    :class="className"
    @change="handleChange"
  />
</template>

<script setup>
import { computed } from 'vue'
import { ElCascader } from 'element-plus'

const props = defineProps({
  modelValue: { default: undefined },
  options: { type: Array, default: () => [] },
  cascaderProps: { type: Object, default: () => ({}) },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => { emit('update:modelValue', val) }
})

const handleChange = (val) => emit('change', val)
</script>
