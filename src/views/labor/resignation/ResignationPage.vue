<!--
  离职申请页面（V1.1 风格）
  对标 V1.1 src/components/labor/resignation/ResignationPage.tsx
-->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">离职申请列表</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>离职申请
        </el-button>
      </div>
      <ResignationTable :data="applications" />
    </div>
    <ResignationCreateModal v-model="showForm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ResignationTable from './ResignationTable.vue'
import ResignationCreateModal from './modals/CreateModal.vue'

const showForm = ref(false)

const applications = ref([
  { code: 'RS001', applicantName: '员工X', department: '生产部', position: '生产工', applyDate: '2024-03-10', lastDay: '2024-04-10', type: 'personal', status: 'pending' },
  { code: 'RS002', applicantName: '员工Y', department: '技术部', position: '技术员', applyDate: '2024-03-15', lastDay: '2024-04-15', type: 'mutual', status: 'approved' },
])
</script>