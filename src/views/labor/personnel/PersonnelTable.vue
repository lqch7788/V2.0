<!--
  员工表组件
  对标 V1.1 src/components/labor/personnel/PersonnelTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="工号" width="120">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="name" label="姓名" min-width="100" />
    <el-table-column prop="gender" label="性别" width="60">
      <template #default="{ row }">{{ row.gender === 'M' ? '男' : '女' }}</template>
    </el-table-column>
    <el-table-column prop="department" label="部门" min-width="120" />
    <el-table-column prop="position" label="岗位" min-width="120" />
    <el-table-column prop="phone" label="电话" width="130" />
    <el-table-column prop="entryDate" label="入职日期" width="120" />
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

const STATUS_MAP = {
  active: { tag: 'success', text: '在职' },
  leave: { tag: 'warning', text: '休假' },
  resigned: { tag: 'info', text: '离职' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>