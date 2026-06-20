<!--
  招聘筛选组件
  对标 V1.1 src/components/labor/recruitment/RecruitmentFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索岗位/部门" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="招聘中" value="open" />
      <el-option label="已关闭" value="closed" />
      <el-option label="已招满" value="filled" />
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

const handleReset = () => {
  keyword.value = ''
  status.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, status: status.value })
}
</script>