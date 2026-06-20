<!--
  计件表组件
  对标 V1.1 src/components/labor/piecework/PieceworkTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="单号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="workerName" label="员工" min-width="100" />
    <el-table-column prop="taskName" label="任务" min-width="160" />
    <el-table-column prop="count" label="数量" width="100" align="right" />
    <el-table-column prop="unitPrice" label="单价" width="100" align="right">
      <template #default="{ row }">¥{{ row.unitPrice }}</template>
    </el-table-column>
    <el-table-column prop="total" label="总金额" width="120" align="right">
      <template #default="{ row }">
        <span class="font-bold text-emerald-600">¥{{ row.total }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="date" label="日期" width="110" />
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

const STATUS_MAP = { pending: { tag: 'warning', text: '待审核' }, approved: { tag: 'success', text: '已通过' }, paid: { tag: 'primary', text: '已发放' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>