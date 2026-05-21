<template>
  <el-form-item
    :label="label"
    :prop="prop"
    :required="required"
    :rules="rules"
  >
    <slot />
  </el-form-item>
</template>

<script setup>
import { ElFormItem } from 'element-plus'

defineProps({
  label: String,
  prop: String,
  required: Boolean,
  rules: [Array, Object]
})
</script>
