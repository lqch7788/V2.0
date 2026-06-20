<!--
  临时任务表组件
  对标 V1.1 src/components/labor/tempTask/TempTaskTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="任务编号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
    <el-table-column prop="applicantName" label="申请人" min-width="100" />
    <el-table-column prop="plannedDate" label="计划日期" width="120" />
    <el-table-column prop="hours" label="预估工时" width="100" align="right" />
    <el-table-column label="优先级" width="80">
      <template #default="{ row }">
        <el-tag :type="priorityTagType(row.priority)" size="small">{{ priorityText(row.priority) }}</el-tag>
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

const PRIORITY_MAP = { urgent: { tag: 'danger', text: '加急' }, high: { tag: 'warning', text: '高' }, normal: { tag: 'info', text: '普通' } }
const STATUS_MAP = {
  pending: { tag: 'warning', text: '待审批' },
  approved: { tag: 'success', text: '已通过' },
  executing: { tag: 'primary', text: '执行中' },
  completed: { tag: 'success', text: '已完成' },
  rejected: { tag: 'danger', text: '已拒绝' },
}

const priorityTagType = (p) => PRIORITY_MAP[p]?.tag || ''
const priorityText = (p) => PRIORITY_MAP[p]?.text || p
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>