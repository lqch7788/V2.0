<template>
  <el-select
    v-model="selectValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :size="size"
    :class="className"
    @change="handleChange"
  >
    <slot />
  </el-select>
</template>

<script setup>
import { ElSelect } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number, Array],
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  collapseTags: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  className: { type: String, default: '' }
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
