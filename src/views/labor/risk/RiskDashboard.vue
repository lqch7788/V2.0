<!--
  风险预警面板
  对标 V1.1 src/components/labor/risk/RiskDashboard.tsx
-->
<template>
  <div class="space-y-4">
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-red-50 border border-red-200 rounded-xl p-4">
        <p class="text-sm text-red-700">高风险</p>
        <p class="text-3xl font-bold text-red-700 mt-2">{{ high }}</p>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p class="text-sm text-amber-700">中风险</p>
        <p class="text-3xl font-bold text-amber-700 mt-2">{{ medium }}</p>
      </div>
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p class="text-sm text-blue-700">低风险</p>
        <p class="text-3xl font-bold text-blue-700 mt-2">{{ low }}</p>
      </div>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="font-semibold mb-3">风险事件列表</h3>
      <el-table :data="events" border size="small">
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="riskTagType(row.level)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="date" label="时间" width="140" />
        <el-table-column prop="department" label="部门" min-width="120" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  high: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  low: { type: Number, default: 0 },
  events: { type: Array, default: () => [] },
})

defineEmits(['view'])

const riskTagType = (level) => {
  const map = { high: 'danger', medium: 'warning', low: 'info' }
  return map[level] || 'info'
}
</script>