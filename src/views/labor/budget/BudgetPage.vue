<!--
  预算页面
  对标 V1.1 src/components/labor/budget/BudgetPage.tsx
-->
<template>
  <div class="space-y-4">
    <BudgetChart :data="chartData" type="bar" :height="350" />
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="font-semibold mb-3">预算执行明细</h3>
      <el-table :data="data" border>
        <el-table-column prop="name" label="科目" min-width="160" />
        <el-table-column prop="budget" label="预算" width="120" align="right">
          <template #default="{ row }">¥{{ row.budget }}</template>
        </el-table-column>
        <el-table-column prop="used" label="已用" width="120" align="right">
          <template #default="{ row }">¥{{ row.used }}</template>
        </el-table-column>
        <el-table-column prop="percent" label="使用率" width="200">
          <template #default="{ row }">
            <el-progress :percentage="row.percent" :status="row.percent > 90 ? 'exception' : 'success'" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BudgetChart from './BudgetChart.vue'

const data = [
  { name: '工资', budget: 100000, used: 85000 },
  { name: '社保', budget: 30000, used: 28000 },
  { name: '培训', budget: 15000, used: 5000 },
  { name: '福利', budget: 20000, used: 12000 },
  { name: '招聘', budget: 10000, used: 8000 },
]

const chartData = computed(() =>
  data.map((d) => ({ name: d.name, value: d.budget }))
)
</script>