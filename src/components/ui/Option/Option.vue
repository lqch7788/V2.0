<template>
  <el-option :label="label" :value="value" :disabled="disabled" />
</template>

<script setup>
import { ElOption } from 'element-plus'

defineProps({
  label: String,
  value: [String, Number],
  disabled: Boolean
})
</script>
