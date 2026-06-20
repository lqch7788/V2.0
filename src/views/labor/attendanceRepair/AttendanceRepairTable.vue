<!--
  考勤补卡表组件
  对标 V1.1 src/components/labor/attendanceRepair 相关表
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="单号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="applicantName" label="申请人" min-width="100" />
    <el-table-column prop="date" label="日期" width="120" />
    <el-table-column label="补卡类型" width="120">
      <template #default="{ row }">
        <el-tag size="small">{{ typeText(row.type) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="originalTime" label="原始时间" width="140" />
    <el-table-column prop="newTime" label="新时间" width="140" />
    <el-table-column prop="reason" label="原因" min-width="200" show-overflow-tooltip />
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

const TYPE_MAP = { checkIn: '上班补卡', checkOut: '下班补卡', both: '上下班补卡' }
const STATUS_MAP = { pending: { tag: 'warning', text: '待审批' }, approved: { tag: 'success', text: '已通过' }, rejected: { tag: 'danger', text: '已拒绝' } }

const typeText = (t) => TYPE_MAP[t] || t
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>