<!--
  绩效表组件
  对标 V1.1 src/components/labor/performance/PerformanceTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="编号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="workerName" label="员工" min-width="100" />
    <el-table-column prop="period" label="考核周期" width="120" />
    <el-table-column prop="score" label="评分" width="100" align="right">
      <template #default="{ row }">
        <span class="font-bold" :class="scoreClass(row.score)">{{ row.score }}</span>
      </template>
    </el-table-column>
    <el-table-column label="等级" width="100">
      <template #default="{ row }">
        <el-tag :type="levelTagType(row.level)" size="small">{{ row.level }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="comment" label="评语" min-width="200" show-overflow-tooltip />
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

const STATUS_MAP = { draft: { tag: 'info', text: '草稿' }, submitted: { tag: 'warning', text: '已提交' }, approved: { tag: 'success', text: '已审核' } }
const LEVEL_MAP = { A: 'success', B: 'primary', C: 'warning', D: 'danger' }

const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
const levelTagType = (l) => LEVEL_MAP[l] || 'info'
const scoreClass = (s) => (s >= 90 ? 'text-emerald-600' : s >= 75 ? 'text-blue-600' : s >= 60 ? 'text-amber-600' : 'text-red-600')
</script>