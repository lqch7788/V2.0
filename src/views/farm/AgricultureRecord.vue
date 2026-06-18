<!--
  AgricultureRecord.vue - 农事操作记录管理页面
  V1.1 AgricultureRecordPage.tsx 1:1 对齐：复用 components 版 1:1 迁移
  解决 P0-23~P0-32：views 层不再自实现，直接复用已迁移的完整组件
-->
<template>
  <div class="space-y-6">
    <!-- 完整复用 1:1 迁移的 components 版页面（包含 PageHeader + FilterToolbar + TableToolbar + Table + Pagination + 5 个 Modal） -->
    <AgricultureRecordPage />
  </div>
</template>

<script setup>
/**
 * 农事操作记录页面 wrapper
 * V1.1 1:1 迁移：复用 src/components/farm/agriculture/AgricultureRecordPage.vue 完整实现
 * 该组件已包含：PageHeader/FilterToolbar/TableToolbar/Table/Pagination/
 *              AddOperationRecordModal/ExportFormatModal/DeleteWarningModal/BatchEditModal
 */
import AgricultureRecordPage from '@/components/farm/agriculture/AgricultureRecordPage.vue'
</script>
