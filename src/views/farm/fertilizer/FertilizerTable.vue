<!--
  肥料表组件（通用）
  对标 V1.1 src/components/farm/fertilizer/FertilizerTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column prop="code" label="编码" min-width="120">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="name" label="名称" min-width="140" />
    <el-table-column prop="type" label="类型" min-width="100">
      <template #default="{ row }"><el-tag size="small">{{ row.type }}</el-tag></template>
    </el-table-column>
    <el-table-column prop="nitrogen" label="N(%)" width="80" align="right" />
    <el-table-column prop="phosphorus" label="P(%)" width="80" align="right" />
    <el-table-column prop="potassium" label="K(%)" width="80" align="right" />
    <el-table-column prop="stock" label="库存(kg)" width="100" align="right" />
    <slot name="actions" />
  </el-table>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>