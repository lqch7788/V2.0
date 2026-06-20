<!--
  临时工筛选组件
  对标 V1.1 src/components/labor/tempWorker/TempWorkerFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索编号/姓名" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="source" placeholder="来源" clearable class="!w-32">
      <el-option label="中介" value="中介" />
      <el-option label="内部" value="内部" />
      <el-option label="自主" value="自主" />
    </el-select>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="可用" value="active" />
      <el-option label="工作中" value="busy" />
      <el-option label="已离开" value="left" />
    </el-select>
    <el-button type="primary" @click="$emit('change', { keyword: keyword.value, source: source.value, status: status.value })">
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
const source = ref('')
const status = ref('')

const handleReset = () => {
  keyword.value = ''
  source.value = ''
  status.value = ''
  emit('reset')
}
</script>