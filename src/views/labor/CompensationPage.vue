<!--
  薪酬管理聚合页面
  对标 V1.1 src/pages/Labor/CompensationPage.tsx
  包含：工资管理、计件工资、薪酬调整、薪资预算
-->
<template>
  <div class="space-y-6">
    <TabHeader
      title="薪酬管理"
      subtitle="工资、计件、调整与预算"
      :icon="iconMoney"
      v-model="activeTab"
      :tabs="tabs"
    />
    <div>
      <SalaryTable v-if="activeTab === 'salary'" :data="salaryData" />
      <PieceworkTable v-else-if="activeTab === 'piecework'" :data="pieceworkData" />
      <SalaryAdjustmentTable v-else-if="activeTab === 'salary-adjustment'" :data="adjustmentData" />
      <BudgetTable v-else-if="activeTab === 'budget'" :data="budgetData" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Money, Wallet, EditPen, Document } from '@element-plus/icons-vue'
import TabHeader from './components/TabHeader.vue'
import SalaryTable from './salary/SalaryTable.vue'
import PieceworkTable from './piecework/PieceworkTable.vue'
import BudgetTable from './budget/BudgetTable.vue'

const activeTab = ref('salary')
const iconMoney = Money

const tabs = [
  { key: 'salary', label: '工资管理', icon: Money },
  { key: 'piecework', label: '计件工资', icon: Wallet },
  { key: 'salary-adjustment', label: '薪酬调整', icon: EditPen },
  { key: 'budget', label: '薪资预算', icon: Document },
]

const salaryData = ref([
  { workerName: '张三', month: '2024-03', baseSalary: 8000, overtime: 500, bonus: 1000, deduction: 200, total: 9300 },
  { workerName: '李四', month: '2024-03', baseSalary: 7500, overtime: 300, bonus: 800, deduction: 100, total: 8500 },
  { workerName: '王五', month: '2024-03', baseSalary: 9000, overtime: 800, bonus: 1500, deduction: 300, total: 11000 },
])

const pieceworkData = ref([
  { code: 'PW001', workerName: '张三', taskName: '番茄采收', count: 100, unitPrice: 2, total: 200, date: '2024-03-15', status: 'pending' },
  { code: 'PW002', workerName: '李四', taskName: '生菜包装', count: 200, unitPrice: 1.5, total: 300, date: '2024-03-15', status: 'approved' },
])

const adjustmentData = ref([
  { code: 'ADJ001', workerName: '张三', department: '生产部', oldSalary: 7000, newSalary: 8000, changeAmount: 1000, reason: '晋升', effectiveDate: '2024-03-01', status: 'approved' },
])

const budgetData = ref([
  { name: '生产部工资', type: '部门', department: '生产部', amount: 100000, used: 85000, status: 'active' },
  { name: '技术部工资', type: '部门', department: '技术部', amount: 50000, used: 42000, status: 'active' },
])

const SalaryAdjustmentTable = {
  template: '<div class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">薪酬调整功能开发中</div>',
}
</script>