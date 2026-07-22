<!--
  2026-07-22 1:1 兼容 V1.1 shadcn/ui 风格的 SelectValue
  显示当前选中值（V2.0 由 Element Plus el-select 自动管理）
-->
<template>
  <span>{{ placeholder || '' }}</span>
</template>

<script setup>
/**
 * SelectValue：占位符显示（V1.1 显示当前选中值）
 * V2.0 el-select 自动渲染选中 label，无需显式包装
 */
defineProps({
  placeholder: { type: String, default: '' }
})
</script>
