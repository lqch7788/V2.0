<!--
  2026-07-22 1:1 兼容 V1.1 shadcn/ui 风格的 SelectItem
  包装 Element Plus el-option
-->
<template>
  <el-option :value="value" :label="label" :disabled="disabled" />
</template>

<script setup>
/**
 * SelectItem：单个下拉项
 * V1.1: <SelectItem value="x" label="y" />
 * V2.0: 内部用 el-option 实现
 */
defineProps({
  value: { type: [String, Number, Boolean, Object], required: true },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false }
})
</script>
