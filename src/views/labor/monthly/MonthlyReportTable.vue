<!--
  月报表组件
  对标 V1.1 src/components/labor/monthly/MonthlyReportTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="month" label="月份" width="100" />
    <el-table-column prop="workerName" label="员工" min-width="100" />
    <el-table-column prop="department" label="部门" min-width="120" />
    <el-table-column prop="workDays" label="出勤天数" width="100" align="right" />
    <el-table-column prop="baseSalary" label="基本工资" width="120" align="right">
      <template #default="{ row }">¥{{ row.baseSalary }}</template>
    </el-table-column>
    <el-table-column prop="bonus" label="奖金" width="100" align="right">
      <template #default="{ row }">¥{{ row.bonus }}</template>
    </el-table-column>
    <el-table-column prop="deduction" label="扣款" width="100" align="right">
      <template #default="{ row }">¥{{ row.deduction }}</template>
    </el-table-column>
    <el-table-column prop="total" label="实发" width="120" align="right">
      <template #default="{ row }">
        <span class="font-bold text-emerald-600">¥{{ row.total }}</span>
      </template>
    </el-table-column>
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