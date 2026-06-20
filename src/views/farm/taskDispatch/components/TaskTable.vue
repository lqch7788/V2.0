<!--
  任务派发表格
  对标 V1.1 src/components/farm/taskDispatch/components/TaskTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="任务编号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="type" label="任务类型" width="120">
      <template #default="{ row }"><el-tag size="small">{{ row.type }}</el-tag></template>
    </el-table-column>
    <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
    <el-table-column prop="executorName" label="执行人" min-width="100" />
    <el-table-column prop="greenhouseName" label="温室" min-width="120" />
    <el-table-column prop="plannedDate" label="计划日期" width="120" />
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
  pending: { tag: 'warning', text: '待执行' },
  executing: { tag: 'primary', text: '执行中' },
  completed: { tag: 'success', text: '已完成' },
  overdue: { tag: 'danger', text: '已超时' },
  cancelled: { tag: 'info', text: '已取消' },
}

const priorityTagType = (p) => PRIORITY_MAP[p]?.tag || ''
const priorityText = (p) => PRIORITY_MAP[p]?.text || p
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>