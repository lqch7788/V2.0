<!--
  风险筛选组件
  对标 V1.1 src/components/labor/risk/RiskFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-select v-model="level" placeholder="风险等级" clearable class="!w-32">
      <el-option label="高" value="high" />
      <el-option label="中" value="medium" />
      <el-option label="低" value="low" />
    </el-select>
    <el-select v-model="type" placeholder="事件类型" clearable class="!w-32">
      <el-option label="考勤异常" value="attendance" />
      <el-option label="安全事故" value="safety" />
      <el-option label="离职风险" value="turnover" />
      <el-option label="绩效异常" value="performance" />
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

const level = ref('')
const type = ref('')
const dateRange = ref([])

const handleReset = () => {
  level.value = ''
  type.value = ''
  dateRange.value = []
  emitChange()
}

const emitChange = () => {
  emit('change', { level: level.value, type: type.value, dateRange: dateRange.value })
}
</script>