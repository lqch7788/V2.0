<!--
  作物品种表格组件
  对标 V1.1 src/components/farm/crop-variety/CropVarietyTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border>
    <el-table-column prop="code" label="编码" min-width="120" />
    <el-table-column prop="name" label="品种名" min-width="160" />
    <el-table-column prop="category" label="类别" min-width="100" />
    <el-table-column prop="growthPeriod" label="周期(天)" width="100" align="right" />
    <slot name="actions" />
  </el-table>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>