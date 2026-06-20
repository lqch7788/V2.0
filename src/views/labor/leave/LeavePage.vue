<!--
  请假管理页面（V1.1 风格 1:1）
  对标 V1.1 src/components/labor/leave/LeavePage.tsx
-->
<template>
  <div class="space-y-4">
    <LeaveFilters @change="handleFilterChange" @reset="handleReset" />
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-blue-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-blue-700">待审批</p>
        <p class="text-2xl font-bold text-blue-700 mt-2">{{ stats.pending }}</p>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-emerald-700">已通过</p>
        <p class="text-2xl font-bold text-emerald-700 mt-2">{{ stats.approved }}</p>
      </div>
      <div class="bg-red-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-red-700">已拒绝</p>
        <p class="text-2xl font-bold text-red-700 mt-2">{{ stats.rejected }}</p>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">请假记录</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>请假申请
        </el-button>
      </div>
      <LeaveTable :data="filteredData" />
    </div>
    <LeaveFormModal v-model="showForm" />
    <LeaveQuota />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import LeaveFilters from './LeaveFilters.vue'
import LeaveTable from './LeaveTable.vue'
import LeaveFormModal from './LeaveFormModal.vue'
import LeaveQuota from './LeaveQuota.vue'

const filters = ref({ keyword: '', type: '', status: '', dateRange: [] })
const showForm = ref(false)

const mockData = ref([
  { code: 'LV001', applicantName: '张三', department: '生产部', type: 'personal', startDate: '2024-03-20', endDate: '2024-03-22', days: 3, status: 'pending' },
  { code: 'LV002', applicantName: '李四', department: '生产部', type: 'sick', startDate: '2024-03-18', endDate: '2024-03-19', days: 2, status: 'approved' },
  { code: 'LV003', applicantName: '王五', department: '技术部', type: 'annual', startDate: '2024-03-25', endDate: '2024-03-30', days: 5, status: 'pending' },
  { code: 'LV004', applicantName: '赵六', department: '后勤部', type: 'personal', startDate: '2024-03-10', endDate: '2024-03-10', days: 1, status: 'rejected' },
])

const filteredData = computed(() => {
  const f = filters.value
  return mockData.value.filter((d) => {
    if (f.keyword && !d.applicantName.includes(f.keyword) && !d.code.includes(f.keyword)) return false
    if (f.type && d.type !== f.type) return false
    if (f.status && d.status !== f.status) return false
    return true
  })
})

const stats = computed(() => ({
  pending: filteredData.value.filter((d) => d.status === 'pending').length,
  approved: filteredData.value.filter((d) => d.status === 'approved').length,
  rejected: filteredData.value.filter((d) => d.status === 'rejected').length,
}))

const handleFilterChange = (f) => { filters.value = f }
const handleReset = () => { filters.value = { keyword: '', type: '', status: '', dateRange: [] } }
</script>