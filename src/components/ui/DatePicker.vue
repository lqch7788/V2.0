<template>
  <el-date-picker
    v-model="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :format="format"
    :value-format="valueFormat"
    :range-separator="rangeSeparator"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :class="['ui-date-picker', className]"
    @change="handleChange"
  />
</template>

<script setup>
import { ElDatePicker } from 'element-plus'

const props = defineProps({"type":"'date'","placeholder":"'请选择日期'","disabled":"false","clearable":"true","className":"''"})

const emit = defineEmits(['update'])

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.ui-date-picker {
  /* 可自定义样式 */
}
</style>
