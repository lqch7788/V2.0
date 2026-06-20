<!--
  请假表组件
  对标 V1.1 src/components/labor/leave/LeaveTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="单号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="applicantName" label="申请人" min-width="100" />
    <el-table-column prop="department" label="部门" min-width="120" />
    <el-table-column label="类型" width="100">
      <template #default="{ row }">
        <el-tag size="small">{{ typeText(row.type) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="时间" min-width="200">
      <template #default="{ row }">
        <div class="text-xs">
          <div>起：{{ row.startDate }}</div>
          <div>止：{{ row.endDate }}</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="days" label="天数" width="80" align="right" />
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

const TYPE_MAP = { personal: '事假', sick: '病假', annual: '年假', marriage: '婚假', maternity: '产假', bereavement: '丧假' }
const STATUS_MAP = { pending: { tag: 'warning', text: '待审批' }, approved: { tag: 'success', text: '已通过' }, rejected: { tag: 'danger', text: '已拒绝' } }

const typeText = (t) => TYPE_MAP[t] || t
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>