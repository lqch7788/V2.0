<template>
  <el-tree-select
    v-model="currentValue"
    :data="data"
    :props="treeProps"
    :node-key="nodeKey"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :check-strictly="checkStrictly"
    :render-after-expand="false"
    :class="className"
    @change="handleChange"
  />
</template>

<script setup>
import { computed } from 'vue'
import { ElTreeSelect } from 'element-plus'

const props = defineProps({
  modelValue: { default: undefined },
  data: { type: Array, default: () => [] },
  treeProps: { type: Object, default: () => ({ children: 'children', label: 'label' }) },
  nodeKey: { type: String, default: 'id' },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  checkStrictly: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => { emit('update:modelValue', val) }
})

const handleChange = (val) => emit('change', val)
</script>
