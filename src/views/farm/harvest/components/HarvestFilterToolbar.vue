<!--
  采收筛选工具栏
  对标 V1.1 src/components/farm/harvest/components/HarvestFilterToolbar.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索批次/品种" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
      start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="!w-72" />
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="已完成" value="completed" />
      <el-option label="已入库" value="stored" />
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
const dateRange = ref([])
const status = ref('')

const handleReset = () => {
  keyword.value = ''
  dateRange.value = []
  status.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, dateRange: dateRange.value, status: status.value })
}
</script>