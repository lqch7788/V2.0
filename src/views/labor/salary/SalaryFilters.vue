<!--
  工资筛选组件
  对标 V1.1 src/components/labor/salary/SalaryFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-date-picker v-model="month" type="month" value-format="YYYY-MM" placeholder="选择月份" class="!w-40" />
    <el-select v-model="department" placeholder="部门" clearable class="!w-32">
      <el-option label="生产部" value="生产部" />
      <el-option label="技术部" value="技术部" />
      <el-option label="后勤部" value="后勤部" />
    </el-select>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="草稿" value="draft" />
      <el-option label="已审核" value="approved" />
      <el-option label="已发放" value="paid" />
    </el-select>
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
const status = ref('')

const handleReset = () => {
  month.value = ''
  department.value = ''
  status.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { month: month.value, department: department.value, status: status.value })
}
</script>