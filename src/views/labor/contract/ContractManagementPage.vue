<!--
  合同管理页面（V1.1 风格）
  对标 V1.1 src/components/labor/contract/ContractTable.tsx + ContractManagementPage
-->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">合同列表</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>新增合同
        </el-button>
      </div>
      <el-table :data="contracts" border>
        <el-table-column prop="code" label="合同编号" width="140">
          <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="workerName" label="员工" min-width="100" />
        <el-table-column prop="type" label="合同类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="期限" min-width="200">
          <template #default="{ row }">
            <span class="text-sm">{{ row.startDate }} - {{ row.endDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="月薪" width="120" align="right">
          <template #default="{ row }">¥{{ row.salary }}</template>
        </el-table-column>
        <el-table-column label="剩余天数" width="120">
          <template #default="{ row }">
            <el-tag :type="getDaysTagType(row.daysLeft)" size="small">{{ row.daysLeft }} 天</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleRenew(row)">续签</el-button>
            <el-button link type="danger" size="small" @click="handleTerminate(row)">终止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <ContractFormModal v-model="showForm" />
    <ContractRemindModal />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ContractFormModal from './ContractFormModal.vue'
import ContractRemindModal from './ContractRemindModal.vue'

const showForm = ref(false)

const contracts = ref([
  { code: 'CT001', workerName: '张三', type: '固定期限', startDate: '2023-04-01', endDate: '2026-04-01', salary: 8000, daysLeft: 365 },
  { code: 'CT002', workerName: '李四', type: '固定期限', startDate: '2024-01-01', endDate: '2024-12-31', salary: 7500, daysLeft: 280 },
  { code: 'CT003', workerName: '王五', type: '无固定期限', startDate: '2022-06-01', endDate: '', salary: 9000, daysLeft: -1 },
])

const getDaysTagType = (days) => {
  if (days <= 7) return 'danger'
  if (days <= 15) return 'warning'
  return 'info'
}

const handleRenew = () => {}
const handleTerminate = () => {}
</script>