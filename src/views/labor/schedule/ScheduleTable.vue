<!--
  排班表组件
  对标 V1.1 src/components/labor/schedule/ScheduleTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="date" label="日期" width="120" />
    <el-table-column prop="workerName" label="员工" min-width="100" />
    <el-table-column label="班次" width="100">
      <template #default="{ row }">
        <el-tag :type="shiftTagType(row.shift)" size="small">{{ shiftText(row.shift) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="时间段" min-width="160">
      <template #default="{ row }">
        <span class="text-xs">{{ row.startTime }} - {{ row.endTime }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="location" label="工作地点" min-width="120" />
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

const SHIFT_MAP = {
  morning: { tag: 'primary', text: '早班' },
  afternoon: { tag: 'warning', text: '中班' },
  night: { tag: 'info', text: '晚班' },
  rest: { tag: 'success', text: '休息' },
}

const shiftTagType = (s) => SHIFT_MAP[s]?.tag || ''
const shiftText = (s) => SHIFT_MAP[s]?.text || s
</script>