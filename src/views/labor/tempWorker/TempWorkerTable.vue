<!--
  临时工表组件
  对标 V1.1 src/components/labor/tempWorker/TempWorkerTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="编号" width="120">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="name" label="姓名" min-width="100" />
    <el-table-column prop="phone" label="电话" width="130" />
    <el-table-column prop="source" label="来源" min-width="100">
      <template #default="{ row }"><el-tag size="small">{{ row.source }}</el-tag></template>
    </el-table-column>
    <el-table-column prop="dailyRate" label="日薪" width="100" align="right">
      <template #default="{ row }">¥{{ row.dailyRate }}</template>
    </el-table-column>
    <el-table-column prop="workDays" label="工作天数" width="100" align="right" />
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

const STATUS_MAP = { active: { tag: 'success', text: '可用' }, busy: { tag: 'warning', text: '工作中' }, left: { tag: 'info', text: '已离开' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>