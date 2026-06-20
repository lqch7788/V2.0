<!--
  请假筛选组件
  对标 V1.1 src/components/labor/leave/LeaveFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索单号/申请人" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="type" placeholder="类型" clearable class="!w-32">
      <el-option label="事假" value="personal" />
      <el-option label="病假" value="sick" />
      <el-option label="年假" value="annual" />
      <el-option label="婚假" value="marriage" />
      <el-option label="产假" value="maternity" />
      <el-option label="丧假" value="bereavement" />
    </el-select>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="待审批" value="pending" />
      <el-option label="已通过" value="approved" />
      <el-option label="已拒绝" value="rejected" />
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
const type = ref('')
const status = ref('')
const dateRange = ref([])

const handleReset = () => {
  keyword.value = ''
  type.value = ''
  status.value = ''
  dateRange.value = []
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, type: type.value, status: status.value, dateRange: dateRange.value })
}
</script>