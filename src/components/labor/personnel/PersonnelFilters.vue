<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- 搜索 -->
      <div class="flex-1 relative">
        <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20"><Search /></el-icon>
        <el-input
          v-model="searchValue"
          type="text"
          placeholder="搜索姓名或工号..."
          @input="onSearchChange(searchValue)"
          class="pl-10"
        />
      </div>

      <!-- 部门筛选 -->
      <el-select
        :model-value="departmentFilter"
        @change="onDepartmentChange"
        placeholder="选择部门"
        class="min-w-[140px]"
      >
        <el-option
          v-for="dept in departments"
          :key="dept"
          :label="dept"
          :value="dept"
        />
      </el-select>

      <!-- 状态筛选 -->
      <el-select
        :model-value="statusFilter"
        @change="onStatusChange"
        placeholder="全部状态"
        class="min-w-[120px]"
      >
        <el-option label="全部状态" value="全部" />
        <el-option label="在职" value="在职" />
        <el-option label="离职" value="离职" />
        <el-option label="退休" value="退休" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({})

const searchValue = ref(props.searchTerm)

watch(() => props.searchTerm, (val) => {
  searchValue.value = val
})
</script>
