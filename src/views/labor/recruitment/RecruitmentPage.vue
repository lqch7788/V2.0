<!--
  招聘管理页面（V1.1 风格）
  对标 V1.1 src/components/labor/recruitment/RecruitmentPage.tsx
-->
<template>
  <div class="space-y-4">
    <RecruitmentFilters @change="handleFilterChange" @reset="handleReset" />
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">招聘信息</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>发布招聘
        </el-button>
      </div>
      <RecruitmentTable :data="filteredData" />
    </div>
    <RecruitmentFormModal v-model="showForm" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import RecruitmentFilters from './RecruitmentFilters.vue'
import RecruitmentTable from './RecruitmentTable.vue'
import RecruitmentFormModal from './RecruitmentFormModal.vue'

const filters = ref({ keyword: '', department: '', status: '' })
const showForm = ref(false)

const mockData = ref([
  { code: 'RC001', position: '生产主管', department: '生产部', count: 2, salaryMin: 8000, salaryMax: 12000, publishDate: '2024-03-01', status: 'open' },
  { code: 'RC002', position: '技术员', department: '技术部', count: 3, salaryMin: 6000, salaryMax: 9000, publishDate: '2024-03-10', status: 'open' },
  { code: 'RC003', position: '财务专员', department: '财务部', count: 1, salaryMin: 5000, salaryMax: 7000, publishDate: '2024-02-20', status: 'filled' },
])

const filteredData = computed(() => {
  const f = filters.value
  return mockData.value.filter((d) => {
    if (f.keyword && !d.position.includes(f.keyword) && !d.code.includes(f.keyword)) return false
    if (f.department && d.department !== f.department) return false
    if (f.status && d.status !== f.status) return false
    return true
  })
})

const handleFilterChange = (f) => { filters.value = f }
const handleReset = () => { filters.value = { keyword: '', department: '', status: '' } }
</script>