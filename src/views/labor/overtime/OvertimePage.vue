<!--
  加班管理页面（V1.1 风格）
  对标 V1.1 src/components/labor/overtime/OvertimePage.tsx
-->
<template>
  <div class="space-y-4">
    <OvertimeFilters @change="handleFilterChange" @reset="handleReset" />
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-amber-700">待审批</p>
        <p class="text-2xl font-bold text-amber-700 mt-2">{{ stats.pending }}</p>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-emerald-700">已通过</p>
        <p class="text-2xl font-bold text-emerald-700 mt-2">{{ stats.approved }}</p>
      </div>
      <div class="bg-blue-50 rounded-xl p-4 shadow-sm">
        <p class="text-sm text-blue-700">本月加班总时长</p>
        <p class="text-2xl font-bold text-blue-700 mt-2">{{ stats.totalHours }} h</p>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">加班记录</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>加班申请
        </el-button>
      </div>
      <OvertimeTable :data="filteredData" />
    </div>
    <OvertimeFormModal v-model="showForm" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import OvertimeFilters from './OvertimeFilters.vue'
import OvertimeTable from './OvertimeTable.vue'
import OvertimeFormModal from './OvertimeFormModal.vue'

const filters = ref({ keyword: '', status: '', dateRange: [] })
const showForm = ref(false)

const mockData = ref([
  { code: 'OT001', applicantName: '张三', date: '2024-03-15', startTime: '18:00:00', endTime: '21:00:00', hours: 3, reason: '完成生产任务', status: 'pending' },
  { code: 'OT002', applicantName: '李四', date: '2024-03-16', startTime: '18:00:00', endTime: '20:00:00', hours: 2, reason: '紧急订单', status: 'approved' },
  { code: 'OT003', applicantName: '王五', date: '2024-03-18', startTime: '19:00:00', endTime: '22:00:00', hours: 3, reason: '设备调试', status: 'pending' },
  { code: 'OT004', applicantName: '赵六', date: '2024-03-20', startTime: '18:00:00', endTime: '22:00:00', hours: 4, reason: '项目交付', status: 'approved' },
])

const filteredData = computed(() => {
  const f = filters.value
  return mockData.value.filter((d) => {
    if (f.keyword && !d.applicantName.includes(f.keyword) && !d.code.includes(f.keyword)) return false
    if (f.status && d.status !== f.status) return false
    return true
  })
})

const stats = computed(() => ({
  pending: filteredData.value.filter((d) => d.status === 'pending').length,
  approved: filteredData.value.filter((d) => d.status === 'approved').length,
  totalHours: filteredData.value.reduce((sum, d) => sum + (d.hours || 0), 0),
}))

const handleFilterChange = (f) => { filters.value = f }
const handleReset = () => { filters.value = { keyword: '', status: '', dateRange: [] } }
</script>