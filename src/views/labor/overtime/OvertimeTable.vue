<!--
  加班表组件
  对标 V1.1 src/components/labor/overtime/OvertimeTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="单号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="applicantName" label="申请人" min-width="100" />
    <el-table-column prop="date" label="加班日期" width="110" />
    <el-table-column label="时间段" min-width="180">
      <template #default="{ row }">
        <span class="text-xs">{{ row.startTime }} ~ {{ row.endTime }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="hours" label="加班时长(h)" width="120" align="right" />
    <el-table-column prop="reason" label="加班原因" min-width="200" show-overflow-tooltip />
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

const STATUS_MAP = { pending: { tag: 'warning', text: '待审批' }, approved: { tag: 'success', text: '已通过' }, rejected: { tag: 'danger', text: '已拒绝' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>