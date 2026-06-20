<!--
  工作日志表组件
  对标 V1.1 src/components/labor/worklog/WorkLogTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="日志编号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="workerName" label="员工" min-width="100" />
    <el-table-column prop="date" label="日期" width="120" />
    <el-table-column prop="taskTitle" label="关联任务" min-width="160" show-overflow-tooltip />
    <el-table-column prop="hours" label="工时" width="80" align="right" />
    <el-table-column prop="content" label="工作内容" min-width="240" show-overflow-tooltip />
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

const STATUS_MAP = { draft: { tag: 'info', text: '草稿' }, submitted: { tag: 'warning', text: '已提交' }, approved: { tag: 'success', text: '已确认' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>