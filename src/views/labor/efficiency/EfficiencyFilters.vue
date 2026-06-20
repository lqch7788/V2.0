<!--
  人效筛选组件
  对标 V1.1 src/components/labor/efficiency/EfficiencyFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索部门/月份" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-date-picker v-model="dateRange" type="monthrange" range-separator="至"
      start-placeholder="开始月份" end-placeholder="结束月份" value-format="YYYY-MM" class="!w-72" />
    <el-select v-model="department" placeholder="部门" clearable class="!w-32">
      <el-option label="生产部" value="生产部" />
      <el-option label="技术部" value="技术部" />
      <el-option label="后勤部" value="后勤部" />
    </el-select>
    <el-button type="primary" @click="$emit('change', { keyword: keyword.value, dateRange: dateRange.value, department: department.value })">
      <el-icon><Search /></el-icon>查询
    </el-button>
    <el-button @click="handleReset">
      <el-icon><RefreshLeft /></el-icon>重置
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RefreshLeft, Search } from '@element-plus/icons-vue'

const emit = defineEmits(['change', 'reset'])

const keyword = ref('')
const dateRange = ref([])
const department = ref('')

const handleReset = () => {
  keyword.value = ''
  dateRange.value = []
  department.value = ''
  emit('reset')
}
</script>