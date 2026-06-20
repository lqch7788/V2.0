<!--
  工资表组件
  对标 V1.1 src/components/labor/salary/SalaryTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="workerName" label="员工" min-width="100" />
    <el-table-column prop="month" label="月份" width="100" />
    <el-table-column prop="baseSalary" label="基本工资" width="120" align="right">
      <template #default="{ row }">¥{{ row.baseSalary }}</template>
    </el-table-column>
    <el-table-column prop="overtime" label="加班" width="100" align="right">
      <template #default="{ row }">¥{{ row.overtime }}</template>
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
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
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

const STATUS_MAP = { draft: { tag: 'info', text: '草稿' }, approved: { tag: 'success', text: '已审核' }, paid: { tag: 'primary', text: '已发放' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>