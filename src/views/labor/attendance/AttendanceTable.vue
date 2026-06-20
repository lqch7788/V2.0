<!--
  考勤表格组件
  对标 V1.1 src/components/labor/attendance/attendance 表格
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="workerCode" label="工号" width="120" />
    <el-table-column prop="workerName" label="姓名" min-width="100" />
    <el-table-column prop="department" label="部门" min-width="120" show-overflow-tooltip />
    <el-table-column prop="date" label="日期" width="110" />
    <el-table-column prop="checkIn" label="上班" width="100" />
    <el-table-column prop="checkOut" label="下班" width="100" />
    <el-table-column prop="workHours" label="工时(h)" width="100" align="right" />
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

const STATUS_MAP = {
  normal: { tag: 'success', text: '正常' },
  late: { tag: 'warning', text: '迟到' },
  early: { tag: 'warning', text: '早退' },
  absent: { tag: 'danger', text: '缺勤' },
  leave: { tag: 'info', text: '请假' },
}

const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>