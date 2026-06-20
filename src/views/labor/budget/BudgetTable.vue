<!--
  预算表组件
  对标 V1.1 src/components/labor/budget/BudgetTable.tsx
-->
<template>
  <el-table :data="data" v-loading="loading" border stripe>
    <el-table-column v-if="selectable" type="selection" width="48" />
    <el-table-column prop="code" label="预算编号" width="140">
      <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
    </el-table-column>
    <el-table-column prop="name" label="预算名称" min-width="160" />
    <el-table-column prop="type" label="类型" width="100">
      <template #default="{ row }"><el-tag size="small">{{ typeText(row.type) }}</el-tag></template>
    </el-table-column>
    <el-table-column prop="department" label="部门" min-width="120" />
    <el-table-column prop="amount" label="金额" width="140" align="right">
      <template #default="{ row }">¥{{ row.amount }}</template>
    </el-table-column>
    <el-table-column prop="used" label="已用" width="140" align="right">
      <template #default="{ row }">¥{{ row.used }}</template>
    </el-table-column>
    <el-table-column label="使用率" width="180">
      <template #default="{ row }">
        <el-progress :percentage="Math.round(row.used / row.amount * 100)" :status="row.used / row.amount > 0.9 ? 'exception' : 'success'" />
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
          {{ row.status === 'active' ? '执行中' : '已停用' }}
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

const TYPE_MAP = { annual: '年度', quarterly: '季度', monthly: '月度', project: '项目' }
const typeText = (t) => TYPE_MAP[t] || t
</script>