<!--
  小组表组件
  对标 V1.1 src/components/labor/team/TeamTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="小组编号" width="120">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="name" label="小组名称" min-width="140" />
    <el-table-column prop="leaderName" label="组长" min-width="100" />
    <el-table-column prop="memberCount" label="人数" width="80" align="right" />
    <el-table-column prop="department" label="负责区域" min-width="160" />
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
          {{ row.status === 'active' ? '启用' : '停用' }}
        </el-tag>
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
</script>