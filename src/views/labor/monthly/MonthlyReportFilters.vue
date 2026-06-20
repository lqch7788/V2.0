<!--
  月报筛选组件
  对标 V1.1 src/components/labor/monthly/MonthlyReportFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-date-picker v-model="month" type="month" value-format="YYYY-MM" placeholder="选择月份" class="!w-40" />
    <el-select v-model="department" placeholder="部门" clearable class="!w-32">
      <el-option label="生产部" value="生产部" />
      <el-option label="技术部" value="技术部" />
      <el-option label="后勤部" value="后勤部" />
    </el-select>
    <el-input v-model="keyword" placeholder="员工姓名" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-button type="primary" @click="emitChange">
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

const emit = defineEmits(['change'])

const month = ref('')
const department = ref('')
const keyword = ref('')

const handleReset = () => {
  month.value = ''
  department.value = ''
  keyword.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { month: month.value, department: department.value, keyword: keyword.value })
}
</script>