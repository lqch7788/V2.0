<!--
  导出格式选择弹窗 - V2.0 兼容层（2026-07-18 修复）
  Vue 3 script setup 不允许 ES module exports。
  兼容旧 import { ExportFormatModal } from '.../seedling/modals' 的写法。
  实际渲染通用组件 @/components/common/ExportFormatModal.vue。
-->
<template>
  <ExportFormatModal v-bind="$attrs" />
</template>

<script setup>
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
</script>
