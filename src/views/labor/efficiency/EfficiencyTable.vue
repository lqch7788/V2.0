<!--
  效率表组件
  对标 V1.1 src/components/labor/efficiency/EfficiencyTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="workerName" label="员工" min-width="100" />
    <el-table-column prop="date" label="日期" width="110" />
    <el-table-column prop="workload" label="工作量" min-width="100" align="right" />
    <el-table-column prop="hours" label="时长(h)" width="100" align="right" />
    <el-table-column label="效率值" width="120" align="right">
      <template #default="{ row }">
        <span class="font-bold text-emerald-600">{{ row.efficiency?.toFixed(2) || '0.00' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
    <slot name="actions" />
  </el-table>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
})
</script>