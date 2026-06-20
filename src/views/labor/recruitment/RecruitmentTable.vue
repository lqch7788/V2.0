<!--
  招聘表组件
  对标 V1.1 src/components/labor/recruitment/RecruitmentTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="招聘编号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="position" label="招聘岗位" min-width="140" />
    <el-table-column prop="department" label="部门" min-width="120" />
    <el-table-column prop="count" label="招聘人数" width="100" align="right" />
    <el-table-column label="薪资范围" min-width="160">
      <template #default="{ row }">
        ¥{{ row.salaryMin }} - ¥{{ row.salaryMax }}
      </template>
    </el-table-column>
    <el-table-column prop="publishDate" label="发布日期" width="120" />
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
  open: { tag: 'success', text: '招聘中' },
  closed: { tag: 'info', text: '已关闭' },
  filled: { tag: 'warning', text: '已招满' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>