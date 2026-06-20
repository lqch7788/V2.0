<!--
  巡检表格
  对标 V1.1 src/components/farm/hub/InspectionTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column prop="code" label="巡检编号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="inspectorName" label="巡检人" min-width="100" />
    <el-table-column prop="area" label="区域" min-width="120" />
    <el-table-column prop="inspectTime" label="时间" width="140" />
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.hasIssue ? 'danger' : 'success'" size="small">
          {{ row.hasIssue ? '有问题' : '正常' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="100">
      <template #default="{ row }">
        <el-button link type="primary" size="small" @click="$emit('view', row)">详情</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['view'])
</script>