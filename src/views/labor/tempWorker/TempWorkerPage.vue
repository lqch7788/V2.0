<!--
  临时工入职页面（V1.1 风格）
  对标 V1.1 src/components/labor/tempWorker/TempWorkerPage.tsx
-->
<template>
  <div class="space-y-4">
    <TempWorkerFilters @change="handleFilterChange" @reset="handleReset" />
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">临时工列表</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>新增临时工
        </el-button>
      </div>
      <TempWorkerTable :data="filteredData" />
    </div>
    <TempWorkerFormModal v-model="showForm" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import TempWorkerFilters from './TempWorkerFilters.vue'
import TempWorkerTable from './TempWorkerTable.vue'
import TempWorkerFormModal from './TempWorkerFormModal.vue'

const filters = ref({ keyword: '', source: '', status: '' })
const showForm = ref(false)

const mockData = ref([
  { code: 'TW001', name: '王工', phone: '13800138001', source: '中介', dailyRate: 200, workDays: 20, status: 'active' },
  { code: 'TW002', name: '李工', phone: '13800138002', source: '内部', dailyRate: 220, workDays: 15, status: 'active' },
  { code: 'TW003', name: '赵工', phone: '13800138003', source: '自主', dailyRate: 180, workDays: 25, status: 'busy' },
])

const filteredData = computed(() => {
  const f = filters.value
  return mockData.value.filter((d) => {
    if (f.keyword && !d.name.includes(f.keyword) && !d.code.includes(f.keyword)) return false
    if (f.source && d.source !== f.source) return false
    if (f.status && d.status !== f.status) return false
    return true
  })
})

const handleFilterChange = (f) => { filters.value = f }
const handleReset = () => { filters.value = { keyword: '', source: '', status: '' } }
</script>