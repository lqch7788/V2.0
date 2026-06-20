<!--
  采收表格
  对标 V1.1 src/components/farm/harvest/components/HarvestTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="采收批次" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="varietyName" label="品种" min-width="140" />
    <el-table-column prop="greenhouseName" label="温室" min-width="120" />
    <el-table-column prop="harvesterName" label="采收人" min-width="100" />
    <el-table-column prop="harvestDate" label="日期" width="120" />
    <el-table-column prop="yield" label="采收量" width="100" align="right" />
    <el-table-column prop="qualifiedYield" label="合格量" width="100" align="right" />
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

const STATUS_MAP = { pending: { tag: 'warning', text: '待处理' }, completed: { tag: 'success', text: '已完成' }, stored: { tag: 'primary', text: '已入库' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>