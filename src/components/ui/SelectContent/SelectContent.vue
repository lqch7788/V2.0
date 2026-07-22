<!--
  2026-07-22 1:1 兼容 V1.1 shadcn/ui 风格的 SelectContent
  包装 Element Plus el-select（接受 default slot 透传 SelectItem）
-->
<template>
  <slot />
</template>

<script setup>
/**
 * SelectContent 是 SelectItem 的容器，本质是 slot 透传组件
 * V1.1 shadcn/ui 中 SelectContent 包在 SelectTrigger 打开后的弹出层
 * V2.0 用 Element Plus el-select 自动管理弹出层，无需显式包装
 * 此组件保留作为 V1.1 风格兼容入口
 */
</script>
