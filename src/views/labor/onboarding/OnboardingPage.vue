<!--
  入职办理页面（V1.1 风格）
  对标 V1.1 src/components/labor/onboarding/OnboardingPage.tsx
-->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">入职申请列表</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>入职办理
        </el-button>
      </div>
      <el-table :data="applications" border>
        <el-table-column prop="code" label="编号" width="140">
          <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="120" />
        <el-table-column prop="position" label="岗位" min-width="120" />
        <el-table-column prop="entryDate" label="入职日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="success" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button link type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <OnboardingForm v-model="showForm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import OnboardingForm from './OnboardingForm.vue'

const showForm = ref(false)

const applications = ref([
  { code: 'OB001', name: '新员工A', department: '生产部', position: '生产工', entryDate: '2024-04-01', status: 'pending' },
  { code: 'OB002', name: '新员工B', department: '技术部', position: '技术员', entryDate: '2024-04-15', status: 'approved' },
  { code: 'OB003', name: '新员工C', department: '财务部', position: '会计', entryDate: '2024-05-01', status: 'pending' },
])

const STATUS_MAP = { pending: { tag: 'warning', text: '待审批' }, approved: { tag: 'success', text: '已通过' }, rejected: { tag: 'danger', text: '已拒绝' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s

const handleView = () => {}
const handleApprove = () => {}
const handleReject = () => {}
</script>