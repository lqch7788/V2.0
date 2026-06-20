<!--
  工人考勤筛选组件
  对标 V1.1 src/components/labor/attendance/WorkerAttendanceFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索工号/姓名" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="department" placeholder="部门" clearable class="!w-32">
      <el-option label="生产部" value="生产部" />
      <el-option label="技术部" value="技术部" />
      <el-option label="后勤部" value="后勤部" />
    </el-select>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="正常" value="normal" />
      <el-option label="迟到" value="late" />
      <el-option label="早退" value="early" />
      <el-option label="缺勤" value="absent" />
    </el-select>
    <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" class="!w-40" />
    <el-button type="primary" @click="$emit('change', { keyword, department, status, date })">
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
const department = ref('')
const status = ref('')
const date = ref('')

const handleReset = () => {
  keyword.value = ''
  department.value = ''
  status.value = ''
  date.value = ''
  emit('reset')
}
</script>