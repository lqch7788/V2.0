<!--
  绩效考核筛选（V1.1 1:1）
  对标 V1.1 src/components/labor/performance/PerformanceFilters.tsx
  列：月份/部门/姓名/工号
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 flex-wrap">
    <el-select v-model="month" placeholder="全部月份" clearable class="!w-40">
      <el-option label="全部月份" value="" />
      <el-option label="2024-04" value="2024-04" />
      <el-option label="2024-03" value="2024-03" />
      <el-option label="2024-02" value="2024-02" />
      <el-option label="2024-01" value="2024-01" />
    </el-select>
    <el-select v-model="department" placeholder="部门" clearable class="!w-32">
      <el-option label="全部" value="" />
      <el-option label="生产部" value="生产部" />
      <el-option label="技术部" value="技术部" />
      <el-option label="后勤部" value="后勤部" />
      <el-option label="财务部" value="财务部" />
    </el-select>
    <el-input v-model="name" placeholder="姓名/工号搜索" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-button @click="$emit('reset')">
      <el-icon><RefreshLeft /></el-icon>重置
    </el-button>
    <el-button type="primary" @click="$emit('change', { month: month.value, department: department.value, name: name.value })">
      <el-icon><Search /></el-icon>查询
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RefreshLeft, Search } from '@element-plus/icons-vue'

defineEmits(['change', 'reset'])

const month = ref('')
const department = ref('')
const name = ref('')
</script>