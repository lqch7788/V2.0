<!--
  工人考勤页面
  对标 V1.1 src/components/labor/attendance/WorkerAttendancePage.tsx
-->
<template>
  <div class="space-y-4">
    <WorkerAttendanceFilters @change="handleFilterChange" @reset="handleReset" />
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">工人考勤列表</h2>
        <WorkerAttendanceExport :data="filteredData" />
      </div>
      <WorkerAttendanceTable :data="filteredData" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import WorkerAttendanceFilters from './WorkerAttendanceFilters.vue'
import WorkerAttendanceTable from './WorkerAttendanceTable.vue'
import WorkerAttendanceExport from './WorkerAttendanceExport.vue'

const filters = ref({ keyword: '', department: '', status: '' })

const mockData = ref([
  { workerCode: 'EMP001', workerName: '张三', department: '生产部', date: '2024-03-15', checkIn: '08:00', checkOut: '17:00', workHours: 8, status: 'normal' },
  { workerCode: 'EMP002', workerName: '李四', department: '生产部', date: '2024-03-15', checkIn: '08:30', checkOut: '17:00', workHours: 7.5, status: 'late' },
  { workerCode: 'EMP003', workerName: '王五', department: '技术部', date: '2024-03-15', checkIn: '08:00', checkOut: '17:00', workHours: 8, status: 'normal' },
  { workerCode: 'EMP004', workerName: '赵六', department: '生产部', date: '2024-03-15', checkIn: '07:55', checkOut: '17:05', workHours: 8.2, status: 'normal' },
  { workerCode: 'EMP005', workerName: '钱七', department: '后勤部', date: '2024-03-15', checkIn: '', checkOut: '', workHours: 0, status: 'absent' },
])

const filteredData = computed(() => {
  const f = filters.value
  return mockData.value.filter((d) => {
    if (f.keyword && !d.workerName.includes(f.keyword) && !d.workerCode.includes(f.keyword)) return false
    if (f.department && d.department !== f.department) return false
    if (f.status && d.status !== f.status) return false
    return true
  })
})

const handleFilterChange = (f) => { filters.value = f }
const handleReset = () => { filters.value = { keyword: '', department: '', status: '' } }
</script>