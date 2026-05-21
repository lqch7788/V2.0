<template>
  <el-select
    v-model="modelValue"
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

const props = defineProps({"placeholder":"'请选择'","disabled":"false","clearable":"false","filterable":"false","multiple":"false","collapseTags":"false","className":"''"})

const emit = defineEmits(['update'])

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.ui-select {
  /* 可自定义样式 */
}
</style>
