<!--
  员工筛选组件
  对标 V1.1 src/components/labor/personnel/PersonnelFilters.tsx
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
      <el-option label="财务部" value="财务部" />
    </el-select>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="在职" value="active" />
      <el-option label="休假" value="leave" />
      <el-option label="离职" value="resigned" />
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

const keyword = ref('')
const department = ref('')
const status = ref('')

const handleReset = () => {
  keyword.value = ''
  department.value = ''
  status.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, department: department.value, status: status.value })
}
</script>