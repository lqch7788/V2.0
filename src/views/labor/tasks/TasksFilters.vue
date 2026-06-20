<!--
  任务筛选组件
  对标 V1.1 src/components/labor/tasks/TasksFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索任务/编号" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="待执行" value="pending" />
      <el-option label="执行中" value="executing" />
      <el-option label="已完成" value="completed" />
    </el-select>
    <el-select v-model="priority" placeholder="优先级" clearable class="!w-32">
      <el-option label="加急" value="urgent" />
      <el-option label="高" value="high" />
      <el-option label="普通" value="normal" />
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
const status = ref('')
const priority = ref('')

const handleReset = () => {
  keyword.value = ''
  status.value = ''
  priority.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, status: status.value, priority: priority.value })
}
</script>