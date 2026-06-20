<!--
  技能表组件
  对标 V1.1 src/components/labor/skill/SkillTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="技能编号" width="120">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="name" label="技能名称" min-width="140" />
    <el-table-column prop="category" label="分类" min-width="100">
      <template #default="{ row }"><el-tag size="small">{{ row.category }}</el-tag></template>
    </el-table-column>
    <el-table-column label="等级" width="120">
      <template #default="{ row }">
        <el-rate v-model="row.level" disabled :max="5" />
      </template>
    </el-table-column>
    <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
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