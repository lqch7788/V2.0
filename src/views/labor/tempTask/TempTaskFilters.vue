<!--
  临时任务筛选组件
  对标 V1.1 src/components/labor/tempTask/TempTaskFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索编号/标题" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="待审批" value="pending" />
      <el-option label="已通过" value="approved" />
      <el-option label="执行中" value="executing" />
      <el-option label="已完成" value="completed" />
    </el-select>
    <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
      start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="!w-72" />
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
const status = ref('')
const dateRange = ref([])

const handleReset = () => {
  keyword.value = ''
  status.value = ''
  dateRange.value = []
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, status: status.value, dateRange: dateRange.value })
}
</script>