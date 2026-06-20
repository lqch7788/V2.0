<!--
  员工管理页面
  对标 V1.1 src/components/labor/personnel/PersonnelManagementPage.tsx
-->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
      <h1 class="text-xl font-bold">员工管理</h1>
      <div class="flex items-center gap-2">
        <PersonnelFilters @change="handleFilter" />
        <el-button type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>新增员工
        </el-button>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4">
      <PersonnelTable :data="data" @view="$emit('view', $event)" @edit="$emit('edit', $event)" />
    </div>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import PersonnelFilters from './PersonnelFilters.vue'
import PersonnelTable from './PersonnelTable.vue'

defineProps({
  data: { type: Array, default: () => [] },
})

defineEmits(['add', 'view', 'edit', 'filter'])

const handleFilter = (f) => console.log('filter', f)
</script>